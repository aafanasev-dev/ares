// Planet data transcribed from planet_geography.md. Keep the two in sync: this file is what the
// map draws and what the info panel shows.
//
// Coordinates are planetocentric latitude and east longitude (0–360). Altitudes in `where`
// conditions are meters relative to the current sea level, so zones follow the coastline when
// the sea level slider moves.

export const PLANET = {
  SEA_DATUM_MOLA: 2000, // sea level above the Mars areoid, m
  SEA_LEVEL_HPA: 1013,
  SCALE_HEIGHT_KM: 22.3,
  LAPSE_K_PER_KM: 2.5, // environmental lapse rate
  GRAVITY: 3.71,
  SEAWATER_DENSITY: 1025,
  // Vertical zone boundaries at the equator (§1.5). Treeline and snowline move with latitude.
  MONTANE_BASE_M: 2500,
  TREELINE_EQ_M: 7000,
  SNOWLINE_EQ_M: 11000,
  // Orbit (§1.2). Perihelion is at real Mars's Ls, so southern summer falls at perihelion (§2.4).
  SEMI_MAJOR_AU: 1.02,
  ECCENTRICITY: 0.093,
  OBLIQUITY_DEG: 25.2,
  SOLS_PER_YEAR: 366,
  LS_PERIHELION_DEG: 250.87,
  SOLAR_CONSTANT: 1361, // W/m² at 1 AU
};

// §1.5, §2.2, §2.4. Temperatures are sea-level annual means in °C, precipitation in mm/yr.
// rainSeason: when the rain falls. type 'itcz' (wettest as the ITCZ passes overhead), 'summer'
// (monsoon), 'winter' (storm track) or 'none'; strength 0–1 is how strongly rain chance swings with it.
export const LATITUDE_ZONES = [
  {
    id: 'equatorial',
    name: 'Equatorial wet',
    lat: [-12, 12],
    color: '#22a35f',
    wind: 'Convergent, light',
    tempMean: [22, 22],
    tempSummer: 23,
    tempWinter: 21,
    diurnal: 8,
    precip: [2000, 3000],
    rainDays: [90, 130],
    rh: [80, 90],
    pw: [130, 150],
    seasonality: 'Weak, double rainfall peak',
    driver: 'ITCZ crossing twice (mean ITCZ ~5°S)',
    rainSeason: { type: 'itcz', strength: 0.5 },
    description:
      'Under the convergence zone the seasonal signal is wet/dry, not warm/cold. Forests are evergreen. ' +
      'Rain arrives in roughly a third as many events as on Earth, each two to three times heavier.',
  },
  {
    id: 'trade-n',
    name: 'Trade belt (north)',
    lat: [12, 45],
    color: '#9cc93c',
    wind: 'Steady easterlies',
    tempMean: [19, 21],
    tempSummer: 22,
    tempWinter: 17,
    diurnal: 9,
    precip: [900, 1800],
    rainDays: [40, 70],
    rh: [35, 80],
    rhNote: '70–80% in the wet season, 35–50% in the dry season',
    pw: [45, 120],
    seasonality: 'Mild',
    driver: 'Ocean buffer + aphelion summer',
    rainSeason: { type: 'summer', strength: 0.4 },
    description:
      'Hadley cells reach 55–65° on this small, fast-turning planet, so steady trade easterlies cover two-thirds ' +
      'of the globe. In the north they blow over open ocean with 12,000 km of fetch.',
  },
  {
    id: 'trade-s',
    name: 'Trade belt (south)',
    lat: [-45, -12],
    color: '#d6b43a',
    wind: 'Steady easterlies',
    tempMean: [19, 21],
    tempSummer: 26,
    tempWinter: 15,
    diurnal: 13,
    precip: [700, 1400],
    rainDays: [25, 45],
    rh: [35, 80],
    rhNote: '70–80% in the wet season, 35–50% in the dry season',
    pw: [45, 120],
    seasonality: 'Sharp, hot short summer',
    driver: 'Perihelion + land',
    rainSeason: { type: 'summer', strength: 0.6 },
    description:
      'Southern summer currently falls at perihelion: a short, fierce summer and a long, cold winter. ' +
      'Deciduous leaf drop is forced by drought, not frost — the landscape goes brown to green, never green to gold.',
  },
  {
    id: 'dry-n',
    name: 'Dry subsidence belt (north)',
    lat: [45, 60],
    color: '#e58a3c',
    wind: 'Weak, variable',
    tempMean: [8, 14],
    tempSummer: 19,
    tempWinter: 3,
    diurnal: 15,
    precip: [150, 400],
    rainDays: [4, 10],
    rh: [25, 40],
    pw: [25, 40],
    seasonality: 'Clear and calm, ocean-buffered',
    driver: 'Subsiding Hadley air over open ocean',
    description:
      'The desert belt sits at high latitude here. In the north it lies over open ocean: clear, calm and ' +
      'high-evaporation, the salinity maximum of the planet.',
  },
  {
    id: 'dry-s',
    name: 'Dry subsidence belt (south)',
    lat: [-60, -45],
    color: '#d9622b',
    wind: 'Weak, variable',
    tempMean: [8, 14],
    tempSummer: 19,
    tempWinter: 3,
    diurnal: 15,
    precip: [150, 400],
    rainDays: [4, 10],
    rh: [25, 40],
    pw: [25, 40],
    seasonality: 'Sharp thermal, erratic rain',
    driver: 'Perihelion; rain episodic, not seasonal',
    description:
      'A cool desert belt under subsiding Hadley air. Rain comes in a few cloudbursts a year; endorheic craters ' +
      'become salt pans and soda lakes.',
  },
  {
    id: 'storm-n',
    name: 'Storm belt (north)',
    lat: [60, 72],
    color: '#5a80d6',
    wind: 'Westerlies, single jet',
    tempMean: [4, 8],
    tempSummer: 11,
    tempWinter: 1,
    diurnal: 6,
    precip: [1200, 2000],
    rainDays: [150, 200],
    rh: [80, 90],
    pw: [50, 70],
    seasonality: 'Moderate (stormy / calm)',
    driver: 'Jet position',
    rainSeason: { type: 'winter', strength: 0.3 },
    description:
      'One merged jet at ~60° and 35 km altitude, 40–90 m/s. Weather arrives as only three giant cyclones per ' +
      'hemisphere. The northern track is the cleanest on the planet, with no land to break the storms.',
  },
  {
    id: 'storm-s',
    name: 'Storm belt (south)',
    lat: [-72, -60],
    color: '#6f5bd0',
    wind: 'Westerlies, single jet',
    tempMean: [4, 8],
    tempSummer: 11,
    tempWinter: 1,
    diurnal: 6,
    precip: [1200, 2000],
    rainDays: [150, 200],
    rh: [80, 90],
    pw: [50, 70],
    seasonality: 'Moderate (stormy / calm)',
    driver: 'Jet position',
    rainSeason: { type: 'winter', strength: 0.3 },
    description:
      'Westerlies and three giant cyclones strike the southern coasts, feeding dense, low temperate rainforest.',
  },
  {
    id: 'polar-n',
    name: 'Polar (north, ocean)',
    lat: [72, 90],
    color: '#b8e2f4',
    wind: 'Weak easterlies',
    tempMean: [0, 0],
    tempSummer: 4,
    tempWinter: -5,
    diurnal: 3,
    precip: [400, 700],
    rainDays: [100, 140],
    rh: [85, 95],
    pw: [20, 30],
    seasonality: 'Weak thermal, strong ice cycle',
    driver: 'Sea-ice extent',
    description:
      'An ocean pole. A circumpolar current can isolate it thermally: perennial sea ice in a core region, ' +
      'seasonal ice to ~70°N, no land ice. Sea-level freezing occurs only poleward of ~73°.',
  },
  {
    id: 'polar-s',
    name: 'Polar (south, land)',
    lat: [-90, -72],
    color: '#eef3fa',
    wind: 'Weak easterlies',
    tempMean: [-4, -4],
    tempSummer: 3,
    tempWinter: -12,
    diurnal: 9,
    precip: [600, 1000],
    rainDays: [120, 160],
    rh: [85, 95],
    pw: [20, 30],
    seasonality: 'Violent',
    driver: 'Perihelion melt vs. aphelion accumulation',
    description:
      'A land pole carrying the only permanent land ice on the planet. It breathes with the 25,500-year ' +
      'precession cycle: melting and retreating now, growing when the north is at perihelion.',
  },
];

