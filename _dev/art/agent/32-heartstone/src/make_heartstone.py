"""The heartstone pendant, v2, 2026-10-27.

From the lore (dragonIdler docs/Draconia_Lore_Compendium.md, "The Arcana Pendants"): a core of
aetherglass, a crystal grown from condensed dragonfire, holding a droplet of the wearer's heart-flame,
set in silver-gold rune filigree. "The Pendants we wear are not weapons, but hearts."

v2 (owner: "The flame could really just be a glowing pulse, instead of a literal flame"): each option is gem
glass with a warm glow at its heart, in a gold setting hung from a loop, and a 4-frame pulse where the glow
swells and fades, breathing like the Barrier the pendants feed. White-gold and gold, not red (red is kept
for danger). Four shapes, each at the icon set's 12x12 and at 16x16, outlined in ink and lit from the upper
left. v1, with a literal flame, is kept as make_heartstone_v1.py and out/*_v1.png.

Run: python src/make_heartstone.py
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE.parent / "00-foundation"))
import pixkit  # noqa: E402
from pixkit import PALETTE, outline, upscale  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
GLASS = {PALETTE[c] for c in ("teal1", "teal2", "teal3")}


def draw(size, cells):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    for (x, y), c in cells.items():
        img.putpixel((x, y), PALETTE[c] + (255,))
    return outline(img)


def stone(size, rows, cap_row, bail_rows):
    """A stone from symmetric row spans [(y, half-width)], glass shaded light on the upper left, a gold cap
    row on top of the stone and a gold bail (loop) above it."""
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
    return draw(size, cells)


def studs(img, pts, color="gold4"):
    px = img.load()
    for x, y in pts:
        px[x, y] = PALETTE[color] + (255,)
    return img


def heart(size, shape, light_sum, dark, gold):
    cells = {}
    for y, spans in shape.items():
        for x0, x1 in spans:
            for x in range(x0, x1 + 1):
                cells[(x, y)] = "teal3" if x + y < light_sum else "teal1" if dark(x, y) else "teal2"
    cells.update(gold)
    return draw(size, cells)


# 12x12 ------------------------------------------------------------------------------------------------

def teardrop12():
    return stone(12, [(3, 2.5), (4, 3.5), (5, 3.5), (6, 3.5), (7, 2.5), (8, 1.5), (9, 0.5), (10, 0.5)], 2,
                 [(1, (5, 6))])


def round12():
    img = stone(12, [(3, 1.5), (4, 2.5), (5, 3.5), (6, 3.5), (7, 3.5), (8, 3.5), (9, 2.5), (10, 1.5)], 2,
                [(1, (5, 6))])
    return studs(img, ((2, 5), (2, 8), (9, 5), (9, 8)))                   # gold filigree studs on the rim


def diamond12():
    img = stone(12, [(3, 0.5), (4, 1.5), (5, 2.5), (6, 3.5), (7, 2.5), (8, 1.5), (9, 0.5)], 2, [(1, (5, 6))])
    return outline(studs(img, ((5, 10), (6, 10)), "gold3"))               # a gold point below


def heart12():
    shape = {3: [(1, 4), (7, 10)], 4: [(1, 10)], 5: [(1, 10)], 6: [(1, 10)], 7: [(2, 9)], 8: [(3, 8)],
             9: [(4, 7)], 10: [(5, 6)]}
    return heart(12, shape, 8, lambda x, y: x >= 9 or (x >= 8 and y >= 7),
                 {(5, 1): "gold5", (6, 1): "gold4"})                     # the loop, above the notch


# 16x16 ------------------------------------------------------------------------------------------------

def teardrop16():
    return stone(16, [(4, 3.5), (5, 4.5), (6, 5.5), (7, 5.5), (8, 5.5), (9, 4.5), (10, 3.5), (11, 2.5),
                      (12, 1.5), (13, 0.5), (14, 0.5)], 3, [(1, (7, 8)), (2, (6, 9))])


def round16():
    img = stone(16, [(4, 2.5), (5, 3.5), (6, 4.5), (7, 5.5), (8, 5.5), (9, 5.5), (10, 5.5), (11, 5.5),
                     (12, 4.5), (13, 3.5), (14, 2.5)], 3, [(1, (7, 8)), (2, (6, 9))])
    return studs(img, ((2, 7), (2, 11), (13, 7), (13, 11), (4, 13), (11, 13)))


def diamond16():
    return stone(16, [(4, 0.5), (5, 1.5), (6, 2.5), (7, 3.5), (8, 4.5), (9, 5.5), (10, 4.5), (11, 3.5),
                      (12, 2.5), (13, 1.5), (14, 0.5)], 3, [(1, (7, 8)), (2, (6, 9))])


def heart16():
    shape = {4: [(2, 6), (9, 13)], 5: [(1, 6), (9, 14)], 6: [(1, 14)], 7: [(1, 14)], 8: [(1, 14)],
             9: [(2, 13)], 10: [(3, 12)], 11: [(4, 11)], 12: [(5, 10)], 13: [(6, 9)], 14: [(7, 8)]}
    return heart(16, shape, 10, lambda x, y: x >= 13 or (x >= 11 and y >= 9),
                 {(7, 5): "gold4", (8, 5): "gold4",                       # a gold clasp in the notch
                  (7, 1): "gold5", (8, 1): "gold4", (7, 2): "gold5", (8, 2): "gold4"})   # the loop


# The glow ---------------------------------------------------------------------------------------------

def glow(img, cx, cy, r):
    """The heart-flame as light, not fire: a white-gold core, a gold ring, and the glass around it lit.
    Only glass pixels change, so the setting and the outline stay."""
    out = img.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            if px[x, y][:3] not in GLASS:
                continue
            d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            if d <= 0.75 * r:
                px[x, y] = PALETTE["fire3"] + (255,)
            elif d <= 1.25 * r:
                px[x, y] = PALETTE["gold5"] + (255,)
            elif d <= 1.9 * r:
                px[x, y] = PALETTE["teal3"] + (255,)
    return out


# (12x12 drawing, its glow's center), (16x16 drawing, its glow's center)
OPTIONS = {"teardrop": ((teardrop12, (5.5, 5.5)), (teardrop16, (7.5, 7.5))),
           "round": ((round12, (5.5, 6.5)), (round16, (7.5, 9.0))),
           "diamond": ((diamond12, (5.5, 6.0)), (diamond16, (7.5, 9.0))),
           "heart": ((heart12, (5.5, 6.0)), (heart16, (7.5, 8.5)))}
PULSE = {12: (1.0, 1.5, 2.0, 1.5), 16: (1.4, 2.0, 2.7, 2.0)}   # the glow's radius, frame by frame
PULSE_MS = (420, 160, 420, 160)                                  # rest small, swell, rest full, fade


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    for name, ((f12, c12), (f16, c16)) in OPTIONS.items():
        for size, f, (cx, cy) in ((12, f12, c12), (16, f16, c16)):
            base = f()
            frames = [glow(base, cx, cy, r) for r in PULSE[size]]
            frames[1].save(OUT / f"icon_heartstone-{name}_{size}.png")              # the still icon
            pixkit.strip(frames).save(OUT / f"icon_heartstone-{name}_{size}_pulse_strip4.png")
            big = [upscale(fr, 8).convert("RGB") for fr in frames]
            big[0].save(PREVIEW / f"icon_heartstone-{name}_{size}_pulse.gif", save_all=True,
                        append_images=big[1:], duration=list(PULSE_MS), loop=0)
            upscale(frames[1], 8).save(PREVIEW / f"icon_heartstone-{name}_{size}_x8.png")
    print(len(OPTIONS) * 2, "icons, each with a pulse")


if __name__ == "__main__":
    main()
