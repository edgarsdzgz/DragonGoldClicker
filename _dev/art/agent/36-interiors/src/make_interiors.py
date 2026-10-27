"""Building interior headers, v1, 2026-10-27: a picture at the top of each building's screen.

110x34, the event banners' size and look (29-forage-events): flat bands and clusters, no dither. The
room is a back wall and a floor; each building's things stand in it, outlined in ink like the banner
props. One header per building on the city map; the two wall towers share one. No magenta (it is the
Unmaking's), no red (it is for danger).

Run: python src/make_interiors.py
"""
import pathlib
import sys

from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from pixkit import PALETTE as P, outline, upscale  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
W, H = 110, 34
FLOOR = 27


def room(wall, mortar, floor, seam, planks=False):
    """The back wall (stone courses, or upright planks) and the floor boards."""
    img = Image.new("RGBA", (W, H), P[wall] + (255,))
    d = ImageDraw.Draw(img)
    if planks:
        for x in range(0, W, 7):
            d.line([x, 0, x, FLOOR - 1], fill=P[mortar])
    else:
        for i, y in enumerate(range(4, FLOOR, 5)):
            d.line([0, y, W - 1, y], fill=P[mortar])
            for x in range((i % 2) * 6, W, 12):
                d.line([x, y - 4, x, y - 1], fill=P[mortar])
    d.rectangle([0, FLOOR, W - 1, H - 1], fill=P[floor])
    d.line([0, FLOOR, W - 1, FLOOR], fill=P[seam])
    for x in range(9, W, 18):
        d.line([x, FLOOR + 1, x - 3, H - 1], fill=P[seam])
    return img


class Things:
    """Props drawn on their own layer, then outlined in ink and laid over the room."""

    def __init__(self):
        self.img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img)

    def box(self, x0, y0, x1, y1, c):
        self.d.rectangle([x0, y0, x1, y1], fill=P[c])

    def line(self, pts, c):
        self.d.line(pts, fill=P[c])

    def dot(self, pts, c):
        for p in pts:
            self.d.point(p, fill=P[c])

    def disc(self, x0, y0, x1, y1, c):
        self.d.ellipse([x0, y0, x1, y1], fill=P[c])

    def onto(self, img):
        img.alpha_composite(outline(self.img))
        return img


