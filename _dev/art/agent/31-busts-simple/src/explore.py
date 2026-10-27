"""Scratch: automatic simplification passes over the v1 busts, to see where each needs a hand."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "00-foundation"))
import pixkit
from PIL import Image
from collections import Counter

REF = pathlib.Path(__file__).resolve().parents[3] / "reference"
INK = pixkit.PALETTE["ink"]
NAMES = ("pyreth", "rodain", "mirael", "kael", "lirae")

def dist(a, b):
    return sum((x - y) ** 2 for x, y in zip(a, b))

def merge_small(img, keep=7):
    px = img.load()
    cnt = Counter(px[x, y][:3] for y in range(img.height) for x in range(img.width) if px[x, y][3] and px[x, y][:3] != INK)
    big = [c for c, _ in cnt.most_common(keep)]
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if a and (r, g, b) != INK and (r, g, b) not in big:
                c = min(big, key=lambda k: dist(k, (r, g, b)))
                if dist(c, (r, g, b)) < 9000:
                    px[x, y] = c + (255,)
    return img

def despeckle(img):
    src, out = img.load(), img.copy()
    o = out.load()
    for y in range(1, img.height - 1):
        for x in range(1, img.width - 1):
            p = src[x, y]
            if not p[3] or p[:3] == INK:
                continue
            n = [src[x + dx, y + dy] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))]
            if all(q == n[0] for q in n) and n[0] != p and n[0][3] and n[0][:3] != INK:
                o[x, y] = n[0]
    return out

def half(img):
    """Half resolution by the most common non-ink color of each 2x2 block, then a fresh outline."""
    w, h = (img.width + 1) // 2, (img.height + 1) // 2
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = img.load()
    for y in range(h):
        for x in range(w):
            block = [px[i, j] for i in (2 * x, 2 * x + 1) for j in (2 * y, 2 * y + 1) if i < img.width and j < img.height]
            body = [p for p in block if p[3] and p[:3] != INK]
            if len(body) >= 2:
                out.putpixel((x, y), Counter(body).most_common(1)[0][0])
    return pixkit.outline(out)

rows = [("v1", []), ("simpler", []), ("chunky", [])]
for n in NAMES:
    v1 = Image.open(REF / f"bust-{n}.png").convert("RGBA")
    a = despeckle(merge_small(pixkit.quantize(v1.copy())))
    b = half(a)
    rows[0][1].append(v1); rows[1][1].append(a); rows[2][1].append(b.resize((b.width * 2, b.height * 2), Image.NEAREST))
pixkit.contact_sheet(rows, scale=4).save(sys.argv[1])
