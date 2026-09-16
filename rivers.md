# Rivers of Ares

The seven largest **long-term rivers** of the planet: perennial rivers that reach the ocean and keep their course when
the sea level moves over the precession cycle. They were found from the actual terrain and the climate model, not
placed by hand. How that was done is summarised at the end, in "Method and caveats".

Rivers here look different from Earth's (`planet_geography.md` §4.5):
- **Braided and turbid.** Water flows at 62% of Earth's speed for the same slope, so channels are about 1.6× wider for
  the same discharge. Nearly every river is braided, and fine silt settles so slowly that the water stays muddy.
- **Misty waterfalls.** Falls over ~500 m break up into drifting mist, so they barely erode their plunge pools and
  last for geological ages.
- **Wave-built mouths.** Waves are huge and tides are feeble, so every mouth is wave-dominated and cuspate: no
  estuaries and no tidal flats.
- **Lakes.** Heavy cratering means many rivers are chains of lakes: water fills a crater, spills over its lowest rim
  and fills the next.

Discharge is the yearly mean in m³/s. Lengths follow the main stem and cross lakes in a straight line. Elevations are
relative to the planet's sea level (+2,000 m above the Mars datum). Biome codes refer to `biomes.md`; the R codes are
its river biomes (§5), which describe what each kind of reach is like to live in.

---

## Summary

| # | River | Source | Mouth | Length | Basin | Mean discharge | Earth comparison | Regime | Biomes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Solis River | 10.6°S 280.4°E, +2,080 m | 28.6°S 299.6°E | ~1,760 km | 3.03 M km² | 49,700 m³/s | larger than the Congo | southern-summer floods, buffered by two great lakes | L02, R02, R06, R05, R04, L05, L01, R01, R08, R09, S14 |
| 2 | Thaumasia River | 30.4°S 290.6°E, +3,500 m | 30.6°S 298.9°E | ~880 km | 0.24 M km² | 10,300 m³/s | Ob | sharp southern-summer floods | L03, R02, R06, L02, L01, R01, R08, R09, S14 |
| 3 | Sabaea River | 9.9°S 52.6°E, +810 m | 7.1°S 44.9°E | ~610 km | 0.18 M km² | 7,650 m³/s | Volga | double equatorial peak, lake-buffered | L26, R06, R04, R08, R09, S01 |
| 4 | Hebes River | 3.6°S 282.6°E, +2,820 m | 0.6°S 281.4°E | ~220 km | 0.07 M km² | 5,300 m³/s | Niger | very steady (deep lake) | L03, L02, R02, R06, L17, S10, S01 |
| 5 | Tyrrhena River | 10.4°S 85.1°E, +1,370 m | 5.6°S 89.4°E | ~440 km | 0.09 M km² | 4,700 m³/s | Niger | double equatorial peak, lake-buffered | L26, R06, R04, R01, R08, R09, S01 |
| 6 | Tholus River | 5.9°N 265.1°E, +1,640 m | 10.4°N 269.4°E | ~440 km | 0.26 M km² | 4,300 m³/s | a little under the Niger | flashy, double equatorial peak | L02, L01, R01, R08, R09, S01 |
| 7 | Pavonis River | 4.6°N 245.6°E, +1,700 m | 15.4°N 240.1°E | ~930 km | 0.32 M km² | 3,400 m³/s | Zambezi | two wet seasons along its course | L04, R03, L26, R01, L14, R08, R09, S02 |

Earth rivers for scale (mean discharge): Amazon ~209,000, Congo ~41,000, Ob ~12,500, Volga ~8,000, Niger ~5,600,
Zambezi ~3,400, Nile ~2,800 m³/s.

**Where they are.** Five of the seven drain Tharsis, the only large landmass with both high rainfall and a
continuous, gently sloping surface. The other two drain the northern edge of the southern highlands between 45°E and
90°E, under the equatorial rain belt. Continent A in the south is broken into cratered islands with low runoff and
many closed lakes; none of its rivers comes close to this list (see "Also considered").

