"""Warden head study V4, 64x64, Ember palette, facing left.

Rules from the reference comparison (_dev/research/dragon-art/drawing-dragons.md
section 4): three-quarter view, head tilted down, eye near the middle of the
head, a shorter muzzle that steps down from the brow, a big back of the head,
a thick neck leaning back from the jaw corner, a fanned crest, a curved open
mouth, a bright eye in a dark socket, darker overall with bright accents.

Flat clusters only. Each part is drawn with its own outline ring, back to
front, so overlaps separate cleanly. Light from the upper left (front).
"""
import sys
import numpy as np
from PIL import Image, ImageDraw

W = H = 64
OUT = sys.argv[1] if len(sys.argv) > 1 else "v4.png"

PAL = {
    "O": (20, 8, 16),      # outline
    "Q": (96, 28, 30),     # outline on lit edges
    "a": (42, 12, 30),     # hide, deepest
    "b": (74, 18, 38),
    "c": (118, 26, 42),    # hide base: dark crimson
    "d": (168, 44, 44),
    "e": (226, 86, 48),    # rim
    "f": (94, 42, 28),     # throat plates
    "g": (162, 96, 42),
    "h": (220, 160, 72),
    "j": (62, 42, 42),     # horn
    "k": (140, 106, 74),
    "l": (212, 176, 122),
    "m": (251, 232, 180),
    "n": (255, 242, 122),  # eye core
    "p": (255, 168, 32),   # iris
    "q": (58, 10, 18),     # mouth
    "r": (232, 72, 28),    # fire in the throat
}
LIT = set("delmh")

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
    """Draw a part over what is already there, with its own outline ring."""
    m = poly(pts)
    lab[dilate(m) & ~m] = ring
    lab[m] = base
    return m


def fill(pts, c, inside):
    lab[poly(pts) & inside] = c


def px(c, *xy):
    for x, y in xy:
        lab[y, x] = c


# ---- back to front --------------------------------------------------------
# neck spines, behind the neck
for s in ([(50, 22), (61, 19), (55, 29)],
          [(55, 31), (63, 28), (59, 38)],
          [(59, 40), (63, 39), (62, 45)]):
    m = part(s, "k")
    fill([(s[0][0], s[0][1]), s[1], (s[1][0] - 2, s[1][1] + 2)], "l", m)

# neck: as thick as the head is deep, leaning back from the jaw corner
neck = part([(40, 30), (48, 20), (54, 29), (59, 39), (63, 46), (63, 63),
             (46, 63), (43, 56), (39, 48), (34, 41)], "c")
fill([(52, 26), (57, 36), (62, 45), (63, 63), (57, 63), (56, 50), (52, 40),
      (48, 30)], "b", neck)
fill([(55, 31), (59, 39), (63, 46), (63, 63), (61, 63), (60, 48),
      (57, 40)], "a", neck)
# neck muscle catching the light beside the throat plates
fill([(41, 41), (45, 47), (49, 55), (52, 63), (55, 63), (52, 54),
      (48, 46), (44, 40)], "d", neck)
px("e", (44, 42), (45, 43), (46, 45), (47, 46))
# throat plates
fill([(34, 41), (39, 48), (43, 56), (46, 63), (52, 63), (49, 55),
      (45, 47), (41, 41)], "g", neck)
fill([(36, 44), (39, 48), (43, 56), (46, 63), (48, 63), (44, 55),
      (40, 48)], "h", neck)
for y0 in (46, 50, 54, 58, 62):
    for x in range(34, 54):
        y = y0 - (x - 40) // 4
        if 0 <= y < H and neck[y, x] and lab[y, x] in "gh":
            lab[y, x] = "f" if lab[y, x] == "g" else "g"
fill([(34, 41), (42, 40), (43, 43), (36, 44)], "f", neck)   # jaw's shadow

# far horn and the second horn, behind the skull
far = part([(25, 11), (29, 6), (34, 2), (39, 0), (35, 4), (31, 9),
            (29, 13)], "k")
fill([(39, 0), (35, 4), (31, 9), (29, 13), (30, 9), (34, 4)], "j", far)
horn2 = part([(41, 16), (48, 12), (55, 9), (63, 8), (55, 12), (49, 16),
              (45, 21)], "k")
fill([(41, 16), (48, 12), (55, 9), (63, 8), (55, 10), (48, 13)], "l", horn2)
fill([(63, 8), (55, 12), (49, 16), (45, 21), (49, 15), (55, 11)], "j", horn2)

