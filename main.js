import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { OBJECTS, OBJECT_GROUPS, PLANET } from './geography.js';
import {
  LAYERS,
  POLAR_TEMP_RANGE,
  azonalFor,
  biomeFor,
  buildBeltGradient,
  buildIceMask,
  buildPolarProfile,
  buildZoneColors,
  buildZoneIds,
  classify,
  coastDistance,
  dayOfYear,
  momentWeather,
  normalizeLon,
  pointClimate,
  zoneFor,
  zoneIndex,
} from './climate.js';
import { BIOME_GROUPS } from './biomes.js';
import { localSolarHours, marsNow, solFromLs, sunAt } from './astro.js';

const MARS_RADIUS_M = 3389500;
const HIST_BIN_M = 10;
const ZONE_STEP = 2; // zone texture resolution = elevation grid / ZONE_STEP
const BELT_GRADIENT_ROWS = 1024;
const POLAR_ROWS = 512; // latitude rows of the sea-ice / land-temperature profile
const BERG_CELL_M = 40000; // size of the large iceberg cells
const COLOR_MODES = { altitude: 0, belts: 1, biomes: 2 }; // uColorMode per layer
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
  rivers: $('rivers'),
  legend: $('legend'),
  info: $('info'),
  infoBody: $('info-body'),
  infoClose: $('info-close'),
  sunLight: $('sun-light'),
  iceSnow: $('ice-snow'),
  sol: $('sol'),
  solValue: $('sol-value'),
  hour: $('hour'),
  hourValue: $('hour-value'),
  subsolar: $('subsolar'),
  timeNow: $('time-now'),
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
  uniform sampler2D uBeltGradient;
  uniform float uColorMode;
  uniform sampler2D uRegionLand;
  uniform sampler2D uRegionWater;
  uniform sampler2D uPolar;
  uniform sampler2D uIceMask;
  uniform float uIceOn;
  uniform float uSnowFull;
  uniform float uSnowNone;
  uniform float uLapse;
  uniform vec2 uPolarTempRange;

  varying vec2 vTex;
  varying vec3 vWorldPos;
  varying vec3 vUp;

  const float PI = 3.141592653589793;
  const float MARS_RADIUS = ${MARS_RADIUS_M.toFixed(1)};
  const float BERG_SCALE = ${(MARS_RADIUS_M / BERG_CELL_M).toFixed(3)}; // iceberg cells per planet radius

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

  // Hashes and noise on 3D positions, so patterns on the sphere don't stretch near the poles.
  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }

  vec3 hash33(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.xxy + p.yxx) * p.zyx);
  }

  float valueNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
          mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
      mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
          mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
      f.z);
  }

  // One octave of icebergs in 3D cells of 1/scale planet radii. Sea-ice cover (0–1) sets both how many cells hold
  // a berg and how big it is, so bergs are small and rare near open water and merge toward the pack. pxCell is the
  // pixel footprint in cell units. Returns (berg, underwater rim, berg core).
  vec3 icebergs(vec3 p, float scale, float cover, float sizeScale, float pxCell) {
    vec3 q = p * scale;
    vec3 cell = floor(q);
    float presence = smoothstep(0.0, 0.5, cover);
    float radius = mix(0.1, 0.62, cover) * sizeScale;
    float aa = max(pxCell, 1e-4);
    // Jagged outlines: one noise field per pixel stretches or shrinks the distance to every berg.
    float jag = 1.0 + (valueNoise(q * 1.7) + 0.5 * valueNoise(q * 4.3) - 0.75) * 0.8;
    vec3 result = vec3(0.0);
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        for (int z = -1; z <= 1; z++) {
          vec3 c = cell + vec3(float(x), float(y), float(z));
          if (hash13(c + 17.13) > presence) continue;
          float r = radius * mix(0.6, 1.2, hash13(c + 3.71));
          // Angular floes: cube cross-sections blended with a round shape. Each cube is turned about two axes by
          // random angles, so the slices through the sphere don't line up into a grid anywhere (including the poles).
          vec3 o = q - (c + 0.2 + 0.6 * hash33(c));
          float a = hash13(c + 9.2) * 6.2832;
          float b = hash13(c + 5.9) * 6.2832;
          o = vec3(o.x * cos(a) + o.z * sin(a), o.y, o.z * cos(a) - o.x * sin(a));
          o = vec3(o.x, o.y * cos(b) - o.z * sin(b), o.y * sin(b) + o.z * cos(b));
          float d = mix(length(o), max(max(abs(o.x), abs(o.y)), abs(o.z)) * 1.2, 0.4) * jag;
          result = max(result, vec3(
            1.0 - smoothstep(r - aa, r + aa, d),
            1.0 - smoothstep(r * 1.35 - aa, r * 1.35 + aa, d),
            1.0 - smoothstep(r * 0.3, r + aa, d)));
        }
      }
    }
    // Below ~3 px per cell the pattern would sparkle, so it fades to its average coverage.
    float detail = 1.0 - smoothstep(0.15, 0.4, pxCell);
    float average = presence * radius * radius * 1.6;
    return mix(vec3(average, average * 1.6, average * 0.5), result, detail);
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

    // Day/night from the sphere normal, with a soft twilight band. Slopes facing the sun stay dark
    // past the terminator, and the night side keeps a dim bluish ambient so the map stays readable.
    float daylight = smoothstep(-0.06, 0.06, dot(up, L));
    float landDiffuse = max(dot(terrainN, L), 0.0) * daylight;
    vec3 land = landColor(elev) * (mix(vec3(0.08, 0.09, 0.13), vec3(0.18), daylight) + 0.82 * landDiffuse);

    float depth = uSeaLevel - elev;
    vec3 water = mix(vec3(0.31, 0.64, 0.85), vec3(0.04, 0.18, 0.35), sqrt(clamp(depth / 3000.0, 0.0, 1.0)));
    water = mix(water, vec3(0.62, 0.84, 0.95), 0.5 * (1.0 - smoothstep(0.0, 30.0, depth)));
    float waterDiffuse = max(dot(normalize(mix(up, terrainN, 0.15)), L), 0.0) * daylight;
    float spec = pow(max(dot(up, normalize(L + V)), 0.0), 60.0) * 0.35 * daylight;
    water = water * (mix(vec3(0.10, 0.11, 0.16), vec3(0.25), daylight) + 0.75 * waterDiffuse) + vec3(spec);

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
    // Colour source per layer (uColorMode): 0 = palette per id, 1 = belt gradient, 2 = smooth biome
    // colours. Biomes come as premultiplied land and water grids picked by the coastline mask, so they
    // blend into each other but stay sharp at the coast. Selection never changes anything on the globe.
    float beltMode = 1.0 - step(0.5, abs(uColorMode - 1.0));
    float regionMode = step(1.5, uColorMode);
    vec3 paletteColor = texture2D(uPalette, vec2((id + 0.5) / 256.0, 0.5)).rgb;
    vec3 zoneColor = mix(paletteColor, texture2D(uBeltGradient, vec2(0.5, vTex.y)).rgb, beltMode);
    vec4 region = mix(texture2D(uRegionLand, vTex), texture2D(uRegionWater, vTex), wet);
    float visible = step(0.001, uOverlayOpacity);
    float hasZone = step(0.5, id) * visible;
    float shade = 0.3 + 0.7 * mix(landDiffuse, waterDiffuse, wet);
    float alpha = min(uOverlayOpacity, 0.92);
    vec3 flatColor = mix(color, zoneColor * shade, alpha * hasZone);
    vec3 smoothColor = color * (1.0 - region.a * alpha) + region.rgb * shade * alpha;
    color = mix(flatColor, smoothColor, regionMode * visible);
    float outline = edge * hasZone * (1.0 - beltMode) * (1.0 - regionMode);
    color = mix(color, zoneColor * 0.3, outline * clamp(0.35 + uOverlayOpacity, 0.0, 0.95));

    // Ice and snow, drawn over every layer. uPolar holds sea-ice cover (r) and the seasonal sea-level land
    // temperature (g) by latitude; uIceMask marks permanent land ice. Noise only roughens the edges.
    vec3 fwUp = fwidth(up);
    if (uIceOn > 0.5) {
      vec3 iceAmbient = mix(vec3(0.07, 0.08, 0.12), vec3(0.18), daylight);
      vec3 iceTop = vec3(0.87, 0.92, 0.97);

      // Sea ice: pack where cover is full, icebergs over grey-blue slush in the transition to open water.
      float wobble = (valueNoise(up * 6.0) - 0.5) * (3.0 / 180.0) + (valueNoise(up * 23.0) - 0.5) * (0.6 / 180.0);
      float cover = texture2D(uPolar, vec2(0.5, clamp(vTex.y + wobble, 0.0, 1.0))).r * wet;
      if (cover > 0.003) {
        // Ice stays bright under a low polar sun, so its light falls off more gently than plain Lambert.
        float iceShade = sqrt(max(dot(up, L), 0.0)) * daylight;
        vec3 iceLit = iceTop * (iceAmbient + 0.82 * iceShade);
        float pxUnit = length(fwUp);
        vec3 big = icebergs(up, BERG_SCALE, cover, 1.0, pxUnit * BERG_SCALE);
        vec3 small = icebergs(up + 7.3, BERG_SCALE * 4.0, cover, 0.7, pxUnit * BERG_SCALE * 4.0);
        float berg = max(big.x, small.x);
        float rim = max(big.y, small.y);
        float core = max(big.z, small.z);
        vec3 seaIce = mix(color, vec3(0.55, 0.66, 0.74) * (iceAmbient + 0.7 * iceShade), cover * cover * 0.6);
        seaIce = mix(seaIce, vec3(0.32, 0.64, 0.70) * (iceAmbient + 0.7 * iceShade), max(rim - berg, 0.0) * 0.25);
        seaIce = mix(seaIce, iceLit * mix(0.9, 1.0, core), berg);
        vec3 pack = iceLit * (0.95 + 0.05 * valueNoise(up * 150.0));
        color = mix(color, mix(seaIce, pack, smoothstep(0.85, 0.98, cover)), wet);
      }

      // Land: glaciers from the mask, seasonal snow where the seasonal temperature at this altitude is cold.
      float glacier = texture2D(uIceMask, vTex).r;
      float seaLevelTemp = mix(uPolarTempRange.x, uPolarTempRange.y, texture2D(uPolar, vec2(0.5, vTex.y)).g);
      float landTemp = seaLevelTemp - uLapse * (elev - uSeaLevel) / 1000.0 + (valueNoise(up * 40.0) - 0.5) * 2.0;
      float snow = 1.0 - smoothstep(uSnowFull, uSnowNone, landTemp);
      float landIce = max(glacier, snow) * (1.0 - wet);
      vec3 snowColor = mix(vec3(0.93, 0.95, 0.98), vec3(0.82, 0.89, 0.96), glacier);
      color = mix(color, snowColor * (iceAmbient + 0.84 * sqrt(landDiffuse)), landIce * 0.95);
    }

    // Thin dusty atmosphere at the limb.
    float rim = pow(1.0 - max(dot(up, V), 0.0), 3.0);
    color += vec3(0.8, 0.45, 0.3) * rim * 0.25 * (0.3 + 0.7 * daylight);

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

  // Ice and snow: a latitude profile rebuilt when the sol changes, and a glacier mask rebuilt with the overlay.
  // Linear filtering keeps both edges soft.
  const polar = new THREE.DataTexture(
    new Uint8Array(POLAR_ROWS * 4),
    1,
    POLAR_ROWS,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  );
  const iceMask = new THREE.DataTexture(new Uint8Array(w * h), w, h, THREE.RedFormat, THREE.UnsignedByteType);
  for (const tex of [polar, iceMask]) {
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.unpackAlignment = 1;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
  }
  polar.wrapS = THREE.ClampToEdgeWrapping;
  iceMask.wrapS = THREE.RepeatWrapping;

  return {
    ids,
    palette,
    gradient,
    regionLand,
    regionWater,
    polar,
    iceMask,
    texel: new THREE.Vector2(1 / w, 1 / h),
  };
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
// Mars hours (24 per sol) as hh:mm.
const fmtTime = (hours) => {
  const minutes = Math.floor((((hours % 24) + 24) % 24) * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
};

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

function chip(zone) {
  return zone ? `<span class="chip"><i style="background:${zone.color}"></i>${esc(zone.name)}</span>` : '';
}

function seaIceLabel(cover) {
  const pct = `${fmt(cover * 100)}%`;
  if (cover < 0.05) return 'Open water';
  if (cover < 0.5) return `Scattered floes and icebergs (${pct})`;
  if (cover < 0.9) return `Broken pack ice (${pct})`;
  return `Pack ice (${pct})`;
}

function weatherList(rows) {
  return `<dl class="weather">${rows
    .filter(Boolean)
    .map(([k, v, note]) => `<dt>${esc(k)}</dt><dd>${esc(v)}${note ? `<small>${esc(note)}</small>` : ''}</dd>`)
    .join('')}</dl>`;
}

function infoHtml(object, c, w, now, biome, azonal = []) {
  const title = object?.name ?? biome?.name ?? (c.isWater ? 'Open ocean' : 'Land');
  const kicker = object
    ? OBJECT_GROUPS[object.group]
    : biome
      ? `${BIOME_GROUPS[biome.group]} · ${biome.code}`
      : c.isWater
        ? 'Sea'
        : 'Land';
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
  const nowRows = [
    [
      'Local time',
      `${fmtTime(now.localHours)} · ${now.isDay ? 'day' : 'night'}`,
      `Sun ${fmt(Math.abs(now.sunElevation))}° ${now.sunElevation >= 0 ? 'above' : 'below'} the horizon`,
    ],
    [
      'Sunrise / sunset',
      now.polar ?? `${fmtTime(now.sunrise)} / ${fmtTime(now.sunset)}`,
      `${fmt(now.dayLength, 1)} h of daylight`,
    ],
    ['Conditions', now.conditions, 'A possible sky for this sol, not a forecast'],
    ['Temperature', `${fmt(now.tempNow)} °C`, `Today ${fmtRange([now.tempLow, now.tempHigh], ' °C')}`],
    ['Humidity', `${fmt(now.rh)}% RH`],
    ['Rain', now.rainingNow ? 'Raining' : now.rainsToday ? 'Not right now (rain today)' : 'No rain'],
    ['Surface wind', `${fmt(now.windSpeed, 1)} m/s`, now.windText],
    now.waves && ['Waves', `${fmt(now.waves.height, 1)} m at ${fmt(now.waves.period)} s`, 'Fully developed sea'],
    c.isWater
      ? ['Sea ice', seaIceLabel(now.seaIce)]
      : (now.glacier || now.snow >= 0.05) &&
        ['Snow and ice', now.glacier ? 'Glacier ice' : `Snow cover ${fmt(now.snow * 100)}%`],
    ['Season', now.season],
  ];
  const notes = [...w.notes];
  if (!c.isWater && w.tempMean[1] < 0) notes.unshift('Annual mean below freezing');

  const sections = [];
  if (biome) {
    sections.push(
      `<h3>${esc(biome.code)} · ${esc(biome.name)}</h3><p>${esc(biome.place)}</p>` +
        `<p><strong>Vegetation and fauna:</strong> ${esc(biome.vegetation)}</p>` +
        `<p><strong>Through the day:</strong> ${esc(biome.daily)}</p>` +
        `<p><strong>Seasons:</strong> ${esc(biome.seasons)}</p>`,
    );
  }
  if (azonal.length) {
    sections.push(
      `<h3>Also here</h3><ul class="notes">${azonal
        .map((b) => `<li><strong>${esc(b.code)}</strong> ${esc(b.name)} — ${esc(b.summary)}</li>`)
        .join('')}</ul>`,
    );
  }
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
    <div class="chips">${chip(biome)}${chip(c.latZone)}${chip(c.vertZone)}${
      c.region?.name === biome?.name ? '' : chip(c.region)
    }</div>
    ${
      object
        ? `<p class="object-notes">${esc(object.notes)} · gazetteer elevation ${esc(object.elevation)}</p>
           <p>${esc(object.description)}</p>`
        : ''
    }
    <h3>Right now</h3>
    ${weatherList(nowRows)}
    <h3>Climate (annual)</h3>
    ${weatherList(rows)}
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

  // Line2 draws in screen space, so every river material needs the viewport size.
  const riverMaterials = [];

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    for (const m of riverMaterials) m.resolution.set(window.innerWidth, window.innerHeight);
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
      uBeltGradient: { value: zoneTextures.gradient },
      uColorMode: { value: 0 },
      uRegionLand: { value: zoneTextures.regionLand },
      uRegionWater: { value: zoneTextures.regionWater },
      uPolar: { value: zoneTextures.polar },
      uIceMask: { value: zoneTextures.iceMask },
      uIceOn: { value: ui.iceSnow.checked ? 1 : 0 },
      uSnowFull: { value: PLANET.SNOW_FULL_C },
      uSnowNone: { value: PLANET.SNOW_NONE_C },
      uLapse: { value: PLANET.LAPSE_K_PER_KM },
      uPolarTempRange: { value: new THREE.Vector2(...POLAR_TEMP_RANGE) },
    },
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1, 512, 256), material));

  // --- State --------------------------------------------------------------
  let seaLevel = 0;
  let layer = ui.layer.value;
  let selection = null; // {lon, lat, object}
  let sun = sunAt(0, 0); // set from the time sliders
  let polarDay = -1; // sol of the year the polar profile texture was built for
  let legendHighlight = 0; // zone index picked in the legend, 0 = none

  // --- Zone overlay -------------------------------------------------------
  let overlayTimer = 0;
  let coastField = null; // km to the nearest coast per zone texel; the biome layer's coast/interior test
  function rebuildOverlay() {
    clearTimeout(overlayTimer);
    coastField = coastDistance(data, seaLevel, ZONE_STEP);
    const zones = buildZoneIds(data, seaLevel, layer, ZONE_STEP, coastField.dist);
    zoneTextures.ids.image.data.set(zones.ids);
    zoneTextures.ids.needsUpdate = true;
    zoneTextures.iceMask.image.data.set(buildIceMask(data, seaLevel, ZONE_STEP).mask);
    zoneTextures.iceMask.needsUpdate = true;
    if (layer === 'biomes') {
      const { land, water } = buildZoneColors(LAYERS[layer].zones, zones, data, seaLevel, ZONE_STEP, REGION_COLOR_SCALE);
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

  // Distance to the coast at a point, from the field the overlay build leaves behind.
  function coastAt(lon, lat) {
    if (!coastField) return null;
    const { dist, width: cw, height: ch } = coastField;
    const x = Math.min(cw - 1, Math.floor((normalizeLon(lon) / 360) * cw));
    const y = THREE.MathUtils.clamp(Math.floor(((90 - lat) / 180) * ch), 0, ch - 1);
    return dist[y * cw + x];
  }

  // The selected zone is only marked in the legend; nothing is drawn on the globe.
  function updateHighlight() {
    let id = legendHighlight;
    if (!id && selection) {
      const { lon, lat } = selection;
      const c = classify(lon, lat, elevationAt(data, lon, lat), seaLevel);
      id = zoneIndex(layer, zoneFor(layer, c, { coastKm: coastAt(lon, lat) }));
    }
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
    placeRivers();
  }

  function updateMarkerVisibility() {
    const show = ui.landmarks.checked;
    for (const m of markers) {
      // Only markers on the near side of the globe (above the horizon seen from the camera).
      m.label3d.visible = show && m.normal.dot(camera.position) > 1.02;
    }
    labelRenderer.domElement.classList.toggle('zoomed', camera.position.length() < MINOR_LABEL_DISTANCE);
  }

  // --- Rivers and lakes ---------------------------------------------------
  // Courses traced by tools/trace_rivers.py over the same elevation grid (data/rivers.json). Line width follows
  // discharge, so the Solis at 49,700 m³/s reads as the great river it is next to the Pavonis at 3,400.
  const riverGroup = new THREE.Group();
  scene.add(riverGroup);
  let riverData = null;

  const RIVER_COLOR = 0x74d0f2;
  const LAKE_COLOR = 0xa8e6f7;
  const RIVER_LIFT = 1.0015; // clear of the surface, so the globe does not z-fight the line
  const RIVER_NEAR_KM = 60; // how close a click counts as "on the river", for the azonal biomes
  const LAKE_LARGE_KM2 = 100000; // R05 freshwater inland sea, against R06 deep crater lake

  function greatCircleKm(aLon, aLat, bLon, bLat) {
    const rad = Math.PI / 180;
    const dLat = (bLat - aLat) * rad;
    const dLon = (bLon - aLon) * rad;
    const h =
      Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * (MARS_RADIUS_M / 1000) * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function pointInRing(lon, lat, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  // Vertices at the displaced surface, rebuilt whenever the sea level or the exaggeration moves.
  function pathPositions(coords) {
    const exaggeration = Number(ui.exag.value);
    const out = new Float32Array(coords.length * 3);
    for (let i = 0; i < coords.length; i++) {
      const [lon, lat] = coords[i];
      const surface = Math.max(elevationAt(data, lon, lat), seaLevel);
      const radius = (1 + (surface / MARS_RADIUS_M) * exaggeration) * RIVER_LIFT;
      lonLatToVector(lon, lat, radius).toArray(out, i * 3);
    }
    return out;
  }

  function addPath(coords, color, width) {
    const geometry = new LineGeometry();
    geometry.setPositions(pathPositions(coords));
    const material = new LineMaterial({ color, linewidth: width, transparent: true, opacity: 0.9 });
    material.resolution.set(window.innerWidth, window.innerHeight);
    riverMaterials.push(material);
    const line = new Line2(geometry, material);
    line.userData.coords = coords;
    riverGroup.add(line);
  }

  function placeRivers() {
    for (const line of riverGroup.children) line.geometry.setPositions(pathPositions(line.userData.coords));
  }

  async function loadRivers() {
    try {
      const res = await fetch('data/rivers.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      riverData = await res.json();
    } catch (err) {
      console.warn('Rivers are not drawn:', err.message); // the globe is still usable without them
      return;
    }
    for (const river of riverData.rivers) {
      addPath(river.points, RIVER_COLOR, 1.2 + 2.6 * Math.sqrt(river.discharge / 49700));
      for (const lake of river.lakes) {
        if (lake.points.length < 4) continue;
        addPath([...lake.points, lake.points[0]], LAKE_COLOR, 1.4);
      }
    }
    riverGroup.visible = ui.rivers.checked;
  }

  // Which drawn river or lake a point sits on, for the azonal river biomes (R01–R09).
  function riverContext(lon, lat) {
    if (!riverData) return {};
    for (const river of riverData.rivers) {
      for (const lake of river.lakes) {
        if (lake.points.length > 3 && pointInRing(lon, lat, lake.points)) {
          return { lake: lake.areaKm2 >= LAKE_LARGE_KM2 ? 'large' : 'deep' };
        }
      }
    }
    let nearest = Infinity;
    let atMouth = false;
    for (const river of riverData.rivers) {
      for (const [rlon, rlat] of river.points) {
        nearest = Math.min(nearest, greatCircleKm(lon, lat, rlon, rlat));
      }
      if (greatCircleKm(lon, lat, river.mouth[0], river.mouth[1]) <= RIVER_NEAR_KM) atMouth = true;
    }
    if (nearest > RIVER_NEAR_KM) return {};
    return { river: atMouth ? 'mouth' : true };
  }

  // --- Selection and info panel -------------------------------------------
  function renderInfo() {
    ui.info.hidden = !selection;
    for (const m of markers) m.el.classList.toggle('selected', m.object === selection?.object);
    if (!selection) return;
    const { lon, lat, object } = selection;
    const c = classify(lon, lat, elevationAt(data, lon, lat), seaLevel);
    const ctx = { coastKm: coastAt(lon, lat), ...riverContext(lon, lat) };
    const biome = biomeFor(c, ctx);
    const w = pointClimate(c);
    ui.infoBody.innerHTML = infoHtml(object, c, w, momentWeather(c, w, sun, biome), biome, azonalFor(c, ctx));
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
  ui.rivers.addEventListener('change', () => {
    riverGroup.visible = ui.rivers.checked;
  });
  // --- Sun and season -----------------------------------------------------
  // The hour slider holds minutes of Mars Coordinated Time (time at 0°E).
  function updateSun() {
    const sol = Number(ui.sol.value);
    const mtcHours = Number(ui.hour.value) / 60;
    sun = sunAt(sol, mtcHours);
    if (dayOfYear(sun) !== polarDay) {
      polarDay = dayOfYear(sun);
      zoneTextures.polar.image.data.set(buildPolarProfile(polarDay, POLAR_ROWS));
      zoneTextures.polar.needsUpdate = true;
    }
    ui.solValue.textContent = `Sol ${sol + 1} · Ls ${fmt(sun.ls)}° · ${sun.seasonName}`;
    ui.hourValue.textContent = `${fmtTime(mtcHours)} MTC`;
    ui.subsolar.textContent =
      `Subsolar point ${fmtLat(sun.declination)} ${fmtLon(sun.subsolarLon)} · ${fmt(sun.distanceAu, 3)} AU`;
    if (ui.sunLight.checked) sunDir.copy(lonLatToVector(sun.subsolarLon, sun.declination));
    renderInfo();
  }

  function setTimeToNow() {
    const { ls, mtcHours } = marsNow();
    ui.sol.value = Math.floor(solFromLs(ls));
    ui.hour.value = Math.floor(mtcHours * 60);
    updateSun();
  }

  ui.sol.addEventListener('input', updateSun);
  ui.hour.addEventListener('input', updateSun);
  ui.sunLight.addEventListener('change', updateSun);
  ui.iceSnow.addEventListener('change', () => {
    material.uniforms.uIceOn.value = ui.iceSnow.checked ? 1 : 0;
  });
  ui.timeNow.addEventListener('click', setTimeToNow);
  setTimeToNow();

  ui.level.disabled = false;
  ui.levelNum.disabled = false;
  setLevel(Number(ui.level.value));
  applyLayer();
  loadRivers();

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
    const zone = biomeFor(c, { coastKm: coastAt(point.lon, point.lat) })?.name ?? c.latZone.name;
    const local = fmtTime(localSolarHours(c.lon, sun));
    ui.hover.textContent = `${fmtLat(c.lat)} ${fmtLon(c.lon)} · ${surface} · ${zone} · ${local} local`;
    ui.hover.hidden = false;
  }

  ui.loading.hidden = true;

  const cameraSunOffset = new THREE.Vector3(-0.6, 0.5, 1).normalize();
  renderer.setAnimationLoop(() => {
    const distance = camera.position.length();
    controls.rotateSpeed = THREE.MathUtils.clamp((distance - 1) * 0.4, 0.05, 1);
    controls.update();
    // With sun lighting on, sunDir follows the time sliders (updateSun). Otherwise light comes from the
    // upper left of the viewer, so the visible side is always lit.
    if (!ui.sunLight.checked) sunDir.copy(cameraSunOffset).applyQuaternion(camera.quaternion);
    updateHover();
    updateMarkerVisibility();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  });
}

main();
