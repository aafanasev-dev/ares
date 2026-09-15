# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An interactive 3D globe of an imaginary ocean planet ("Ares") built on real Mars MOLA topography. The world is
described in `planet_geography.md`: Mars at 1.02 AU, a 1 bar atmosphere, and sea level at +2,000 m above the Mars
datum. The globe draws the climate zones and landmarks from that description, and clicking a place shows its weather.

`biomes.md` splits those climates into **biomes**: areas of land or water with similar climate, vegetation and fauna.
A regional climate can hold several biomes (coast vs interior, altitude bands); sea biomes are set by temperature,
humidity and wind (which sets the waves). Each biome lists its place, climate with precipitation, vegetation and
fauna, daily changes and seasons. It is worldbuilding text built on `planet_geography.md` and the `REGIONS` in
`geography.js`; the code does not use it yet. When a region, zone or climate number changes, update `biomes.md` too.
A time panel (day of year and time of day, set to real Mars "now" on load) lights the globe with the real sun, so
the night side is in shadow, and the info panel shows a possible current weather for that moment.

It is a static site: vanilla ES modules with three.js 0.170.0 loaded from the jsdelivr CDN through the import map in
`index.html`. There is no build step, package manager, linter or test suite.

## Commands

```sh
./run.sh [port]                        # python3 http.server on 8000 (next free port); prepares data if missing
docker compose up -d --build           # nginx container on http://localhost:9080
ARES_PORT=9180 docker compose up -d    # other host port if 9080 is taken
python3 tools/prepare_data.py          # regenerate data/elevation.{bin,json} from the NASA MOLA download
```

`fetch()` does not work from `file://`, so always open the page through a server.

`climate.js`, `astro.js` and `geography.js` import nothing from three.js or the DOM, so they run under Node. That is
the quickest way to check a change to zones, climate numbers or the calendar:

```sh
node -e "import('./climate.js').then(({ classify, pointClimate }) => {
  const c = classify(256, -12, 6692, 2000);   // lon °E, lat, MOLA elevation m, sea level m (Syria Planum)
  console.log(c.region?.name, c.vertZone?.name, pointClimate(c));
})"
```

Expected result: Tharsis plateau steppe, Montane, about 10 °C and 0.82 bar, matching §3.1 of the text.

```sh
node -e "import('./astro.js').then(({ marsNow, solFromLs }) => {
  console.log(marsNow(new Date('2024-11-12T12:00Z')));   // start of Mars Year 38: Ls ≈ 0
  console.log(solFromLs(270) - solFromLs(180));           // sols from Ls 180 to 270
})"
```

## Architecture

**Data flow.**
1. `tools/prepare_data.py` turns the 32 MB raw MOLA file (`data/raw/`, gitignored) into `data/elevation.bin` and
   `data/elevation.json`, both committed. The `.bin` is int16 little-endian, 2880×1440, meters relative to the Mars
   areoid, row 0 = 90°N, column 0 = 0°E.
2. `main.js` loads it into a half-float texture for the shader and keeps the `Int16Array` on the CPU for picking
   and classification.

**Elevations and sea level.**
- Elevation data and the sea level slider are both in raw MOLA meters. The planet datum is `PLANET.SEA_DATUM_MOLA = 2000`.
- `planet_geography.md` quotes elevations relative to the planet's sea level (add 2 km to convert to MOLA).
- Every zone condition works on `altitude = elevation − seaLevel`, so zones and coastlines follow the slider.

**`geography.js` is a hand transcription of `planet_geography.md`.** When the text changes, update this file.
- `LATITUDE_ZONES`: climate tables by latitude belt.
- `VERTICAL_ZONES`: lowland, montane, alpine, nival.
- `REGIONS`: named regional climates.
- `OBJECTS`: gazetteer landmarks with their descriptions.

Rules for `REGIONS`:
- **Order matters: the first match wins**, so specific regions go before broad latitude boxes.
- Each region is a `shape` (a `box`, `circle` or `polygon` in lon/lat, or an array of these for a union) combined
  with `where: {surface, alt}`. The land/water and altitude test gives real coastline-following borders, even
  from rough shapes.
- `climate` overrides the belt values. If a region sets `precip` without `rainDays`, the belt's rain days are
  hidden so the two don't contradict each other.
- Map colour comes from `vegetation` (a `VEGETATION` key, for land pixels) and `sea` (a `SEA` key, for water
  pixels, default `open`). The exported `REGIONS` add `landColor`, `seaColor` and `color` (legend/chips); an unknown
  key throws at load. What grows there goes in `flora` (shown under "About this region"), not in `precipNote`.

**`climate.js` is the single source of truth for what zone a point is in.** Two consumers use it, so they always agree:
- `buildZoneIds()`: the overlay texture, sampled every 2nd elevation pixel. The regions layer takes about 130 ms
  and is rebuilt (debounced) when the sea level changes.
- `classify()` + `pointClimate()`: the info panel and the hover readout.

Temperature drops 2.5 K per km of land altitude, and pressure is `1013 hPa · exp(−alt / 22.3 km)`. The treeline
and snowline are given at the equator (7 and 11 km) and moved with latitude to the height of the same annual mean
temperature (`vegetationLines`).

**Time: `astro.js` and `momentWeather`.**
- `marsNow()` is real Mars's Ls and Mars Coordinated Time (Mars24, Allison & McEwen 2000). The planet's own orbit
  (`PLANET.SEMI_MAJOR_AU`, `ECCENTRICITY`, `SOLS_PER_YEAR`…) is placed at the same Ls, so `solFromLs`/`orbitAt`
  convert between Ls and the 366-sol year. Sol 0 starts at Ls 0°. Times of day are Mars hours (24 per sol).
