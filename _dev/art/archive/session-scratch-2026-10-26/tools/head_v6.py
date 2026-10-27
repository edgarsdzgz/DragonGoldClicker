"""Warden head study V6, 64x64, Ember palette, facing right.

Drawn facing left in these coordinates, then mirrored, so the key light
(upper left here) lands on the face from the front.

From the V5 critique:
- eye: a slanted almond under a brow shelf that slopes toward the snout,
  the upper lid across the iris, a dark socket, a cheekbone ridge below
- jaw: hinged under the ear behind the eye; the open mouth is a wedge from
  that hinge; the lower jaw is thinner than the upper; tongue, gums and
  far-side teeth inside; a lip line that dips at the big teeth
- snout: tapers to a rounded, hooked tip; nostril bump, dip, then the rise
  to the brow; a ridge from nostril to brow
- profile with a slight turn: only the far brow and far horn show
Kept from V5: ringed horns, crown plates, lip scales, sparse neck scales.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw

W = H = 64
OUT = sys.argv[1] if len(sys.argv) > 1 else "v6.png"

PAL = {
    "O": (20, 8, 16), "Q": (96, 28, 30),
    "a": (42, 12, 30), "b": (74, 18, 38), "c": (118, 26, 42),
    "d": (168, 44, 44), "e": (226, 86, 48),
    "f": (94, 42, 28), "g": (162, 96, 42), "h": (220, 160, 72),
    "j": (62, 42, 42), "k": (140, 106, 74), "l": (212, 176, 122),
    "m": (251, 232, 180),
    "n": (255, 242, 122), "p": (255, 168, 32),
    "q": (58, 10, 18), "r": (232, 72, 28),
    "s": (208, 90, 106),   # tongue
}
LIT = set("delmh")
DARKER = {"c": "b", "b": "a", "d": "c", "e": "d"}

lab = np.full((H, W), ".", dtype="<U1")


def poly(pts):
    im = Image.new("1", (W, H), 0)
    ImageDraw.Draw(im).polygon(pts, fill=1, outline=1)
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


def fill(pts, c, inside):
    lab[poly(pts) & inside] = c


def px(c, *xy):
    for x, y in xy:
        if 0 <= x < W and 0 <= y < H:
            lab[y, x] = c


def recolour(x, y, mapping):
    if 0 <= x < W and 0 <= y < H and lab[y, x] in mapping:
        lab[y, x] = mapping[lab[y, x]]


def arc(x, y):
    for dx, dy in ((0, 0), (1, -1), (2, 0)):
        recolour(x + dx, y + dy, DARKER)


def rings(mask, root, tip, ts):
    (rx, ry), (tx, ty) = root, tip
    dx, dy = tx - rx, ty - ry
    ln = (dx * dx + dy * dy) ** 0.5
    nx, ny = -dy / ln, dx / ln
    for t in ts:
        cx, cy = rx + dx * t, ry + dy * t
        for s in np.arange(-4, 4.01, 0.5):
            x, y = int(round(cx + nx * s)), int(round(cy + ny * s))
            if 0 <= x < W and 0 <= y < H and mask[y, x]:
                recolour(x, y, {"m": "l", "l": "k", "k": "j"})


# ---- back to front ----------------------------------------------------------
for s in ([(50, 22), (61, 19), (55, 29)],
          [(55, 31), (63, 28), (59, 38)],
          [(59, 40), (63, 39), (62, 45)]):
    m = part(s, "k")
    fill([s[0], s[1], (s[1][0] - 2, s[1][1] + 2)], "l", m)

neck = part([(42, 30), (48, 20), (54, 29), (59, 39), (63, 46), (63, 63),
             (47, 63), (45, 55), (42, 47), (38, 40)], "c")
fill([(52, 26), (57, 36), (62, 45), (63, 63), (57, 63), (56, 50), (52, 40),
      (48, 30)], "b", neck)
fill([(55, 31), (59, 39), (63, 46), (63, 63), (61, 63), (60, 48),
      (57, 40)], "a", neck)
fill([(44, 41), (47, 47), (50, 55), (53, 63), (56, 63), (53, 54),
      (49, 46), (47, 40)], "d", neck)
px("e", (47, 42), (48, 43), (48, 45), (49, 46))
fill([(38, 40), (42, 47), (45, 55), (47, 63), (53, 63), (50, 55),
      (47, 47), (44, 40)], "g", neck)
fill([(40, 44), (42, 47), (45, 55), (47, 63), (49, 63), (46, 55),
      (43, 47)], "h", neck)
for y0 in (46, 50, 54, 58, 62):
    for x in range(38, 54):
        y = y0 - (x - 43) // 4
        if 0 <= y < H and neck[y, x] and lab[y, x] in "gh":
            lab[y, x] = "f" if lab[y, x] == "g" else "g"
fill([(38, 40), (45, 39), (46, 42), (40, 43)], "f", neck)
for x, y in ((49, 31), (51, 35), (53, 39), (52, 44), (55, 47), (56, 52),
             (57, 57), (54, 60)):
    arc(x, y)

# horns behind the skull: far horn, second horn
far = part([(29, 12), (33, 7), (38, 3), (43, 0), (39, 4), (35, 9),
            (33, 14)], "k")
fill([(43, 0), (39, 4), (35, 9), (33, 14), (34, 9), (38, 4)], "j", far)
horn2 = part([(43, 16), (50, 12), (56, 9), (63, 8), (56, 12), (51, 16),
              (47, 21)], "k")
fill([(43, 16), (50, 12), (56, 9), (63, 8), (56, 10), (50, 13)], "l", horn2)
fill([(63, 8), (56, 12), (51, 16), (47, 21), (51, 15), (56, 11)], "j", horn2)
rings(horn2, (46, 18), (63, 8), (0.14, 0.28, 0.45, 0.64))

# cheek spikes from the back of the skull and jaw
for s, tip in (([(46, 23), (57, 21), (48, 27)], (57, 21)),
               ([(46, 28), (56, 29), (47, 32)], (56, 29)),
               ([(43, 33), (52, 36), (43, 37)], (52, 36))):
    m = part(s, "k")
    fill([s[0], tip, ((s[0][0] + tip[0]) // 2, (s[0][1] + tip[1]) // 2 + 1)],
         "l", m)

# far brow ridge just showing above the near one
fb = part([(25, 16), (27, 13), (30, 11), (33, 11), (32, 13), (28, 15)], "b")
fill([(27, 13), (30, 11), (33, 11), (29, 13)], "d", fb)

# ---- mouth: interior first, then the lower jaw, then the head ------------------
mouth = poly([(7, 34), (12, 34), (20, 33), (29, 29), (38, 32), (33, 35),
              (22, 40), (11, 46), (8, 43)])
lab[mouth] = "q"
fill([(27, 31), (35, 32), (30, 34)], "r", mouth)       # fire at the back
fill([(13, 41), (22, 36), (31, 33), (32, 35), (23, 39), (14, 43)], "s", mouth)
fill([(14, 43), (23, 39), (32, 35), (24, 40)], "b", mouth)   # tongue shadow

# lower jaw: rotated open about the hinge, thinner than the upper jaw
jaw = part([(10, 45), (16, 42), (22, 39), (28, 36), (33, 33), (38, 32),
            (42, 33), (44, 35), (41, 38), (34, 42), (24, 47), (14, 49),
            (11, 48)], "c")
fill([(11, 48), (14, 49), (24, 47), (34, 42), (41, 38), (44, 35), (40, 37),
      (32, 41), (22, 45), (13, 47)], "b", jaw)
fill([(14, 49), (24, 47), (34, 42), (41, 38), (36, 42), (25, 48)], "a", jaw)
px("d", (11, 45), (12, 45), (13, 44), (14, 44), (11, 46))

head = part([(6, 33), (6, 30), (7, 27), (9, 25), (12, 25), (14, 26),
             (16, 26), (19, 23), (23, 19), (26, 15), (30, 13), (36, 12),
             (42, 13), (47, 17), (49, 22), (49, 27), (47, 31), (44, 34),
             (40, 34), (36, 32), (32, 30), (29, 29), (26, 30), (22, 31),
             (20, 32), (17, 31), (14, 31), (12, 33), (10, 34), (8, 34)], "c")

# ---- head shading ---------------------------------------------------------------
# top plane: a narrow lit band; the nasal ridge runs from nostril to brow
fill([(6, 30), (7, 27), (9, 25), (12, 25), (14, 26), (16, 26), (19, 23),
      (23, 19), (26, 15), (27, 16), (24, 20), (20, 24), (17, 27), (13, 27),
      (9, 27), (7, 30)], "d", head)
px("e", (8, 26), (9, 25), (10, 25), (11, 25), (17, 25), (18, 24), (19, 23),
   (20, 22), (21, 21), (22, 20), (23, 19), (24, 18))
# underside of the snout and the lip area in shadow
fill([(6, 33), (8, 34), (10, 34), (12, 33), (14, 31), (17, 31), (20, 32),
      (22, 31), (26, 30), (29, 29), (26, 29), (20, 30), (12, 31), (7, 32)],
     "b", head)
# crown lit, back of skull turning away
fill([(26, 15), (30, 13), (36, 12), (42, 13), (45, 15), (38, 15), (32, 15),
      (28, 16)], "d", head)
px("e", (29, 13), (30, 13), (31, 12), (32, 12), (33, 12))
fill([(44, 15), (47, 17), (49, 22), (49, 27), (47, 30), (46, 24),
      (45, 18)], "b", head)
fill([(48, 20), (49, 22), (49, 27), (48, 28)], "a", head)
# cheekbone ridge under the eye, running back toward the hinge
fill([(29, 23), (36, 23), (41, 25), (36, 24), (30, 24)], "d", head)
fill([(30, 26), (36, 26), (42, 27), (44, 30), (40, 29), (35, 28),
      (31, 28)], "b", head)
# jaw muscle bulging behind the mouth corner, shadowed underneath
fill([(32, 30), (36, 32), (40, 34), (44, 34), (46, 31), (42, 32), (37, 31)],
     "b", head)
px("a", (37, 33), (38, 33), (39, 34), (40, 33))
# nostril on the side of the bump
px("a", (9, 27), (10, 27))
px("O", (10, 28))

# ---- the eye ----------------------------------------------------------------------
# dark socket, then the almond, then the lid and the brow shelf over it
fill([(27, 20), (30, 17), (35, 16), (38, 18), (37, 22), (30, 23)], "a", head)
almond = poly([(28, 20), (31, 18), (35, 17), (37, 18), (36, 21), (31, 22)])
lab[almond & head] = "p"
for x in range(28, 38):                                 # upper lid over the iris
    ys = [y for y in range(H) if almond[y, x]]
    if ys:
        lab[min(ys), x] = "b"
# bright iris either side of the slit, the orange only at the rim
px("n", (31, 19), (32, 19), (34, 19), (35, 19), (31, 20), (32, 20),
   (34, 20), (35, 20), (32, 21), (33, 21), (34, 21))
px("O", (33, 19), (33, 20))                             # slit pupil
# brow shelf slopes down toward the snout: lit on top, dark overhang below
fill([(26, 16), (30, 15), (37, 14), (38, 15), (31, 17), (27, 18)], "d", head)
px("e", (28, 15), (29, 15), (30, 15), (31, 14), (32, 14))
for x, y in ((27, 18), (28, 18), (29, 17), (30, 17), (31, 17), (32, 16),
             (33, 16), (34, 16), (35, 16), (36, 16), (37, 16)):
    lab[y, x] = "a"
# ear opening behind the cheekbone, above the hinge
px("a", (42, 28), (44, 28), (42, 30))
px("O", (43, 28), (43, 29), (44, 29))

# ---- scales by region --------------------------------------------------------------
for x0, ys in ((34, (12, 13, 14)), (39, (12, 13, 14)), (43, (14, 15))):
    for y in ys:
        recolour(x0, y, DARKER)
for x in range(35, 39):
    recolour(x, 14, DARKER)
for x in range(9, 28):                                  # lip-scale row
    ys = [y for y in range(H) if head[y, x]]
    y = max(ys) - 2
    if x % 3 == 0:
        recolour(x, y, DARKER)
        recolour(x, y + 1, DARKER)
    recolour(x, y - 1, {"c": "b"})
for x, y in ((34, 30), (38, 30)):
    arc(x, y)
# skin folds where the head meets the neck
for fold in (((43, 38), (44, 39), (45, 39), (46, 39)),
             ((44, 41), (45, 42), (46, 42), (47, 42)),
             ((45, 44), (46, 45), (47, 45))):
    for x, y in fold:
        recolour(x, y, {"c": "b", "d": "c", "e": "d", "b": "a", "g": "f"})

# ---- teeth: near row on both jaws, a darker far row behind ---------------------------
for x in (19, 24, 27):                                   # far-side upper teeth
    gum = max(y for y in range(H) if head[y, x]) + 1
    if lab[gum + 1, x] in "qrs":
        lab[gum + 1, x] = "k"
for x, n in ((7, 1), (10, 3), (13, 1), (15, 2), (18, 1), (21, 2), (24, 1),
             (26, 1)):
    gum = max(y for y in range(H) if head[y, x]) + 1
    for i in range(n):
        lab[gum + i, x] = "l" if (n >= 3 and i == n - 1) else "m"
for x, n in ((11, 1), (12, 2), (14, 1), (17, 2), (19, 1), (22, 1), (25, 1),
             (28, 1)):
    gum = min(y for y in range(H) if jaw[y, x]) - 1
    for i in range(n):
        lab[gum - i, x] = "m"
# behind the mouth corner the seam is skin over muscle, not an opening
for y in range(29, 36):
    for x in range(31, 44):
        if lab[y, x] == "O":
            lab[y, x] = "a"

# ---- near horn: rooted behind the brow, ringed -----------------------------------------
h1 = part([(37, 13), (41, 9), (47, 5), (53, 2), (60, 0), (55, 4), (49, 8),
           (45, 13), (43, 17)], "l")
fill([(60, 0), (55, 4), (49, 8), (45, 13), (43, 17), (45, 11), (51, 6),
      (56, 2)], "k", h1)
fill([(45, 13), (43, 17), (42, 14)], "j", h1)
px("m", (40, 10), (42, 8), (43, 7), (46, 5), (49, 4), (52, 3))
rings(h1, (41, 14), (60, 0), (0.12, 0.22, 0.33, 0.46, 0.62))

# ---- lit edges take a warmer outline -----------------------------------------------
solid = lab != "."
for y in range(H):
    for x in range(W):
        if lab[y, x] != "O":
            continue
        ext = any(0 <= yy < H and 0 <= xx < W and not solid[yy, xx]
                  for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)))
        litn = any(0 <= yy < H and 0 <= xx < W and lab[yy, xx] in LIT
                   for yy, xx in ((y + 1, x), (y, x + 1)))
        if ext and litn:
            lab[y, x] = "Q"

lab = lab[:, ::-1]                                      # face right

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
prev.resize((W * 6, H * 6), Image.NEAREST).save(OUT.replace(".png", "-x6.png"))
sil = Image.new("RGBA", (W, H), (224, 202, 160, 255))
sp = sil.load()
for y in range(H):
    for x in range(W):
        if lab[y, x] != ".":
            sp[x, y] = (18, 9, 15, 255)
sil.resize((W * 3, H * 3), Image.NEAREST).save(OUT.replace(".png", "-sil.png"))
print("colours", len(used))
