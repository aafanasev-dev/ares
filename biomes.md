# Biomes of Ares

A **biome** is a part of the land, the fresh water or the sea with a similar climate, vegetation and fauna.

It is finer than the layers on the map:
- **Climate belts** (latitude) set the base temperature, rain and wind.
- **Regional climates** (`REGIONS` in `geography.js`) modify them in named places.
- **Biomes** split a regional climate further by what matters to living things:
  - on land: coast or interior, height, shelter and water;
  - at sea: surface temperature, humidity and wind (and therefore waves), then depth and ice;
  - in fresh water: a river or a lake carries its own habitat into every biome it crosses (§5).

The facts come from `planet_geography.md`. Areas were measured from the MOLA grid with the sea at +2,000 m above the
Mars datum; there, "coast" means within 250 km of the sea. Elevations and depths are relative to sea level. Figures
marked *est.* are not in `planet_geography.md`: they are estimates derived from its rules.

---

## 1. How to read this

### 1.1 Picking a biome

**On land**
1. Start from the **regional climate**, or the latitude belt where no region applies.
2. Decide **coast or interior**. Coasts get sea breezes, higher humidity, a smaller daily range and salt spray. On flat
   shores they also get storm surge, which reaches surge height ÷ slope inland: 25 km at 1 m/km.
3. Find the **altitude band**:

   | Band | Height | Pressure |
   |---|---|---|
   | Lowland | 0–2.5 km | 1.00–0.89 bar |
   | Montane | 2.5 km to treeline | |
   | Alpine | treeline to snowline | |
   | Nival | above the snowline | |

   The treeline (7 km) and snowline (11 km) are equatorial values. They drop 0.4 km for every kelvin a belt is colder:

   | Belt | Treeline | Snowline |
   |---|---|---|
   | Trade belts | 6.2 km | 10.2 km |
   | Dry belts | 2.6 km | 6.6 km |
   | Storm belts | 0.6 km | 4.6 km |
   | North polar | sea level | 2.2 km |
   | South polar | sea level | 0.6 km |

4. Look for **azonal patches** that cut across all of the above: river corridors (R01–R04), lakes (R05–R07), river
   mouths and their plumes (R08–R09), crater bowls, salt flats and the surf zone.

**At sea**
1. **Surface temperature and ice**, from the belt.
2. **Wind, and therefore waves.** For a fully developed sea, significant wave height is about 0.05·U² m and the peak
   period about 1.9·U s, where U is the wind speed in m/s. This matches §2.7: 10 m/s gives about 5 m and 19 s, and
   25 m/s gives about 31 m and 48 s. Seas are smaller where the fetch is short.
3. **Humidity and rain** over the water.
4. **Depth and shelter.**
   - Depth classes: shelf (<200 m), drowned highland (200–2,000 m) or deep ocean.
   - Enclosed basins are anoxic at depth.

### 1.2 Rules shared by every biome

- **Temperature** falls 2.5 K per km. **Pressure** is 1013 hPa · exp(−h / 22.3 km): 0.89 bar at 2.5 km, 0.76 bar at
  6 km and 0.61 bar at 11 km.
- **Daily range** on land comes from the belt table (8–15 K). It shrinks as days get very short or very long, and
  vanishes in polar night and polar day. Over open water the air swings only 1–3 K.
- **Rain** arrives in about a third as many events as on Earth, each two to three times heavier.
  - Absolute humidity is ~2.6× Earth's at the same relative humidity.
  - Convective storms over land cluster at 13–19 h local time; over open water they peak before dawn.
- **Times** are local Mars hours, 24 per sol.
- **Polar circles** lie at 64.8°. Poleward of them there is polar day and polar night.
- **Tides** are about a third of Earth's.
- **Storm surge** is 2.6× Earth's.
- **River mouths** are wave-dominated and cuspate. There are no estuaries and no tidal flats.

### 1.3 Calendar

| Sol | Ls | Event |
|---|---|---|
| 0 | 0° | Northern spring equinox |
| 83 | 71° | Aphelion, 1.115 AU |
| 106 | 90° | Northern summer solstice |
| 203 | 180° | Northern autumn equinox |
| 266 | 251° | Perihelion, 0.925 AU: 45% more sunlight than at aphelion |
| 282 | 270° | Southern summer solstice |
| 366 | 360° | End of the year |

**Season lengths**

| Season (north / south) | Ls | Sols |
|---|---|---|
| Northern spring / southern autumn | 0–90° | 106 |
| Northern summer / southern winter | 90–180° | 97 |
| Northern autumn / southern spring | 180–270° | 79 |
| Northern winter / southern summer | 270–360° | 84 |

The south therefore has:
- a short, fierce summer at perihelion;
- a long autumn and winter (203 sols together).

The south pole is dark for ~200 sols (sols 0–203); the north pole is dark for ~163 (sols 203–366).

**Rain seasons**
- **Equator.** The ITCZ (mean position 5°S) crosses it twice. The wettest spells come around sols 60–80 and 190–210.
- **Southern monsoon.** Wettest around sols 270–340. It is violent, because the monsoon and perihelion coincide.
- **Northern monsoon.** Wettest around sols 110–200. It is mild.

---

## 2. Summary

Land at +2 km is ~24.5 M km²; sea is ~120 M km². Areas are approximate. "—" means the biome is a patch inside
another biome's area.

### Land

| Code | Biome | Regional climate | Height | ≈ M km² |
|---|---|---|---|---|
| L01 | Lunae coastal rainforest | Eastern coastal rainforest | 0–0.8 km | 1.2 |
| L02 | Lower escarpment rainforest | East Tharsis escarpment | 0.8–2.5 km | 1.5 |
| L03 | Upper escarpment cloud forest | East Tharsis escarpment | 2.5–5.5 km | 0.15 |
| L04 | Plateau-margin monsoon savanna | Tharsis plateau steppe | 1.5–3 km | 1.7 |
| L05 | Plateau core cold steppe | Tharsis plateau steppe | 3–6 km | 3.4 |
| L06 | Glacier-river gallery forest and playas | Tharsis plateau steppe | 2–6 km | — |
| L07 | Gap-jet dune corridors | Inter-cone gap-jet corridors | 4–5 km | 0.11 |
| L08 | Cone rain-crescent forest | Tharsis plateau steppe | 4–7 km | — |
| L09 | Cone alpine desert | Tharsis volcanic cones | 7–11 km | 0.13 |
| L10 | Cone ice caps | Tharsis volcanic cones | >11 km | 0.06 |
| L11 | Tharsis western flank scrub | Equatorial / southern savanna (unnamed) | 2.5–8 km | 0.3 |
| L12 | Daedalia inland desert | Daedalia rain shadow | 0.5–2.5 km | 1.0 |
| L13 | Amazonis dry coast | Daedalia rain shadow | 0–0.5 km | 2.1 |
| L14 | North-west Tharsis lee coast | Trade belt north (unnamed) | 0–2 km | 0.7 |
| L15 | Alba coastal river forest | Alba Mons river forest | 0–2.5 km | 0.6 |
| L16 | Alba upland forest | Alba Mons river forest | 2.5–4.6 km | 0.2 |
| L17 | Side-chasma cathedral forest | Sheltered side chasmata | 0–1.5 km | — |
| L18 | Sound wall rainforest | Valles Marineris sound | 0–1.5 km | 0.2 |
| L19 | Ius head delta and rain wall | Valles Marineris sound | 0–1 km | — |
| L20 | Olympus flank forest | Olympus Mons island | 0–6 km | 0.1 |
| L21 | Olympus alpine desert | Olympus Mons island | 6–10 km | 0.07 |
| L22 | Olympus summit ice cap | Olympus Mons island | 10–19.2 km | 0.07 |
| L23 | Elysium windward rainforest | Elysium Mons island | 0–6 km | 0.05 |
| L24 | Elysium lee savanna | Elysium Mons island | 0–3 km | 0.03 |
| L25 | Elysium summit | Elysium Mons island | 6–12 km | <0.03 |
| L26 | Equatorial highland rainforest coast | Equatorial wet (unnamed) | 0–2 km | 1.95 |
| L27 | Wet eastern shore forest | Southern savanna and crater forests | 0–1 km | 4.7 with L28–L29 |
| L28 | Crater-ring savanna | Southern savanna and crater forests | 0–2.5 km | (with L27) |
| L29 | Crater-bowl forest and beaded lakes | Southern savanna and crater forests | 0–2.5 km | (with L27) |
| L30 | Sabkha salt flats | Hesperia sabkha, Arabia shallows | 0–0.4 km | 0.05 |
| L31 | Hellas warm arid shores | Hellas arid shores | 0–2 km | 0.14 |
| L32 | Cool desert coast | Southern subsidence desert | 0–1 km | 1.7 with L33 |
| L33 | Salt-pan crater desert | Southern subsidence desert | 0–2.5 km | (with L32) |
| L34 | Storm-coast temperate rainforest | Southern storm coast | 0–0.6 km | 0.65 |
| L35 | Fjord-head forest | Southern storm coast | 0–0.3 km | — |
| L36 | Storm upland heath | Southern storm coast | >0.6 km | 0.04 |
| L37 | Sandur and krummholz margin | Planum Australe ice cap | 0–0.5 km | — |
| L38 | Planum Australe ice sheet | Planum Australe ice cap | 0.5–2.8 km | 1.4 |

### Sea

| Code | Biome | Regional climate | Depth | ≈ M km² |
|---|---|---|---|---|
| S01 | Equatorial warm ocean | Equatorial wet (unnamed) | mostly deep | 20.4 |
| S02 | Northern trade-wind ocean | Northern trade-wind ocean | deep | 27.9 |
| S03 | Amazonis lee sea | Amazonis lee sea | deep | 7.8 |
| S04 | Tharsis tip-jet seas | Trade / dry belt border | deep | — |
| S05 | Northern subsidence sea | Northern subsidence sea | deep | 11.4 |
| S06 | Northern storm track | Northern storm track | deep | 6.1 |
| S07 | Seasonal ice margin | Northern sea-ice ocean | deep | 3.5 with S08 |
| S08 | Perennial pack ice | Northern sea-ice ocean | deep | (with S07) |
| S09 | Valles Marineris sound | Valles Marineris sound | to 7 km | 0.6 |
| S10 | Side-chasma still water | Sheltered side chasmata | to 7 km | 0.1 |
| S11 | Hellas gulf | Hellas gulf | to 10.2 km | 4.4 |
| S12 | Argyre gulf and Uzboi–Ladon inlet | Argyre gulf and Uzboi–Ladon inlet | to 7.2 km | 0.9 |
| S13 | Surge shallows | Arabia shallows, Hesperia sabkha | 0–1.5 km | 1.4 |
| S14 | Drowned highland sea | Trade belt south (unnamed) | 200–2,000 m | 21.0 |
| S15 | Southern subsidence sea | Dry belt south (unnamed) | 200–2,000 m | 6.9 |
| S16 | Southern storm sea | Storm belt south (unnamed) | 200–2,000 m | 5.3 |
| S17 | South polar iceberg sea | Polar south (unnamed) | 0–2,000 m | 2.2 |
| S18 | Surf and splash zone | every exposed coast | 0–30 m | — |
| S19 | Migrating midwater | all deep water | 200–3,000 m | — |
| S20 | Dead abyss and anoxic basins | all deep water | below ~500 m | — |

