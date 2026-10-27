"""Warden full body V3: the whole V7 portrait 1:1, with the body built from it.

Step 1: V7's 48x48 portrait (head, horns, neck, spines, throat plates) is
copied pixel for pixel onto a 128x128 canvas. Nothing in it is redrawn.
Step 2: the body is drawn at the same pixel scale, starting where V7's neck
leaves its frame: a broad keeled chest under V7's flared throat, the crouched
perch from body V1/V2, and V7's shading style: the 5-tone hide ramp, light from
the upper front (right), the back and underside in shadow, gold plates from
throat to belly, sparse scales at the terminator. Flat clusters, no dithering.

usage: body_v3.py <v7.png> <out.png>
"""
import sys
import numpy as np
from PIL import Image, ImageDraw

V7, OUT = sys.argv[1], sys.argv[2]
W = H = 128
WALL = 115
OX, OY = 74, 2                         # V7's top-left on the canvas

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


def poly(pts):
    im = Image.new("1", (W, H), 0)
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


def run(m, x, y, dx, dy):
    """Pixels from (x, y) to the edge of m in direction (dx, dy), inclusive."""
    n = 0
    while 0 <= x < W and 0 <= y < H and m[y, x]:
        n += 1
        x += dx
        y += dy
    return n


def shade(m, ramp="abcde", sw=3):
    """Directional flat shading: light from the upper right.

    The underside and the back (left) edge fall into shadow, the top and the
    front (right) edge catch light. Bands, not gradients: every pixel takes one
    of five tones.
    """
    deep, sh, base, lit, hi = ramp
    for y, x in zip(*np.nonzero(m)):
        du, dd = run(m, x, y, 0, -1), run(m, x, y, 0, 1)
        dl, dr = run(m, x, y, -1, 0), run(m, x, y, 1, 0)
        if dd <= 1 or dl <= 1:
            c = deep
        elif dd <= sw or dl <= sw:
            c = sh
        elif du <= 1 and dr <= 4:
            c = hi
        elif du <= 2 or dr <= 1:
            c = lit
        else:
            c = base
        lab[y, x] = c


def part(pts, ramp="abcde", sw=3, ring="O"):
    m = poly(pts)
    lab[dilate(m) & ~m] = ring
    lab[m] = ramp[2]
    shade(m, ramp, sw)
    return m


def recolour(x, y, mapping):
    if 0 <= x < W and 0 <= y < H and lab[y, x] in mapping:
        lab[y, x] = mapping[lab[y, x]]


DARKER = {"e": "d", "d": "c", "c": "b", "b": "a"}
FAR = "aabbc"                           # far-side limbs: one step darker

# ---- far side --------------------------------------------------------------------
part([(69, 76), (65, 16), (60, 24)], FAR)                          # far wing wrist
part([(35, 108), (48, 108), (53, 115), (32, 115)], FAR)            # far hind foot
part([(101, 80), (109, 80), (115, 96), (116, 108), (109, 108), (105, 93)], FAR)
part([(108, 107), (117, 108), (124, 112), (126, 115), (107, 115)], FAR)

# ---- tail: down over the wall face -------------------------------------------------
part([(37, 83), (27, 85), (17, 92), (11, 101), (8, 112), (11, 121), (17, 126),
      (21, 124), (16, 117), (15, 107), (20, 97), (29, 92), (39, 93)])
part([(12, 123), (7, 127), (16, 127), (20, 124)], "jjkll")         # tail spade

# ---- torso: crouched, withers high; the chest fills out under V7's flared throat ------
torso = part([(80, 46), (100, 46), (104, 50), (110, 56), (110, 66), (107, 77),
              (100, 86), (90, 92), (77, 96), (64, 99), (51, 99), (37, 96),
              (32, 88), (36, 80), (45, 73), (56, 67), (67, 59), (75, 53)])
plates = poly([(102, 46), (108, 52), (110, 60), (110, 66), (107, 77), (100, 86),
               (90, 92), (77, 96), (64, 99), (52, 99), (52, 96), (64, 95),
               (76, 92), (87, 87), (95, 81), (100, 74), (102, 66), (101, 58),
               (96, 50), (91, 46)]) & torso
