// Zone classification and local climate. Pure functions, shared by the overlay texture and the
// info panel so the map and the numbers always agree.
import { PLANET, LATITUDE_ZONES, VERTICAL_ZONES, REGIONS } from './geography.js';

const DEG = Math.PI / 180;

export const LAYERS = {
  belts: { label: 'Climate belts', zones: LATITUDE_ZONES },
  regions: { label: 'Regional climates', zones: REGIONS },
  altitude: { label: 'Altitude zones', zones: VERTICAL_ZONES },
};

export const normalizeLon = (lon) => ((lon % 360) + 360) % 360;
const mid = ([a, b]) => (a + b) / 2;

// Palette index of a zone within its layer; 0 means no zone.
export function zoneIndex(layer, zone) {
  return zone && LAYERS[layer] ? LAYERS[layer].zones.indexOf(zone) + 1 : 0;
}

export function latitudeZone(lat) {
  return LATITUDE_ZONES.find((z) => lat >= z.lat[0] && lat <= z.lat[1]);
}

export function pressureHpa(altitude) {
  return PLANET.SEA_LEVEL_HPA * Math.exp(-Math.max(altitude, 0) / (PLANET.SCALE_HEIGHT_KM * 1000));
}

// Treeline and snowline are given at the equator. Elsewhere they sit at the height where the
// annual mean temperature equals the equatorial value at those heights.
const EQUATORIAL_MEAN = mid(LATITUDE_ZONES.find((z) => z.id === 'equatorial').tempMean);
export function vegetationLines(latZone) {
  const shift = ((mid(latZone.tempMean) - EQUATORIAL_MEAN) / PLANET.LAPSE_K_PER_KM) * 1000;
  return {
    treeline: Math.max(0, PLANET.TREELINE_EQ_M + shift),
    snowline: Math.max(0, PLANET.SNOWLINE_EQ_M + shift),
  };
}

const VERTICAL_BY_ID = Object.fromEntries(VERTICAL_ZONES.map((z) => [z.id, z]));
function verticalZoneFor(altitude, { treeline, snowline }) {
  if (altitude < 0) return null;
  if (altitude >= snowline) return VERTICAL_BY_ID.nival;
  if (altitude >= treeline) return VERTICAL_BY_ID.alpine;
  if (altitude >= PLANET.MONTANE_BASE_M) return VERTICAL_BY_ID.montane;
  return VERTICAL_BY_ID.lowland;
}

export function verticalZone(altitude, latZone) {
  return verticalZoneFor(altitude, vegetationLines(latZone));
}

// ---------------------------------------------------------------------------
// Region shapes. Tests take a point {lon, lat, x, y, z} with lon in [0, 360).

function makePoint(lon, lat) {
  const p = { lon: 0, lat: 0, x: 0, y: 0, z: 0 };
  return setPoint(p, lon, lat);
}

function setPoint(p, lon, lat) {
  const cosLat = Math.cos(lat * DEG);
  p.lon = lon;
  p.lat = lat;
  p.x = cosLat * Math.cos(lon * DEG);
  p.y = cosLat * Math.sin(lon * DEG);
  p.z = Math.sin(lat * DEG);
  return p;
}

function compileShape(shape) {
  if (Array.isArray(shape)) {
    const parts = shape.map(compileShape);
    return {
      latMin: Math.min(...parts.map((s) => s.latMin)),
      latMax: Math.max(...parts.map((s) => s.latMax)),
      test: (p) => parts.some((s) => s.test(p)),
    };
  }
  switch (shape.type) {
    case 'box': {
      const [west, east] = shape.lon;
      const [south, north] = shape.lat;
      return {
        latMin: south,
        latMax: north,
        test: (p) => (west <= east ? p.lon >= west && p.lon <= east : p.lon >= west || p.lon <= east),
      };
    }
    case 'circle': {
      const c = makePoint(normalizeLon(shape.lon), shape.lat);
      const cosR = Math.cos(shape.r * DEG);
      return {
        latMin: shape.lat - shape.r,
        latMax: shape.lat + shape.r,
        test: (p) => p.x * c.x + p.y * c.y + p.z * c.z >= cosR,
      };
    }
    case 'polygon': {
      const xs = shape.points.map((q) => q[0]);
      const ys = shape.points.map((q) => q[1]);
      const ref = xs[0];
      const lonMin = Math.min(...xs);
      const lonMax = Math.max(...xs);
      return {
        latMin: Math.min(...ys),
        latMax: Math.max(...ys),
        test: (p) => {
          const x = p.lon - ref > 180 ? p.lon - 360 : ref - p.lon > 180 ? p.lon + 360 : p.lon;
          if (x < lonMin || x > lonMax) return false;
          let inside = false;
          for (let i = 0, j = xs.length - 1; i < xs.length; j = i++) {
            if (ys[i] > p.lat !== ys[j] > p.lat && x < ((xs[j] - xs[i]) * (p.lat - ys[i])) / (ys[j] - ys[i]) + xs[i]) {
              inside = !inside;
            }
          }
          return inside;
        },
      };
    }
    default:
      throw new Error(`Unknown region shape type: ${shape.type}`);
  }
}

