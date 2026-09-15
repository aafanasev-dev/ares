#!/usr/bin/env python3
"""Download the MGS MOLA MEGDR global topography and convert it for the web page.

Output (in data/):
  elevation.bin   Int16 little-endian elevations in meters relative to the Mars areoid.
                  Row 0 is 90°N, column 0 is 0°E, longitude increases eastward.
  elevation.json  {"width", "height", "min", "max", ...}

Uses only the Python standard library.
"""
import argparse
import json
import sys
import urllib.request
from array import array
from pathlib import Path

BASE_URL = "https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x"
SOURCES = {
    # pixels per degree: (url, width, height)
    4: (f"{BASE_URL}/meg004/megt90n000cb.img", 1440, 720),
    16: (f"{BASE_URL}/meg016/megt90n000eb.img", 5760, 2880),
}
DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def download(url, dest):
    if dest.exists():
        print(f"Using cached {dest}")
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_name(dest.name + ".part")
    print(f"Downloading {url}")
    with urllib.request.urlopen(url) as resp, open(tmp, "wb") as out:
        total = int(resp.headers.get("Content-Length", 0))
        done = 0
        while chunk := resp.read(1 << 20):
            out.write(chunk)
            done += len(chunk)
            if total:
                print(f"\r  {done / total:6.1%} of {total / 1e6:.1f} MB", end="", flush=True)
    print()
    tmp.rename(dest)


def read_int16_be(path, count):
    samples = array("h")
    if samples.itemsize != 2:
        sys.exit("array('h') is not 16-bit on this platform")
    with open(path, "rb") as f:
        samples.fromfile(f, count)
    if sys.byteorder == "little":
        samples.byteswap()
    return samples


def downsample_2x2(src, width, height):
    """Average each 2x2 block (rounded to nearest meter)."""
    out = array("h")
    for row in range(0, height, 2):
        top = src[row * width : (row + 1) * width]
        bottom = src[(row + 1) * width : (row + 2) * width]
        out.extend(
            (a + b + c + d + 2) // 4
            for a, b, c, d in zip(top[0::2], top[1::2], bottom[0::2], bottom[1::2])
        )
    return out


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--res",
        type=int,
        choices=sorted(SOURCES),
        default=16,
        help="source resolution in pixels/degree; 16 is averaged down to 8 (default: 16)",
    )
    args = parser.parse_args()

    url, width, height = SOURCES[args.res]
    raw_path = DATA_DIR / "raw" / url.rsplit("/", 1)[1]
    download(url, raw_path)

    if raw_path.stat().st_size != width * height * 2:
        sys.exit(f"{raw_path}: expected {width * height * 2} bytes. Delete it and re-run.")
    elev = read_int16_be(raw_path, width * height)

    if args.res == 16:
        # 5760x2880 -> 2880x1440, safely below WebGL texture size limits.
        elev = downsample_2x2(elev, width, height)
        width, height = width // 2, height // 2

    if sys.byteorder == "big":
        elev.byteswap()
    with open(DATA_DIR / "elevation.bin", "wb") as f:
        elev.tofile(f)
    if sys.byteorder == "big":
        elev.byteswap()

    meta = {
        "width": width,
        "height": height,
        "min": min(elev),
        "max": max(elev),
        "units": "meters relative to the Mars areoid",
        "layout": "row 0 = 90N, column 0 = 0E, east-positive longitude",
        "source": url,
    }
    (DATA_DIR / "elevation.json").write_text(json.dumps(meta, indent=2) + "\n")
    print(f"Wrote {DATA_DIR / 'elevation.bin'} ({width}x{height}, min {meta['min']} m, max {meta['max']} m)")


if __name__ == "__main__":
    main()