---

## 1. Solis River

The great river of the planet: a chain of lakes on the eastern side of Tharsis, ending in the largest lake anywhere.

- **Place.**
  - **Source:** at about 10.6°S 280.4°E, +2,080 m, on the escarpment slopes just south of Melas Chasma, the south wall
    of Valles Marineris.
  - **Trough lakes:** it runs south through two lakes. The larger is 6,600 km², up to 1,180 m deep, with its surface
    at +1,290 m (13.4°S 282.6°E).
  - **Lake Solis:** it enters Lake Solis near 14.4°S 283.6°E. The lake is **761,000 km²**, larger than the Caspian
    Sea, and fills the closed basin between Syria Planum, Solis Planum and the Thaumasia highlands. It is centred at
    24.6°S 274.6°E, its surface stands at +1,290 m, and it is up to 1,890 m deep.
  - **Lake Thaumasia:** the river leaves Lake Solis at its spill point, 21.6°S 289.1°E, and runs ~180 km
    east-southeast through two small lakes into Lake Thaumasia. That lake is 104,000 km², centred at 23.6°S 293.4°E,
    with its surface at +940 m and up to 1,090 m deep.
  - **Mouth:** from Lake Thaumasia's outlet at 27.4°S 297.9°E it cuts through the Thaumasia rim and reaches the sea at
    **28.6°S 299.6°E**.
- **Terrain.** A staircase of lakes:
  - a steep start off the chasma wall;
  - two deep trough lakes;
  - Lake Solis, most of the river's length;
  - Lake Thaumasia, one step lower;
  - a single gorge through the rim, the only steep reach, falling ~860 m in the last 180 km (~5 m/km);
  - a short, braided coastal plain.
- **Climate along the course.**
  - The source and the eastern lake shores lie under the rain of the East Tharsis escarpment (3,000–4,000 mm/yr on
    the walls).
  - The western half of the Lake Solis basin reaches up onto the dry plateau (under 100 mm/yr), so the basin average
    is ~980 mm/yr.
  - Temperature at lake level (+1.3 km, southern trade belt) averages about 17 °C: around 23 °C in summer, 12 °C in
    winter.
  - Glacier melt adds less than 1%.
- **Flow.**
  - **Mouth:** 49,700 m³/s, larger than the Congo.
  - **Lake Solis:** receives ~44,900 m³/s but evaporates ~25,000 m³/s from its enormous surface, so it releases only
    ~19,600.
  - **Tributaries:** streams off the Thaumasia rim add ~30,000 m³/s before Lake Thaumasia.
  - **Evaporation:** in all, 37% of the water that runs off the basin evaporates from its lakes.
  - **Seasons:** rain peaks in the southern summer (sols ~270–340). The rim tributaries carry a sharp monsoon flood,
    but the two lakes store it, so below Lake Thaumasia the river's flow varies much less than the rain.
- **Mouth.** A broad, cuspate delta pushing a muddy plume into the drowned highland sea (S14). It is exposed to
  trade-wind waves and summer storm surges.
- **Life and biomes.**
  - **Source:** a montane torrent (R02) off the chasma wall, in the lower escarpment rainforest (L02).
  - **Lake Solis:** its western shores border the plateau-margin savanna and steppe (L04, L05). Its eastern shores lie
    in escarpment forest.
  - **Rim gorge:** the one steep reach is a spillway stair (R04) through the Thaumasia rim.
  - **Lower course:** a braided corridor (R01) through the coastal rainforest (L01), ending in a cuspate delta (R08)
    and a muddy plume (R09).
  - **Lakes as biomes:** Lake Solis and Lake Thaumasia are freshwater inland seas (R05), and the deep trough lakes
    above them are R06. Their calm surfaces are the only large still water on Tharsis outside the sheltered side
    chasmata.
