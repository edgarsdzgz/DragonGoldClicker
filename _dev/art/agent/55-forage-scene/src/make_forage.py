"""Batch 55: the Forage tab's backdrop, two compositions, each in lit, dusk and night.

A: from Draconia's back postern out over the valley. B: down in the valley, the city small on a ridge.
Lit look is drawn in code; dusk and night are palette swaps (pixkit.DUSK / NIGHT), the same method
as batch 34 (relight). Dithering only in the sky. Run: python -I make_forage.py
"""
import json
import math
import pathlib
import random
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from fkit import (BATCH, Canvas, H, P, River, W, bush, pine, pixel_wall, pixkit, ridge,
                  round_tree, stamp)

OUT, PREVIEW = BATCH / "out", BATCH / "preview"


def hill(c, x0, x1, peak, ground, fill, rim, shade, jag=1.2):
    """A hillside that rises smoothly out of the far ridge and falls back into it (no vertical edge)."""
    for x in range(max(0, x0), min(W, x1 + 1)):
        t = (x - x0) / max(1, x1 - x0)
        bell = math.sin(math.pi * t) ** 0.8
        top = int(round(ground - (ground - peak) * bell + jag * math.sin(x * 0.4 + 1)))
        for y in range(top, H):
            c.put(x, y, fill)
        c.put(x, top, rim)
        if t > 0.5:
            c.put(x, top + 1, shade)


# ------------------------------------------------------------------ shared pieces
def sky(c, horizon):
    c.rect(0, 0, W - 1, 17, "azure3")
    c.dither_band(18, 36, "azure3", "azure4")
    c.rect(0, 37, W - 1, 40, "azure4")
    c.dither_band(41, horizon + 4, "azure4", "parch3")
    # flat clouds, lit from the upper left: bright top, cool underside
    for (x, y, w) in ((14, 24, 22), (78, 15, 26), (104, 34, 18), (40, 40, 16)):
        for i in range(w):
            hgt = int(3 * math.sin(math.pi * (i + 1) / (w + 1)) + 1.4)
            for j in range(hgt):
                c.put(x + i, y - j, "steel5" if j < hgt - 1 or hgt == 1 else "steel5")
            c.put(x + i, y + 1, "steel4")
            if i > w // 2:
                c.put(x + i, y, "steel4")


