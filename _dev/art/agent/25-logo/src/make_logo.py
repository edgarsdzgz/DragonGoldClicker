"""The game's logo, which is also the app icon (owner, 2026-10-27: "We need a logo for the game which
should also be the app thumbnail").

The protagonist is never drawn here (commissioned from the artist), so the dragon appears only by its
marks: claw strikes, its ember, the city it guards. Icons are 64x64 native (x16 = 1024 for the stores)
with the emblem inside the middle 42 pixels, the adaptive icon's safe zone. The wordmark is drawn
letter by letter in a bold pixel face with the gold ramp.

Run: python make_logo.py
"""
import math
import pathlib
import sys

from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).resolve().parent
BATCH = HERE.parent
sys.path.insert(0, str(BATCH.parent / "00-foundation"))

import pixkit  # noqa: E402

P = pixkit.PALETTE
OUT, PREVIEW = BATCH / "out", BATCH / "preview"
S = 64


def rgba(name):
    return P[name] + (255,)


def canvas(w=S, h=S):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def poly(img, pts, color):
    ImageDraw.Draw(img).polygon([tuple(p) for p in pts], fill=rgba(color))


def ellipse(img, box, color):
    ImageDraw.Draw(img).ellipse(box, fill=rgba(color))


def mask_of(img):
    a = img.getchannel("A").load()
    return {(x, y) for x in range(img.width) for y in range(img.height) if a[x, y]}


def background():
    """Night ground with one flat halo behind the emblem, no gradient noise."""
    bg = Image.new("RGBA", (S, S), rgba("night1"))
    ellipse(bg, (6, 6, 57, 57), "night2")
    return bg


def compose(layer, bg=None):
    out = background() if bg is None else bg.copy()
    out.alpha_composite(pixkit.outline(layer))
    return out


def claw(img, a, b, clip, half=1.7):
    """A claw strike from a to b: an ember core tapering at both ends, a dark gouge on its lower side."""
    (ax, ay), (bx, by) = a, b
    dx, dy = bx - ax, by - ay
    length = math.hypot(dx, dy)
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            if (x, y) not in clip:
                continue
            t = ((x - ax) * dx + (y - ay) * dy) / (length * length)
            if not 0 <= t <= 1:
                continue
            d = ((x - ax) * dy - (y - ay) * dx) / length  # signed distance from the line
            hw = half * math.sin(math.pi * t) + 0.3
            if abs(d) <= hw:
                px[x, y] = rgba("fire3" if abs(d) < 0.6 else "fire2" if abs(d) < 1.2 else "fire1")
            elif 0 < d - hw <= 1 and 0.12 < t < 0.88:
                px[x, y] = rgba("ink")


# A: the claw-struck shield. The city's shield, three ember claw marks across it.
def shield():
    layer = canvas()
    outer = [(15, 11), (49, 11), (49, 34), (44, 44), (32, 54), (20, 44), (15, 34)]
    inner = [(18, 14), (46, 14), (46, 34), (41.5, 42.5), (32, 50.5), (22.5, 42.5), (18, 34)]
    poly(layer, outer, "gold3")
    rim = mask_of(layer)
    poly(layer, inner, "night2")
    field = mask_of(layer) - (rim - {p for p in rim if layer.getpixel(p)[:3] == P["night2"]})
    px = layer.load()
    for x, y in rim:
        if px[x, y][:3] == P["gold3"]:
            px[x, y] = rgba("gold5" if y <= 12 else "gold4" if x < 32 else "gold3")
    for x, y in mask_of(layer):
        if px[x, y][:3] == P["night2"] and x < 32:
            px[x, y] = rgba("night3")
    shape = mask_of(layer)
    for off in (-7, 0, 7):
        claw(layer, (42 + off, 15), (24 + off, 47), shape)
    out = compose(layer)
    for x, y, c in ((52, 9, "gold5"), (54, 13, "fire2"), (50, 6, "fire1")):
        out.putpixel((x, y), rgba(c))
    return out