### Fresh water and rivers

| Code | Biome | Host biomes | Where | ≈ M km² |
|---|---|---|---|---|
| R01 | Rainforest river corridor and gravel braids | L01, L02, L18, L26, L27 | wet-forest floodplains | — |
| R02 | Montane torrent and mist-fall walls | L02, L03, L17 | steep reaches and high falls | — |
| R03 | Savanna and dry-coast gallery corridor | L04, L12, L13, L14, L28 | seasonally dry country | — |
| R04 | Spillway gorge and knickpoint stair | L26, L29 | between the lakes of a beaded river | — |
| R05 | Freshwater inland sea | L02, L04, L05 shores | Lake Solis, Lake Thaumasia | 0.87 |
| R06 | Deep crater lake | L17, L26, L29 | beaded-river and chasma lakes | 0.1 |
| R07 | Terminal salt lake and playa | L05, L12, L28, L32 | closed basins | 0.56 |
| R08 | Cuspate delta and beach-ridge shore | L01, L14, L26, S18 | every open-coast river mouth | — |
| R09 | River plume and brackish lens | S01, S02, S14 | offshore of every large mouth | — |

The areas count only the named large bodies. `rivers.md` finds about 2,400 lakes in all.

### Air

| Code | Biome | Height |
|---|---|---|
| A01 | Aerial biome | 5–12 km (soarers 3–15 km) |

---

## 3. Land biomes

### 3.1 Tharsis: the windward east

#### L01 · Lunae coastal rainforest
- **Place.**
  - The low coastal step at the east (windward) foot of Tharsis, facing Chryse and the Valles Marineris approaches.
  - Centred on Lunae Planum (10°N 295°E), running south past the mouth of the sound.
  - Almost all of it lies within 250 km of the sea.
- **Climate.**
  - Temperature: mean 20–22 °C, 1.00–0.97 bar. Summer/winter 23/21 °C near the equator; south of 12°S it sharpens
    toward 26/15 °C.
  - Rain: 2,300–2,700 mm/yr; RH 80–90%.
  - Wind: onshore easterly trades, 6–9 m/s (*est.*).
- **Vegetation and fauna.**
  - Lowland rainforest. Giant trees grow only in sheltered valleys; the seaward edge is wind-pruned.
  - Rivers end in wave-built, cuspate mouths.
  - Gliders and climbers rule the canopy. The shore is a bare, pounded splash zone (S18).
- **Daily changes.**
  - Daily range 8–9 K.
  - Mornings are fair. Cloud piles against the escarpment by midday, and heavy downpours fall at 13–19 h.
  - The afternoon sea breeze adds to the trades.
- **Seasons.**
  - Evergreen.
  - Near the equator: a weak double rain peak as the ITCZ passes.
  - South of 12°S: the short, hot perihelion summer (sols ~270–340) is the wettest time. Its storms surge over the
    lowest flats.

#### L02 · Lower escarpment rainforest
- **Place.** The first 2 km of the eastern wall of Tharsis above the coastal step, from ~28°N to ~48°S. It includes the
  wall tops above Valles Marineris.
- **Climate.**
  - Temperature: mean 16–20 °C, 0.97–0.89 bar.
  - Rain: 3,000–4,000 mm/yr from orographic cloud almost every day; RH 85–95%.
  - Wind: trade winds forced upslope.
- **Vegetation and fauna.**
  - Rainforest in stacked vertical bands. Giants of 150–250 m grow in the gorges; wind-pruned scrub covers the
    interfluves a few hundred metres away.
  - Heavy epiphyte loading. After major storms, domino blowdowns leave even-aged mosaics tens of km across.
  - Stilt-waders 60–80 m tall browse the gorge forests at mid-canopy; gliding vertebrates dominate higher up.
- **Daily changes.**
  - Daily range 7–8 K (*est.*).
  - Cloud forms in late morning and climbs the wall; rain peaks from afternoon to evening.
  - At night cold air drains down the gorges, and mist fills them by dawn.
- **Seasons.**
  - Wet all year.
  - The southern half takes the violent perihelion monsoon pulse (sols ~270–340); the northern half gets a milder
    pulse in northern summer.
  - Waterfalls taller than ~500 m atomise into drifting mist and barely erode their plunge pools.

#### L03 · Upper escarpment cloud forest
- **Place.** The upper eastern wall of Tharsis, 2.5–5.5 km, up to the plateau rim.
- **Climate.**
  - Temperature: mean 8–16 °C, 0.89–0.78 bar.
  - Rain: 3,000–4,000 mm/yr plus fog drip; RH 90–100%.
  - Wind: gusty at the rim.
- **Vegetation and fauna.**
  - Cloud forest that thins with height: 60–100 m in the gorges, dwarf moss forest and scrub on the ridges.
  - It ends abruptly at the rim, where the plateau's rain shadow begins.
  - Soarers ride the ridge lift along the wall.
- **Daily changes.**
  - Daily range 5–6 K (*est.*): cloud damps it.
  - The dawn is often briefly clear. Cloud is thickest in the afternoon.
- **Seasons.** Hardly any temperature season. The cloud base sinks and the rain doubles in the local monsoon.

### 3.2 Tharsis: the plateau and the cones

#### L04 · Plateau-margin monsoon savanna
- **Place.** The outer ring of the Tharsis plateau, 1.5–3 km, where it steps down from the core toward the coasts.
- **Climate.**
  - Temperature: mean 14–18 °C, 0.93–0.87 bar.
  - Rain: 300–700 mm/yr (*est.*) on 15–25 days, almost all in the monsoon; RH 20–35% in the dry season, 50–70% in the
    wet.
  - Wind: gusty trades spilling around the plateau.
- **Vegetation and fauna.**
  - Savanna grading into steppe. Grasses reach 3–8 m, with scattered flat-crowned, buttressed trees.
  - Bare in the dry season; it turns green within days of the first rains.
  - Grazers move between the margin and the river corridors (L06).
  - Dust devils 5–10 km tall.
- **Daily changes.**
  - Daily range 12–15 K: cool, clear dawns and hot, bright afternoons.
  - In the wet season, storms build over the rim and pour down at 13–19 h.
- **Seasons.** Extreme wet/dry, driven by the cross-equatorial monsoon.
  - The southern margin is wet around perihelion (sols ~270–340), and violently so.
  - The northern margin is wet in northern summer (sols ~110–200), more gently.
  - The landscape goes brown to green, never green to gold.

#### L05 · Plateau core cold steppe
- **Place.** Syria and Solis Planum and the high plateau between the cones and the southern rim: +3 to +6 km, from
  ~25°N to ~43°S. The largest biome on Tharsis.
- **Climate.**
  - Temperature: about 11 °C mean at 4.4 km near the equator (7–14 °C across the core, 3–10 °C at the southern rim);
    0.78–0.83 bar on most of it.
  - Rain: under 100 mm/yr, the driest place on the planet. RH 10–20%; precipitable water 8–15 mm.
  - Wind: moderate, strongest near the gap jets (L07).
- **Vegetation and fauna.**
  - Cold, dry steppe of bunch grasses and cushion plants, 0.2–1 m tall, over gravel and playas.
  - The most habitable highland: breathable, temperate and dry, a pleasant Tibet.
  - Slow, long-legged grazers spread out over the steppe. Broad, very tall thermals carry soaring flyers.
- **Daily changes.**
  - Daily range 14–18 K (*est.*) in thin, clear air: nights near 3–5 °C, afternoons near 18–22 °C.
  - Thermals and dust devils by late morning; almost no dew.
- **Seasons.**
  - A weak thermal season near the equator, sharper toward the southern rim (perihelion summer).
  - Rain hardly changes the landscape. The season arrives as water: glacier-melt pulses from Ascraeus and Arsia in the
    warm months fill the rivers and playas, which then dry to salt.

#### L06 · Glacier-river gallery forest and playas
- **Place.** Ribbons along the rivers fed by the Ascraeus and Arsia glaciers. They thread across L04 and L05 and die
  into playas.
- **Climate.**
  - Plateau climate, but damp in the valley bottoms: RH 30–50% near the water.
  - Cold air pools there at night, so the valleys see frost more often than the steppe.
- **Vegetation and fauna.**
  - Gallery forest 20–60 m tall, only along the water. Reed beds and salt-tolerant scrub fringe the playas; playa
    floors are bare salt.
  - The densest animal life on the plateau. Predators wait at the water, since ambush is the only strategy that works
    at 0.38 g traction.
- **Daily changes.**
  - Melt-fed rivers rise in the afternoon, a few hours after peak melt, and fall at night.
  - Valley fog at dawn.
- **Seasons.**
  - Flow peaks in the warm season; the playas fill, then shrink and crust over.
  - When a melt pulse fails, the gallery trees drop their leaves: drought, not frost, is the trigger.

#### L07 · Gap-jet dune corridors
- **Place.** The two gaps between the three cones, roughly 700 km apart: Ascraeus–Pavonis near 6°N 251°E, and
  Pavonis–Arsia near 4°S 243°E. Both lie at +4 to +5 km.
- **Climate.**
  - Temperature: mean 9–12 °C, 0.80–0.84 bar, but the wind makes it feel much colder.
  - Rain: under 100 mm/yr; RH 10–20%.
  - Wind: permanently accelerated gap jets, 15–30 m/s near the ground (*est.*).
- **Vegetation and fauna.**
  - Almost barren: scoured rock pavement and star dunes up to 500 m high at 15 km spacing.
  - Only low, burrowing animals and scavengers of wind-blown debris live here. Flyers either avoid the jets or ride
    them.