def window(t, x, y, w=8, h=11, sky="night2", star=True):
    """An arched window in the wall, with the night outside."""
    t.box(x, y + 2, x + w - 1, y + h - 1, sky)
    t.box(x + 1, y + 1, x + w - 2, y + 1, sky)
    t.line([x + w // 2, y + 1, x + w // 2, y + h - 1], "wood2")
    t.line([x, y + h // 2, x + w - 1, y + h // 2], "wood2")
    if star:
        t.dot([(x + 1, y + 3), (x + w - 2, y + h - 3)], "gold5")


def banner(t, x, y, c, light, emblem="gold5"):
    """A hanging banner with a swallowtail and an emblem."""
    t.box(x, y, x + 6, y + 14, c)
    t.line([x, y, x, y + 14], light)
    t.dot([(x + 3, y + 15), (x + 2, y + 14), (x + 4, y + 14)], c)
    t.d.point((x + 3, y + 14), fill=(0, 0, 0, 0))
    t.box(x + 2, y + 5, x + 4, y + 7, emblem)
    t.line([x - 1, y - 1, x + 7, y - 1], "wood1")


def torch(t, x, y):
    t.box(x, y + 3, x + 1, y + 6, "wood2")
    t.dot([(x, y + 2), (x + 1, y + 2), (x, y + 1), (x + 1, y)], "fire1")
    t.dot([(x, y + 2), (x + 1, y + 1)], "fire2")


def keep():
    img = room("night3", "night2", "wood2", "wood1")
    t = Things()
    for x in (14, 89):
        banner(t, x, 3, "azure1", "azure2")
    for x in (34, 74):
        window(t, x, 3)
    t.box(46, 24, 63, 33, "clay1")                                     # the runner up to the throne
    t.line([46, 24, 46, 33], "clay2")
    t.box(48, 8, 61, 24, "wood3")                                      # the throne
    t.box(50, 5, 59, 9, "gold4")
    t.dot([(50, 4), (54, 3), (55, 3), (59, 4)], "gold5")
    t.box(51, 11, 58, 18, "azure1")                                    # its cushion
    t.box(47, 18, 62, 21, "wood2")
    t.line([48, 18, 61, 18], "wood4")
    for x in (28, 80):
        torch(t, x, 10)
    return t.onto(img)


def lodge():
    img = room("wood3", "wood2", "wood1", "ink", planks=True)
    t = Things()
    t.line([8, 10, 32, 10], "wood1")                                   # a bow rack
    for x in (11, 19, 27):                                             # three bows
        t.line([x, 4, x - 2, 9, x - 2, 12, x, 17], "wood4")
        t.line([x, 4, x, 17], "steel4")
    t.box(44, 4, 58, 15, "parch1")                                     # a stretched pelt
    t.dot([(43, 4), (59, 4), (43, 15), (59, 15)], "parch1")
    t.box(46, 6, 56, 13, "parch2")
    t.line([66, 7, 68, 3, 70, 7, 72, 3, 74, 7], "parch3")              # antlers on a plaque
    t.box(68, 7, 72, 11, "wood2")
    t.box(82, 18, 100, 26, "wood2")                                    # a table, a quiver and arrows
    t.line([84, 18, 98, 18], "wood4")
    t.box(86, 10, 89, 17, "green1")
    t.dot([(86, 9), (88, 8), (89, 9)], "parch3")
    t.box(14, 21, 30, 26, "green1")                                    # a bedroll
    t.line([14, 21, 30, 21], "green2")
    return t.onto(img)


def outpost():
    img = room("wood2", "wood1", "wood1", "ink", planks=True)
    t = Things()
    t.box(30, 4, 80, 18, "parch3")                                     # the big map, pinned up
    t.box(30, 4, 80, 4, "parch2")
    t.line([34, 14, 40, 10, 47, 12, 55, 7, 62, 9], "wood2")            # a route, dashed off the edge
    t.dot([(66, 8), (70, 6), (74, 5)], "wood2")
    t.box(44, 12, 50, 15, "green2")                                    # woods and hills drawn on it
    t.box(64, 12, 72, 15, "green2")
    t.dot([(55, 7)], "fire1")
    t.dot([(31, 5), (79, 5), (31, 17), (79, 17)], "steel3")            # pins
    t.box(36, 21, 74, 26, "wood3")                                     # the planning table
    t.line([37, 21, 73, 21], "wood4")
    t.box(44, 19, 52, 20, "parch3")                                    # a rolled chart
    t.box(60, 17, 62, 20, "gold3")                                     # a lantern
    t.dot([(61, 18)], "gold5")
    t.box(88, 18, 102, 26, "wood2")                                    # a supply chest
    t.line([88, 21, 102, 21], "steel2")
    t.dot([(95, 22)], "gold4")
    t.line([12, 4, 12, 26], "wood4")                                   # a waymarker
    t.box(8, 6, 16, 8, "gold3")
    return t.onto(img)


def librarium():
    img = room("shadow2", "shadow1", "wood1", "ink")
    t = Things()
    spines = ["azure1", "green2", "clay2", "teal1", "wood3", "parch2", "azure2", "sea2", "gold3"]
    for x0 in (4, 74):                                                 # two tall shelves of books
        t.box(x0, 1, x0 + 31, 26, "wood1")
        for shelf, y in enumerate((2, 10, 18)):
            x, i = x0 + 1, shelf * 3 + x0
            while x < x0 + 30:
                w = 2 + (i % 2)
                h = 6 - (i % 3 == 0)
                t.box(x, y + 7 - h, x + w - 1, y + 6, spines[i % len(spines)])
                x += w + (i % 5 == 0)
                i += 1
            t.line([x0, y + 7, x0 + 31, y + 7], "wood3")
    window(t, 51, 2, w=8, h=12)
    t.box(42, 20, 68, 26, "wood3")                                     # the reading desk
    t.line([43, 20, 67, 20], "wood4")
    t.box(47, 17, 58, 19, "parch3")                                    # an open tome
    t.line([52, 17, 52, 19], "parch1")
    t.box(62, 15, 63, 19, "parch3")                                    # a candle
    t.dot([(62, 14), (63, 13)], "fire2")
    return t.onto(img)


def forge():
    img = room("ash1", "shadow1", "ash1", "ink")
    t = Things()
    t.box(6, 6, 34, 26, "steel1")                                      # the hearth
    t.box(10, 12, 30, 26, "ink")
    t.box(12, 18, 28, 26, "fire1")                                     # the fire
    t.dot([(14, 17), (17, 15), (20, 16), (24, 14), (26, 17)], "fire1")
    t.box(15, 21, 25, 26, "fire2")
    t.box(18, 24, 22, 26, "fire3")
    t.box(14, 1, 26, 5, "steel1")                                      # its hood
    for x, top in ((46, 6), (52, 4), (58, 7)):                         # tools on the wall
        t.line([x, top, x, top + 10], "wood3")
    t.box(44, 4, 48, 6, "steel3")
    t.box(50, 2, 54, 4, "steel3")
    t.dot([(57, 6), (59, 6), (58, 5)], "steel3")
    t.box(66, 17, 84, 20, "steel2")                                    # the anvil
    t.box(64, 17, 67, 18, "steel2")
    t.box(70, 21, 80, 23, "steel1")
    t.box(68, 24, 82, 26, "steel1")
    t.line([66, 17, 84, 17], "steel4")
    t.box(74, 15, 80, 16, "fire1")                                     # a hot blade on it
    t.box(92, 18, 104, 26, "wood2")                                    # the quench barrel
    t.line([92, 21, 104, 21], "steel1")
    t.box(93, 18, 103, 19, "sea2")
    return t.onto(img)


def garrison():
    img = room("night3", "night2", "wood1", "ink")
    t = Things()
    t.line([6, 12, 40, 12], "wood1")                                   # the spear rack
    for x in range(9, 40, 6):
        t.line([x, 3, x, 26], "wood3")
        t.dot([(x, 2), (x, 1)], "steel4")
    t.line([6, 24, 40, 24], "wood1")
    for cx, c in ((53, "azure1"), (68, "green1")):                     # shields on the wall
        t.disc(cx - 5, 4, cx + 5, 14, "steel2")
        t.disc(cx - 4, 5, cx + 4, 13, c)
        t.box(cx - 1, 8, cx + 1, 10, "gold4")
    t.box(86, 9, 91, 14, "parch2")                                     # a straw dummy
    t.box(83, 15, 94, 22, "parch1")
    t.line([88, 22, 88, 26], "wood3")
    t.line([80, 16, 97, 16], "wood2")
    t.dot([(87, 11), (90, 11)], "wood1")
    t.box(50, 22, 70, 26, "wood2")                                     # a bench
    t.line([51, 22, 69, 22], "wood4")
    torch(t, 100, 6)
    return t.onto(img)


def housing():
    img = room("parch1", "wood3", "wood2", "wood1", planks=True)
    t = Things()
    t.box(8, 4, 30, 26, "ash2")                                        # the hearth
    t.box(12, 14, 26, 26, "ink")
    t.box(14, 20, 24, 26, "fire1")
    t.box(17, 22, 21, 26, "fire2")
    t.line([12, 14, 26, 14], "ash3")
    t.line([19, 9, 19, 16], "steel1")                                  # a pot on its hook
    t.box(16, 16, 22, 19, "steel1")
    window(t, 42, 4, w=10, h=11)
    t.dot([(41, 8), (52, 8)], "green2")                                # flowers on the sill
    t.box(41, 15, 52, 16, "wood3")
    t.box(60, 18, 82, 22, "wood3")                                     # the table, a loaf, a cup
    t.line([61, 18, 81, 18], "wood4")
    t.box(62, 23, 63, 26, "wood2")
    t.box(79, 23, 80, 26, "wood2")
    t.box(65, 15, 70, 17, "gold3")
    t.dot([(66, 15), (69, 15)], "gold4")
    t.box(75, 15, 77, 17, "steel3")
    t.box(88, 16, 106, 26, "wood2")                                    # a bed under a quilt
    t.box(88, 12, 90, 26, "wood3")
    t.box(91, 18, 106, 23, "azure1")
    t.dot([(94, 20), (99, 19), (103, 21)], "azure2")
    t.box(91, 16, 95, 18, "parch3")
    return t.onto(img)


def tower():
    img = room("steel1", "night2", "steel1", "ink")
    t = Things()
    for x in (16, 52, 88):                                             # arrow slits
        t.box(x, 4, x + 1, 16, "night1")
        t.box(x - 1, 9, x + 2, 10, "night1")
    for i in range(7):                                                 # stairs up the wall
        t.box(60 + i * 5, 25 - i * 3, 64 + i * 5, 26 - i * 3, "steel2")
        t.line([60 + i * 5, 25 - i * 3, 64 + i * 5, 25 - i * 3], "steel3")
    t.box(24, 18, 32, 26, "wood2")                                     # a barrel of arrows
    t.line([24, 21, 32, 21], "steel1")
    for x in (25, 27, 29, 31):
        t.line([x, 13, x, 17], "wood4")
        t.dot([(x, 12)], "parch3")
    t.box(36, 20, 48, 26, "wood3")                                     # a crate of stones
    t.dot([(38, 19), (41, 19), (44, 19), (46, 19)], "ash3")
    torch(t, 4, 8)
    return t.onto(img)


def wizard_tower():
    img = room("night2", "night1", "wood1", "ink")
    t = Things()
    t.disc(4, 2, 30, 26, "azure1")                                     # a star chart
    t.disc(6, 4, 28, 24, "night1")
    t.dot([(10, 9), (14, 6), (20, 8), (24, 13), (17, 14), (12, 18), (22, 20), (9, 14)], "gold5")
    t.line([10, 9, 14, 6, 20, 8, 24, 13], "azure2")
    t.box(40, 3, 64, 18, "wood1")                                      # shelves of jars
    for y in (3, 11):
        t.line([40, y + 7, 64, y + 7], "wood3")
        for x, c in ((42, "teal3"), (47, "azure3"), (52, "gold4"), (57, "sea3"), (61, "emerald3")):
            t.box(x, y + 3, x + 2, y + 6, c)
            t.dot([(x + 1, y + 2)], "steel3")
    t.disc(72, 18, 88, 27, "steel1")                                   # the cauldron, glowing teal
    t.box(73, 18, 87, 20, "teal2")
    t.dot([(76, 16), (80, 14), (84, 16), (79, 11)], "teal3")
    t.line([74, 27, 72, 30], "steel1")
    t.line([86, 27, 88, 30], "steel1")
    t.line([96, 26, 100, 14], "wood3")                                 # a telescope on its stand
    t.line([104, 26, 100, 14], "wood3")
    t.box(94, 8, 107, 11, "gold3")
    t.line([94, 8, 107, 8], "gold5")
    return t.onto(img)


HEADERS = {"keep": keep, "lodge": lodge, "outpost": outpost, "librarium": librarium, "forge": forge,
           "garrison": garrison, "housing": housing, "tower": tower, "wizard-tower": wizard_tower}


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    for name, f in HEADERS.items():
        img = f()
        img.save(OUT / f"int_{name}_v1.png")
        upscale(img, 4).save(PREVIEW / f"int_{name}_v1_x4.png")
    print(len(HEADERS), "headers")


if __name__ == "__main__":
    main()
