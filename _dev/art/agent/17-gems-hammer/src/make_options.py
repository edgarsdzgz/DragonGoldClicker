"""Write options.px: Dragon Anatomy as a cut magic gem (three cuts, five colors), and Tempered
Steel as hammer and anvil with the hammer in the foreground. 12x12.

Run: python make_options.py
"""
import math
import pathlib

N = 12
HERE = pathlib.Path(__file__).parent
N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))

# Each gem grid uses H (highlight), L (light), m (mid), d (dark) and W (white glint).
CUTS = {
    "shard": ("a tall shard, faceted, with a twinkle beside it", [
        "...aa....a..",
        "..aWHa..aHa.",
        ".aLHmdaaHWHa",
        ".aLHmda.aHa.",
        "aLLHmdda.a..",
        "aLLHmmda....",
        "aLLHmmda....",
        "aLLmmdda..a.",
        ".aLmmda..aWa",
        "..aLda....a.",
        "...aa.......",
        "............"]),
    "brilliant": ("a brilliant cut seen from the side: table, crown and pavilion", [
        "..........a.",
        ".........aWa",
        "...aaaaaa.a.",
        "..aLHHHHma..",
        ".aLLHWHmmda.",
        "aLLLmmmmddda",
        ".aLHLmmmdda.",
        "..aLHmmdda..",
        "...aLHmda...",
        "....aLda....",
        ".....aa.....",
        "............"]),
    "emerald": ("an emerald (step) cut seen from above: two steps and a glinting table", [
        "...aaaaaa.a.",
        "..aLLLLLLaWa",
        ".aLmmmmmmda.",
        ".aLmHHHHmda.",
        ".aLmHWHHmda.",
        ".aLmHHHHmda.",
        ".aLmHHHLmda.",
        ".aLmHHLLmda.",
        ".aLmmmmmmda.",
        "..adddddda..",
        "...aaaaaa...",
        "............"]),
}
COLORS = [("emerald", "green"), ("azure", "electric blue"), ("rose", "pink"), ("ruby", "ruby"),
          ("magenta", "magenta"), ("teal", "teal")]

options = []
for cut, (desc, rows) in CUTS.items():
    for ramp, label in COLORS:
        key = f"a=ink W=steel5 H={ramp}4 L={ramp}3 m={ramp}2 d={ramp}1"
        options.append((f"gem_{cut}_{ramp}", f"Dragon Anatomy gem: {desc}, {label}", key, rows))


# === Tempered Steel: hammer in front of the anvil =========================================
def inside(x, y):
    return 1 <= x <= N - 2 and 1 <= y <= N - 2


def cells_where(test):
    return {(x, y) for x in range(N) for y in range(N) if inside(x, y) and test(x + 0.5, y + 0.5)}


def line(ax, ay, bx, by, r):
    def near(px, py):
        vx, vy, wx, wy = bx - ax, by - ay, px - ax, py - ay
        t = max(0, min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy)))
        return math.hypot(px - (ax + t * vx), py - (ay + t * vy)) <= r
    return cells_where(near)


def outlined(cells):
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


def anvil(dx, dy):
    """Kael's anvil: horn to the left, a lit face, dark body, waist and base."""
    c = {(x + dx, 3 + dy): "h" for x in range(1, 11)}
    c.update({(x + dx, 4 + dy): ("s" if x == 9 else "m") for x in range(3, 10)})
    c.update({(x + dx, y + dy): ("s" if x == 7 else "m") for x in range(4, 8) for y in (5, 6)})
    c.update({(x + dx, y + dy): ("s" if y == 8 or x == 9 else "m") for x in range(3, 10) for y in (7, 8)})
    return {p: v for p, v in c.items() if inside(*p)}


def over(cells, shape, colors):
    """Draw shape in front of cells, with an ink line where it crosses them."""
    for x, y in shape:
        for ox, oy in N4:
            q = (x + ox, y + oy)
            if q in cells and q not in shape:
                cells[q] = "a"
    cells.update(colors)


# A: the hammer lying on the ground in front of the anvil, head upright at the left.
cells = anvil(1, -1)
head = {(x, y) for x in range(1, 4) for y in range(7, 10)} | {(2, 10)}
handle = line(4.2, 9.5, 10.4, 9.5, 0.55) - head
colors = {}
for x, y in head:  # flat face on top, the peen narrowing below; lit from the left
    colors[(x, y)] = "H" if y == 7 or x == 1 else ("M" if x == 2 else "S")