- **Daily changes.**
  - Daily range 10–12 K (*est.*): the wind mixes the air.
  - The jets blow hardest in the afternoon as the plateau heats, and sand moves by day.
- **Seasons.** The jets never stop; their strength shifts with the monsoon reversal.

#### L08 · Cone rain-crescent forest
- **Place.** The windward (east) flanks of Ascraeus, Pavonis and Arsia Mons, from ~4 km up to the treeline at ~7 km.
  Each cone has one crescent; the lee side trails a dry wake instead.
- **Climate.**
  - Temperature: mean 5–12 °C, 0.73–0.84 bar.
  - Rain: 500–1,500 mm/yr (*est.*) from the cloud banked against each cone; RH 50–80%.
- **Vegetation and fauna.**
  - Montane forest 20–60 m tall, shrinking to krummholz at the treeline.
  - Meltwater streams run through it. Flyers nest on the lava cliffs.
- **Daily changes.**
  - Daily range 8–10 K.
  - A cloud cap forms on the windward flank by midday. At night, cold katabatic winds drain off the ice caps above.
- **Seasons.** Cloud and rain are strongest in the monsoon season. Snow reaches the upper forest in the cool season.

#### L09 · Cone alpine desert
- **Place.** Ascraeus, Pavonis and Arsia Mons between the treeline (~7 km) and the snowline (~11 km).
- **Climate.**
  - Temperature: mean −5 to +5 °C, 0.73–0.61 bar.
  - Rain: 0–300 mm/yr, falling as snow above ~10 km; RH 10–20%.
  - Wind: strong, splitting around the cones.
- **Vegetation and fauna.**
  - Low scrub and cushion plants, then bare lava and scree.
  - Only a few hardy grazers. Soaring flyers pass overhead at 10–15 km, which is ordinary here.
- **Daily changes.**
  - Daily range 15–20 K (*est.*): strong sun by day and frost almost every night.
  - Winds blow upslope in the afternoon and downslope at night.
- **Seasons.** The snow line creeps down in the cool season and retreats in the warm season.

#### L10 · Cone ice caps
- **Place.**
  - **Ascraeus** (+16.2 km) and **Arsia** (+15.7 km) carry permanent caps ~5 and ~4.5 km thick.
  - **Pavonis** (+12.0 km) holds only a marginal cap, which appears and vanishes over obliquity cycles.
- **Climate.**
  - Temperature: mean −5 to −18 °C; 0.61 bar at the snowline, 0.48 bar at 16 km.
  - Snowfall is light, but in low gravity the ice deforms slowly, so the caps are thick, sluggish and long-lived.
- **Vegetation and fauna.** None, apart from microbial life at the melting edges.
- **Daily changes.** Surface melt only around noon, and only at the lower margin.
- **Seasons.** Melt in the warm season feeds the plateau rivers (L06). The caps themselves change only over thousands
  of years.

### 3.3 Tharsis: the lee west and the north

#### L11 · Tharsis western flank scrub
- **Place.** The western (lee) slopes of Arsia and Pavonis Mons and the high edge of Daedalia: 230–250°E, ~10°N to
  ~30°S, 2.5–8 km.
- **Climate.**
  - Temperature: mean 5–16 °C, 0.89–0.70 bar.
  - Rain: 100–300 mm/yr (*est.*) in the cone wakes; RH 15–30%.
  - Wind: descending, drying (föhn) winds off the cones.
- **Vegetation and fauna.** Dry montane scrub with open woodland in the gullies, and bare lava flows between.
- **Daily changes.**
  - Daily range 14–18 K (*est.*).
  - Warm, dry afternoons under the downslope wind; cold, clear nights.
- **Seasons.** The monsoon brings a few showers. The southern part has the sharper perihelion summer.

#### L12 · Daedalia inland desert
- **Place.** Daedalia Planum and the western descent of Tharsis away from the sea: 214–245°E, 16°N to 52°S, 0.5–2.5 km.
- **Climate.**
  - Temperature: mean 14–20 °C in the north, 5–10 °C beyond 45°S.
  - Rain: 150–400 mm/yr; RH 25–40%.
  - Wind: dry, descending easterlies that have already crossed the plateau.
- **Vegetation and fauna.** Arid rain-shadow scrub and desert: succulents, thorn shrubs and lee dune fields.
- **Daily changes.**
  - Daily range 13–15 K.
  - Hot, bright afternoons; clear, cold nights; dust plumes on windy days.
- **Seasons.** Rain comes in a few storms during the local wet season. South of 12°S the summer is short, hot and sharp.

#### L13 · Amazonis dry coast
- **Place.** The west coast of Tharsis facing Amazonis Planitia, ~16°N to ~50°S, 0–0.5 km.
- **Climate.**
  - Temperature: mean 18–21 °C near the equator, cooler to the south.
  - Rain: 150–400 mm/yr, toward the upper end on the shore; RH 35–55%.
  - Wind: a dry offshore easterly, against a weak afternoon sea breeze.
  - There is no coastal fog desert: that needs cold upwelling under subsiding air, and there is none here.
- **Vegetation and fauna.** Dry coastal scrub, thorn woodland in the stream mouths and salt-tolerant strand plants. The
  sea offshore is the saline Amazonis lee (S03).
- **Daily changes.**
  - Daily range 8–10 K.
  - Offshore wind at night and in the morning; a sea breeze in the afternoon.
- **Seasons.** Dry for most of the year, with a brief wet season. The dry coast lies mainly along the ocean; the rain
  shadow itself falls mostly on open water.

#### L14 · North-west Tharsis lee coast
- **Place.** The low north-western slopes of Tharsis between Olympus and Ascraeus, facing the Olympus strait: 240–260°E,
  10–30°N, 0–2 km.
- **Climate.** Northern trade belt.
  - Temperature: mean 17–21 °C, 22/17 °C summer/winter.
  - Rain: 600–1,200 mm/yr (*est.*) on 30–60 days, as trade air wraps around the northern tip of Tharsis; RH 40–75%.
- **Vegetation and fauna.** Drought-deciduous forest and savanna woodland, giving way to rainforest in wet valleys.
- **Daily changes.**
  - Daily range 9 K.
  - Showers in the afternoon during the wet season.
- **Seasons.** Mild. The wet season falls in the long, mild northern summer (aphelion). Trees drop their leaves in
  the dry season.

#### L15 · Alba coastal river forest
- **Place.** The lower slopes and coasts of Alba Mons: 29–46°N, ~230–270°E, 0–2.5 km.
- **Climate.**
  - Temperature: mean 15–21 °C, cooler toward the dry belt at 45°N.
  - Rain: 900–1,800 mm/yr on 40–70 days; RH 60–80%.
  - Wind: maritime air from the northern ocean. The north shore is exposed to the 45°N boundary jet (S04).
- **Vegetation and fauna.**
  - The largest single forest by area: a uniform 60–100 m canopy with no giants, because nothing is sheltered.
  - Long, radial, dendritic river networks make it the best river country on the planet.
  - The rivers are braided, turbid and 1.6× wider than on Earth for the same discharge.
  - River-corridor animals and fish-eaters.
- **Daily changes.**
  - Daily range 7–9 K.
  - River fog in the morning; a sea breeze in the afternoon.
- **Seasons.**
  - A long, mild summer and a short, mild winter.
  - Windthrow after rare storms from the boundary jet leaves patches of even-aged regrowth.

#### L16 · Alba upland forest
- **Place.** The broad upper shield of Alba Mons, 2.5–4.6 km.
- **Climate.**
  - Temperature: mean 8–14 °C, 0.89–0.81 bar.
  - Rain: 800–1,500 mm/yr (*est.*); RH 60–80%.
  - Wind: stronger than on the coast.
- **Vegetation and fauna.** The same uniform forest, lower at 40–70 m. Headwater bogs, and open woodland and heath around
  the summit caldera.
- **Daily changes.**
  - Daily range 9–11 K.
  - Frost on clear winter nights.
- **Seasons.** A mild season, with light snow in the short northern winter.

### 3.4 Valles Marineris

#### L17 · Side-chasma cathedral forest
- **Place.** The lower walls and floors (up to 1.5 km) of the four sheltered side basins: Melas, Candor, Ophir and
  Hebes Chasmata, at 1–11°S.
- **Climate.**
  - Temperature: mean 20–23 °C.
  - Rain: fog-fed, with continuous rain on the upper walls; RH 90–100%, permanently misted.
  - Wind: dead calm.
- **Vegetation and fauna.** The tallest forest on the planet.
  - Trees: a 300 m canopy on trunks 12 m across, a very dark floor and heavy epiphytes.
  - Gliders: the dominant arboreal body plan.
  - Stilt-waders 60–80 m tall.
  - Sky-nets: sessile ambush organisms string catenary nets hundreds of metres across between the 4 km walls and
    harvest soarers and drifting mats. They live here and nowhere else.
- **Daily changes.**
  - Daily range 3–5 K (*est.*).
  - The mist thins at midday but never clears, and no wind breaks the nets.
- **Seasons.** Almost none. The double ITCZ rain peak is felt only as heavier drip.

#### L18 · Sound wall rainforest
- **Place.** The inner walls of the 4,000 km sound, up to 1.5 km, from the western chasmata to Eos and Capri Chasmata:
  3–16°S, 266–320°E.
- **Climate.**
  - Temperature: mean 19–22 °C.
  - Rain: 3,000–4,500 mm/yr, the wettest land on the planet; RH 85–95%.
  - Wind: windy, as the trades are funnelled along the axis.
- **Vegetation and fauna.**
  - Rain-fed forest: giants in the side gorges, wind-pruned scrub on the spurs that face the axial wind.
  - Cliff-nesting soarers with 20 m wingspans ride the permanent ridge lift, almost never flap, and range the whole
    sound and out over the ocean.
- **Daily changes.**
  - Daily range 6–8 K.
  - The wind rises as the land heats. Afternoon rain grows heavier westward, toward the head of the sound.
- **Seasons.** Evergreen, with a double rain peak. Wind and rain are strongest when the trades are strongest.

#### L19 · Ius head delta and rain wall
- **Place.** The western dead end of the sound at Ius Chasma (7°S 275°E) and its delta.
- **Climate.**
  - Temperature: mean 20–22 °C.
  - Rain: a permanent rain wall. Rain falls on most hours, at the top of the sound's 3,000–4,500 mm range or above it;
    RH ~100%.
  - Wind: the trades pile up here with nowhere to go but up.