- **Long term.**
  - **Sea level:** at 100 m lower or higher, the mouth moves only 13–26 km, discharge changes by at most 4%, and
    98–100% of the main stem is unchanged. The lake levels are set by rock spill points, not by the ocean.
  - **Precession:** the southern monsoon is violent now and will be gentle in ~25,500 years, so the summer flood will
    shrink and the lake levels will steady.
- **Caveat.** The escarpment and coastal-rainforest region shapes in `geography.js` also cover the Solis–Thaumasia
  basin behind the rim. If that basin got only ordinary trade-belt rain, the river would carry ~25,500 m³/s: still
  the largest on the planet, about Yangtze-sized.

## 2. Thaumasia River

A short, powerful coastal river off the Thaumasia highlands, 220 km south of the Solis River's mouth.

- **Place.**
  - **Source:** rises at 30.4°S 290.6°E, +3,500 m, on the eastern Thaumasia highlands.
  - **Upper course:** plunges south to +660 m within 200 km.
  - **Lakes:** turns east through a lake of 13,100 km² (centre 34.4°S 293.1°E, surface +590 m, 115 m deep) and a
    string of small crater lakes.
  - **Mouth:** reaches the sea at **30.6°S 298.9°E**.
- **Terrain.** A steep upper gorge falling ~14 m/km, then a lake-studded coastal plain at about +500 m, and a final
  descent to the coast.
- **Climate along the course.**
  - Escarpment and coastal-rainforest rain; the basin averages ~1,970 mm/yr.
  - About 11 °C at the source (+3.5 km).
  - 19–20 °C on the lower course.
- **Flow.**
  - **Discharge:** 10,300 m³/s, about the Ob. Only 7% evaporates.
  - **Seasons:** it rises in the short, fierce southern summer (sols ~270–340). The upper gorge floods violently after
    each monsoon cloudburst; the lower lake takes the edge off the peak.
- **Mouth.** A cuspate delta on the drowned highland sea (S14), close enough to the Solis delta that their muddy plumes
  merge along the coast.
- **Life and biomes.** A montane torrent (R02) through cloud forest in the upper gorge (L03), then the lake string
  (R06) and a braided corridor (R01) through lower escarpment rainforest (L02) and coastal rainforest (L01), ending in
  a cuspate delta (R08) whose plume (R09) merges with the Solis River's in the sea (S14).
- **Long term.** At ±100 m sea level the mouth moves 25–41 km, discharge stays within 0.93–1.12 of today's and 95–100%
  of the main stem is unchanged.

## 3. Sabaea River

A textbook beaded river: a chain of crater lakes linked by short spillway gorges, under the equatorial rain belt.

- **Place.**
  - **Source:** rises at 9.9°S 52.6°E, +810 m, in the highlands of Terra Sabaea.
  - **Upper lakes:** flows west-northwest through a lake of 4,900 km² (10.4°S 52.1°E, surface +400 m, 510 m deep).
  - **Main lake:** the largest lake on its course is 24,600 km² (centre 9.6°S 49.1°E, surface +370 m, 875 m deep).
  - **Lower lakes:** then several smaller crater lakes, one only 865 km² but nearly 700 m deep.
  - **Mouth:** reaches the sea at **7.1°S 44.9°E**.
- **Terrain.**
  - Water fills a crater, overflows its lowest rim, and fills the next.
  - The lakes are separated by short, steep spillway gorges, each with a waterfall at its head.
  - Between them the river is nearly level: ~1.3 m/km overall.
- **Climate along the course.**
  - Equatorial wet: 2,000–3,000 mm/yr (basin average ~2,170 mm), humidity 80–90%.
  - About 21 °C at the lakes, with little seasonal change.
- **Flow.**
  - **Discharge:** 7,650 m³/s, about the Volga. 17% evaporates from the lakes.
  - **Seasons:** two rain peaks a year as the ITCZ passes (sols ~60–80 and ~190–210). The lakes smooth them into a
    steady flow.
