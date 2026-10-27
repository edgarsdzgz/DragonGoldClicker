"""Batch 7: Forage and events, 2026-10-27.

- The granary at 25 and 75, from the same drawing as the locked 0, 50 and 100 (01-test-run/src/granary.py):
  grain in the doorway and sacks out front, the building unchanged.
- The Forage orb's picture, the four food event badges and the starvation warning icon: outlined icons
  in the icon set's flat, two- and three-tone shading, lit from the upper left.
- Seven banners at the strips' 110x34: flat color bands and clusters, no dither (the owner's rule), with
  the Warfront's own wall and gate (cropped from the locked gate art) for the three scenes at the walls.

Red is kept for danger: only the starvation warning's mark uses it.
Run: python src/make_events.py
"""
import pathlib
import sys

from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).resolve().parents[1]
AGENT = HERE.parent
sys.path.insert(0, str(AGENT / "00-foundation"))
sys.path.insert(0, str(AGENT / "01-test-run" / "src"))
from pixkit import PALETTE, outline, upscale  # noqa: E402
import granary as g  # noqa: E402

OFFICIAL = AGENT.parent / "official"
OUT, PREVIEW = HERE / "out", HERE / "preview"
P = {k: v + (255,) for k, v in PALETTE.items()}
BW, BH = 110, 34


def blank(w, h):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


# --- The granary at 25 and 75 --------------------------------------------------------------------

def granary(level):
    img = g.base()
    if level == 25:
        g.fill_door(img, 20)
        img.alpha_composite(g.SACK, (1, 25))
    elif level == 75:
        g.fill_door(img, 16)
        for xy in ((0, 25), (5, 25), (24, 25)):
            img.alpha_composite(g.SACK, xy)
    return img


# --- Icons ---------------------------------------------------------------------------------------

def basket(d, x0, y0, w, h):
    """A woven basket: a rim, alternating weave rows, lit on the left."""
    d.rectangle([x0, y0, x0 + w - 1, y0 + h - 1], fill=P["wood3"])
    for y in range(y0 + 2, y0 + h, 2):
        d.line([x0 + 1, y, x0 + w - 2, y], fill=P["wood2"])
    d.line([x0, y0, x0 + w - 1, y0], fill=P["parch1"])            # rim
    d.line([x0 + w - 1, y0 + 1, x0 + w - 1, y0 + h - 1], fill=P["wood2"])
    d.line([x0 + 1, y0 + h - 1, x0 + w - 2, y0 + h - 1], fill=P["wood2"])


def sheaf(d, cx, top, bottom, spread):
    """A wheat sheaf: stalks fanning up from a binding, each ending in its own ear (a gap between ears,
    which the outline turns into a line, keeps them apart)."""
    for dx in range(-spread, spread + 1, 3):
        y = top + abs(dx) // 2
        d.line([cx, bottom, cx + dx, y + 4], fill=P["gold3"])
        d.rectangle([cx + dx - 1, y, cx + dx, y + 3], fill=P["gold4"])
        d.point((cx + dx - 1, y), fill=P["gold5"])
    d.line([cx - 1, bottom - 3, cx + 1, bottom - 3], fill=P["wood2"])   # the binding


def forage_action():
    img = blank(20, 20)
    d = ImageDraw.Draw(img)
    sheaf(d, 10, 1, 12, 6)
    basket(d, 3, 10, 14, 8)
    return outline(img)


