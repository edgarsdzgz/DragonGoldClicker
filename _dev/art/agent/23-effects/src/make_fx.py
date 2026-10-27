"""Batch 5: combat and repair effects as short strips.

Effects are light, not objects: glow colors, no ink outline, hard alpha. The two exceptions are
the wall impact (stone chips and dust, in the gate's own stone colors) and the breach, which is
the gate itself falling. The hit spark is already official (test run) and is not redrawn.

Run: python make_fx.py
"""
import math
import pathlib
import random
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
BATCH = HERE.parent
AGENT = BATCH.parent
sys.path.insert(0, str(AGENT / "00-foundation"))

import pixkit  # noqa: E402

P = pixkit.PALETTE
OUT, PREVIEW = BATCH / "out", BATCH / "preview"
GATE = AGENT / "21-warfront" / "out"


def canvas(w, h):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def put(img, x, y, color):
    x, y = int(round(x)), int(round(y))
    if 0 <= x < img.width and 0 <= y < img.height:
        img.putpixel((x, y), P[color] + (255,))


def pixel_perfect(points):
    """Drop the corner pixel of every L, so a curve reads as a clean one-pixel stroke."""
    out = []
    for p in points:
        if out and out[-1] == p:
            continue
        if len(out) >= 2:
            a, b = out[-2], out[-1]
            if abs(p[0] - a[0]) == 1 and abs(p[1] - a[1]) == 1 and (b[0] in (a[0], p[0])) and (b[1] in (a[1], p[1])):
                out.pop()
        out.append(p)
    return out


# Slash: three claw marks swept from upper right to lower left, bowing out toward the lower right.
SLASH_COLORS = {
    "plain": ("steel5", "steel4", "steel3", "steel2"),
    "gold": ("gold6", "gold5", "gold4", "gold3"),
    "ember": ("fire3", "fire2", "fire1", "clay3"),
}


def claw_curve(offset, t0, t1):
    p0, c, p2 = (20, 2), (14, 14), (2, 20)
    pts = []
    for i in range(240):
        t = t0 + (t1 - t0) * i / 239
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p2[0] + offset
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p2[1] + offset
        pts.append((int(round(x)), int(round(y))))
    return pixel_perfect(pts)


def slash(variant):
    core, mid, edge, fade = SLASH_COLORS[variant]
    marks = [(-4, 0.18, 0.82), (0, 0.0, 1.0), (4, 0.18, 0.82)]
    frames = []
    for f in range(4):
        img = canvas(24, 24)
        for off, a, b in marks:
            span = b - a
            if f == 0:   # the leading edge: only the first stretch, its head brightest
                pts = claw_curve(off, a, a + span * 0.45)
                for i, (x, y) in enumerate(pts):
                    put(img, x, y, core if i >= len(pts) - 3 else mid)
            elif f == 1:  # the full mark: bright and thick in the middle, tapering at both ends
                pts = claw_curve(off, a, b)
                for i, (x, y) in enumerate(pts):
                    w = math.sin(math.pi * i / max(1, len(pts) - 1))
                    if w > 0.6:
                        put(img, x + 1, y, edge)
                    put(img, x, y, core if w > 0.7 else mid if w > 0.35 else edge)
            elif f == 2:  # the tail lets go first
                pts = claw_curve(off, a + span * 0.35, b)
                for i, (x, y) in enumerate(pts):
                    put(img, x, y, mid if i > len(pts) * 0.6 else edge)
            else:        # last flecks
                pts = claw_curve(off, a + span * 0.65, b)
                for i, (x, y) in enumerate(pts):
                    if i % 2 == 0:
                        put(img, x, y, fade)
        frames.append(img)
    return frames


def ray(img, cx, cy, dx, dy, colors):
    """Lay a ray from the center outward, one color per step."""
    for i, c in enumerate(colors, 1):
        if c:
            put(img, cx + dx * i, cy + dy * i, c)