- **Mouth.** A small cuspate delta on the warm equatorial ocean (S01).
- **Life and biomes.**
  - Evergreen rainforest on the crater rims and the gorges (L26).
  - Deep, still crater lakes (R06), each with its own shoreline forest.
  - The spillway gorges (R04) are the only links between lakes, which suits the "species pump" of isolated crater
    communities described in `planet_geography.md` §4.10.
  - A small cuspate delta (R08) and its plume (R09) on the equatorial ocean.
- **Long term.** Identical at 100 m lower sea level. At 100 m higher, the lowest lakes become bays: the mouth moves
  62 km, discharge is 95% of today's and 88% of the main stem is unchanged.

## 4. Hebes River

The shortest river on the list and the most dramatic: it ends in a waterfall about 1,200 m high.

- **Place.**
  - **Source:** rises at 3.6°S 282.6°E, +2,820 m, on the plateau between the northern chasmata of Valles Marineris.
  - **Upper lake:** falls north-west into a lake of 4,600 km² (centre 2.4°S 281.6°E, surface +1,980 m, 820 m deep).
  - **Lake Hebes:** drops into **Hebes Chasma**, an enclosed chasma. Its lake (26,700 km²) stands at +1,230 m and is
    up to **7,260 m** deep.
  - **Mouth:** the river leaves over the north rim at 0.6°S 281.6°E and falls ~1,200 m into the drowned troughs north
    of Hebes that lead to Echus Chasma and the Kasei Valles sound. The foot of the falls is at **0.6°S 281.4°E**.
- **Terrain.** Two lake steps on a short, steep course, ending at **Hebes Falls**. The fall is far over 500 m, so the
  water turns to mist before it lands (§4.5): a permanent white column visible for hundreds of kilometres, which never
  carves a plunge pool.
- **Climate along the course.**
  - Some of the wettest ground on Tharsis: escarpment rain of 3,000–4,000 mm/yr (basin average ~3,140 mm).
  - About 15 °C at the source.
  - About 19 °C at lake level.
- **Flow.**
  - **Discharge:** 5,300 m³/s, about the Niger. 12% evaporates from the lakes.
  - **Seasons:** the rain has two equatorial peaks, but Lake Hebes holds hundreds of cubic kilometres per metre of
    depth, so the falls barely change through the year.
- **Mouth.** No delta. The river falls into deep, sheltered water, and the drifting mist feeds the forests on the
  surrounding walls.
- **Life and biomes.**
  - Cloud forest and lower escarpment rainforest (L03, L02) on the plateau, cut by a steep torrent (R02).
  - Lake Hebes is the deepest fresh water on the planet (R06), under the cathedral forest (L17) on the walls of Hebes
    Chasma.
  - The mist zone below the falls (R02) is permanently saturated, the kind of shelter the sky-nets of the side
    chasmata need.
- **Long term.** Exactly the same at ±100 m sea level (no mouth shift, discharge within 1%). Its lake level is fixed
  by the rock rim, so it is the most stable river on the list.
- **Note.** `biomes.md` (S10) and the globe put Hebes water at sea level, because the map floods every point below
  +2,000 m. An enclosed chasma would really hold its lake at its own spill level, about +1,230 m, which is what makes
  the falls. Worldbuilding should pick one of the two.

## 5. Tyrrhena River

A lake-chain river on the northern edge of the southern highlands, facing Isidis.

- **Place.**
  - **Source:** rises at 10.4°S 85.1°E, +1,370 m, in Tyrrhena Terra.
  - **Small lake:** flows north-east through a small lake (430 km²).
  - **Main lake:** enters a large lake of 40,600 km² (centre 8.1°S 88.1°E, surface +360 m, 1,090 m deep).
  - **Coastal lake:** leaves at 7.4°S 88.9°E into a deep crater lake right behind the coast (3,500 km², surface +230
    m, 1,650 m deep).
  - **Mouth:** reaches the sea at **5.6°S 89.4°E**.