- **Vegetation and fauna.**
  - The planet's only quiet, stable, fine-grained delta.
  - Swamp forest on soft mud, reed beds and floating mats, with distributary channels that hold their courses.
  - A nursery for the sound's fish and divers.
- **Daily changes.** Continuous cloud; rain heaviest in the afternoon.
- **Seasons.** No season to speak of. River floods follow the two rain peaks.

### 3.5 The island volcanoes

#### L20 · Olympus flank forest
- **Place.** The lower flanks of Olympus Mons island (18.65°N 226.2°E, base ~600 km across), from sea level to ~6 km.
- **Climate.**
  - Temperature: mean 20 °C at the coast, falling to ~5 °C at 6 km.
  - Rain: 900–1,500 mm/yr (*est.*) on the windward east side, less on the west. It is not especially wet: the air
    arrives dried from the Tharsis lee and only partly remoistens over the ocean. RH 50–75%.
- **Vegetation and fauna.**
  - Moderate forest 40–90 m tall rather than rainforest, with glaciers descending into it.
  - One of only two nesting sites in the northern ocean: huge cliff colonies of pelagic soarers and a set of island
    endemics.
- **Daily changes.**
  - Daily range 9 K.
  - Cloud builds on the east flank by midday. Cold air drains off the ice into the upper forest at night.
- **Seasons.** Mild. The nesting colonies are largest in the long northern summer.

#### L21 · Olympus alpine desert
- **Place.** Olympus Mons between the treeline (~6 km) and the snowline (~10 km).
- **Climate.**
  - Temperature: mean −5 to +5 °C, 0.76–0.64 bar.
  - Rain: dry; RH 15–30%.
- **Vegetation and fauna.** Scrub, then bare lava fields and cinder slopes.
- **Daily changes.** Daily range 15–20 K (*est.*), with frost on most nights.
- **Seasons.** The snow line moves up and down with the seasons.

#### L22 · Olympus summit ice cap
- **Place.** Above ~10 km up to the summit at +19.2 km, the highest point on the planet.
- **Climate.**
  - Temperature: mean −5 to −28 °C.
  - Pressure: 0.35–0.42 bar at the summit, an Everest-class peak for breathing.
  - A permanent tropical ice cap spans ~8 km of height, and its glaciers flow down into warm forest.
- **Vegetation and fauna.** None.
- **Daily changes.** Surface melt only at the lower edge, around noon.
- **Seasons.** No real season.
  - Downwind the mountain throws a cloud-free wake ~2,000 km long with a von Kármán vortex street (see S03).

#### L23 · Elysium windward rainforest
- **Place.** The eastern flank of Elysium Mons island (25.0°N 147.2°E), from sea level to 6 km, in clean oceanic trade
  flow.
- **Climate.**
  - Temperature: mean 20–21 °C at the coast, ~5 °C at 6 km.
  - Rain: very wet, well above the belt's 1,800 mm/yr; RH 80–95%.
- **Vegetation and fauna.**
  - Forest from sea level to 6 km with a 100–200 m canopy.
  - Species-poor, with giant endemics.
  - Shares the northern nesting bottleneck with Olympus.
- **Daily changes.**
  - Daily range 7–8 K.
  - Orographic cloud by late morning; rain in the afternoon and evening.
- **Seasons.** Mild. The flank stays wet all year and is wettest in the northern wet season.

#### L24 · Elysium lee savanna
- **Place.** The western (lee) flank and coast of Elysium Mons, 0–3 km.
- **Climate.**
  - Temperature: mean 16–21 °C.
  - Rain: 400–900 mm/yr (*est.*) in a short wet season; RH 35–60%.
- **Vegetation and fauna.** Savanna with 5–8 m grasses and scattered flat-crowned trees.
- **Daily changes.** Daily range 10–12 K: hot afternoons and clear nights.
- **Seasons.** Brown in the dry season, green within days of the first rain.

#### L25 · Elysium summit
- **Place.** Elysium Mons above ~6 km, up to +12.1 km.
- **Climate.**
  - Temperature: mean +5 to −10 °C.
  - Rain: dry above the cloud layer.
- **Vegetation and fauna.** Alpine scrub and bare rock, then a marginal ice cap near the summit.
- **Daily changes.** Frost most nights.
- **Seasons.** The cap grows and shrinks from season to season.

### 3.6 The equatorial highland coast

#### L26 · Equatorial highland rainforest coast
- **Place.**
  - Mainly the northern shore of the southern highlands between 30°E and 130°E, 0–12°S, facing Syrtis Major, Isidis
    and Elysium Planitia.
  - Plus small low patches on north-western Tharsis near 245°E.
  - Almost all within 250 km of the sea, at 0–2 km.
- **Climate.**
  - Temperature: mean 17–22 °C, 23/21 °C summer/winter at sea level.
  - Rain: 2,000–3,000 mm/yr on 90–130 days; RH 80–90%.
  - Wind: convergent and light.
- **Vegetation and fauna.**
  - Evergreen lowland rainforest on a cratered coast, with crater lakes and heavy epiphytes.
  - The richest insect-scale and aerial-grazer life of any coast, under the thickest green haze of the aerial biome
    (A01).
- **Daily changes.**
  - Daily range 8 K.
  - Clear mornings. By afternoon, storms 30–35 km tall, with anvils visible from 400 km away; giant hail inland; rain
    at 13–19 h.
- **Seasons.**
  - No warm or cold season.
  - The ITCZ (mean 5°S) spends most of the year overhead, so the rain peaks twice, around sols 60–80 and 190–210.

### 3.7 Continent A: the southern crescent

#### L27 · Wet eastern shore forest
- **Place.** The east-facing (windward) coasts of Terra Cimmeria and Terra Sirenum and of the drowned-highland islands,
  12–45°S. It is a strip tens to a few hundred km wide where the trades come in off the sea.
- **Climate.**
  - Temperature: mean 19–21 °C, 26/15 °C summer/winter.
  - Rain: 1,100–1,400 mm/yr on 35–45 days; RH 60–85%.
  - Wind: onshore easterlies, 6–9 m/s (*est.*).
- **Vegetation and fauna.**
  - Coastal forest with a 30–150 m canopy. Freshwater crater lakes.
  - Beaded drainage chains that reach the sea export salt, so these coasts stay fresh.
  - Among the most species-rich places on the planet.
- **Daily changes.**
  - Daily range 9–11 K.
  - The sea breeze adds to the trades. Storms come in the afternoon in the wet season.
- **Seasons.** Sharp.
  - The short, hot perihelion summer is the wet season, with ~20 violent monsoon storms a year.
  - In the long, cool, dry winter many trees drop their leaves.

#### L28 · Crater-ring savanna
- **Place.**
  - The interiors of Terra Cimmeria and Terra Sirenum.
  - The west-facing lee shores, 15–40°S, from sea level to ~2.5 km.
- **Climate.**
  - Temperature: mean 19–21 °C, 26/15 °C summer/winter.
  - Rain: 700–1,100 mm/yr delivered on 20–30 days.
  - Humidity: RH 35–50% in the dry season and 70–80% in the wet. It still feels muggy all year, because absolute
    humidity is 2.6× Earth's.
- **Vegetation and fauna.**
  - Grasses 5–8 m tall.
  - Flat-crowned, heavily buttressed trees 40–80 m apart, and knee-high scrub on every crater rim.
  - Turgor giants: boneless land animals the size of a bus, pooling into low domes in the wind.
  - Hundred-tonne browsers on thin legs.
  - Dust devils 5–10 km tall.
  - No sprinting predators.
- **Daily changes.**
  - Daily range 12–15 K.
  - No heavy dewfall and little morning fog despite the humidity.
  - Dust devils at midday; storms in late afternoon in the wet season.
- **Seasons.** The strongest seasonality on the planet: the monsoon and perihelion are aligned.
  - The wet season, around sols 270–340, is violent.
  - The long dry season turns the plain brown; it greens within days of the first storm.

#### L29 · Crater-bowl forest and beaded lakes
- **Place.** Inside the impact craters of L27 and L28, and along the spillway gorges that link them.
- **Climate.**
  - The savanna climate, but in still air.
  - Humidity: RH 10–20 points higher than on the plain (*est.*).
  - Wind: near calm on the bowl floor.
  - In the wet season the lakes add dawn fog.
- **Vegetation and fauna.**
  - A 150 m canopy in every bowl, sharply bounded at the rim, so the plain reads as a field of green discs.
  - Gallery forest along the gorges. Crater lakes spill into each other through short, steep gorges with retreating
    knickpoints. Salt pans form where a chain ends in a closed basin.
  - A species pump: dwarf and giant variants of one lineage live in neighbouring craters, a single rim apart.
- **Daily changes.**
  - Daily range 8–10 K.
  - Cold air pools in the bowl at night. Fog fills it at dawn and burns off by mid-morning.
- **Seasons.**
  - In the wet season the chains flow and the lakes spill; in the dry season they break into isolated pools.
  - On the 25,500-year precession cycle: with today's violent monsoon, the gorge corridors are forested and the basins
    exchange species. In the gentle phase each bowl is isolated.

#### L30 · Sabkha salt flats
- **Place.** Hesperia Planum (20°S 110°E) and the low islands of the Arabia shallows (~20°N 15°E), within a metre or two
  of sea level.
- **Climate.**
  - Temperature: mean ~25 °C.
  - Rain: the belt's rain (700–1,400 mm/yr at Hesperia, 900–1,800 mm/yr at Arabia), but the salt cannot be leached out.
  - Humidity: RH 55–65%.
  - Capillary rise is 2.6× Earth's, keeping a 3–8 m wet fringe and a permanently damp crust.
  - Storm surges of 25 m reach hundreds of km inland.
- **Vegetation and fauna.** Nothing grows. Microbial mats live in the brine pools, and flyers feed at the edges.
- **Daily changes.**
  - Daily range 6–9 K.
  - A humid haze at noon; the crust stays damp even in sunshine.
- **Seasons.**
  - Storm surges re-salt the flats: at Hesperia in the southern wet season, at Arabia less often.
  - The coastline drifts with the precession-driven change in sea level.

#### L31 · Hellas warm arid shores
- **Place.** The shores of the Hellas gulf (42.4°S 70.5°E): mostly the south-east rim at 90–110°E, 45–70°S, plus the
  northern rim.