# B: the gate under the ember moon. The city the dragon guards, its hearth glowing behind the bars.
def gate():
    bg = background()
    ellipse(bg, (19, 7, 45, 33), "gold4")
    ellipse(bg, (19, 7, 41, 29), "gold5")
    ellipse(bg, (22, 9, 34, 21), "gold6")
    for box in ((34, 13, 37, 16), (27, 22, 31, 25)):
        ellipse(bg, box, "gold3")
    layer = canvas()
    stone = "night3"
    for x0, x1 in ((11, 22), (41, 52)):            # the towers
        poly(layer, [(x0, 25), (x1, 25), (x1, 55), (x0, 55)], stone)
        for mx in range(x0, x1, 4):                # merlons
            poly(layer, [(mx, 21), (mx + 1, 21), (mx + 1, 24), (mx, 24)], stone)
        poly(layer, [(x0, 25), (x0 + 1, 25), (x0 + 1, 55), (x0, 55)], "night4")
        wx = (x0 + x1) // 2
        poly(layer, [(wx, 31), (wx + 1, 31), (wx + 1, 35), (wx, 35)], "fire2")
    poly(layer, [(23, 35), (40, 35), (40, 55), (23, 55)], stone)
    for mx in range(24, 40, 4):
        poly(layer, [(mx, 32), (mx + 1, 32), (mx + 1, 34), (mx, 34)], stone)
    px = layer.load()
    for y in range(26, 56):                        # brick courses
        for x in range(11, 53):
            if px[x, y][3] and px[x, y][:3] == P[stone]:
                if y % 5 == 0 or (x + (y // 5) * 3) % 6 == 0 and y % 5 != 0 and False:
                    px[x, y] = rgba("night2")
    for y in range(26, 56, 5):
        for x in range(11, 53):
            if px[x, y][3] and px[x, y][:3] == P[stone] and (x + (y // 5) * 3) % 6 == 0:
                for yy in range(y, y + 5):
                    if px[x, yy][3] and px[x, yy][:3] == P[stone]:
                        px[x, yy] = rgba("night2")
    # The arch, the hearth glow behind the portcullis.
    arch = canvas()
    ellipse(arch, (26, 38, 37, 49), "fire1")
    poly(arch, [(26, 44), (37, 44), (37, 55), (26, 55)], "fire1")
    for x, y in mask_of(arch):
        c = "fire3" if y >= 51 else "fire2" if y >= 46 else "fire1"
        if x in (28, 31, 34) or y in (44, 49):
            c = "ink"
        px[x, y] = rgba(c)
    for x, y in ((24, 43), (39, 43)):              # torches
        px[x, y] = rgba("fire3")
        px[x, y - 1] = rgba("fire2")
        px[x, y + 1] = rgba("wood2")
    out = compose(layer, bg)
    poly(out, [(27, 56), (36, 56), (40, 63), (23, 63)], "wood1")   # the road out of the gate
    return out


# C: the D monogram with the ember in its heart.
def monogram():
    layer = canvas()
    ellipse(layer, (13, 10, 49, 51), "gold4")
    poly(layer, [(15, 10), (31, 10), (31, 51), (15, 51)], "gold4")
    poly(layer, [(12, 10), (16, 10), (16, 13), (12, 13)], "gold4")
    poly(layer, [(12, 48), (16, 48), (16, 51), (12, 51)], "gold4")
    counter = canvas()
    ellipse(counter, (17, 18, 41, 43), "ink")
    poly(counter, [(25, 18), (30, 18), (30, 43), (25, 43)], "ink")
    hole = {(x, y) for x, y in mask_of(counter) if x >= 25}
    px = layer.load()
    for x, y in hole:
        px[x, y] = (0, 0, 0, 0)
    ramp = ["gold6", "gold6", "gold5", "gold5", "gold4", "gold4", "gold3", "gold3", "gold2"]
    for x, y in mask_of(layer):
        px[x, y] = rgba(ramp[min(8, (y - 10) * 9 // 42)])
    # The ember: Pyreth's gold diamond, burning.
    cx, cy = 34, 30
    for y in range(cy - 7, cy + 8):
        for x in range(cx - 6, cx + 7):
            d = abs(x - cx) / 6 + abs(y - cy) / 7
            if d <= 1:
                px[x, y] = rgba("fire3" if d < 0.35 else "fire2" if (x - cx) + (y - cy) < 2 else "fire1")
    shadow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sh = pixkit.outline(layer)
    a = sh.getchannel("A")
    shadow.paste(Image.new("RGBA", (S, S), rgba("ink")), (2, 2), a)
    out = background()
    out.alpha_composite(shadow)
    out.alpha_composite(sh)
    return out


# The wordmark: DRACONIA in a bold seven-pixel face with the gold ramp, CHRONICLES in small spaced caps.
BIG = {
    "D": ["######.", "##..###", "##...##", "##...##", "##...##", "##...##", "##...##", "##..###", "######."],
    "R": ["######.", "##...##", "##...##", "##..###", "######.", "##.###.", "##..##.", "##..###", "##...##"],
    "A": ["..###..", ".##.##.", "##...##", "##...##", "##...##", "#######", "##...##", "##...##", "##...##"],
    "C": [".#####.", "###..##", "##.....", "##.....", "##.....", "##.....", "##.....", "###..##", ".#####."],
    "O": [".#####.", "###.###", "##...##", "##...##", "##...##", "##...##", "##...##", "###.###", ".#####."],
    "N": ["##...##", "###..##", "####.##", "##.####", "##..###", "##...##", "##...##", "##...##", "##...##"],
    "I": ["####", ".##.", ".##.", ".##.", ".##.", ".##.", ".##.", ".##.", "####"],
}
SMALL = {
    "C": ["###", "#..", "#..", "#..", "###"], "H": ["#.#", "#.#", "###", "#.#", "#.#"],
    "R": ["##.", "#.#", "##.", "#.#", "#.#"], "O": ["###", "#.#", "#.#", "#.#", "###"],
    "N": ["#..#", "##.#", "#.##", "#..#", "#..#"], "I": ["#", "#", "#", "#", "#"],
    "L": ["#..", "#..", "#..", "#..", "###"], "E": ["###", "#..", "##.", "#..", "###"],
    "S": ["###", "#..", "###", "..#", "###"],
}


def set_text(word, font, gap, color_of_row):
    w = sum(len(font[c][0]) for c in word) + gap * (len(word) - 1)
    h = len(next(iter(font.values())))
    img = canvas(w + 2, h + 2)
    x = 1
    for c in word:
        for y, row in enumerate(font[c]):
            for i, ch in enumerate(row):
                if ch == "#":
                    img.putpixel((x + i, y + 1), rgba(color_of_row(y)))
        x += len(font[c][0]) + gap
    return pixkit.outline(img)


def wordmark():
    gold = ["gold6", "gold6", "gold5", "gold5", "gold4", "gold4", "gold3", "gold3", "gold2"]
    big = set_text("DRACONIA", BIG, 1, lambda y: gold[y])
    small = set_text("CHRONICLES", SMALL, 2, lambda y: "parch3")
    w = max(big.width, small.width) + 2
    img = canvas(w, big.height + small.height + 3)
    shadow = Image.new("RGBA", big.size, rgba("night1"))
    img.paste(shadow, ((w - big.width) // 2 + 1, 2), big.getchannel("A"))
    img.alpha_composite(big, ((w - big.width) // 2, 0))
    img.alpha_composite(small, ((w - small.width) // 2, big.height + 2))
    return img


def lockup(icon, mark):
    w = max(icon.width, mark.width) + 8
    img = Image.new("RGBA", (w, icon.height + mark.height + 12), rgba("night1"))
    img.alpha_composite(icon, ((w - icon.width) // 2, 4))
    img.alpha_composite(mark, ((w - mark.width) // 2, icon.height + 8))
    return img


CONCEPTS = {"shield": shield, "gate": gate, "monogram": monogram}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    mark = wordmark()
    mark.save(OUT / "logo_wordmark.png")
    for name, make in CONCEPTS.items():
        icon = make()
        icon.save(OUT / f"logo_{name}_icon.png")
        icon.resize((S * 16, S * 16), Image.NEAREST).save(PREVIEW / f"logo_{name}_icon_1024.png")
        lockup(icon, mark).save(OUT / f"logo_{name}_lockup.png")
    print("written")


if __name__ == "__main__":
    main()
