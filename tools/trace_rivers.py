#!/usr/bin/env python3
"""Trace the major rivers of rivers.md over the MOLA elevation grid.

Output (in data/):
  rivers.json     {"seaLevel", "grid", "rivers": [{"name", "discharge", "points", "lakes"}, ...]}
                  Points are [lon, lat] pairs, source first and mouth last, in degrees east and north.

Method (the one rivers.md documents; its original script was not kept):
  1. The 2880x1440 grid is averaged down to 1440x720, about 7.4 km cells at the equator, the grid rivers.md used.
  2. The sea is the connected water bodies of 100,000 km2 or more. Smaller basins below sea level are closed
     depressions, not ocean: a deep crater lake can have its floor below sea level and still be inland.
  3. A priority flood from every sea cell fills the depressions. Each land cell remembers the cell that reached it,
     which points downhill toward the sea along the spill path, so lake chains are followed without special cases.
  4. Each river is traced from the source in rivers.md by following those pointers to the sea.
  5. Cells the flood raised above the terrain are lakes; the ones a river crosses are reported with it.

Sources and mouths are seeded from the Summary table of rivers.md, so a trace can be checked against the published
length and mouth rather than invented. --check prints that comparison.

Uses only the Python standard library.
"""
import argparse
import heapq
import json
import math
import sys
from array import array
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
MARS_RADIUS_KM = 3389.5
SEA_DATUM_MOLA = 2000  # planet sea level above the Mars datum, m

# The seven long-term rivers, from the Summary table of rivers.md. Source and mouth are lon/lat in degrees east
# and north; source_m and the lake levels are metres above the planet's sea level; length_km and discharge are the
# published figures a trace is checked against.
RIVERS = [
    {"name": "Solis River", "source": (280.4, -10.6), "source_m": 2080, "mouth": (299.6, -28.6),
     "length_km": 1760, "discharge": 49700,
     "lake_names": [("Lake Solis", 1290, 761000), ("Lake Thaumasia", 940, 104000)]},
    {"name": "Thaumasia River", "source": (290.6, -30.4), "source_m": 3500, "mouth": (298.9, -30.6),
     "length_km": 880, "discharge": 10300, "lake_names": []},
    {"name": "Sabaea River", "source": (52.6, -9.9), "source_m": 810, "mouth": (44.9, -7.1),
     "length_km": 610, "discharge": 7650, "lake_names": []},
    {"name": "Hebes River", "source": (282.6, -3.6), "source_m": 2820, "mouth": (281.4, -0.6),
     "length_km": 220, "discharge": 5300, "lake_names": [("Lake Hebes", 1230, 26700)]},
    {"name": "Tyrrhena River", "source": (85.1, -10.4), "source_m": 1370, "mouth": (89.4, -5.6),
     "length_km": 440, "discharge": 4700, "lake_names": []},
    {"name": "Tholus River", "source": (265.1, 5.9), "source_m": 1640, "mouth": (269.4, 10.4),
     "length_km": 440, "discharge": 4300, "lake_names": []},
    {"name": "Pavonis River", "source": (245.6, 4.6), "source_m": 1700, "mouth": (240.1, 15.4),
     "length_km": 930, "discharge": 3400, "lake_names": []},
]

LAKE_TOLERANCE_M = 1        # a cell the flood raised by more than this is under water
SIMPLIFY_KM = 4             # Douglas-Peucker tolerance; below the 7.4 km cell, so courses keep their shape
SEA_MIN_AREA_KM2 = 100_000  # rivers.md: water bodies this large are the sea, smaller ones fill into lakes
SEED_SEARCH_DEG = 2.0       # how far from the published source to look for a cell in the right catchment
MOUTH_TOLERANCE_KM = 60     # a trace counts as reaching the published mouth within this distance
LAKE_NAME_TOLERANCE_M = 15      # rivers.md rounds lake levels, so names match by nearest surface
LAKE_NAME_AREA_FRACTION = 0.25  # ...and by area, since two lakes on one river can share a level


