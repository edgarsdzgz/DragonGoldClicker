"""Simpler busts, 2026-10-27 (owner: "What would these look like if we simplify their designs a little
more? Lean more into the pixel art simplicity"). The v1 busts stay as they are; these are options.

Each is drawn at half the v1's resolution, 22x23, and shown at double, so it fills the same 44x46 slot
with pixels twice as big. The townsfolk's language: one flat color per part, two tones at most, small
solid eyes, the game palette only. Each keeps what makes the character: Pyreth's horns, frills and white
whiskers; Rodain's tusks, topknot, pauldrons and spear; Mirael's ears, braid and compass brooch; Kael's
headband, apron and hammer; Lirae's spectacles, wings, book and quill. The v1 reds become rust (red is
kept for danger).

Run: python src/make_busts.py
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from pixkit import PALETTE, outline, upscale  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
W, H = 22, 23


class Bust:
    """Cells by palette name; sym=True also paints the mirror image across the middle."""

    def __init__(self):
        self.cells = {}

    def px(self, x, y, c, sym=False):
        self.cells[(x, y)] = c
        if sym:
            self.cells[(W - 1 - x, y)] = c

    def rect(self, x0, y0, x1, y1, c, sym=False, round=False):
        """round leaves out the four corner pixels, so heads and shoulders are not hard boxes."""
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                if round and x in (x0, x1) and y in (y0, y1):
                    continue
                self.px(x, y, c, sym)

    def pts(self, cells, c, sym=False):
        for x, y in cells:
            self.px(x, y, c, sym)

    def image(self):
        img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        for (x, y), c in self.cells.items():
            if 0 <= x < W and 0 <= y < H:
                img.putpixel((x, y), PALETTE[c] + (255,))
        return outline(img)


def pyreth():
    b = Bust()
    b.rect(1, 16, 11, 22, "shadow2", True, round=True)                              # robe
    b.rect(2, 17, 3, 22, "shadow3", True)
    b.pts([(1, 0), (2, 0), (1, 1), (2, 1), (3, 1), (2, 2), (3, 2), (4, 2), (3, 3), (4, 3), (5, 3), (4, 4), (5, 4), (6, 4)], "parch3", True)   # horns
    b.pts([(2, 7), (3, 7), (4, 7), (3, 9), (4, 9)], "parch3", True)     # frills
    b.rect(5, 4, 16, 14, "clay2", round=True)                                  # head
    b.rect(7, 7, 9, 7, "clay1", True)                                    # brow
    b.rect(8, 8, 9, 8, "gold5", True)                                    # eyes
    b.rect(8, 10, 10, 13, "clay3", True)                                 # snout
    b.px(9, 11, "ink", True)
    b.pts([(5, 12), (5, 13), (6, 14), (6, 15), (7, 16)], "parch3", True) # whiskers
    b.rect(8, 14, 10, 18, "parch3", True)                                # beard
    b.rect(9, 19, 10, 20, "parch3", True)
    b.rect(10, 21, 11, 22, "fire1")                                      # the ember pendant
    return b.image()


def rodain():
    b = Bust()
    b.rect(1, 16, 11, 22, "ash1", True, round=True)                                  # leather
    b.rect(1, 15, 5, 19, "steel2", True)                                 # pauldrons
    b.rect(2, 15, 4, 15, "steel3", True)
    for i in range(8):                                                   # the sash
        b.rect(5 + i, 22 - i, 6 + i, 22 - i, "clay1")
    b.rect(10, 0, 11, 2, "wood1")                                        # topknot
    b.pts([(3, 7), (4, 7), (4, 8)], "orc2", True)                        # ears
    b.rect(5, 3, 16, 14, "orc2", round=True)                                   # head
    b.rect(6, 6, 10, 7, "orc1", True)                                    # heavy brow
    b.rect(8, 8, 9, 8, "gold4", True)                                    # eyes
    b.rect(8, 12, 10, 12, "ink", True)                                   # mouth
    b.rect(8, 10, 8, 11, "parch3", True)                                 # tusks
    b.rect(8, 15, 10, 15, "orc1", True)                                  # neck
    b.rect(19, 4, 19, 22, "wood3")                                       # the spear
    b.pts([(19, 0), (18, 1), (19, 1), (20, 1), (18, 2), (19, 2), (20, 2), (19, 3)], "steel3")
    return b.image()


def mirael():
    b = Bust()
    b.rect(1, 16, 11, 22, "green2", True, round=True)                                # cloak
    b.rect(2, 17, 3, 22, "green1", True)
    b.pts([(2, 4), (3, 5), (4, 5), (3, 6), (4, 6), (4, 7)], "skin3", True)   # long ears
    b.rect(5, 5, 16, 14, "skin3", round=True)                                  # face
    b.rect(5, 2, 16, 5, "clay3", round=True)                                   # hair
    b.rect(5, 6, 5, 11, "clay3", True)
    b.rect(8, 9, 8, 10, "emerald2", True)                                # eyes
    b.rect(10, 12, 10, 12, "skin1", True)                                # mouth
    b.rect(9, 15, 10, 15, "skin3", True)                                 # neck
    for y in range(7, 21):                                               # the braid, over the shoulder
        b.rect(16, y, 17, y, "clay2" if y % 2 else "clay3")
    b.rect(10, 18, 11, 19, "gold4")                                      # the compass brooch
    b.px(10, 18, "gold5")
    return b.image()


def kael():
    b = Bust()
    b.rect(1, 16, 11, 22, "steel2", True, round=True)                                # shirt
    b.rect(6, 16, 10, 22, "wood2", True)                                 # apron
    b.rect(6, 16, 6, 16, "wood3", True)
    b.rect(5, 2, 16, 6, "wood1", round=True)                                   # hair
    b.pts([(16, 3), (17, 2)], "wood1")
    b.rect(5, 6, 16, 14, "skin1", round=True)                                  # face
    b.rect(5, 5, 10, 6, "clay2", True)                                   # headband
    b.pts([(16, 6), (17, 7)], "clay2")
    b.px(8, 9, "ink", True)                                              # eyes
    b.rect(10, 12, 10, 12, "wood2", True)                                # mouth
    b.rect(9, 15, 10, 15, "skin1", True)                                 # neck
    b.rect(18, 10, 18, 22, "wood4")                                      # the hammer
    b.rect(16, 7, 20, 9, "steel3")
    b.rect(16, 7, 20, 7, "steel4")
    return b.image()


def lirae():
    b = Bust()
    for x, top in ((0, 13), (1, 10), (2, 7), (3, 9)):                     # wings, rising to a tip
        b.rect(x, top, x, 22, "azure1", True)
    b.rect(1, 14, 1, 22, "shadow2", True)                                # a fold in each
    b.rect(4, 15, 10, 22, "night3", True)                                # body
    b.pts([(5, 1), (5, 2), (6, 2), (6, 3)], "parch3", True)              # horns
    b.rect(6, 3, 15, 13, "night3", round=True)                                 # head
    b.rect(8, 10, 10, 13, "steel3", True)                                # snout
    b.px(9, 11, "ink", True)
    for x0 in (6, 12):                                                   # spectacles: round gold rims
        b.rect(x0, 6, x0 + 3, 9, "gold4", round=True)
        b.rect(x0 + 1, 7, x0 + 2, 8, "steel5")
        b.px(x0 + 2 if x0 == 6 else x0 + 1, 8, "ink")
    b.rect(10, 7, 11, 7, "gold4")
    b.rect(6, 17, 15, 21, "wood3")                                       # the book, open
    b.rect(7, 17, 10, 20, "parch3")
    b.rect(11, 17, 14, 20, "parch2")
    b.pts([(17, 13), (17, 14), (16, 15), (16, 16), (15, 17)], "parch3")  # the quill
    b.px(18, 12, "parch3")
    return b.image()


BUSTS = {"pyreth": pyreth, "rodain": rodain, "mirael": mirael, "kael": kael, "lirae": lirae}


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    for name, f in BUSTS.items():
        img = f()
        img.save(OUT / f"bust_{name}_simple.png")
        upscale(img, 8).save(PREVIEW / f"bust_{name}_simple_x8.png")
    print(len(BUSTS), "busts")


if __name__ == "__main__":
    main()
