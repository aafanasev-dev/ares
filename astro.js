// Orbit, calendar and sun position. Pure functions with no three.js or DOM, so they run under Node.
//
// "Now" comes from real Mars through the Mars24 algorithm (Allison & McEwen 2000): its solar longitude Ls
// and Mars Coordinated Time (MTC). The planet's own orbit (PLANET.SEMI_MAJOR_AU, a 366-sol year) is placed
// at the same Ls, so its seasons match real Mars today. Sol 0 starts at Ls 0°, the northern spring equinox.
// Times of day are Mars hours, 24 per sol; local times are true solar times.
import { PLANET } from './geography.js';

const DEG = Math.PI / 180;
const TAU = 2 * Math.PI;
const wrap = (x, m) => ((x % m) + m) % m;
const clamp1 = (x) => Math.min(1, Math.max(-1, x));

const ECC = PLANET.ECCENTRICITY;
const SOLS = PLANET.SOLS_PER_YEAR;
const SIN_OBLIQUITY = Math.sin(PLANET.OBLIQUITY_DEG * DEG);
// tan²(ε/2): the equation of time's reduction-to-the-equator series.
const Y = Math.tan((PLANET.OBLIQUITY_DEG * DEG) / 2) ** 2;

// ---------------------------------------------------------------------------
// Real Mars (Mars24)

const TT_MINUS_UTC_S = 69.184; // 37 leap seconds + 32.184 s
// Perturbations by other planets: amplitude (°), period (Julian years), phase (°).
const PBS_TERMS = [
  [0.0071, 2.2353, 49.409],
  [0.0057, 2.7543, 168.173],
  [0.0039, 1.1177, 191.837],
  [0.0037, 15.7866, 21.736],
  [0.0021, 2.1354, 15.704],
  [0.002, 2.4694, 95.528],
  [0.0018, 32.8493, 49.095],
];

export function marsNow(date = new Date()) {
  const jdTT = date.getTime() / 86400000 + 2440587.5 + TT_MINUS_UTC_S / 86400;
  const dt = jdTT - 2451545.0;
  const m = (19.3871 + 0.52402073 * dt) * DEG;
  const alphaFMS = 270.3871 + 0.524038496 * dt;
  const pbs = PBS_TERMS.reduce((sum, [amp, tau, phi]) => sum + amp * Math.cos(((0.985626 * dt) / tau + phi) * DEG), 0);
  const centre =
    (10.691 + 3e-7 * dt) * Math.sin(m) +
    0.623 * Math.sin(2 * m) +
    0.05 * Math.sin(3 * m) +
    0.005 * Math.sin(4 * m) +
    0.0005 * Math.sin(5 * m) +
    pbs;
  const marsSolDate = (jdTT - 2405522.0028779) / 1.0274912517;
  return { ls: wrap(alphaFMS + centre, 360), mtcHours: wrap(24 * marsSolDate, 24) };
}

// ---------------------------------------------------------------------------
// The planet's orbit

function meanFromTrue(nu) {
  const E = 2 * Math.atan2(Math.sqrt(1 - ECC) * Math.sin(nu / 2), Math.sqrt(1 + ECC) * Math.cos(nu / 2));
  return E - ECC * Math.sin(E);
}

function trueFromMean(M) {
  let E = M;
  for (let i = 0; i < 8; i++) E -= (E - ECC * Math.sin(E) - M) / (1 - ECC * Math.cos(E));
  return 2 * Math.atan2(Math.sqrt(1 + ECC) * Math.sin(E / 2), Math.sqrt(1 - ECC) * Math.cos(E / 2));
}

const M_AT_EQUINOX = meanFromTrue(-PLANET.LS_PERIHELION_DEG * DEG);

// Sol of the year (fractional) at which the planet reaches solar longitude `ls`.
export function solFromLs(ls) {
  const M = meanFromTrue((ls - PLANET.LS_PERIHELION_DEG) * DEG);
  return wrap(((M - M_AT_EQUINOX) / TAU) * SOLS, SOLS);
}

// Orbital state at a fractional sol of the year.
export function orbitAt(sol) {
  const M = M_AT_EQUINOX + (TAU * sol) / SOLS;
  const nu = trueFromMean(M);
  const ls = wrap(nu / DEG + PLANET.LS_PERIHELION_DEG, 360);
  return {
    ls,
    declination: Math.asin(SIN_OBLIQUITY * Math.sin(ls * DEG)) / DEG,
    distanceAu: (PLANET.SEMI_MAJOR_AU * (1 - ECC * ECC)) / (1 + ECC * Math.cos(nu)),
    centreDeg: wrap(nu - M + Math.PI, TAU) / DEG - 180, // equation of centre ν − M
  };
}

export const lsFromSol = (sol) => orbitAt(sol).ls;

const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
export function hemisphereSeason(lat, ls) {
  const south = lat < 0;
  return `${south ? 'Southern' : 'Northern'} ${SEASONS[Math.floor(wrap(south ? ls + 180 : ls, 360) / 90)]}`;
}

// Sun for a sol of the year (integer) and the time at 0°E in Mars hours.
export function sunAt(sol, mtcHours) {
  const orbit = orbitAt(sol + mtcHours / 24);
  const L = orbit.ls * DEG;
  const eotDeg =
    (Y * Math.sin(2 * L) - ((Y * Y) / 2) * Math.sin(4 * L) + ((Y * Y * Y) / 3) * Math.sin(6 * L)) / DEG -
    orbit.centreDeg;
  return {
    ...orbit,
    sol,
    mtcHours,
    eotHours: eotDeg / 15,
    // Local true solar noon is where 12 = MTC + lon/15 + EOT.
    subsolarLon: wrap(-(15 * mtcHours + eotDeg + 180), 360),
    seasonName: hemisphereSeason(1, orbit.ls),
  };
}

export function localSolarHours(lon, sun) {
  return wrap(12 + (lon - sun.subsolarLon) / 15, 24);
}

// Sun elevation above the horizon in degrees (negative at night).
export function sunElevation(lat, lon, sun) {
  const phi = lat * DEG;
  const d = sun.declination * DEG;
  const h = (lon - sun.subsolarLon) * DEG;
  return Math.asin(clamp1(Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(h))) / DEG;
}

// Hours of daylight: 0 in polar night, 24 in polar day.
export function dayLength(lat, declination) {
  const x = -Math.tan(lat * DEG) * Math.tan(declination * DEG);
  return x >= 1 ? 0 : x <= -1 ? 24 : (24 * Math.acos(x)) / Math.PI;
}

// Daily mean top-of-atmosphere insolation, W/m².
export function dailyInsolation(lat, sol) {
  const { declination, distanceAu } = orbitAt(sol);
  const phi = lat * DEG;
  const d = declination * DEG;
  const h0 = Math.acos(clamp1(-Math.tan(phi) * Math.tan(d)));
  const flux = PLANET.SOLAR_CONSTANT / (distanceAu * distanceAu);
  return (flux / Math.PI) * (h0 * Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.sin(h0));
}
