"""The RAXDEG seal in pixel art, and a runic face in its language (owner, 2026-10-27: "Attached is
actually my personal wax seal. Is that something we can use for the RAXDEG STUDIOS inspiration and
font and all that?").

The owner's seal (`_dev/art/reference/raxdeg/raxdeg-wax-seal.png`, 2400 px line art) is reduced to
the pixel grid by box-filtering and a threshold, which keeps every element: the outer ring, the
inner circle, the triangle of three medallions (E, G and D turned on their sides), the knot at the
center and the ring of runes. Three finishes:

  gold     engraved metal: gold lines lit from the top left on a night disc
  arcane   a spell circle: azure lines with a dark teal glow around them
  wax      a wax seal: a ruby wax disc with a soft uneven edge, the design pressed in

The runic face follows the seal: one-pixel strokes, angular letters, a dot inside the A and the O
like the seal's dots, a V for U as on old inscriptions, and an interpunct between the words:
RAXDEG·STVDIOS.

Run: python make_seal.py
"""
import math
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
BATCH = HERE.parent
ART = BATCH.parents[1]
sys.path.insert(0, str(BATCH.parent / "00-foundation"))

import pixkit  # noqa: E402

P = pixkit.PALETTE
OUT, PREVIEW = BATCH / "out", BATCH / "preview"
SEAL = ART / "reference" / "raxdeg" / "raxdeg-wax-seal.png"


def rgba(name):
    return P[name] + (255,)


def line_mask(n):
    """The seal's strokes at n x n pixels."""
    im = Image.open(SEAL).convert("L").resize((n, n), Image.BOX)
    px = im.load()
    return {(x, y) for x in range(n) for y in range(n) if px[x, y] < 150}


def disc(n, grow=0.0):
    c = (n - 1) / 2
    r = n / 2 - 0.2 + grow
    return {(x, y) for x in range(-4, n + 4) for y in range(-4, n + 4) if (x - c) ** 2 + (y - c) ** 2 <= r * r}


def gold(n):
    lines = line_mask(n)
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    px = img.load()
    for x, y in disc(n):
        if 0 <= x < n and 0 <= y < n:
            px[x, y] = rgba("night2")
    for x, y in lines:
        top = (x, y - 1) not in lines or (x - 1, y) not in lines
        low = (x, y + 1) not in lines and (x + 1, y) not in lines
        px[x, y] = rgba("gold5" if top else "gold3" if low else "gold4")
    return img


def arcane(n):
    lines = line_mask(n)
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    px = img.load()
    for x, y in lines:
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                q = (x + dx, y + dy)
                if q not in lines and 0 <= q[0] < n and 0 <= q[1] < n:
                    px[q] = rgba("teal1")
    for x, y in lines:
        top = (x, y - 1) not in lines
        px[x, y] = rgba("azure4" if top else "azure3")
    return img


def wax(n):
    pad = 6
    m = n + pad * 2
    lines = {(x + pad, y + pad) for x, y in line_mask(n)}
    c = (m - 1) / 2
    blob = set()
    for x in range(m):
        for y in range(m):
            a = math.atan2(y - c, x - c)
            r = n / 2 + 3.2 + 1.3 * math.sin(5 * a + 0.7) + 0.8 * math.sin(9 * a + 2.1)
            if (x - c) ** 2 + (y - c) ** 2 <= r * r:
                blob.add((x, y))
    img = Image.new("RGBA", (m, m), (0, 0, 0, 0))
    px = img.load()
    for x, y in blob:
        edge_tl = (x - 1, y) not in blob or (x, y - 1) not in blob
        edge_br = (x + 1, y) not in blob or (x, y + 1) not in blob
        px[x, y] = rgba("ruby3" if edge_tl else "ruby1" if edge_br else "ruby2")
    for x, y in lines:                      # pressed in: dark grooves with a lit lip below right
        if (x, y) in blob:
            px[x, y] = rgba("ruby1")
    for x, y in lines:
        q = (x + 1, y + 1)
        if q in blob and q not in lines:
            px[q] = rgba("ruby3")
    return pixkit.outline(img)


# The runic face: seven rows, one-pixel strokes.
RUNIC = {
    "R": ["##...", "#.#..", "#..#.", "#.#..", "##...", "#.#..", "#..#."],
    "A": ["..#..", "..#..", ".#.#.", ".#.#.", "#.#.#", "#...#", "#...#"],
    "X": ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
    "D": ["##...", "#.#..", "#..#.", "#...#", "#..#.", "#.#..", "##..."],
    "E": ["####", "#...", "#...", "###.", "#...", "#...", "####"],
    "G": [".###.", "#....", "#....", "#..##", "#...#", "#...#", ".###."],
    "S": ["..##.", ".#...", "#....", ".###.", "....#", "...#.", ".##.."],
    "T": ["..#..", ".###.", "#.#.#", "..#..", "..#..", "..#..", "..#.."],
    "V": ["#...#", "#...#", "#...#", ".#.#.", ".#.#.", "..#..", "..#.."],
    "I": ["#", "#", "#", "#", "#", "#", "#"],
    "O": ["..#..", ".#.#.", "#...#", "#.#.#", "#...#", ".#.#.", "..#.."],
    "·": [".", ".", ".", "#", ".", ".", "."],
}
RAMPS = {"gold": ["gold6", "gold5", "gold5", "gold4", "gold4", "gold3", "gold3"],
         "arcane": ["azure4", "azure4", "azure3", "azure3", "azure3", "azure2", "azure2"],
         "wax": ["ruby4", "ruby3", "ruby3", "ruby3", "ruby2", "ruby2", "ruby2"],
         "steel": ["steel5", "steel5", "steel4", "steel4", "steel3", "steel3", "steel2"]}


def runic(text, ramp, gap=2):
    w = sum(len(RUNIC[c][0]) + gap for c in text) - gap
    img = Image.new("RGBA", (w + 2, 9), (0, 0, 0, 0))
    x = 1
    for c in text:
        for y, row in enumerate(RUNIC[c]):
            for i, ch in enumerate(row):
                if ch == "#":
                    img.putpixel((x + i, y + 1), rgba(RAMPS[ramp][y]))
        x += len(RUNIC[c][0]) + gap
    return pixkit.outline(img)


def card(seal, word, gap=6):
    w = max(seal.width, word.width) + 12
    img = Image.new("RGBA", (w, seal.height + word.height + gap + 10), rgba("night1"))
    img.alpha_composite(seal, ((w - seal.width) // 2, 4))
    img.alpha_composite(word, ((w - word.width) // 2, seal.height + 4 + gap))
    return img


FINISHES = {"gold": gold, "arcane": arcane, "wax": wax}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    for name, make in FINISHES.items():
        for n in (96, 128):
            make(n).save(OUT / f"seal_{name}_{n}.png")
        word = runic("RAXDEG·STVDIOS", name)
        word.save(OUT / f"runic_{name}.png")
        card(make(128), word).save(OUT / f"studio_seal_{name}.png")
    runic("RAXDEG·STVDIOS", "steel").save(OUT / "runic_steel.png")
    print("written")


if __name__ == "__main__":
    main()
