"""Simpler busts, v3, 2026-10-27. v2 (the first simpler pass) is kept as make_busts_v2.py and out/*_v2.png;
the v1 busts stay as they are.

Owner, on v2: "Add little more shading/highlight colors to each character", then per character: pupils
for Pyreth; Rodain's scar back, straight up and down, his sash two pixels to the right and a pixel
thicker; Mirael's freckles back, her compass kept on her shirt; for Kael, "a new render that is more
between these two versions"; Lirae's wings and tome with more detail.

Each is drawn at 22x23 and shown at double, filling the v1's 44x46 slot. Light comes from the upper left:
a part's left and top edges take a lighter tone, its right edge a darker one. Kael also gets kael_full():
the v1 drawing at its own size, snapped to the palette and cleaned (between v1 and v2). The v1 reds
become rust (red is kept for danger).

Run: python src/make_busts.py
"""
import pathlib
import sys
from collections import Counter

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE.parent / "00-foundation"))
import pixkit  # noqa: E402
from pixkit import PALETTE, outline, upscale  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
REF = HERE.parents[1] / "reference"
W, H = 22, 23
INK = PALETTE["ink"]


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

    def shade(self, x0, y0, x1, y1, base, light, dark):
        """Light from the upper left: a part's left and top edges take `light`, its right edge `dark`.
        Only cells still in `base` inside the box change, so features drawn over it keep their colors."""
        for (x, y), c in list(self.cells.items()):
            if c != base or not (x0 <= x <= x1 and y0 <= y <= y1):
                continue
            if x == x1 or (x + 1, y) not in self.cells:
                self.cells[(x, y)] = dark
            elif x == x0 or y == y0 or (x - 1, y) not in self.cells or (x, y - 1) not in self.cells:
                self.cells[(x, y)] = light

    def image(self):
        img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        for (x, y), c in self.cells.items():
            if 0 <= x < W and 0 <= y < H:
                img.putpixel((x, y), PALETTE[c] + (255,))
        return outline(img)


def pyreth():
    b = Bust()
    b.rect(1, 16, 11, 22, "shadow2", True, round=True)                  # robe
    b.shade(1, 16, 20, 22, "shadow2", "shadow3", "shadow1")
    b.pts([(1, 0), (2, 0), (1, 1), (2, 1), (3, 1), (2, 2), (3, 2), (4, 2), (3, 3), (4, 3), (5, 3), (4, 4),
           (5, 4), (6, 4)], "parch3", True)                              # horns
    b.pts([(2, 1), (3, 2), (4, 3), (19, 1), (18, 2), (17, 3)], "parch1")  # their shaded undersides
    b.pts([(2, 7), (3, 7), (4, 7), (3, 9), (4, 9)], "parch3", True)     # frills
    b.rect(5, 4, 16, 14, "clay2", round=True)                            # head
    b.shade(5, 4, 16, 14, "clay2", "clay3", "clay1")
    b.rect(7, 7, 9, 7, "clay1", True)                                    # brow
    b.rect(8, 8, 9, 8, "gold5", True)                                    # eyes
    b.px(9, 8, "ink", True)                                              # pupils
    b.rect(8, 10, 10, 13, "clay3", True)                                 # snout
    b.rect(13, 10, 13, 13, "clay2")
    b.px(9, 11, "ink", True)
    b.pts([(5, 12), (5, 13), (6, 14), (6, 15), (7, 16)], "parch3", True) # whiskers
    b.rect(8, 14, 10, 18, "parch3", True)                                # beard
    b.rect(9, 19, 10, 20, "parch3", True)
    b.rect(12, 14, 13, 18, "parch2")                                     # its shaded side
    b.px(11, 19, "parch2")
    b.rect(10, 21, 11, 22, "fire1")                                      # the ember pendant
    b.px(10, 21, "fire2")
    return b.image()