// §1.5. Boundaries are equatorial values; treeline and snowline are shifted with latitude in climate.js.
export const VERTICAL_ZONES = [
  {
    id: 'lowland',
    name: 'Lowland',
    color: '#63b25a',
    description: 'Below 2.5 km (1.00–0.89 bar). Full sea-level climate of the latitude belt.',
  },
  {
    id: 'montane',
    name: 'Montane',
    color: '#2d7a4c',
    description: '2.5 km up to the treeline (0.89–0.72 bar). Forest thins with height; temperature drops ~2.5 K per km.',
  },
  {
    id: 'alpine',
    name: 'Alpine',
    color: '#b89c6a',
    description: 'Above the treeline (7 km at the equator, 0.72 bar) up to the snowline: scrub, then alpine desert.',
  },
  {
    id: 'nival',
    name: 'Nival (ice)',
    color: '#f4f8fc',
    description: 'Above the snowline (11 km at the equator, 0.61 bar): permanent snow and ice.',
  },
];

// Regional climates, checked in order: the first match wins, so specific regions come first.
// shape: {type:'box', lon:[west, east], lat:[south, north]} (west > east wraps across 0°E),
//        {type:'circle', lon, lat, r} (r in degrees of arc), {type:'polygon', points:[[lon, lat], ...]},
//        or an array of shapes (union).
// where: {surface: 'land' | 'water', alt: [min, max]} with altitudes relative to sea level (null = open).
// climate: overrides for the latitude belt values (including rainSeason), plus tempOffset (K) and notes.
// vegetation / sea: palette keys colouring the region's land and water pixels on the map.
// flora: what grows there, shown under "About this region".
export const VEGETATION = {
  rainforest: '#1b5e32',
  forest: '#2e7d3e',
  'open-forest': '#5b9a45',
  savanna: '#a3c95c',
  steppe: '#c8b878',
  desert: '#e0a95e',
  dunes: '#d98c45',
  alpine: '#b9b2a6',
  salt: '#e8e2d0',
  ice: '#f3f7fb',
};

export const SEA = {
  open: '#3a86b8',
  sheltered: '#2aa7b5',
  anoxic: '#274f8c',
  shallow: '#6cc4c9',
  saline: '#4fa7c4',
  storm: '#3b62a3',
  ice: '#cfe7f2',
};

