"""The seal builds itself (owner, 2026-10-27: "break the seal into small parts, like the runes and the
circles and the symbols and the lines so that the main circles (plates) land with a slam. Then, the
details get etched on bits at a time ... Maybe the blue arcana while it's being built and the gold as a
final SMASH finish").

The owner's seal is cut into its parts at full size (2400 px), by its own geometry: the outer ring, the
inner circle, the three medallion rings, the letters in them, the triangle's lines (with the dots and
ticks on them), the runes in the ring band, the knot at the center and the small symbols inside. Each
pixel at 128 belongs to the part that covers most of it, so the finished seal is exactly the gold seal.

1. The plates slam: the body (outer ring and inner circle) flies in and lands in a ring of dust, then
   the three medallions land one by one, each with its own small impact.
2. The etching, in arcane blue: the triangle traces from the top medallion down and across, the runes
   burn in around the ring, the medallion letters appear, the small symbols, and the knot last, from
   its center out. New strokes flash white as they are cut.
3. The SMASH: a white-hot flash, a hard shake and a shockwave, and the seal is gold.
4. The slash carves RAXDEG·STVDIOS in gold.

Run: python make_seal_build.py (after make_seal.py)
"""
import json
import math
import pathlib
import sys

import numpy as np
from PIL import Image

from make_seal import OUT, P, PREVIEW, SEAL, card, gold, pixkit, rgba, runic

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "23-effects" / "src"))
from make_fx import cloud  # noqa: E402

N, SRC, MARGIN = 128, 2400, 22
C = 1199.5
MED = {"top": (1198.7, 416.1), "left": (519.2, 1592.5), "right": (1879.4, 1592.5)}
R_MED = (232, 270)
PARTS = ["", "ring", "inner", "med-top", "med-left", "med-right", "glyph-top", "glyph-left", "glyph-right",
         "lines", "runes", "knot", "symbols"]
HOT_BLUE, HOT = ["teal4", "azure4"], ["fire3", "fire3", "fire2", "fire2", "fire1"]


def labels():
    """Every dark pixel of the source, labeled with its part."""
    a = np.array(Image.open(SEAL).convert("L")) < 128
    ys, xs = np.mgrid[0:SRC, 0:SRC].astype(np.float32)
    r = np.hypot(xs - C, ys - C)
    lab = np.zeros((SRC, SRC), np.uint8)

    def seg_dist(p, q):
        (x1, y1), (x2, y2) = p, q
        dx, dy = x2 - x1, y2 - y1
        t = np.clip(((xs - x1) * dx + (ys - y1) * dy) / (dx * dx + dy * dy), 0, 1)
        return np.hypot(xs - (x1 + t * dx), ys - (y1 + t * dy))

    near_line = (seg_dist(MED["top"], MED["left"]) < 62) | (seg_dist(MED["top"], MED["right"]) < 62)
    near_line |= (seg_dist(MED["left"], MED["right"]) < 100) & (ys > MED["left"][1] - 40)
    lab[a & (r < 760 + 30) & near_line] = PARTS.index("lines")
    lab[a & (r < 360) & ~near_line] = PARTS.index("knot")
    lab[a & (r >= 360) & (r < 715) & ~near_line] = PARTS.index("symbols")
    lab[a & (r >= 715) & (r <= 800)] = PARTS.index("inner")
    lab[a & (r > 800) & (r < 1120)] = PARTS.index("runes")
    lab[a & (r >= 1120)] = PARTS.index("ring")
    for k, (mx, my) in MED.items():
        d = np.hypot(xs - mx, ys - my)
        lab[a & (d >= R_MED[0]) & (d <= R_MED[1] + 8)] = PARTS.index(f"med-{k}")
        lab[a & (d < R_MED[0])] = PARTS.index(f"glyph-{k}")
    return lab


def strokes(lab, n):
    """{(x, y): part} at n x n: the same strokes as the plain reduction, each given its main part."""
    dark = np.array(Image.fromarray(((lab > 0) * 255).astype(np.uint8)).resize((n, n), Image.BOX))
    cover = np.stack([np.array(Image.fromarray(((lab == k) * 255).astype(np.uint8)).resize((n, n), Image.BOX))
                      for k in range(len(PARTS))])
    part = cover[1:].argmax(0) + 1
    gray = np.array(Image.open(SEAL).convert("L").resize((n, n), Image.BOX))
    ys, xs = np.nonzero((gray < 150) & (dark > 0))
    return {(int(x), int(y)): int(part[y, x]) for x, y in zip(xs, ys)}


def arcane(n, lit, hot=()):
    """The arcane finish for the strokes in lit (a set); strokes in hot flash white."""
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    px = img.load()
    for x, y in lit:
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                q = (x + dx, y + dy)
                if q not in lit and 0 <= q[0] < n and 0 <= q[1] < n:
                    px[q] = rgba("teal1")
    for x, y in lit:
        px[x, y] = rgba("azure4" if (x, y - 1) not in lit else "azure3")
    for x, y in hot:
        px[x, y] = rgba(HOT_BLUE[(x + y) % 2])
    return img


