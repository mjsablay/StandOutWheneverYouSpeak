#!/usr/bin/env python3
"""
Cut the client logos from Barry's deck into clean, uniform PNGs.

    python3 scripts/normalise-logos.py "<path to Client Logos.pptx>"

For each logo: knock the background out by flooding from the corners (so
white inside a mark, like BMO's letters, survives), trim to the ink, then
scale to one visual weight — geometric mean of width and height ≈ 150px at
2x — inside a 480×128 transparent canvas. Output goes to public/logos/<slug>.png,
where <slug> is the second value in COMPANIES in lib/site.ts.

Add a company: put its image in the deck, add a line to DECK_MAP and to
COMPANIES, and re-run. Needs Pillow (pip3 install --user pillow).
"""
import math, os, sys, zipfile, tempfile
from collections import deque
from PIL import Image

# Deck image number → slug. Marks whose corners are the logo itself get no
# knockout; a few sit in off-white boxes and need a looser tolerance.
DECK_MAP = {
    1: "cibc", 2: "rbc", 3: "bmo", 4: "tjx", 5: "mars", 6: "cpa", 7: "kijiji", 8: "indeed",
    9: "nissan", 10: "peoples-bank", 11: "canaccord", 12: "deloitte", 13: "wrigley", 14: "uoft",
    15: "schindler", 16: "manulife", 17: "gm", 18: "fortinet", 19: "samsung", 20: "merrithew",
    21: "citi", 22: "vgw", 23: "lubrizol", 24: "air-canada", 25: "globe-and-mail", 26: "equitable",
    27: "401-group", 28: "maersk", 29: "smartcentres", 30: "maple-reinders", 31: "coeur",
    32: "kenaidan", 33: "desjardins", 34: "sani-marc", 35: "sunlife",
}
NO_KNOCKOUT = {"rbc", "bmo"}
TOLERANCE = {"sunlife": 90}
KEEP_EXISTING = {"coeur"}  # deck copy has a transparency checkerboard baked in
PRE_CROP = {"sunlife": 0.05}  # a hairline border around a white square; cut it off first

BOX_W, BOX_H, TARGET = 480, 128, 150


def knockout(im, tol=48):
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    seen, q = set(), deque()
    for s in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        r, g, b, a = px[s]
        if a >= 20:
            q.append((s, (r, g, b)))
    while q:
        (x, y), ref = q.popleft()
        if (x, y) in seen or x < 0 or y < 0 or x >= w or y >= h:
            continue
        r, g, b, a = px[x, y]
        if a > 20 and abs(r - ref[0]) + abs(g - ref[1]) + abs(b - ref[2]) > tol * 3:
            continue
        seen.add((x, y))
        px[x, y] = (r, g, b, 0)
        for n in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if n not in seen:
                q.append((n, ref))
    return im


def trim(im):
    b = im.split()[3].getbbox()
    return im.crop(b) if b else im


def normalise(im):
    w, h = im.size
    s = min(TARGET / math.sqrt(w * h), BOX_H / h, BOX_W / w)
    im = im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    canvas = Image.new("RGBA", (BOX_W, BOX_H), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((BOX_W - im.width) // 2, (BOX_H - im.height) // 2))
    return canvas


def main(deck):
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = os.path.join(root, "public", "logos")
    with tempfile.TemporaryDirectory() as tmp:
        zipfile.ZipFile(deck).extractall(tmp)
        media = os.path.join(tmp, "ppt", "media")
        files = {int("".join(c for c in f if c.isdigit())): os.path.join(media, f) for f in os.listdir(media)}
        for n, slug in DECK_MAP.items():
            src = os.path.join(out, f"{slug}.png") if slug in KEEP_EXISTING else files[n]
            im = Image.open(src).convert("RGBA")
            if slug in PRE_CROP:
                m = PRE_CROP[slug]
                im = im.crop((round(im.width * m), round(im.height * m), round(im.width * (1 - m)), round(im.height * (1 - m))))
            if max(im.size) < 400:
                f = 400 / max(im.size)
                im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
            if slug not in NO_KNOCKOUT:
                im = knockout(im, TOLERANCE.get(slug, 48))
            normalise(trim(im)).save(os.path.join(out, f"{slug}.png"), optimize=True)
            print("wrote", slug)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
