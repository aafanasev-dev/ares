import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { OBJECTS, OBJECT_GROUPS } from './geography.js';
import {
  LAYERS,
  buildBeltGradient,
  buildRegionColors,
  buildZoneIds,
  classify,
  normalizeLon,
  pointClimate,
  zoneFor,
  zoneIndex,
} from './climate.js';

const MARS_RADIUS_M = 3389500;
const HIST_BIN_M = 10;
const ZONE_STEP = 2; // zone texture resolution = elevation grid / ZONE_STEP
const BELT_GRADIENT_ROWS = 1024;
const COLOR_MODES = { altitude: 0, belts: 1, regions: 2 }; // uColorMode per layer
const REGION_COLOR_SCALE = 2; // region colour grids at 1/2 of the zone texture resolution
const MINOR_LABEL_DISTANCE = 2.3; // camera distance below which rank-2 labels are shown
const CLICK_SLOP_PX = 5;

const $ = (id) => document.getElementById(id);
const ui = {
  canvas: $('globe'),
  loading: $('loading'),
  loadingText: $('loading-text'),
  loadingBar: $('loading-bar'),
  level: $('level'),
  levelNum: $('level-num'),
  flooded: $('flooded'),
  presets: document.querySelectorAll('[data-level]'),
  exag: $('exag'),
  exagValue: $('exag-value'),
  rotate: $('rotate'),
  hover: $('hover'),
  layer: $('layer'),
  opacity: $('opacity'),
  opacityValue: $('opacity-value'),
  landmarks: $('landmarks'),
  legend: $('legend'),
  info: $('info'),
  infoBody: $('info-body'),
  infoClose: $('info-close'),
};

// ---------------------------------------------------------------------------
// Shaders
// Texture coordinates: s = east longitude / 360, t = 0 at 90°N. three.js sphere
// UVs have u increasing eastward from -X and v = 1 at the north pole.