- **Terrain.** A short run off the highland edge, one broad lake taking most of the length, a narrow spillway, a deep
  coastal crater lake, and a steep final drop to the sea.
- **Climate along the course.** Equatorial wet: ~2,500 mm/yr, 20–22 °C, humid all year.
- **Flow.**
  - **Discharge:** 4,700 m³/s. About 21% evaporates, mostly from the big lake.
  - **Seasons:** the two ITCZ rain peaks are largely absorbed by the lakes.
- **Mouth.** A short delta on the equatorial ocean (S01), facing the Isidis basin to the north.
- **Life and biomes.** Equatorial highland rainforest coast (L26), with a large calm lake (R06) in its middle course,
  a narrow spillway (R04) into the deep coastal crater lake (R06), then a short rainforest corridor (R01), a delta
  (R08) and its plume (R09).
- **Long term.** Unchanged at ±100 m sea level (no mouth shift, same discharge, same main stem).

## 6. Tholus River

The one major river without lakes: a straight, fast run down the north-eastern slope of Tharsis.

- **Place.**
  - **Source:** rises at 5.9°N 265.1°E, +1,640 m, on the north-eastern flank of Tharsis, between the Ascraeus rise and
    the coast.
  - **Course:** runs steadily north-east with no lakes.
  - **Mouth:** reaches the sea at **10.4°N 269.4°E**, about 330 km south of the volcano Tharsis Tholus.
- **Terrain.** An even slope of ~3.7 m/km, from +1,640 m to the sea in ~440 km. Wide gravel braids in the middle
  course, and a coastal-rainforest plain in the last 100 km.
- **Climate along the course.**
  - The upper basin reaches the dry plateau margin; the middle and lower basin lie under escarpment and coastal
    rain.
  - The basin averages ~730 mm/yr.
  - 17–22 °C.
- **Flow.**
  - **Discharge:** 4,300 m³/s, and almost none is lost.
  - **Seasons:** two equatorial rain peaks.
  - **Floods:** with no lakes, and rain arriving in a few very heavy events, it is the flashiest river on the list.
    Its channels shift after every big storm.
- **Mouth.** A wave-dominated cuspate delta near the equatorial ocean (S01), on the approaches to Chryse.
- **Life and biomes.** Lower escarpment rainforest (L02), then coastal rainforest (L01), and a rainforest corridor
  (R01) the whole way, since it has no lakes. Its gravel bars and shifting braids are pioneer ground for fast-growing
  trees; it ends in a cuspate delta (R08) and a plume (R09).
- **Long term.** At ±100 m sea level the mouth moves 15–33 km, discharge stays within 0.97–1.06 of today's and 92–100%
  of the main stem is unchanged.

## 7. Pavonis River

The long river of north-western Tharsis, crossing from the equatorial rain belt into the northern trade belt.

- **Place.**
  - **Source:** rises at 4.6°N 245.6°E, +1,700 m, at the north-western foot of Tharsis about 240 km from Pavonis Mons.
    It flows all year from 4.4°N 245.6°E.
  - **Source lakes:** passes three small lakes; the largest is 1,300 km² and 217 m deep.
  - **Course:** runs north-north-west across the lowlands.
  - **Mouth:** reaches the sea at **15.4°N 240.1°E**, on the strait facing Olympus Mons, ~810 km away.
- **Terrain.** Gentle, ~1.8 m/km, in a wide braided valley. The second-longest river on the list.
- **Climate along the course.**
  - The upper basin is dry plateau margin.
  - The middle course is in the equatorial rain belt.
  - The lower course lies on the drought-deciduous north-west Tharsis coast.
  - The basin averages ~570 mm/yr; 17–21 °C.
