"""The heartstone pendant, 2026-10-27 (owner: "Let's draw the heartstone, please").

From the lore (dragonIdler docs/Draconia_Lore_Compendium.md, "The Arcana Pendants"): a core of
aetherglass, a crystal grown from condensed dragonfire, holding a droplet of the wearer's heart-flame,
set in silver-gold rune filigree. "The Pendants we wear are not weapons, but hearts."

So each option is pale glass with a flame burning inside, in a gold setting hung from a loop. The flame is
orange and gold, not red (red is kept for danger). Four shapes, each at the icon set's 12x12 and at 16x16,
outlined in ink and lit from the upper left.

Run: python src/make_heartstone.py
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from pixkit import PALETTE, outline, upscale  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"


def draw(size, cells):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    for (x, y), c in cells.items():
        img.putpixel((x, y), PALETTE[c] + (255,))
    return outline(img)


def stone(size, rows, flame, cap_row, bail_rows):
    """A stone from symmetric row spans [(y, half-width)], glass shaded light on the upper left; a flame of
    (x, y, color) cells inside; a gold cap row on top of the stone and a gold bail (loop) above it."""
    c = (size - 1) / 2
    cells = {}
    for y, half in rows:
        for x in range(size):
            if abs(x - c) <= half:
                cells[(x, y)] = "teal3" if (x - c) + (y - rows[0][0]) * 0.6 < -half + 1.5 else "teal2"
                if x - c > half - 1:
                    cells[(x, y)] = "teal1"                               # the shaded right edge
    for x in range(size):                                                 # the gold cap
        if abs(x - c) <= max(1.5, rows[0][1] + 0.5):
            cells[(x, cap_row)] = "gold4" if x - c < 0.5 else "gold3"
    for y, xs in bail_rows:                                               # the loop
        for x in xs:
            cells[(x, y)] = "gold5" if x < c else "gold4"
    for x, y, col in flame:
        cells[(x, y)] = col
    return draw(size, cells)


# 12x12 options -----------------------------------------------------------------------------------------

def teardrop12():
    rows = [(3, 2.5), (4, 3.5), (5, 3.5), (6, 3.5), (7, 2.5), (8, 1.5), (9, 0.5), (10, 0.5)]
    flame = [(6, 4, "fire1"), (5, 5, "fire1"), (6, 5, "fire2"), (5, 6, "fire2"), (6, 6, "fire3"),
             (5, 7, "fire2"), (6, 7, "fire2")]
    return stone(12, rows, flame, 2, [(1, (5, 6))])


def round12():
    rows = [(3, 1.5), (4, 2.5), (5, 3.5), (6, 3.5), (7, 3.5), (8, 3.5), (9, 2.5), (10, 1.5)]
    flame = [(6, 5, "fire1"), (5, 6, "fire1"), (6, 6, "fire2"), (5, 7, "fire2"), (6, 7, "fire3"),
             (5, 8, "fire1"), (6, 8, "fire2")]
    img = stone(12, rows, flame, 2, [(1, (5, 6))])
    px = img.load()
    for x, y in ((2, 5), (2, 8), (9, 5), (9, 8)):                         # gold filigree studs on the rim
        px[x, y] = PALETTE["gold4"] + (255,)
    return img


def diamond12():
    rows = [(3, 0.5), (4, 1.5), (5, 2.5), (6, 3.5), (7, 2.5), (8, 1.5), (9, 0.5)]
    flame = [(5, 5, "fire1"), (6, 5, "fire2"), (5, 6, "fire2"), (6, 6, "fire3"), (5, 7, "fire1"), (6, 7, "fire2")]
    img = stone(12, rows, flame, 2, [(1, (5, 6))])
    px = img.load()
    for x in (5, 6):                                                      # a gold point below
        px[x, 10] = PALETTE["gold3"] + (255,)
    return outline(img)


def heart12():
    cells = {}
    shape = {3: [(1, 4), (7, 10)], 4: [(1, 10)], 5: [(1, 10)], 6: [(1, 10)], 7: [(2, 9)], 8: [(3, 8)], 9: [(4, 7)],
             10: [(5, 6)]}
    for y, spans in shape.items():
        for x0, x1 in spans:
            for x in range(x0, x1 + 1):
                cells[(x, y)] = "teal3" if x + y < 8 else "teal1" if x >= 9 or (x >= 8 and y >= 7) else "teal2"
    for x, y, col in ((6, 4, "fire1"), (5, 5, "fire1"), (6, 5, "fire2"), (5, 6, "fire2"), (6, 6, "fire3"),
                      (5, 7, "fire2"), (6, 7, "fire2")):
        cells[(x, y)] = col
    cells[(5, 1)], cells[(6, 1)] = "gold5", "gold4"                       # the loop, above the notch
    return draw(12, cells)


# 16x16 versions ----------------------------------------------------------------------------------------

def teardrop16():
    rows = [(4, 3.5), (5, 4.5), (6, 5.5), (7, 5.5), (8, 5.5), (9, 4.5), (10, 3.5), (11, 2.5), (12, 1.5),
            (13, 0.5), (14, 0.5)]
    flame = [(8, 5, "fire1"), (7, 6, "fire1"), (8, 6, "fire2"), (7, 7, "fire2"), (8, 7, "fire2"),
             (6, 8, "fire1"), (7, 8, "fire3"), (8, 8, "fire3"), (9, 8, "fire1"), (7, 9, "fire2"),
             (8, 9, "fire2"), (7, 10, "fire1"), (8, 10, "fire1")]
    return stone(16, rows, flame, 3, [(1, (7, 8)), (2, (6, 9))])


def round16():
    rows = [(4, 2.5), (5, 3.5), (6, 4.5), (7, 5.5), (8, 5.5), (9, 5.5), (10, 5.5), (11, 5.5), (12, 4.5),
            (13, 3.5), (14, 2.5)]
    flame = [(8, 6, "fire1"), (7, 7, "fire1"), (8, 7, "fire2"), (7, 8, "fire2"), (8, 8, "fire3"),
             (6, 9, "fire1"), (7, 9, "fire3"), (8, 9, "fire3"), (9, 9, "fire1"), (7, 10, "fire2"),
             (8, 10, "fire2"), (7, 11, "fire1"), (8, 11, "fire1")]
    img = stone(16, rows, flame, 3, [(1, (7, 8)), (2, (6, 9))])
    px = img.load()
    for x, y in ((2, 7), (2, 11), (13, 7), (13, 11), (4, 13), (11, 13)):  # filigree studs on the rim
        px[x, y] = PALETTE["gold4"] + (255,)
    return img


def diamond16():
    rows = [(4, 0.5), (5, 1.5), (6, 2.5), (7, 3.5), (8, 4.5), (9, 5.5), (10, 4.5), (11, 3.5), (12, 2.5),
            (13, 1.5), (14, 0.5)]
    flame = [(8, 7, "fire1"), (7, 8, "fire1"), (8, 8, "fire2"), (7, 9, "fire3"), (8, 9, "fire3"),
             (7, 10, "fire2"), (8, 10, "fire2"), (7, 11, "fire1"), (8, 11, "fire1")]
    return stone(16, rows, flame, 3, [(1, (7, 8)), (2, (6, 9))])


def heart16():
    cells = {}
    shape = {4: [(2, 6), (9, 13)], 5: [(1, 6), (9, 14)], 6: [(1, 14)], 7: [(1, 14)], 8: [(1, 14)], 9: [(2, 13)],
             10: [(3, 12)], 11: [(4, 11)], 12: [(5, 10)], 13: [(6, 9)], 14: [(7, 8)]}
    for y, spans in shape.items():
        for x0, x1 in spans:
            for x in range(x0, x1 + 1):
                cells[(x, y)] = "teal3" if x + y < 10 else "teal1" if x >= 13 or (x >= 11 and y >= 9) else "teal2"
    for x, y, col in ((8, 6, "fire1"), (7, 7, "fire1"), (8, 7, "fire2"), (7, 8, "fire2"), (8, 8, "fire3"),
                      (6, 9, "fire1"), (7, 9, "fire3"), (8, 9, "fire3"), (9, 9, "fire1"), (7, 10, "fire2"),
                      (8, 10, "fire2"), (7, 11, "fire1"), (8, 11, "fire1")):
        cells[(x, y)] = col
    cells[(7, 5)] = cells[(8, 5)] = "gold4"                               # a gold clasp in the notch
    cells[(7, 1)], cells[(8, 1)], cells[(7, 2)], cells[(8, 2)] = "gold5", "gold4", "gold5", "gold4"   # the loop
    return draw(16, cells)


OPTIONS = {"teardrop": (teardrop12, teardrop16), "round": (round12, round16),
           "diamond": (diamond12, diamond16), "heart": (heart12, heart16)}


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    for name, (f12, f16) in OPTIONS.items():
        for size, f in ((12, f12), (16, f16)):
            img = f()
            img.save(OUT / f"icon_heartstone-{name}_{size}.png")
            upscale(img, 8).save(PREVIEW / f"icon_heartstone-{name}_{size}_x8.png")
    print(len(OPTIONS) * 2, "icons")


if __name__ == "__main__":
    main()
