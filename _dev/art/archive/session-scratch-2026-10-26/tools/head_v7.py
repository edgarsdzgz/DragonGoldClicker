"""Warden head study V7: V2 exactly, plus the V5 details the owner liked.

Reads V2's finished sprite (head/v3.png, published as head study V2) back into
palette labels, so V2's silhouette, pose, eye, mouth and palette stay pixel for
pixel. Then adds, using only V2's existing colours:
- growth rings along both horns, closer at the root
- a few plates on the crown, brow and snout bridge
- a row of lip scales on both jaws
- sparse scales on the shadow side of the neck, densest at the terminator
- an ear opening behind the jaw hinge, one skin fold at the throat
"""
import sys
import numpy as np
from PIL import Image, ImageDraw

SRC = sys.argv[1]
OUT = sys.argv[2]

PAL = {
    "O": (26, 10, 22), "Q": (92, 22, 36),
    "a": (52, 14, 38), "b": (104, 24, 40), "c": (164, 40, 38),
    "d": (214, 76, 44), "e": (246, 140, 64),
    "f": (118, 62, 34), "g": (186, 120, 46), "h": (230, 178, 82),
    "i": (255, 226, 146),
    "j": (70, 50, 58), "k": (138, 116, 104), "l": (204, 186, 156),
    "m": (246, 236, 210),
    "n": (255, 214, 60), "p": (240, 120, 30),
}
REV = {v: k for k, v in PAL.items()}
DARKER = {"e": "d", "d": "c", "c": "b", "b": "a"}

src = Image.open(SRC).convert("RGBA")
W, H = src.size
lab = np.full((H, W), ".", dtype="<U1")
sp = src.load()
for y in range(H):
    for x in range(W):
        r, g, b, a = sp[x, y]
        if a:
            lab[y, x] = REV[(r, g, b)]


def poly(pts):
    im = Image.new("1", (W, H), 0)
    ImageDraw.Draw(im).polygon(pts, fill=1, outline=1)
    return np.array(im, dtype=bool)


def recolour(x, y, mapping):
    if 0 <= x < W and 0 <= y < H and lab[y, x] in mapping:
        lab[y, x] = mapping[lab[y, x]]


def arc(x, y, mapping=DARKER):
    for dx, dy in ((0, 0), (1, -1), (2, 0)):
        recolour(x + dx, y + dy, mapping)


def rings(mask, root, tip, ts, half=3):
    (rx, ry), (tx, ty) = root, tip
    dx, dy = tx - rx, ty - ry
    ln = (dx * dx + dy * dy) ** 0.5
    nx, ny = -dy / ln, dx / ln
    for t in ts:
        cx, cy = rx + dx * t, ry + dy * t
        for s in np.arange(-half, half + 0.01, 0.5):
            x, y = int(round(cx + nx * s)), int(round(cy + ny * s))
            if 0 <= x < W and 0 <= y < H and mask[y, x]:
                recolour(x, y, {"m": "l", "l": "k", "k": "j"})


horn_px = np.isin(lab, list("jklm"))

# ---- horns: growth rings, closer together at the root ------------------------------
near = poly([(19, 10), (14, 7), (8, 4), (3, 3), (0, 3), (2, 5), (7, 7),
             (12, 10), (15, 14), (18, 14)]) & horn_px
far = poly([(22, 10), (19, 5), (15, 1), (12, 0), (13, 2), (16, 6),
            (18, 11)]) & horn_px
rings(near, (16, 11), (1, 4), (0.22, 0.36, 0.52, 0.7))
rings(far, (20, 9), (13, 1), (0.25, 0.5), half=2)

# ---- plates: crown, brow and snout bridge ------------------------------------------
for x, ys in ((20, (10, 11)), (24, (11, 12)), (36, (15, 16)), (40, (16, 17))):
    for y in ys:
        recolour(x, y, DARKER)

# ---- lip scales: a seam every third pixel along both lips -------------------------------
for x in range(30, 43, 3):
    recolour(x, 22, DARKER)
for x in range(25, 42, 3):
    recolour(x, 24, DARKER)

# ---- neck: sparse scales on the shadow side, densest at the terminator -------------
for x, y in ((12, 21), (10, 27), (12, 30), (9, 33), (11, 37), (8, 41),
             (10, 44)):
    arc(x, y)

# ---- ear opening behind the jaw hinge, one skin fold at the throat -------------------
# the opening sits in shadow, so a lit rim on its front edge carries it
lab[21, 17] = "O"
lab[22, 17] = "O"
for x, y in ((18, 21), (18, 22), (17, 20)):
    if lab[y, x] in "ab":
        lab[y, x] = "c"
for x, y in ((16, 30), (17, 31), (18, 31)):
    recolour(x, y, DARKER)

img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
pix = img.load()
used = set()
for y in range(H):
    for x in range(W):
        c = lab[y, x]
        if c != ".":
            pix[x, y] = PAL[c] + (255,)
            used.add(c)
img.save(OUT)
prev = Image.new("RGBA", (W, H), (30, 24, 36, 255))
prev.alpha_composite(img)
prev.resize((W * 8, H * 8), Image.NEAREST).save(OUT.replace(".png", "-x8.png"))
print("colours", len(used))