def rodain():
    b = Bust()
    b.rect(1, 16, 11, 22, "ash1", True, round=True)                      # leather
    b.shade(1, 16, 20, 22, "ash1", "ash2", "shadow1")
    for i in range(8):                                                   # the sash: 3 wide, 2 to the right
        b.rect(7 + i, 22 - i, 9 + i, 22 - i, "clay1")
        b.px(7 + i, 22 - i, "clay2")
    b.rect(1, 15, 5, 19, "steel2", True)                                 # pauldrons
    b.rect(2, 15, 4, 15, "steel3", True)
    b.rect(1, 19, 5, 19, "steel1", True)
    b.px(2, 16, "steel4", True)
    b.rect(10, 0, 11, 2, "wood1")                                        # topknot
    b.pts([(3, 7), (4, 7), (4, 8)], "orc2", True)                        # ears
    b.rect(5, 3, 16, 14, "orc2", round=True)                             # head
    b.shade(5, 3, 16, 14, "orc2", "orc3", "orc1")
    b.rect(6, 6, 10, 7, "orc1", True)                                    # heavy brow
    b.rect(8, 8, 9, 8, "gold4", True)                                    # eyes
    b.pts([(8, 5), (8, 6), (8, 7), (8, 9), (8, 10), (8, 11)], "clay1")   # the scar, straight down the eye
    b.rect(8, 12, 10, 12, "ink", True)                                   # mouth
    b.rect(8, 10, 8, 11, "parch3", True)                                 # tusks
    b.rect(8, 15, 10, 15, "orc1", True)                                  # neck
    b.rect(19, 4, 19, 22, "wood3")                                       # the spear
    b.pts([(19, 0), (18, 1), (19, 1), (20, 1), (18, 2), (19, 2), (20, 2), (19, 3)], "steel3")
    b.pts([(18, 1), (18, 2)], "steel4")
    return b.image()


def mirael():
    b = Bust()
    b.rect(1, 16, 11, 22, "green2", True, round=True)                    # cloak
    b.shade(1, 16, 20, 22, "green2", "green3", "green1")
    b.pts([(2, 4), (3, 5), (4, 5), (3, 6), (4, 6), (4, 7)], "skin3", True)   # long ears
    b.pts([(17, 5), (17, 6)], "skin2")
    b.rect(5, 5, 16, 14, "skin3", round=True)                            # face
    b.rect(16, 6, 16, 13, "skin2")
    b.rect(5, 2, 16, 5, "clay3", round=True)                             # hair
    b.shade(5, 2, 16, 5, "clay3", "gold3", "clay2")
    b.rect(5, 6, 5, 11, "clay3", True)
    b.rect(8, 9, 8, 10, "emerald2", True)                                # eyes
    b.pts([(7, 11), (9, 12), (14, 11), (12, 12)], "clay3")               # freckles
    b.rect(10, 12, 10, 12, "skin1", True)                                # mouth
    b.rect(9, 15, 10, 15, "skin3", True)                                 # neck
    for y in range(7, 21):                                               # the braid, over the shoulder
        b.rect(16, y, 17, y, "clay2" if y % 2 else "clay3")
    b.rect(10, 18, 11, 19, "gold4")                                      # the compass brooch, on her shirt
    b.px(10, 18, "gold5")
    b.px(11, 19, "gold2")
    return b.image()


def kael():
    """The 22x23 drawing with the general shading, for comparison with kael_full()."""
    b = Bust()
    b.rect(1, 16, 11, 22, "steel2", True, round=True)                    # shirt
    b.shade(1, 16, 20, 22, "steel2", "steel3", "steel1")
    b.rect(6, 16, 10, 22, "wood2", True)                                 # apron
    b.rect(6, 16, 6, 16, "wood3", True)
    b.rect(15, 17, 15, 22, "wood1")
    b.rect(5, 2, 16, 6, "wood1", round=True)                             # hair
    b.pts([(16, 3), (17, 2)], "wood1")
    b.rect(5, 6, 16, 14, "skin1", round=True)                            # face
    b.rect(5, 7, 5, 12, "skin2")
    b.rect(16, 7, 16, 13, "gold2")
    b.rect(5, 5, 10, 6, "clay2", True)                                   # headband
    b.rect(5, 5, 16, 5, "clay3")
    b.pts([(16, 6), (17, 7)], "clay2")
    b.px(8, 9, "ink", True)                                              # eyes
    b.rect(10, 12, 10, 12, "wood2", True)                                # mouth
    b.rect(9, 15, 10, 15, "skin1", True)                                 # neck
    b.rect(18, 10, 18, 22, "wood4")                                      # the hammer
    b.rect(16, 7, 20, 9, "steel3")
    b.rect(16, 7, 20, 7, "steel4")
    b.rect(16, 9, 20, 9, "steel2")
    return b.image()


def merge_rare(img, keep):
    """Fold every color outside the `keep` most used (ink aside) into its nearest kept color."""
    px = img.load()
    seen = Counter(px[x, y][:3] for y in range(img.height) for x in range(img.width)
                   if px[x, y][3] and px[x, y][:3] != INK)
    kept = [c for c, _ in seen.most_common(keep)]
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if a and (r, g, b) != INK and (r, g, b) not in kept:
                near = min(kept, key=lambda k: sum((i - j) ** 2 for i, j in zip(k, (r, g, b))))
                px[x, y] = near + (255,)
    return img