const vertexShader = /* glsl */ `
  uniform sampler2D uElev;
  uniform float uSeaLevel;
  uniform float uExaggeration;

  varying vec2 vTex;
  varying vec3 vWorldPos;
  varying vec3 vUp;

  const float MARS_RADIUS = ${MARS_RADIUS_M.toFixed(1)};

  void main() {
    vTex = vec2(uv.x, 1.0 - uv.y);
    float elev = texture2D(uElev, vTex).r;
    // Water is a flat surface at sea level; terrain above it sticks out.
    float surface = max(elev, uSeaLevel);
    vec3 displaced = position * (1.0 + surface / MARS_RADIUS * uExaggeration);
    vec4 world = modelMatrix * vec4(displaced, 1.0);
    vWorldPos = world.xyz;
    vUp = normalize(mat3(modelMatrix) * position);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uElev;
  uniform vec2 uTexel;
  uniform float uSeaLevel;
  uniform float uExaggeration;
  uniform vec3 uSunDir;

  uniform sampler2D uZoneId;
  uniform vec2 uZoneTexel;
  uniform sampler2D uPalette;
  uniform float uOverlayOpacity;
  uniform float uSelectedId;
  uniform sampler2D uBeltGradient;
  uniform float uColorMode;
  uniform sampler2D uRegionLand;
  uniform sampler2D uRegionWater;

  varying vec2 vTex;
  varying vec3 vWorldPos;
  varying vec3 vUp;

  const float PI = 3.141592653589793;
  const float MARS_RADIUS = ${MARS_RADIUS_M.toFixed(1)};

  vec3 landColor(float e) {
    vec3 c = vec3(0.22, 0.09, 0.05);
    c = mix(c, vec3(0.45, 0.19, 0.10), smoothstep(-8000.0, -4000.0, e));
    c = mix(c, vec3(0.63, 0.32, 0.18), smoothstep(-4000.0, 0.0, e));
    c = mix(c, vec3(0.75, 0.46, 0.27), smoothstep(0.0, 3000.0, e));
    c = mix(c, vec3(0.84, 0.63, 0.42), smoothstep(3000.0, 8000.0, e));
    c = mix(c, vec3(0.91, 0.80, 0.64), smoothstep(8000.0, 14000.0, e));
    c = mix(c, vec3(0.97, 0.94, 0.88), smoothstep(14000.0, 21000.0, e));
    return c;
  }

  float zoneAt(vec2 t) {
    return floor(texture2D(uZoneId, t).r * 255.0 + 0.5);
  }

  void main() {
    float elev = texture2D(uElev, vTex).r;

    // Local east/north/up frame on the sphere.
    vec3 up = normalize(vUp);
    vec3 east = normalize(cross(vec3(0.0, 1.0, 0.0), up) + vec3(1e-6, 0.0, 0.0));
    vec3 north = cross(up, east);

    // Terrain normal from finite differences. The step grows with the screen
    // footprint so shading stays visible when zoomed out (coarser mip levels).
    vec2 stepTex = uTexel * max(vec2(1.0), fwidth(vTex) / uTexel);
    float eE = texture2D(uElev, vTex + vec2(stepTex.x, 0.0)).r;
    float eW = texture2D(uElev, vTex - vec2(stepTex.x, 0.0)).r;
    float eN = texture2D(uElev, vTex - vec2(0.0, stepTex.y)).r;
    float eS = texture2D(uElev, vTex + vec2(0.0, stepTex.y)).r;
    float lat = (0.5 - vTex.y) * PI;
    float distEast = 2.0 * PI * MARS_RADIUS * max(cos(lat), 0.05) * stepTex.x;
    float distNorth = PI * MARS_RADIUS * stepTex.y;
    float relief = 1.0 + uExaggeration;
    float slopeE = (eE - eW) / (2.0 * distEast) * relief;
    float slopeN = (eN - eS) / (2.0 * distNorth) * relief;
    vec3 terrainN = normalize(up - slopeE * east - slopeN * north);

    vec3 L = normalize(uSunDir);
    vec3 V = normalize(cameraPosition - vWorldPos);

    float landDiffuse = max(dot(terrainN, L), 0.0);
    vec3 land = landColor(elev) * (0.18 + 0.82 * landDiffuse);

    float depth = uSeaLevel - elev;
    vec3 water = mix(vec3(0.31, 0.64, 0.85), vec3(0.04, 0.18, 0.35), sqrt(clamp(depth / 3000.0, 0.0, 1.0)));
    water = mix(water, vec3(0.62, 0.84, 0.95), 0.5 * (1.0 - smoothstep(0.0, 30.0, depth)));
    float waterDiffuse = max(dot(normalize(mix(up, terrainN, 0.15)), L), 0.0);
    float spec = pow(max(dot(up, normalize(L + V)), 0.0), 60.0) * 0.35;
    water = water * (0.25 + 0.75 * waterDiffuse) + vec3(spec);

    // Anti-aliased coastline.
    float fw = max(fwidth(depth), 1.0);
    float wet = smoothstep(-fw, fw, depth);
    vec3 color = mix(land, water, wet);

    // Zone overlay. Belts take their colour from a latitude gradient with soft borders; the other
    // layers use one palette colour per zone id, outlined where the id changes. Neighbour samples are
    // one screen pixel apart (at least one texel) so outlines stay thin.
    vec2 px = max(uZoneTexel, fwidth(vTex));
    float id = zoneAt(vTex);
    float edge = step(0.5,
      abs(zoneAt(vTex + vec2(px.x, 0.0)) - id) + abs(zoneAt(vTex - vec2(px.x, 0.0)) - id) +
      abs(zoneAt(vTex + vec2(0.0, px.y)) - id) + abs(zoneAt(vTex - vec2(0.0, px.y)) - id));
    // Colour source per layer (uColorMode): 0 = palette per id, 1 = belt gradient, 2 = smooth region
    // colours. Regions come as premultiplied land and water grids picked by the coastline mask, so they
    // blend between regions but stay sharp at the coast. Selection never changes colours.
    float beltMode = 1.0 - step(0.5, abs(uColorMode - 1.0));
    float regionMode = step(1.5, uColorMode);
    vec3 paletteColor = texture2D(uPalette, vec2((id + 0.5) / 256.0, 0.5)).rgb;
    vec3 zoneColor = mix(paletteColor, texture2D(uBeltGradient, vec2(0.5, vTex.y)).rgb, beltMode);
    vec4 region = mix(texture2D(uRegionLand, vTex), texture2D(uRegionWater, vTex), wet);
    float visible = step(0.001, uOverlayOpacity);
    float hasZone = step(0.5, id) * visible;
    float selected = step(0.5, uSelectedId) * (1.0 - step(0.5, abs(id - uSelectedId)));
    float shade = 0.3 + 0.7 * mix(landDiffuse, waterDiffuse, wet);
    float alpha = min(uOverlayOpacity, 0.92);
    vec3 flatColor = mix(color, zoneColor * shade, alpha * hasZone);
    vec3 smoothColor = color * (1.0 - region.a * alpha) + region.rgb * shade * alpha;
    color = mix(flatColor, smoothColor, regionMode * visible);
    float outline = edge * hasZone * (1.0 - selected) * (1.0 - beltMode) * (1.0 - regionMode);
    color = mix(color, zoneColor * 0.3, outline * clamp(0.35 + uOverlayOpacity, 0.0, 0.95));

    // Dashed white outline around the selected zone: a checkerboard in map space (longitude scaled by
    // cos(lat) so dashes keep their length near the poles). Cells are ~6 px, snapped to a power of two
    // so the dashes stay attached to the map while it rotates.
    float latDeg = 90.0 - vTex.y * 180.0;
    float lonDeg = vTex.x * 360.0 * max(cos(radians(latDeg)), 0.05);
    float cell = pow(2.0, ceil(log2(max(fwidth(vTex.y) * 180.0 * 6.0, 1e-4))));
    float dash = mod(floor(lonDeg / cell) + floor(latDeg / cell), 2.0);
    color = mix(color, vec3(1.0), edge * selected * hasZone * dash * 0.95);

    // Thin dusty atmosphere at the limb.
    float rim = pow(1.0 - max(dot(up, V), 0.0), 3.0);
    color += vec3(0.8, 0.45, 0.3) * rim * 0.25;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Data loading

async function fetchWithProgress(url, onProgress) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const total = Number(res.headers.get('Content-Length')) || 0;
  if (!res.body || !total) return res.arrayBuffer();

  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(Math.min(received / total, 1));
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes.buffer;
}

async function loadElevation() {
  const metaRes = await fetch('data/elevation.json');
  if (!metaRes.ok) throw new Error(`data/elevation.json: HTTP ${metaRes.status}`);
  const meta = await metaRes.json();
  const buffer = await fetchWithProgress('data/elevation.bin', (f) => {
    ui.loadingBar.style.width = `${(f * 100).toFixed(1)}%`;
  });
  if (buffer.byteLength !== meta.width * meta.height * 2) {
    throw new Error(`data/elevation.bin has ${buffer.byteLength} bytes, expected ${meta.width * meta.height * 2}`);
  }
  // Little-endian on disk; every browser platform is little-endian.
  return { ...meta, elev: new Int16Array(buffer) };
}

function elevationAt({ elev, width, height }, lon, lat) {
  const col = Math.min(width - 1, Math.floor((normalizeLon(lon) / 360) * width));
  const row = THREE.MathUtils.clamp(Math.floor(((90 - lat) / 180) * height), 0, height - 1);
  return elev[row * width + col];
}

// Returns level -> fraction of the planet's surface area strictly below it.
function buildFloodCurve({ elev, width, height, min, max }) {
  const bins = Math.ceil((max - min) / HIST_BIN_M) + 1;
  const hist = new Float64Array(bins);
  let totalArea = 0;
  for (let row = 0; row < height; row++) {
    const lat = ((90 - ((row + 0.5) * 180) / height) * Math.PI) / 180;
    const weight = Math.cos(lat);
    totalArea += weight * width;
    const offset = row * width;
    for (let col = 0; col < width; col++) {
      hist[Math.floor((elev[offset + col] - min) / HIST_BIN_M)] += weight;
    }
  }
  const cumulative = new Float64Array(bins + 1);
  for (let i = 0; i < bins; i++) cumulative[i + 1] = cumulative[i] + hist[i] / totalArea;

  return (level) => {
    const i = Math.floor((level - min) / HIST_BIN_M);
    return i <= 0 ? 0 : i >= bins ? 1 : cumulative[i];
  };
}

// Half-float texture with a CPU-built mip chain (generateMipmap on R16F is not
// supported everywhere).
function createElevationTexture({ elev, width, height }, renderer) {
  const toHalf = THREE.DataUtils.toHalfFloat;
  let src = Float32Array.from(elev);
  let w = width;
  let h = height;
  const mipmaps = [];
  for (;;) {
    const half = new Uint16Array(src.length);
    for (let i = 0; i < src.length; i++) half[i] = toHalf(src[i]);
    mipmaps.push({ data: half, width: w, height: h });
    if (w === 1 && h === 1) break;

    const nw = Math.max(1, w >> 1);
    const nh = Math.max(1, h >> 1);
    const dst = new Float32Array(nw * nh);
    for (let y = 0; y < nh; y++) {
      const y0 = Math.min(y * 2, h - 1) * w;
      const y1 = Math.min(y * 2 + 1, h - 1) * w;
      for (let x = 0; x < nw; x++) {
        const x0 = Math.min(x * 2, w - 1);
        const x1 = Math.min(x * 2 + 1, w - 1);
        dst[y * nw + x] = (src[y0 + x0] + src[y0 + x1] + src[y1 + x0] + src[y1 + x1]) / 4;
      }
    }
    src = dst;
    w = nw;
    h = nh;
  }

  const tex = new THREE.DataTexture(mipmaps[0].data, width, height, THREE.RedFormat, THREE.HalfFloatType);
  tex.mipmaps = mipmaps;
  tex.generateMipmaps = false;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate = true;
  return tex;
}

// Zone ids are looked up exactly, so no filtering or mipmaps.
function createZoneTextures(data) {
  const w = Math.floor(data.width / ZONE_STEP);
  const h = Math.floor(data.height / ZONE_STEP);
  const ids = new THREE.DataTexture(new Uint8Array(w * h), w, h, THREE.RedFormat, THREE.UnsignedByteType);
  const palette = new THREE.DataTexture(new Uint8Array(256 * 4), 256, 1, THREE.RGBAFormat, THREE.UnsignedByteType);
  for (const tex of [ids, palette]) {
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.unpackAlignment = 1;
    tex.needsUpdate = true;
  }
  ids.wrapS = THREE.RepeatWrapping;
  ids.wrapT = THREE.ClampToEdgeWrapping;

  // Belt colours never change, so the gradient is built once. Linear filtering keeps it smooth.
  const gradient = new THREE.DataTexture(
    buildBeltGradient(BELT_GRADIENT_ROWS),
    1,
    BELT_GRADIENT_ROWS,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  );
  gradient.magFilter = THREE.LinearFilter;
  gradient.minFilter = THREE.LinearFilter;
  gradient.generateMipmaps = false;
  gradient.wrapS = THREE.ClampToEdgeWrapping;
  gradient.wrapT = THREE.ClampToEdgeWrapping;
  gradient.needsUpdate = true;

  // Smooth region colours (premultiplied RGBA), one grid per surface class; filled by rebuildOverlay.
  const rw = Math.floor(w / REGION_COLOR_SCALE);
  const rh = Math.floor(h / REGION_COLOR_SCALE);
  const [regionLand, regionWater] = [0, 1].map(() => {
    const tex = new THREE.DataTexture(new Uint8Array(rw * rh * 4), rw, rh, THREE.RGBAFormat, THREE.UnsignedByteType);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  });

  return { ids, palette, gradient, regionLand, regionWater, texel: new THREE.Vector2(1 / w, 1 / h) };
}

// ---------------------------------------------------------------------------
// Scene

function lonLatToVector(lonDeg, latDeg, radius = 1) {
  const lon = THREE.MathUtils.degToRad(lonDeg);
  const lat = THREE.MathUtils.degToRad(latDeg);
  return new THREE.Vector3(-Math.cos(lon) * Math.cos(lat), Math.sin(lat), Math.sin(lon) * Math.cos(lat)).multiplyScalar(
    radius,
  );
}

function createStars(count = 3000, radius = 80) {
  const positions = new Float32Array(count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    v.randomDirection().multiplyScalar(radius).toArray(positions, i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.3,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.75,
  });
  return new THREE.Points(geometry, material);
}

// ---------------------------------------------------------------------------
// Formatting

function formatMeters(m) {
  return `${Math.round(m).toLocaleString('en-US')} m`;
}

function fmt(n, digits = 0) {
  const v = Number(n.toFixed(digits)) || 0; // also turns -0 into 0
  const text = v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return text.replace('-', '−');
}

function fmtRange([a, b], unit = '', digits = 0) {
  const lo = fmt(a, digits);
  const hi = fmt(b, digits);
  const sep = a < 0 || b < 0 ? ' to ' : '–';
  return `${lo === hi ? lo : `${lo}${sep}${hi}`}${unit}`;
}

const fmtLat = (lat) => `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}`;
const fmtLon = (lon) => `${normalizeLon(lon).toFixed(1)}°E`;
const fmtKm = (m) => `${fmt(m / 1000, 1)} km`;

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

function chip(zone) {
  return zone ? `<span class="chip"><i style="background:${zone.color}"></i>${esc(zone.name)}</span>` : '';
}

function infoHtml(object, c, w) {
  const title = object?.name ?? c.region?.name ?? (c.isWater ? 'Open ocean' : 'Land');
  const kicker = object ? OBJECT_GROUPS[object.group] : c.isWater ? 'Sea' : 'Land';
  const surface = c.isWater ? `${formatMeters(c.depth)} deep` : `${formatMeters(c.altitude)} above sea level`;

  const rows = [
    ['Annual mean', fmtRange(w.tempMean, ' °C')],
    ['Summer / winter', `${fmt(w.tempSummer)} / ${fmt(w.tempWinter)} °C`],
    ['Daily range', `${fmt(w.diurnal)} K`],
    ['Precipitation', fmtRange(w.precip, ' mm/yr'), w.precipNote],
    w.rainDays && ['Rain days', fmtRange(w.rainDays, ' per year')],
    ['Humidity', fmtRange(w.rh, '% RH'), w.rhNote],
    ['Precipitable water', fmtRange(w.pw, ' mm')],
    ['Surface wind', w.wind],
    ['Air pressure', `${fmt(w.pressureHpa / 1000, 2)} bar`],
    ['Seasons', w.seasonality, w.driver],
    c.isWater
      ? ['Pressure at the bottom', `${fmt(w.floorPressureBar)} bar`]
      : ['Treeline / snowline', `${fmtKm(w.treeline)} / ${fmtKm(w.snowline)}`, 'At this latitude'],
  ];
  const notes = [...w.notes];
  if (!c.isWater && w.tempMean[1] < 0) notes.unshift('Annual mean below freezing');

  const sections = [];
  if (c.region) {
    const heading = c.region.name === title ? 'About this region' : c.region.name;
    const flora = c.region.flora ? `<p><strong>Vegetation:</strong> ${esc(c.region.flora)}</p>` : '';
    sections.push(`<h3>${esc(heading)}</h3><p>${esc(c.region.description)}</p>${flora}`);
  }
  sections.push(`<h3>Climate belt: ${esc(c.latZone.name)}</h3><p>${esc(c.latZone.description)}</p>`);
  if (c.vertZone) sections.push(`<h3>Altitude zone: ${esc(c.vertZone.name)}</h3><p>${esc(c.vertZone.description)}</p>`);

  return `
    <p class="kicker">${esc(kicker)}</p>
    <h2>${esc(title)}</h2>
    <p class="coords">${fmtLat(c.lat)} ${fmtLon(c.lon)} · ${surface}</p>
    <div class="chips">${chip(c.latZone)}${chip(c.vertZone)}${chip(c.region)}</div>
    ${
      object
        ? `<p class="object-notes">${esc(object.notes)} · gazetteer elevation ${esc(object.elevation)}</p>
           <p>${esc(object.description)}</p>`
        : ''
    }
    <h3>Weather</h3>
    <dl class="weather">
      ${rows
        .filter(Boolean)
        .map(([k, v, note]) => `<dt>${esc(k)}</dt><dd>${esc(v)}${note ? `<small>${esc(note)}</small>` : ''}</dd>`)
        .join('')}
    </dl>
    ${notes.length ? `<ul class="notes">${notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
    ${sections.join('')}
  `;
}