- **Climate.**
  - Temperature: mean ~15–22 °C (*est.*). The shores sit in the 45–60°S subsidence belt, and air warming as it sinks
    into the basin makes them 10–15 K warmer than the surrounding highlands.
  - Rain: 150–400 mm/yr; RH 25–40%, with coastal fog from the gulf.
  - Wind: weak and variable.
- **Vegetation and fauna.** Arid shores. Fog-fed shrubs on the seaward slopes, succulents inland, and sabkha belts left
  by decadal surge floods.
- **Daily changes.**
  - Daily range 12–15 K.
  - Fog banks drift in off the gulf in the morning and burn off by late morning. Afternoons are hot and calm.
- **Seasons.** A sharp thermal season: a short, hot perihelion summer and a long, cool winter. Rain is episodic, not
  seasonal.

#### L32 · Cool desert coast
- **Place.** The coasts of the southern crescent in the 45–60°S subsidence belt: the drowned Noachis islands, and the
  shores north of Aonia Terra and around Argyre.
- **Climate.**
  - Temperature: mean 8–14 °C, 19/3 °C summer/winter.
  - Rain: 200–400 mm/yr in 3–4 cloudbursts; RH 30–45%.
  - Wind: weak and variable.
  - Skies are clear. There is no fog desert, because there is no cold upwelling.
- **Vegetation and fauna.** Coastal succulent scrub and salt-tolerant strand. Plants are built for floods, not drizzle.
- **Daily changes.**
  - Daily range 10–12 K.
  - Afternoon sea breeze; clear, cold nights with frost in winter.
- **Seasons.** A short, warm perihelion summer and a long, cold winter. Rain can come at any time.

#### L33 · Salt-pan crater desert
- **Place.** The closed (endorheic) crater basins behind L32, where beaded drainage chains end without reaching the
  sea.
- **Climate.**
  - Temperature: mean 8–14 °C.
  - Rain: 200–400 mm/yr in 3–4 cloudbursts; RH 25–35%.
- **Vegetation and fauna.**
  - Crater floors are salt pans, soda lakes and brine pools, surrounded by flood-adapted succulents.
  - This is the salt sink of Continent A.
  - Brine specialists and filter feeders live on the soda lakes.
- **Daily changes.**
  - Daily range 15 K or more.
  - Bright, hot afternoons in summer; hard frost on winter nights.
- **Seasons.**
  - A cloudburst fills a basin for weeks; evaporation then lays down a new layer of salt.
  - Over precession cycles, more basins are isolated when the monsoon is gentle.

#### L34 · Storm-coast temperate rainforest
- **Place.** Aonia Terra and the southern uplands at 60–72°S, below the treeline at ~0.6 km.
- **Climate.**
  - Temperature: mean 4–8 °C, 11/1 °C summer/winter.
  - Rain: 1,200–2,000 mm/yr on 150–200 days; RH 80–90%.
  - Wind: westerlies of 10–20 m/s (*est.*) under the single jet, and three giant cyclones per hemisphere.
- **Vegetation and fauna.** Dense, low temperate rainforest 20–40 m tall, wind-pruned, with blowdown mosaics.
- **Daily changes.**
  - Daily range 6 K.
  - Weather systems matter more than the time of day.
  - Poleward of 64.8°: sunlit around the clock at the height of summer, dark at midwinter.
- **Seasons.** Moderate, alternating stormy and calm spells as the jet moves. Summer is short, winter long and stormy.

#### L35 · Fjord-head forest
- **Place.** The inner heads of the fjord-like inlets on the storm coast, where the westerlies cannot reach.
- **Climate.**
  - Storm-coast rain, but in calm air.
  - Frost is milder, and the air is often misty.
- **Vegetation and fauna.**
  - Giant trees 60–150 m tall (*est.*), where the shelter is genuine.
  - Epiphyte-draped and dark.
  - The richest forest fauna of the far south.
- **Daily changes.** Mist at dawn; little wind at any hour.
- **Seasons.** As on the storm coast, but storms bring rain here rather than wind damage.

#### L36 · Storm upland heath
- **Place.** Storm-coast uplands above the treeline, from ~0.6 km upward.
- **Climate.**
  - Temperature: mean 0–4 °C.
  - Rain: wet and windy, with snow in winter.
- **Vegetation and fauna.** Heath, blanket bog and wind-cut krummholz.
- **Daily changes.** Daily range 5–7 K.
- **Seasons.** A snow cover in the long winter; boggy thaw in the short summer.

### 3.8 The south pole

#### L37 · Sandur and krummholz margin
- **Place.** The ice-free fringe around Planum Australe, at ~72–74°S.
- **Climate.**
  - Temperature: mean −2 to +2 °C.
  - Rain: heavy snow and rain, 600–1,000 mm/yr.
  - Wind: katabatic winds off the ice.
- **Vegetation and fauna.**
  - Krummholz 1–4 m tall reaches to ~73°S.
  - Braided sandur plains, jökulhlaup channels and exceptionally wide, shallow outwash.
  - Life here is repeatedly wiped out and recolonised from lower latitudes; nothing is ancient.
- **Daily changes.** The sun circles low in summer. Winter brings long polar night.
- **Seasons.** Violent: meltwater floods in the perihelion summer. The margin is retreating now.

#### L38 · Planum Australe ice sheet
- **Place.** The south polar cap, centred on 83°S, at +0.5 to +1.5 km (up to ~2.8 km in the data).
- **Climate.**
  - Temperature: mean around −6 °C, 3/−12 °C summer/winter.
  - Snow: 600–1,000 mm/yr; RH 85–95%.
  - It is maritime and wet-based, not a polar desert: Patagonian, not Antarctic.
- **Vegetation and fauna.** None on the ice.
- **Daily changes.** None in polar night, which lasts up to ~200 sols near the pole. In summer the sun circles the sky.
- **Seasons.** Violent: perihelion melt against aphelion accumulation.
  - Now: melt lakes, fast outlet glaciers and calving icebergs; the cap is retreating.
  - In ~25,500 years the cap will grow instead.

---

## 4. Sea biomes

At sea, the three things that define a biome are **temperature**, **humidity** and **wind**. Wave heights follow the
rule in §1.1.

### 4.1 The northern ocean

#### S01 · Equatorial warm ocean
- **Place.** Open water between 12°S and 12°N: Isidis Planitia, Elysium Planitia, the waters over the Syrtis Major
  platform, and southern Chryse.
- **Temperature.** Surface 22–24 °C all year. Below the surface layer the deep water is 10–15 °C.
- **Humidity and rain.** RH 80–90%; precipitable water 130–150 mm; 2,000–3,000 mm/yr on 90–130 days.
- **Wind and waves.**
  - Light, converging winds of 2–5 m/s: the local sea is under 1 m.
  - Long swell of 2–4 m at 15–20 s rolls in from both trade belts.
  - Squalls of 15–25 m/s last an hour or so under the storms.
- **Life.** Beneath the thickest green haze of the aerial biome. The surface water is freshened by rain.
- **Daily changes.** Air swing 1–2 K. Over open water the storms peak at night and before dawn.
- **Seasons.** The ITCZ passes twice a year. Between passages come calm spells like doldrums.

#### S02 · Northern trade-wind ocean
- **Place.** Utopia, Acidalia and Chryse, 12–45°N: deep ocean broken only by Olympus and Elysium.
- **Temperature.** Surface 18–21 °C; air 22 °C in summer and 17 °C in winter.
- **Humidity and rain.** RH 70–80% in the wet season and 35–50% in the dry; 900–1,800 mm/yr on 40–70 days.
- **Wind and waves.**
  - Steady easterlies of 7–10 m/s over 12,000 km of fetch: the largest seas on the planet, typically 4–5.5 m at a 19 s
    period.
  - A narrow, fast western boundary current (50–70 km wide) runs along the east coast of Tharsis.
- **Life.** An open subtropical gyre, poor in nutrients at the centre. Pelagic soarers range from the two islands.
- **Daily changes.** Air swing 2–3 K; trade cumulus in the afternoon.
- **Seasons.** Mild. The northern summer is long and mild because it falls at aphelion.

#### S03 · Amazonis lee sea
- **Place.** The deep ocean west of Tharsis: 180–236°E, 0–45°N.
- **Temperature.** Surface 19–22 °C. The water is very salty: with the 45–60°N belt, this is the planet's salinity
  maximum.
- **Humidity and rain.** Drier than the open trade ocean: RH 50–70% (*est.*), and rain toward the low end of 900–1,800
  mm/yr.
- **Wind and waves.**
  - Weaker winds in the lee of Tharsis, 4–7 m/s: local seas 1–2.5 m, plus swell from the open trades.
  - Downwind of Olympus runs a cloud-free wake ~2,000 km long with a von Kármán vortex street. Its wind-stress curl
    spins up an ocean countercurrent.
- **Life.** Clear, blue, nutrient-poor water.
- **Daily changes.** Air swing 2–3 K; clear nights.
- **Seasons.** Mild, and drier than the ocean around it.

#### S04 · Tharsis tip-jet seas
- **Place.** Offshore near 45°N and 45°S, where the trades split and bend around the two ends of Tharsis.
- **Temperature.** Surface 12–16 °C; the wind mixes up cooler water from below.
- **Humidity and rain.** RH 40–60%; 300–800 mm/yr (*est.*).
- **Wind and waves.** Permanent boundary jets of 12–20 m/s (*est.*) raise short, steep seas of 5–15 m where the fetch
  allows.
- **Life.** Wind-driven mixing brings nutrients up, making plankton-rich strips where pelagic flyers feed.
- **Daily changes.** Steady day and night.
- **Seasons.** The jets drift a few degrees toward the summer pole.

#### S05 · Northern subsidence sea
- **Place.** Open ocean at 45–60°N, near the gyre's wind-stress curl line.
- **Temperature.** Surface 10–15 °C; the air ranges from 3 °C in winter to 19 °C in summer, damped by the ocean.
- **Humidity and rain.** RH 25–40%; precipitable water 25–40 mm; 150–400 mm/yr on 4–10 days. Skies are clear and
  evaporation is high: the planet's salinity maximum.
- **Wind and waves.** Weak, variable winds of 2–5 m/s: local seas under 1 m, with a long swell coming down from the
  storm track.
- **Life.** Clear, nutrient-poor water. Warm, saline water sinks here to form the deep ocean. The aerial mats above are
  thin.
- **Daily changes.** Air swing ~3 K; clear, starry nights.
- **Seasons.** A buffered thermal season with very little rain in any month.

