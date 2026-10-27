"""Warden full body, checkpoint 1-2: silhouette and flat colours.

96x96, facing right, perched on the gate (wall top at y=86). V7's design
language at body scale: swept ringed horn, gold slit eye under a brow, one
fang, gold throat plates, crimson hide. Anatomy from the research: a deep,
bird-like chest; a bat wing folded with the wrist high and a clawed thumb;
heavy, planted lizard limbs; a tail hanging down the wall.

No shading yet: one flat colour per material, each part with its own outline.
Writes <out>.png (sprite), <out>-flat-x4.png and <out>-sil-x4.png (on a wall),
"""
import sys
import numpy as np
from PIL import Image, ImageDraw

W = H = 96
OUT = sys.argv[1] if len(sys.argv) > 1 else "body.png"
WALL = 86

PAL = {
    "O": (26, 10, 22), "a": (52, 14, 38), "b": (104, 24, 40),
    "c": (164, 40, 38), "d": (214, 76, 44),
    "g": (186, 120, 46), "k": (138, 116, 104), "l": (204, 186, 156),
    "m": (246, 236, 210), "n": (255, 214, 60),
}
lab = np.full((H, W), ".", dtype="<U1")


def poly(pts):
    im = Image.new("1", (W, H), 0)
    ImageDraw.Draw(im).polygon(pts, fill=1, outline=1)
    return np.array(im, dtype=bool)


def line(p, q, c, width=1):
    im = Image.new("1", (W, H), 0)
    ImageDraw.Draw(im).line([p, q], fill=1, width=width)
    m = np.array(im, dtype=bool)
    return m


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


# ---- far side, behind everything ------------------------------------------------
part([(52, 40), (49, 12), (45, 18)], "a")                         # far wing wrist
part([(26, 81), (36, 81), (40, 86), (24, 86)], "a")               # far hind foot
part([(64, 60), (70, 60), (74, 72), (75, 81), (70, 81), (67, 70)], "a")
part([(69, 80), (76, 81), (82, 84), (84, 86), (68, 86)], "a")     # far forefoot

# ---- tail: from the rump, down over the wall face ---------------------------------
part([(28, 62), (20, 64), (13, 69), (8, 76), (6, 84), (8, 91), (13, 95),
      (16, 93), (12, 88), (11, 80), (15, 73), (22, 69), (29, 70)], "c")
part([(9, 92), (5, 95), (12, 95), (15, 93)], "k")                 # tail spade

# ---- torso: crouched, shoulders high, hips low, deep keeled chest --------------------
part([(56, 40), (50, 44), (42, 50), (34, 55), (27, 60), (24, 66), (28, 72),
      (38, 74), (48, 72), (58, 70), (64, 67), (70, 62), (72, 56), (70, 50),
      (66, 44), (62, 40)], "c")
lab[poly([(66, 66), (58, 70), (48, 72), (38, 74), (38, 72), (48, 70),
          (57, 68), (64, 64)]) & (lab == "c")] = "g"              # belly plates

# ---- near wing, folded: the wrist peaks high, fingers trail over the hip -------------
wing = part([(56, 44), (52, 34), (47, 24), (42, 14), (36, 20), (26, 32),
             (16, 44), (8, 54), (13, 55), (18, 58), (24, 55), (30, 57),
             (38, 53), (48, 50), (54, 48)], "b")
for tip in ((8, 54), (18, 58), (30, 57)):                          # finger bones
    lab[line((42, 14), tip, "c") & wing] = "c"
lab[line((56, 44), (42, 14), "c", 2) & wing] = "c"                 # forearm
part([(41, 14), (42, 9), (45, 13)], "l")                           # thumb claw

# ---- neck: a long S-curve, head held high and forward ---------------------------------
part([(67, 13), (64, 18), (61, 25), (58, 32), (56, 38), (55, 44), (62, 48),
      (70, 50), (69, 44), (68, 38), (68, 33), (70, 28), (73, 22)], "c")
lab[poly([(73, 22), (70, 28), (68, 33), (68, 38), (69, 44), (70, 50),
          (72, 56), (70, 62), (66, 66), (64, 64), (67, 58), (66, 50),
          (65, 44), (64, 38), (65, 32), (67, 27), (70, 22)])
    & (lab != ".") & (lab != "O")] = "g"                           # throat plates