def crit():
    """The critical hit: bigger and brighter than the spark; an eight-ray star that bursts into a ring."""
    cx = cy = 11
    card = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    diag = [(1, 1), (1, -1), (-1, 1), (-1, -1)]
    frames = []
    img = canvas(24, 24)
    put(img, cx, cy, "fire3")
    for d in card:
        ray(img, cx, cy, *d, ["fire3", "fire2", "fire2", "fire1"])
    for d in diag:
        ray(img, cx, cy, *d, ["fire2"])
    frames.append(img)

    img = canvas(24, 24)
    for dx in range(-2, 3):
        for dy in range(-2, 3):
            if abs(dx) + abs(dy) <= 2:
                put(img, cx + dx, cy + dy, "fire3")
    for d in card:
        ray(img, cx, cy, *d, [None, None, "fire3", "fire3", "fire2", "fire2", "fire2", "fire1", "fire1", "fire1", "gold4"])
    for d in diag:
        ray(img, cx, cy, *d, [None, "fire3", "fire2", "fire2", "fire1", "fire1", "gold4"])
    for a in range(8):
        ang = math.pi / 8 + a * math.pi / 4
        put(img, cx + 8 * math.cos(ang), cy + 8 * math.sin(ang), "gold5")
    frames.append(img)

    img = canvas(24, 24)
    for a in range(72):
        ang = a * math.pi / 36
        put(img, cx + 8 * math.cos(ang), cy + 8 * math.sin(ang), "fire2" if a % 9 < 5 else "fire1")
    put(img, cx, cy, "fire2")
    for d in card:
        ray(img, cx, cy, *d, [None] * 9 + ["fire1", "fire1"])
    for d in diag:
        ray(img, cx, cy, *d, [None] * 7 + ["gold4"])
    frames.append(img)

    img = canvas(24, 24)
    for a in range(16):
        ang = a * math.pi / 8
        r = 10 if a % 2 == 0 else 9
        put(img, cx + r * math.cos(ang), cy + r * math.sin(ang), "red3" if a % 2 == 0 else "fire1")
    frames.append(img)
    return frames


def ember():
    """A floating ember, 4x4, three frames that loop: a flicker from bright to dim."""
    grids = [["....", ".Wy.", ".yo.", "...."],
             ["....", ".y..", ".oy.", "...."],
             ["....", "..o.", ".y..", "...."]]
    key = {"W": "fire3", "y": "fire2", "o": "fire1"}
    return [pixkit.from_grid(g, key) for g in grids]


def ally_hit():
    """The army's hit: a steel-blue X, crossed blades, kept apart from the spark's plus."""
    cx = cy = 7
    diag = [(1, 1), (1, -1), (-1, 1), (-1, -1)]
    card = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    frames = []
    img = canvas(16, 16)
    put(img, cx, cy, "steel5")
    for d in diag:
        ray(img, cx, cy, *d, ["steel5", "steel4"])
    frames.append(img)

    img = canvas(16, 16)
    put(img, cx, cy, "steel5")
    for d in card:
        ray(img, cx, cy, *d, ["steel5", None, "steel3"])
    for d in diag:
        ray(img, cx, cy, *d, ["steel5", "steel5", "steel4", "steel4", "steel3", "steel3"])
    frames.append(img)

    img = canvas(16, 16)
    put(img, cx, cy, "steel3")
    for d in diag:
        ray(img, cx, cy, *d, [None, None, None, None, "steel3", "steel2", "steel2"])
    frames.append(img)
    return frames


def cloud(img, discs, body, rim, shade=None):
    """Dust as one merged cloud: the union of discs (x, y, r) in a flat body color, the top pixel of
    each column in a lighter rim and the bottom one in a shade. No scattered pixels."""
    mask = set()
    for x, y, r in discs:
        for dy in range(-int(r) - 1, int(r) + 2):
            for dx in range(-int(r) - 1, int(r) + 2):
                if dx * dx + dy * dy <= r * r + 0.5:
                    px, py = int(round(x + dx)), int(round(y + dy))
                    if 0 <= px < img.width and 0 <= py < img.height:
                        mask.add((px, py))
    for px, py in mask:
        if rim and (px, py - 1) not in mask:
            put(img, px, py, rim)
        elif shade and ((px, py + 1) not in mask or (px, py + 2) not in mask):
            put(img, px, py, shade)
        else:
            put(img, px, py, body)


def wall_impact():
    """A monster strikes the wall: a flash, stone chips thrown up and falling, a puff of dust.
    Chips use the gate's stone colors; dust is pale steel so it reads on the dark wall."""
    rng = random.Random(5)
    ix, iy = 10, 11
    chips = [(rng.uniform(-2.6, 2.6), rng.uniform(-3.2, -1.4), rng.choice(["night4", "night3", "steel1"]))
             for _ in range(9)]
    frames = []
    # Dust: (dx, dy per frame) for three puffs, their radius and colors per frame.
    puffs = [(-1.5, -0.5), (1.6, -0.4), (0, -1.0)]
    radius = [None, 1.6, 2.3, 1.4]
    tone = [None, ("steel3", "steel4", "steel2"), ("steel2", "steel3", "steel1"), ("steel1", "steel2", None)]
    for f in range(4):
        img = canvas(20, 16)
        if f == 0:
            put(img, ix, iy, "steel5")
            for dx, dy in ((1, 0), (-1, 0), (0, -1)):
                put(img, ix + dx, iy + dy, "parch3")
            for dx, dy in ((2, -1), (-2, -1), (0, -2)):
                put(img, ix + dx, iy + dy, "steel4")
        else:
            cloud(img, [(ix + vx * (f + 1), iy + 1 + vy * (f + 1), radius[f]) for vx, vy in puffs], *tone[f])
        t = f + 0.6
        for vx, vy, c in chips:
            x, y = ix + vx * t, iy + vy * t + 0.55 * t * t
            if y <= 15:
                put(img, x, y, c)
        frames.append(img)
    return frames