# cheek spikes fanning back from the jaw
for s, tip in (([(43, 25), (55, 23), (45, 29)], (55, 23)),
               ([(43, 30), (54, 31), (44, 34)], (54, 31)),
               ([(40, 35), (49, 38), (40, 38)], (49, 38))):
    m = part(s, "k")
    fill([s[0], tip, ((s[0][0] + tip[0]) // 2, (s[0][1] + tip[1]) // 2 + 1)],
         "l", m)

# far brow ridge, peeking above the muzzle bridge: the three-quarter cue
fb = part([(19, 18), (20, 14), (23, 11), (26, 10), (27, 13), (24, 16)], "b")
fill([(20, 14), (23, 11), (26, 10), (24, 12), (21, 15)], "d", fb)

# mouth interior, then the lower jaw, then the head over both
mouth = poly([(7, 31), (24, 30), (29, 31), (14, 40), (8, 40)])
lab[mouth] = "q"
fill([(19, 32), (28, 31), (22, 36)], "r", mouth)
jaw = part([(9, 41), (15, 39), (25, 33), (31, 34), (37, 37), (38, 41),
            (33, 43), (24, 44), (16, 44), (11, 43)], "c")
fill([(11, 43), (16, 44), (24, 44), (33, 43), (38, 41), (37, 39), (30, 40),
      (22, 42), (14, 42)], "b", jaw)
fill([(16, 44), (24, 44), (33, 43), (38, 41), (30, 42), (22, 43)], "a", jaw)
px("d", (10, 41), (11, 41), (12, 40), (13, 40), (14, 39), (11, 42))

head = part([(6, 29), (7, 27), (10, 25), (16, 22), (20, 18), (23, 14),
             (27, 12), (33, 12), (39, 13), (44, 16), (47, 20), (48, 25),
             (46, 30), (43, 33), (38, 35), (32, 33), (27, 31), (24, 30),
             (16, 31), (8, 31)], "c")
# lit top plane of the muzzle, seen from above in three-quarter view
fill([(7, 27), (10, 25), (16, 22), (20, 18), (22, 17), (23, 19), (18, 23),
      (12, 27), (8, 29)], "d", head)
px("e", (8, 27), (9, 26), (11, 25), (12, 24), (14, 23), (16, 22), (17, 21),
   (19, 19), (20, 18))
# crown and brow: lit on top, a dark overhang under the brow
fill([(23, 14), (27, 12), (33, 12), (39, 13), (42, 15), (36, 15), (30, 15),
      (25, 16)], "d", head)
px("e", (25, 13), (26, 13), (27, 12), (28, 12), (29, 12))
fill([(22, 17), (32, 16), (33, 18), (23, 19)], "a", head)
# cheekbone plane, with the jaw muscle mass under it
fill([(27, 23), (33, 23), (35, 24), (28, 24)], "d", head)
fill([(29, 30), (36, 31), (43, 30), (46, 27), (46, 30), (43, 33), (38, 35),
      (32, 33)], "b", head)
# back of the skull turns away from the light
fill([(42, 15), (47, 20), (48, 25), (46, 29), (44, 24), (43, 18)], "b", head)
fill([(46, 21), (48, 25), (46, 28), (47, 24)], "a", head)
# behind the mouth corner the head-jaw seam is muscle, not mouth: soften it
for y in range(29, 38):
    for x in range(29, 40):
        if lab[y, x] == "O":
            lab[y, x] = "a"
# the grin: the mouth line curls up and ends under the eye
px("a", (25, 29), (26, 28), (27, 28))
# nostril on top of the snout
px("a", (10, 27), (11, 27))
px("O", (10, 28))

# eye: bright, slit, set in a dark socket under the brow
px("a", (24, 20), (25, 21), (26, 22), (27, 22), (28, 22), (29, 21), (30, 20))
px("p", (25, 20), (29, 20), (27, 21), (28, 21))
px("n", (26, 20), (26, 21), (28, 20))
px("O", (27, 20), (27, 19))
px("p", (26, 19), (28, 19))

# teeth: a long upper fang, smaller teeth, one lower tooth
px("m", (11, 32), (11, 33), (11, 34), (12, 32), (12, 33))
px("l", (11, 35))
px("m", (16, 32), (16, 33), (20, 32))
px("m", (13, 39), (13, 38), (17, 37), (17, 36), (21, 35))

# near horn: rooted on the skull, sweeping back along the head's diagonal
h1 = part([(33, 13), (37, 9), (43, 5), (50, 2), (58, 0), (51, 4), (45, 8),
           (41, 13), (39, 17)], "l")
fill([(58, 0), (51, 4), (45, 8), (41, 13), (39, 17), (41, 11), (47, 6),
      (53, 2)], "k", h1)
fill([(41, 13), (39, 17), (38, 14)], "j", h1)
px("m", (36, 10), (38, 8), (39, 7), (42, 5), (45, 4), (48, 3))
px("k", (37, 12), (38, 11), (40, 10))           # growth ridges at the root

# ---- lit edges take a warmer outline ----------------------------------------
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
