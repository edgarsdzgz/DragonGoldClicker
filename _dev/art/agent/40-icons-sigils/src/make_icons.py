"""Sigils and icons, v1, 2026-10-27: what the app still draws without pixel art.

- Five sigils (10x10, the locked cast sigils' style, 30-cast) for the new busts: Varn a cracked egg,
  Ashara her burning eye, Thornwick his hat, Sera her shield, the Hollow Knight an empty helm.
- Two study icons (12x12, the icon_res_* style): Cartography (a chart and dividers) and Keen Scouts
  (a spyglass).
- Six interface icons (12x12) for the glyphs left: warning, wallet (a purse), business (a market stall),
  hand-left (an open hand), speedometer (a gauge), phone-portrait (a phone).

Each is a grid of palette letters, outlined in ink; light from the upper left. Red stays for danger, so
the warning is gold.

Run: python src/make_icons.py
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from pixkit import PALETTE, outline, upscale  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"


def grid(rows, key):
    """Rows of letters ('.' is clear) to an outlined image."""
    img = Image.new("RGBA", (len(rows[0]), len(rows)), (0, 0, 0, 0))
    for y, row in enumerate(rows):
        assert len(row) == img.width, (row, img.width)
        for x, ch in enumerate(row):
            if ch != ".":
                img.putpixel((x, y), PALETTE[key[ch]] + (255,))
    return outline(img)


# --- Sigils, 10x10 ----------------------------------------------------------------------------------

SIGILS = {
    "cast_sigil-varn": (["..........",
                         "....LM....",
                         "...LMMM...",
                         "..LMMMMm..",
                         ".LMkMkMkm.",
                         ".LkMkMkMm.",
                         ".LMMMMMMm.",
                         "..MMMMMm..",
                         "...mmmm...",
                         ".........."],
                        {"L": "emerald3", "M": "emerald2", "m": "emerald1", "k": "ink"}),
    "cast_sigil-ashara": (["..........",
                           "..........",
                           "...aaaa...",
                           "..aFFkFA..",
                           ".aHFFkFFA.",
                           ".AFFFkFFA.",
                           "..AffkfA..",
                           "...AAAA...",
                           "..........",
                           ".........."],
                          {"a": "ash3", "A": "ash2", "F": "fire2", "H": "fire3", "f": "fire1", "k": "ink"}),
    "cast_sigil-thornwick": (["..........",
                              "......tt..",
                              "......h...",
                              ".....hH...",
                              "....hHHd..",
                              "...hHHHd..",
                              "...GGGGG..",
                              ".bBBBBBBB.",
                              "..........",
                              ".........."],
                             {"t": "ash1", "h": "azure2", "H": "azure1", "d": "night2", "G": "gold4",
                              "b": "azure2", "B": "azure1"}),
    "cast_sigil-sera": (["..........",
                         "...SSSS...",
                         "..SwwWWS..",
                         ".SwWWWWWs.",
                         ".SWWgGWWs.",
                         ".SWWGGWWs.",
                         ".SWWWWWWs.",
                         "..sWWWWs..",
                         "...ssss...",
                         ".........."],
                        {"S": "steel4", "s": "steel2", "w": "wood4", "W": "wood3", "g": "gold5", "G": "gold4"}),
    "cast_sigil-hollow-knight": (["..........",
                                  "...hHHH...",
                                  "..hHHHHs..",
                                  ".hHHHHHHs.",
                                  ".hkkkkkks.",
                                  ".hHHkkHHs.",
                                  ".hHHkkHHs.",
                                  ".hHHHHHHs.",
                                  "..sssss...",
                                  ".........."],
                                 {"h": "steel4", "H": "steel3", "s": "steel2", "k": "ink"}),
}


# --- Icons, 12x12 -----------------------------------------------------------------------------------

def drawn(size, paint):
    """An icon drawn by a function into a cells dict, then outlined."""
    cells = {}
    paint(cells)
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    for (x, y), c in cells.items():
        img.putpixel((x, y), PALETTE[c] + (255,))
    return outline(img)


def line(cells, a, b, c):
    (x0, y0), (x1, y1) = a, b
    n = max(abs(x1 - x0), abs(y1 - y0))
    for i in range(n + 1):
        cells[(round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n))] = c


def cartography(cells):
    """A chart being drawn: parchment with a dashed route, the dividers standing on it."""
    for y in range(3, 11):
        for x in range(1, 9):
            cells[(x, y)] = "parch3"
    for x in range(1, 9):
        cells[(x, 3)] = "parch2"
    for y in range(3, 11):
        cells[(8, y)] = "parch2"
    for x, y in ((2, 9), (3, 8), (5, 7), (6, 6)):
        cells[(x, y)] = "wood2"
    cells[(4, 5)] = "green2"
    cells[(3, 5)] = "green2"
    cells[(7, 5)] = "gold4"
    line(cells, (7, 1), (4, 10), "steel4")                           # the dividers, legs apart
    line(cells, (8, 1), (10, 10), "steel2")
    cells[(7, 1)] = cells[(8, 1)] = "gold4"


def keen_scouts(cells):
    """A brass spyglass, raised: the eyepiece low at the left, the lens high at the right."""
    for i in range(8):
        x, y = 2 + i, 9 - i
        c = "wood1" if i == 3 else ("gold5" if i < 3 else "gold4")
        cells[(x, y)] = c
        cells[(x + 1, y)] = "gold3" if i != 3 else "wood1"
        if i >= 1:
            cells[(x, y - 1)] = "wood1" if i == 3 else "gold5"
    cells[(9, 1)] = "steel5"
    cells[(10, 1)] = cells[(10, 2)] = "sea3"
    cells[(9, 2)] = "sea3"


def warning(cells):
    """A gold warning triangle with a mark."""
    for y in range(1, 11):
        for x in range(1, 11):
            if abs(x - 5.5) <= (y - 1) * 0.5 + 0.5:
                cells[(x, y)] = "gold5" if x <= 5 and y < 9 else "gold4"
    for y in range(4, 8):
        cells[(5, y)] = cells[(6, y)] = "ink"
    cells[(5, 9)] = cells[(6, 9)] = "ink"


def purse(cells):
    """A leather coin purse, tied with a gold cord, a coin beside it."""
    for y, (x0, x1) in zip(range(1, 11), ((3, 4), (2, 7), (4, 6), (3, 7), (2, 8), (1, 8), (1, 8), (1, 8), (2, 7), (3, 6))):
        for x in range(x0, x1 + 1):
            cells[(x, y)] = "wood3"
    for x in range(3, 8):
        cells[(x, 3)] = "gold4"
    for y in range(5, 9):
        cells[(2, y)] = "wood4"
    for y in range(4, 10):
        cells[(8 if y < 9 else 7, y)] = "wood2"
    for x, y in ((9, 7), (10, 7), (9, 8), (10, 8)):
        cells[(x, y)] = "gold5" if (x, y) == (9, 7) else "gold4"
    cells[(9, 9)] = cells[(10, 9)] = "gold3"


def market(cells):
    """A market stall: a striped awning, two posts, a counter with goods."""
    for x in range(1, 11):
        for y in (2, 3, 4):
            cells[(x, y)] = "teal2" if (x // 2) % 2 == 0 else "parch3"
        if x % 2:
            cells[(x, 5)] = "teal2" if (x // 2) % 2 == 0 else "parch3"
    for y in range(5, 11):
        cells[(2, y)] = cells[(9, y)] = "wood2"
    for x in range(1, 11):
        cells[(x, 8)] = "wood4"
        cells[(x, 9)] = "wood3"
    for x, c in ((3, "gold4"), (4, "green3"), (6, "clay3"), (7, "gold4")):
        cells[(x, 7)] = c


def hand(cells):
    """An open hand, palm out, fingers up."""
    for x, top in ((3, 3), (5, 1), (7, 1), (9, 3)):
        for y in range(top, 6):
            cells[(x, y)] = "skin3" if x < 7 else "skin2"
    for y in range(5, 11):
        for x in range(3, 10):
            cells[(x, y)] = "skin2"
    for y in range(5, 11):
        cells[(3, y)] = "skin3"
        cells[(9, y)] = "skin1"
    for x, y in ((1, 6), (2, 6), (1, 7), (2, 7), (2, 8)):
        cells[(x, y)] = "skin3"


def gauge(cells):
    """A gauge: a pale dial in a steel rim, its needle swung over to the right."""
    for y in range(2, 10):
        for x in range(1, 11):
            d = ((x - 5.5) ** 2 + (y - 9) ** 2) ** 0.5
            if d <= 5.2:
                cells[(x, y)] = "steel3" if d > 4.1 else "parch3"
    for x, y in ((3, 6), (5, 5), (7, 5), (8, 6)):
        cells[(x, y)] = "wood2"
    line(cells, (5, 9), (8, 5), "ink")
    for x in range(1, 11):
        cells[(x, 10)] = "steel2"
    cells[(5, 9)] = cells[(6, 9)] = "gold4"


def phone(cells):
    """A phone, upright: a dark body, a lit screen, a button."""
    for y in range(1, 11):
        for x in range(3, 9):
            cells[(x, y)] = "night2"
    for y in range(2, 9):
        for x in range(4, 8):
            cells[(x, y)] = "sea2"
    cells[(4, 2)] = cells[(5, 2)] = cells[(4, 3)] = "sea3"
    cells[(5, 9)] = cells[(6, 9)] = "steel4"
    for y in range(1, 11):
        cells[(3, y)] = "night3"


ICONS = {"icon_res_cartography": cartography, "icon_res_keen_scouts": keen_scouts, "icon_warning": warning,
         "icon_purse": purse, "icon_market": market, "icon_hand": hand, "icon_gauge": gauge, "icon_phone": phone}


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    for name, (rows, key) in SIGILS.items():
        img = grid(rows, key)
        img.save(OUT / f"{name}_v1.png")
        upscale(img, 8).save(PREVIEW / f"{name}_v1_x8.png")
    for name, paint in ICONS.items():
        img = drawn((12, 12), paint)
        img.save(OUT / f"{name}_v1.png")
        upscale(img, 8).save(PREVIEW / f"{name}_v1_x8.png")
    print(len(SIGILS) + len(ICONS), "pieces")


if __name__ == "__main__":
    main()