def star(img, x, y, size, bright="gold6", mid="gold5", tip="gold4"):
    if size == 0:
        put(img, x, y, mid)
        return
    put(img, x, y, bright)
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        put(img, x + dx, y + dy, mid)
        if size == 2:
            put(img, x + 2 * dx, y + 2 * dy, tip)


def repair():
    """Repair: warm twinkles on the wall, three stars growing and fading in turn. Loops at 8 fps."""
    beats = [((3, 6, 1), (8, 3, None), (7, 9, 0)),
             ((3, 6, 2), (8, 3, 0), (7, 9, 1)),
             ((3, 6, 1), (8, 3, 2), (7, 9, 0)),
             ((3, 6, 0), (8, 3, 1), (7, 9, None))]
    frames = []
    for beat in beats:
        img = canvas(12, 12)
        for x, y, size in beat:
            if size is not None:
                star(img, x, y, size)
        frames.append(img)
    return frames


def breach():
    """The wall falls: dust bursts from the cracks and hides the gate, stone chunks tumble out, and
    the cloud thins to show the breach. The last frame is map_gate_breached exactly."""
    failing = Image.open(GATE / "map_gate_failing.png").convert("RGBA")
    breached = Image.open(GATE / "map_gate_breached.png").convert("RGBA")
    w, h = failing.size
    fp, bp = failing.load(), breached.load()
    falling = [(x, y) for x in range(w) for y in range(h) if fp[x, y][3] and not bp[x, y][3]]
    xs = sorted(x for x, _ in falling)
    mid = xs[len(xs) // 2]
    # Chunks: 5x4 pieces of the failing wall itself, cut from where the breach opens.
    rng = random.Random(9)
    fall = set(falling)
    starts = [p for p in falling if all((p[0] + dx, p[1] + dy) in fall for dx in range(5) for dy in range(4))]
    chunks = []
    for x, y in rng.sample(starts, 8):
        piece = failing.crop((x, y, x + 5, y + 4))
        chunks.append((piece, x, y, (x + 2 - mid) / 12 + rng.uniform(-0.4, 0.4)))
    # The cloud per frame: (discs as (dx from mid, y, r), body, rim).
    clouds = {
        1: ([(-8, 26, 7), (6, 22, 8), (0, 34, 7), (14, 32, 5), (-16, 34, 5)], "steel2", "steel3", "steel1"),
        2: ([(-20, 30, 10), (0, 22, 13), (20, 30, 10), (-10, 46, 10), (12, 46, 10), (0, 52, 8)], "steel2", "steel3", "steel1"),
        3: ([(-26, 16, 8), (-12, 10, 10), (4, 8, 10), (20, 12, 9), (32, 18, 6)], "steel1", "steel2", "night3"),
        4: ([(-24, 4, 5), (-12, 1, 6), (2, 0, 6), (16, 2, 5), (26, 5, 4)], "steel1", "steel2", "night3"),
    }
    frames = []
    for f in range(6):
        img = (failing if f <= 1 else breached).copy()
        if f in clouds:
            discs, body, rim, shade = clouds[f]
            cloud(img, [(mid + dx, y, r) for dx, y, r in discs], body, rim, shade)
        if 2 <= f <= 4:
            t = f - 1
            for piece, x, y, vx in chunks:
                img.alpha_composite(piece, (int(round(x + vx * 3 * t)), int(round(y - 3 * t + 2.5 * t * t))))
        frames.append(img)
    return frames


EFFECTS = {
    # name: (frames, fps)
    "slash-plain": (lambda: slash("plain"), 12),
    "slash-gold": (lambda: slash("gold"), 12),
    "slash-ember": (lambda: slash("ember"), 12),
    "crit": (crit, 12),
    "ember": (ember, 8),
    "ally-hit": (ally_hit, 12),
    "wall-impact": (wall_impact, 12),
    "repair": (repair, 8),
    "breach": (breach, 8),
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    rows = []
    for name, (make, fps) in EFFECTS.items():
        frames = make()
        pixkit.strip(frames).save(OUT / f"fx_{name}_strip{len(frames)}.png")
        if name != "breach":
            rows.append((name, frames))
    pixkit.contact_sheet(rows, scale=6).save(PREVIEW / "fx_x6.png")
    print("written")


if __name__ == "__main__":
    main()