function compileWhere({ surface, alt } = {}) {
  return {
    land: surface !== 'water',
    water: surface !== 'land',
    altMin: alt?.[0] ?? -Infinity,
    altMax: alt?.[1] ?? Infinity,
  };
}

const COMPILED_REGIONS = REGIONS.map((region) => ({
  region,
  where: compileWhere(region.where),
  ...compileShape(region.shape),
}));

function findRegion(candidates, p, isWater, altitude) {
  for (const c of candidates) {
    const w = c.where;
    if (isWater ? !w.water : !w.land) continue;
    if (altitude < w.altMin || altitude > w.altMax) continue;
    if (p.lat < c.latMin || p.lat > c.latMax) continue;
    if (c.test(p)) return c.region;
  }
  return null;
}

// ---------------------------------------------------------------------------

export function classify(lon, lat, elevation, seaLevel) {
  lon = normalizeLon(lon);
  const altitude = elevation - seaLevel;
  const isWater = altitude < 0;
  const latZone = latitudeZone(lat);
  return {
    lon,
    lat,
    elevation,
    seaLevel,
    altitude,
    isWater,
    depth: isWater ? -altitude : 0,
    latZone,
    vertZone: verticalZone(altitude, latZone),
    region: findRegion(COMPILED_REGIONS, makePoint(lon, lat), isWater, altitude),
  };
}

export function zoneFor(layer, c) {
  if (layer === 'belts') return c.latZone;
  if (layer === 'regions') return c.region;
  if (layer === 'altitude') return c.vertZone;
  return null;
}

// Local weather for a classified point: latitude belt values, adjusted for altitude (land only),
// with regional overrides on top.
export function pointClimate(c) {
  const z = c.latZone;
  const r = c.region?.climate ?? {};
  const dT = (r.tempOffset ?? 0) - (c.isWater ? 0 : (PLANET.LAPSE_K_PER_KM * c.altitude) / 1000);
  const lines = vegetationLines(z);
  return {
    tempMean: z.tempMean.map((t) => t + dT),
    tempSummer: z.tempSummer + dT,
    tempWinter: z.tempWinter + dT,
    diurnal: r.diurnal ?? z.diurnal,
    precip: r.precip ?? z.precip,
    precipNote: r.precipNote ?? z.precipNote ?? null,
    // A regional rainfall figure without its own rain days would contradict the belt's rain days.
    rainDays: r.rainDays ?? (r.precip ? null : z.rainDays),
    rh: r.rh ?? z.rh,
    rhNote: r.rh ? null : (z.rhNote ?? null),
    pw: r.pw ?? z.pw,
    wind: r.wind ?? z.wind,
    seasonality: r.seasonality ?? z.seasonality,
    driver: r.driver ?? z.driver,
    pressureHpa: pressureHpa(c.isWater ? 0 : c.altitude),
    floorPressureBar: c.isWater
      ? PLANET.SEA_LEVEL_HPA / 1000 + (PLANET.SEAWATER_DENSITY * PLANET.GRAVITY * c.depth) / 1e5
      : null,
    treeline: lines.treeline,
    snowline: lines.snowline,
    notes: r.notes ?? [],
  };
}

// Zone index per texel for an overlay layer, sampled every `step` source pixels.
// Row 0 is 90°N and column 0 is 0°E, like the elevation grid.
export function buildZoneIds({ elev, width, height }, seaLevel, layer, step = 2) {
  const w = Math.floor(width / step);
  const h = Math.floor(height / step);
  const ids = new Uint8Array(w * h);
  if (!LAYERS[layer]) return { ids, width: w, height: h };

  const index = new Map(LAYERS[layer].zones.map((zone, i) => [zone, i + 1]));
  const p = makePoint(0, 0);
  const half = step >> 1;

  for (let y = 0; y < h; y++) {
    const lat = 90 - ((y + 0.5) * 180) / h;
    const latZone = latitudeZone(lat);
    const srcRow = Math.min(height - 1, y * step + half) * width;
    const out = y * w;

    if (layer === 'belts') {
      ids.fill(index.get(latZone), out, out + w);
      continue;
    }

    const lines = vegetationLines(latZone);
    const candidates = COMPILED_REGIONS.filter((c) => lat >= c.latMin && lat <= c.latMax);
    for (let x = 0; x < w; x++) {
      const altitude = elev[srcRow + Math.min(width - 1, x * step + half)] - seaLevel;
      let zone;
      if (layer === 'altitude') {
        zone = verticalZoneFor(altitude, lines);
      } else {
        setPoint(p, ((x + 0.5) * 360) / w, lat);
        zone = findRegion(candidates, p, altitude < 0, altitude);
      }
      ids[out + x] = zone ? index.get(zone) : 0;
    }
  }
  return { ids, width: w, height: h };
}
