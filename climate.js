// Zone classification and local climate. Pure functions, shared by the overlay texture and the
// info panel so the map and the numbers always agree.
import { PLANET, LATITUDE_ZONES, VERTICAL_ZONES, REGIONS } from './geography.js';
import { dailyInsolation, dayLength, hemisphereSeason, localSolarHours, orbitAt, sunElevation } from './astro.js';

const DEG = Math.PI / 180;
const NO_RAIN_SEASON = { type: 'none', strength: 0 };

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
    rainSeason: r.rainSeason ?? z.rainSeason ?? NO_RAIN_SEASON,
    pressureHpa: pressureHpa(c.isWater ? 0 : c.altitude),
    floorPressureBar: c.isWater
      ? PLANET.SEA_LEVEL_HPA / 1000 + (PLANET.SEAWATER_DENSITY * PLANET.GRAVITY * c.depth) / 1e5
      : null,
    treeline: lines.treeline,
    snowline: lines.snowline,
    notes: r.notes ?? [],
  };
}

// ---------------------------------------------------------------------------
// Weather at a moment: the annual climate from pointClimate, spread over the year and the day.

const SOLS = PLANET.SOLS_PER_YEAR;
const wrap = (x, m) => ((x % m) + m) % m;
// Integer sol of the year for a sun from sunAt.
export const dayOfYear = (sun) => Math.floor(wrap(sun.sol + sun.mtcHours / 24, SOLS));
const SEASON_LAG_SOLS = { land: 20, water: 45 }; // oceans respond to the sun more slowly than land
const ITCZ_MEAN_LAT = -5;
const ITCZ_SWING = 0.6; // degrees of ITCZ shift per degree of solar declination
const ITCZ_LAG_SOLS = 30;
const ITCZ_HALF_WIDTH = 12;
const RAIN_PER_DAY_MM = 25; // estimates rain days from precipitation when the text gives none
const CONVECTIVE_BELTS = new Set(['equatorial', 'trade-n', 'trade-s', 'dry-n', 'dry-s']);
const CONVECTIVE_HOURS = [13, 19]; // local hours when afternoon storms rain
const RH_PER_K = 0.06; // saturation vapour pressure grows ~6% per kelvin
const DAY_PEAK_FRACTION = 0.7; // warmest at 70% of the daylight hours (~14:30 with 12 h of daylight)

// Per sol of the year: seasonal temperature position `temp` in [−1, 1] and `wet` in [0, 1], plus the
// annual mean wetness. Temperature is the daily insolation passed through a lagged first-order response
// and scaled to its annual extremes, so eccentricity (a short, fierce southern summer) comes for free.
const seasonCache = new Map();
function seasonalCurves(lat, isWater, rainType) {
  const latDeg = Math.round(lat);
  const key = `${latDeg}|${isWater}|${rainType}`;
  const cached = seasonCache.get(key);
  if (cached) return cached;

  const insolation = Array.from({ length: SOLS }, (_, i) => dailyInsolation(latDeg, i + 0.5));
  const tau = isWater ? SEASON_LAG_SOLS.water : SEASON_LAG_SOLS.land;
  const temp = new Float64Array(SOLS);
  let t = insolation.reduce((a, b) => a + b, 0) / SOLS;
  for (let loop = 0; loop < 3; loop++) {
    for (let i = 0; i < SOLS; i++) temp[i] = t += (insolation[i] - t) / tau;
  }
  const lo = Math.min(...temp);
  const span = Math.max(...temp) - lo;
  for (let i = 0; i < SOLS; i++) temp[i] = span > 1e-6 ? ((temp[i] - lo) / span) * 2 - 1 : 0;

  const wet = new Float64Array(SOLS);
  for (let i = 0; i < SOLS; i++) {
    if (rainType === 'summer') wet[i] = (1 + temp[i]) / 2;
    else if (rainType === 'winter') wet[i] = (1 - temp[i]) / 2;
    else if (rainType === 'itcz') {
      const itcz = ITCZ_MEAN_LAT + ITCZ_SWING * orbitAt(i + 0.5 - ITCZ_LAG_SOLS).declination;
      wet[i] = Math.exp(-(((latDeg - itcz) / ITCZ_HALF_WIDTH) ** 2));
    } else wet[i] = 0.5;
  }
  const meanWet = wet.reduce((a, b) => a + b, 0) / SOLS;

  const curves = { temp, wet, meanWet };
  seasonCache.set(key, curves);
  return curves;
}

