"""The interface kit, v1, 2026-10-28: stepped-corner pieces that stretch (9-slice) for every screen.

Owner, 2026-10-26: "UI frames should match: stepped pixel corners, as in Dicero". Owner, 2026-10-28: build the
high-fidelity mockup (v3) with the kit designed in place. These are the kit's first proposal, shown on every
screen of mockup v3; nothing here is locked.

Each 9-slice piece is a small grid: its corners never stretch, its edges and middle do. The slice (in art
pixels) is in SLICES; a screen draws it at 3x (one art pixel = 3 points), as the maps are drawn.
Fills use the app's own warm charcoal (theme bg.surface1-3), not the purple night of the scenes, so the
interface sits apart from the art it frames. Red is only for the destructive button (danger).

Output: out/kit_<name>_v1.png. Run: python src/make_kit.py
"""
import math
import pathlib

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parents[1]
OUT = HERE / "out"

INK = "#120a10"
STONE = {"f": "#1e1c19", "d": "#0c0a08", "G": "#4a4238"}             # a card: stone rim
GOLD = {"f": "#161412", "d": "#0c0a08", "G": "#b07828"}              # a sheet or modal: gold rim
KEY = {"H": "#ffdc78", "f": "#f0c060", "S": "#b07828"}               # gold button: the key action
STEEL = {"H": "#c4cedc", "f": "#94a3b8", "S": "#607088"}             # steel blue: everyday
QUIET = {"H": "#4a443c", "f": "#2e2a25", "S": "#1a1714"}             # stone: quiet
DANGER = {"H": "#e0604a", "f": "#c8402c", "S": "#963022"}            # red: destructive only

PLATE = [
    "..kkkkkkkk..",
    ".kGGGGGGGGk.",
    "kGGddddddGGk",
    "kGdffffffdGk",
    "kGdffffffdGk",
    "kGdffffffdGk",
    "kGdffffffdGk",
    "kGdffffffdGk",
    "kGdffffffdGk",
    "kGGddddddGGk",
    ".kGGGGGGGGk.",
    "..kkkkkkkk..",
]
BUTTON = [
    "..kkkkkkkk..",
    ".kHHHHHHHHk.",
    "kHHHHHHHHHHk",
    "kHffffffffSk",
    "kHffffffffSk",
    "kHffffffffSk",
    "kHffffffffSk",
    "kHffffffffSk",
    "kHffffffffSk",
    "kSSSSSSSSSSk",
    ".kSSSSSSSSk.",
    "..kkkkkkkk..",
]
# Pressed: the light falls the other way
PRESSED = [r.replace("H", "x").replace("S", "H").replace("x", "S") for r in BUTTON]
BAR = [
    ".kkkkkk.",
    "kttttttk",
    "kttttttk",
    "kttttttk",
    "kttttttk",
    "kttttttk",
    "kttttttk",
    ".kkkkkk.",
]
CHIP = [
    ".kkkkkk.",
    "kRRRRRRk",
    "kRffffRk",
    "kRffffRk",
    "kRffffRk",
    "kRffffRk",
    "kRRRRRRk",
    ".kkkkkk.",
]
TABBAR = [
    "kkkkkkkk",
    "GGGGGGGG",
    "dddddddd",
    "ffffffff",
    "ffffffff",
    "ffffffff",
    "ffffffff",
    "ffffffff",
]
# The objective ribbon: notched ends, drawn at its own height (10 art pixels)
RIBBON = [
    "kkkkkkkkkkkkkkkk",
    "kHHHHHHHHHHHHHHk",
    ".kffffffffffffk.",
    "..kffffffffffk..",
    "...kffffffffk...",
    "...kffffffffk...",
    "..kffffffffffk..",
    ".kffffffffffffk.",
    "kSSSSSSSSSSSSSSk",
    "kkkkkkkkkkkkkkkk",
]
# The heraldic socket an icon or a level sits in (fixed size)
SOCKET = [
    "kkkkkkkkkkkkkk",
    "kGGGGGGGGGGGGk",
    "kGffffffffffGk",
    "kGffffffffffGk",
    "kGffffffffffGk",
    "kGffffffffffGk",
    "kGffffffffffGk",
    "kGffffffffffGk",
    "kGffffffffffGk",
    ".kGffffffffGk.",
    "..kGffffffGk..",
    "...kGffffGk...",
    "....kGffGk....",
    ".....kGGk.....",
    "......kk......",
]
# A section divider: a diamond at each end, the line between them stretches
DIVIDER = [
    "..k.....................k..",
    ".kGk...................kGk.",
    "kGfGkkkkkkkkkkkkkkkkkkkGfGk",
    ".kGk...................kGk.",
    "..k.....................k..",
]