#### S06 · Northern storm track
- **Place.** Open ocean at 60–72°N: the cleanest storm track on the planet.
- **Temperature.** Surface 4–8 °C.
- **Humidity and rain.** RH 80–90%; 1,200–2,000 mm/yr on 150–200 days.
- **Wind and waves.**
  - Westerlies of 12–25 m/s under the single jet (40–90 m/s at 35 km altitude).
  - Three giant cyclones with no land to break them.
  - Seas are 10–20 m on ordinary days and 22–35 m at a 48 s period in storms.
- **Life.** Cold, well-mixed, nutrient-rich water; the most productive open ocean in the north.
- **Daily changes.** Weather matters more than the time of day. Poleward of 64.8°: sunlit around the clock at the height
  of summer, dark at midwinter.
- **Seasons.** Alternating stormy and calm spells as the jet moves. The short northern winter is the stormiest time.

#### S07 · Seasonal ice margin
- **Place.** The edge of the northern sea ice, ~70–80°N. Sea-level freezing happens only poleward of ~73°, so the ice
  that reaches 70°N has drifted there.
- **Temperature.** Air −5 to +4 °C; water near freezing.
- **Humidity and rain.** RH 85–95%; 400–700 mm/yr on 100–140 days, as rain in summer and snow in winter.
- **Wind and waves.** Weak easterlies of 4–8 m/s. Floating ice damps the waves; the water is open in summer.
- **Life.** A plankton bloom at the ice edge in summer: the richest ice biome.
- **Daily changes.** Small. Long days in summer; polar night near the core.
- **Seasons.**
  - The ice spreads south during the short northern winter and retreats through the long summer.
  - With the north summer at aphelion, today there is more sea ice than in the opposite precession phase.

#### S08 · Perennial pack ice
- **Place.** The permanently frozen core of the north polar ocean over Vastitas Borealis, poleward of ~80°N.
- **Temperature.** Air −10 to 0 °C.
- **Humidity and rain.** RH 85–95%; light snow.
- **Wind and waves.** Weak easterlies. A circumpolar current isolates the pole thermally. There are no waves under the
  pack.
- **Life.** Algae under the ice and sparse life below.
- **Daily changes.** None in polar night, which lasts ~163 sols at the pole (sols 203–366).
- **Seasons.** Weak thermal change but a strong ice cycle. There is no land ice anywhere in the north.

### 4.2 Enclosed waters

#### S09 · Valles Marineris sound
- **Place.** The flooded sound itself: 4,000 km long, 100–200 km wide, floor at −7 km.
- **Temperature.** Surface 22–25 °C.
- **Humidity and rain.** RH 85–95%; 3,000–4,500 mm/yr.
- **Wind and waves.**
  - The trades are funnelled along the axis, so it is windy.
  - Steep wind seas of 1–3 m (*est.*).
  - No ocean swell and no storm surge: the sound is the only large body of water sheltered from both.
- **Life.**
  - A thin, productive surface layer over water that is anoxic below a few hundred metres.
  - The floor pressure is 260 bar, what an Earth diver meets at 2.6 km. Abyssal air-breathers commute to the floor.
- **Daily changes.** The wind rises by day; rain falls in the afternoon.
- **Seasons.** Little change beyond the double rain peak.

#### S10 · Side-chasma still water
- **Place.** The water in Melas, Candor, Ophir and Hebes Chasmata.
- **Temperature.** Surface 22–25 °C.
- **Humidity and rain.** RH ~100%; permanent mist.
- **Wind and waves.** Dead calm and glassy.
- **Life.** A calm nursery under the sky-nets. Anoxic below a few hundred metres.
- **Daily changes.** Hardly any.
- **Seasons.** Hardly any.

#### S11 · Hellas gulf
- **Place.** A 2,300 km gulf with its floor at −10.2 km, reached through a single strait near Dao Vallis.
- **Temperature.** Surface 14–22 °C (*est.*), warmed by the sinking air of the subsidence belt.
- **Humidity and rain.** RH 30–50% over the water, with fog along the shores; 150–400 mm/yr in a few events.
- **Wind and waves.** Weak, variable winds: seas under 1 m most days, and 1–3 m when the wind rises across the long
  fetch.
- **Life.**
  - The surface water stays near normal salinity, flushed through the strait.
  - Below ~500 m the gulf is euxinic: anoxic, sulfidic and permanently stratified. A Black Sea at ten times the scale.
- **Daily changes.** Morning fog along the shore; hot, calm afternoons.
- **Seasons.** A sharp perihelion summer. Big surge floods on the shores come about once a decade.

#### S12 · Argyre gulf and Uzboi–Ladon inlet
- **Place.** An 800 km gulf at 49.7°S 316°E (floor −7.2 km) and the 2,000 km fjord-like inlet running north from it
  through the Uzboi–Ladon–Margaritifer corridor.
- **Temperature.** Surface 6–12 °C (*est.*).
- **Humidity and rain.** Clear and dry: RH 25–40%; 150–400 mm/yr.
- **Wind and waves.** Weak winds and a sheltered inlet: small seas.
- **Life.** Productive surface water over anoxic depths behind a shallow sill.
- **Daily changes.** Air swing 3–5 K.
- **Seasons.** A sharp thermal season, with a short summer.

#### S13 · Surge shallows
- **Place.** The two flattest sea margins on the planet.
  - The **Arabia shallows** (~20°N 15°E): a shallow sea and archipelago over a platform 0.5–1.5 km deep.
  - The lagoons and flooded flats of **Hesperia Planum** (20°S 110°E).
- **Temperature.** Surface 20–25 °C.
- **Humidity and rain.** RH 55–70%. Arabia gets 900–1,800 mm/yr; Hesperia gets 700–1,400 mm/yr.
- **Wind and waves.**
  - Trade easterlies of 6–9 m/s raise 3–5 m seas that break over the banks.
  - Storm surges of 25 m run hundreds of km inland, which happens nowhere else.
- **Life.**
  - Warm, productive banks, and saline lagoons around the sabkha (L30).
  - The coastline never stabilises, so shallow-water life stays mobile and salt-tolerant.
- **Daily changes.** Air swing 3–5 K; a humid haze over the flats.
- **Seasons.** Surges peak in each hemisphere's storm season: summer at Hesperia, more rarely at Arabia.

### 4.3 The southern seas

#### S14 · Drowned highland sea
- **Place.**
  - The flooded southern highlands at 12–45°S: most of Noachis, the lower parts of Terra Cimmeria and Terra Sirenum,
    and the waters around Hesperia.
  - Depth 200–2,000 m over cratered ground, with crater rims rising as banks and ring islands.
  - The largest sea biome in the south.
- **Temperature.** Surface 16–24 °C, with a sharp season for an ocean (air 26 °C in summer, 15 °C in winter).
- **Humidity and rain.** RH 35–80%; 700–1,400 mm/yr on 25–45 days, mostly in the perihelion monsoon.
- **Wind and waves.** Easterlies of 6–9 m/s with the fetch broken by islands: 2–4 m seas, and trade swell through the
  gaps.
- **Life.**
  - Crater-rim banks become reefs of attached organisms.
  - Migrating midwater animals easily reach the floor at 2 km.
- **Daily changes.** Air swing 2–3 K; afternoon storms over the islands.
- **Seasons.** Warm and stormy in the short summer; cool and dry in the long winter.

#### S15 · Southern subsidence sea
- **Place.** Open water at 45–60°S, mostly 200–2,000 m deep over the drowned Noachis highlands.
- **Temperature.** Surface 8–15 °C; air 19 °C in summer and 3 °C in winter.
- **Humidity and rain.** RH 25–40%; 150–400 mm/yr on 4–10 days. Skies are clear.
- **Wind and waves.** Weak, variable winds of 2–5 m/s, with long swell from the southern storm sea.
- **Life.** Clear, nutrient-poor water.
- **Daily changes.** Air swing ~3 K.
- **Seasons.** A sharp thermal season set by perihelion.

#### S16 · Southern storm sea
- **Place.** Water at 60–72°S between the storm coasts of Continent A.
- **Temperature.** Surface 3–8 °C.
- **Humidity and rain.** RH 80–90%; 1,200–2,000 mm/yr on 150–200 days.
- **Wind and waves.**
  - Westerlies of 12–25 m/s and three giant cyclones: seas 8–30 m.
  - Because the coasts break the fetch, storms hit as 25 m surges, which flood 25 km inland on a 1 m/km coast.
- **Life.** Cold and nutrient-rich; feeding grounds for soarers and divers.
- **Daily changes.** Weather matters more than the time of day. Polar day and night poleward of 64.8°.
- **Seasons.** Alternating stormy and calm spells, with the long winter stormiest.

#### S17 · South polar iceberg sea
- **Place.** Water poleward of 72°S around Planum Australe.
- **Temperature.** Air −4 to +3 °C. In summer a fresh meltwater layer caps the surface.
- **Humidity and rain.** RH 85–95%; 600–1,000 mm/yr, mostly snow.
- **Wind and waves.** Katabatic winds of 8–15 m/s (*est.*) blow off the cap. Seas are short near the ice.
- **Life.** Icebergs calved from fast outlet glaciers, and a melt-fed plankton bloom in summer.
- **Daily changes.** Polar day in summer, polar night in winter.
- **Seasons.**
  - Violent: seasonal sea ice in the long winter, and melt and calving in the perihelion summer.
  - The cap is currently retreating.

### 4.4 Across all seas

#### S18 · Surf and splash zone
- **Place.** Every coast exposed to open water, from the wave base to the top of the spray.
- **Conditions.**
  - Storm waves reach 25 m while tides are feeble, so there is barely an intertidal zone.
  - Instead there is a wide, permanently pounded splash zone.
  - No estuaries or tidal flats; river mouths are cuspate.
  - The exceptions are the Valles Marineris sound and its side chasmata.
- **Life.** Low, thick and ferociously attached: the harshest habitat on the planet.
- **Daily changes.** Tides are tiny. The rhythm is the arrival of long wave sets, with periods up to 48 s.
- **Seasons.** Heaviest in each coast's storm season.

#### S19 · Migrating midwater
- **Place.** All deep water, 200–3,000 m.
- **Conditions.** Pressure rises 2.6× more slowly than on Earth, so gas-filled swim bladders keep working to great
  depth.
