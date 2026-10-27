"""The RAXDEG STUDIOS intro on the seal (owner, 2026-10-27: "Maybe the seal replaces the shield for
RAXDEG STUDIOS since the shield is really supposed to be for the game. But that IMPACT of the slam
and the slash REALLY makes me excited").

1. The seal flies in from the foreground, unlit, redrawn from the source art at every size.
2. The slam: squash, a two-pixel shake and a ring of dust (the shield intro's impact).
3. The spell ignites: a white-hot wave runs out from the center knot to the outer ring, and the seal
   cools to its finish behind it. Coding makes the spell; calling it casts it.
4. The slash: one stroke rips left to right and carves RAXDEG·STVDIOS in the runic face; the letters
   burn white-hot behind it and cool.

One intro per finish (gold, arcane, wax). Writes out/seal_intro_<finish>_stripN.png, the timing JSON,
out/seal_card_<finish>.png (the last frame) and preview/seal_intro_<finish>.gif at x2.

Run: python make_seal_intro.py (after make_seal.py)
"""
import json
import math
import pathlib
import sys

from PIL import Image

from make_seal import FINISHES, OUT, P, PREVIEW, card, line_mask, pixkit, rgba, runic

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "23-effects" / "src"))
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "25-logo" / "src"))
from make_fx import cloud  # noqa: E402
from make_splash import dim  # noqa: E402

N = 128
MARGIN = 22          # room around the card for the dust ring
HOT = ["fire3", "fire3", "fire2", "fire2", "fire1"]


def layout(finish):
    """The final card and where the seal and the name sit on it."""
    seal, word = FINISHES[finish](N), runic("RAXDEG·STVDIOS", finish)
    inner = card(seal, word)
    final = Image.new("RGBA", (inner.width + MARGIN * 2, inner.height + MARGIN * 2), rgba("night1"))
    final.alpha_composite(inner, (MARGIN, MARGIN))
    sx, sy = MARGIN + (inner.width - seal.width) // 2, MARGIN + 4
    wx, wy = MARGIN + (inner.width - word.width) // 2, MARGIN + seal.height + 10
    return final, seal, word, (sx, sy), (wx, wy)


def blank(final):
    return Image.new("RGBA", final.size, rgba("night1"))


def place(frame, img, cx, cy):
    frame.alpha_composite(img, (round(cx - img.width / 2), round(cy - img.height / 2)))


def ignite(seal, unlit, radius):
    """The seal lit out to radius from its center: its strokes hot at the wavefront, unlit beyond it."""
    out = unlit.copy()
    s, u, o = seal.load(), unlit.load(), out.load()
    c = (seal.width - 1) / 2
    pad = (seal.width - N) // 2
    strokes = {(x + pad, y + pad) for x, y in line_mask(N)}
    for y in range(seal.height):
        for x in range(seal.width):
            if not s[x, y][3]:
                continue
            d = math.hypot(x - c, y - c)
            if d < radius - 5:
                o[x, y] = s[x, y]
            elif d < radius:
                o[x, y] = rgba(HOT[min(4, int((radius - d) / 1.2))]) if (x, y) in strokes else s[x, y]
    return out


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


def dust(frame, cx, cy, spread, r, body, rim, shade):
    discs = []
    for i in range(46):
        ang = i * 2 * math.pi / 46 + 0.1
        lump = (0.8, 1.15, 0.95, 1.25)[i % 4]
        rr = N / 2 + spread + lump
        discs.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang), r * lump))
    cloud(frame, discs, body, rim, shade)


def intro(finish):
    final, seal, word, (sx, sy), (wx, wy) = layout(finish)
    make = FINISHES[finish]
    unlit = dim(seal, 1)
    cx, cy = sx + seal.width / 2, sy + seal.height / 2
    beats = [(blank(final), 300)]
    for scale in (3.0, 2.2, 1.65, 1.3, 1.1):             # in from the foreground
        f = blank(final)
        place(f, dim(make(round(N * scale)), 1), cx, cy)
        beats.append((f, 50))
    slam = [((1.12, 0.88), 2, (0, 6.0, "steel3", "steel4", "steel2"), 70),
            ((0.96, 1.04), -1, (5, 7.0, "steel2", "steel3", "steel1"), 70),
            (None, 0, (10, 6.0, "steel2", "steel3", "steel1"), 80),
            (None, 0, (14, 3.5, "steel1", "steel2", None), 90)]
    for squash, shake, d, ms in slam:
        f = blank(final)
        dust(f, cx, cy, *d)
        img = unlit if squash is None else unlit.resize((round(unlit.width * squash[0]), round(unlit.height * squash[1])), Image.NEAREST)
        place(f, img, cx, cy + (unlit.height - img.height) / 2)
        if shake:
            moved = blank(final)
            moved.alpha_composite(f, (0, shake))
            f = moved
        beats.append((f, ms))
    f = blank(final)
    f.alpha_composite(unlit, (sx, sy))
    beats.append((f, 220))
    for radius in (10, 24, 38, 52, 66, 80):               # the spell ignites, center outward
        f = blank(final)
        f.alpha_composite(ignite(seal, unlit, radius), (sx, sy))
        beats.append((f, 60))
    f = blank(final)
    f.alpha_composite(seal, (sx, sy))
    beats.append((f, 200))
    for head in range(wx - 2, wx + word.width + 36, 11):   # the slash carves the name
        f = blank(final)
        f.alpha_composite(seal, (sx, sy))
        carve(f, word, wx, wy, head)
        beats.append((f, 45))
    beats.append((final, 1800))
    return beats, final


def main():
    for finish in FINISHES:
        beats, final = intro(finish)
        frames, ms = [b for b, _ in beats], [m for _, m in beats]
        pixkit.strip(frames).save(OUT / f"seal_intro_{finish}_strip{len(frames)}.png")
        final.save(OUT / f"seal_card_{finish}.png")
        (OUT / f"seal_intro_{finish}_timing.json").write_text(json.dumps({
            "frame_width": final.width, "frame_height": final.height, "frames": len(frames),
            "background": "#%02x%02x%02x" % P["night1"], "ms": ms, "loop": False,
            "note": "The RAXDEG STUDIOS startup splash. Hold the last frame (seal_card_%s.png)." % finish,
        }, indent=2), encoding="utf-8")
        big = [f.resize((f.width * 2, f.height * 2), Image.NEAREST).convert("RGB") for f in frames]
        big[0].save(PREVIEW / f"seal_intro_{finish}.gif", save_all=True, append_images=big[1:], duration=ms, loop=0)
        print(finish, len(frames), "frames", sum(ms), "ms", final.size)


if __name__ == "__main__":
    main()