// ---------------------------------------------------------------------------

async function main() {
  const renderer = new THREE.WebGLRenderer({ canvas: ui.canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.id = 'labels';
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  ui.canvas.after(labelRenderer.domElement);

  const scene = new THREE.Scene();
  scene.add(createStars());

  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 200);
  camera.position.copy(lonLatToVector(250, 15, 3.4)); // Tharsis and Valles Marineris

  const controls = new OrbitControls(camera, ui.canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 1.2;
  controls.maxDistance = 8;
  controls.autoRotateSpeed = 0.5;

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  let data;
  try {
    data = await loadElevation();
  } catch (err) {
    console.error(err);
    ui.loadingText.textContent =
      `Could not load elevation data (${err.message}).\n\n` +
      'Run "python3 tools/prepare_data.py", then serve this folder with ' +
      '"python3 -m http.server" and open http://localhost:8000.';
    return;
  }

  const floodedFraction = buildFloodCurve(data);
  const sunDir = new THREE.Vector3();
  const zoneTextures = createZoneTextures(data);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uElev: { value: createElevationTexture(data, renderer) },
      uTexel: { value: new THREE.Vector2(1 / data.width, 1 / data.height) },
      uSeaLevel: { value: 0 },
      uExaggeration: { value: Number(ui.exag.value) },
      uSunDir: { value: sunDir },
      uZoneId: { value: zoneTextures.ids },
      uZoneTexel: { value: zoneTextures.texel },
      uPalette: { value: zoneTextures.palette },
      uOverlayOpacity: { value: 0 },
      uSelectedId: { value: 0 },
      uBeltGradient: { value: zoneTextures.gradient },
      uColorMode: { value: 0 },
      uRegionLand: { value: zoneTextures.regionLand },
      uRegionWater: { value: zoneTextures.regionWater },
    },
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1, 512, 256), material));

  // --- State --------------------------------------------------------------
  let seaLevel = 0;
  let layer = ui.layer.value;
  let selection = null; // {lon, lat, object}
  let legendHighlight = 0; // zone index picked in the legend, 0 = none

  // --- Zone overlay -------------------------------------------------------
  let overlayTimer = 0;
  function rebuildOverlay() {
    clearTimeout(overlayTimer);
    const zones = buildZoneIds(data, seaLevel, layer, ZONE_STEP);
    zoneTextures.ids.image.data.set(zones.ids);
    zoneTextures.ids.needsUpdate = true;
    if (layer === 'regions') {
      const { land, water } = buildRegionColors(zones, data, seaLevel, ZONE_STEP, REGION_COLOR_SCALE);
      zoneTextures.regionLand.image.data.set(land);
      zoneTextures.regionWater.image.data.set(water);
      zoneTextures.regionLand.needsUpdate = true;
      zoneTextures.regionWater.needsUpdate = true;
    }
  }
  function scheduleOverlay() {
    clearTimeout(overlayTimer);
    overlayTimer = setTimeout(rebuildOverlay, 200);
  }

  function applyLayer() {
    layer = ui.layer.value;
    legendHighlight = 0;
    material.uniforms.uColorMode.value = COLOR_MODES[layer] ?? 0;
    const zones = LAYERS[layer]?.zones ?? [];
    const pal = zoneTextures.palette.image.data;
    pal.fill(0);
    const c = new THREE.Color();
    zones.forEach((zone, i) => {
      c.set(zone.color);
      pal.set([c.r * 255, c.g * 255, c.b * 255, 255], (i + 1) * 4);
    });
    zoneTextures.palette.needsUpdate = true;
    applyOpacity();

    ui.legend.hidden = zones.length === 0;
    ui.legend.innerHTML = zones
      .map(
        (zone, i) =>
          `<button type="button" class="legend-item" data-index="${i + 1}">` +
          `<i style="background:${zone.color}"></i>${esc(zone.name)}</button>`,
      )
      .join('');
    rebuildOverlay();
    updateHighlight();
  }

  function applyOpacity() {
    const opacity = Number(ui.opacity.value);
    ui.opacityValue.textContent = `${Math.round(opacity * 100)}%`;
    material.uniforms.uOverlayOpacity.value = LAYERS[layer] ? opacity : 0;
  }

  function updateHighlight() {
    let id = legendHighlight;
    if (!id && selection) {
      const { lon, lat } = selection;
      id = zoneIndex(layer, zoneFor(layer, classify(lon, lat, elevationAt(data, lon, lat), seaLevel)));
    }
    material.uniforms.uSelectedId.value = id;
    for (const item of ui.legend.children) item.classList.toggle('active', Number(item.dataset.index) === id);
  }

  ui.layer.addEventListener('change', applyLayer);
  ui.opacity.addEventListener('input', applyOpacity);
  ui.legend.addEventListener('click', (e) => {
    const item = e.target.closest('.legend-item');
    if (!item) return;
    const index = Number(item.dataset.index);
    legendHighlight = legendHighlight === index ? 0 : index;
    updateHighlight();
  });

  // --- Landmarks ----------------------------------------------------------
  const markers = OBJECTS.map((object) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `marker group-${object.group}${object.rank > 1 ? ' minor' : ''}`;
    el.setAttribute('aria-label', object.name);
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = object.name;
    el.append(label);
    el.addEventListener('click', () => select({ lon: object.lon, lat: object.lat, object }));
    const label3d = new CSS2DObject(el);
    scene.add(label3d);
    return { object, el, label3d, normal: lonLatToVector(object.lon, object.lat) };
  });

  function placeMarkers() {
    const exaggeration = Number(ui.exag.value);
    for (const m of markers) {
      const surface = Math.max(elevationAt(data, m.object.lon, m.object.lat), seaLevel);
      m.label3d.position.copy(m.normal).multiplyScalar(1 + (surface / MARS_RADIUS_M) * exaggeration);
    }
  }

  function updateMarkerVisibility() {
    const show = ui.landmarks.checked;
    for (const m of markers) {
      // Only markers on the near side of the globe (above the horizon seen from the camera).
      m.label3d.visible = show && m.normal.dot(camera.position) > 1.02;
    }
    labelRenderer.domElement.classList.toggle('zoomed', camera.position.length() < MINOR_LABEL_DISTANCE);
  }

  // --- Selection and info panel -------------------------------------------
  function renderInfo() {
    ui.info.hidden = !selection;
    for (const m of markers) m.el.classList.toggle('selected', m.object === selection?.object);
    if (!selection) return;
    const { lon, lat, object } = selection;
    const c = classify(lon, lat, elevationAt(data, lon, lat), seaLevel);
    ui.infoBody.innerHTML = infoHtml(object, c, pointClimate(c));
  }

  function select(next) {
    selection = next;
    legendHighlight = 0;
    renderInfo();
    updateHighlight();
    if (next) ui.info.scrollTop = 0;
  }

  ui.infoClose.addEventListener('click', () => select(null));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') select(null);
  });

  // --- Controls -----------------------------------------------------------
  const levelMin = Math.floor(data.min / 100) * 100 - 100;
  const levelMax = Math.ceil(data.max / 100) * 100 + 100;
  for (const input of [ui.level, ui.levelNum]) {
    input.min = levelMin;
    input.max = levelMax;
  }

  function setLevel(value) {
    if (!Number.isFinite(value)) return;
    seaLevel = THREE.MathUtils.clamp(Math.round(value / 10) * 10, levelMin, levelMax);
    ui.level.value = seaLevel;
    ui.levelNum.value = seaLevel;
    material.uniforms.uSeaLevel.value = seaLevel;
    ui.flooded.textContent = `${(floodedFraction(seaLevel) * 100).toFixed(1)}%`;
    placeMarkers();
    renderInfo();
    scheduleOverlay();
  }

  ui.level.addEventListener('input', () => setLevel(Number(ui.level.value)));
  ui.levelNum.addEventListener('change', () => setLevel(Number(ui.levelNum.value)));
  for (const button of ui.presets) {
    const preset = button.dataset.level;
    const value = preset === 'min' ? levelMin : preset === 'max' ? levelMax : Number(preset);
    button.addEventListener('click', () => setLevel(value));
    button.disabled = false;
  }
  ui.exag.addEventListener('input', () => {
    material.uniforms.uExaggeration.value = Number(ui.exag.value);
    ui.exagValue.textContent = `${ui.exag.value}×`;
    placeMarkers();
  });
  ui.rotate.addEventListener('change', () => {
    controls.autoRotate = ui.rotate.checked;
  });
  ui.level.disabled = false;
  ui.levelNum.disabled = false;
  setLevel(Number(ui.level.value));
  applyLayer();

  // --- Picking: hover readout and click selection -------------------------
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const unitSphere = new THREE.Sphere(new THREE.Vector3(), 1);
  const hit = new THREE.Vector3();

  function pickAt(clientX, clientY) {
    const rect = ui.canvas.getBoundingClientRect();
    pointerNdc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointerNdc, camera);
    if (!raycaster.ray.intersectSphere(unitSphere, hit)) return null;
    return {
      lat: THREE.MathUtils.radToDeg(Math.asin(THREE.MathUtils.clamp(hit.y, -1, 1))),
      lon: normalizeLon(THREE.MathUtils.radToDeg(Math.atan2(hit.z, -hit.x))),
    };
  }

  let pointer = null;
  let pointerDown = null;
  ui.canvas.addEventListener('pointermove', (e) => {
    pointer = { x: e.clientX, y: e.clientY };
  });
  ui.canvas.addEventListener('pointerleave', () => {
    pointer = null;
  });
  ui.canvas.addEventListener('pointerdown', (e) => {
    pointerDown = { x: e.clientX, y: e.clientY };
  });
  ui.canvas.addEventListener('pointerup', (e) => {
    if (!pointerDown) return;
    const moved = Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y);
    pointerDown = null;
    if (moved > CLICK_SLOP_PX) return;
    const point = pickAt(e.clientX, e.clientY);
    select(point && { ...point, object: null });
  });

  function updateHover() {
    const point = pointer && pickAt(pointer.x, pointer.y);
    if (!point) {
      ui.hover.hidden = true;
      return;
    }
    const c = classify(point.lon, point.lat, elevationAt(data, point.lon, point.lat), seaLevel);
    const surface = c.isWater ? `${formatMeters(c.depth)} deep` : `${formatMeters(c.altitude)} above sea`;
    const zone = c.region?.name ?? c.latZone.name;
    ui.hover.textContent = `${fmtLat(c.lat)} ${fmtLon(c.lon)} · ${surface} · ${zone}`;
    ui.hover.hidden = false;
  }

  ui.loading.hidden = true;

  const cameraSunOffset = new THREE.Vector3(-0.6, 0.5, 1).normalize();
  renderer.setAnimationLoop(() => {
    const distance = camera.position.length();
    controls.rotateSpeed = THREE.MathUtils.clamp((distance - 1) * 0.4, 0.05, 1);
    controls.update();
    // Light comes from the upper left of the viewer, so the visible side is always lit.
    sunDir.copy(cameraSunOffset).applyQuaternion(camera.quaternion);
    updateHover();
    updateMarkerVisibility();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  });
}

main();