- **Flow.**
  - **Discharge:** 3,400 m³/s, about the Zambezi. Only 2% is lost.
  - **Seasons:** the upper and middle course follow the two equatorial rain peaks. Lower down, the northern wet season
    (sols ~110–200) adds a third rise, so the river never runs low for long.
- **Mouth.** A strongly wave-dominated delta on the northern trade-wind ocean (S02). The 4–5.5 m trade seas push its
  sediment along the coast into long beach ridges.
- **Life and biomes.**
  - Plateau-margin savanna at the source (L04), where it runs as a gallery corridor (R03) past its three small lakes
    (R06).
  - The north-west Tharsis patch of equatorial rainforest (L26), where it is a rainforest corridor (R01).
  - The north-west Tharsis lee coast (L14), where it is the main evergreen corridor (R03) through otherwise leafless
    dry-season forest.
  - A strongly wave-built delta (R08) with long beach ridges, and a plume (R09) carried down-coast by the trade
    current.
- **Long term.** At ±100 m sea level the mouth moves 15–44 km, discharge stays within 0.88–1.07 of today's and 94–98%
  of the main stem is unchanged.

---

## Also considered

**Large, but not long-term.**
- **Syrtis coast river:** 9,840 m³/s, ~650 km, mouth at 9.9°S 58.9°E. It was third by discharge, but its lower course
  runs through a 46,600 km² lake whose surface is only +3 m above the sea. With the sea 100 m higher, the lake becomes
  a bay and the river is cut short: its old outlet gets 7% of the flow, 327 km away.

**Too small or too short.** These rank 8–20 by discharge (2,500–4,000 m³/s):
- **Valles Marineris rivers:**
  - a north-bank river to 4.6°S 300.1°E (4,000 m³/s, 595 km);
  - south-wall rivers into the sound: 3,050 m³/s at 14.9°S 301.6°E, 3,020 at 5.1°S 302.9°E and 2,560 at 7.4°S 305.9°E;
  - a river into Ophir Chasma at 2.9°S 288.4°E (2,660).
  They are short and steep, and there are dozens like them.
- **North-east Tharsis:** two siblings of the Tholus River, 3,940 m³/s to 14.9°N 267.4°E and 3,830 m³/s to 22.4°N
  266.4°E.
- **North-west Tharsis:** two siblings of the Pavonis River, 2,930 m³/s to 15.6°N 249.1°E (750 km) and 2,730 m³/s to
  16.6°N 249.4°E (980 km).
- **Equatorial highland coast:**
  - 3,260 m³/s at 7.6°S 33.9°E; with the sea 100 m higher it keeps only 69% of its flow;
  - 2,720 m³/s at 2.6°S 66.1°E;
  - 2,590 m³/s at 5.6°S 37.9°E.
- **Alba Mons:** the best river country on the planet (§3.6), but its shield drains radially in every direction.
  Dozens of medium rivers, none reaching 2,500 m³/s.
- **Olympus and Elysium:** short radial rivers off island volcanoes.
- **Continent A, the southern storm coast and the south polar margin:**
  - The land is broken into cratered islands.
  - Savanna rainfall largely evaporates.
  - Most crater chains end in closed lakes.
  None of their rivers reaches the sea with more than ~2,500 m³/s.
- **Glacier melt:** under 1% of any major river's water. The ice caps on the volcanoes are too small to matter at this
  scale.

**Inland rivers and closed lakes.** The largest rivers that never reach the sea end in lakes that lose all their inflow
to evaporation. These are the terminal salt lakes and playas of `biomes.md` (R07):