const REGION_DATA = [
  {
    id: 'vm-side-chasmata',
    name: 'Sheltered side chasmata',
    vegetation: 'rainforest',
    sea: 'sheltered',
    flora:
      'The tallest forest on the planet: 300 m canopy with heavy epiphyte loading and a very dark floor. ' +
      'Gliding vertebrates are the dominant arboreal body plan.',
    shape: [
      { type: 'circle', lon: 283.6, lat: -9.8, r: 2.6 },
      { type: 'circle', lon: 288.5, lat: -6.5, r: 2.2 },
      { type: 'circle', lon: 288, lat: -4, r: 1.6 },
      { type: 'circle', lon: 283, lat: -1, r: 1.6 },
    ],
    where: { alt: [null, 1500] },
    climate: {
      wind: 'Dead calm, permanently misted',
      precipNote: 'Fog-fed; continuous orographic rain on the walls of the sound',
      rh: [90, 100],
      notes: ['Anoxic below a few hundred metres of water'],
    },
    description:
      'Melas, Candor, Ophir and Hebes Chasmata: sheltered, dead-calm, permanently misted and warm. The only places ' +
      'on the planet that combine maximum shelter, maximum moisture and tropical warmth — home to 300 m forests, ' +
      '60–80 m stilt-waders, and sky-nets hundreds of metres across strung between 4 km walls.',
  },
  {
    id: 'vm-sound',
    name: 'Valles Marineris sound',
    vegetation: 'rainforest',
    sea: 'sheltered',
    flora:
      'Rain-fed forest on the inner walls: giants where shelter is genuine, wind-pruned scrub on spurs exposed ' +
      'to the axial trade flow.',
    shape: {
      type: 'polygon',
      points: [
        [266, -3], [280, -2.5], [292, -6.5], [305, -9], [314, -10], [320, -11],
        [320, -15.5], [314, -16], [304, -16], [292, -13], [280, -10.5], [266, -9],
      ],
    },
    where: { alt: [null, 1500] },
    climate: {
      wind: 'Trades funnelled along the axis — windy',
      precip: [3000, 4500],
      precipNote: 'Wettest place on the planet; permanent rain wall at the western head',
      rh: [85, 95],
      notes: [
        'Anoxic below a few hundred metres, thin productive surface layer',
        'Sheltered from open-ocean waves and surge',
        'Walls rise 3–5 km above the water: permanent ridge lift for giant soarers',
      ],
    },
    description:
      'The most important single feature on the planet: a 4,000 km flooded sound, 100–200 km wide, floor at −7 km. ' +
      'Moist trade air is funnelled up a narrowing channel with no exit but upward, so the inner walls receive ' +
      'continuous orographic rain. The head holds the only quiet, fine-grained delta anywhere.',
  },
  {
    id: 'tharsis-cones',
    name: 'Tharsis volcanic cones',
    vegetation: 'alpine',
    flora: 'Alpine desert above the treeline, then bare permanent ice above ~11 km.',
    shape: [
      { type: 'circle', lon: 255.5, lat: 11.8, r: 4.5 },
      { type: 'circle', lon: 247, lat: 0.8, r: 4 },
      { type: 'circle', lon: 239.9, lat: -8.4, r: 4.5 },
    ],
    where: { surface: 'land', alt: [7000, null] },
    climate: {
      precip: [0, 300],
      precipNote: 'Falls as snow above ~11 km',
      rh: [10, 20],
      notes: ['Each cone throws a windward rain crescent and a tapering lee wake'],
    },
    description:
      'Ascraeus, Pavonis and Arsia Mons: standalone shields, so air splits around them as well as over them. ' +
      'Alpine desert, then ice above ~11 km. Ascraeus and Arsia carry permanent caps 4.5–5 km thick; Pavonis is ' +
      'marginal and comes and goes with obliquity. Summit pressure at 16 km is 0.48 bar — reachable only from the air.',
  },
  {
    id: 'gap-jets',
    name: 'Inter-cone gap-jet corridors',
    vegetation: 'dunes',
    flora: 'Barren: permanently scoured by the gap jets.',
    shape: [
      { type: 'circle', lon: 251.3, lat: 6.3, r: 2.6 },
      { type: 'circle', lon: 243.5, lat: -3.8, r: 2.6 },
    ],
    where: { surface: 'land', alt: [2500, 7000] },
    climate: {
      wind: 'Permanently accelerated gap jets',
      precip: [0, 100],
      rh: [10, 20],
      pw: [8, 15],
      notes: ['Star dunes up to 500 m high with 15 km spacing'],
    },
    description:
      'The two gaps between the three cones, roughly 700 km apart, carry permanently accelerated gap jets that have ' +
      'scoured corridors of star dunes up to 500 m high.',
  },
  {
    id: 'olympus',
    name: 'Olympus Mons island',
    vegetation: 'open-forest',
    flora:
      'Moderate 40–90 m forest on the lower flanks rather than rainforest, with glaciers from the summit ice cap ' +
      'descending into it.',
    shape: { type: 'circle', lon: 226.2, lat: 18.65, r: 7 },
    where: { surface: 'land' },
    climate: {
      precipNote: 'Not especially wet: air arrives dried from the Tharsis lee',
      notes: [
        'Permanent tropical ice cap above 11 km',
        'Downwind: a cloud-free wake ~2,000 km long with a von Kármán vortex street',
        'One of only two nesting sites in the northern ocean',
      ],
    },
    description:
      'The highest point on the planet (+19.2 km) and an island, separated from Tharsis by a drowned aureole. ' +
      'Summit pressure 0.35 bar — an Everest-class summit. Lower flanks carry moderate 40–90 m forest rather than rainforest.',
  },
  {
    id: 'elysium',
    name: 'Elysium Mons island',
    vegetation: 'rainforest',
    flora: 'Forest from sea level to 6 km with a 100–200 m canopy: species-poor, with giant endemics.',
    shape: { type: 'circle', lon: 147.2, lat: 25, r: 11 },
    where: { surface: 'land' },
    climate: {
      precipNote: 'Very wet eastern flank in clean oceanic trade flow',
      notes: ['Marginal ice cap near the summit'],
    },
    description:
      'The second island volcano (+12.1 km), 6,000 km east of Olympus. With Olympus it is one of the only two land ' +
      'masses in the northern ocean — the sole nesting sites for anything pelagic, and a severe ecological bottleneck.',
  },
  {
    id: 'lunae-coast',
    name: 'Eastern coastal rainforest',
    vegetation: 'rainforest',
    flora: 'Lowland rainforest on the windward coast.',
    shape: {
      type: 'polygon',
      points: [
        [260, 30], [274, 30], [278, 10], [300, 2], [314, -8], [316, -40], [294, -50], [288, -30], [282, -12], [270, -2], [262, 10],
      ],
    },
    where: { surface: 'land', alt: [null, 800] },
    climate: {
      precip: [2300, 2700],
      precipNote: 'Trade winds forced up the escarpment',
      rh: [80, 90],
    },
    description:
      'The Lunae Planum coastal step on the windward (east) side of Tharsis: lowland rainforest, ~2,500 mm a year, ' +
      'fed by trade winds with nowhere to go but up the escarpment.',
  },
  {
    id: 'east-escarpment',
    name: 'East Tharsis escarpment',
    vegetation: 'rainforest',
    flora:
      'Cloud forest in stacked vertical bands, 60–250 m: giants in sheltered gorges, wind-pruned scrub on the ' +
      'interfluves.',
    shape: {
      type: 'polygon',
      points: [
        [260, 30], [274, 30], [278, 10], [300, 2], [314, -8], [316, -40], [294, -50], [288, -30], [282, -12], [270, -2], [262, 10],
      ],
    },
    where: { surface: 'land', alt: [null, 5500] },
    climate: {
      precip: [3000, 4000],
      precipNote: 'Orographic rain and cloud on the windward wall',
      rh: [85, 95],
    },
    description:
      'The eastern wall of Tharsis, from +0.5 to +5 km: cloud forest, 3,000–4,000 mm a year, in seven vertical km ' +
      'of stacked bands. Its sheltered gorges also host stilt-waders.',
  },
  {
    id: 'tharsis-plateau',
    name: 'Tharsis plateau steppe',
    vegetation: 'steppe',
    flora: 'Cold dry steppe. Gallery forest (20–60 m) grows only along the glacier-fed rivers.',
    shape: {
      type: 'polygon',
      points: [[234, 25], [262, 25], [272, 5], [285, -12], [292, -30], [290, -42], [262, -44], [246, -34], [238, -10]],
    },
    where: { surface: 'land', alt: [1500, null] },
    climate: {
      precip: [0, 100],
      precipNote: 'Rain shadow — driest place on the planet; glacier-fed rivers and playas',
      rh: [10, 20],
      pw: [8, 15],
      seasonality: 'Extreme wet/dry',
      driver: 'Cross-equatorial monsoon',
      rainSeason: { type: 'summer', strength: 1 },
      notes: ['Breathable, temperate and dry: a pleasant Tibet'],
    },
    description:
      'Syria and Solis Planum, +3 to +6 km: cold dry steppe at 0.78–0.83 bar and ~11 °C at the equator. The planet’s ' +
      'most habitable highland. Water comes as seasonal glacier-melt pulses from Ascraeus and Arsia that thread the ' +
      'plateau with gallery forest and die into playas.',
  },
  {
    id: 'daedalia-lee',
    name: 'Daedalia rain shadow',
    vegetation: 'desert',
    flora: 'Arid rain-shadow scrub and desert.',
    shape: {
      type: 'polygon',
      points: [[214, 25], [240, 25], [238, -10], [246, -34], [262, -44], [262, -52], [214, -52]],
    },
    where: { surface: 'land', alt: [null, 2500] },
    climate: {
      precip: [150, 400],
      precipNote: 'Arid rain shadow on the western descent',
      rh: [25, 40],
    },
    description:
      'The western descent of Tharsis, from +2 km down to the Amazonis coast. Air that has crossed the plateau ' +
      'descends dry; the rain shadow falls mainly on the open ocean beyond.',
  },
  {
    id: 'alba-forest',
    name: 'Alba Mons river forest',
    vegetation: 'forest',
    flora: 'The largest single forest by area: a uniform 60–100 m canopy with no giants, exposed to the wind.',
    shape: { type: 'circle', lon: 250.4, lat: 40.5, r: 12 },
    where: { surface: 'land' },
    climate: {
      precipNote: 'Maritime exposure facing the northern ocean',
    },
    description:
      'A vast, extremely low-angle shield on the northern edge of Tharsis. Gentle slopes and maritime exposure give ' +
      'long, radial, dendritic river networks — the best river country on the planet.',
  },
  {
    id: 'hellas-gulf',
    name: 'Hellas gulf',
    sea: 'anoxic',
    shape: [
      { type: 'circle', lon: 70.5, lat: -42.4, r: 20 },
      { type: 'circle', lon: 92, lat: -33, r: 4 },
    ],
    where: { surface: 'water' },
    climate: {
      notes: [
        'Euxinic below ~500 m: anoxic, sulfidic, permanently stratified',
        'Surface waters near normal salinity, flushed through the Dao Vallis strait',
      ],
    },
    description:
      'The deepest point on the planet (floor −10.2 km): a 2,300 km gulf reached through one strait near Dao Vallis. ' +
      'A Black Sea at ten times the scale.',
  },
  {
    id: 'hellas-shores',
    name: 'Hellas arid shores',
    vegetation: 'desert',
    flora: 'Arid shores with sabkha belts left by decadal surge flooding.',
    shape: { type: 'circle', lon: 70.5, lat: -42.4, r: 27 },
    where: { surface: 'land', alt: [null, 2000] },
    climate: {
      precipNote: 'Arid, with coastal fog from the gulf',
      notes: ['Subsiding air runs 10–15 K warmer than the surrounding highlands'],
    },
    description:
      'The shores of Hellas sit squarely in the 45–60° subsidence belt. Descending air warms as it sinks into the ' +
      'basin; coastal fog and shoreline sabkha are the rule.',
  },
  {
    id: 'argyre-gulf',
    name: 'Argyre gulf and Uzboi–Ladon inlet',
    sea: 'anoxic',
    shape: { type: 'circle', lon: 316, lat: -49.7, r: 9 },
    where: { surface: 'water' },
    climate: {
      notes: ['Stratified like Hellas: anoxic at depth behind a shallow sill'],
    },
    description:
      'An 800 km gulf (floor −7.2 km) connected northward through the Uzboi–Ladon–Margaritifer corridor, forming a ' +
      '2,000 km fjord-like inlet deep into the southern highlands.',
  },
  {
    id: 'hesperia-sabkha',
    name: 'Hesperia Planum sabkha',
    vegetation: 'salt',
    sea: 'shallow',
    flora: 'Nothing grows: a permanent damp salt crust at ~25 °C and 60% humidity.',
    shape: { type: 'circle', lon: 110, lat: -20, r: 9 },
    where: { alt: [-500, 400] },
    climate: {
      precipNote: '25 m storm surges reach hundreds of km inland',
      rh: [55, 65],
    },
    description:
      'One of the two flattest surfaces on the planet, within a metre or two of sea level. Surge salt cannot be ' +
      'leached out, so it is permanent sabkha — the planet’s true wastelands are not dry, they are salt.',
  },
  {
    id: 'arabia-shallows',
    name: 'Arabia shallows',
    vegetation: 'salt',
    sea: 'shallow',
    flora: 'Low islands are permanent sabkha: salt cannot be leached out, so little grows.',
    shape: { type: 'circle', lon: 15, lat: 20, r: 22 },
    where: { alt: [-2500, 400] },
    climate: {
      precipNote: '25 m storm surges reach hundreds of km inland',
      notes: ['Shallow sea and archipelago'],
    },
    description:
      'A shallow sea with an archipelago, one of the two flattest surfaces on the planet. Surge floods far inland ' +
      'and salt cannot be leached out of the islands.',
  },
  {
    id: 'planum-australe',
    name: 'Planum Australe ice cap',
    vegetation: 'ice',
    flora: 'Permanent ice; krummholz (1–4 m) only at the margin, to ~73°S.',
    shape: { type: 'box', lon: [0, 360], lat: [-90, -72] },
    where: { surface: 'land' },
    climate: {
      precipNote: 'Heavy snowfall',
      notes: [
        'Maritime, wet-based ice: fast outlet glaciers calving icebergs',
        'Braided sandur plains and jökulhlaups at the margins',
      ],
    },
    description:
      'The only permanent land ice on the planet. It sits inside the storm belt, so it is maritime rather than ' +
      'polar-desert — Patagonian, not Antarctic. Melting and retreating now; it will grow again in 25,500 years.',
  },
  {
    id: 'storm-coast-s',
    name: 'Southern storm coast',
    vegetation: 'forest',
    flora: 'Temperate rainforest, dense and low (20–40 m); windy except in the fjord heads.',
    shape: { type: 'box', lon: [0, 360], lat: [-72, -60] },
    where: { surface: 'land' },
    climate: {},
    description:
      'Aonia Terra and the southern uplands under the westerlies: three giant cyclones per hemisphere drive dense, ' +
      'low temperate rainforest.',
  },
  {
    id: 'subsidence-desert-s',
    name: 'Southern subsidence desert',
    vegetation: 'desert',
    flora: 'Cool desert with succulents adapted to floods, not drizzle.',
    shape: { type: 'box', lon: [0, 360], lat: [-60, -45] },
    where: { surface: 'land' },
    climate: {
      precip: [200, 400],
      precipNote: 'In 3–4 cloudbursts a year',
      rainDays: [3, 4],
      notes: ['Crater basins become salt pans, soda lakes and brine pools'],
    },
    description:
      'A cool desert (8–14 °C) under the subsidence belt. Beaded crater chains that end in closed basins become the ' +
      'salt sink of Continent A.',
  },
  {
    id: 'southern-savanna',
    name: 'Southern savanna and crater forests',
    vegetation: 'savanna',
    flora:
      'Grasses 5–8 m tall with flat-crowned, heavily buttressed trees 40–80 m apart. Crater ring forests: a 150 m ' +
      'canopy in every bowl, knee-high scrub on every rim, gallery forest along the spillway gorges.',
    shape: { type: 'box', lon: [0, 360], lat: [-45, -12] },
    where: { surface: 'land' },
    climate: {
      precip: [700, 1100],
      precipNote: 'Delivered in 20–30 days',
      rainDays: [20, 30],
      diurnal: 13,
      seasonality: 'Strongest on the planet',
      driver: 'Monsoon and perihelion aligned',
      rainSeason: { type: 'summer', strength: 1 },
      notes: ['Dust devils 5–10 km tall'],
    },
    description:
      'Terra Cimmeria and Terra Sirenum: heavily cratered plains where water fills one crater, overflows, and fills ' +
      'the next — beaded drainage. Each bowl is a pocket of still air, so the plain reads as a field of green discs. ' +
      'Feels muggy year-round thanks to 2.6× absolute humidity.',
  },
  {
    id: 'amazonis-lee',
    name: 'Amazonis lee sea',
    sea: 'saline',
    shape: { type: 'polygon', points: [[180, 0], [236, 0], [242, 45], [180, 45]] },
    where: { surface: 'water' },
    climate: {
      precipNote: 'Drier than the open trade ocean',
      notes: ['Salinity maximum in the lee of Tharsis', 'Olympus wake: cloud-free, with a von Kármán vortex street'],
    },
    description:
      'The deep ocean west of Tharsis. Air that crossed the massif descends here, so the coast is dry and the sea is ' +
      'unusually salty.',
  },
  {
    id: 'north-sea-ice',
    name: 'Northern sea-ice ocean',
    sea: 'ice',
    shape: { type: 'box', lon: [0, 360], lat: [72, 90] },
    where: { surface: 'water' },
    climate: {
      notes: ['Perennial sea ice in a core region, seasonal ice to ~70°N', 'Circumpolar current isolates the pole'],
    },
    description: 'Vastitas Borealis: the north polar ocean basin, −5 to −7 km. No land ice, only sea ice.',
  },
  {
    id: 'north-storm-track',
    name: 'Northern storm track',
    sea: 'storm',
    shape: { type: 'box', lon: [0, 360], lat: [60, 72] },
    where: { surface: 'water' },
    climate: {
      notes: ['Open-ocean storm seas 22–35 m with a 48 s period', 'Storm surge 2.6× Earth’s'],
    },
    description:
      'The cleanest storm track on the planet: three giant cyclones and no land to break them.',
  },
  {
    id: 'north-subsidence-sea',
    name: 'Northern subsidence sea',
    sea: 'saline',
    shape: { type: 'box', lon: [0, 360], lat: [45, 60] },
    where: { surface: 'water' },
    climate: {
      wind: 'Weak, variable — clear and calm',
      notes: ['Salinity maximum of the planet', 'Warm saline water sinks here to form the deep ocean'],
    },
    description:
      'Clear, calm, high-evaporation ocean under the northern subsidence belt, near the curl line of the ' +
      'hemisphere-wide subtropical gyre.',
  },
  {
    id: 'north-trade-ocean',
    name: 'Northern trade-wind ocean',
    sea: 'open',
    shape: { type: 'box', lon: [0, 360], lat: [12, 45] },
    where: { surface: 'water' },
    climate: {
      notes: ['12,000 km of uninterrupted easterly fetch: the largest seas on the planet', 'Typical seas 4–5.5 m, 19 s period'],
    },
    description:
      'Utopia, Acidalia, Amazonis and Chryse: deep ocean under steady easterlies, broken only by Olympus and Elysium.',
  },
];

