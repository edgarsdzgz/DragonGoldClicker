"""Warden head study, 48x48, Ember palette.

Built from flat colour clusters only: no texture pass, no dithering.
Light comes from the upper front (top right). Every region is a hand-placed
polygon; single pixels (eye, teeth, highlights) are placed by coordinate.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw

W = H = 48
OUT = sys.argv[1] if len(sys.argv) > 1 else "head.png"

PAL = {
    # outlines
    "O": (26, 10, 22),     # outline, unlit
    "Q": (92, 22, 36),     # outline next to lit forms
    # body ramp: hue shifts cool in shadow, warm in light
    "a": (52, 14, 38),
    "b": (104, 24, 40),
    "c": (164, 40, 38),
    "d": (214, 76, 44),
    "e": (246, 140, 64),
    # throat plates
    "f": (118, 62, 34),
    "g": (186, 120, 46),
    "h": (230, 178, 82),
    "i": (255, 226, 146),
    # horn and tooth
    "j": (70, 50, 58),
    "k": (138, 116, 104),
    "l": (204, 186, 156),
    "m": (246, 236, 210),
    # eye
    "n": (255, 214, 60),
    "p": (240, 120, 30),
}
LIT = set("deghilmn")

lab = np.full((H, W), ".", dtype="<U1")


def poly(pts):
    im = Image.new("1", (W, H), 0)
    ImageDraw.Draw(im).polygon(pts, fill=1, outline=1)
    return np.array(im, dtype=bool)


def fill(pts, c, inside=None):
    m = poly(pts)
    if inside is not None:
        m &= inside
    lab[m] = c


def px(c, *xy):
    for x, y in xy:
        lab[y, x] = c


# ---- silhouettes -------------------------------------------------------
# lean neck: an even S-curve about 8 pixels wide that only widens where
# it meets the shoulders and chest
neck = [(14, 13), (12, 18), (11, 24), (12, 30), (11, 36), (9, 41),
        (5, 47), (33, 47), (28, 45), (23, 42), (20, 39), (19, 36),
        (20, 32), (21, 27)]
head = [(14, 12), (19, 9), (25, 10), (30, 12), (33, 14), (40, 15),
        (44, 17), (46, 19), (46, 21), (44, 22), (27, 23), (21, 25),
        (17, 25), (14, 21), (13, 16)]
jaw = [(20, 23), (27, 23), (43, 23), (43, 25), (41, 27), (36, 28),
       (30, 30), (24, 31), (18, 28)]

fill(neck, "c")
fill(head, "c")
fill(jaw, "c")
body = lab != "."

# ---- neck shading: back of the neck turns away from the light ----------
fill([(14, 13), (12, 18), (11, 24), (12, 30), (11, 36), (9, 41), (5, 47),
      (11, 47), (13, 42), (14, 36), (14, 30), (14, 24), (15, 18),
      (17, 14)], "b", body)
fill([(12, 18), (11, 24), (12, 30), (11, 36), (9, 41), (5, 47), (7, 47),
      (11, 41), (12, 36), (12, 30), (12, 24), (13, 19)], "a", body)
# the long neck muscle: a lit cord from behind the jaw down to the chest,
# with a shadow groove behind it
fill([(16, 27), (18, 27), (18, 33), (18, 37), (21, 41), (25, 44),
      (22, 44), (17, 39), (16, 34)], "d", body)
for x, y in ((15, 29), (15, 30), (15, 31), (15, 32), (15, 33), (15, 34),
             (15, 35), (16, 36), (16, 37), (17, 38), (18, 39), (19, 40),
             (20, 41), (21, 42)):
    lab[y, x] = "b"
px("e", (17, 30), (17, 31), (21, 42), (22, 43))
# shoulder: the back swells again where the neck meets the body
fill([(6, 47), (9, 42), (12, 41), (14, 44), (13, 47)], "c", body)
px("d", (10, 42), (11, 42), (12, 42))
fill([(5, 47), (8, 44), (11, 45), (12, 47)], "b", body)
for x, y in ((15, 42), (15, 43), (16, 44), (16, 45), (17, 46), (17, 47)):
    lab[y, x] = "b"                   # groove between shoulder and chest
px("d", (18, 45), (19, 46), (20, 47), (19, 47))

# ---- throat plates: a narrow strip down the front -----------------------
fill([(21, 27), (20, 32), (19, 36), (20, 39), (23, 42), (28, 45),
      (33, 47), (28, 47), (24, 45), (19, 41), (18, 36), (19, 31),
      (19, 28)], "g", body)
fill([(23, 42), (28, 45), (33, 47), (30, 47), (25, 44)], "h", body)
fill([(19, 28), (21, 27), (20, 31), (19, 31)], "f", body)
for y0 in (32, 35, 38, 41, 44):       # plate seams, one shade darker
    for x in range(17, 35):
        y = y0 + max(0, (x - 21) // 3)
        if 0 <= y < H and lab[y, x] in ("g", "h"):
            lab[y, x] = "f" if lab[y, x] == "g" else "g"

# ---- head shading -------------------------------------------------------
# back of the skull and jaw muscle in shadow
fill([(14, 12), (13, 16), (14, 21), (17, 25), (20, 25), (18, 20),
      (17, 14)], "b", body)
fill([(13, 15), (14, 21), (16, 24), (15, 17)], "a", body)
# lit top planes: crown and snout bridge
fill([(16, 11), (19, 9), (25, 10), (29, 12), (24, 12), (19, 11)], "d", body)
fill([(31, 14), (33, 14), (40, 15), (44, 17), (46, 19), (46, 20),
      (43, 19), (39, 17), (33, 16)], "d", body)
# cheekbone: a lit band from under the eye back to the jaw hinge,
# with its shadow underneath
fill([(18, 18), (25, 18), (27, 19), (19, 20)], "d", body)
fill([(19, 21), (27, 20), (31, 22), (21, 24)], "b", body)
# lower jaw: lit chin, shadowed underside
fill([(24, 31), (30, 30), (36, 28), (41, 27), (43, 25), (38, 27),
      (31, 28), (24, 29), (18, 28)], "b", body)
fill([(24, 31), (30, 30), (36, 28), (41, 27), (34, 30), (27, 31)], "a", body)
px("d", (40, 24), (41, 24), (42, 24), (39, 25), (40, 25))
# the jaw overlaps the throat: a dark line along its underside, then
# the shadow it casts
jm = poly(jaw)
for y in range(H - 1):
    for x in range(W):
        if jm[y, x] and not jm[y + 1, x] and body[y + 1, x] and y >= 26:
            lab[y, x] = "O"
            if lab[y + 1, x] not in ("O",):
                lab[y + 1, x] = "a" if lab[y + 1, x] in ("b", "c") else "f"
# highlights: brow crest and snout ridge
px("e", (22, 10), (23, 10), (24, 10), (25, 11), (26, 11), (27, 12))
px("e", (36, 15), (37, 15), (38, 15), (39, 16), (40, 16), (43, 17), (44, 18))

# ---- brow shelf and eye -------------------------------------------------
# the brow overhangs the eye: a dark band under the lit crest
px("a", (24, 13), (25, 13), (26, 13), (27, 13), (28, 14), (29, 14))
px("b", (23, 14), (24, 14), (25, 14), (26, 14), (27, 14))
# almond eye, 4x2, with a 1-pixel slit pupil
px("p", (24, 15), (25, 15))
px("n", (26, 15), (27, 15), (25, 16), (26, 16))
px("O", (26, 15), (26, 16))           # slit pupil
px("n", (27, 16))
px("a", (28, 15), (24, 16), (25, 17), (26, 17), (27, 17))   # lids

# ---- nostril, mouth line, teeth -----------------------------------------
px("a", (42, 18), (43, 18))
px("O", (43, 19))
for x in range(22, 44):
    lab[23, x] = "a"
px("a", (21, 24), (20, 24))
px("m", (36, 24))                     # one small tooth
px("m", (29, 24), (30, 24), (29, 25))  # fang, tapering
px("l", (29, 26))

# ---- horns: rooted at the back of the skull, swept back -----------------
far_horn = [(22, 10), (19, 5), (15, 1), (12, 0), (13, 2), (16, 6), (18, 11)]
fill(far_horn, "k")
fill([(12, 0), (13, 2), (16, 6), (18, 11), (17, 6), (14, 2)], "j")
px("l", (16, 2), (17, 3), (18, 4), (20, 7))
near_horn = [(19, 10), (14, 7), (8, 4), (3, 3), (0, 3), (2, 5), (7, 7),
             (12, 10), (15, 14), (18, 14)]
fill(near_horn, "l")
fill([(0, 3), (2, 5), (7, 7), (12, 10), (15, 14), (18, 14), (13, 11),
      (8, 8), (3, 5)], "k")
fill([(2, 5), (7, 7), (12, 10), (15, 14), (12, 12), (7, 8)], "j")
px("m", (4, 3), (5, 3), (6, 3), (9, 4), (10, 5), (11, 5), (14, 7))
# growth ridges near the root
px("k", (12, 7), (13, 8), (16, 9), (17, 10))

# ---- jaw frill and neck spines (varied sizes) ---------------------------
spines = [[(12, 17), (7, 15), (11, 20)],
          [(11, 23), (7, 22), (11, 26)],
          [(11, 30), (8, 30), (11, 32)],
          [(10, 36), (8, 37), (10, 38)]]
for s in spines:
    fill(s, "k")
px("l", (8, 15), (9, 16), (8, 22), (9, 22))

# ---- selective outline ----------------------------------------------------
solid = lab != "."
out = lab.copy()
for y in range(H):
    for x in range(W):
        if solid[y, x]:
            continue
        nb = [lab[yy, xx] for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1))
              if 0 <= yy < H and 0 <= xx < W and solid[yy, xx]]
        if not nb:
            continue
        out[y, x] = "Q" if any(n in LIT for n in nb) and y < 24 else "O"
# no outline along the bottom edge, where the neck leaves the frame
lab = out

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
