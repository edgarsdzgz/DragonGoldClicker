"""Warden full body V2: body V1's pose at 128x128 wearing V7's actual head.

V7's head, jaw, horns and jaw frill are copied pixel for pixel from the
portrait. The body is V1's crouched perch scaled by 4/3, with a new neck that
leaves V7's skull and jaw and runs down to the shoulders. The body is still
flat colour (the pose checkpoint); shading comes in the next pass.

usage: body_v2.py <v7.png> <out.png>
"""
import sys
import numpy as np
from PIL import Image, ImageDraw

V7, OUT = sys.argv[1], sys.argv[2]
W = H = 128
WALL = 115
S = 4 / 3
OX, OY = 74, 2                        # where V7's 48x48 sits on the canvas

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
lab = np.full((H, W), ".", dtype="<U1")


def sc(pts):
    return [(round(x * S), round(y * S)) for x, y in pts]


def poly(pts, w=W, h=H):
    im = Image.new("1", (w, h), 0)
    ImageDraw.Draw(im).polygon(pts, fill=1, outline=1)
    return np.array(im, dtype=bool)


def line(p, q, width=1):
    im = Image.new("1", (W, H), 0)
    ImageDraw.Draw(im).line([p, q], fill=1, width=width)
    return np.array(im, dtype=bool)


def dilate(m):
    d = m.copy()
    d[1:, :] |= m[:-1, :]
    d[:-1, :] |= m[1:, :]
    d[:, 1:] |= m[:, :-1]
    d[:, :-1] |= m[:, 1:]
    return d


def part(pts, base, ring="O"):
    m = poly(pts)
    lab[dilate(m) & ~m] = ring
    lab[m] = base
    return m


def px(c, *xy):
    for x, y in xy:
        lab[y, x] = c


# ---- far side ---------------------------------------------------------------------
part(sc([(52, 40), (49, 12), (45, 18)]), "a")
part(sc([(26, 81), (36, 81), (40, 86), (24, 86)]), "a")
part(sc([(64, 60), (70, 60), (74, 72), (75, 81), (70, 81), (67, 70)]), "a")
part(sc([(69, 80), (76, 81), (82, 84), (84, 86), (68, 86)]), "a")

# ---- tail -------------------------------------------------------------------------
part(sc([(28, 62), (20, 64), (13, 69), (8, 76), (6, 84), (8, 91), (13, 95),
         (16, 93), (12, 88), (11, 80), (15, 73), (22, 69), (29, 70)]), "c")
part(sc([(9, 92), (5, 95), (12, 95), (15, 93)]), "k")

# ---- torso ------------------------------------------------------------------------
part(sc([(56, 40), (50, 44), (42, 50), (34, 55), (27, 60), (24, 66), (28, 72),
         (38, 74), (48, 72), (58, 70), (64, 67), (70, 62), (72, 56), (70, 50),
         (66, 44), (62, 40)]), "c")
lab[poly(sc([(66, 66), (58, 70), (48, 72), (38, 74), (38, 72), (48, 70),
             (57, 68), (64, 64)])) & (lab == "c")] = "g"

# ---- near wing, folded --------------------------------------------------------------
wing = part(sc([(56, 44), (52, 34), (47, 24), (42, 14), (36, 20), (26, 32),
                (16, 44), (8, 54), (13, 55), (18, 58), (24, 55), (30, 57),
                (38, 53), (48, 50), (54, 48)]), "b")
wrist = sc([(42, 14)])[0]
for tip in sc([(8, 54), (18, 58), (30, 57)]):
    lab[line(wrist, tip) & wing] = "c"
lab[line(sc([(56, 44)])[0], wrist, 2) & wing] = "c"
part(sc([(41, 14), (42, 9), (45, 13)]), "l")

# ---- neck: leaves V7's skull and jaw, runs down to the shoulders ----------------------
part([(88, 15), (84, 20), (81, 28), (78, 38), (75, 48), (73, 58), (83, 64),
      (93, 67), (92, 58), (92, 48), (94, 40), (97, 32), (92, 26)], "c")
lab[poly([(97, 32), (94, 40), (92, 48), (92, 58), (93, 67), (96, 75), (93, 83),
          (88, 88), (85, 86), (89, 80), (90, 72), (88, 64), (87, 56), (87, 48),
          (89, 40), (92, 32)]) & (lab != ".") & (lab != "O")] = "g"