def farm_field(c, x, y, w, h, a, b, skew=0.0):
    """A flat field patch: stripes of two colors, a parallelogram."""
    for j in range(h):
        off = int(j * skew)
        for i in range(w):
            c.put(x + i + off, y + j, a if (j // 2) % 2 == 0 else b)


def farm_house(c, x, y, scale=1, outline=False):
    """A farmhouse seen from far: parch walls, clay roof, lit on the left."""
    cells = []
    wd, ht = 6 * scale, 3 * scale
    for j in range(ht):
        for i in range(wd):
            c.put(x + i, y - ht + j, "parch3" if i < wd // 2 else "parch2")
            cells.append((x + i, y - ht + j))
    for j in range(2 * scale):
        for i in range(wd + 2):
            if i >= j and i <= wd + 1 - j:
                c.put(x - 1 + i, y - ht - 1 - j, "clay3" if i < wd // 2 + 1 else "clay2")
                cells.append((x - 1 + i, y - ht - 1 - j))
    c.put(x + wd // 2, y - 1, "wood1")
    if outline:
        c.outline_mask(cells)


def far_city(c, x, base):
    """The city, small on its ridge: a back wall with merlons, two towers and the keep."""
    wall = [(x + i, base - 4 + j) for i in range(26) for j in range(4)]
    for (px_, py_) in wall:
        c.put(px_, py_, "steel3" if (px_ - x) < 16 else "steel2")
    for i in range(0, 26, 3):
        c.put(x + i, base - 5, "steel4")
        c.put(x + i + 1, base - 5, "steel4")
    for i in range(26):
        c.put(x + i, base - 1, "steel1")
    for tx in (x - 3, x + 24):  # towers
        for j in range(9):
            for i in range(4):
                c.put(tx + i, base - 9 + j, "steel4" if i < 2 else "steel3")
        for j in range(4):
            for i in range(6):
                if abs(i - 2.5) <= 2.5 - j * 0.7:
                    c.put(tx - 1 + i, base - 10 - j, "clay3" if i < 3 else "clay2")
    for j in range(13):  # the keep
        for i in range(7):
            c.put(x + 9 + i, base - 4 - j, "steel4" if i < 3 else "steel3")
    for i in range(7):
        c.put(x + 9 + i, base - 17, "steel4")
    for i in (0, 2, 4, 6):
        c.put(x + 9 + i, base - 18, "steel4")
    c.put(x + 12, base - 11, "ink")
    c.put(x + 12, base - 19, "gold3")  # a standard
    c.put(x + 12, base - 20, "gold3")
    c.put(x + 13, base - 20, "gold4")
    # shade under the wall from the ridge
    for i in range(-3, 30):
        c.put(x + i, base, "orc1")


def mine_mouth(c, x, y, spoil=1):
    """A mine mouth in a hillside: timber frame, dark opening, spoil tipped downhill."""
    cells = []
    for j in range(7):
        for i in range(8):
            cells.append((x + i, y - 7 + j))
    for (px_, py_) in cells:
        c.put(px_, py_, "ink")
    for j in range(2, 7):  # the opening
        for i in range(2, 6):
            c.put(x + i, y - 7 + j, "night1" if j < 5 else "ink")
    for j in range(1, 7):  # timber posts
        c.put(x + 1, y - 7 + j, "wood3")
        c.put(x + 6, y - 7 + j, "wood1")
    for i in range(1, 7):  # lintel
        c.put(x + i, y - 6, "wood3" if i < 4 else "wood2")
    if spoil:
        for k, (dx, dy) in enumerate([(7, 0), (8, 0), (9, 0), (10, 0), (7, -1), (8, -1), (9, -1), (8, -2)]):
            c.put(x + dx, y + dy, "steel3" if dy < 0 or k < 2 else "steel2")
        c.put(x + 11, y, "steel1")
    # a few dark stones around the opening
    c.put(x - 1, y - 1, "steel2")
    c.put(x - 2, y, "steel2")


def hut(c, x, y):
    """A trapper's lean-to: low walls, a clay-red roof, a drying rack beside it. Inked."""
    cells = []
    for j in range(6):
        for i in range(10):
            col = "wood4" if i < 5 else "wood3"
            c.put(x + i, y - 6 + j, col)
            cells.append((x + i, y - 6 + j))
    for j in range(4):
        for i in range(14):
            if i >= j and i <= 13 - j:
                col = "clay3" if i < 7 else "clay2"
                c.put(x - 2 + i, y - 7 - j, col)
                cells.append((x - 2 + i, y - 7 - j))
    for j in range(4):  # door
        for i in range(3):
            c.put(x + 3 + i, y - 4 + j, "wood1")
    c.outline_mask(cells)
    # drying rack: two poles and a rail with hung pelts
    for j in range(5):
        c.put(x + 13, y - 5 + j, "wood3")
        c.put(x + 19, y - 5 + j, "wood3")
    for i in range(13, 20):
        c.put(x + i, y - 5, "wood2")
    for px_ in (14, 16, 18):
        c.put(x + px_, y - 4, "parch2")
        c.put(x + px_, y - 3, "parch1")


def fence(c, x0, x1, y, slope=0.0):
    for x in range(x0, x1 + 1):
        yy = int(y + (x - x0) * slope)
        if (x - x0) % 5 == 0:
            for j in range(3):
                c.put(x, yy - j, "wood2")
        c.put(x, yy - 2, "wood3")


def scatter(c, rng, region, n, kind):
    x0, y0, x1, y1 = region
    for _ in range(n):
        x, y = rng.randint(x0, x1), rng.randint(y0, y1)
        if kind == "light":  # sunlit grass clump, flat
            stamp(c, x, y, ["ww.", "www"], {"w": "green3"})
        elif kind == "dark":
            stamp(c, x, y, ["ddd", ".d."], {"d": "green1"})
        elif kind == "flower":
            c.put(x, y, "gold4")
            c.put(x + 1, y, "gold4")
            c.put(x, y + 1, "green3")
        elif kind == "rock":
            stamp(c, x, y, [".ll", "lsd", "ddd"], {"l": "steel3", "s": "steel2", "d": "steel1"})


def reeds(c, x, y, h=5):
    for k in range(3):
        for j in range(h - k):
            c.put(x + k * 2, y - j, "green2" if j < h - 2 else "green3")
        c.put(x + k * 2, y - (h - k), "gold3")


def forest_edge(c, side, rows, rng, x_in):
    """Trees on one side. rows: list of (base_y, height, spacing). side -1 left / +1 right.
    x_in: how far the forest reaches toward the center at its front row."""
    trees = []
    for (by, h, step) in rows:
        reach = x_in * (0.35 + 0.65 * (by - rows[0][0]) / max(1, rows[-1][0] - rows[0][0]))
        x = 0 if side < 0 else W - 1
        n = int(reach / step) + 2
        for i in range(n):
            tx = x + side * (i * step + rng.randint(-1, 1))
            if side > 0:
                tx = W - 1 - (i * step + rng.randint(-1, 1))
            trees.append((by + rng.randint(-2, 2), tx, h + rng.randint(-2, 3), rng.random() < 0.3))
    trees.sort()
    for (by, tx, h, rnd) in trees:
        if rnd and h >= 14:
            round_tree(c, tx, by, int(h * 0.38))
        else:
            pine(c, tx, by, h)


# ------------------------------------------------------------------ option B: down in the valley
def scene_b():
    rng = random.Random(55)
    c = Canvas()
    sky(c, 64)
    ridge(c, 58, [(3, 0.09, 0.4), (2, 0.23, 1.1), (1.2, 0.5, 2)], "night4", rim="steel3")
    far_ridge = ridge(c, 72, [(2, 0.07, 2.2), (1.4, 0.19, 0.3), (0.8, 0.5, 1)], "orc3", rim="steel4", shade="orc2")
    # the city on its ridge
    for x in range(26, 62):
        for y in range(68, 73):
            c.put(x, y, "orc3")
    far_city(c, 30, 70)
    # mine hillside on the right: a green hill with exposed rock, mouths in its foot
    hill(c, 72, 160, 76, 96, "orc2", "orc3", "orc1")
    for (x, y, w, h) in ((98, 90, 8, 3), (110, 85, 9, 3), (122, 92, 6, 2)):
        for j in range(h):
            for i in range(w):
                c.put(x + i, y + j, "steel2" if (i + j) % 3 else "steel3")
    # rolling meadow bands: far haze green, lit green, near green (the city's ground color)
    ridge(c, 98, [(2, 0.08, 0.7), (1, 0.31, 2.2)], "green3", rim="orc3", shade="green2")
    mine_mouth(c, 96, 104)
    mine_mouth(c, 108, 99, spoil=1)
    # far farms and fields on the lit band
    farm_field(c, 8, 102, 30, 8, "gold4", "gold3", 0.2)
    farm_field(c, 42, 106, 20, 6, "green2", "green3", 0.1)
    farm_field(c, 4, 113, 26, 8, "green2", "green3", -0.15)
    farm_field(c, 36, 114, 18, 7, "gold3", "gold4", 0.15)
    farm_house(c, 44, 104)
    farm_house(c, 26, 112)
    ridge(c, 124, [(2.5, 0.06, 2.8), (1.2, 0.27, 0.9)], "green2", rim="green3")
    # forests behind the river banks (far rows)
    forest_edge(c, -1, [(106, 10, 5), (124, 14, 6)], rng, 40)
    forest_edge(c, 1, [(116, 12, 5), (128, 16, 6)], rng, 24)
    river = River([(100, 66), (118, 58), (140, 74), (166, 54), (196, 72), (226, 96), (248, 140), (262, 170)],
                  1.0, 17, 1.25)
    river.draw(c, 4)
    # meadow details
    scatter(c, rng, (4, 130, 120, 232), 70, "light")
    scatter(c, rng, (4, 134, 120, 232), 30, "dark")
    scatter(c, rng, (20, 146, 100, 226), 12, "flower")
    # a hut on the near-left meadow, a fence, rocks along the bank
    hut(c, 9, 168)
    fence(c, 44, 66, 176, 0.05)
    for (x, y) in ((88, 196), (22, 218), (105, 176)):
        scatter(c, random.Random(x), (x, y, x, y), 1, "rock")
    for (x, y) in ((66, 150), (50, 196), (92, 226)):
        reeds(c, x, y)
    # near forests: framing, tall, both sides, dense toward the bottom
    forest_edge(c, -1, [(146, 22, 6), (170, 28, 7), (198, 34, 8)], rng, 40)
    forest_edge(c, 1, [(142, 20, 7), (166, 28, 8), (192, 36, 9)], rng, 36)
    # quiet foreground: bush line and dark grass along the bottom
    for y in range(232, H):
        for x in range(W):
            c.put(x, y, "green2" if y < 246 else "green1")
    scatter(c, rng, (0, 236, 126, 244), 18, "light")
    for x in range(-4, W + 4, 11):
        bush(c, x + rng.randint(-2, 2), 250 + rng.randint(-2, 3), 6 + rng.randint(0, 2))
    for x in range(-2, W + 4, 9):
        bush(c, x + rng.randint(-2, 2), 270 + rng.randint(-1, 3), 8, ("green2", "green1", "green1"))
    for y in range(272, H):
        for x in range(W):
            c.put(x, y, "green1")
    return c.img


# ------------------------------------------------------------------ option A: from the postern
def path(c, pts, w0, w1):
    rv = River(pts, w0, w1, 1.0)
    for y in range(rv.y0, rv.y1 + 1):
        cx, hw = rv.cx(y), rv.hw(y)
        for x in range(int(cx - hw) - 1, int(cx + hw) + 2):
            d = x + 0.5 - cx
            if abs(d) <= hw:
                c.put(x, y, "parch3" if d < -hw * 0.5 and hw > 2 else ("parch1" if d > hw * 0.55 else "parch2"))
    return rv


def bridge(c, y, cx, hw):
    cells = []
    x0, x1 = int(cx - hw - 3), int(cx + hw + 3)
    for j in range(5):
        for x in range(x0, x1 + 1):
            c.put(x, y + j, ("wood4" if j == 0 else "wood3") if (x // 3) % 2 == 0 else ("wood3" if j == 0 else "wood2"))
            cells.append((x, y + j))
    for x in (x0 + 1, x1 - 1):  # rail posts
        for j in range(1, 4):
            c.put(x, y - j, "wood2")
            cells.append((x, y - j))
    c.outline_mask(cells)


def scene_a():
    rng = random.Random(56)
    c = Canvas()
    sky(c, 62)
    ridge(c, 56, [(3.2, 0.08, 1.0), (2, 0.2, 2.2), (1.2, 0.5, 0.2)], "night4", rim="steel3")
    ridge(c, 70, [(2.2, 0.06, 0.5), (1.4, 0.18, 1.7), (0.8, 0.47, 0.6)], "orc3", rim="steel4", shade="orc2")
    # mine hillside left
    hill(c, -30, 62, 76, 96, "orc2", "orc3", "orc1")
    for (x, y, w, h) in ((16, 90, 9, 3), (30, 85, 10, 3), (6, 94, 7, 2)):
        for j in range(h):
            for i in range(w):
                c.put(x + i, y + j, "steel2" if (i + j) % 3 else "steel3")
    ridge(c, 96, [(2, 0.08, 0.2), (1, 0.33, 1.3)], "green3", rim="orc3", shade="green2")
    mine_mouth(c, 14, 102)
    mine_mouth(c, 28, 97)
    farm_field(c, 64, 100, 26, 7, "gold4", "gold3", 0.2)
    farm_field(c, 96, 103, 24, 7, "green2", "green3", -0.15)
    farm_field(c, 58, 109, 22, 7, "green2", "green3", 0.1)
    farm_field(c, 88, 112, 30, 8, "gold3", "gold4", -0.2)
    farm_house(c, 80, 104)
    farm_house(c, 112, 111)
    ridge(c, 122, [(2.5, 0.06, 1.8), (1.2, 0.27, 0.5)], "green2", rim="green3")
    forest_edge(c, -1, [(110, 10, 5), (128, 14, 6)], rng, 38)
    forest_edge(c, 1, [(116, 12, 5), (130, 16, 6)], rng, 40)
    river = River([(82, 66), (100, 90), (122, 44), (146, 92), (170, 40), (198, 82), (216, 64), (230, 34), (240, 2)],
                  1.0, 12, 1.1)
    # the path out of the postern, over the bridge, up to the farms: laid first, the river cuts it
    rvp = path(c, [(104, 100), (126, 112), (150, 108), (172, 96), (190, 88), (204, 78), (214, 72), (228, 67), (246, 65), (260, 65)], 1.2, 5.5)
    river.draw(c, 7)
    scatter(c, rng, (4, 128, 124, 236), 60, "light")
    scatter(c, rng, (4, 134, 124, 236), 28, "dark")
    scatter(c, rng, (20, 140, 120, 230), 12, "flower")
    bridge(c, 201, 77.5, river.hw(204) - 2)
    for (x, y) in ((92, 150), (28, 196), (112, 206), (40, 232)):
        scatter(c, random.Random(x), (x, y, x, y), 1, "rock")
    for (x, y) in ((100, 150), (60, 180), (22, 226)):
        reeds(c, x, y)
    forest_edge(c, -1, [(150, 22, 7), (176, 28, 8), (208, 34, 9)], rng, 30)
    forest_edge(c, 1, [(150, 22, 7), (176, 30, 8), (208, 36, 9)], rng, 22)
    # the city's back wall across the bottom, with the open postern
    for y in range(238, 246):
        for x in range(W):
            c.put(x, y, "green2" if y < 242 else "green1")
    for x in range(-4, W + 4, 12):
        bush(c, x + rng.randint(-2, 2), 246, 5 + rng.randint(0, 2), ("green2", "green1", "green1"))
    pixel_wall(c, 0, 248, W - 1, H - 1)
    wall_cells = []
    for x in range(0, W, 9):  # merlons on the wall walk
        for dx in range(5):
            for y in range(243, 248):
                c.put(x + dx, y, "steel4" if y == 243 else ("steel3" if (x + dx) % 9 < 3 else "steel2"))
                wall_cells.append((x + dx, y))
    for x in range(W):
        c.put(x, 248, "steel4")
    # postern: dark arch, open leaf, a floor of path leading in
    ax0, ax1, atop = 56, 74, 254
    arch = []
    for y in range(atop, H):
        for x in range(ax0, ax1 + 1):
            top_curve = atop + int(round((1 - math.sqrt(max(0, 1 - ((x - 65) / 9.5) ** 2))) * 6))
            if y >= top_curve:
                arch.append((x, y))
    for (x, y) in arch:
        c.put(x, y, "ink" if y < atop + 9 else "night1")
    for (x, y) in arch:  # the courtyard beyond, warm and lit
        if y >= 268 and ax0 + 3 <= x <= ax1 - 3:
            c.put(x, y, "parch1" if y < 274 else "parch2")
    for j in range(20):  # open door leaf, swung against the left jamb
        for i in range(4):
            if ax0 + i < ax0 + 4 and atop + 5 + j < H:
                c.put(ax0 + i, atop + 5 + j, "wood3" if i < 2 else "wood2")
    for i in range(ax0 - 2, ax1 + 3):  # stone arch ring
        pass
    ring = []
    for (x, y) in arch:
        for dx, dy in ((1, 0), (-1, 0), (0, -1)):
            if (x + dx, y + dy) not in set(arch):
                ring.append((x + dx, y + dy))
    for (x, y) in ring:
        c.put(x, y, "steel1" if y > atop + 1 else "steel4")
    c.outline_mask(arch, "ink")
    # a torch beside the postern, a lit local source
    for j in range(5):
        c.put(81, 256 + j, "wood3")
    c.put(81, 255, "fire1")
    c.put(81, 254, "fire2")
    c.put(81, 253, "fire3")
    c.put(80, 254, "fire1")
    # outline along the wall top
    for (x, y) in wall_cells:
        if (x, y - 1) not in set(wall_cells) and y == 243:
            c.put(x, y - 1, "ink")
    return c.img


# ------------------------------------------------------------------ outputs and previews
def overlay(img, scale=3):
    """The Forage screen's interface as plain semi-opaque gray boxes, on a 390 x 846 pt art scale."""
    big = pixkit.upscale(img, scale).convert("RGBA")
    lay = Image.new("RGBA", big.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    g = (64, 64, 70, 190)
    d.rectangle((0, 0, 389, 76), fill=g)             # resource bar
    d.rectangle((14, 84, 375, 142), fill=g)          # quest ribbon
    d.rectangle((14, 160, 375, 236), fill=g)         # granary
    d.rectangle((14, 244, 190, 290), fill=g)         # food count
    d.rectangle((200, 244, 375, 290), fill=g)        # status badges
    d.rectangle((14, 296, 375, 326), fill=g)
    d.ellipse((195 - 55, 445 - 55, 195 + 55, 445 + 55), fill=(200, 160, 60, 200))  # HARVEST orb, ~110 pt
    d.ellipse((38, 590, 118, 700), fill=g)           # command orbs
    d.ellipse((272, 590, 352, 700), fill=g)
    d.rectangle((0, 760, 389, 843), fill=g)          # tab bar
    return Image.alpha_composite(big, lay)


def main():
    for sub in ("out", "preview"):
        (BATCH / sub).mkdir(exist_ok=True)
    entries = []
    for key, fn in (("a", scene_a), ("b", scene_b)):
        base = fn()
        name = f"map_forage_base_{key}"
        levels = {"": base, "_dusk": pixkit.relight(base, pixkit.DUSK), "_night": pixkit.relight(base, pixkit.NIGHT)}
        for suf, im in levels.items():
            im.save(OUT / f"{name}{suf}.png")
            errors, warnings = pixkit.check(im, {"size": (W, H), "budget": 60, "outline": False})
            entries.append({"name": name + suf, "file": f"{name}{suf}.png", "size": [W, H], "frames": 1, "fps": None,
                            "anchor": None, "errors": errors, "warnings": warnings[:5], "warning_count": len(warnings)})
            if suf == "":
                pixkit.upscale(im, 3).save(PREVIEW / f"{name}_x3.png")
                overlay(im).save(PREVIEW / f"{name}_ui_x3.png")
            else:
                pixkit.upscale(im, 3).save(PREVIEW / f"{name}{suf}_x3.png")
        sheet = Image.new("RGBA", (W * 3 * 3 + 32, H * 3), P["night1"] + (255,))
        for i, suf in enumerate(levels):
            sheet.paste(pixkit.upscale(levels[suf], 3), (i * (W * 3 + 16), 0))
        sheet.save(PREVIEW / f"{name}_levels_x3.png")
    (BATCH / "manifest.json").write_text(json.dumps(entries, indent=1), encoding="utf-8")
    for e in entries:
        print(e["file"], "errors:", e["errors"], "warnings:", e["warning_count"])


if __name__ == "__main__":
    main()
