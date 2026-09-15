#!/usr/bin/env python3
"""Generate a biome picture from a prompt file with the OpenAI image API.

Usage:
  OPENAI_API_KEY=... python3 gen_bioms/gen_pict.py gen_bioms/L05-plateau-core-cold-steppe.md [more.md ...]

For each prompt file, the text under "## Prompt" (or the whole file, if it has no such section) is sent to
POST {OPENAI_BASE_URL}/images/generations. The returned picture is saved next to the prompt file, with the same name
and the picture's own extension: L05-plateau-core-cold-steppe.md -> L05-plateau-core-cold-steppe.png.
If a picture already exists for any given prompt, the script exits without generating anything unless --force is
given, because every call costs money.

Environment:
  OPENAI_API_KEY   required (not needed with --dry-run)
  OPENAI_BASE_URL  optional, default https://api.openai.com/v1

Uses only the Python standard library.
"""
import argparse
import base64
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

DEFAULT_BASE_URL = "https://api.openai.com/v1"
IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp")
TIMEOUT_S = 300  # generating one high-quality picture can take a minute or two


def section(text, heading):
    """Body of a '## heading' section, up to the next '## ' heading, or None."""
    match = re.search(rf"^## {re.escape(heading)}[ \t]*\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    return match.group(1).strip() if match else None


def extract_prompt(text, variation=None):
    """The Prompt section (or the whole text), plus the chosen Variations bullet (1-based)."""
    prompt = section(text, "Prompt") or text.strip()
    if variation:
        # A bullet may continue on lines indented by two spaces.
        bullets = re.findall(r"^- (.+(?:\n  .+)*)", section(text, "Variations") or "", re.M)
        if not 1 <= variation <= len(bullets):
            raise ValueError(f"no variation {variation} (the file has {len(bullets)})")
        prompt += "\n\nVariation: " + " ".join(bullets[variation - 1].split())
    return prompt


def request_body(prompt, args):
    body = {"model": args.model, "prompt": prompt, "size": args.size, "quality": args.quality, "n": 1}
    if not args.model.startswith("dall-e"):
        body["output_format"] = args.format  # only the GPT image models accept it
    return body


def request_image(prompt, args, api_key):
    request = urllib.request.Request(
        f"{args.base_url}/images/generations",
        data=json.dumps(request_body(prompt, args)).encode(),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=TIMEOUT_S) as resp:
        return json.load(resp)


def image_bytes(result):
    """(picture bytes, revised prompt or None) from an images/generations response."""
    try:
        item = result["data"][0]
    except (KeyError, IndexError, TypeError):
        raise RuntimeError("the response contains no image") from None
    if item.get("b64_json"):
        return base64.b64decode(item["b64_json"]), item.get("revised_prompt")
    if item.get("url"):
        with urllib.request.urlopen(item["url"], timeout=TIMEOUT_S) as resp:
            return resp.read(), item.get("revised_prompt")
    raise RuntimeError("the response contains no image")


def image_extension(data, fallback):
    """Extension from the picture's magic bytes, or from the requested format."""
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if data.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    return ".jpg" if fallback == "jpeg" else f".{fallback}"


def api_error_message(err):
    try:
        return json.loads(err.read())["error"]["message"]
    except (ValueError, KeyError, TypeError):
        return err.reason


def output_stem(path, variation=None):
    return path.stem + (f"-v{variation}" if variation else "")


def existing_pictures(path, variation=None):
    """Pictures already saved for this prompt (and variation), in any image format."""
    stem = output_stem(path, variation)
    return [p for p in (path.with_name(stem + ext) for ext in IMAGE_EXTENSIONS) if p.exists()]


def generate(path, args, api_key):
    stem = output_stem(path, args.variation)
    existing = existing_pictures(path, args.variation)  # main() has exited already unless --force or --dry-run

    prompt =extract_prompt(path.read_text(encoding="utf-8"), args.variation)
    if args.dry_run:
        print(f"--- {path} -> POST {args.base_url}/images/generations")
        print(json.dumps(request_body(prompt, args), indent=2, ensure_ascii=False))
        return

    print(f"{path}: generating with {args.model} ({args.size}, {args.quality} quality)...", flush=True)
    try:
        result = request_image(prompt, args, api_key)
    except urllib.error.HTTPError as err:
        raise RuntimeError(f"API error {err.code}: {api_error_message(err)}") from None
    except urllib.error.URLError as err:
        raise RuntimeError(f"cannot reach {args.base_url}: {err.reason}") from None
    except TimeoutError:
        raise RuntimeError(f"no answer within {TIMEOUT_S} s") from None

    data, revised_prompt = image_bytes(result)
    out = path.with_name(stem + image_extension(data, args.format))
    out.write_bytes(data)
    for old in existing:  # --force with a different format: keep one picture per prompt
        if old != out:
            old.unlink()
    print(f"{path}: saved {out} ({len(data) / 1e6:.1f} MB)")
    if revised_prompt:
        print(f"  revised prompt: {revised_prompt}")


def main():
    parser = argparse.ArgumentParser(
        description=__doc__.split("\n\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="\n\n".join(__doc__.split("\n\n")[1:]),
    )
    parser.add_argument("prompts", nargs="+", type=Path, metavar="PROMPT.md", help="prompt file(s)")
    parser.add_argument("--variation", type=int, metavar="N",
                        help="append the N-th bullet of '## Variations' (1-based); saves as NAME-vN")
    parser.add_argument("--model", default="gpt-image-1",
                        help="image model, e.g. gpt-image-1, gpt-image-1.5, gpt-image-2 or chatgpt-image-latest "
                             "(default: %(default)s)")
    parser.add_argument("--size", default="1536x1024",
                        help="1024x1024, 1536x1024 (landscape), 1024x1536 or auto; newer GPT image models may accept "
                             "other WIDTHxHEIGHT values (default: %(default)s)")
    parser.add_argument("--quality", default="high",
                        help="low, medium, high or auto; some newer models also take xhigh or max. Higher costs "
                             "more (default: %(default)s)")
    parser.add_argument("--format", default="png", choices=["png", "jpeg", "webp"],
                        help="requested picture format (default: %(default)s)")
    parser.add_argument("--force", action="store_true", help="overwrite an existing picture")
    parser.add_argument("--dry-run", action="store_true", help="print the request without calling the API")
    args = parser.parse_args()
    args.base_url = os.environ.get("OPENAI_BASE_URL", DEFAULT_BASE_URL).rstrip("/")

    # Check before the key and before any call: every call costs money.
    if not (args.force or args.dry_run):
        existing = [p for path in args.prompts for p in existing_pictures(path, args.variation)]
        if len(existing) == 1:
            sys.exit(f"{existing[0].name} already exists; nothing generated (use --force to overwrite)")
        if existing:
            sys.exit("\n".join(f"{p.name} already exists" for p in existing)
                     + "\nnothing generated (use --force to overwrite)")

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key and not args.dry_run:
        sys.exit("OPENAI_API_KEY is not set")

    failed = 0
    for path in args.prompts:
        try:
            generate(path, args, api_key)
        except (OSError, ValueError, RuntimeError) as err:
            print(f"{path}: {err}", file=sys.stderr)
            failed += 1
    if failed:
        sys.exit(f"{failed} of {len(args.prompts)} prompt file(s) failed")


if __name__ == "__main__":
    main()
