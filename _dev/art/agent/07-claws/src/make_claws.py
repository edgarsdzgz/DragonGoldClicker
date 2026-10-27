"""Write claws.px: the nine claw tiers (types/claws.ts), 16x16, one hooked claw each.

The claw is a curved, tapering horn along a quadratic curve. Tiers grow longer, sharper and
more hooked. Colors follow the game's slash (theme warfront.claw*): plain bone and steel to
Hardened, gold from Serrated, ember from Ember. Claw shapes only, never the dragon.
Run: python make_claws.py
"""
import math
import pathlib

N = 16
HERE = pathlib.Path(__file__).parent
N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))

# name, length, base width, curl (tip swings left), bend (belly swings right), taper power,
# serrated, palette: dark, mid, light, tip.
TIERS = [
    ("fledgling", 7.5, 5.2, 2.0, 1.0, 0.5, False, ("parch1", "parch3", "skin3", "parch3")),
    ("sharpened", 9.0, 5.2, 2.5, 1.2, 1.0, False, ("parch1", "parch3", "skin3", "steel5")),
    ("hooked", 10.0, 5.4, 5.0, 2.5, 1.0, False, ("parch1", "parch3", "skin3", "steel5")),
    ("hardened", 10.5, 6.2, 5.0, 2.5, 0.9, False, ("steel1", "steel3", "steel4", "steel5")),
    ("serrated", 11.0, 6.2, 5.5, 2.8, 1.0, True, ("gold2", "gold4", "gold5", "gold6")),
    ("obsidian", 11.5, 6.6, 5.5, 2.8, 1.1, False, ("night1", "night2", "night4", "gold5")),
    ("ember", 12.0, 7.0, 6.0, 3.0, 1.1, False, ("red2", "fire1", "fire2", "fire3")),
    ("dragonsteel", 12.5, 7.2, 6.0, 3.0, 1.2, False, ("red3", "steel3", "steel5", "fire3")),
    ("ancient", 13.0, 8.0, 6.5, 3.2, 1.2, True, ("gold1", "gold4", "gold6", "fire3")),
]
LETTERS = ("D", "M", "L", "T")
LIGHT = (-math.sqrt(0.5), -math.sqrt(0.5))  # from the upper left


def talon(cells, bx, by, length, width, curl, bend, power, serrated):
    """Rasterize one talon into cells {(x, y): letter}."""
    tx, ty = bx - curl, by + length
    px, py = bx + bend, by + length * 0.5
    samples = []
    for i in range(201):
        t = i / 200
        x = (1 - t) ** 2 * bx + 2 * (1 - t) * t * px + t * t * tx
        y = (1 - t) ** 2 * by + 2 * (1 - t) * t * py + t * t * ty
        dx = 2 * (1 - t) * (px - bx) + 2 * t * (tx - px)
        dy = 2 * (1 - t) * (py - by) + 2 * t * (ty - py)
        r = 0.5 * width * (1 - t) ** power + 0.5
        samples.append((x, y, dx, dy, r, t))
    for gy in range(1, N - 1):  # keep a pixel free on every side for the outline
        for gx in range(1, N - 1):
            cx, cy = gx + 0.5, gy + 0.5
            best = min(samples, key=lambda s: math.hypot(cx - s[0], cy - s[1]) - s[4])
            x, y, dx, dy, r, t = best
            d = math.hypot(cx - x, cy - y)
            if d - r > 0:
                continue
            nx, ny = (cx - x) / max(d, 1e-6), (cy - y) / max(d, 1e-6)
            # The concave (inner) side is to the left of the direction of travel.
            inner = (dx * (cy - y) - dy * (cx - x)) < 0
            if serrated and inner and d > r * 0.3 and 0.15 < t < 0.75 and int(t * 10) % 2 == 0:
                continue  # a notch
            facing = nx * LIGHT[0] + ny * LIGHT[1]
            letter = "T" if t > 0.8 else ("L" if facing > 0.35 else ("D" if facing < -0.35 else "M"))
            cells[(gx, gy)] = letter


def grid(cells):
    rows = []
    for y in range(N):
        row = ""
        for x in range(N):
            if (x, y) in cells:
                row += cells[(x, y)]
            elif any((x + dx, y + dy) in cells for dx, dy in N4):
                row += "a"
            else:
                row += "."
        rows.append(row)
    return rows


lines = ["# The nine claw tiers, 16x16, written by make_claws.py (2026-10-26)."]
for i, (name, length, width, curl, bend, power, serrated, pal) in enumerate(TIERS, 1):
    cells = {}
    talon(cells, 8.0 + curl * 0.5, 2.0, length, width, curl, bend, power, serrated)
    key = "a=ink " + " ".join(f"{l}={p}" for l, p in zip(LETTERS, pal))
    lines += ["", f"# Tier {i}: {name.title()} Claws", f"@asset icon_claw-{i}", "size 16 16",
              "budget 6", f"key {key}", "frame"] + grid(cells)
(HERE / "claws.px").write_text("\n".join(lines) + "\n", encoding="utf-8")
print("9 tiers written")