- **Life.**
  - Daily vertical migrations of 2–3 km are routine, with no barotrauma.
  - Marine snow sinks 2.6× more slowly than on Earth, so food is reworked in the water column and midwater suspension
    feeders are abundant.
  - Air-breathing divers reach 3–4 km.
- **Daily changes.** The animals rise at dusk and sink at dawn.
- **Seasons.** They follow the plankton blooms of the surface biome above.

#### S20 · Dead abyss and anoxic basins
- **Place.** The deep sea below ~500 m in most basins, and all enclosed deeps: Valles Marineris below a few hundred
  metres, Hellas below ~500 m, and Argyre behind its sill.
- **Conditions.**
  - Warm deep water of 10–15 °C, fed by warm saline water sinking in the subsidence belts.
  - Overturning is sluggish, and weak tides give little mixing.
  - Widespread anoxia; euxinic in Hellas.
- **Life.** Largely dead. The seafloor is starved because little food falls through the midwater.
- **Daily changes.** None.
- **Seasons.** None. Changes come only on the precession cycle.

---

## 5. Fresh water and river biomes

A river is not just a line on the map. It carries its own water table, its own soil and its own food supply into
whatever biome it crosses, so the ribbon along the water is a habitat in its own right: a light gap in a rainforest,
an evergreen line across a brown savanna, a permanently misted wall below a fall. The seven long-term rivers and the
lakes named here come from `rivers.md`.

What makes these rivers different from Earth's:
- Water flows at 62% of Earth's speed for the same slope, so a channel is **1.6× wider** for the same discharge:
  about 7.7·√Q metres, which is ~1,700 m for the Solis River's 49,700 m³/s and ~500 m for the Tholus River's 4,300.
- Nearly every river is **braided**, and fine silt settles 2.6× more slowly, so the water stays **turbid**. Almost
  nothing grows in the channel itself; the food comes off the bank.
- **Falls over ~500 m atomise into drifting mist** before they land. They barely erode, so they last for geological
  ages, and they water everything downwind.
- Heavy cratering makes most rivers **chains of lakes**: water fills a crater, spills over its lowest rim, fills the
  next.
- Mouths are **wave-dominated and cuspate**. There are no estuaries and no tidal flats.

### 5.1 Reaches of the seven rivers

| River | Source to sea |
|---|---|
| Solis | R02 → R06 (trough lakes) → R05 (Lake Solis, Lake Thaumasia) → R04 (the rim gorge) → R01 → R08 → R09, into S14 |
| Thaumasia | R02 (upper gorge) → R06 (lake string) → R01 → R08 → R09, into S14 |
| Sabaea | R06 and R04 alternating the whole way → R08 → R09, into S01 |
| Hebes | R02 → R06 (Lake Hebes) → R02 (Hebes Falls), into S10 |
| Tyrrhena | R06 → R04 (the spillway) → R06 (the coastal crater lake) → R01 → R08 → R09, into S01 |
| Tholus | R01 the whole way, with no lakes → R08 → R09, into S01 |
| Pavonis | R03 → R06 (source lakes) → R01 → R03 (the L14 corridor) → R08 → R09, into S02 |

R07 belongs to the rivers that never reach the sea: see the closed lakes in `rivers.md`.

### 5.2 River corridors

#### R01 · Rainforest river corridor and gravel braids
- **Place.** The floodplains of rivers crossing wet forest: the whole Tholus River (L02, L01), the lower Solis and
  Thaumasia (L01), the lower Tyrrhena and Sabaea (L26) and the side gorges of the sound (L18). The ribbon is a few
  hundred metres wide on a small river and ~3 km on the Solis.
- **Climate.**
  - The host biome's climate, a little cooler by day and damper at night: RH 90–100% over the water (*est.*).
  - The gap is the only place in the forest with direct midday sun and a breeze along its axis.
- **Vegetation and fauna.**
  - A light gap with a wall on either side. The forest stands 150–250 m; on the bars, fast pioneers 20–40 m tall hold
    the gravel until the next flood takes them.
  - Braids shift after every big storm, so the corridor is a moving mosaic of even-aged stands. The Tholus River,
    which has no lakes to buffer it, rebuilds its channels almost yearly.
  - The water is too turbid to grow anything, so the food chain runs on leaf fall, fruit and the rain of small
    animals from the banks.
  - The heaviest large-animal traffic in the rainforest. Stilt-waders 60–80 m tall fish the shallows, gliders cross at
    canopy height, and fish-eating flyers work the bars. Predators ambush at the bank: at 0.38 g nothing can sprint.
- **Daily changes.**
  - River fog lies in a band along the channel at dawn and burns off by mid-morning.
  - The river rises in the evening, a few hours after the 13–19 h storms.
- **Seasons.**
  - Evergreen, with two flood peaks where the ITCZ passes twice (sols ~60–80 and ~190–210), or one violent perihelion
    flood south of ~12°S (sols ~270–340).
  - The flood that comes every few years strips the bars bare and starts the mosaic again.

#### R02 · Montane torrent and mist-fall walls
- **Place.** The steep reaches. The head of the Solis River off the Melas wall; the Thaumasia upper gorge, falling
  ~14 m/km from +3,500 m to +660 m in 200 km; and the Hebes River, which ends in a fall of about 1,200 m over the
  north rim of Hebes Chasma. They cut through L02, L03 and L17.
- **Climate.**
  - Temperature: 8–16 °C in the cloud-forest gorges, about 19 °C at the foot of Hebes Falls.
  - RH ~100% in the spray. Mist from a fall over 500 m drifts for kilometres, so the walls downwind are far wetter
    than the rain alone would make them.
  - Loud, and windless except for the fall's own downdraught.
- **Vegetation and fauna.**
  - Spray-fed rock: mosses, cushion plants and heavy epiphytes grow on bare walls where nothing is rooted in soil.
  - Clingers and filter feeders in the torrent. Nothing swims up a fall, so the water above each one holds its own
    isolated community.
  - Hebes Falls carves no plunge pool, so there is no basin below it: only a permanently drenched apron of boulders
    under a white column visible for hundreds of kilometres.
  - Its mist keeps the surrounding walls saturated, which is the shelter the sky-nets of L17 need.
- **Daily changes.** The mist column leans with the afternoon wind. Flow peaks a few hours after the afternoon rain in
  the unbuffered gorges; below a big lake it hardly changes at all.
- **Seasons.** Violent in the Thaumasia gorge, where each monsoon cloudburst arrives as a wall of water. Steady on the
  Hebes, whose lake holds hundreds of km³ for every metre of depth.

#### R03 · Savanna and dry-coast gallery corridor
- **Place.** Rivers crossing seasonally dry or arid country: the Pavonis River through the drought-deciduous
  north-west coast (L14), the plateau-margin reaches (L04), the beaded chains of the southern savanna (L28) and the
  wetland bands where a river bleeds into desert (L12, L13). L06 is the same idea on glacier melt, dying into a playa;
  this one is rain-fed and reaches the sea.
- **Climate.**
  - The host climate, except that the strip within about ten channel widths of the water keeps its water table all
    year.
  - RH 40–70% under the gallery canopy against 20–35% on the open plain in the dry season.
  - Cold air pools in the valley at night, so there is more frost and more dawn fog than on the plain.
- **Vegetation and fauna.**
  - An evergreen ribbon 40–80 m tall through country that is leafless or brown for half the year: from above, a green
    line drawn across a brown plain.
  - Deep-rooted gallery trees, reed beds in the backwaters, and a sharp edge where the water table drops away.
  - In the dry season the corridor holds the animals of the whole region. Hundred-tonne browsers on thin legs and
    turgor giants come down to drink, and every predator waits in the reeds.
  - In dry country the river loses water as it goes, over a wetland band about ten times the channel width, so the
    ribbon narrows downstream and the smaller rivers end in R07.
- **Daily changes.**
  - Valley fog at dawn. The bank is crowded at dawn and dusk and empty at noon.
  - Dust devils 5–10 km tall cross the plain on either side.
- **Seasons.**
  - The flood comes with the region's wet season and can double the channel width for a few sols.
  - The plain greens within days of the first storm, and for a few months the corridor stops being special.

#### R04 · Spillway gorge and knickpoint stair
- **Place.** The short, steep links between the lakes of a beaded river: the Sabaea River's whole course, nearly level
  at ~1.3 m/km between lakes but stepping down through gorges with a waterfall at the head of each; the Tyrrhena
  spillway; the Solis River's gorge through the Thaumasia rim, ~860 m in 180 km; and the crater-chain gorges of L29.
- **Climate.** The host climate in a slot: still air, spray, and RH 10–20 points above the plain above (*est.*).
- **Vegetation and fauna.**
  - Gallery forest in the slot, taller and darker than anything on the rim.
  - The gorge is the only path from one lake to the next, so it is the whole of the species pump of L29: dwarf and
    giant variants of one lineage live in neighbouring lakes, a single rim apart.
  - The waterfall at each gorge head is a one-way gate. Things travel downstream easily and upstream never, unless
    they fly.
  - Knickpoints retreat upstream over geological time. When one cuts back through a rim, the lake above it drains.
- **Daily changes.** Little, beyond fog in the slot at dawn.
- **Seasons.** In the wet season the chain flows and the lakes spill; in the dry season the gorges fall to a trickle
  and the lakes are cut off from each other. Over the precession cycle the whole network connects and disconnects.

### 5.3 Lakes

#### R05 · Freshwater inland sea
- **Place.** The two great lakes of the Solis River. **Lake Solis** is 761,000 km² and up to 1,890 m deep, larger than
  the Caspian Sea, with its surface at +1,290 m; **Lake Thaumasia** is 104,000 km², one step lower at +940 m. Both
  stand in closed basins whose level is set by a rock spill point, not by the ocean.
- **Temperature.** Surface about 17 °C: around 23 °C in summer and 12 °C in winter. It damps the season like a small
  ocean, in a belt that otherwise has a sharp one.
- **Humidity and rain.** RH 50–70% over the water (*est.*), in a basin that gets under 100 mm/yr on its dry western
  side and 3,000–4,000 mm/yr on the escarpment to the east. The lake evaporates ~25,000 m³/s, more than half of what
  flows in, and that water falls again downwind.
- **Wind and waves.** Steppe winds of 6–10 m/s (*est.*) over 800 km of fetch raise 2–5 m seas at 12–19 s: real surf on
  a freshwater shore, with no tide and no swell arriving from outside.