def frame_base(size):
    return Image.new("RGBA", size, rgba("night1"))


def put(frame, img, x, y):
    """Composite img at (x, y), clipped to the frame."""
    box = (max(0, -x), max(0, -y), min(img.width, frame.width - x), min(img.height, frame.height - y))
    if box[2] > box[0] and box[3] > box[1]:
        frame.alpha_composite(img.crop(box), (max(0, x), max(0, y)))


def dust(frame, cx, cy, radius, count, r, body, rim, shade):
    discs = []
    for i in range(count):
        ang = i * 2 * math.pi / count + 0.1
        lump = (0.8, 1.15, 0.95, 1.25)[i % 4]
        discs.append((cx + (radius + lump) * math.cos(ang), cy + (radius + lump) * math.sin(ang), r * lump))
    cloud(frame, discs, body, rim, shade)


def shaken(frame, dy):
    if not dy:
        return frame
    out = frame_base(frame.size)
    out.alpha_composite(frame, (0, dy))
    return out


def build():
    lab = labels()
    final_strokes = strokes(lab, N)
    seal_gold, word = gold(N), runic("RAXDEG·STVDIOS", "gold")
    inner = card(seal_gold, word)
    size = (inner.width + MARGIN * 2, inner.height + MARGIN * 2)
    final = frame_base(size)
    final.alpha_composite(inner, (MARGIN, MARGIN))
    sx, sy = MARGIN + (inner.width - N) // 2, MARGIN + 4
    wx, wy = MARGIN + (inner.width - word.width) // 2, MARGIN + N + 10
    scx, scy = sx + N / 2, sy + N / 2
    by_part = {}
    for p, k in final_strokes.items():
        by_part.setdefault(PARTS[k], set()).add(p)
    beats, lit = [(frame_base(size), 300)], set()

    def seal_frame(hot=(), extra=None, shake=0):
        f = frame_base(size)
        if extra:
            extra(f)
        put(f, arcane(N, lit, hot), sx, sy)
        return shaken(f, shake)

    # 1. The body: outer ring and inner circle fly in and slam.
    body_parts = {"ring", "inner"}
    for scale in (3.0, 2.2, 1.65, 1.3, 1.1):
        n = round(N * scale)
        big = {p for p, k in strokes(lab, n).items() if PARTS[k] in body_parts}
        f = frame_base(size)
        put(f, arcane(n, big), round(scx - n / 2), round(scy - n / 2))
        beats.append((f, 50))
    lit |= by_part["ring"] | by_part["inner"]
    for spread, r, tones, shake, ms in ((0, 6.0, ("steel3", "steel4", "steel2"), 2, 70),
                                        (6, 7.0, ("steel2", "steel3", "steel1"), -1, 70),
                                        (11, 5.5, ("steel2", "steel3", "steel1"), 0, 80),
                                        (15, 3.5, ("steel1", "steel2", None), 0, 90)):
        beats.append((seal_frame(extra=lambda f, s=spread, rr=r, t=tones: dust(f, scx, scy, N / 2 + s, 46, rr, *t),
                                 shake=shake), ms))
    beats.append((seal_frame(), 160))

    # The three medallions land one by one.
    for key in ("top", "left", "right"):
        mx, my = (MED[key][0] / SRC * N, MED[key][1] / SRC * N)
        for scale in (2.4, 1.6, 1.2):
            n = round(N * scale)
            big = {p for p, k in strokes(lab, n).items() if PARTS[k] == f"med-{key}"}
            f = frame_base(size)
            put(f, arcane(N, lit), sx, sy)
            put(f, arcane(n, big), round(sx + mx - mx * scale), round(sy + my - my * scale))
            beats.append((f, 45))
        lit |= by_part[f"med-{key}"]
        for spread, r, tones, shake, ms in ((0, 2.6, ("steel3", "steel4", "steel2"), 1, 60),
                                            (3, 2.2, ("steel2", "steel3", None), 0, 70)):
            beats.append((seal_frame(extra=lambda f, s=spread, rr=r, t=tones, x=sx + mx, y=sy + my:
                                     dust(f, x, y, 9 + s, 16, rr, *t), shake=shake), ms))
    beats.append((seal_frame(), 200))

    # 2. The etching, a little at a time; each new cut flashes white for its first frame.
    def etch(pixels, key, steps, ms):
        nonlocal lit
        order = sorted(pixels, key=key)
        for i in range(steps):
            new = set(order[len(order) * i // steps: len(order) * (i + 1) // steps])
            lit |= new
            beats.append((seal_frame(hot=new), ms))

    top = (MED["top"][0] / SRC * N, MED["top"][1] / SRC * N)
    left = (MED["left"][0] / SRC * N, MED["left"][1] / SRC * N)

    def along_lines(p):
        x, y = p
        if y > left[1] - 3:                       # the bottom line runs out from both ends to the middle
            return 1 + (N / 2 - abs(x - N / 2)) / N
        return math.hypot(x - top[0], y - top[1]) / N   # the two sides run down from the top
    etch(by_part["lines"], along_lines, 6, 60)
    etch(by_part["runes"], lambda p: (math.atan2(p[1] - N / 2, p[0] - N / 2) + 2.4) % (2 * math.pi), 6, 60)
    for key in ("top", "left", "right"):
        etch(by_part[f"glyph-{key}"], lambda p: p[1], 1, 90)
    etch(by_part["symbols"], lambda p: (math.atan2(p[1] - N / 2, p[0] - N / 2) + 2.4) % (2 * math.pi), 2, 80)
    etch(by_part["knot"], lambda p: math.hypot(p[0] - N / 2, p[1] - N / 2), 3, 80)
    beats.append((seal_frame(), 380))
    assert lit == set(final_strokes), "every stroke etched"

    # 3. The SMASH: white-hot, a hard shake and a shockwave, then gold.
    white = gold(N)
    wpx = white.load()
    for x, y in lit:
        wpx[x, y] = rgba("fire3" if (x + y) % 3 else "gold6")

    def ring(f, radius, colors):
        """The shockwave: a circle of radius, its pixels cycling through colors (None leaves a gap)."""
        for i in range(int(2 * math.pi * radius)):
            a, c = i / radius, colors[i % len(colors)]
            x, y = round(scx + radius * math.cos(a)), round(scy + radius * math.sin(a))
            if c and 0 <= x < size[0] and 0 <= y < size[1]:
                f.putpixel((x, y), rgba(c))

    for img, radius, colors, d, shake, ms in (
            (white, 66, ["gold6"], (0, 7.0, ("steel3", "steel4", "steel2")), 3, 80),
            (seal_gold, 72, ["gold6", "gold5"], (6, 7.0, ("steel2", "steel3", "steel1")), -2, 70),
            (seal_gold, 78, ["gold5", "gold4", None], (11, 5.0, ("steel2", "steel3", "steel1")), 1, 70),
            (seal_gold, 84, ["gold4", None, None], (15, 3.0, ("steel1", "steel2", None)), 0, 80)):
        f = frame_base(size)
        dust(f, scx, scy, N / 2 + d[0], 46, d[1], *d[2])
        put(f, img, sx, sy)
        ring(f, radius, colors)
        beats.append((shaken(f, shake), ms))
    f = frame_base(size)
    put(f, seal_gold, sx, sy)
    beats.append((f, 260))

    # 4. The slash carves the name.
    for head in range(wx - 2, wx + word.width + 36, 11):
        f = frame_base(size)
        put(f, seal_gold, sx, sy)
        carve(f, word, wx, wy, head)
        beats.append((f, 45))
    beats.append((final, 1800))
    return beats, final


def carve(frame, word, wx, wy, head):
    t, px = word.load(), frame.load()
    for y in range(word.height):
        for x in range(word.width):
            r, g, b, a = t[x, y]
            cx = wx + x
            if not a or cx >= head:
                continue
            behind = (head - cx) // 5
            hot = (r, g, b) != P["ink"] and behind < len(HOT)
            px[cx, wy + y] = rgba(HOT[behind]) if hot else (r, g, b, 255)
    mid = wy + word.height // 2
    for i in range(24):
        x = head - i
        if 0 <= x < frame.width:
            px[x, mid] = rgba("fire3" if i < 4 else "fire2" if i < 10 else "fire1")
            if i < 8:
                for dy in (-1, 1):
                    if px[x, mid + dy][:3] == P["night1"]:
                        px[x, mid + dy] = rgba("fire1")


def main():
    beats, final = build()
    frames, ms = [b for b, _ in beats], [m for _, m in beats]
    pixkit.strip(frames).save(OUT / f"seal_build_strip{len(frames)}.png")
    final.save(OUT / "seal_build_card.png")
    (OUT / "seal_build_timing.json").write_text(json.dumps({
        "frame_width": final.width, "frame_height": final.height, "frames": len(frames),
        "background": "#%02x%02x%02x" % P["night1"], "ms": ms, "loop": False,
        "note": "The RAXDEG STUDIOS startup splash: the seal builds in arcane blue and smashes to gold. "
                "Hold the last frame.",
    }, indent=2), encoding="utf-8")
    big = [f.resize((f.width * 2, f.height * 2), Image.NEAREST).convert("RGB") for f in frames]
    big[0].save(PREVIEW / "seal_build.gif", save_all=True, append_images=big[1:], duration=ms, loop=0)
    print(len(frames), "frames", sum(ms), "ms", final.size)


if __name__ == "__main__":
    main()
