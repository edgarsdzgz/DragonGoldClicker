"""The granary, 32x32, at empty, half and full.

A timber store raised on stone staddles under a thatch roof. The building never
changes; the doorway's grain and the sacks in front show how full the stores are.
Light from the upper left.
"""
from PIL import Image, ImageDraw

from pixkit import PALETTE, from_grid, outline

P = {k: v + (255,) for k, v in PALETTE.items()}
W = H = 32

SACK = from_grid([
    "..aaa..",
    "..aba..",
    ".aabaa.",
    "abbccda",
    "abcccda",
    "abccdda",
    ".aaaaa.",
], {"a": "ink", "b": "parch3", "c": "parch2", "d": "parch1"})


def base():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Staddle stones: stem, then the mushroom cap.
    for cx in (8, 16, 23):
        d.rectangle([cx - 1, 26, cx + 1, 30], fill=P["steel2"])
        d.line([cx - 1, 26, cx - 1, 30], fill=P["steel3"])
        d.line([cx + 1, 26, cx + 1, 30], fill=P["steel1"])
        d.rectangle([cx - 3, 24, cx + 3, 25], fill=P["steel2"])
        d.line([cx - 3, 24, cx + 2, 24], fill=P["steel3"])
        d.line([cx - 2, 25, cx + 3, 25], fill=P["steel1"])
    # Floor beam.
    d.rectangle([4, 22, 27, 23], fill=P["wood2"])
    d.line([4, 22, 27, 22], fill=P["wood3"])
    # Plank walls; the top row sits in the eave's shadow.
    d.rectangle([5, 12, 26, 21], fill=P["wood4"])
    d.line([5, 12, 26, 12], fill=P["wood2"])
    for x in (9, 21, 25):
        d.line([x, 13, x, 21], fill=P["wood3"])
    d.line([6, 13, 6, 21], fill=P["clay3"])  # lit left edge
    # Doorway with a frame.
    d.rectangle([12, 14, 19, 21], fill=P["wood2"])
    d.rectangle([13, 15, 18, 21], fill=P["night1"])
    # Thatch roof: hipped, lit on the left slope.
    d.polygon([(13, 2), (18, 2), (29, 11), (2, 11)], fill=P["gold3"])
    d.polygon([(13, 2), (15, 2), (15, 10), (4, 10)], fill=P["gold4"])
    d.polygon([(18, 2), (19, 2), (28, 10), (22, 10)], fill=P["gold2"])
    d.line([13, 2, 18, 2], fill=P["gold5"])
    d.line([2, 11, 29, 11], fill=P["gold2"])
    for x in (8, 12, 19, 23):  # a few straw strands, not texture
        d.line([x, 8, x, 10], fill=P["gold2"])
    return outline(img)


def fill_door(img, top):
    """Grain heaped in the doorway from row `top` down to the floor."""
    d = ImageDraw.Draw(img)
    d.rectangle([13, top, 18, 21], fill=P["gold4"])
    d.line([13, top, 18, top], fill=P["gold5"])
    d.line([18, top + 1, 18, 21], fill=P["gold3"])


def granary(level):
    img = base()
    if level == 50:
        fill_door(img, 18)
        for xy in ((1, 25), (6, 25)):
            img.alpha_composite(SACK, xy)
    elif level == 100:
        fill_door(img, 15)
        for xy in ((0, 25), (5, 25), (3, 20), (24, 25)):
            img.alpha_composite(SACK, xy)
    return img