function paletteColor(palette, key, region) {
  if (!(key in palette)) throw new Error(`Region ${region.id}: unknown palette key "${key}"`);
  return palette[key];
}

export const REGIONS = REGION_DATA.map((region) => {
  const landColor = region.vegetation ? paletteColor(VEGETATION, region.vegetation, region) : null;
  const seaColor = paletteColor(SEA, region.sea ?? 'open', region);
  return { ...region, landColor, seaColor, color: landColor ?? seaColor };
});

// §1.4 gazetteer, with the matching landmark text from §3–§4. rank 1 labels are always shown,
// rank 2 labels only when zoomed in.
export const OBJECT_GROUPS = {
  tharsis: 'Continent B — Tharsis',
  vm: 'Valles Marineris',
  southern: 'Continent A — southern crescent',
  ocean: 'Oceanic features',
};

export const OBJECTS = [
  // --- Tharsis ---
  {
    id: 'ascraeus-mons', name: 'Ascraeus Mons', group: 'tharsis', rank: 1, lat: 11.8, lon: 255.5,
    elevation: '+16.2 km', notes: 'Permanent ice cap',
    description:
      'The tallest of the three Tharsis cones, with a permanent ice cap ~5 km thick. Ice at low gravity deforms ' +
      'slowly, so the cap is thick, sluggish and long-lived. Summit pressure at 16 km is 0.48 bar — equivalent to ' +
      'Earth’s 6.5 km. Its glacier melt feeds the plateau’s gallery forests.',
  },
  {
    id: 'pavonis-mons', name: 'Pavonis Mons', group: 'tharsis', rank: 1, lat: 0.8, lon: 247.0,
    elevation: '+12.0 km', notes: 'Marginal ice cap',
    description:
      'The lowest of the three cones, only just above the ~11 km snowline. Its ice cap is marginal — it appears and ' +
      'vanishes with obliquity cycles. Gap jets rush through the corridors on either side.',
  },
  {
    id: 'arsia-mons', name: 'Arsia Mons', group: 'tharsis', rank: 1, lat: -8.4, lon: 239.9,
    elevation: '+15.7 km', notes: 'Permanent ice cap',
    description:
      'A standalone shield with a permanent ice cap ~4.5 km thick. Each cone produces a windward rain crescent and a ' +
      'tapering lee wake. With Ascraeus it supplies the seasonal melt pulses that water the plateau.',
  },
  {
    id: 'alba-mons', name: 'Alba Mons', group: 'tharsis', rank: 1, lat: 40.5, lon: 250.4,
    elevation: '+4.8 km', notes: 'Broad low-angle shield',
    description:
      'A vast, extremely low-angle shield facing the northern ocean. Long, low-gradient radial river networks make it ' +
      'the best river country on the planet and the largest single forest by area — a uniform 60–100 m canopy with no giants.',
  },
  {
    id: 'syria-planum', name: 'Syria Planum', group: 'tharsis', rank: 2, lat: -12, lon: 256,
    elevation: '+4.0 km', notes: 'Plateau core',
    description:
      'The core of the Tharsis plateau: cold dry steppe at 0.78–0.83 bar and ~11 °C, under 100 mm of rain. Breathable, ' +
      'temperate and dry — the planet’s most habitable highland, threaded by glacier-fed gallery forest that dies into playas.',
  },
  {
    id: 'solis-planum', name: 'Solis Planum', group: 'tharsis', rank: 2, lat: -26, lon: 270,
    elevation: '+2 to +4 km', notes: 'Southern plateau',
    description:
      'The southern plateau of Tharsis, in the rain shadow of the eastern escarpment. It lies in the southern half of ' +
      'the cross-equatorial monsoon, which receives the violent version while southern summer falls at perihelion.',
  },
  {
    id: 'thaumasia', name: 'Thaumasia highlands', group: 'tharsis', rank: 2, lat: -40, lon: 295,
    elevation: '+2 to +5 km', notes: 'Southern rim',
    description: 'The southern rim of Tharsis, where the deflected trades form a permanent boundary jet offshore near 45°S.',
  },
  {
    id: 'daedalia-planum', name: 'Daedalia Planum', group: 'tharsis', rank: 2, lat: -20, lon: 235,
    elevation: '0 to +2 km', notes: 'Western lee',
    description: 'The western descent of Tharsis: an arid rain shadow sloping down to the dry Amazonis coast.',
  },
  {
    id: 'lunae-planum', name: 'Lunae Planum', group: 'tharsis', rank: 2, lat: 10, lon: 295,
    elevation: '+0.5 km', notes: 'Eastern coastal step',
    description:
      'The coastal step at the foot of the eastern escarpment: lowland rainforest with ~2,500 mm a year. Above it, ' +
      'cloud forest climbs the escarpment in stacked bands.',
  },
  {
    id: 'kasei-valles', name: 'Kasei Valles', group: 'tharsis', rank: 2, lat: 25, lon: 300,
    elevation: 'below 0', notes: 'Drowned outflow channel',
    description: 'A great outflow channel, now drowned, cutting into the northeastern flank of Tharsis.',
  },
  // --- Valles Marineris ---
  {
    id: 'valles-marineris', name: 'Valles Marineris', group: 'vm', rank: 1, lat: -14, lon: 301,
    elevation: '−7.0 km floor', notes: '4,000 km flooded sound',
    description:
      'The most important single feature on the planet. A 4,000 km sound, 100–200 km wide, with walls 3–5 km above the ' +
      'water. Trade air funnelled up the channel makes it the wettest place on the planet. Floor pressure is 260 bar — ' +
      'what an Earth diver meets at 2.6 km — so air-breathing divers commute to the floor. Its cliffs give permanent ' +
      'ridge lift to 20 m-span soarers.',
  },
  {
    id: 'ius-chasma', name: 'Ius Chasma', group: 'vm', rank: 2, lat: -7, lon: 275,
    elevation: '−6 km', notes: 'Western head',
    description:
      'The dead-end western head of the sound, under a permanent rain wall. It holds the only quiet, stable, ' +
      'fine-grained delta anywhere — the one place on the planet with a sheltered river mouth.',
  },
  {
    id: 'melas-chasma', name: 'Melas Chasma', group: 'vm', rank: 2, lat: -9.8, lon: 283.6,
    elevation: '−7 km', notes: 'Widest side basin',
    description:
      'The widest side basin. Sheltered, dead calm, permanently misted and warm: 300 m forest, gliding vertebrates, ' +
      'and sky-nets strung between the 4 km walls.',
  },
  {
    id: 'candor-chasma', name: 'Candor Chasma', group: 'vm', rank: 2, lat: -6.5, lon: 288.5,
    elevation: '−6 km', notes: 'Sheltered side basin',
    description:
      'A sheltered side basin with maximum shelter, moisture and warmth. One of four chasmata where sessile ambush ' +
      'organisms string catenary nets hundreds of metres across — aerial reefs visible from orbit.',
  },
  {
    id: 'ophir-chasma', name: 'Ophir Chasma', group: 'vm', rank: 2, lat: -4, lon: 288,
    elevation: '−6 km', notes: 'Sheltered side basin',
    description: 'A sheltered, fog-fed side basin: 300 m forest, stilt-waders 60–80 m tall and sky-nets.',
  },
  {
    id: 'hebes-chasma', name: 'Hebes Chasma', group: 'vm', rank: 2, lat: -1, lon: 283,
    elevation: '−5 km', notes: 'Enclosed basin',
    description: 'An enclosed basin north of the main sound, dead calm and misted; one of the four sky-net chasmata.',
  },
  {
    id: 'coprates-chasma', name: 'Coprates Chasma', group: 'vm', rank: 2, lat: -13, lon: 300,
    elevation: '−7 km', notes: 'Main trunk',
    description: 'The main trunk of the sound. Windy, because the trades funnel along it; the inner walls get continuous rain.',
  },
  {
    id: 'eos-capri-chasma', name: 'Eos / Capri Chasma', group: 'vm', rank: 2, lat: -13, lon: 318,
    elevation: '−5 km', notes: 'Eastern mouth',
    description: 'The eastern mouth, where the sound opens through Eos and Capri Chasmata into Chryse and the northern ocean.',
  },
  // --- Continent A ---
  {
    id: 'terra-cimmeria', name: 'Terra Cimmeria', group: 'southern', rank: 1, lat: -34, lon: 145,
    elevation: '0 to +1.5 km', notes: 'Cratered plain',
    description:
      'Heavily cratered plain with beaded drainage: chains of crater lakes linked by short, steep spillway gorges. ' +
      'Crater ring forests — 150 m canopy in every bowl, scrub on every rim. A species pump on a 25,500-year cycle.',
  },
  {
    id: 'terra-sirenum', name: 'Terra Sirenum', group: 'southern', rank: 1, lat: -39.7, lon: 210,
    elevation: '0 to +1.5 km', notes: 'Cratered plain',
    description:
      'Cratered plain of savanna and crater ring forests with 30–150 m canopy along its coasts. Turgor giants — ' +
      'boneless animals the size of a bus — flow across the southern savanna.',
  },
  {
    id: 'aonia-terra', name: 'Aonia Terra', group: 'southern', rank: 2, lat: -60, lon: 260,
    elevation: '0 to +1.5 km', notes: 'Storm-belt uplands',
    description: 'Uplands on the southern storm coast: westerlies, giant cyclones and dense, low temperate rainforest.',
  },
  {
    id: 'noachis-terra', name: 'Noachis Terra', group: 'southern', rank: 2, lat: -45, lon: 350,
    elevation: '−1 to 0 km', notes: 'Mostly drowned, islands',
    description: 'Mostly drowned at this sea level; its higher parts survive as islands in the subsidence belt.',
  },
  {
    id: 'margaritifer-terra', name: 'Margaritifer Terra', group: 'southern', rank: 2, lat: -5, lon: 335,
    elevation: '0 to +1 km', notes: 'Northern lobe',
    description: 'The northern lobe of Continent A, next to the eastern mouth of Valles Marineris and the Uzboi–Ladon inlet.',
  },
  {
    id: 'hesperia-planum', name: 'Hesperia Planum', group: 'southern', rank: 1, lat: -20, lon: 110,
    elevation: '~0 km', notes: 'Sabkha wetland',
    description:
      'One of the two flattest surfaces on the planet. 25 m storm surges run hundreds of km inland, and 2.6× capillary ' +
      'rise keeps the salt in: permanent sabkha, damp saline crusts at 25 °C and 60% humidity supporting nothing.',
  },
  {
    id: 'planum-australe', name: 'Planum Australe', group: 'southern', rank: 1, lat: -83, lon: 160,
    elevation: '+0.5 to +1.5 km', notes: 'South polar ice cap',
    description:
      'The only permanent land ice on the planet. Maritime, not polar desert: around −6 °C, wet-based, heavy snowfall, ' +
      'fast outlet glaciers calving icebergs. Currently melting and retreating with southern summer at perihelion.',
  },
  {
    id: 'hellas-planitia', name: 'Hellas Planitia', group: 'southern', rank: 1, lat: -42.4, lon: 70.5,
    elevation: '−10.2 km floor', notes: 'Deep gulf, 2,300 km',
    description:
      'The deepest point on the planet. A broad gulf in the 45–60° subsidence belt, joined to the ocean near Dao Vallis. ' +
      'Euxinic below ~500 m. Its shores are arid, 10–15 K warmer than the highlands, with coastal fog and sabkha belts.',
  },
  {
    id: 'dao-vallis', name: 'Dao Vallis', group: 'southern', rank: 2, lat: -33, lon: 92,
    elevation: 'strait', notes: 'Hellas NE connection',
    description: 'The strait through the degraded northeastern rim of Hellas — its only connection to the ocean.',
  },
  {
    id: 'argyre-planitia', name: 'Argyre Planitia', group: 'southern', rank: 1, lat: -49.7, lon: 316,
    elevation: '−7.2 km floor', notes: 'Deep gulf, 800 km',
    description:
      'An 800 km gulf joined northward through the Uzboi–Ladon–Margaritifer corridor into a 2,000 km fjord-like inlet. ' +
      'Stratified like Hellas at a smaller scale.',
  },
  {
    id: 'uzboi-ladon', name: 'Uzboi–Ladon corridor', group: 'southern', rank: 2, lat: -27, lon: 327,
    elevation: 'strait', notes: 'Argyre N connection',
    description: 'The northern strait of Argyre: a long fjord-like corridor through the southern highlands.',
  },
  {
    id: 'hadriacus-mons', name: 'Hadriacus Mons', group: 'southern', rank: 2, lat: -30.6, lon: 93,
    elevation: '~+0.3 km', notes: 'Coastal volcano',
    description: 'A low coastal volcano on the northeastern rim of Hellas, near the Dao Vallis strait.',
  },
  {
    id: 'tyrrhenus-mons', name: 'Tyrrhenus Mons', group: 'southern', rank: 2, lat: -21.4, lon: 106.5,
    elevation: '~+0.2 km', notes: 'Coastal volcano',
    description: 'A low coastal volcano at the edge of the Hesperia Planum sabkha.',
  },
  // --- Ocean ---
  {
    id: 'olympus-mons', name: 'Olympus Mons', group: 'ocean', rank: 1, lat: 18.65, lon: 226.2,
    elevation: '+19.2 km', notes: 'Island volcano, highest point',
    description:
      'The highest point on the planet, and an island ~600 km across. Summit pressure 0.35 bar. Not especially wet — ' +
      'its air has crossed Tharsis first — so the lower flanks carry 40–90 m forest. A permanent tropical ice cap ~8 km ' +
      'thick sits above 11 km, and its ~2,000 km cloud-free wake spins up its own ocean countercurrent.',
  },
  {
    id: 'elysium-mons', name: 'Elysium Mons', group: 'ocean', rank: 1, lat: 25.0, lon: 147.2,
    elevation: '+12.1 km', notes: 'Second island volcano',
    description:
      'An island volcano in clean oceanic trade flow. Its eastern flank is very wet, with forest from sea level to 6 km ' +
      'and 100–200 m giant endemics; marginal ice cap near the summit. One of the only two nesting sites in the northern ocean.',
  },
  {
    id: 'vastitas-borealis', name: 'Vastitas Borealis', group: 'ocean', rank: 1, lat: 70, lon: 20,
    elevation: '−5 to −7 km', notes: 'North polar ocean basin (all longitudes)',
    description:
      'The north polar ocean. A circumpolar current can isolate the pole: perennial sea ice in the core, seasonal ice to ' +
      '~70°N, and no land ice at all.',
  },
  {
    id: 'utopia-planitia', name: 'Utopia Planitia', group: 'ocean', rank: 2, lat: 46.7, lon: 117.5,
    elevation: '−6 km', notes: 'Deep ocean',
    description: 'Deep ocean under the northern subsidence belt: clear, calm and high-evaporation.',
  },
  {
    id: 'acidalia-planitia', name: 'Acidalia Planitia', group: 'ocean', rank: 2, lat: 50, lon: 339,
    elevation: '−6 km', notes: 'Deep ocean',
    description: 'Deep ocean in the 45–60°N subsidence zone — the salinity maximum of the planet.',
  },
  {
    id: 'amazonis-planitia', name: 'Amazonis Planitia', group: 'ocean', rank: 2, lat: 24.8, lon: 196,
    elevation: '−6 km', notes: 'Deep ocean, lee zone',
    description: 'Deep ocean in the lee of Tharsis: dry coasts, a salinity maximum, and the Olympus wake.',
  },
  {
    id: 'chryse-planitia', name: 'Chryse Planitia', group: 'ocean', rank: 2, lat: 28, lon: 320,
    elevation: '−5 km', notes: 'Ocean, VM approaches',
    description: 'The ocean approaches to Valles Marineris, receiving the sound through Eos and Capri Chasmata.',
  },
  {
    id: 'isidis-planitia', name: 'Isidis Planitia', group: 'ocean', rank: 2, lat: 12.9, lon: 87,
    elevation: '−5 km', notes: 'Ocean',
    description: 'Open ocean on the northern edge of the equatorial wet belt.',
  },
  {
    id: 'elysium-planitia', name: 'Elysium Planitia', group: 'ocean', rank: 2, lat: 3, lon: 154.7,
    elevation: '−5 km', notes: 'Ocean',
    description: 'Equatorial ocean south of Elysium Mons.',
  },
  {
    id: 'arabia-shallows', name: 'Arabia Terra shallows', group: 'ocean', rank: 1, lat: 21, lon: 6,
    elevation: '−1.5 to −0.5 km', notes: 'Shallow sea, archipelago',
    description:
      'A shallow sea and archipelago, one of the two flattest surfaces on the planet. Storm surge reaches hundreds of km ' +
      'inland and low islands are permanent sabkha.',
  },
  {
    id: 'syrtis-major', name: 'Syrtis Major', group: 'ocean', rank: 2, lat: 8, lon: 70,
    elevation: '−0.5 km', notes: 'Submerged volcanic platform',
    description: 'A submerged volcanic platform in the equatorial ocean.',
  },
];