colors.update({p: "w" for p in handle})
over(cells, head | handle, colors)
options.append(("steel_hammer_front", "Tempered Steel: the cross-peen hammer lying in front of Kael's anvil",
                "a=ink h=steel4 m=steel2 s=steel1 H=steel5 M=steel3 S=steel2 w=wood4 D=wood2", outlined(cells)))

# B: the hammer leaning across the front of the anvil, head up at the left, handle to the ground.
cells = anvil(1, -1)
handle = line(4.0, 4.6, 9.8, 10.4, 0.62)
head = line(1.6, 5.2, 4.6, 2.2, 1.25) - handle
colors = {p: ("w" if p[0] - p[1] <= -1 else "D") for p in handle}
for x, y in head:  # the face end (lower left) broad and lit, the peen end (upper right) narrower
    colors[(x, y)] = "H" if x + y <= 5 else ("M" if x + y <= 6 else "S")
over(cells, head | handle, colors)
options.append(("steel_hammer_lean", "Tempered Steel: the cross-peen hammer leaning across the front of Kael's anvil",
                "a=ink h=steel4 m=steel2 s=steel1 H=steel5 M=steel3 S=steel2 w=wood4 D=wood2", outlined(cells)))

# C: the big hammer of B, lying diagonally on the ground in front of the anvil: the head resting
# on the ground at the lower left, the handle running back and up to the right. Three angles.
def ground_hammer(ha, hb, center, r_head=1.35, half=1.7):
    cells = anvil(1, -1)
    handle = line(*ha, *hb, 0.6)
    dx, dy = hb[0] - ha[0], hb[1] - ha[1]
    ln = math.hypot(dx, dy)
    px, py = -dy / ln, dx / ln  # across the handle: the head's long axis
    a = (center[0] - px * half, center[1] - py * half)
    b = (center[0] + px * half, center[1] + py * half)
    head = line(*a, *b, r_head)
    handle -= head
    colors = {p: ("w" if (p[0] + 0.5 - ha[0]) * py - (p[1] + 0.5 - ha[1]) * px >= 0 else "D") for p in handle}
    for x, y in head:  # lit from the upper left
        t = (x + 0.5 - center[0]) + (y + 0.5 - center[1])
        colors[(x, y)] = "H" if t < -0.6 else ("M" if t < 0.8 else "S")
    over(cells, head | handle, colors)
    return outlined(cells)


for name, ha, hb, center, desc in [
        ("ground_low", (4.4, 9.4), (10.6, 7.0), (2.7, 8.5), "shallow"),
        ("ground_mid", (4.2, 9.0), (10.2, 5.4), (2.8, 8.3), "middle"),
        ("ground_steep", (4.0, 8.6), (9.4, 3.8), (2.9, 8.0), "steep")]:
    options.append((f"steel_hammer_{name}",
                    f"Tempered Steel: the big cross-peen hammer lying diagonally on the ground before the anvil, {desc} angle",
                    "a=ink h=steel4 m=steel2 s=steel1 H=steel5 M=steel3 S=steel2 w=wood4 D=wood2",
                    ground_hammer(ha, hb, center)))

# D: A's layout (the hammer lying flat in front of the anvil) with B's big head, squared off into a
# rectangle: three wide, five tall, standing on the ground; the handle along the ground.
cells = anvil(1, -1)
head = {(x, y) for x in range(1, 4) for y in range(6, 11)}
handle = line(4.2, 8.5, 10.4, 8.5, 0.55)
colors = {}
for x, y in head:  # lit top and left face, shaded right face, as on B's head
    colors[(x, y)] = "H" if (y == 6 or x == 1) else ("S" if x == 3 else "M")
colors.update({p: "w" for p in handle})
over(cells, head | handle, colors)
options.append(("steel_hammer_front_big", "Tempered Steel: the hammer lying in front of the anvil, with B's big rectangular head",
                "a=ink h=steel4 m=steel2 s=steel1 H=steel5 M=steel3 S=steel2 w=wood4", outlined(cells)))

lines = ["# Gems and hammer options, 2026-10-26. Written by make_options.py."]
for name, desc, key, rows in options:
    assert len(rows) == N and all(len(r) == N for r in rows), (name, [len(r) for r in rows])
    lines += ["", f"# {desc}", f"@asset icon_res_{name}", "size 12 12", "budget 8", f"key {key}", "frame"] + rows
(HERE / "options.px").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"{len(options)} options written")