for y, x in zip(*np.nonzero(plates)):
    lab[y, x] = "h" if run(plates, x, y, 1, 0) <= 2 and y < 80 else "g"
for k in range(14):                     # plate seams, one tone darker
    t = k / 13
    x0 = round(110 - 58 * t ** 1.3)
    y0 = round(54 + 42 * t ** 0.8)
    for s in range(-6, 7):
        x, y = x0 - round(s * 0.7 * (1 - t)), y0 + round(s * (0.3 + 0.7 * t))
        if 0 <= x < W and 0 <= y < H and plates[y, x] and k % 1 == 0:
            if (s + k) % 1 == 0 and abs(s) <= 6:
                pass
    for x in range(W):
        pass
for y0 in range(52, 100, 4):           # seams run across the plate strip
    for x in range(W):
        y = y0 + (x - 100) // 4 if x < 100 else y0
        if 0 <= y < H and plates[y, x]:
            recolour(x, y, {"g": "f", "h": "g"})

# ---- near wing, folded ----------------------------------------------------------
wing = poly([(75, 59), (69, 45), (63, 32), (56, 19), (48, 27), (35, 43),
             (21, 59), (11, 72), (17, 73), (24, 77), (32, 73), (40, 76),
             (51, 71), (64, 67), (72, 64)])
lab[dilate(wing) & ~wing] = "O"
lab[wing] = "b"
for y, x in zip(*np.nonzero(wing)):     # the fold nearest the body sits in shadow
    if run(wing, x, y, 0, 1) <= 2:
        lab[y, x] = "a"
for tip in ((11, 72), (24, 77), (40, 76)):
    lab[line((56, 19), tip) & wing] = "c"
arm = line((75, 59), (56, 19), 2) & wing
lab[arm] = "c"
for y, x in zip(*np.nonzero(arm)):
    if run(arm, x, y, 1, 0) <= 1:
        lab[y, x] = "d"
claw = poly([(55, 19), (56, 12), (60, 17)])
lab[dilate(claw) & ~claw] = "O"
lab[claw] = "l"
lab[16, 56] = "m"

# ---- near hind leg ------------------------------------------------------------------
part([(35, 77), (48, 75), (61, 83), (67, 93), (61, 101), (48, 104), (35, 99),
      (29, 88)])
part([(53, 96), (64, 96), (59, 107), (51, 112), (45, 109), (48, 101)])
part([(45, 108), (59, 108), (69, 111), (73, 115), (44, 115)], sw=2)
for x, y in ((73, 114), (74, 115), (68, 115), (69, 115)):
    lab[y, x] = "l"

# ---- near foreleg ---------------------------------------------------------------------
part([(89, 61), (100, 61), (103, 72), (97, 85), (89, 88), (87, 77)])
part([(88, 83), (96, 81), (103, 96), (104, 107), (97, 107), (92, 93)])
part([(95, 105), (104, 105), (112, 109), (116, 115), (93, 115)], sw=2)
for x, y in ((116, 114), (117, 115), (112, 115), (113, 115)):
    lab[y, x] = "l"

# ---- sparse scales where light turns to shadow ------------------------------------------
for x, y in ((40, 90), (47, 94), (55, 96), (38, 84), (33, 95), (31, 106),
             (16, 104), (20, 113), (40, 98), (63, 88), (89, 72), (90, 96)):
    for dx, dy in ((0, 0), (1, -1), (2, 0)):
        recolour(x + dx, y + dy, DARKER)

# lines between overlapping parts soften; only the outer edge keeps the outline
solid = lab != "."
for y in range(H):
    for x in range(W):
        if lab[y, x] == "O" and not any(
                0 <= yy < H and 0 <= xx < W and not solid[yy, xx]
                for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1))):
            lab[y, x] = "a"

# ---- step 1: the whole V7 portrait, pixel for pixel, on top --------------------------------
v7 = Image.open(V7).convert("RGBA")
vp = v7.load()
for y in range(48):
    for x in range(48):
        r, g, b, a = vp[x, y]
        if a:
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