# --- Grid ------------------------------------------------------------------


def load_grid(path, meta_path):
    meta = json.loads(meta_path.read_text())
    width, height = meta["width"], meta["height"]
    elev = array("h")
    with open(path, "rb") as f:
        elev.fromfile(f, width * height)
    if sys.byteorder == "big":  # the file is little-endian, as prepare_data.py wrote it
        elev.byteswap()
    return elev, width, height


def downsample_2x2(src, width, height):
    """Average each 2x2 block, as prepare_data.py does."""
    out = array("h")
    for row in range(0, height, 2):
        top = src[row * width : (row + 1) * width]
        bottom = src[(row + 1) * width : (row + 2) * width]
        out.extend(
            (a + b + c + d + 2) // 4
            for a, b, c, d in zip(top[0::2], top[1::2], bottom[0::2], bottom[1::2])
        )
    return out


def cell_lonlat(index, width, height):
    y, x = divmod(index, width)
    return ((x + 0.5) * 360.0 / width, 90.0 - (y + 0.5) * 180.0 / height)


def lonlat_cell(lon, lat, width, height):
    x = int(lon % 360.0 / 360.0 * width) % width
    y = min(height - 1, max(0, int((90.0 - lat) / 180.0 * height)))
    return y * width + x


def neighbours(index, width, height):
    """The eight neighbours, wrapping in longitude and stopping at the poles."""
    y, x = divmod(index, width)
    for dy in (-1, 0, 1):
        ny = y + dy
        if ny < 0 or ny >= height:
            continue
        for dx in (-1, 0, 1):
            if dx == 0 and dy == 0:
                continue
            yield ny * width + (x + dx) % width


def haversine_km(a, b):
    lon1, lat1 = math.radians(a[0]), math.radians(a[1])
    lon2, lat2 = math.radians(b[0]), math.radians(b[1])
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
    return 2 * MARS_RADIUS_KM * math.asin(min(1.0, math.sqrt(h)))


def path_length_km(points):
    return sum(haversine_km(points[i], points[i + 1]) for i in range(len(points) - 1))


# --- Priority flood --------------------------------------------------------


def ocean_mask(elev, width, height, sea_level):
    """Which cells are the sea: connected bodies below sea level of at least SEA_MIN_AREA_KM2.

    An inland basin below sea level is a closed depression, not ocean. Without this the trace of a lake-chain river
    stops on the floor of its first deep crater lake, hundreds of kilometres short of the coast.
    """
    n = width * height
    ocean = bytearray(n)
    seen = bytearray(n)
    for start in range(n):
        if seen[start] or elev[start] >= sea_level:
            continue
        body = [start]
        seen[start] = 1
        area = 0.0
        head = 0
        while head < len(body):
            cell = body[head]
            head += 1
            area += cell_area_km2(cell, width, height)
            for nb in neighbours(cell, width, height):
                if seen[nb] or elev[nb] >= sea_level:
                    continue
                seen[nb] = 1
                body.append(nb)
        if area >= SEA_MIN_AREA_KM2:
            for cell in body:
                ocean[cell] = 1
    return ocean


def priority_flood(elev, ocean, width, height, sea_level):
    """Fill every depression from the sea inward.

    Returns (filled, parent). `filled` is the water-tight surface; `parent[i]` is the cell that reached i, which
    always lies downhill along the path water takes to the sea, so following parents from any land cell walks the
    river down through whatever lakes lie in the way. Sea cells have parent -1.
    """
    n = width * height
    filled = array("i", elev)
    parent = array("i", bytes(4 * n))  # 0 is a valid cell, so -1 marks the outlets below
    seen = bytearray(n)
    heap = []

    for i in range(n):
        if ocean[i]:
            seen[i] = 1
            parent[i] = -1
            filled[i] = sea_level
            heap.append((sea_level, i))
    if not heap:
        sys.exit(f"no sea of {SEA_MIN_AREA_KM2:,} km2 or more at a sea level of {sea_level} m")
    heapq.heapify(heap)

    while heap:
        level, cell = heapq.heappop(heap)
        for nb in neighbours(cell, width, height):
            if seen[nb]:
                continue
            seen[nb] = 1
            parent[nb] = cell
            filled[nb] = level if elev[nb] < level else elev[nb]
            heapq.heappush(heap, (filled[nb], nb))
    return filled, parent