for x, y in ((64, 18), (61, 25), (58, 32), (56, 38)):              # neck spines
    part([(x, y), (x - 4, y - 1), (x - 1, y + 3)], "k")

# ---- head: V7 at three quarters of its portrait size ----------------------------------
part([(73, 11), (70, 7), (67, 4), (65, 3), (66, 5), (68, 8), (70, 12)], "k")
part([(67, 12), (70, 10), (75, 11), (79, 12), (81, 14), (86, 14), (89, 16),
      (91, 17), (91, 19), (89, 20), (76, 20), (72, 22), (69, 22), (67, 19),
      (66, 15)], "c")
part([(71, 20), (76, 20), (88, 20), (88, 22), (87, 23), (83, 24), (79, 26),
      (74, 26), (70, 24)], "c")
part([(75, 11), (71, 8), (67, 6), (63, 5), (61, 5), (62, 7), (66, 8),
      (70, 11), (72, 14), (74, 14)], "l")                          # near horn
for x in range(72, 89):                                            # mouth line
    lab[21, x] = "a"
px("a", (73, 14), (74, 14), (75, 14), (76, 14), (77, 15))          # brow
px("n", (74, 15), (76, 15))                                        # eye
px("O", (75, 15))                                                  # slit
px("m", (78, 22), (78, 23))                                        # fang
px("a", (87, 16), (88, 16))                                        # nostril

# ---- near hind leg, crouched: knee forward, hock back, foot flat ----------------------
part([(26, 58), (36, 56), (46, 62), (50, 70), (46, 76), (36, 78), (26, 74),
      (22, 66)], "c")
part([(40, 72), (48, 72), (44, 80), (38, 84), (34, 82), (36, 76)], "c")
part([(34, 81), (44, 81), (52, 83), (55, 86), (33, 86)], "c")
px("l", (55, 85), (56, 86), (51, 86), (52, 86))                    # claws

# ---- near foreleg, braced: elbow back, forearm forward ---------------------------------
part([(58, 46), (66, 46), (68, 54), (64, 64), (58, 66), (56, 58)], "c")
part([(57, 62), (63, 61), (68, 72), (69, 80), (64, 80), (60, 70)], "c")
part([(62, 79), (69, 79), (75, 82), (78, 86), (61, 86)], "c")
px("l", (78, 85), (79, 86), (75, 86), (76, 86))                    # claws

# lines between overlapping parts soften to the darkest hide; only the
# outer edge keeps the outline colour
solid = lab != "."
for y in range(H):
    for x in range(W):
        if lab[y, x] == "O" and not any(
                0 <= yy < H and 0 <= xx < W and not solid[yy, xx]
                for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1))):
            lab[y, x] = "a"

# ---- save: sprite, flat preview on the wall, silhouette ---------------------------------
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
pix = img.load()
used = set()
for y in range(H):
    for x in range(W):
        if lab[y, x] != ".":
            pix[x, y] = PAL[lab[y, x]] + (255,)
            used.add(lab[y, x])
img.save(OUT)


def scene(fg):
    bg = Image.new("RGBA", (W, H), (30, 24, 36, 255))
    d = ImageDraw.Draw(bg)
    d.rectangle([0, WALL, W - 1, H - 1], fill=(74, 66, 80, 255))
    d.line([(0, WALL), (W - 1, WALL)], fill=(116, 106, 120, 255))
    for x in range(0, W, 12):
        d.line([(x, WALL + 1), (x, H - 1)], fill=(56, 50, 62, 255))
    bg.alpha_composite(fg)
    return bg.resize((W * 4, H * 4), Image.NEAREST)


scene(img).save(OUT.replace(".png", "-flat-x4.png"))
sil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sp = sil.load()
for y in range(H):
    for x in range(W):
        if lab[y, x] != ".":
            sp[x, y] = (18, 9, 15, 255)
sb = Image.new("RGBA", (W, H), (224, 202, 160, 255))
sb.alpha_composite(sil)
sb.resize((W * 4, H * 4), Image.NEAREST).save(OUT.replace(".png", "-sil-x4.png"))
print("colours", len(used))