// −1 at sunrise, rising to +1 at the warmest hour, then cooling until the next sunrise.
function diurnalShape(hours, sunrise, length) {
  if (length <= 0 || length >= 24) return 0;
  const rise = DAY_PEAK_FRACTION * length;
  const x = wrap(hours - sunrise, 24);
  return x < rise ? -Math.cos((Math.PI * x) / rise) : Math.cos((Math.PI * (x - rise)) / (24 - rise));
}

// Deterministic value in [0, 1) for a set of integers.
function hash01(...ints) {
  let h = 2166136261;
  for (const v of ints) {
    h = Math.imul(h ^ v, 16777619);
    h ^= h >>> 13;
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

// Possible weather at a classified point `c` with annual climate `w` (pointClimate) under `sun` (sunAt).
// Temperatures and humidity follow the season and the hour; the sky is a plausible sample, the same
// for the same place and sol.
export function momentWeather(c, w, sun) {
  const rain = w.rainSeason;
  const curves = seasonalCurves(c.lat, c.isWater, rain.type);
  const day = dayOfYear(sun);
  const wet = curves.wet[day];

  const tempMean = (w.tempSummer + w.tempWinter) / 2 + (curves.temp[day] * (w.tempSummer - w.tempWinter)) / 2;
  const localHours = localSolarHours(c.lon, sun);
  const length = dayLength(c.lat, sun.declination);
  const sunrise = 12 - length / 2;
  const swing = (w.diurnal / 2) * Math.sin((Math.PI * length) / 24);
  const tempNow = tempMean + swing * diurnalShape(localHours, sunrise, length);
  // Absolute humidity stays put through the day, so relative humidity drops as the air warms.
  const rhDay = w.rh[0] + (w.rh[1] - w.rh[0]) * wet;
  const rh = Math.min(100, rhDay * Math.exp(-RH_PER_K * (tempNow - tempMean)));

  const rainDays = w.rainDays ? mid(w.rainDays) : mid(w.precip) / RAIN_PER_DAY_MM;
  const seasonFactor = curves.meanWet > 0 ? wet / curves.meanWet - 1 : 0;
  const rainChance = Math.min(0.95, (rainDays / SOLS) * (1 + rain.strength * seasonFactor));

  const elevation = sunElevation(c.lat, c.lon, sun);
  const isDay = elevation > 0;
  const cellLon = Math.floor(c.lon / 2);
  const cellLat = Math.floor((c.lat + 90) / 2);
  const roll = hash01(cellLon, cellLat, day);
  const rainsToday = roll < rainChance;
  const convective = CONVECTIVE_BELTS.has(c.latZone.id);
  const rainingNow =
    rainsToday && (!convective || (localHours >= CONVECTIVE_HOURS[0] && localHours < CONVECTIVE_HOURS[1]));
  let conditions;
  if (rainingNow) {
    if (tempNow <= 0) conditions = 'Snow';
    else conditions = convective && Math.abs(c.lat) < 45 && roll < rainChance * 0.4 ? 'Thunderstorm' : 'Rain';
  } else {
    const cloud = 0.6 * (rh / 100) + 0.4 * hash01(cellLon, cellLat, day, 1) + (rainsToday ? 0.3 : 0);
    conditions = cloud > 0.8 ? 'Overcast' : cloud > 0.55 ? 'Partly cloudy' : 'Clear';
    if (!isDay && conditions !== 'Overcast') conditions += ' night';
  }

  let season = hemisphereSeason(c.lat, sun.ls);
  if (rain.strength > 0 && seasonFactor > 0.25) season += ', wet season';
  if (rain.strength > 0 && seasonFactor < -0.25) season += ', dry season';

  const polar = length <= 0 ? 'Polar night' : length >= 24 ? 'Midnight sun' : null;
  return {
    localHours,
    sunElevation: elevation,
    isDay,
    dayLength: length,
    polar,
    sunrise: polar ? null : sunrise,
    sunset: polar ? null : 12 + length / 2,
    tempNow,
    tempHigh: tempMean + swing,
    tempLow: tempMean - swing,
    rh,
    rainChance,
    conditions,
    season,
    seaIce: c.isWater ? seaIceCover(c.lat, day) : 0,
    snow: snowCover(c, day),
    glacier: isGlacier(c),
  };
}

// ---------------------------------------------------------------------------
// Ice and snow. Temperatures come from a latitude profile interpolated between belt centres (the belt table jumps
// at its borders, which would put ice edges exactly on 60° or 72°), moved through the year by seasonalCurves.
// The map draws the same model in the shader (uPolar, uIceMask), adding only visual edge noise.

const BELT_PROFILE = LATITUDE_ZONES.map((z) => ({
  lat: (z.lat[0] + z.lat[1]) / 2,
  mid: (z.tempSummer + z.tempWinter) / 2,
  amp: (z.tempSummer - z.tempWinter) / 2,
})).sort((a, b) => a.lat - b.lat);

// Sea-level seasonal mid temperature and half-range at a latitude. Poleward of the polar belt centres the last
// slope is extrapolated, so the poles are colder than the belt average.
export function surfaceTempProfile(lat) {
  let i = BELT_PROFILE.findIndex((b) => b.lat >= lat);
  if (i === -1) i = BELT_PROFILE.length - 1;
  if (i === 0) i = 1;
  const a = BELT_PROFILE[i - 1];
  const b = BELT_PROFILE[i];
  const t = (lat - a.lat) / (b.lat - a.lat);
  return { mid: a.mid + (b.mid - a.mid) * t, amp: a.amp + (b.amp - a.amp) * t };
}

// Seasonal mean sea-level temperature on a sol of the year, with the land or ocean lag.
export function seasonalSurfaceTemp(lat, sol, isWater) {
  const { mid, amp } = surfaceTempProfile(lat);
  return mid + amp * seasonalCurves(lat, isWater, 'none').temp[Math.floor(wrap(sol, SOLS))];
}

const ICE_MIN_LAT = 50;
const iceCache = new Map();
// Sea-ice thickness per sol at an integer latitude: grows below freezing, melts above, run 4 years to settle.
function seaIceThickness(latDeg) {
  const cached = iceCache.get(latDeg);
  if (cached) return cached;
  const temps = Array.from({ length: SOLS }, (_, i) => seasonalSurfaceTemp(latDeg, i, true));
  const thickness = new Float64Array(SOLS);
  let h = 0;
  for (let year = 0; year < 4; year++) {
    for (let i = 0; i < SOLS; i++) {
      const below = PLANET.ICE_FREEZE_C - temps[i];
      h += below * (below > 0 ? PLANET.ICE_GROWTH_M_PER_K_SOL : PLANET.ICE_MELT_M_PER_K_SOL);
      h = Math.min(PLANET.ICE_MAX_M, Math.max(0, h));
      thickness[i] = h;
    }
  }
  iceCache.set(latDeg, thickness);
  return thickness;
}

// Cover at an integer latitude, including ice drifted from up to ICE_DRIFT_DEG poleward (fading with distance).
function driftedIceCover(latDeg, day) {
  const toPole = latDeg >= 0 ? 1 : -1;
  let cover = 0;
  for (let k = 0; k <= PLANET.ICE_DRIFT_DEG; k++) {
    const lat = latDeg + toPole * k;
    if (Math.abs(lat) > 90) break;
    const local = smoothstep(0, PLANET.ICE_FULL_M, seaIceThickness(lat)[day]);
    cover = Math.max(cover, local * (1 - k / (PLANET.ICE_DRIFT_DEG + 1)));
  }
  return cover;
}

// Fraction of the sea surface covered by ice (0–1) at a latitude on a sol of the year.
export function seaIceCover(lat, sol) {
  if (Math.abs(lat) < ICE_MIN_LAT) return 0;
  const day = Math.floor(wrap(sol, SOLS));
  const lo = Math.floor(lat);
  const t = lat - lo;
  return driftedIceCover(lo, day) * (1 - t) + driftedIceCover(Math.min(90, lo + 1), day) * t;
}

// Seasonal snow cover (0–1) on land from the seasonal mean temperature at the point's altitude.
export function snowCover(c, sol) {
  if (c.isWater) return 0;
  const temp = seasonalSurfaceTemp(c.lat, sol, false) - (PLANET.LAPSE_K_PER_KM * c.altitude) / 1000;
  return 1 - smoothstep(PLANET.SNOW_FULL_C, PLANET.SNOW_NONE_C, temp);
}

// Permanent land ice: above the snowline (the nival zone) or in an ice region such as Planum Australe.
export function isGlacier(c) {
  return !c.isWater && (c.vertZone?.id === 'nival' || c.region?.vegetation === 'ice');
}

// Land temperatures in the profile texture are stored as bytes across this range (°C).
export const POLAR_TEMP_RANGE = [-60, 60];

// Latitude profile for the shader, rows from 90°N: R = sea-ice cover, G = seasonal sea-level land temperature.
export function buildPolarProfile(sol, rows = 512) {
  const [lo, hi] = POLAR_TEMP_RANGE;
  const out = new Uint8Array(rows * 4);
  for (let row = 0; row < rows; row++) {
    const lat = 90 - ((row + 0.5) * 180) / rows;
    const temp = Math.min(1, Math.max(0, (seasonalSurfaceTemp(lat, sol, false) - lo) / (hi - lo)));
    out.set([Math.round(seaIceCover(lat, sol) * 255), Math.round(temp * 255), 0, 255], row * 4);
  }
  return out;
}

// Permanent land ice per texel (255 = glacier), sampled like buildZoneIds so it matches the altitude layer.
export function buildIceMask({ elev, width, height }, seaLevel, step = 2) {
  const w = Math.floor(width / step);
  const h = Math.floor(height / step);
  const mask = new Uint8Array(w * h);
  const p = makePoint(0, 0);
  const half = step >> 1;
  const iceRegions = COMPILED_REGIONS.filter((c) => c.region.vegetation === 'ice');

  for (let y = 0; y < h; y++) {
    const lat = 90 - ((y + 0.5) * 180) / h;
    const { snowline } = vegetationLines(latitudeZone(lat));
    // Region order matters (first match wins), so rows that may hold an ice region check all regions there.
    const needsRegions = iceRegions.some((c) => lat >= c.latMin && lat <= c.latMax);
    const candidates = needsRegions ? COMPILED_REGIONS.filter((c) => lat >= c.latMin && lat <= c.latMax) : [];
    const srcRow = Math.min(height - 1, y * step + half) * width;
    for (let x = 0; x < w; x++) {
      const altitude = elev[srcRow + Math.min(width - 1, x * step + half)] - seaLevel;
      if (altitude < 0) continue;
      let ice = altitude >= snowline;
      if (!ice && needsRegions) {
        setPoint(p, ((x + 0.5) * 360) / w, lat);
        ice = findRegion(candidates, p, false, altitude)?.vegetation === 'ice';
      }
      if (ice) mask[y * w + x] = 255;
    }
  }
  return { mask, width: w, height: h };
}

const BELT_BLEND_FRACTION = 0.1;
const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const smoothstep = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

// Belt colours by latitude with soft borders, as RGBA rows (row 0 = 90°N). Each blend starts 10% of
// a belt's latitude span before the border and ends 10% of the neighbour's span past it. Visual only:
// classification stays sharp.
export function buildBeltGradient(rows = 1024) {
  const northToSouth = [...LATITUDE_ZONES].sort((a, b) => b.lat[1] - a.lat[1]);
  const borders = northToSouth.slice(1).map((south, i) => {
    const north = northToSouth[i];
    const lat = south.lat[1];
    return {
      top: lat + BELT_BLEND_FRACTION * (north.lat[1] - north.lat[0]),
      bottom: lat - BELT_BLEND_FRACTION * (south.lat[1] - south.lat[0]),
      north: hexToRgb(north.color),
      south: hexToRgb(south.color),
    };
  });

  const out = new Uint8Array(rows * 4);
  for (let row = 0; row < rows; row++) {
    const lat = 90 - ((row + 0.5) * 180) / rows;
    let rgb = hexToRgb(latitudeZone(lat).color);
    const border = borders.find((b) => lat > b.bottom && lat < b.top);
    if (border) {
      const t = smoothstep(border.bottom, border.top, lat);
      rgb = border.south.map((v, k) => v + (border.north[k] - v) * t);
    }
    out.set([...rgb.map(Math.round), 255], row * 4);
  }
  return out;
}

// Half-width of the blend between neighbouring regions.
export const REGION_BLEND_DEG = 1.5;

// Box blur with running sums: longitude wraps, latitude clamps at the poles. `tmp` is scratch space.
function boxBlur(src, tmp, width, height, r) {
  const norm = 1 / (2 * r + 1);
  for (let y = 0; y < height; y++) {
    const row = y * width;
    let sum = 0;
    for (let k = -r; k <= r; k++) sum += src[row + ((k % width) + width) % width];
    for (let x = 0; x < width; x++) {
      tmp[row + x] = sum * norm;
      sum += src[row + ((x + r + 1) % width)] - src[row + ((x - r + width) % width)];
    }
  }
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let k = -r; k <= r; k++) sum += tmp[Math.max(0, k) * width + x];
    for (let y = 0; y < height; y++) {
      src[y * width + x] = sum * norm;
      sum += tmp[Math.min(height - 1, y + r + 1) * width + x] - tmp[Math.max(0, y - r) * width + x];
    }
  }
}