def choose_seed(river, grid):
    """The cell to trace a river from, and the cell holding its published source.

    rivers.md gives each source to a tenth of a degree, but at 7.4 km a cell near a divide can sit on the wrong side
    of it. The published Solis source lies on the south wall of Melas Chasma, and the cell holding it drains north
    into the sound rather than south into the Solis basin, which cuts the river from 1,760 km to 112. So the seed is
    the nearest cell within SEED_SEARCH_DEG of the published source whose trace actually reaches the published mouth.

    Only a stranded source is moved. Six of the seven published sources already drain to their mouth and are used as
    given; picking the *highest* draining cell instead would quietly walk them onto a longer tributary head, which
    stretched the Tholus by 44% and the Pavonis by 30%.
    """
    elev, _filled, parent, ocean, width, height = grid
    lon0, lat0 = river["source"]
    published = lonlat_cell(lon0, lat0, width, height)
    step = 180.0 / height
    span = int(SEED_SEARCH_DEG / step)
    scale = max(math.cos(math.radians(lat0)), 0.2)

    def reaches_mouth(cell):
        end = cell_lonlat(trace(cell, parent, ocean, width, height)[-1], width, height)
        return haversine_km(end, river["mouth"]) <= MOUTH_TOLERANCE_KM

    if not ocean[published] and reaches_mouth(published):
        return published, published

    best = None
    seen = set()
    for dy in range(-span, span + 1):
        for dx in range(-span, span + 1):
            cell = lonlat_cell(lon0 + dx * step / scale, lat0 + dy * step, width, height)
            if cell in seen or ocean[cell]:
                continue
            seen.add(cell)
            if not reaches_mouth(cell):
                continue
            # Nearest, not highest: the aim is to step over the divide, not to find a longer headwater elsewhere.
            key = (haversine_km(cell_lonlat(cell, width, height), river["source"]), -elev[cell])
            if best is None or key < best[0]:
                best = (key, cell)
    return (best[1] if best else published), published


def lake_name(river, surface_m, area_km2):
    """The name rivers.md gives a lake, matched on surface and area. Its figures are rounded, so match the nearest.

    Surface alone is not enough: the Solis trough lake stands at +1,292 m, two metres from Lake Solis itself, and
    would take its name.
    """
    for name, surface, area in river["lake_names"]:
        if abs(surface - surface_m) <= LAKE_NAME_TOLERANCE_M and abs(area - area_km2) <= LAKE_NAME_AREA_FRACTION * area:
            return name
    return None


def trace(start, parent, ocean, width, height):
    """Cells from `start` down to the first sea cell, following the flood's pointers."""
    path = [start]
    cell = start
    guard = 4 * (width + height) * 10
    while not ocean[cell]:
        nxt = parent[cell]
        if nxt < 0:
            break
        cell = nxt
        path.append(cell)
        guard -= 1
        if guard <= 0:
            sys.exit(f"the trace from cell {start} does not reach the sea")
    return path


# --- Lakes -----------------------------------------------------------------


def lake_body(seed, filled, elev, ocean, width, height):
    """Every cell of the lake holding `seed`: connected, at the same surface, and under it."""
    level = filled[seed]
    body = {seed}
    stack = [seed]
    while stack:
        cell = stack.pop()
        for nb in neighbours(cell, width, height):
            if nb in body or ocean[nb] or filled[nb] != level or elev[nb] >= level - LAKE_TOLERANCE_M:
                continue
            body.add(nb)
            stack.append(nb)
    return body