- **Life.**
  - Fresh, cool and open, with no connection to the ocean and none to any other lake. Everything in it is endemic.
  - Wave-cut cliffs and long gravel beaches on the windward shore. The western shores are dry steppe and savanna
    (L04, L05) and the eastern shores are escarpment forest (L02), so one lake has a desert coast and a rainforest
    coast.
  - Flyers commute to the middle of the lake, which is well beyond sight of land.
- **Daily changes.** Calm at dawn; a lake breeze and whitecaps by afternoon. The shore is 5–8 K milder at night than
  the plateau behind it.
- **Seasons.** The level moves little, because the spill point fixes it, but the summer flood raises it enough to
  drown the beaches. With a gentler monsoon in ~25,500 years both lakes will steady and shrink.

#### R06 · Deep crater lake
- **Place.** The lakes strung along the beaded rivers. The Sabaea River's main lake is 24,600 km² and 875 m deep, and
  one of its neighbours is only 865 km² but nearly 700 m deep; the Tyrrhena main lake is 40,600 km² and its coastal
  crater lake 1,650 m deep; the Solis trough lakes reach 1,180 m; and **Lake Hebes**, 26,700 km² and up to 7,260 m
  deep, is the deepest fresh water on the planet. Shallower steps, like the Thaumasia River's 115 m lake, are the same
  biome with a mixed water column and no dead layer.
- **Temperature.** Surface 19–22 °C on the equatorial chains, with almost no season. Below the surface layer, 10–15 °C
  and unchanging.
- **Humidity and rain.** RH 80–90%, and higher in the walled lakes; the host biome's rain, 2,000–3,000 mm/yr on the
  equatorial chains.
- **Wind and waves.** The fetch inside a crater rim is short, so seas stay under 1 m, and the walled lakes are glassy.
  Lake Hebes, 4 km below its rim, never feels a wind at all.
- **Life.**
  - Still, clear water over a dead deep. Below a few hundred metres it never turns over, so the floor is anoxic, as in
    the sound (S09, S20).
  - Pressure rises 2.6× more slowly than on Earth, so divers and swim-bladdered animals work the whole lit column
    without trouble.
  - Each lake is an island. A rim apart, one lineage appears as a dwarf in this bowl and a giant in the next; R04 is
    the only door between them.
  - Shoreline forest runs right down to the water, and the banks are the calmest large habitat in a rainforest.
- **Daily changes.** Fog on the water at dawn, gone by mid-morning. Hardly any air swing.
- **Seasons.** Almost none on the equatorial chains. Lake Hebes is so deep that the two rain peaks do not move its
  level enough to see.

#### R07 · Terminal salt lake and playa
- **Place.** Where a river dies inland. The largest are the Terra Sirenum lake (104,000 km², 2,080 m deep, taking
  2,760 m³/s), the southern Tharsis lake (130,000 km²), the Sabaea closed lake (60,000 km²) and the Syria lake
  (96,000 km², up on the plateau at +4,330 m). They end the inland rivers of Tharsis, the southern savanna and the
  subsidence deserts (L05, L12, L28, L32). L33 is the same thing at crater scale; L06 is its glacier-fed version.
- **Temperature.** The host biome's, plus a few kelvin: dark brine and bare salt take up more sun than the land around
  them.
- **Humidity and rain.** Dry air over standing water. Everything that flows in evaporates, so the lake is never bigger
  than this year's inflow.
- **Wind and waves.** Shallow water on a flat floor keeps waves under 1 m, and the shoreline moves tens of kilometres
  with the level, so nothing is ever cut into it.
- **Life.**
  - Brine. Salinity runs from drinkable at the inflow to crystallising at the far end, and each band has its own
    specialists: microbial mats, filter feeders and brine swimmers.
  - Huge flyer flocks. It is the only rich food in an arid region, and a safe one, because nothing heavy can wade far
    over soft salt at 0.38 g.
  - Salt-tolerant scrub and reed beds where the river comes in; bare, cracked evaporite everywhere else, in terraces
    that record older and higher levels.
  - This is the salt sink of its basin, which is part of why the rivers that do reach the sea keep their coasts fresh
    (L27).
- **Daily changes.** A humid haze and heavy shimmer at noon over a crust that stays damp underneath.
- **Seasons.**
  - The lake fills in the wet season and shrinks to a crust in the dry, laying down a new layer of salt each year.
  - Over the precession cycle a gentle monsoon leaves some basins dry for centuries, while a violent one can raise a
    playa into a lake deep enough to spill.

### 5.4 Mouths

#### R08 · Cuspate delta and beach-ridge shore
- **Place.** Every river mouth on an open coast: the Solis and Thaumasia deltas on the drowned highland sea, close
  enough that their plumes merge; the Tholus delta on the Chryse approaches; the Pavonis delta on the northern trade
  ocean; and hundreds of smaller ones. The exception is L19, at the head of the sound, which is the planet's only
  quiet, fine-grained delta.
- **Climate.** The host biome's coastal climate, with an afternoon sea breeze and salt spray carried inland over the
  ridges.
- **Vegetation and fauna.**
  - Waves are huge and tides about a third of Earth's, so the sea, not the river, builds the mouth. Every delta is a
    blunt cusp of sand and gravel; there is not one estuary or tidal flat on the planet.
  - Trade seas of 4–5.5 m drive sediment along the coast into long beach ridges. The Pavonis mouth has built tens of
    kilometres of them.
  - Behind the ridges lie abandoned channels, brackish ponds and swamp forest: the calm nursery ground the open mouth
    cannot offer.
  - Strand plants and pioneers hold the young ridges and forest takes the old ones, so the shore reads as stripes of
    successively older vegetation.
  - The channel jumps to a new course every few decades, stranding a whole ridge set.
  - Storm surge is 2.6× Earth's and reaches surge height ÷ slope inland: 25 km on a 1 m/km delta plain.
- **Daily changes.** Wave sets with periods up to 48 s work the front; the afternoon sea breeze drives spray over the
  ridges.
- **Seasons.** The river builds the delta out in the flood season and the storm season cuts it back. A mouth on a
  monsoon coast does both in the same year.

#### R09 · River plume and brackish lens
- **Place.** The water offshore of every large mouth, and far more of it than on Earth. The Solis and Thaumasia plumes
  merge into one band along the coast of S14; the Tholus, Tyrrhena and Sabaea plumes colour the equatorial ocean
  (S01); the Pavonis plume is dragged down-coast by the trade ocean's narrow western boundary current (S02).
- **Temperature.** One to three kelvin warmer than the sea around it in summer and colder in winter: it is a thin skin
  of river water, so it follows the land rather than the ocean.
- **Humidity and rain.** As in the host sea.
- **Wind and waves.** The lens is buoyant enough to damp short chop, so the plume front shows as a slick, sharply
  bounded band with steeper water on the seaward side.
- **Life.**
  - Silt settles 2.6× more slowly than on Earth, so the brown water reaches hundreds of kilometres offshore before it
    clears, far beyond anything an Earth river manages.
  - Inside the plume it is too dark to grow anything. At its edge, where the light returns and the river's nutrients
    are still there, sits a permanent plankton bloom, and with it the divers and the pelagic soarers.
  - A sharp, shallow halocline: fresh water above, ocean below, with little mixing and little exchange.
  - The floor beneath is starved, as most of the deep sea is (S20): silt smothers it and little food falls through.
- **Daily changes.** Small. The front is sharpest in the calm before dawn.
- **Seasons.** The plume swells with the flood season and shrinks in the dry. A big monsoon flood pushes fresh water
  far enough offshore to show from the aerial biome as a discoloured arc along the coast.

---

## 6. The aerial biome

#### A01 · Aerial biome
- **Place.** The air column 5–12 km above both land and sea. Giant soarers range from 3 to 15 km.
- **Conditions.**
  - At 10 km the air is still 0.62 bar and ~0 °C, with roughly six times Earth's absolute humidity at that height.
  - The cold trap sits near 26 km rather than 11.
  - Particles stay aloft for months, long enough to complete a life cycle without landing.
- **Life.**
  - Gossamer photosynthesizers: sheets metres across that weigh grams.
  - Aerial grazers riding thermals indefinitely.
  - Giant soarers with 20 m wingspans feeding on both.
- **Daily changes.** Thermals lift the mats by day; they sink a little at night.
- **Seasons.**
  - The green haze is thickest over convective regions (the ITCZ, the monsoons) and thin over the 45–60° subsidence
    belts.
  - It migrates with the ITCZ, while the only two northern nesting islands stay put.

---

## 7. Differences from the current map

The map now draws biomes as its default layer, each in the colour of its vegetation or surface, and `biomes.js` is
the machine-readable transcription of this file. 46 of the 68 biomes are drawn; the other 22 are azonal and appear in
the info panel under "Also here". It also draws the seven rivers of `rivers.md` and their lakes, and seasonal sea ice
with icebergs (S07, S08, S17), permanent land ice (L10, L22, L38) and seasonal snow, all following the day-of-year
slider.

What the map still does not capture:
- **Daily range over the sea.** The info panel uses the belt value (8–15 K) over water too; open water should swing
  1–3 K.
- **Plateau and alpine daily range.** The panel uses the equatorial belt's 8 K; thin, dry air should give 14–20 K
  (L05, L09, L21).
- **Windward versus lee.** The coast/interior split now exists (a distance-to-coast field, 250 km), but exposure does
  not. Only L23/L24 are separated, and by longitude across the Elysium summit rather than by wind. L08 and L11, the
  windward and lee halves of the Tharsis cones, are both azonal for the same reason.
- **Azonal patches.** L06, L08, L11, L19, L29, L33, L35 and L37 are narrower than the region shapes, and the river
  biomes R01–R04, R08 and R09 are narrower still: a corridor is one to a few channel widths wide, well under one
  elevation pixel. They are listed in the panel instead of drawn, using the traced course in `data/rivers.json` to
  decide when a point is on a river, at a mouth or inside a lake.
- **Fresh water above sea level.** The elevation grid floods everything below +2,000 m and holds nothing above it, so
  R05–R07 have no texels of their own: Lake Solis, Lake Thaumasia and the closed salt lakes are drawn only as the
  outlines traced into `data/rivers.json`, and Hebes Chasma is still flooded to sea level rather than standing at its
  own spill level of +1,230 m (see the note under Hebes in `rivers.md`).
- **Data mismatch.** At +2 km, much of the southern crescent that the text describes as land is under water. That is
  why S14–S16 are so large; see "Known data mismatches" in `CLAUDE.md`.