- `sunAt(sol, mtcHours)` gives declination, subsolar longitude (with the equation of time) and distance.
  The time panel's hour slider holds minutes of MTC, the time at 0°E.
- `momentWeather(c, pointClimate(c), sun)` spreads the annual climate over the year and the day:
  - Seasonal temperature follows daily insolation through a lagged response (20 sols land, 45 water), scaled so
    its extremes equal `tempSummer`/`tempWinter`. Eccentricity makes the southern summer short without special cases.
  - The daily swing (`diurnal`) is scaled by day length, so it vanishes in polar night and polar day.
  - `rainSeason: {type, strength}` on belts (overridable by regions) sets when rain falls: `itcz`, `summer`
    (monsoon), `winter` (storm track) or `none`. It shifts rain chance and humidity through the year.
  - The sky ("Conditions") is a deterministic hash of a 2° cell and the sol: a plausible sample, not a forecast.

**Lighting.** `uSunDir` is the subsolar point in world space (the globe mesh never rotates, so world space is
planet space). The shader darkens the night side with a soft twilight band (`daylight`). With the "Sun lighting"
checkbox off, the animation loop points `uSunDir` from the upper left of the camera instead.

**Ice and snow** (`climate.js`, drawn over every layer; "Ice and snow" checkbox → `uIceOn`).
- Temperatures come from `surfaceTempProfile`: belt summer/winter values interpolated between belt centres
  (extrapolated past ±81°, so the poles are colder), moved through the year by `seasonalCurves`.
- Sea ice: `seaIceCover(lat, sol)` runs a per-latitude thickness model (grow below −1.8 °C, melt above, `ICE_*`
  constants in `PLANET`) plus equatorward drift. Tuned so the north keeps a perennial core to ~84°N with winter ice to
  ~70°N, and southern sea ice retreats to the cap bays in summer. Recheck with a Node table if the constants change.
- Land: `isGlacier(c)` (nival zone or a region with `vegetation: 'ice'`) is permanent; `snowCover(c, sol)` is
  seasonal, from the seasonal temperature at the point's altitude.
- Shader inputs: `uPolar` (`buildPolarProfile`: sea-ice cover and seasonal land temperature by latitude, rebuilt when
  the integer sol changes) and `uIceMask` (`buildIceMask`, rebuilt with the overlay).
- The shader adds only visual noise: a wavy ice edge and ±1 K on the snow line. Icebergs are 3D Worley noise
  (`icebergs()`) whose size and count grow with cover, so they are small near open water and merge into the pack.
  The info panel uses the noise-free values, so it can differ from the drawn edge by about a degree.

**Zone ids in the texture are `index in the layer's zone array + 1`.** 0 means no zone, and the maximum is 255.
- Reordering or inserting zones changes the ids, but the palette is rebuilt from the same arrays, so nothing else
  needs updating.
- `uColorMode` picks the colour source (`COLOR_MODES` in `main.js`):
  - 0, altitude: `uPalette` (256×1) looked up by id, with thin outlines where neighbouring ids differ.
  - 1, belts: `buildBeltGradient()`, a 1×1024 latitude texture where each border blends over 10% of both belts' spans.
  - 2, regions (the default layer): `buildRegionColors()`, two premultiplied RGBA grids for land and water. Each is
    blurred only within its own surface class (masked, normalised box blur, `REGION_BLEND_DEG`), and the shader picks
    between them with the elevation coastline mask, so regions blend into each other but never across the coast.
    Built in `rebuildOverlay` together with the ids, at half the zone-texture resolution (`REGION_COLOR_SCALE`),
    ~300 ms total.
- Selection never changes colours. The selected zone (`uSelectedId`, found through the id texture) only gets a dashed
  white outline, on every layer.

**Coordinate conventions in `main.js`.**
- Shader texture coordinates are `s = east lon / 360` and `t = 0` at 90°N (`vTex = (uv.x, 1 − uv.y)`).
- `lonLatToVector` maps lon/lat to three.js world space: x = −cos(lon)·cos(lat), y = sin(lat), z = sin(lon)·cos(lat).
- Picking intersects the undisplaced unit sphere and ignores relief.
- Landmarks are `CSS2DObject` buttons placed at the displaced surface radius. They are hidden on the far side of
  the globe. Rank-2 labels appear only when the camera distance is below 2.3.
- A click selects only if the pointer moved less than 5 px, so dragging the globe doesn't select anything.

## Docker

- The `Dockerfile` copies an **explicit list** of runtime files into `nginxinc/nginx-unprivileged`. Its nginx is moved from 8080 to port 9080 by a `sed` in the Dockerfile
  (8080 is taken on both this machine and the production server).
  Add any new runtime file to its `COPY` lines.
- nginx's default config is deliberate. It serves `.js` as `application/javascript` and sends `Content-Length`
  for `elevation.bin`, which the loading progress bar needs. Don't enable gzip for the `.bin`.
- The `HEALTHCHECK` must use `127.0.0.1`: inside the container `localhost` resolves to IPv6, where nginx doesn't listen.

## Known data mismatches

The real topography doesn't fully match the worldbuilding text:
- At +2 km, 83% of the surface is flooded, not the 70% stated.
- Lunae Planum, Hesperia Planum and most of Terra Cimmeria and Sirenum are underwater.

The info panel shows the real altitude next to the gazetteer's value. Region shapes are tuned to the data at
2,000 m, so recheck them if the datum changes.
