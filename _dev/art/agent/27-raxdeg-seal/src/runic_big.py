"""The big runic face and the arched name (owner, 2026-10-27: "I want RAXDEG STUDIOS to be bigger,
please. Maybe even across the top of the seal, over it").

Eleven rows with two-pixel strokes, drawn at full size (never the small face scaled up), in the same
language as the five-by-seven face: an angular R and D, a dot inside the A and the O, V for U, an
interpunct. The name is set upright on an arc concentric with the seal, hugging its top like a coin's
inscription, or straight across for comparison.
"""
import math

from PIL import Image

from make_seal import P, pixkit, rgba

BIG_RUNIC = {
    "R": ["####...", "##.##..", "##..##.", "##...##", "##..##.", "##.##..", "####...", "##.##..", "##..##.", "##...##", "##...##"],
    "A": ["..###..", ".##.##.", ".##.##.", ".##.##.", "##...##", "##...##", "##.#.##", "##...##", "##...##", "##...##", "##...##"],
    "X": ["##...##", "##...##", ".##.##.", ".##.##.", "..###..", "..###..", "..###..", ".##.##.", ".##.##.", "##...##", "##...##"],
    "D": ["####...", "##.##..", "##..##.", "##...##", "##...##", "##...##", "##...##", "##...##", "##..##.", "##.##..", "####..."],
    "E": ["######", "######", "##....", "##....", "#####.", "#####.", "##....", "##....", "##....", "######", "######"],
    "G": [".#####.", "##...##", "##.....", "##.....", "##.....", "##..###", "##..###", "##...##", "##...##", "##...##", ".#####."],
    "S": ["..#####", ".##....", "##.....", "##.....", ".##....", "..###..", "....##.", ".....##", ".....##", "....##.", "#####.."],
    "T": ["########", ".######.", "...##...", "...##...", "...##...", "...##...", "...##...", "...##...", "...##...", "...##...", "...##..."],
    "V": ["##...##", "##...##", "##...##", "##...##", ".##.##.", ".##.##.", ".##.##.", "..###..", "..###..", "..###..", "...#..."],
    "I": ["##"] * 11,
    "O": ["...#...", "..###..", ".##.##.", "##...##", "##...##", "##.#.##", "##...##", "##...##", ".##.##.", "..###..", "...#..."],
    "·": ["..", "..", "..", "..", "..", "##", "##", "..", "..", "..", ".."],
}
GOLD = ["gold6", "gold6", "gold5", "gold5", "gold5", "gold4", "gold4", "gold4", "gold3", "gold3", "gold2"]
TEXT = "RAXDEG·STVDIOS"
GAP = 2


def glyph(c, ramp=GOLD):
    rows = BIG_RUNIC[c]
    img = Image.new("RGBA", (len(rows[0]), len(rows)), (0, 0, 0, 0))
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch == "#":
                img.putpixel((x, y), rgba(ramp[y]))
    return img


def advance():
    return [len(BIG_RUNIC[c][0]) for c in TEXT]


def straight():
    """The name in one line; returns (image, path) where path(x) is the streak's y at column x."""
    widths = advance()
    w = sum(widths) + GAP * (len(TEXT) - 1)
    img = Image.new("RGBA", (w + 2, 13), (0, 0, 0, 0))
    x = 1
    for c, gw in zip(TEXT, widths):
        img.alpha_composite(glyph(c), (x, 1))
        x += gw + GAP
    return pixkit.outline(img), (lambda x: 6)


def arched(radius, center, size):
    """The name upright on an arc of radius about center (cx, cy), across the top, on a layer of size.
    Returns the layer and path(x), the arc's height at column x."""
    widths = advance()
    total = sum(widths) + GAP * (len(TEXT) - 1)
    cx, cy = center
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    s = -total / 2
    for c, gw in zip(TEXT, widths):
        mid = s + gw / 2                       # arc length from the top to this letter's middle
        a = -math.pi / 2 + mid / radius
        gx, gy = cx + radius * math.cos(a), cy + radius * math.sin(a)
        layer.alpha_composite(glyph(c), (round(gx - gw / 2), round(gy - 5.5)))
        s += gw + GAP

    def path(x):
        dx = max(-radius + 1, min(radius - 1, x - cx))
        return round(cy - math.sqrt(radius * radius - dx * dx))
    return pixkit.outline(layer), path


HOT = ["fire3", "fire3", "fire2", "fire2", "fire1"]


def carve(frame, word, ox, oy, path, head):
    """The name carved up to column head (frame coordinates): letters burn white-hot behind the slash and
    cool; the slash is a streak following path, white at its head."""
    t, px = word.load(), frame.load()
    for y in range(word.height):
        for x in range(word.width):
            r, g, b, a = t[x, y]
            fx = ox + x
            if not a or fx >= head or not (0 <= fx < frame.width and 0 <= oy + y < frame.height):
                continue
            behind = (head - fx) // 6
            hot = (r, g, b) != P["ink"] and behind < len(HOT)
            px[fx, oy + y] = rgba(HOT[behind]) if hot else (r, g, b, 255)
    left, _, right, _ = word.getbbox()            # the streak stays within the name's span
    for i in range(30):
        x = head - i
        if ox + left - 2 <= x <= ox + right + 2 and 0 <= x < frame.width:
            y = oy + path(x - ox)
            if 0 <= y < frame.height:
                px[x, y] = rgba("fire3" if i < 5 else "fire2" if i < 12 else "fire1")
                if i < 10:
                    for dy in (-1, 1):
                        if 0 <= y + dy < frame.height and px[x, y + dy][:3] == P["night1"]:
                            px[x, y + dy] = rgba("fire1")
