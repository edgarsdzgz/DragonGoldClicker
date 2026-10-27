"""Batch 8: Cast extras, 2026-10-27.

- The five sigils at 10x10, from the mockup's own glyphs (_dev/mockups/v1/Cast.dc.html): Pyreth's ember,
  Rodain's crossed spears, Mirael's compass star, Kael's anvil, Lirae's quill. Each shape is pulled in
  by a pixel so its ink outline fits inside the 10x10.
- The Gate of Draconia's emblem at 44x46, in a bust's slot: the prologue's narrator is the gate itself,
  so it shows the gatehouse, front-on, its arch glowing as if it speaks. Not a face.

Run: python src/make_cast.py
"""
import pathlib
import sys

from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from pixkit import PALETTE, outline, upscale  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
P = {k: v + (255,) for k, v in PALETTE.items()}


def paint(size, cells):
    """An image from {(x, y): palette name}, outlined in ink."""
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    for xy, c in cells.items():
        img.putpixel(xy, P[c])
    return outline(img)


def ember():
    """A gold diamond, lit at the top left, its lower edge glowing orange."""
    cells = {}
    for y in range(1, 9):
        half = 4 - abs(y - 4.5) + 0.5
        for x in range(10):
            if abs(x - 4.5) < half:
                upper = x + y < 11
                cells[(x, y)] = "gold6" if (x, y) in ((4, 2), (3, 3), (4, 3)) else "gold5" if upper else "fire1"
    return paint((10, 10), cells)


def crossed_spears():
    """Two spears crossed: steel heads at the top corners, wooden shafts."""
    cells = {}
    for i in range(1, 9):
        for x, y in ((i, i), (9 - i, i)):
            if 0 < x < 9:
                cells[(x, y)] = "steel5" if i <= 2 else "wood3"
    return paint((10, 10), cells)


def compass_star():
    """A four-pointed star, gold, its center dark."""
    cells = {}
    for y in range(1, 9):
        for x in range(1, 9):
            arm = (x in (4, 5) and 1 <= y <= 8) or (y in (4, 5) and 1 <= x <= 8)
            core = 3 <= x <= 6 and 3 <= y <= 6 and abs(x - 4.5) + abs(y - 4.5) < 3
            if arm or core:
                cells[(x, y)] = "gold5" if x <= 4 and y <= 4 else "gold4"
    for xy in ((4, 4), (5, 4), (4, 5), (5, 5)):
        cells[xy] = "night1"
    return paint((10, 10), cells)


def anvil():
    """An anvil: a long face with a horn to the left, a narrow waist, a wide foot."""
    cells = {}
    for x in range(1, 9):
        cells[(x, 2)] = "steel5"
    for x in range(2, 8):
        cells[(x, 3)] = "steel3"
    for y in (4, 5):
        for x in (4, 5):
            cells[(x, y)] = "steel2"
    for y in (6, 7):
        for x in range(3, 7):
            cells[(x, y)] = "steel3" if y == 6 else "steel2"
    return paint((10, 10), cells)


def quill():
    """A quill: the feather's vane down from the top right, its nib dipped in ink at the bottom left."""
    cells = {}
    for i in range(6):
        cx, cy = 7 - i, 1 + i
        cells[(cx, cy)] = "parch3"
        if i < 4:
            cells[(cx + 1, cy)] = "parch2" if i else "parch3"
    cells[(8, 1)] = "parch3"
    cells[(2, 7)] = "night4"
    cells[(1, 8)] = "night3"
    return paint((10, 10), cells)


def gate_emblem():
    """The Gate of Draconia, 44x46: two towers and a gatehouse in the wall's stone, gold-lit arrow slits,
    gold banners, and the arch glowing gold behind a dark portcullis."""
    W, H = 44, 46
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    def merlons(x0, x1, y):
        for x in range(x0, x1 + 1, 4):
            d.rectangle([x, y, min(x + 2, x1), y + 2], fill=P["night3"])

    # The towers, then the gatehouse between them, a step lower.
    for x0, x1 in ((1, 12), (31, 42)):
        merlons(x0, x1, 3)
        d.rectangle([x0, 6, x1, H - 1], fill=P["night3"])
        d.line([x0, 6, x0, H - 1], fill=P["night4"])                    # lit left edge
        d.line([x1, 6, x1, H - 1], fill=P["night2"])
        for y in (14, 24, 34):                                          # a few stone courses
            d.line([x0 + 1, y, x1 - 1, y], fill=P["night2"])
        d.rectangle([x0 + 5, 9, x0 + 6, 12], fill=P["gold5"])           # lit arrow slits
        d.rectangle([x0 + 5, 18, x0 + 6, 21], fill=P["gold4"])
    merlons(13, 30, 10)
    d.rectangle([13, 13, 30, H - 1], fill=P["night3"])
    d.line([13, 13, 30, 13], fill=P["night4"])
    for y in (19, 31, 39):
        d.line([13, y, 30, y], fill=P["night2"])

    # The arch: glowing gold within, stepping darker toward the bottom, behind the portcullis.
    d.rectangle([16, 26, 27, H - 1], fill=P["gold4"])
    d.ellipse([16, 20, 27, 31], fill=P["gold5"])
    d.rectangle([16, 34, 27, H - 1], fill=P["gold3"])
    d.ellipse([18, 22, 25, 29], fill=P["gold6"])
    for x in (17, 20, 23, 26):                                          # the portcullis
        d.line([x, 23 if x in (20, 23) else 26, x, H - 1], fill=P["night1"])
    for y in (30, 37):
        d.line([16, y, 27, y], fill=P["night1"])
    d.arc([15, 19, 28, 32], 180, 360, fill=P["night4"])                  # the arch's stone ring

    # Gold banners on the towers' inner faces.
    for x in (8, 32):
        d.rectangle([x, 26, x + 3, 36], fill=P["gold4"])
        d.line([x, 26, x, 36], fill=P["gold5"])
        d.polygon([(x, 37), (x + 3, 37), (x + 3, 39), (x + 1, 38), (x, 39)], fill=P["gold4"])
        d.rectangle([x + 1, 29, x + 2, 31], fill=P["fire1"])             # an ember on each
    return outline(img)


ART = {"cast_sigil-pyreth": ember, "cast_sigil-rodain": crossed_spears, "cast_sigil-mirael": compass_star,
       "cast_sigil-kael": anvil, "cast_sigil-lirae": quill, "cast_emblem-gate": gate_emblem}


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    for name, f in ART.items():
        img = f()
        img.save(OUT / f"{name}.png")
        upscale(img, 4).save(PREVIEW / f"{name}_x4.png")
    print(len(ART), "files")


if __name__ == "__main__":
    main()