def sack(d, x0, y0, w, h, fill=1.0):
    """A grain sack, tied at the neck; fill < 1 slumps it."""
    top = y0 + round(h * (1 - fill) * 0.6)
    d.ellipse([x0, top + 2, x0 + w - 1, y0 + h - 1], fill=P["parch2"])
    d.rectangle([x0 + w // 2 - 2, top, x0 + w // 2 + 1, top + 2], fill=P["parch2"])
    d.line([x0 + w // 2 - 2, top + 2, x0 + w // 2 + 1, top + 2], fill=P["wood2"])     # the tie
    d.line([x0 + 1, top + 4, x0 + 1, y0 + h - 4], fill=P["parch3"])                     # lit edge
    d.line([x0 + w - 2, top + 5, x0 + w - 2, y0 + h - 3], fill=P["parch1"])


def grains(d, pts, color="gold4"):
    for x, y in pts:
        d.point((x, y), fill=P[color])


def food_bountiful():
    img = blank(24, 24)
    d = ImageDraw.Draw(img)
    sheaf(d, 9, 1, 13, 6)
    d.ellipse([14, 6, 20, 12], fill=P["green3"])                  # an apple
    d.point((16, 7), fill=P["parch3"])
    d.line([17, 4, 17, 6], fill=P["wood2"])
    d.ellipse([12, 9, 21, 15], fill=P["gold3"])                   # a loaf
    d.line([14, 10, 19, 10], fill=P["gold4"])
    basket(d, 2, 13, 20, 9)
    return outline(img)


def food_lean():
    img = blank(24, 24)
    d = ImageDraw.Draw(img)
    sack(d, 4, 4, 16, 18, fill=0.35)
    grains(d, ((3, 22), (21, 21)), "gold3")
    return outline(img)


def food_raid():
    img = blank(24, 24)
    d = ImageDraw.Draw(img)
    sack(d, 2, 3, 15, 17)
    d.line([6, 11, 11, 16], fill=P["wood1"])                                 # the gash
    d.line([7, 11, 12, 16], fill=P["wood1"])
    d.polygon([(11, 16), (13, 17), (20, 22), (8, 22)], fill=P["gold3"])      # grain pouring out
    d.line([12, 17, 18, 22], fill=P["gold4"])
    d.line([12, 9, 16, 5], fill=P["steel3"])                                 # the dagger, driven in
    d.line([13, 9, 17, 5], fill=P["steel3"])
    d.line([16, 3, 19, 6], fill=P["steel2"])                                 # its guard
    d.line([18, 4, 21, 1], fill=P["wood2"])                                  # its grip
    return outline(img)


def food_refugees():
    img = blank(24, 24)
    d = ImageDraw.Draw(img)
    for cx, top, cloak, face in ((6, 7, "sea2", "skin1"), (18, 7, "clay1", "skin3"), (12, 4, "wood2", "skin2")):
        d.ellipse([cx - 5, top + 6, cx + 5, top + 20], fill=P[cloak])          # shoulders
        d.ellipse([cx - 4, top, cx + 3, top + 8], fill=P[cloak])               # hood
        d.rectangle([cx - 2, top + 3, cx + 1, top + 6], fill=P[face])
        d.point((cx - 1, top + 4), fill=P["ink"])
        d.point((cx + 1, top + 4), fill=P["ink"])
    return outline(img.crop((0, 0, 24, 24)))


def food_warning():
    img = blank(12, 12)
    d = ImageDraw.Draw(img)
    d.rectangle([5, 0, 6, 4], fill=P["red2"])        # the mark
    d.rectangle([5, 6, 6, 6], fill=P["red2"])
    d.ellipse([1, 7, 10, 12], fill=P["wood3"])        # an empty bowl
    d.rectangle([1, 7, 10, 8], fill=P["wood2"])
    d.line([2, 8, 9, 8], fill=P["wood1"])
    return outline(img)


# --- Banners -------------------------------------------------------------------------------------

def bands(img, rows):
    """Flat sky bands: [(first row, color)], each band running to the next."""
    d = ImageDraw.Draw(img)
    for i, (y0, c) in enumerate(rows):
        y1 = rows[i + 1][0] - 1 if i + 1 < len(rows) else img.height - 1
        d.rectangle([0, y0, img.width - 1, y1], fill=P[c])


def ridge(img, pts, color):
    """A silhouette from a line of (x, y) points down to the bottom."""
    ImageDraw.Draw(img).polygon(pts + [(img.width - 1, img.height - 1), (0, img.height - 1)], fill=P[color])


def gate(state, rows):
    """The bottom `rows` of the banner: the middle 110 columns of the locked gate art, its top rows."""
    src = Image.open(OFFICIAL / "warfront" / f"map_gate_{state}.png").convert("RGBA")
    x0 = (src.width - BW) // 2
    top = next(y for y in range(src.height) if any(src.getpixel((x, y))[3] for x in range(src.width)))
    return src.crop((x0, top, x0 + BW, top + rows))


def figure(name):
    return Image.open(AGENT / "28-people" / "out" / f"part_{name}.png").convert("RGBA")


def welcome_back():
    img = blank(BW, BH)
    bands(img, [(0, "night2"), (5, "shadow3"), (9, "rose1"), (12, "rose2"), (14, "fire1"), (16, "gold4")])
    d = ImageDraw.Draw(img)
    d.ellipse([62, 8, 84, 30], fill=P["gold5"])                       # the sun, rising behind the wall
    d.ellipse([65, 11, 81, 27], fill=P["gold6"])
    for y, x0, x1 in ((4, 10, 30), (7, 88, 104)):                     # thin dawn clouds
        d.line([x0, y, x1, y], fill=P["rose2"])
    wall = gate("sound", 16)
    img.alpha_composite(wall, (0, BH - wall.height))
    return img


def breach_report():
    img = blank(BW, BH)
    bands(img, [(0, "ash1"), (6, "ash2"), (11, "rose1"), (14, "clay2"), (16, "fire1")])
    wall = gate("breached", 22)
    img.alpha_composite(wall, (0, BH - wall.height))
    d = ImageDraw.Draw(img)
    for cx, cy, r, c in ((55, 9, 4, "ash3"), (58, 5, 3, "ash3"), (52, 3, 2, "ash2"), (61, 1, 2, "ash2")):   # smoke
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=P[c])
    rubble = blank(BW, BH)
    rd = ImageDraw.Draw(rubble)
    for x, y, w, h in ((44, 30, 4, 3), (50, 31, 3, 2), (62, 30, 5, 3), (68, 31, 3, 2), (39, 31, 2, 2)):
        rd.rectangle([x, y, x + w - 1, y + h - 1], fill=P["night3"])
        rd.line([x, y, x + w - 1, y], fill=P["night4"])
    img.alpha_composite(outline(rubble))
    return img


def refugees():
    img = blank(BW, BH)
    bands(img, [(0, "night2"), (6, "shadow3"), (11, "rose1"), (14, "clay2")])
    wall = gate("sound", 22)
    img.alpha_composite(wall.crop((50, 0, BW, wall.height)), (50, BH - wall.height))
    d = ImageDraw.Draw(img)
    d.rectangle([0, BH - 6, 60, BH - 1], fill=P["wood2"])           # the road up to the gate
    d.line([0, BH - 6, 60, BH - 6], fill=P["wood3"])
    for name, x in (("veteran", 8), ("traveler", 19), ("child", 29), ("walker", 38)):
        f = figure(name)
        img.alpha_composite(f, (x, BH - 3 - f.height))
    return img


def stars(d, pts):
    for x, y in pts:
        d.point((x, y), fill=P["parch3"])


def exp_light():
    img = blank(BW, BH)
    bands(img, [(0, "shadow1"), (10, "night1"), (17, "shadow2")])
    d = ImageDraw.Draw(img)
    stars(d, ((6, 3), (19, 7), (33, 2), (47, 9), (71, 4), (88, 8), (101, 3), (58, 13)))
    ridge(img, [(0, 22), (20, 19), (38, 21), (60, 15), (78, 18), (96, 16), (109, 20)], "night1")
    for rx, ry, c in ((13, 5, "shadow3"), (8, 3, "rose1"), (4, 2, "fire1")):   # the glow, in flat steps
        d.ellipse([68 - rx, 17 - ry, 68 + rx, 17 + ry], fill=P[c])
    d.polygon([(64, 15), (68, 11), (72, 15)], fill=P["shadow1"])     # a hut on the far ridge
    d.rectangle([65, 15, 71, 18], fill=P["shadow1"])
    d.rectangle([67, 16, 68, 17], fill=P["fire2"])                   # its lit window
    ridge(img, [(0, 27), (24, 24), (50, 28), (82, 25), (109, 27)], "shadow1")
    return img


def exp_find():
    img = blank(BW, BH)
    bands(img, [(0, "night2"), (7, "night3"), (13, "clay3"), (16, "gold3")])
    ridge(img, [(0, 19), (30, 17), (55, 19), (85, 16), (109, 18)], "clay1")
    ridge(img, [(0, 25), (40, 24), (70, 25), (109, 23)], "wood2")
    obj = blank(BW, BH)
    d = ImageDraw.Draw(obj)
    for x, y, w, h in ((30, 25, 6, 4), (78, 24, 5, 4), (88, 26, 7, 3)):        # rocks
        d.rectangle([x, y, x + w - 1, y + h - 1], fill=P["ash2"])
        d.line([x, y, x + w - 1, y], fill=P["ash3"])
    d.rectangle([47, 21, 62, 29], fill=P["wood3"])                   # the chest, half in the sand
    d.rectangle([47, 21, 62, 23], fill=P["wood2"])
    d.line([47, 24, 62, 24], fill=P["gold3"])
    d.rectangle([54, 23, 55, 26], fill=P["gold4"])
    d.line([47, 21, 62, 21], fill=P["gold3"])
    img.alpha_composite(outline(obj))
    d = ImageDraw.Draw(img)
    d.polygon([(44, 29), (66, 29), (70, 33), (40, 33)], fill=P["wood2"])   # sand drifted over its foot
    for x, y in ((50, 18), (49, 18), (51, 18), (50, 17), (50, 19)):          # the glint
        d.point((x, y), fill=P["gold6"])
    return img


def exp_survivors():
    img = blank(BW, BH)
    bands(img, [(0, "night2"), (8, "shadow3"), (13, "rose1"), (16, "clay2")])
    ridge(img, [(0, 22), (28, 20), (52, 17), (75, 20), (109, 21)], "shadow2")
    d = ImageDraw.Draw(img)
    for cx, cy, r in ((60, 13, 2), (62, 9, 3), (60, 4, 3), (63, 0, 3)):      # a smoke signal
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=P["ash2"])
    obj = blank(BW, BH)
    od = ImageDraw.Draw(obj)
    od.polygon([(58, 18), (60, 14), (62, 18)], fill=P["fire1"])              # the fire
    od.point((60, 16), fill=P["fire2"])
    od.line([48, 7, 48, 17], fill=P["wood3"])                                 # a ragged flag
    od.polygon([(49, 7), (54, 8), (52, 9), (54, 10), (49, 11)], fill=P["parch2"])
    for x, coat, arm in ((67, "sea2", True), (74, "clay1", False), (41, "green2", False)):   # small figures
        od.rectangle([x, 10, x + 1, 11], fill=P["skin2"])                     # head
        od.rectangle([x - 1, 12, x + 2, 15], fill=P[coat])                    # body
        od.rectangle([x - 1, 16, x - 1, 17], fill=P["wood1"])                 # legs
        od.rectangle([x + 2, 16, x + 2, 17], fill=P["wood1"])
        if arm:                                                               # one of them waving
            od.line([x + 4, 12, x + 4, 8], fill=P["skin2"])
    img.alpha_composite(outline(obj))
    ridge(img, [(0, 27), (35, 25), (70, 28), (109, 26)], "shadow1")
    return img


def exp_silent():
    img = blank(BW, BH)
    bands(img, [(0, "ash1"), (9, "ash2"), (17, "ash3")])
    ridge(img, [(0, 20), (40, 19), (80, 20), (109, 19)], "ash2")
    ridge(img, [(0, 24), (109, 24)], "steel1")
    obj = blank(BW, BH)
    d = ImageDraw.Draw(obj)
    d.line([80, 26, 80, 12], fill=P["wood1"])                                 # a dead tree
    d.line([80, 18, 75, 13], fill=P["wood1"])
    d.line([80, 15, 84, 11], fill=P["wood1"])
    d.line([77, 15, 76, 12], fill=P["wood1"])
    d.rectangle([22, 28, 26, 29], fill=P["parch3"])                           # bones
    d.point((21, 27), fill=P["parch3"])
    d.point((27, 27), fill=P["parch3"])
    img.alpha_composite(outline(obj))
    return img


ICONS = {"evt_forage-action": forage_action, "evt_food-lean": food_lean, "evt_food-bountiful": food_bountiful,
         "evt_food-raid": food_raid, "evt_food-refugees": food_refugees, "evt_food-warning": food_warning}
BANNERS = {"evt_exp-light": exp_light, "evt_exp-find": exp_find, "evt_exp-survivors": exp_survivors,
           "evt_exp-silent": exp_silent, "evt_welcome-back": welcome_back, "evt_breach-report": breach_report,
           "evt_refugees": refugees}


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    made = {f"evt_granary_{n}": granary(n) for n in (25, 75)}
    made |= {k: f() for k, f in ICONS.items()}
    made |= {k: f() for k, f in BANNERS.items()}
    for name, img in made.items():
        img.save(OUT / f"{name}.png")
        upscale(img, 4).save(PREVIEW / f"{name}_x4.png")
    print(len(made), "files")


if __name__ == "__main__":
    main()