| Closed lake | Centre | Area | Surface | Depth | Inflow | Notes |
|---|---|---|---|---|---|---|
| Southern Tharsis lake | 41.9°S 255.4°E | 130,000 km² | +340 m | 860 m | 1,720 m³/s | fed by plateau rivers dying in the dry south of Tharsis |
| Terra Sirenum lake | 42.9°S 225.1°E | 104,000 km² | +110 m | 2,080 m | 2,760 m³/s | end of the largest inland river, 610 km from 41.6°S 211.9°E |
| Syria lake | 14.6°S 252.1°E | 96,000 km² | +4,330 m | 1,110 m | 150 m³/s | a salt lake and playa on the plateau (§3.1) |
| Sabaea closed lake | 18.4°S 29.6°E | 60,000 km² | +250 m | 1,660 m | 2,060 m³/s | salt lake of the southern savanna |
| Sirenum west lake | 42.4°S 238.1°E | 49,000 km² | +310 m | 780 m | 420 m³/s | |
| Sabaea salt lake | 19.4°S 36.4°E | 44,000 km² | +410 m | 1,830 m | 1,600 m³/s | |
| Syria–Solis lake | 26.6°S 251.4°E | 37,000 km² | +2,750 m | 870 m | 60 m³/s | playa |
| Cimmeria lake | 47.1°S 138.9°E | 37,000 km² | +330 m | 1,920 m | 350 m³/s | subsidence-desert salt lake (L33) |

The biggest inland river, at 2,760 m³/s, would rank about 12th among the rivers that reach the sea. Following the
chosen rule, it is not on the main list.

---

## Method and caveats

**Model.** A one-off drainage analysis of the MOLA elevation data with the sea at +2,000 m and the climate model from
`climate.js`. The script is not kept in the repository.
- **Grid:** 1440×720, about 7.4 km cells at the equator.
- **Rain, temperature and humidity:** `pointClimate()` per cell, including regional rainfall and altitude.
- **Evaporation:** potential evaporation PET = (700 + 40·T) × (1.4 − RH/100) mm/yr, at least 50 mm. Actual
  evaporation from land follows a Budyko curve, and runoff = rain − actual evaporation. Glacier cells release 80% of
  their snowfall as melt.
- **Seas and lakes:**
  - Water bodies of 100,000 km² or more are the sea.
  - Smaller basins below sea level, like every other closed depression, fill into lakes up to their spill point.
  - Each lake gets rain on its surface, loses PET, and has a single outlet. It becomes closed when inflow is less than
    its evaporation.
- **Routing:** water flows downhill across the filled surface.
- **Desert losses:** rivers lose water in dry country, over a wetland band 10× the channel width (channel width
  7.7·√Q m, 1.6× Earth's) at a rate of PET − rain.
- **Totals:**
  - Rain on land: ~815,000 m³/s.
  - Runoff: ~464,000 m³/s, equal to 600 mm/yr (Earth's land average is ~300 mm).
  - About 417,000 m³/s reaches the sea.
  - 2,400 lakes form.

**Tests.**
- **Sea level:** every river was re-traced with the sea at +1,900 m and +2,100 m, roughly the swing of the precession
  cycle. A river passed if its main stem and mouth stayed in place and its discharge stayed within ~15%.
- **Rainfall sensitivity:** a second run gave the Solis–Thaumasia basin ordinary trade-belt rain instead of escarpment
  rain. That lowers the Solis River to ~25,500 m³/s and the Thaumasia River to ~6,900; the other five are unchanged.

**Caveats.**
- **Discharge:** uncertain by roughly ±30–50%. The rainfall comes from broad region shapes, and the evaporation
  formula is simple.
- **Lengths:** ±15%. They follow a 7 km grid and cross lakes in straight lines.
- **Lakes not on the map.** Lakes above sea level are not drawn on the globe: Lake Solis, Lake Thaumasia, the Syria
  lake and the lake in Hebes Chasma. The globe draws Hebes at sea level.
- **Names** are proposed, after the nearest real Martian features: Solis Planum, the Thaumasia highlands, Terra Sabaea,
  Hebes Chasma, Tyrrhena Terra, Tharsis Tholus and Pavonis Mons. The rivers were modelled from present-day topography,
  not from the ancient Martian valley networks.
