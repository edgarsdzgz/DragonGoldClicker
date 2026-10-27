"""A second expression for each bust, v1, 2026-10-27.

Each locked bust is redrawn from its own function (31-busts-simple v4; 35-busts-more for the new five),
then only its brows, eyes and mouth change, so everything else matches the locked file exactly (checked:
the redrawn neutral face must equal the official bust). One expression each, chosen for the character:

  Pyreth grieving, Rodain grieving ("Fifty Became Thirty"), Mirael alarmed, Kael angry ("The Forge Is
  Cold"), Lirae grieving, Varn fierce, Ashara grieving (her neutral face is already angry), Thornwick
  startled, Sera roaring. The Hollow Knight has no face, by design, so no second expression.

Output: out/bust_<id>_<expression>_v1.png. Run: python src/make_expressions.py
"""
import importlib.util
import pathlib
import sys

from PIL import Image, ImageChops

HERE = pathlib.Path(__file__).resolve().parents[1]
AGENT = HERE.parent
OFFICIAL = AGENT.parent / "official" / "cast"
OUT, PREVIEW = HERE / "out", HERE / "preview"


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


# 35-busts-more imports Bust from a module named make_busts, so 31's file is loaded under that name.
simple = load("make_busts", AGENT / "31-busts-simple" / "src" / "make_busts.py")
more = load("busts_more", AGENT / "35-busts-more" / "src" / "make_busts.py")
Bust, W = simple.Bust, simple.W
upscale = simple.upscale
_image = Bust.image


def cells_of(draw):
    """Run a bust's drawing but stop before the image, to get its cells."""
    Bust.image = lambda self: self
    try:
        return draw()
    finally:
        Bust.image = _image


def put(b, pts, c, sym=False):
    for x, y in pts:
        b.cells[(x, y)] = c
        if sym:
            b.cells[(W - 1 - x, y)] = c


def pyreth_grieving(b):
    put(b, [(7, 7), (8, 7), (9, 7)], "clay2", True)                     # the brows lift at the middle
    put(b, [(7, 7), (8, 6), (9, 6)], "clay1", True)
    put(b, [(8, 8), (9, 8)], "gold3", True)                             # the eyes dim
    put(b, [(8, 9), (8, 10)], "azure3")                                 # a tear


def rodain_grieving(b):
    put(b, [(6, 6), (7, 6), (9, 7), (10, 7)], "orc2", True)             # the heavy brow lifts inward
    b.cells[(8, 6)] = b.cells[(8, 7)] = "clay1"                         # the scar runs on through it
    put(b, [(8, 8), (9, 8)], "gold3", True)
    put(b, [(8, 12)], "orc2", True)                                     # the mouth turns down
    put(b, [(8, 13)], "ink", True)


def mirael_alarmed(b):
    put(b, [(7, 7), (8, 7)], "clay2", True)                             # brows raised high
    put(b, [(7, 9), (7, 10)], "emerald2")                               # eyes wide
    put(b, [(14, 9), (14, 10)], "emerald2")
    put(b, [(10, 12), (11, 12), (10, 13), (11, 13)], "ink")             # a gasp


def kael_angry(b):
    put(b, [(7, 7), (8, 8), (9, 8)], "wood1", True)                     # brows drawn down
    put(b, [(9, 12), (12, 12)], "ink")                                  # teeth gritted
    put(b, [(10, 12), (11, 12)], "parch3")


def lirae_grieving(b):
    put(b, [(7, 7), (8, 7)], "night4", True)                            # eyes lowered behind the lenses
    put(b, [(7, 10), (7, 11)], "azure4")                                # a tear below the rim


def varn_fierce(b):
    put(b, [(6, 7), (7, 7), (8, 8), (9, 8)], "emerald1", True)          # brows down, eyes narrowed
    put(b, [(9, 15), (12, 15)], "ink")                                  # teeth bared
    put(b, [(10, 15), (11, 15)], "parch3")


def ashara_grieving(b):
    put(b, [(6, 6), (7, 6), (7, 7), (8, 7), (9, 7)], "ash2", True)      # the scowl gone
    put(b, [(6, 7), (7, 7), (8, 6), (9, 6)], "shadow1", True)           # the brow lifts at the middle
    put(b, [(8, 8), (9, 8)], "fire1", True)                             # the fire in her eyes low
    put(b, [(8, 14), (9, 14), (10, 14), (11, 14), (12, 14), (13, 14)], "ash1")   # the furnace shut


def thornwick_startled(b):
    put(b, [(7, 9), (8, 9)], "wood4")                                   # both brows up now
    put(b, [(7, 8), (8, 8)], "ash3")
    put(b, [(7, 10), (14, 10)], "parch3")                               # the whites of his eyes
    put(b, [(11, 15), (12, 15)], "ash3")                                # the smile gone, a round mouth
    put(b, [(10, 14), (11, 14), (10, 15), (11, 15)], "ink")


def sera_roaring(b):
    put(b, [(7, 7), (8, 7), (9, 8)], "ash3", True)                      # brows down
    put(b, [(10, 13), (11, 13)], "ash3")
    put(b, [(9, 13), (10, 13), (11, 13), (12, 13), (9, 14), (10, 14), (11, 14), (12, 14)], "ink")   # roaring
    put(b, [(9, 13), (12, 13)], "parch3")                               # fangs


EXPRESSIONS = [
    ("pyreth", "grieving", simple.pyreth, pyreth_grieving),
    ("rodain", "grieving", simple.rodain, rodain_grieving),
    ("mirael", "alarmed", simple.mirael, mirael_alarmed),
    ("kael", "angry", simple.kael, kael_angry),
    ("lirae", "grieving", simple.lirae, lirae_grieving),
    ("varn", "fierce", more.varn, varn_fierce),
    ("ashara", "grieving", more.ashara, ashara_grieving),
    ("thornwick", "startled", more.thornwick_v3, thornwick_startled),
    ("sera", "roaring", more.sera_v2, sera_roaring),
]


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    for bid, expr, draw, edit in EXPRESSIONS:
        b = cells_of(draw)
        neutral = _image(b)
        locked = Image.open(OFFICIAL / f"bust_{bid}.png").convert("RGBA")
        assert ImageChops.difference(neutral, locked).getbbox() is None, f"{bid}: redraw differs from the locked bust"
        edit(b)
        img = _image(b)
        img.save(OUT / f"bust_{bid}_{expr}_v1.png")
        upscale(img, 8).save(PREVIEW / f"bust_{bid}_{expr}_v1_x8.png")
    print(len(EXPRESSIONS), "expressions")


if __name__ == "__main__":
    main()