// Smooth region colours for the overlay, from a regions-layer id grid made by buildZoneIds. Returns two
// premultiplied RGBA grids, `land` and `water`. Each surface class is blurred on its own and normalised
// by its mask, so colours blend between regions (and fade into areas without a region) but never across
// the coastline. Each grid also reaches a little past the coast, which keeps linear filtering clean.
export function buildRegionColors(
  { ids, width: idWidth, height: idHeight },
  { elev, width: srcWidth, height: srcHeight },
  seaLevel,
  step = 2,
  scale = 2,
) {
  // The blend is several texels wide, so the colours are built at 1/scale of the id grid's resolution.
  const width = Math.floor(idWidth / scale);
  const height = Math.floor(idHeight / scale);
  const n = width * height;
  const land = REGIONS.map((r) => hexToRgb(r.landColor ?? r.seaColor));
  const water = REGIONS.map((r) => hexToRgb(r.seaColor));
  // Per class: red, green, blue (colour × coverage), coverage, mask.
  const classes = [0, 1].map(() => Array.from({ length: 5 }, () => new Float32Array(n)));
  const idHalf = scale >> 1;
  const srcHalf = step >> 1;

  for (let y = 0; y < height; y++) {
    // Sample the same elevation pixel buildZoneIds used for this id, so land/water always agrees with it.
    const idY = Math.min(idHeight - 1, y * scale + idHalf);
    const srcRow = Math.min(srcHeight - 1, idY * step + srcHalf) * srcWidth;
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const idX = Math.min(idWidth - 1, x * scale + idHalf);
      const isWater = elev[srcRow + Math.min(srcWidth - 1, idX * step + srcHalf)] < seaLevel;
      const ch = classes[isWater ? 1 : 0];
      ch[4][i] = 1;
      const id = ids[idY * idWidth + idX];
      if (!id) continue;
      const rgb = (isWater ? water : land)[id - 1];
      ch[0][i] = rgb[0];
      ch[1][i] = rgb[1];
      ch[2][i] = rgb[2];
      ch[3][i] = 1;
    }
  }

  // Three box passes approximate a Gaussian whose half-width is ~1.5 × (2r + 1) texels.
  const radius = Math.max(1, Math.round(((REGION_BLEND_DEG * width) / 360 / 1.5 - 1) / 2));
  const tmp = new Float32Array(n);
  for (const ch of classes) {
    for (const channel of ch) {
      for (let pass = 0; pass < 3; pass++) boxBlur(channel, tmp, width, height, radius);
    }
  }

  const [landOut, waterOut] = classes.map(([r, g, b, a, m]) => {
    const out = new Uint8Array(n * 4);
    for (let i = 0; i < n; i++) {
      if (m[i] < 1e-4) continue;
      const inv = 1 / m[i];
      out[i * 4] = Math.min(255, Math.round(r[i] * inv));
      out[i * 4 + 1] = Math.min(255, Math.round(g[i] * inv));
      out[i * 4 + 2] = Math.min(255, Math.round(b[i] * inv));
      out[i * 4 + 3] = Math.min(255, Math.round(a[i] * inv * 255));
    }
    return out;
  });
  return { land: landOut, water: waterOut, width, height };
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
