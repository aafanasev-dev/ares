// Biomes: a hand transcription of biomes.md, the way geography.js transcribes planet_geography.md.
// When a biome in biomes.md changes, update this file (and its prompt in gen_bioms/).
//
// A biome is a refinement of what classify() already computes: region x altitude band x coast/depth. Every entry
// names a `region` (an id from REGION_DATA), a `belt` (a LATITUDE_ZONES id) for the biomes biomes.md marks
// "(unnamed)", or both: either one matching is enough, so a biome with both is found by its region shape where that
// applies and by its belt everywhere else. Order matters, exactly like REGIONS: the first match wins, so specific
// entries come before broad ones, which is what makes every point on the planet resolve to a biome.
//
// Fields:
//   code, name, group   'land' | 'sea' | 'fresh' | 'air'
//   region, belt        where it sits; a region id, a belt id, or null for the cross-cutting ones
//   alt                 [min, max] metres above sea level, land only (null = any). The last biome of a region
//                       leaves it out, so the region is tiled with no gap at the band edges
//   depth               [min, max] metres below sea level, water only (null = any)
//   absLat, lon         [min, max] degrees, for the few biomes placed by neither a region nor a belt
//   coast               'coast' | 'interior' | null. Coast means within COAST_KM of the sea (biomes.md 1.1)
//   surface             a VEGETATION or SEA key; with `shade` it gives the colour on the map
//   wind                {speed: [min, max] m/s, text}. Waves follow from the speed (biomes.md 1.1)
//   azonal              true for the patches biomes.md 7 says cannot be drawn: never on the map, listed in the
//                       panel as "also here" when `applies` says so
import { SEA, VEGETATION } from './geography.js';

export const COAST_KM = 250; // biomes.md: "coast" means within 250 km of the sea

export const BIOME_GROUPS = {
  land: 'Land',
  sea: 'Sea',
  fresh: 'Fresh water',
  air: 'Air',
};

