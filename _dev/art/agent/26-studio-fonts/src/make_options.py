"""RAXDEG STUDIOS lettering options on and around the shield (owner, 2026-10-27: "give me a few
brainstorm with differing fonts on RAXDEG STUDIOS on or around the shield logo").

The shield is the studio's startup splash; the game keeps its own gold DRACONIA wordmark, so these
options lean away from it where they can. Five static cards, each the splash's last frame:

  light    the five-by-seven light gold face above (the current intro)
  steel    a bold block face in silver above, STUDIOS in small spaced caps below
  ember    a bold italic face in ember tones, cut at a slant like the claw marks
  ribbon   a parchment ribbon across the shield's foot, the name inked on it
  side     a horizontal lockup: the shield left, RAXDEG over STUDIOS right

Run: python make_options.py
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
BATCH = HERE.parent
sys.path.insert(0, str(BATCH.parent / "25-logo" / "src"))

from make_logo import BIG, OUT as LOGO_OUT, SMALL, canvas, pixkit, poly, rgba  # noqa: E402
from make_studio_intro import FACE  # noqa: E402

OUT, PREVIEW = BATCH / "out", BATCH / "preview"
ICON = Image.open(LOGO_OUT / "logo_shield_icon.png").convert("RGBA")

BOLD = dict(BIG)
BOLD.update({
    "X": ["##...##", "##...##", ".##.##.", "..###..", "..###..", "..###..", ".##.##.", "##...##", "##...##"],
    "E": ["#######", "##.....", "##.....", "##.....", "######.", "##.....", "##.....", "##.....", "#######"],
    "G": [".#####.", "###..##", "##.....", "##.....", "##.####", "##...##", "##...##", "###..##", ".#####."],
    "S": [".######", "###....", "##.....", "###....", ".#####.", "....###", ".....##", "....###", "######."],
    "T": ["######", "######", "..##..", "..##..", "..##..", "..##..", "..##..", "..##..", "..##.."],
    "U": ["##...##", "##...##", "##...##", "##...##", "##...##", "##...##", "##...##", "###.###", ".#####."],
})
TINY = dict(SMALL)
TINY.update({
    "A": [".#.", "#.#", "###", "#.#", "#.#"], "X": ["#.#", "#.#", ".#.", "#.#", "#.#"],
    "D": ["##.", "#.#", "#.#", "#.#", "##."], "G": ["###", "#..", "#.#", "#.#", "###"],
    "T": ["###", ".#.", ".#.", ".#.", ".#."], "U": ["#.#", "#.#", "#.#", "#.#", "###"],
})
STEEL = ["steel5", "steel5", "steel4", "steel4", "steel3", "steel3", "steel2", "steel2", "steel1"]
EMBER = ["gold6", "gold6", "gold5", "fire2", "fire2", "fire1", "fire1", "gold3"]


def letters(text, font, gap, color, space=4, outline=True):
    """Set text in a font (rows of '#'); color(row) names the palette color per row."""
    h = len(next(iter(font.values())))
    w = sum(space if c == " " else len(font[c][0]) + gap for c in text) - gap
    img = canvas(w + 2, h + 2)
    x = 1
    for c in text:
        if c == " ":
            x += space
            continue
        for y, row in enumerate(font[c]):
            for i, ch in enumerate(row):
                if ch == "#":
                    img.putpixel((x + i, y + 1), rgba(color(y)))
        x += len(font[c][0]) + gap
    return pixkit.outline(img) if outline else img


def embolden(font):
    """Thicken a one-pixel face to two-pixel stems: every pixel also fills its right neighbor."""
    out = {}
    for c, rows in font.items():
        out[c] = ["".join("#" if ch == "#" or (i and row[i - 1] == "#") else "." for i, ch in enumerate(row + "."))
                  for row in rows]
    return out


def italic(img, every=3):
    """Shear right going up: row y moves (h - 1 - y) // every pixels, so the face leans like a slash."""
    lean = (img.height - 1) // every
    out = canvas(img.width + lean, img.height)
    for y in range(img.height):
        out.alpha_composite(img.crop((0, y, img.width, y + 1)), ((img.height - 1 - y) // every, y))
    return out


def card(w, h):
    return Image.new("RGBA", (w, h), rgba("night1"))


def centered(dst, img, y):
    dst.alpha_composite(img, ((dst.width - img.width) // 2, y))


def light():
    return Image.open(LOGO_OUT / "studio_card.png").convert("RGBA")


def steel():
    top = letters("RAXDEG", BOLD, 1, lambda y: STEEL[y])
    low = letters("STUDIOS", TINY, 2, lambda y: "steel3")
    img = card(88, top.height + 64 + low.height + 14)
    centered(img, top, 4)
    centered(img, ICON, top.height + 7)
    centered(img, low, top.height + 64 + 9)
    return img


def ember():
    face = embolden({c: FACE[c] for c in "RAXDEGSTUIO"})
    ramp = EMBER[:7]
    text = italic(letters("RAXDEG STUDIOS", face, 1, lambda y: ramp[y], space=5, outline=False))
    text = pixkit.outline(text)
    img = card(max(96, text.width + 8), text.height + 64 + 12)
    centered(img, text, 4)
    centered(img, ICON, text.height + 8)
    return img


def ribbon():
    img = card(88, 78)
    centered(img, ICON, 2)
    band = canvas(88, 78)
    y0 = 50
    poly(band, [(3, y0 + 4), (13, y0 + 4), (13, y0 + 13), (3, y0 + 13), (7, y0 + 8)], "parch1")    # tails
    poly(band, [(74, y0 + 4), (84, y0 + 4), (80, y0 + 8), (84, y0 + 13), (74, y0 + 13)], "parch1")
    poly(band, [(10, y0 + 10), (13, y0 + 10), (13, y0 + 13)], "wood3")                              # folds
    poly(band, [(74, y0 + 10), (77, y0 + 10), (74, y0 + 13)], "wood3")
    poly(band, [(10, y0), (77, y0), (77, y0 + 10), (10, y0 + 10)], "parch3")
    for x in range(10, 78):
        band.putpixel((x, y0 + 10), rgba("parch2"))
    img.alpha_composite(pixkit.outline(band))
    text = letters("RAXDEG STUDIOS", TINY, 1, lambda y: "ink", space=3, outline=False)
    img.alpha_composite(text, ((88 - text.width) // 2, y0 + 2))
    return img


def side():
    top = letters("RAXDEG", BOLD, 1, lambda y: STEEL[y])
    low = letters("STUDIOS", TINY, 3, lambda y: "steel4")
    img = card(64 + top.width + 10, 64)
    img.alpha_composite(ICON, (0, 0))
    x = 64 + 4
    ty = (64 - top.height - low.height - 4) // 2
    img.alpha_composite(top, (x, ty))
    img.alpha_composite(low, (x + (top.width - low.width) // 2, ty + top.height + 4))
    return img


OPTIONS = {"light": light, "steel": steel, "ember": ember, "ribbon": ribbon, "side": side}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    for name, make in OPTIONS.items():
        make().save(OUT / f"studio_{name}.png")
    print("written")


if __name__ == "__main__":
    main()