def cell_area_km2(index, width, height):
    _, lat = cell_lonlat(index, width, height)
    dlat = math.pi * MARS_RADIUS_KM / height
    dlon = 2 * math.pi * MARS_RADIUS_KM / width * math.cos(math.radians(lat))
    return dlat * max(dlon, 0.0)


def lake_outline(body, width, height):
    """A closed ring around the lake's cells, walked along the outside of the mask."""
    edges = {}
    for cell in body:
        y, x = divmod(cell, width)
        corners = [(x, y), (x + 1, y), (x + 1, y + 1), (x, y + 1)]
        # Each cell contributes its four sides; a side shared with another lake cell cancels out.
        for a, b in ((corners[0], corners[1]), (corners[1], corners[2]), (corners[2], corners[3]),
                     (corners[3], corners[0])):
            if edges.pop((b, a), None) is None:
                edges[(a, b)] = True

    if not edges:
        return []
    start = next(iter(edges))
    ring = [start[0]]
    current = start
    while True:
        del edges[current]
        point = current[1]
        ring.append(point)
        nxt = next((e for e in edges if e[0] == point), None)
        if nxt is None:
            break
        current = nxt
    return [((px % width) * 360.0 / width, 90.0 - py * 180.0 / height) for px, py in ring]


# --- Simplification --------------------------------------------------------


def simplify(points, tolerance_km):
    """Douglas-Peucker on the sphere, with distances approximated in the local tangent plane."""
    if len(points) < 3:
        return list(points)
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        first, last = stack.pop()
        if last <= first + 1:
            continue
        ax, ay = points[first]
        bx, by = points[last]
        scale = math.cos(math.radians((ay + by) / 2))
        abx, aby = (bx - ax) * scale, by - ay
        norm = math.hypot(abx, aby)
        worst, worst_at = -1.0, first
        for i in range(first + 1, last):
            px, py = points[i]
            apx, apy = (px - ax) * scale, py - ay
            if norm < 1e-12:
                d = math.hypot(apx, apy)
            else:
                d = abs(apx * aby - apy * abx) / norm
            if d > worst:
                worst, worst_at = d, i
        if worst * math.pi / 180.0 * MARS_RADIUS_KM > tolerance_km:
            keep[worst_at] = True
            stack.append((first, worst_at))
            stack.append((worst_at, last))
    return [p for p, k in zip(points, keep) if k]


# --- Tracing one river -----------------------------------------------------


def trace_river(river, grid, sea_level):
    elev, filled, parent, ocean, width, height = grid
    seed, published = choose_seed(river, grid)
    cells = trace(seed, parent, ocean, width, height)

    lakes = []
    seen_levels = set()
    for cell in cells:
        level = filled[cell]
        if ocean[cell] or elev[cell] >= level - LAKE_TOLERANCE_M or level in seen_levels:
            continue
        seen_levels.add(level)
        body = lake_body(cell, filled, elev, ocean, width, height)
        if len(body) < 2:
            continue
        area = sum(cell_area_km2(c, width, height) for c in body)
        lon = sum(cell_lonlat(c, width, height)[0] for c in body) / len(body)
        lat = sum(cell_lonlat(c, width, height)[1] for c in body) / len(body)
        depth = max(level - elev[c] for c in body)
        lakes.append({
            "name": lake_name(river, level - sea_level, area),
            "surface": level - sea_level,
            "areaKm2": round(area),
            "depth": depth,
            "centre": [round(lon, 2), round(lat, 2)],
            "points": [[round(x, 3), round(y, 3)] for x, y in simplify(lake_outline(body, width, height), SIMPLIFY_KM)],
        })

    points = [cell_lonlat(c, width, height) for c in cells]
    # A course that crosses 0degE must not jump backwards across the seam when it is drawn.
    unwrapped = [points[0]]
    for lon, lat in points[1:]:
        prev = unwrapped[-1][0]
        while lon - prev > 180:
            lon -= 360
        while prev - lon > 180:
            lon += 360
        unwrapped.append((lon, lat))

    return {
        "name": river["name"],
        "discharge": river["discharge"],
        "lengthKm": round(path_length_km(points)),
        "publishedLengthKm": river["length_km"],
        "source": [round(points[0][0], 2), round(points[0][1], 2)],
        "publishedSource": [river["source"][0], river["source"][1]],
        "seedShiftKm": round(haversine_km(points[0], cell_lonlat(published, width, height))),
        "mouth": [round(points[-1][0], 2), round(points[-1][1], 2)],
        "publishedMouth": [river["mouth"][0], river["mouth"][1]],
        "points": [[round(x, 3), round(y, 3)] for x, y in simplify(unwrapped, SIMPLIFY_KM)],
        "lakes": lakes,
    }