// Lighten (positive) or darken (negative) a palette colour, so biomes sharing one key stay apart on the map.
function shadeHex(hex, amount = 0) {
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const mixed = rgb.map((v) => (amount >= 0 ? v + (255 - v) * amount : v * (1 + amount)));
  return `#${mixed.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;
}

const BIOME_DATA = [
  // --- 3.1 Tharsis: the windward east ------------------------------------
  {
    code: 'L03', name: 'Upper escarpment cloud forest', group: 'land',
    region: 'east-escarpment', alt: [2500, 5500], surface: 'rainforest', shade: 0.22,
    wind: { speed: [8, 14], text: 'Gusty at the rim' },
    summary: 'Cloud forest on the upper wall, ending abruptly at the plateau rim.',
    place: 'The upper eastern wall of Tharsis, 2.5–5.5 km, up to the plateau rim.',
    vegetation: 'Cloud forest thinning with height: 60–100 m in the gorges, dwarf moss forest and scrub on the ' +
      'ridges. It ends abruptly at the rim, where the plateau rain shadow begins. Soarers ride the ridge lift.',
    daily: 'Daily range 5–6 K; cloud damps it. Dawn is often briefly clear and cloud is thickest in the afternoon.',
    seasons: 'Hardly any temperature season. The cloud base sinks and the rain doubles in the local monsoon.',
  },
  {
    code: 'L02', name: 'Lower escarpment rainforest', group: 'land',
    region: 'east-escarpment', alt: [800, 2500], surface: 'rainforest', shade: -0.05,
    wind: { speed: [7, 12], text: 'Trade winds forced upslope' },
    summary: 'Rainforest in stacked vertical bands on the first 2 km of the eastern wall.',
    place: 'The first 2 km of the eastern wall of Tharsis above the coastal step, ~28°N to ~48°S, including the ' +
      'wall tops above Valles Marineris.',
    vegetation: 'Giants of 150–250 m in the gorges, wind-pruned scrub on the interfluves a few hundred metres ' +
      'away. Heavy epiphyte loading; domino blowdowns leave even-aged mosaics tens of km across. Stilt-waders ' +
      '60–80 m tall browse the gorge forests.',
    daily: 'Cloud forms in late morning and climbs the wall; rain peaks from afternoon to evening. At night cold ' +
      'air drains down the gorges and mist fills them by dawn.',
    seasons: 'Wet all year. The southern half takes the violent perihelion pulse, the northern a milder one.',
  },
  {
    code: 'L01', name: 'Lunae coastal rainforest', group: 'land',
    region: 'lunae-coast', alt: [0, 800], surface: 'rainforest',
    wind: { speed: [6, 9], text: 'Onshore easterly trades' },
    summary: 'The low coastal step at the windward foot of Tharsis, facing Chryse.',
    place: 'Centred on Lunae Planum (10°N 295°E), running south past the mouth of the sound. Almost all of it ' +
      'lies within 250 km of the sea.',
    vegetation: 'Lowland rainforest; giant trees only in sheltered valleys, the seaward edge wind-pruned. Rivers ' +
      'end in wave-built, cuspate mouths. Gliders and climbers rule the canopy.',
    daily: 'Mornings are fair. Cloud piles against the escarpment by midday and heavy downpours fall at 13–19 h. ' +
      'The afternoon sea breeze adds to the trades.',
    seasons: 'Evergreen. A weak double rain peak near the equator; south of 12°S the hot perihelion summer is ' +
      'wettest, and its storms surge over the lowest flats.',
  },

  // --- 3.2 Tharsis: the plateau and the cones ----------------------------
  {
    code: 'L10', name: 'Cone ice caps', group: 'land',
    region: 'tharsis-cones', alt: [11000, null], surface: 'ice',
    wind: { speed: [8, 16], text: 'Katabatic winds off the caps' },
    summary: 'The permanent caps of Ascraeus and Arsia, ~5 and ~4.5 km thick.',
    place: 'Ascraeus (+16.2 km) and Arsia (+15.7 km) carry permanent caps; Pavonis (+12.0 km) holds only a ' +
      'marginal one, which appears and vanishes over obliquity cycles.',
    vegetation: 'None, apart from microbial life at the melting edges.',
    daily: 'Surface melt only around noon, and only at the lower margin.',
    seasons: 'Melt in the warm season feeds the plateau rivers (L06). The caps themselves change only over ' +
      'thousands of years.',
  },
  {
    code: 'L09', name: 'Cone alpine desert', group: 'land',
    region: 'tharsis-cones', alt: [7000, 11000], surface: 'alpine',
    wind: { speed: [10, 18], text: 'Strong, splitting around the cones' },
    summary: 'Bare lava and scree between the treeline and the snowline.',
    place: 'Ascraeus, Pavonis and Arsia Mons between the treeline (~7 km) and the snowline (~11 km).',
    vegetation: 'Low scrub and cushion plants, then bare lava and scree. Only a few hardy grazers; soaring flyers ' +
      'pass overhead at 10–15 km, which is ordinary here.',
    daily: 'Daily range 15–20 K: strong sun by day and frost almost every night. Winds blow upslope in the ' +
      'afternoon and downslope at night.',
    seasons: 'The snow line creeps down in the cool season and retreats in the warm season.',
  },
  {
    code: 'L08', name: 'Cone rain-crescent forest', group: 'land',
    region: 'tharsis-cones', alt: [4000, 7000], surface: 'forest', shade: 0.1, azonal: true,
    wind: { speed: [6, 12], text: 'Trade flow banked against the windward flank (est.)' },
    summary: 'A montane forest crescent on the windward flank of each cone.',
    place: 'The windward (east) flanks of Ascraeus, Pavonis and Arsia, ~4 km to the treeline at ~7 km. Each cone ' +
      'has one crescent; the lee side trails a dry wake instead.',
    vegetation: 'Montane forest 20–60 m tall, shrinking to krummholz at the treeline. Meltwater streams run ' +
      'through it and flyers nest on the lava cliffs.',
    daily: 'A cloud cap forms on the windward flank by midday; at night cold katabatic winds drain off the ice.',
    seasons: 'Cloud and rain are strongest in the monsoon. Snow reaches the upper forest in the cool season.',
  },
  {
    code: 'L07', name: 'Gap-jet dune corridors', group: 'land',
    region: 'gap-jets', surface: 'dunes',
    wind: { speed: [15, 30], text: 'Permanently accelerated gap jets (est.)' },
    summary: 'Scoured rock and 500 m star dunes under a permanent jet.',
    place: 'The two gaps between the three cones, ~700 km apart: Ascraeus–Pavonis near 6°N 251°E and ' +
      'Pavonis–Arsia near 4°S 243°E, both at +4 to +5 km.',
    vegetation: 'Almost barren: scoured rock pavement and star dunes up to 500 m high at 15 km spacing. Only low, ' +
      'burrowing animals and scavengers of wind-blown debris. Flyers either avoid the jets or ride them.',
    daily: 'Daily range 10–12 K; the wind mixes the air. The jets blow hardest in the afternoon and sand moves by day.',
    seasons: 'The jets never stop; their strength shifts with the monsoon reversal.',
  },
  {
    code: 'L06', name: 'Glacier-river gallery forest and playas', group: 'land',
    region: 'tharsis-plateau', alt: [2000, 6000], surface: 'forest', shade: -0.12, azonal: true,
    wind: { speed: [3, 7], text: 'Light along the valley; cold air drains at night (est.)' },
    summary: 'Ribbons of gallery forest along the glacier-fed rivers, dying into playas.',
    place: 'Ribbons along the rivers fed by the Ascraeus and Arsia glaciers. They thread across L04 and L05 and ' +
      'die into playas.',
    vegetation: 'Gallery forest 20–60 m tall, only along the water. Reed beds and salt-tolerant scrub fringe the ' +
      'playas; playa floors are bare salt. The densest animal life on the plateau, with predators waiting at the ' +
      'water, since ambush is the only strategy that works at 0.38 g traction.',
    daily: 'Melt-fed rivers rise in the afternoon, a few hours after peak melt, and fall at night. Valley fog at dawn.',
    seasons: 'Flow peaks in the warm season; the playas fill, then shrink and crust over. When a melt pulse fails ' +
      'the gallery trees drop their leaves: drought, not frost, is the trigger.',
  },
  {
    code: 'L05', name: 'Plateau core cold steppe', group: 'land',
    region: 'tharsis-plateau', alt: [3000, 6000], surface: 'steppe',
    wind: { speed: [4, 9], text: 'Moderate, strongest near the gap jets' },
    summary: 'The driest place on the planet: a pleasant, breathable Tibet.',
    place: 'Syria and Solis Planum and the high plateau between the cones and the southern rim, +3 to +6 km, from ' +
      '~25°N to ~43°S. The largest biome on Tharsis.',
    vegetation: 'Cold, dry steppe of bunch grasses and cushion plants 0.2–1 m tall over gravel and playas. Slow, ' +
      'long-legged grazers spread over the steppe; broad, very tall thermals carry soaring flyers.',
    daily: 'Daily range 14–18 K in thin, clear air: nights near 3–5 °C, afternoons near 18–22 °C. Thermals and ' +
      'dust devils by late morning, and almost no dew.',
    seasons: 'Rain hardly changes the landscape. The season arrives as water: glacier-melt pulses from Ascraeus ' +
      'and Arsia fill the rivers and playas, which then dry to salt.',
  },
  {
    code: 'L04', name: 'Plateau-margin monsoon savanna', group: 'land',
    region: 'tharsis-plateau', surface: 'savanna',
    wind: { speed: [5, 11], text: 'Gusty trades spilling around the plateau' },
    summary: 'Savanna grading into steppe on the outer ring of the plateau.',
    place: 'The outer ring of the Tharsis plateau, 1.5–3 km, where it steps down from the core toward the coasts.',
    vegetation: 'Grasses 3–8 m tall with scattered flat-crowned, buttressed trees. Bare in the dry season, green ' +
      'within days of the first rains. Grazers move between the margin and the river corridors (L06). Dust ' +
      'devils 5–10 km tall.',
    daily: 'Daily range 12–15 K: cool, clear dawns and hot, bright afternoons. In the wet season storms build ' +
      'over the rim and pour down at 13–19 h.',
    seasons: 'Extreme wet/dry. The landscape goes brown to green, never green to gold.',
  },

  // --- 3.3 Tharsis: the lee west and the north ---------------------------
  {
    // The lee counterpart of L08, and azonal for the same reason: both are windward/lee halves of ground the
    // tharsis-cones and daedalia-lee region shapes already own, and neither split exists in the geometry.
    code: 'L11', name: 'Tharsis western flank scrub', group: 'land',
    region: null, belt: 'trade-s', alt: [2500, 8000], surface: 'open-forest', shade: -0.1, azonal: true,
    wind: { speed: [5, 12], text: 'Descending, drying (föhn) winds off the cones' },
    summary: 'Dry montane scrub in the wakes behind the cones.',
    place: 'The western (lee) slopes of Arsia and Pavonis and the high edge of Daedalia: 230–250°E, ~10°N to ' +
      '~30°S, 2.5–8 km.',
    vegetation: 'Dry montane scrub with open woodland in the gullies, and bare lava flows between.',
    daily: 'Daily range 14–18 K. Warm, dry afternoons under the downslope wind; cold, clear nights.',
    seasons: 'The monsoon brings a few showers. The southern part has the sharper perihelion summer.',
  },
  {
    code: 'L12', name: 'Daedalia inland desert', group: 'land',
    region: 'daedalia-lee', alt: [500, 2500], surface: 'desert',
    wind: { speed: [5, 10], text: 'Dry, descending easterlies that have already crossed the plateau' },
    summary: 'Arid rain-shadow scrub and lee dune fields.',
    place: 'Daedalia Planum and the western descent of Tharsis away from the sea: 214–245°E, 16°N to 52°S, ' +
      '0.5–2.5 km.',
    vegetation: 'Arid rain-shadow scrub and desert: succulents, thorn shrubs and lee dune fields.',
    daily: 'Daily range 13–15 K. Hot, bright afternoons; clear, cold nights; dust plumes on windy days.',
    seasons: 'Rain comes in a few storms during the local wet season. South of 12°S the summer is short and sharp.',
  },
  {
    code: 'L13', name: 'Amazonis dry coast', group: 'land',
    region: 'daedalia-lee', alt: [0, 500], surface: 'desert', shade: 0.12,
    wind: { speed: [4, 8], text: 'A dry offshore easterly against a weak afternoon sea breeze' },
    summary: 'Dry coastal scrub facing the saline Amazonis lee sea.',
    place: 'The west coast of Tharsis facing Amazonis Planitia, ~16°N to ~50°S, 0–0.5 km.',
    vegetation: 'Dry coastal scrub, thorn woodland in the stream mouths and salt-tolerant strand plants. There is ' +
      'no coastal fog desert: that needs cold upwelling under subsiding air, and there is none here.',
    daily: 'Daily range 8–10 K. Offshore wind at night and in the morning; a sea breeze in the afternoon.',
    seasons: 'Dry for most of the year, with a brief wet season.',
  },
  {
    code: 'L14', name: 'North-west Tharsis lee coast', group: 'land',
    // No alt cap: this is the only land biome of the northern trade belt, so it also takes the high ground on
    // north-east Tharsis that falls outside every region shape.
    region: null, belt: 'trade-n', surface: 'open-forest',
    wind: { speed: [6, 9], text: 'Trade easterlies wrapping the northern tip of Tharsis (est.)' },
    summary: 'Drought-deciduous forest and savanna woodland facing the Olympus strait.',
    place: 'The low north-western slopes of Tharsis between Olympus and Ascraeus: 240–260°E, 10–30°N, 0–2 km.',
    vegetation: 'Drought-deciduous forest and savanna woodland, giving way to rainforest in wet valleys. The ' +
      'Pavonis River is the main evergreen corridor through it (R03).',
    daily: 'Daily range 9 K, with showers in the afternoon during the wet season.',
    seasons: 'Mild. The wet season falls in the long, mild northern summer; trees drop their leaves in the dry.',
  },
  {
    code: 'L16', name: 'Alba upland forest', group: 'land',
    region: 'alba-forest', alt: [2500, 4600], surface: 'forest', shade: -0.14,
    wind: { speed: [7, 12], text: 'Stronger than on the coast' },
    summary: 'The same uniform forest, lower, over the broad upper shield.',
    place: 'The broad upper shield of Alba Mons, 2.5–4.6 km.',
    vegetation: 'Uniform forest 40–70 m tall, with headwater bogs and open woodland and heath around the summit ' +
      'caldera.',
    daily: 'Daily range 9–11 K, with frost on clear winter nights.',
    seasons: 'A mild season, with light snow in the short northern winter.',
  },
  {
    code: 'L15', name: 'Alba coastal river forest', group: 'land',
    region: 'alba-forest', surface: 'forest',
    wind: { speed: [5, 10], text: 'Maritime air from the northern ocean; the north shore takes the 45°N jet' },
    summary: 'The largest single forest by area, and the best river country on the planet.',
    place: 'The lower slopes and coasts of Alba Mons: 29–46°N, ~230–270°E, 0–2.5 km.',
    vegetation: 'A uniform 60–100 m canopy with no giants, because nothing is sheltered. Long, radial, dendritic ' +
      'river networks; the rivers are braided, turbid and 1.6× wider than on Earth for the same discharge. ' +
      'River-corridor animals and fish-eaters.',
    daily: 'Daily range 7–9 K. River fog in the morning; a sea breeze in the afternoon.',
    seasons: 'A long, mild summer and a short, mild winter. Windthrow after rare storms from the boundary jet ' +
      'leaves patches of even-aged regrowth.',
  },

  // --- 3.4 Valles Marineris ----------------------------------------------
  {
    code: 'L17', name: 'Side-chasma cathedral forest', group: 'land',
    region: 'vm-side-chasmata', alt: [0, 1500], surface: 'rainforest', shade: -0.18,
    wind: { speed: [0, 1], text: 'Dead calm' },
    summary: 'The tallest forest on the planet, and the only home of the sky-nets.',
    place: 'The lower walls and floors (up to 1.5 km) of Melas, Candor, Ophir and Hebes Chasmata, at 1–11°S.',
    vegetation: 'A 300 m canopy on trunks 12 m across, a very dark floor and heavy epiphytes. Gliders dominate; ' +
      'stilt-waders 60–80 m tall. Sky-nets string catenary nets hundreds of metres across between the 4 km walls ' +
      'and harvest soarers and drifting mats. They live here and nowhere else.',
    daily: 'Daily range 3–5 K. The mist thins at midday but never clears, and no wind breaks the nets.',
    seasons: 'Almost none. The double ITCZ rain peak is felt only as heavier drip.',
  },
  {
    code: 'L19', name: 'Ius head delta and rain wall', group: 'land',
    region: 'vm-sound', alt: [0, 1000], surface: 'rainforest', shade: 0.3, azonal: true,
    wind: { speed: [6, 12], text: 'The trades pile up here with nowhere to go but up' },
    summary: 'The planet’s only quiet, stable, fine-grained delta, under a permanent rain wall.',
    place: 'The western dead end of the sound at Ius Chasma (7°S 275°E) and its delta.',
    vegetation: 'Swamp forest on soft mud, reed beds and floating mats, with distributary channels that hold ' +
      'their courses. A nursery for the sound’s fish and divers.',
    daily: 'Continuous cloud; rain heaviest in the afternoon.',
    seasons: 'No season to speak of. River floods follow the two rain peaks.',
  },
  {
    code: 'L18', name: 'Sound wall rainforest', group: 'land',
    region: 'vm-sound', alt: [0, 1500], surface: 'rainforest', shade: 0.08,
    wind: { speed: [8, 15], text: 'Windy, as the trades are funnelled along the axis' },
    summary: 'The wettest land on the planet, on the inner walls of the 4,000 km sound.',
    place: 'The inner walls of the sound, up to 1.5 km, from the western chasmata to Eos and Capri Chasmata: ' +
      '3–16°S, 266–320°E.',
    vegetation: 'Rain-fed forest with giants in the side gorges and wind-pruned scrub on the spurs facing the ' +
      'axial wind. Cliff-nesting soarers with 20 m wingspans ride the permanent ridge lift, almost never flap, ' +
      'and range the whole sound and out over the ocean.',
    daily: 'Daily range 6–8 K. The wind rises as the land heats; afternoon rain grows heavier westward.',
    seasons: 'Evergreen, with a double rain peak. Wind and rain are strongest when the trades are strongest.',
  },

  // --- 3.5 The island volcanoes ------------------------------------------
  {
    code: 'L22', name: 'Olympus summit ice cap', group: 'land',
    region: 'olympus', alt: [10000, null], surface: 'ice', shade: -0.04,
    wind: { speed: [12, 25], text: 'Thin, fast air over the summit (est.)' },
    summary: 'A permanent tropical ice cap spanning ~8 km of height, on the highest point of the planet.',
    place: 'Above ~10 km up to the summit at +19.2 km.',
    vegetation: 'None.',
    daily: 'Surface melt only at the lower edge, around noon.',
    seasons: 'No real season. Downwind the mountain throws a cloud-free wake ~2,000 km long with a von Kármán ' +
      'vortex street (S03).',
  },
  {
    code: 'L21', name: 'Olympus alpine desert', group: 'land',
    region: 'olympus', alt: [6000, 10000], surface: 'alpine', shade: -0.08,
    wind: { speed: [10, 18], text: 'Strong, splitting around the mountain (est.)' },
    summary: 'Scrub, then bare lava fields and cinder slopes.',
    place: 'Olympus Mons between the treeline (~6 km) and the snowline (~10 km).',
    vegetation: 'Scrub, then bare lava fields and cinder slopes.',
    daily: 'Daily range 15–20 K, with frost on most nights.',
    seasons: 'The snow line moves up and down with the seasons.',
  },
  {
    code: 'L20', name: 'Olympus flank forest', group: 'land',
    region: 'olympus', alt: [0, 6000], surface: 'forest', shade: 0.06,
    wind: { speed: [6, 10], text: 'Maritime trades on the east flank (est.)' },
    summary: 'Moderate forest with glaciers descending into it, and one of two northern nesting sites.',
    place: 'The lower flanks of Olympus Mons island (18.65°N 226.2°E, base ~600 km across), sea level to ~6 km.',
    vegetation: 'Moderate forest 40–90 m tall rather than rainforest, with glaciers descending into it. Huge ' +
      'cliff colonies of pelagic soarers and a set of island endemics: one of only two nesting sites in the ' +
      'northern ocean.',
    daily: 'Daily range 9 K. Cloud builds on the east flank by midday; cold air drains off the ice at night.',
    seasons: 'Mild. The nesting colonies are largest in the long northern summer.',
  },
  {
    code: 'L25', name: 'Elysium summit', group: 'land',
    region: 'elysium', alt: [6000, null], surface: 'alpine', shade: 0.1,
    wind: { speed: [10, 20], text: 'Strong over the summit (est.)' },
    summary: 'Alpine scrub and bare rock, then a marginal ice cap.',
    place: 'Elysium Mons above ~6 km, up to +12.1 km.',
    vegetation: 'Alpine scrub and bare rock, then a marginal ice cap near the summit.',
    daily: 'Frost most nights.',
    seasons: 'The cap grows and shrinks from season to season.',
  },
  {
    code: 'L24', name: 'Elysium lee savanna', group: 'land',
    // Lee vs windward is a longitude split around the 147.2°E summit, not a distance from the sea: on an island
    // 600 km across nothing is more than 250 km from water, so a coast test can never separate the two flanks.
    region: 'elysium', alt: [0, 3000], lon: [130, 147], surface: 'savanna', shade: -0.08,
    wind: { speed: [4, 8], text: 'Sheltered lee flow (est.)' },
    summary: 'Savanna on the lee flank, brown in the dry season.',
    place: 'The western (lee) flank and coast of Elysium Mons, 0–3 km.',
    vegetation: 'Savanna with 5–8 m grasses and scattered flat-crowned trees.',
    daily: 'Daily range 10–12 K: hot afternoons and clear nights.',
    seasons: 'Brown in the dry season, green within days of the first rain.',
  },
  {
    code: 'L23', name: 'Elysium windward rainforest', group: 'land',
    region: 'elysium', alt: [0, 6000], surface: 'rainforest', shade: 0.14,
    wind: { speed: [6, 10], text: 'Clean oceanic trade flow (est.)' },
    summary: 'Species-poor forest with giant endemics, from sea level to 6 km.',
    place: 'The eastern flank of Elysium Mons island (25.0°N 147.2°E), sea level to 6 km, in clean oceanic trades.',
    vegetation: 'Forest from sea level to 6 km with a 100–200 m canopy. Species-poor, with giant endemics. Shares ' +
      'the northern nesting bottleneck with Olympus.',
    daily: 'Daily range 7–8 K. Orographic cloud by late morning; rain in the afternoon and evening.',
    seasons: 'Mild. The flank stays wet all year and is wettest in the northern wet season.',
  },

  // --- 3.6 The equatorial highland coast ---------------------------------
  {
    code: 'L26', name: 'Equatorial highland rainforest coast', group: 'land',
    region: null, belt: 'equatorial', surface: 'rainforest', shade: 0.04,
    wind: { speed: [2, 5], text: 'Convergent and light' },
    summary: 'Evergreen lowland rainforest on a cratered coast, under the thickest green haze.',
    place: 'Mainly the northern shore of the southern highlands between 30°E and 130°E, 0–12°S, facing Syrtis ' +
      'Major, Isidis and Elysium Planitia, plus small low patches on north-western Tharsis near 245°E.',
    vegetation: 'Evergreen lowland rainforest on a cratered coast, with crater lakes and heavy epiphytes. The ' +
      'richest insect-scale and aerial-grazer life of any coast, under the thickest green haze of A01.',
    daily: 'Daily range 8 K. Clear mornings; by afternoon storms 30–35 km tall, with anvils visible from 400 km ' +
      'away, giant hail inland and rain at 13–19 h.',
    seasons: 'No warm or cold season. The ITCZ spends most of the year overhead, so rain peaks twice.',
  },

  // --- 3.7 Continent A: the southern crescent ----------------------------
  {
    code: 'L29', name: 'Crater-bowl forest and beaded lakes', group: 'land',
    region: 'southern-savanna', alt: [0, 2500], surface: 'forest', shade: 0.18, azonal: true,
    wind: { speed: [0, 2], text: 'Near calm on the bowl floor' },
    summary: 'A 150 m canopy in every bowl, so the plain reads as a field of green discs.',
    place: 'Inside the impact craters of L27 and L28, and along the spillway gorges that link them.',
    vegetation: 'A 150 m canopy in every bowl, sharply bounded at the rim. Gallery forest along the gorges; ' +
      'crater lakes spill into each other through short, steep gorges with retreating knickpoints. A species ' +
      'pump: dwarf and giant variants of one lineage live in neighbouring craters, a single rim apart.',
    daily: 'Daily range 8–10 K. Cold air pools in the bowl at night; fog fills it at dawn and burns off by ' +
      'mid-morning.',
    seasons: 'In the wet season the chains flow and the lakes spill; in the dry they break into isolated pools.',
  },
  {
    code: 'L27', name: 'Wet eastern shore forest', group: 'land',
    region: 'southern-savanna', alt: [0, 1000], coast: 'coast', surface: 'forest', shade: 0.02,
    wind: { speed: [6, 9], text: 'Onshore easterlies' },
    summary: 'Among the most species-rich places on the planet, where the trades come in off the sea.',
    place: 'The east-facing (windward) coasts of Terra Cimmeria and Terra Sirenum and of the drowned-highland ' +
      'islands, 12–45°S: a strip tens to a few hundred km wide.',
    vegetation: 'Coastal forest with a 30–150 m canopy and freshwater crater lakes. Beaded drainage chains that ' +
      'reach the sea export salt, so these coasts stay fresh.',
    daily: 'Daily range 9–11 K. The sea breeze adds to the trades; storms come in the afternoon in the wet season.',
    seasons: 'Sharp. The short, hot perihelion summer is the wet season, with ~20 violent monsoon storms a year; ' +
      'in the long, cool, dry winter many trees drop their leaves.',
  },
  {
    code: 'L28', name: 'Crater-ring savanna', group: 'land',
    region: 'southern-savanna', surface: 'savanna', shade: -0.06,
    wind: { speed: [5, 9], text: 'Easterlies across the plain (est.)' },
    summary: 'The strongest seasonality on the planet: turgor giants and hundred-tonne browsers.',
    place: 'The interiors of Terra Cimmeria and Terra Sirenum, and the west-facing lee shores, 15–40°S, from sea ' +
      'level to ~2.5 km.',
    vegetation: 'Grasses 5–8 m tall; flat-crowned, heavily buttressed trees 40–80 m apart and knee-high scrub on ' +
      'every crater rim. Turgor giants: boneless land animals the size of a bus, pooling into low domes in the ' +
      'wind. Hundred-tonne browsers on thin legs. Dust devils 5–10 km tall. No sprinting predators.',
    daily: 'Daily range 12–15 K. No heavy dewfall and little morning fog despite the humidity; dust devils at ' +
      'midday and storms in late afternoon in the wet season.',
    seasons: 'The monsoon and perihelion are aligned, so the wet season is violent and the long dry season turns ' +
      'the plain brown; it greens within days of the first storm.',
  },
  {
    code: 'L30', name: 'Sabkha salt flats', group: 'land',
    region: 'hesperia-sabkha', alt: [0, 400], surface: 'salt',
    wind: { speed: [5, 9], text: 'Onshore trades over the flats (est.)' },
    summary: 'Nothing grows: a permanently damp salt crust re-salted by storm surges.',
    place: 'Hesperia Planum (20°S 110°E) and the low islands of the Arabia shallows (~20°N 15°E), within a metre ' +
      'or two of sea level.',
    vegetation: 'Nothing grows. Microbial mats live in the brine pools and flyers feed at the edges. Capillary ' +
      'rise is 2.6× Earth’s, keeping a 3–8 m wet fringe and a permanently damp crust.',
    daily: 'Daily range 6–9 K. A humid haze at noon; the crust stays damp even in sunshine.',
    seasons: 'Storm surges re-salt the flats, and the coastline drifts with the precession-driven sea level.',
  },
  {
    code: 'L31', name: 'Hellas warm arid shores', group: 'land',
    region: 'hellas-shores', alt: [0, 2000], surface: 'desert', shade: -0.06,
    wind: { speed: [2, 6], text: 'Weak and variable' },
    summary: 'Shores 10–15 K warmer than the highlands behind them, from air sinking into the basin.',
    place: 'The shores of the Hellas gulf (42.4°S 70.5°E): mostly the south-east rim at 90–110°E, 45–70°S, plus ' +
      'the northern rim.',
    vegetation: 'Fog-fed shrubs on the seaward slopes, succulents inland, and sabkha belts left by decadal surge ' +
      'floods.',
    daily: 'Daily range 12–15 K. Fog banks drift in off the gulf in the morning and burn off by late morning; ' +
      'afternoons are hot and calm.',
    seasons: 'A sharp thermal season. Rain is episodic, not seasonal.',
  },
  {
    code: 'L33', name: 'Salt-pan crater desert', group: 'land',
    // Closed crater basins, a patch inside L32 rather than a band of it: panel-only, like L29 and L06.
    region: 'subsidence-desert-s', alt: [0, 2500], surface: 'salt', shade: -0.1, azonal: true,
    wind: { speed: [3, 7], text: 'Weak and variable' },
    summary: 'The salt sink of Continent A: soda lakes and brine pools in closed basins.',
    place: 'The closed (endorheic) crater basins behind L32, where beaded drainage chains end without reaching ' +
      'the sea.',
    vegetation: 'Crater floors are salt pans, soda lakes and brine pools, surrounded by flood-adapted succulents. ' +
      'Brine specialists and filter feeders live on the soda lakes.',
    daily: 'Daily range 15 K or more. Bright, hot afternoons in summer; hard frost on winter nights.',
    seasons: 'A cloudburst fills a basin for weeks; evaporation then lays down a new layer of salt.',
  },
  {
    code: 'L32', name: 'Cool desert coast', group: 'land',
    region: 'subsidence-desert-s', surface: 'desert', shade: 0.06,
    wind: { speed: [2, 5], text: 'Weak and variable' },
    summary: 'Succulent scrub built for floods, not drizzle, under clear skies.',
    place: 'The coasts of the southern crescent in the 45–60°S subsidence belt: the drowned Noachis islands, and ' +
      'the shores north of Aonia Terra and around Argyre.',
    vegetation: 'Coastal succulent scrub and salt-tolerant strand. Plants are built for floods, not drizzle. ' +
      'There is no fog desert, because there is no cold upwelling.',
    daily: 'Daily range 10–12 K. Afternoon sea breeze; clear, cold nights with frost in winter.',
    seasons: 'A short, warm perihelion summer and a long, cold winter. Rain can come at any time.',
  },
  {
    code: 'L35', name: 'Fjord-head forest', group: 'land',
    region: 'storm-coast-s', alt: [0, 300], surface: 'forest', shade: -0.2, azonal: true,
    wind: { speed: [1, 4], text: 'Sheltered; the westerlies cannot reach' },
    summary: 'Giant trees where the shelter is genuine: the richest forest fauna of the far south.',
    place: 'The inner heads of the fjord-like inlets on the storm coast.',
    vegetation: 'Giant trees 60–150 m tall, epiphyte-draped and dark. The richest forest fauna of the far south.',
    daily: 'Mist at dawn; little wind at any hour.',
    seasons: 'As on the storm coast, but storms bring rain here rather than wind damage.',
  },
  {
    code: 'L36', name: 'Storm upland heath', group: 'land',
    region: 'storm-coast-s', alt: [600, null], surface: 'alpine', shade: 0.04,
    wind: { speed: [12, 22], text: 'Westerlies, stronger than on the coast (est.)' },
    summary: 'Heath, blanket bog and wind-cut krummholz above the treeline.',
    place: 'Storm-coast uplands above the treeline, from ~0.6 km upward.',
    vegetation: 'Heath, blanket bog and wind-cut krummholz.',
    daily: 'Daily range 5–7 K.',
    seasons: 'A snow cover in the long winter; boggy thaw in the short summer.',
  },
  {
    code: 'L34', name: 'Storm-coast temperate rainforest', group: 'land',
    region: 'storm-coast-s', alt: [0, 600], surface: 'forest', shade: -0.16,
    wind: { speed: [10, 20], text: 'Westerlies under the single jet, and three giant cyclones per hemisphere' },
    summary: 'Dense, low, wind-pruned temperate rainforest with blowdown mosaics.',
    place: 'Aonia Terra and the southern uplands at 60–72°S, below the treeline at ~0.6 km.',
    vegetation: 'Dense, low temperate rainforest 20–40 m tall, wind-pruned, with blowdown mosaics.',
    daily: 'Daily range 6 K. Weather systems matter more than the time of day. Poleward of 64.8° it is sunlit ' +
      'around the clock at the height of summer and dark at midwinter.',
    seasons: 'Moderate, alternating stormy and calm spells as the jet moves. Summer is short, winter long.',
  },

  // --- 3.8 The south pole ------------------------------------------------
  {
    code: 'L37', name: 'Sandur and krummholz margin', group: 'land',
    region: 'planum-australe', alt: [0, 500], surface: 'steppe', shade: -0.14, azonal: true,
    wind: { speed: [8, 18], text: 'Katabatic winds off the ice' },
    summary: 'Braided sandur plains and jökulhlaup channels; nothing here is ancient.',
    place: 'The ice-free fringe around Planum Australe, at ~72–74°S.',
    vegetation: 'Krummholz 1–4 m tall reaches to ~73°S. Braided sandur plains, jökulhlaup channels and ' +
      'exceptionally wide, shallow outwash. Life here is repeatedly wiped out and recolonised from lower ' +
      'latitudes; nothing is ancient.',
    daily: 'The sun circles low in summer; winter brings long polar night.',
    seasons: 'Violent: meltwater floods in the perihelion summer. The margin is retreating now.',
  },
  {
    code: 'L38', name: 'Planum Australe ice sheet', group: 'land',
    region: 'planum-australe', surface: 'ice', shade: -0.02,
    wind: { speed: [8, 18], text: 'Katabatic off the cap (est.)' },
    summary: 'Maritime and wet-based, not a polar desert: Patagonian, not Antarctic.',
    place: 'The south polar cap, centred on 83°S, at +0.5 to +1.5 km (up to ~2.8 km in the data).',
    vegetation: 'None on the ice.',
    daily: 'None in polar night, which lasts up to ~200 sols near the pole. In summer the sun circles the sky.',
    seasons: 'Violent: perihelion melt against aphelion accumulation. Now there are melt lakes, fast outlet ' +
      'glaciers and calving icebergs, and the cap is retreating.',
  },

  // --- 4.2 Enclosed waters (before the open belts, which are broader) ----
  {
    code: 'S10', name: 'Side-chasma still water', group: 'sea',
    region: 'vm-side-chasmata', surface: 'sheltered', shade: 0.12,
    wind: { speed: [0, 1], text: 'Dead calm and glassy' },
    summary: 'A calm nursery under the sky-nets, anoxic below a few hundred metres.',
    place: 'The water in Melas, Candor, Ophir and Hebes Chasmata.',
    vegetation: 'A calm nursery under the sky-nets. Anoxic below a few hundred metres.',
    daily: 'Hardly any.',
    seasons: 'Hardly any.',
  },
  {
    code: 'S09', name: 'Valles Marineris sound', group: 'sea',
    region: 'vm-sound', surface: 'sheltered',
    wind: { speed: [8, 15], text: 'The trades are funnelled along the axis, so it is windy' },
    summary: 'The only large water sheltered from both ocean swell and storm surge.',
    place: 'The flooded sound itself: 4,000 km long, 100–200 km wide, floor at −7 km.',
    vegetation: 'A thin, productive surface layer over water that is anoxic below a few hundred metres. The floor ' +
      'pressure is 260 bar, what an Earth diver meets at 2.6 km; abyssal air-breathers commute to the floor.',
    daily: 'The wind rises by day; rain falls in the afternoon.',
    seasons: 'Little change beyond the double rain peak.',
  },
  {
    code: 'S11', name: 'Hellas gulf', group: 'sea',
    region: 'hellas-gulf', surface: 'anoxic',
    wind: { speed: [2, 6], text: 'Weak and variable; 1–3 m seas when the wind rises across the long fetch' },
    summary: 'A Black Sea at ten times the scale: euxinic below ~500 m.',
    place: 'A 2,300 km gulf with its floor at −10.2 km, reached through a single strait near Dao Vallis.',
    vegetation: 'The surface stays near normal salinity, flushed through the strait. Below ~500 m the gulf is ' +
      'euxinic: anoxic, sulfidic and permanently stratified.',
    daily: 'Morning fog along the shore; hot, calm afternoons.',
    seasons: 'A sharp perihelion summer. Big surge floods on the shores come about once a decade.',
  },
  {
    code: 'S12', name: 'Argyre gulf and Uzboi–Ladon inlet', group: 'sea',
    region: 'argyre-gulf', surface: 'anoxic', shade: 0.14,
    wind: { speed: [2, 5], text: 'Weak winds and a sheltered inlet: small seas' },
    summary: 'Productive surface water over anoxic depths behind a shallow sill.',
    place: 'An 800 km gulf at 49.7°S 316°E (floor −7.2 km) and the 2,000 km fjord-like inlet running north from it.',
    vegetation: 'Productive surface water over anoxic depths behind a shallow sill.',
    daily: 'Air swing 3–5 K.',
    seasons: 'A sharp thermal season, with a short summer.',
  },
  {
    code: 'S13', name: 'Surge shallows', group: 'sea',
    region: 'arabia-shallows', depth: [0, 1500], surface: 'shallow',
    wind: { speed: [6, 9], text: 'Trade easterlies raising 3–5 m seas that break over the banks' },
    summary: 'Warm, productive banks where 25 m storm surges run hundreds of km inland.',
    place: 'The two flattest sea margins on the planet: the Arabia shallows (~20°N 15°E) and the lagoons and ' +
      'flooded flats of Hesperia Planum (20°S 110°E).',
    vegetation: 'Warm, productive banks, and saline lagoons around the sabkha (L30). The coastline never ' +
      'stabilises, so shallow-water life stays mobile and salt-tolerant.',
    daily: 'Air swing 3–5 K; a humid haze over the flats.',
    seasons: 'Surges peak in each hemisphere’s storm season.',
  },
  {
    code: 'S03', name: 'Amazonis lee sea', group: 'sea',
    region: 'amazonis-lee', surface: 'saline',
    wind: { speed: [4, 7], text: 'Weaker winds in the lee of Tharsis: local seas 1–2.5 m, plus open-trade swell' },
    summary: 'Clear, blue, nutrient-poor water under the Olympus wake.',
    place: 'The deep ocean west of Tharsis: 180–236°E, 0–45°N.',
    vegetation: 'Clear, blue, nutrient-poor water. Downwind of Olympus runs a cloud-free wake ~2,000 km long with ' +
      'a von Kármán vortex street, whose wind-stress curl spins up an ocean countercurrent.',
    daily: 'Air swing 2–3 K; clear nights.',
    seasons: 'Mild, and drier than the ocean around it.',
  },
  {
    code: 'S08', name: 'Perennial pack ice', group: 'sea',
    region: 'north-sea-ice', absLat: [80, 90], surface: 'polar', shade: 0.24,
    wind: { speed: [3, 7], text: 'Weak easterlies; there are no waves under the pack' },
    summary: 'The permanently frozen core of the north polar ocean.',
    place: 'Over Vastitas Borealis, poleward of ~80°N.',
    vegetation: 'Algae under the ice and sparse life below.',
    daily: 'None in polar night, which lasts ~163 sols at the pole.',
    seasons: 'Weak thermal change but a strong ice cycle. There is no land ice anywhere in the north.',
  },
  {
    code: 'S07', name: 'Seasonal ice margin', group: 'sea',
    region: 'north-sea-ice', belt: 'polar-n', surface: 'polar', shade: 0.08,
    wind: { speed: [4, 8], text: 'Weak easterlies; floating ice damps the waves' },
    summary: 'The richest ice biome: a plankton bloom at the ice edge in summer.',
    place: 'The edge of the northern sea ice, ~70–80°N. Sea-level freezing happens only poleward of ~73°, so the ' +
      'ice that reaches 70°N has drifted there.',
    vegetation: 'A plankton bloom at the ice edge in summer.',
    daily: 'Small. Long days in summer; polar night near the core.',
    seasons: 'The ice spreads south during the short northern winter and retreats through the long summer.',
  },
  {
    code: 'S06', name: 'Northern storm track', group: 'sea',
    region: 'north-storm-track', belt: 'storm-n', surface: 'storm',
    wind: { speed: [12, 25], text: 'Westerlies under the single jet, with three giant cyclones' },
    summary: 'The cleanest storm track on the planet, and its most productive northern ocean.',
    place: 'Open ocean at 60–72°N.',
    vegetation: 'Cold, well-mixed, nutrient-rich water; the most productive open ocean in the north.',
    daily: 'Weather matters more than the time of day. Poleward of 64.8°: sunlit around the clock at the height ' +
      'of summer, dark at midwinter.',
    seasons: 'Alternating stormy and calm spells as the jet moves. The short northern winter is the stormiest.',
  },
  {
    code: 'S05', name: 'Northern subsidence sea', group: 'sea',
    region: 'north-subsidence-sea', belt: 'dry-n', surface: 'saline', shade: -0.1,
    wind: { speed: [2, 5], text: 'Weak, variable winds with a long swell from the storm track' },
    summary: 'The planet’s salinity maximum, where warm saline water sinks to form the deep ocean.',
    place: 'Open ocean at 45–60°N, near the gyre’s wind-stress curl line.',
    vegetation: 'Clear, nutrient-poor water. Warm, saline water sinks here to form the deep ocean. The aerial ' +
      'mats above are thin.',
    daily: 'Air swing ~3 K; clear, starry nights.',
    seasons: 'A buffered thermal season with very little rain in any month.',
  },
  {
    code: 'S02', name: 'Northern trade-wind ocean', group: 'sea',
    region: 'north-trade-ocean', belt: 'trade-n', surface: 'open',
    wind: { speed: [7, 10], text: 'Steady easterlies over 12,000 km of fetch: the largest seas on the planet' },
    summary: 'An open subtropical gyre, poor in nutrients at the centre.',
    place: 'Utopia, Acidalia and Chryse, 12–45°N: deep ocean broken only by Olympus and Elysium.',
    vegetation: 'An open subtropical gyre, poor in nutrients at the centre. Pelagic soarers range from the two ' +
      'islands. A narrow, fast western boundary current runs along the east coast of Tharsis.',
    daily: 'Air swing 2–3 K; trade cumulus in the afternoon.',
    seasons: 'Mild. The northern summer is long and mild because it falls at aphelion.',
  },

  // --- 4.1 / 4.3 The open belts (fallbacks: every sea point lands here) ---
  {
    code: 'S04', name: 'Tharsis tip-jet seas', group: 'sea',
    region: null, belt: null, absLat: [40, 50], lon: [200, 320], surface: 'storm', shade: 0.16, azonal: true,
    wind: { speed: [12, 20], text: 'Permanent boundary jets raising short, steep seas of 5–15 m (est.)' },
    summary: 'Plankton-rich strips where wind-driven mixing brings nutrients up.',
    place: 'Offshore near 45°N and 45°S, where the trades split and bend around the two ends of Tharsis.',
    vegetation: 'Wind-driven mixing brings nutrients up, making plankton-rich strips where pelagic flyers feed.',
    daily: 'Steady day and night.',
    seasons: 'The jets drift a few degrees toward the summer pole.',
  },
  {
    code: 'S01', name: 'Equatorial warm ocean', group: 'sea',
    region: null, belt: 'equatorial', surface: 'open', shade: 0.12,
    wind: { speed: [2, 5], text: 'Light, converging winds; long 2–4 m swell from both trade belts' },
    summary: 'Warm surface water beneath the thickest green haze of the aerial biome.',
    place: 'Open water between 12°S and 12°N: Isidis, Elysium Planitia, the Syrtis Major platform and southern ' +
      'Chryse.',
    vegetation: 'Beneath the thickest green haze of A01. The surface water is freshened by rain.',
    daily: 'Air swing 1–2 K. Over open water the storms peak at night and before dawn.',
    seasons: 'The ITCZ passes twice a year. Between passages come calm spells like doldrums.',
  },
  {
    code: 'S14', name: 'Drowned highland sea', group: 'sea',
    region: null, belt: 'trade-s', surface: 'open', shade: -0.08,
    wind: { speed: [6, 9], text: 'Easterlies with the fetch broken by islands: 2–4 m seas' },
    summary: 'The largest sea biome in the south: crater rims rise as banks and ring islands.',
    place: 'The flooded southern highlands at 12–45°S: most of Noachis, the lower parts of Terra Cimmeria and ' +
      'Terra Sirenum, and the waters around Hesperia.',
    vegetation: 'Crater-rim banks become reefs of attached organisms. Migrating midwater animals easily reach the ' +
      'floor at 2 km.',
    daily: 'Air swing 2–3 K; afternoon storms over the islands.',
    seasons: 'Warm and stormy in the short summer; cool and dry in the long winter.',
  },
  {
    code: 'S15', name: 'Southern subsidence sea', group: 'sea',
    region: null, belt: 'dry-s', surface: 'saline', shade: 0.06,
    wind: { speed: [2, 5], text: 'Weak, variable winds with long swell from the southern storm sea' },
    summary: 'Clear, nutrient-poor water under clear skies.',
    place: 'Open water at 45–60°S, mostly 200–2,000 m deep over the drowned Noachis highlands.',
    vegetation: 'Clear, nutrient-poor water.',
    daily: 'Air swing ~3 K.',
    seasons: 'A sharp thermal season set by perihelion.',
  },
  {
    code: 'S16', name: 'Southern storm sea', group: 'sea',
    region: null, belt: 'storm-s', surface: 'storm', shade: -0.06,
    wind: { speed: [12, 25], text: 'Westerlies and three giant cyclones: seas 8–30 m' },
    summary: 'Cold and nutrient-rich; storms hit the coasts as 25 m surges.',
    place: 'Water at 60–72°S between the storm coasts of Continent A.',
    vegetation: 'Cold and nutrient-rich; feeding grounds for soarers and divers.',
    daily: 'Weather matters more than the time of day. Polar day and night poleward of 64.8°.',
    seasons: 'Alternating stormy and calm spells, with the long winter stormiest.',
  },
  {
    code: 'S17', name: 'South polar iceberg sea', group: 'sea',
    region: null, belt: 'polar-s', surface: 'polar',
    wind: { speed: [8, 15], text: 'Katabatic winds blowing off the cap (est.)' },
    summary: 'Icebergs calved from fast outlet glaciers, and a melt-fed summer bloom.',
    place: 'Water poleward of 72°S around Planum Australe.',
    vegetation: 'Icebergs calved from fast outlet glaciers, and a melt-fed plankton bloom in summer.',
    daily: 'Polar day in summer, polar night in winter.',
    seasons: 'Violent: seasonal sea ice in the long winter, and melt and calving in the perihelion summer.',
  },
  // --- 5. Fresh water and river biomes -----------------------------------
  // Drawn from data/rivers.json rather than the elevation grid, so all of them are azonal here.
  {
    code: 'R05', name: 'Freshwater inland sea', group: 'fresh',
    surface: 'sheltered', shade: -0.06, azonal: true, lake: 'large',
    wind: { speed: [6, 10], text: 'Steppe winds over 800 km of fetch, raising 2–5 m seas at 12–19 s (est.)' },
    summary: 'Lake Solis and Lake Thaumasia: real surf on a freshwater shore, with no tide.',
    place: 'Lake Solis, 761,000 km² and up to 1,890 m deep, larger than the Caspian Sea, at +1,290 m; and Lake ' +
      'Thaumasia, 104,000 km², one step lower at +940 m.',
    vegetation: 'Fresh, cool and open, with no connection to the ocean and none to any other lake: everything in ' +
      'it is endemic. Wave-cut cliffs and long gravel beaches on the windward shore; one lake has a desert coast ' +
      'and a rainforest coast.',
    daily: 'Calm at dawn; a lake breeze and whitecaps by afternoon. The shore is 5–8 K milder at night.',
    seasons: 'The level moves little, because the spill point fixes it, but the summer flood drowns the beaches.',
  },
  {
    code: 'R06', name: 'Deep crater lake', group: 'fresh',
    surface: 'sheltered', shade: -0.16, azonal: true, lake: 'deep',
    wind: { speed: [0, 2], text: 'Short fetch inside a crater rim: seas under 1 m, and glassy when walled' },
    summary: 'Still, clear water over a dead deep; each lake is its own island.',
    place: 'The lakes strung along the beaded rivers, and Lake Hebes, 26,700 km² and up to 7,260 m deep, the ' +
      'deepest fresh water on the planet.',
    vegetation: 'Below a few hundred metres the water never turns over, so the floor is anoxic. Pressure rises ' +
      '2.6× more slowly than on Earth, so divers work the whole lit column. A rim apart, one lineage appears as a ' +
      'dwarf in this bowl and a giant in the next.',
    daily: 'Fog on the water at dawn, gone by mid-morning. Hardly any air swing.',
    seasons: 'Almost none on the equatorial chains.',
  },
  {
    code: 'R07', name: 'Terminal salt lake and playa', group: 'fresh',
    surface: 'salt', shade: -0.04, azonal: true, lake: 'closed',
    wind: { speed: [3, 8], text: 'Shallow water on a flat floor keeps waves under 1 m' },
    summary: 'Where a river dies inland: brine banded from drinkable to crystallising.',
    place: 'The closed basins: the Terra Sirenum lake, the southern Tharsis lake, the Sabaea closed lake and the ' +
      'Syria lake up on the plateau at +4,330 m.',
    vegetation: 'Salinity runs from drinkable at the inflow to crystallising at the far end, and each band has ' +
      'its own specialists. Huge flyer flocks: the only rich food in an arid region, and a safe one, because ' +
      'nothing heavy can wade far over soft salt at 0.38 g.',
    daily: 'A humid haze and heavy shimmer at noon over a crust that stays damp underneath.',
    seasons: 'The lake fills in the wet season and shrinks to a crust in the dry, laying down salt each year.',
  },
  {
    code: 'R01', name: 'Rainforest river corridor and gravel braids', group: 'fresh',
    surface: 'rainforest', shade: 0.26, azonal: true, river: true,
    wind: { speed: [2, 6], text: 'Light, with a breeze along the axis of the gap (est.)' },
    summary: 'A light gap with a 150–250 m forest wall on either side.',
    place: 'The floodplains of rivers crossing wet forest: the whole Tholus River, the lower Solis and Thaumasia, ' +
      'the lower Tyrrhena and Sabaea, and the side gorges of the sound.',
    vegetation: 'Fast pioneers 20–40 m tall hold the gravel until the next flood takes them. The water is too ' +
      'turbid to grow anything, so the food chain runs on leaf fall and the rain of small animals from the banks. ' +
      'Stilt-waders fish the shallows; predators ambush at the bank, since at 0.38 g nothing can sprint.',
    daily: 'River fog in a band along the channel at dawn; the river rises in the evening after the storms.',
    seasons: 'Evergreen, with two flood peaks where the ITCZ passes twice, or one violent perihelion flood.',
  },
  {
    code: 'R02', name: 'Montane torrent and mist-fall walls', group: 'fresh',
    surface: 'rainforest', shade: 0.34, azonal: true, river: true,
    wind: { speed: [1, 5], text: 'Windless except for the fall’s own downdraught' },
    summary: 'Falls over 500 m turn to drifting mist before they land, and carve no plunge pool.',
    place: 'The steep reaches: the head of the Solis off the Melas wall, the Thaumasia upper gorge, and the Hebes ' +
      'River with its ~1,200 m fall over the north rim of Hebes Chasma.',
    vegetation: 'Spray-fed rock: mosses, cushion plants and heavy epiphytes on bare walls where nothing is rooted ' +
      'in soil. Nothing swims up a fall, so the water above each one holds its own isolated community. Hebes ' +
      'Falls stands as a white column visible for hundreds of kilometres.',
    daily: 'The mist column leans with the afternoon wind; flow peaks after the afternoon rain.',
    seasons: 'Violent in the Thaumasia gorge; steady on the Hebes, whose lake holds hundreds of km³ per metre.',
  },
  {
    code: 'R03', name: 'Savanna and dry-coast gallery corridor', group: 'fresh',
    surface: 'forest', shade: 0.24, azonal: true, river: true,
    wind: { speed: [4, 8], text: 'The host wind, slowed under the gallery canopy (est.)' },
    summary: 'An evergreen ribbon through country that is brown for half the year.',
    place: 'Rivers crossing seasonally dry country: the Pavonis through the drought-deciduous north-west coast, ' +
      'the plateau-margin reaches, the beaded chains of the southern savanna.',
    vegetation: 'A ribbon 40–80 m tall: from above, a green line drawn across a brown plain. In the dry season it ' +
      'holds the animals of the whole region, and every predator waits in the reeds.',
    daily: 'Valley fog at dawn. The bank is crowded at dawn and dusk and empty at noon.',
    seasons: 'The flood can double the channel width for a few sols; the plain greens after the first storm.',
  },
  {
    code: 'R04', name: 'Spillway gorge and knickpoint stair', group: 'fresh',
    surface: 'forest', shade: -0.22, azonal: true, river: true,
    wind: { speed: [1, 4], text: 'Still air in the slot' },
    summary: 'The only path between one lake and the next: the whole of the species pump.',
    place: 'The short, steep links between the lakes of a beaded river: the Sabaea’s whole course, the ' +
      'Tyrrhena spillway, and the Solis gorge through the Thaumasia rim.',
    vegetation: 'Gallery forest in the slot, taller and darker than anything on the rim. The waterfall at each ' +
      'gorge head is a one-way gate: things travel downstream easily and upstream never, unless they fly.',
    daily: 'Little, beyond fog in the slot at dawn.',
    seasons: 'In the wet season the chain flows and the lakes spill; in the dry the gorges fall to a trickle.',
  },
  {
    code: 'R08', name: 'Cuspate delta and beach-ridge shore', group: 'fresh',
    surface: 'savanna', shade: -0.18, azonal: true, river: 'mouth',
    wind: { speed: [6, 10], text: 'Onshore, with an afternoon sea breeze over the ridges (est.)' },
    summary: 'The sea, not the river, builds the mouth: a blunt cusp and long beach ridges.',
    place: 'Every river mouth on an open coast. The exception is L19, the planet’s only quiet delta.',
    vegetation: 'Behind the ridges lie abandoned channels, brackish ponds and swamp forest: the calm nursery the ' +
      'open mouth cannot offer. Strand plants hold the young ridges and forest takes the old ones, so the shore ' +
      'reads as stripes of successively older vegetation.',
    daily: 'Wave sets with periods up to 48 s work the front; the sea breeze drives spray over the ridges.',
    seasons: 'The river builds the delta out in flood season and the storm season cuts it back.',
  },
  {
    code: 'R09', name: 'River plume and brackish lens', group: 'fresh',
    surface: 'shallow', shade: -0.12, azonal: true, river: 'plume',
    wind: { speed: [4, 9], text: 'The host wind; the lens damps short chop into a slick band' },
    summary: 'Silt settles 2.6× more slowly, so the brown water reaches hundreds of km offshore.',
    place: 'The water offshore of every large mouth. The Solis and Thaumasia plumes merge into one band along the ' +
      'coast of S14.',
    vegetation: 'Inside the plume it is too dark to grow anything. At its edge sits a permanent plankton bloom, ' +
      'and with it the divers and the pelagic soarers. A sharp, shallow halocline, with little mixing.',
    daily: 'Small. The front is sharpest in the calm before dawn.',
    seasons: 'The plume swells with the flood season and shrinks in the dry.',
  },

  // --- 4.4 Across all seas, and the air ----------------------------------
  {
    code: 'S18', name: 'Surf and splash zone', group: 'sea',
    surface: 'shallow', shade: 0.2, azonal: true, coast: 'coast', depth: [0, 30],
    wind: { speed: [6, 12], text: 'Whatever the coast gets, plus spray' },
    summary: 'The harshest habitat on the planet: a wide, permanently pounded splash zone.',
    place: 'Every coast exposed to open water, from the wave base to the top of the spray.',
    vegetation: 'Low, thick and ferociously attached. Storm waves reach 25 m while tides are feeble, so there is ' +
      'barely an intertidal zone. No estuaries or tidal flats; river mouths are cuspate.',
    daily: 'Tides are tiny. The rhythm is the arrival of long wave sets, with periods up to 48 s.',
    seasons: 'Heaviest in each coast’s storm season.',
  },
  {
    code: 'S19', name: 'Migrating midwater', group: 'sea',
    surface: 'anoxic', shade: 0.1, azonal: true, depth: [200, 3000],
    wind: { speed: [0, 0], text: 'None below the surface' },
    summary: 'Daily vertical migrations of 2–3 km are routine, with no barotrauma.',
    place: 'All deep water, 200–3,000 m.',
    vegetation: 'Pressure rises 2.6× more slowly than on Earth, so gas-filled swim bladders keep working to great ' +
      'depth. Marine snow sinks 2.6× more slowly, so food is reworked in the water column and midwater ' +
      'suspension feeders are abundant. Air-breathing divers reach 3–4 km.',
    daily: 'The animals rise at dusk and sink at dawn.',
    seasons: 'They follow the plankton blooms of the surface biome above.',
  },
  {
    code: 'S20', name: 'Dead abyss and anoxic basins', group: 'sea',
    surface: 'anoxic', shade: -0.18, azonal: true, depth: [500, null],
    wind: { speed: [0, 0], text: 'None at depth' },
    summary: 'Largely dead: the seafloor is starved because little food falls through the midwater.',
    place: 'The deep sea below ~500 m in most basins, and all enclosed deeps.',
    vegetation: 'Warm deep water of 10–15 °C, fed by warm saline water sinking in the subsidence belts. ' +
      'Overturning is sluggish and weak tides give little mixing, so anoxia is widespread.',
    daily: 'None.',
    seasons: 'None. Changes come only on the precession cycle.',
  },
  {
    code: 'A01', name: 'Aerial biome', group: 'air',
    surface: 'open-forest', shade: 0.3, azonal: true, always: true,
    wind: { speed: [10, 25], text: 'Thermals by day; the mats sink a little at night' },
    summary: 'Gossamer photosynthesizers that complete a life cycle without ever landing.',
    place: 'The air column 5–12 km above both land and sea. Giant soarers range from 3 to 15 km.',
    vegetation: 'Sheets metres across that weigh grams; aerial grazers riding thermals indefinitely; giant ' +
      'soarers with 20 m wingspans feeding on both. At 10 km the air is still 0.62 bar and ~0 °C, and particles ' +
      'stay aloft for months.',
    daily: 'Thermals lift the mats by day; they sink a little at night.',
    seasons: 'The green haze is thickest over the ITCZ and the monsoons, thin over the subsidence belts.',
  },
];

// Resolve each biome's colour from its palette key, exactly as REGIONS does, and throw on an unknown key.
export const BIOMES = BIOME_DATA.map((biome) => {
  const table = biome.group === 'sea' || biome.group === 'fresh' ? SEA : VEGETATION;
  const base = table[biome.surface] ?? VEGETATION[biome.surface] ?? SEA[biome.surface];
  if (!base) throw new Error(`${biome.code}: unknown surface key "${biome.surface}"`);
  return { ...biome, color: shadeHex(base, biome.shade ?? 0) };
});

export const BIOMES_BY_CODE = Object.fromEntries(BIOMES.map((b) => [b.code, b]));

// The biomes the map draws. The azonal ones are patches narrower than a texel (river corridors, the splash zone)
// or stacked above one another (the midwater, the abyss, the air), so they only ever appear in the info panel.
export const DRAWN_BIOMES = BIOMES.filter((b) => !b.azonal);
export const AZONAL_BIOMES = BIOMES.filter((b) => b.azonal);
