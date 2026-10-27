"""Logo A in motion (owner, 2026-10-27): "the shield coming from the foreground back to its place with
a slam, then the claws slashing upward, and the three dots at the top right are the debris from the
claw slash. The animation stops when the logo is put together."

The shield is redrawn from its polygons at every size, so the zoom stays crisp pixel art instead of
a stretched bitmap. The last frame is logo_shield_icon.png exactly. Writes
out/logo_anim_frames_stripN.png, out/logo_anim_timing.json and preview/logo_anim.gif at x4.

Run: python make_shield_anim.py (after make_logo.py)
"""
import json
import math
import pathlib
import sys

from PIL import Image

from make_logo import OUT, P, PREVIEW, S, background, canvas, mask_of, pixkit, poly, rgba, shield

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "23-effects" / "src"))
from make_fx import cloud  # noqa: E402

OUTER = [(15, 11), (49, 11), (49, 34), (44, 44), (32, 54), (20, 44), (15, 34)]
INNER = [(18, 14), (46, 14), (46, 34), (41.5, 42.5), (32, 50.5), (22.5, 42.5), (18, 34)]
CLAWS = [(-7, ), (0, ), (7, )]
DEBRIS = [((50, 6), "fire1", (41, 13)), ((52, 9), "gold5", (46, 13)), ((54, 13), "fire2", (49, 17))]


def shield_body(sx, sy, anchor):
    """The shield without claws, its polygons scaled about anchor. Returns (outlined layer, clip mask)."""
    ax, ay = anchor

    def tf(pts):
        return [(ax + (x - ax) * sx, ay + (y - ay) * sy) for x, y in pts]

    layer = canvas()
    poly(layer, tf(OUTER), "gold3")
    rim = mask_of(layer)
    poly(layer, tf(INNER), "night2")
    top = ay + (12 - ay) * sy
    mid = ax + (32 - ax) * sx
    px = layer.load()
    for x, y in rim:
        if px[x, y][:3] == P["gold3"]:
            px[x, y] = rgba("gold5" if y <= top else "gold4" if x < mid else "gold3")
    for x, y in mask_of(layer):
        if px[x, y][:3] == P["night2"] and x < mid:
            px[x, y] = rgba("night3")
    return layer, mask_of(layer)


def claw_upward(img, off, progress, clip, half=1.7):
    """One claw mark slashed from the bottom left up to the top right, drawn up to progress (0..1).
    The leading tip burns white-hot while it moves."""
    a, b = (24 + off, 47), (42 + off, 15)          # bottom left to top right
    (ax, ay), (bx, by) = a, b
    dx, dy = bx - ax, by - ay
    length = math.hypot(dx, dy)
    px = img.load()
    for x, y in clip:
        t = ((x - ax) * dx + (y - ay) * dy) / (length * length)
        if not 0 <= t <= min(1, progress):
            continue
        d = ((x - ax) * dy - (y - ay) * dx) / length
        hw = half * math.sin(math.pi * t) + 0.3
        if abs(d) <= hw:
            hot = progress < 1 and progress - t < 0.12
            px[x, y] = rgba("fire3" if hot or abs(d) < 0.6 else "fire2" if abs(d) < 1.2 else "fire1")
        elif 0 < -d - hw <= 1 and 0.12 < t < 0.88:   # the gouge, on the same side as the logo's
            px[x, y] = rgba("ink")


def frame(scale=1.0, squash=(1.0, 1.0), shake=0, claws=(0, 0, 0), debris=None, dust=None):
    out = background()
    if scale > 0:
        anchor = (32, 32) if squash == (1.0, 1.0) else (32, 54)
        sx, sy = scale * squash[0], scale * squash[1]
        layer, clip = shield_body(sx, sy, anchor)
        for off, p in zip((-7, 0, 7), claws):
            if p > 0:
                claw_upward(layer, off, p, clip)
        out.alpha_composite(pixkit.outline(layer))
    if dust:
        body, rim, shade, r = dust
        cloud(out, [(24, 55, r), (40, 55, r), (32, 57, r - 0.5)], body, rim, shade)
    if debris is not None:
        for (fx, fy), color, (sx0, sy0) in DEBRIS:
            k = 1 - (1 - debris) ** 2                  # ease out: fast off the claw, settling
            out.putpixel((round(sx0 + (fx - sx0) * k), round(sy0 + (fy - sy0) * k)), rgba(color))
    if shake:
        moved = Image.new("RGBA", out.size, rgba("night1"))
        moved.alpha_composite(out, (0, shake))
        out = moved
    return out


def timeline():
    beats = [(dict(scale=0), 300)]
    for s in (3.2, 2.4, 1.8, 1.4, 1.15):              # in from the foreground, accelerating
        beats.append((dict(scale=s), 50))
    beats.append((dict(squash=(1.1, 0.9), shake=2, dust=("steel3", "steel4", "steel2", 2.2)), 70))   # the slam
    beats.append((dict(squash=(0.96, 1.04), shake=-1, dust=("steel2", "steel3", "steel1", 3.0)), 70))
    beats.append((dict(dust=("steel1", "steel2", None, 2.4)), 90))
    beats.append((dict(), 260))
    steps = [0.3, 0.6, 0.85, 1.0]
    for f in range(6):                                 # the three claws, a beat apart
        claws = tuple(steps[min(3, f - i)] if f - i >= 0 else 0 for i in range(3))
        debris = None
        if f >= 3:
            debris = (f - 3) / 4
        beats.append((dict(claws=claws, debris=debris), 55))
    for t in (0.75, 1.0):
        beats.append((dict(claws=(1, 1, 1), debris=t), 70))
    return beats


def main():
    beats = timeline()
    frames = [frame(**kw) for kw, _ in beats]
    final = shield()
    frames.append(final)
    ms = [m for _, m in beats] + [1500]
    built = frame(claws=(1, 1, 1), debris=1.0)
    same = list(built.getdata()) == list(final.getdata())
    pixkit.strip(frames).save(OUT / f"logo_anim_frames_strip{len(frames)}.png")
    (OUT / "logo_anim_timing.json").write_text(json.dumps({
        "frame_width": S, "frame_height": S, "frames": len(frames), "ms": ms, "loop": False,
        "note": "Hold the last frame; it is logo_shield_icon.png exactly.",
    }, indent=2), encoding="utf-8")
    big = [f.resize((S * 4, S * 4), Image.NEAREST).convert("RGB") for f in frames]
    big[0].save(PREVIEW / "logo_anim.gif", save_all=True, append_images=big[1:], duration=ms, loop=0)
    print(f"{len(frames)} frames, {sum(ms)} ms, rebuilt logo matches the official one: {same}")


if __name__ == "__main__":
    main()