def main():
    parser = argparse.ArgumentParser(
        description=__doc__.split("\n\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="\n\n".join(__doc__.split("\n\n")[1:]),
    )
    parser.add_argument("--sea-level", type=int, default=SEA_DATUM_MOLA,
                        help="sea level above the Mars datum in metres (default: %(default)s)")
    parser.add_argument("--check", action="store_true",
                        help="print each trace against the length and mouth published in rivers.md")
    parser.add_argument("--out", type=Path, default=DATA_DIR / "rivers.json", help="output file")
    args = parser.parse_args()

    elev, width, height = load_grid(DATA_DIR / "elevation.bin", DATA_DIR / "elevation.json")
    print(f"Loaded {width}x{height}; averaging down to {width // 2}x{height // 2}", flush=True)
    elev = downsample_2x2(elev, width, height)
    width, height = width // 2, height // 2

    print("Finding the sea...", flush=True)
    ocean = ocean_mask(elev, width, height, args.sea_level)
    sea_cells = sum(ocean)
    below = sum(1 for e in elev if e < args.sea_level)
    print(f"  sea {sea_cells:,} cells; {below - sea_cells:,} more below sea level are closed basins", flush=True)

    print("Filling depressions...", flush=True)
    filled, parent = priority_flood(elev, ocean, width, height, args.sea_level)
    grid = (elev, filled, parent, ocean, width, height)

    rivers = []
    for river in RIVERS:
        print(f"Tracing {river['name']}...", flush=True)
        rivers.append(trace_river(river, grid, args.sea_level))

    if args.check:
        print(f"\n{'River':<18}{'length':>26}{'mouth':>20}{'seed':>10}{'lakes':>8}")
        for r in rivers:
            ratio = r["lengthKm"] / r["publishedLengthKm"]
            off = haversine_km(r["mouth"], r["publishedMouth"])
            length = f"{r['lengthKm']:,} vs {r['publishedLengthKm']:,} km ({ratio:.2f}x)"
            mouth = f"{off:,.0f} km off"
            seed = f"+{r['seedShiftKm']} km" if r["seedShiftKm"] else "as given"
            print(f"{r['name']:<18}{length:>26}{mouth:>20}{seed:>10}{len(r['lakes']):>8}")
        named = [(lk["name"], lk["areaKm2"], lk["surface"], lk["depth"])
                 for r in rivers for lk in r["lakes"] if lk["name"]]
        for name, area, surface, depth in named:
            print(f"  {name:<16} {area:>9,} km2  +{surface:,} m  {depth:,} m deep")

    out = {
        "seaLevel": args.sea_level,
        "grid": {"width": width, "height": height},
        "source": "tools/trace_rivers.py, seeded from rivers.md",
        "rivers": rivers,
    }
    args.out.write_text(json.dumps(out, separators=(",", ":")) + "\n")
    total_lakes = sum(len(r["lakes"]) for r in rivers)
    print(f"\nWrote {args.out} ({len(rivers)} rivers, {total_lakes} lakes, "
          f"{args.out.stat().st_size / 1000:.0f} kB)")


if __name__ == "__main__":
    main()