for x, y in ((84, 21), (81, 29), (78, 37), (76, 45)):
    part([(x, y), (x - 5, y - 1), (x - 1, y + 4)], "k")

# ---- near hind leg and foreleg ---------------------------------------------------------
part(sc([(26, 58), (36, 56), (46, 62), (50, 70), (46, 76), (36, 78), (26, 74),
         (22, 66)]), "c")
part(sc([(40, 72), (48, 72), (44, 80), (38, 84), (34, 82), (36, 76)]), "c")
part(sc([(34, 81), (44, 81), (52, 83), (55, 86), (33, 86)]), "c")
px("l", *sc([(55, 85), (56, 86), (51, 86), (52, 86)]))
part(sc([(58, 46), (66, 46), (68, 54), (64, 64), (58, 66), (56, 58)]), "c")
part(sc([(57, 62), (63, 61), (68, 72), (69, 80), (64, 80), (60, 70)]), "c")
part(sc([(62, 79), (69, 79), (75, 82), (78, 86), (61, 86)]), "c")
px("l", *sc([(78, 85), (79, 86), (75, 86), (76, 86)]))

# lines between overlapping parts soften; only the outer edge keeps the outline
solid = lab != "."
for y in range(H):
    for x in range(W):
        if lab[y, x] == "O" and not any(
                0 <= yy < H and 0 <= xx < W and not solid[yy, xx]
                for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1))):
            lab[y, x] = "a"

# ---- V7's head, pixel for pixel ----------------------------------------------------------
v7 = Image.open(V7).convert("RGBA")
vp = v7.load()
# head, jaw, both horns and the jaw frill, in V2/V7 portrait coordinates
mask = np.zeros((48, 48), dtype=bool)
for pts in ([(14, 12), (19, 9), (25, 10), (30, 12), (33, 14), (40, 15), (44, 17),
             (46, 19), (46, 21), (44, 22), (27, 23), (21, 25), (17, 25), (14, 21),
             (13, 16)],
            [(20, 23), (27, 23), (43, 23), (43, 25), (41, 27), (36, 28), (30, 30),
             (24, 31), (18, 28)],
            [(19, 10), (14, 7), (8, 4), (3, 3), (0, 3), (2, 5), (7, 7), (12, 10),
             (15, 14), (18, 14)],
            [(22, 10), (19, 5), (15, 1), (12, 0), (13, 2), (16, 6), (18, 11)],
            [(16, 24), (10, 26), (7, 27), (11, 27), (17, 26)]):
    mask |= poly(pts, 48, 48)
mask = dilate(mask)
for y in range(48):
    for x in range(48):
        r, g, b, a = vp[x, y]
        if a and mask[y, x]:
            lab[OY + y, OX + x] = REV[(r, g, b)]

img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
pix = img.load()
used = set()
for y in range(H):
    for x in range(W):
        if lab[y, x] != ".":
            pix[x, y] = PAL[lab[y, x]] + (255,)
            used.add(lab[y, x])
img.save(OUT)


def scene(fg, k):
    bg = Image.new("RGBA", (W, H), (30, 24, 36, 255))
    d = ImageDraw.Draw(bg)
    d.rectangle([0, WALL, W - 1, H - 1], fill=(74, 66, 80, 255))
    d.line([(0, WALL), (W - 1, WALL)], fill=(116, 106, 120, 255))
    for x in range(0, W, 16):
        d.line([(x, WALL + 1), (x, H - 1)], fill=(56, 50, 62, 255))
    bg.alpha_composite(fg)
    return bg.resize((W * k, H * k), Image.NEAREST)


scene(img, 3).save(OUT.replace(".png", "-x3.png"))
scene(img, 2).save(OUT.replace(".png", "-x2.png"))
sil = Image.new("RGBA", (W, H), (224, 202, 160, 255))
sp = sil.load()
for y in range(H):
    for x in range(W):
        if lab[y, x] != ".":
            sp[x, y] = (18, 9, 15, 255)
sil.resize((W * 3, H * 3), Image.NEAREST).save(OUT.replace(".png", "-sil-x3.png"))
print("colours", len(used))