PIECES = {
    "plate": (PLATE, STONE), "plate_gold": (PLATE, GOLD),
    "btn_key": (BUTTON, KEY), "btn_key_down": (PRESSED, KEY),
    "btn_steel": (BUTTON, STEEL), "btn_steel_down": (PRESSED, STEEL),
    "btn_quiet": (BUTTON, QUIET), "btn_quiet_down": (PRESSED, QUIET),
    "btn_danger": (BUTTON, DANGER), "btn_danger_down": (PRESSED, DANGER),
    "btn_off": (BUTTON, {"H": "#2a2724", "f": "#221f1c", "S": "#1a1714"}),
    "bar": (BAR, {"t": "#0c0a08"}),
    "chip": (CHIP, {"R": "#4a4238", "f": "#161412"}),
    "chip_gold": (CHIP, {"R": "#b07828", "f": "#221a10"}),
    "tabbar": (TABBAR, {"G": "#b07828", "d": "#0c0a08", "f": "#161412"}),
    "ribbon": (RIBBON, {"H": "#965a28", "f": "#6e4628", "S": "#463228"}),
    "socket": (SOCKET, {"G": "#b07828", "f": "#1e1c19"}),
    "divider": (DIVIDER, {"G": "#b07828", "f": "#f0c060"}),
}
# The slice of each 9-slice piece, in art pixels (top, right, bottom, left)
SLICES = {"plate": 4, "plate_gold": 4, "btn": 4, "bar": 3, "chip": 3, "tabbar": 3, "ribbon": (3, 5, 3, 5),
          "divider": (2, 5, 2, 5)}


def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (255,)


def draw(rows, key):
    img = Image.new("RGBA", (len(rows[0]), len(rows)), (0, 0, 0, 0))
    colors = {"k": INK, **key}
    for y, row in enumerate(rows):
        for x, c in enumerate(row):
            if c != ".":
                img.putpixel((x, y), hexrgb(colors[c]))
    return img


def orb(rim, fill, light, shade, d=32):
    """An action orb: an ink ring, a rim, flat fill, a lit crescent top left and a shaded one bottom right."""
    img = Image.new("RGBA", (d, d), (0, 0, 0, 0))
    c = (d - 1) / 2
    for y in range(d):
        for x in range(d):
            r = math.hypot(x - c, y - c)
            if r > c + 0.5:
                continue
            col = INK if r > c - 1 else rim if r > c - 3 else fill
            if col == fill:
                lx, ly = x - (c - 5), y - (c - 5)
                if math.hypot(lx, ly) > c - 3:
                    col = shade
                elif math.hypot(x - (c - 4), y - (c - 4)) < 5:
                    col = light
            img.putpixel((x, y), hexrgb(col))
    return img


ORBS = {
    "orb_rally": ("#b07828", "#5a6082", "#9678a8", "#463a5a"),
    "orb_repair": ("#b07828", "#607088", "#94a3b8", "#463f4c"),
    "orb_forage": ("#b07828", "#3c785a", "#6aa070", "#24402e"),
    "orb_off": ("#4a4238", "#2e2a25", "#3a3530", "#1a1714"),
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, (rows, key) in PIECES.items():
        draw(rows, key).save(OUT / f"kit_{name}_v1.png")
    for name, cols in ORBS.items():
        orb(*cols).save(OUT / f"kit_{name}_v1.png")
    print(len(PIECES) + len(ORBS), "pieces")


if __name__ == "__main__":
    main()
