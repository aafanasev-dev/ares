# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An interactive 3D globe of an imaginary ocean planet ("Ares") built on real Mars MOLA topography. The world is
described in `planet_geography.md`: Mars at 1.02 AU, a 1 bar atmosphere, and sea level at +2,000 m above the Mars
datum. The globe draws the climate zones and landmarks from that description, and clicking a place shows its weather.

It is a static site: vanilla ES modules with three.js 0.170.0 loaded from the jsdelivr CDN through the import map in
`index.html`. There is no build step, package manager, linter or test suite.

## Commands

```sh
./run.sh [port]                        # python3 http.server on 8000 (next free port); prepares data if missing
docker compose up -d --build           # nginx container on http://localhost:8080
ARES_PORT=9000 docker compose up -d    # other host port (8080 is often taken on this machine)
python3 tools/prepare_data.py          # regenerate data/elevation.{bin,json} from the NASA MOLA download
```

`fetch()` does not work from `file://`, so always open the page through a server.

`climate.js` and `geography.js` import nothing from three.js or the DOM, so they run under Node. That is the
quickest way to check a change to zones or climate numbers:

```sh
node -e "import('./climate.js').then(({ classify, pointClimate }) => {
  const c = classify(256, -12, 6692, 2000);   // lon °E, lat, MOLA elevation m, sea level m (Syria Planum)
  console.log(c.region?.name, c.vertZone?.name, pointClimate(c));
})"
```

Expected result: Tharsis plateau steppe, Montane, about 10 °C and 0.82 bar, matching §3.1 of the text.

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

**`climate.js` is the single source of truth for what zone a point is in.** Two consumers use it, so they always agree:
- `buildZoneIds()`: the overlay texture, sampled every 2nd elevation pixel. The regions layer takes about 130 ms
  and is rebuilt (debounced) when the sea level changes.
- `classify()` + `pointClimate()`: the info panel and the hover readout.

Temperature drops 2.5 K per km of land altitude, and pressure is `1013 hPa · exp(−alt / 22.3 km)`. The treeline
and snowline are given at the equator (7 and 11 km) and moved with latitude to the height of the same annual mean
temperature (`vegetationLines`).

**Zone ids in the texture are `index in the layer's zone array + 1`.** 0 means no zone, and the maximum is 255.
- Reordering or inserting zones changes the ids, but the palette is rebuilt from the same arrays, so nothing else
  needs updating.
- The fragment shader reads `uZoneId` (R8, nearest filtering) and looks up `uPalette` (256×1).
- The belts layer takes its colour from `buildBeltGradient()` instead: a 1×1024 latitude texture where each border
  blends over 10% of both belts' spans. It doesn't brighten or dim on selection, since that would reintroduce a hard
  step; ids are still used to find its borders.
- Other layers get thin outlines where neighbouring ids differ. The selected zone (`uSelectedId`) gets a dashed white
  outline on every layer.

**Coordinate conventions in `main.js`.**
- Shader texture coordinates are `s = east lon / 360` and `t = 0` at 90°N (`vTex = (uv.x, 1 − uv.y)`).
- `lonLatToVector` maps lon/lat to three.js world space: x = −cos(lon)·cos(lat), y = sin(lat), z = sin(lon)·cos(lat).
- Picking intersects the undisplaced unit sphere and ignores relief.
- Landmarks are `CSS2DObject` buttons placed at the displaced surface radius. They are hidden on the far side of
  the globe. Rank-2 labels appear only when the camera distance is below 2.3.
- A click selects only if the pointer moved less than 5 px, so dragging the globe doesn't select anything.

## Docker

- The `Dockerfile` copies an **explicit list** of runtime files into `nginxinc/nginx-unprivileged` (port 8080).
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
