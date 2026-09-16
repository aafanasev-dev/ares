# Planet map

An interactive 3D globe of an imaginary ocean planet built on real Mars topography. The planet is described in
`planet_geography.md`: Mars at 1.02 AU with a 1 bar atmosphere and sea level at +2 km above the Mars datum.

The globe shows the biomes of `biomes.md`, each in the colour of its own vegetation or surface, with the climate
belts and altitude zones as alternative layers, the seven major rivers of `rivers.md`, and the named landmarks from
the gazetteer. Click anywhere to see the local weather: temperature adjusted for altitude, precipitation, humidity,
wind, air pressure and seasons.

The "Sun & season" panel sets the day of the year and the time of day. On load both sliders are set to where real
Mars is right now. The globe is lit by the sun for that moment, so the night side is dark. The info panel also shows
a possible current weather: local time, sunrise and sunset, temperature, humidity, whether it is raining, a suggested
wind speed, the wave height over water, and the sky.

Elevation data: MGS MOLA MEGDR global topography (NASA PDS), meters relative to the Mars areoid.

## Run

```sh
./run.sh          # prepares the data on first run, starts a local server, prints the link
./run.sh 9000     # use another port (PORT=9000 ./run.sh works too)
```

If the port is taken, the script picks the next free one. Press Ctrl+C to stop.

Manual alternative:

```sh
python3 tools/prepare_data.py      # stdlib only; downloads ~33 MB, writes data/elevation.bin (8 px/deg)
python3 -m http.server 8000        # fetch() does not work from file://
# open http://localhost:8000
```

`python3 tools/prepare_data.py --res 4` uses the small 2 MB file (4 px/deg) instead.

## Docker

```sh
docker compose up -d --build      # then open http://localhost:9080
docker compose down               # stop
```

If port 9080 is taken, pick another host port: `ARES_PORT=9180 docker compose up -d --build`.

Or without Compose:

```sh
docker build -t ares .
docker run -d -p 9080:9080 ares
```

The image is a non-root nginx serving the static files. It already contains the prepared elevation data
(`data/elevation.bin`, committed to the repo), so nothing is downloaded at build or run time. The page loads
three.js from the jsdelivr CDN, so the browser needs internet access.

## Controls

- Drag to rotate, scroll to zoom.
- **Sea level**: slider or number field, in meters above the Mars datum. It starts at the planet's +2,000 m.
  Coastlines, zones, landmarks and weather all follow it.
- **Relief exaggeration**: vertical exaggeration of the terrain (0× gives a smooth sphere).
- **Zones**: biomes (the default; the 46 drawable ones of the 68 in `biomes.md`), climate belts (by latitude) or
  altitude zones (lowland, montane, alpine, nival). Biomes are coloured by their vegetation or surface (forest
  greens, light-green savanna, sandy desert, blue seas) and blend smoothly into each other, but not across the
  coastline. Selecting draws nothing on the globe: it opens the info panel and marks the row in the legend.
- **Landmarks**: gazetteer objects. Smaller ones get labels when you zoom in.
- **Rivers and lakes**: the seven long-term rivers, traced from the terrain itself, drawn at a width that follows
  discharge.
- Click the globe or a landmark to open the info panel. Esc closes it.

## Code

- `geography.js`: all planet data transcribed from `planet_geography.md`. This includes latitude belts with their
  climate tables, altitude zones, regional climates with their map shapes, and gazetteer objects with
  descriptions. **Update it when you change `planet_geography.md`.**
- `biomes.js`: every biome of `biomes.md` as data — where it sits, its colour and its wind.
  **Update it when you change `biomes.md`.**
- `climate.js`: classifies a point into zones and biomes and computes its local climate. The overlay texture and the
  info panel both use it, so they always agree.
- `main.js`: globe rendering, zone overlay, rivers, landmarks, picking and the info panel.
- `tools/trace_rivers.py`: traces the rivers of `rivers.md` over the elevation grid into `data/rivers.json`.

Region shapes are rough boxes, circles and polygons. Each is combined with a land/water and altitude condition,
so its real borders follow the coastline and the terrain. Altitudes are relative to the current sea level.