def despeckle(img):
    """A lone pixel whose four neighbors share one other (non-ink) color takes that color."""
    src, out = img.load(), img.copy()
    o = out.load()
    for y in range(1, img.height - 1):
        for x in range(1, img.width - 1):
            p = src[x, y]
            if not p[3] or p[:3] == INK:
                continue
            n = [src[x + dx, y + dy] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))]
            if all(q == n[0] for q in n) and n[0] != p and n[0][3] and n[0][:3] != INK:
                o[x, y] = n[0]
    return out


def kael_full():
    """Between v1 and v2 (owner: "Less than V1 and more detailed than V2"): the v1 drawing at its own
    44x46, snapped to the game palette, its rarest colors merged into their nearest kept ones, stray
    single pixels cleared, and the red headband made rust."""
    img = pixkit.quantize(Image.open(REF / "bust-kael.png").convert("RGBA"))
    rust = {"red1": "clay1", "red2": "clay2", "red3": "clay3"}
    names = {v: k for k, v in PALETTE.items()}
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            n = names.get((r, g, b))
            if a and n in rust:
                px[x, y] = PALETTE[rust[n]] + (255,)
    return despeckle(merge_rare(img, keep=8))


def lirae():
    b = Bust()
    for x, top in ((0, 13), (1, 10), (2, 7), (3, 9)):                    # wings, rising to a tip
        b.rect(x, top, x, 22, "azure1", True)
    b.pts([(2, 6), (19, 6)], "parch3")                                   # the claw at each tip
    b.pts([(2, 8), (2, 9), (3, 10), (19, 8), (19, 9), (18, 10)], "azure2")   # the wing bone, lit
    for x, top in ((1, 14), (3, 13)):                                    # membrane folds
        b.rect(x, top, x, 22, "shadow2", True)
    b.pts([(0, 16), (0, 19), (21, 16), (21, 19)], "shadow2")             # a scalloped edge
    b.rect(4, 15, 10, 22, "night3", True)                                # body
    b.shade(4, 15, 17, 22, "night3", "night3", "azure1")          # her blue kept: a dark edge only
    b.pts([(5, 1), (5, 2), (6, 2), (6, 3)], "parch3", True)              # horns
    b.pts([(16, 2), (16, 3)], "parch1")
    b.rect(6, 3, 15, 13, "night3", round=True)                           # head
    b.shade(6, 3, 15, 13, "night3", "night3", "azure1")
    b.rect(8, 10, 10, 13, "steel3", True)                                # snout
    b.rect(13, 10, 13, 13, "steel2")
    b.px(9, 11, "ink", True)
    for x0 in (6, 12):                                                   # spectacles: round gold rims
        b.rect(x0, 6, x0 + 3, 9, "gold4", round=True)
        b.rect(x0 + 1, 7, x0 + 2, 8, "steel5")
        b.px(x0 + 2 if x0 == 6 else x0 + 1, 8, "ink")
    b.rect(10, 7, 11, 7, "gold4")
    # The tome, open: a leather cover, two pages with lines of writing, a shaded gutter, a ribbon.
    b.rect(5, 16, 16, 21, "wood3")
    b.rect(5, 21, 16, 21, "wood2")
    b.rect(6, 17, 10, 20, "parch3")
    b.rect(11, 17, 15, 20, "parch3")
    b.rect(10, 17, 11, 20, "parch2")
    for x0, x1, y in ((7, 9, 18), (7, 8, 19), (12, 14, 18), (12, 13, 19)):
        b.rect(x0, y, x1, y, "night4")
    b.rect(13, 21, 13, 22, "gold4")
    b.pts([(17, 13), (17, 14), (16, 15), (16, 16)], "parch3")           # the quill, writing
    b.px(18, 12, "parch3")
    b.px(15, 17, "night1")
    return b.image()


BUSTS = {"pyreth": pyreth, "rodain": rodain, "mirael": mirael, "kael": kael, "kael-full": kael_full,
         "lirae": lirae}


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    for name, f in BUSTS.items():
        img = f()
        img.save(OUT / f"bust_{name}_v3.png")
        upscale(img, 8 if img.width < 30 else 4).save(PREVIEW / f"bust_{name}_v3_x8.png")
    print(len(BUSTS), "busts")


if __name__ == "__main__":
    main()
