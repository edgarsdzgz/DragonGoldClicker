"""The ten building icons, 16 x 16: each building's finished look, small, for sheets and lists.

Run: python icons.py  (writes ../out/icon_bld-<id>.png and ../preview/icons_x6.png)
"""
import pathlib

from PIL import Image

from kit import CLAY_ROOF, MOSS_ROOF, SLATE_ROOF, THATCH_ROOF, WARM_STONE, Canvas, pixkit

OUT = pathlib.Path(__file__).resolve().parents[1] / "out"
PREVIEW = OUT.parent / "preview"
ICONS = {}


def icon(bid):
    def wrap(fn):
        ICONS[bid] = fn
        return fn
    return wrap


@icon("keep")
def keep():
    c = Canvas(16, 16)
    c.stone_wall(6, 5, 9, 14, block=3, course=3)
    c.stone_wall(1, 8, 4, 14, block=3, course=3)
    c.stone_wall(11, 8, 14, 14, block=3, course=3)
    c.stone_wall(5, 10, 10, 14, block=3, course=3)
    c.merlons(1, 4, 7, width=1, gap=1, tall=1)
    c.merlons(11, 14, 7, width=1, gap=1, tall=1)
    c.cone(8, 4, 3, 4, CLAY_ROOF)
    c.door(7, 12, 2, 3, arch=False)
    c.window(7, 7, 1, 1)
    return c.finish()


@icon("garrison")
def garrison():
    c = Canvas(16, 16)
    c.stone_wall(1, 9, 10, 14, block=4, course=3)
    c.hip(1, 10, 8, 3, CLAY_ROOF)
    c.stone_wall(11, 4, 14, 14, block=3, course=3)
    c.merlons(11, 14, 3, width=1, gap=1, tall=1)
    c.ink_v(10, 9, 14)
    c.door(5, 11, 2, 4, arch=False)
    c.window(12, 7, 1, 1)
    c.put(13, 0, "clay3")
    c.put(12, 0, "wood2")
    c.put(12, 1, "wood2")
    return c.finish()


@icon("forge")
def forge():
    c = Canvas(16, 16)
    c.stone_wall(1, 8, 10, 14, WARM_STONE, block=4, course=3)
    c.hip(1, 11, 7, 3, SLATE_ROOF)
    c.stone_wall(11, 2, 14, 14, block=3, course=3)
    c.ink_v(10, 2, 14)
    for x, y, n in ((3, 11, "fire1"), (4, 11, "fire1"), (3, 12, "fire2"), (4, 12, "fire2"),
                    (3, 13, "fire3"), (4, 13, "fire2"), (5, 12, "fire1"), (5, 13, "fire2")):
        c.put(x, y, n)
    c.put(12, 1, "fire1")
    c.put(13, 1, "fire2")
    return c.finish()


@icon("lodge")
def lodge():
    c = Canvas(16, 16)
    c.log_wall(2, 9, 13, 14)
    c.gable(8, 8, 7, 5, MOSS_ROOF)
    c.door(7, 11, 2, 4, arch=False, pal=("wood2", "wood1"))
    c.window(3, 11, 1, 1)
    c.window(12, 11, 1, 1)
    for x, y in ((6, 3), (5, 2), (10, 3), (11, 2)):  # antlers over the gable
        c.put(x, y, "parch3")
    return c.finish()


@icon("outpost")
def outpost():
    c = Canvas(16, 16)
    for x in (4, 11):
        for y in range(8, 15):
            c.put(x, y, "wood4")
    for i in range(6):
        c.put(5 + i, 9 + i, "wood3")
        c.put(10 - i, 9 + i, "wood3")
    c.rect(2, 7, 13, 7, "wood4")
    for x in (2, 13):
        c.put(x, 6, "wood3")
    c.gable(8, 5, 7, 4, THATCH_ROOF)
    c.put(6, 6, "gold5")
    return c.finish()


@icon("librarium")
def librarium():
    c = Canvas(16, 16)
    c.stone_wall(3, 8, 12, 14, block=4, course=3)
    c.stone_wall(1, 6, 2, 14, block=3, course=3)
    c.stone_wall(13, 6, 14, 14, block=3, course=3)
    c.gable(8, 7, 5, 5, SLATE_ROOF)
    c.cone(2, 5, 1.5, 4, SLATE_ROOF)
    c.cone(14, 5, 1.5, 4, SLATE_ROOF)
    for x in (5, 7, 10):
        c.window(x, 9, 1, 3)
    return c.finish()


@icon("housing")
def housing():
    c = Canvas(16, 16)
    c.timber_wall(3, 9, 12, 14)
    c.gable(8, 8, 6, 5, CLAY_ROOF)
    c.stone_wall(10, 3, 11, 5, block=2, course=2)
    c.door(7, 11, 2, 4, arch=False)
    c.window(4, 10, 2, 2)
    c.window(10, 10, 2, 2)
    return c.finish()


@icon("wizard-tower")
def wizard_tower():
    c = Canvas(16, 16)
    c.stone_wall(5, 7, 10, 14, block=3, course=3)
    c.cone(8, 6, 4, 6, ("night4", "night3", "night2"))
    c.window(7, 9, 2, 2)
    c.put(7, 0, "gold6")
    c.put(8, 0, "gold5")
    return c.finish()


def wall_tower(banner_x):
    c = Canvas(16, 16)
    c.stone_wall(4, 6, 11, 14, block=3, course=3)
    c.merlons(4, 11, 5, width=1, gap=1, tall=1)
    c.rect(6, 3, 9, 3, "steel2")
    c.put(7, 2, "fire1")
    c.put(8, 2, "fire2")
    c.put(8, 1, "fire3")
    c.put(7, 1, "fire2")
    c.window(7, 9, 2, 2)
    c.put(banner_x, 7, "clay3")
    c.put(banner_x, 8, "clay3")
    c.put(banner_x, 9, "clay1")
    return c.finish()


@icon("tower-west")
def tower_west():
    return wall_tower(5)


@icon("tower-east")
def tower_east():
    return wall_tower(10)


if __name__ == "__main__":
    imgs = []
    for bid, fn in ICONS.items():
        img = fn()
        img.save(OUT / f"icon_bld-{bid}.png")
        imgs.append(img)
    official = sorted((OUT.parents[2] / "official" / "icons").glob("icon_*.png"))[:12]
    rows = [("Buildings", imgs), ("Official", [Image.open(p).convert("RGBA") for p in official])]
    pixkit.contact_sheet(rows, scale=6).save(PREVIEW / "icons_x6.png")
    print(len(imgs), "icons written")
