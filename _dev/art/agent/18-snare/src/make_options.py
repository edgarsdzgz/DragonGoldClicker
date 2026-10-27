"""Write options.px: Snares and Nets as a box trap propped on a stick, 12x12.

Owner references (2026-10-26): a wooden box or crate tilted up on one edge, held by a forked
stick with a string tied at its foot, bait under it. Run: python make_options.py
"""
import math
import pathlib

N = 12
HERE = pathlib.Path(__file__).parent
N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))


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


def in_poly(px, py, pts):
    hit = False
    for (ax, ay), (bx, by) in zip(pts, pts[1:] + pts[:1]):
        if (ay > py) != (by > py) and px < ax + (py - ay) * (bx - ax) / (by - ay):
            hit = not hit
    return hit


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


def box_trap(bait, slope=0.6, height=5.0):
    """A plank box with upright ends on a strip of grass: its left edge on the ground, its right
    edge raised on a forked stick, open underneath with the bait inside; the string runs off."""
    def bottom(x):
        return 9.9 - (x - 0.5) * slope

    cells = {(x, 10): "G" for x in range(1, 11)}
    for x in range(1, 9):
        for y in range(1, 10):
            cy = y + 0.5
            if bottom(x) - height <= cy <= bottom(x):
                d = cy - (bottom(x) - height)  # depth below the top edge
                cells[(x, y)] = "W" if d < 1.0 else ("D" if int(d / 1.4) % 2 else "w")
    top_right = int(bottom(8.5))
    for y in range(top_right + 1, 10):
        cells[(9, y)] = "S"
    cells[(10, top_right)] = "S"  # the fork of the stick
    cells[(10, 9)] = "r"
    cells.update(bait)
    return cells


options = []
carrot = {(4, 9): "O", (5, 9): "O", (6, 9): "O", (7, 9): "g"}
options.append(("snare_box_carrot", "Snares and Nets A: a box trap propped on a forked stick, a carrot for bait",
                "a=ink W=wood4 w=wood3 D=wood2 S=parch1 r=parch2 O=fire1 g=green3 G=green2",
                outlined(box_trap(carrot))))
options.append(("snare_box", "Snares and Nets B: the box trap alone, propped on its stick",
                "a=ink W=wood4 w=wood3 D=wood2 S=parch1 r=parch2 G=green2", outlined(box_trap({}))))

# C: the same trap, the box tipped up more steeply.
options.append(("snare_box_steep", "Snares and Nets C: the box tipped up steeply on its stick, a carrot for bait",
                "a=ink W=wood4 w=wood3 D=wood2 S=parch1 r=parch2 O=fire1 g=green3 G=green2",
                outlined(box_trap(carrot, slope=0.85, height=4.4))))

# === Rope snares (owner references, 2026-10-26) =========================================
def ring(cx, cy, rx, ry, w=0.55):
    return cells_where(lambda px, py: abs(math.hypot((px - cx) / rx, (py - cy) / ry) - 1.0) * min(rx, ry) <= w)


def bezier_band(p0, p1, p2, r0, r1):
    out = set()
    for k in range(161):
        t = k / 160
        cx = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]
        cy = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
        r = r0 + (r1 - r0) * t
        out |= cells_where(lambda px, py: math.hypot(px - cx, py - cy) <= r)
    return out


# D: the spring snare: a bent sapling rising from the lower right and arching over, a line down
# from its tip to the noose. No ground strip, so the noose stays open.
cells = {}
sapling = bezier_band((9.4, 10.6), (10.4, 1.0), (3.4, 1.8), 1.0, 0.5)
cells.update({p: ("g" if p[0] + p[1] < 12 else "d") for p in sapling})
cells.update({(3, 3): "R"})
cells.update({p: "R" for p in ring(3.6, 7.2, 2.4, 2.6, 0.5)})
options.append(("snare_spring", "Snares and Nets D: a spring snare: a bent sapling, a line from its tip to the noose",
                "a=ink g=green3 d=green1 R=parch3", outlined(cells)))

# E: a noose hanging from a branch, a twig on the branch.
cells = {(x, 2): ("W" if x < 9 else "D") for x in range(1, 11)}
cells.update({(8, 1): "w", (3, 3): "D"})  # a twig above, a stub below
cells.update({(6, 3): "R"})
cells.update({p: "R" for p in ring(6.0, 7.2, 3.2, 3.0, 0.5)})
options.append(("snare_hanging", "Snares and Nets E: a noose hanging from a branch",
                "a=ink W=wood4 w=wood3 D=wood2 R=parch3", outlined(cells)))

# F: the noose alone on its stake: a short stake at the left, the rope running to an open loop.
cells = {(1, y): ("W" if y < 6 else "w") for y in range(3, 11)}
cells.update({(2, 4): "R", (3, 4): "R"})
cells.update({p: "R" for p in ring(6.8, 6.0, 3.6, 3.4, 0.5)})
options.append(("snare_stake", "Snares and Nets F: a snare on its stake, the noose wide open",
                "a=ink W=wood4 w=wood3 R=parch3", outlined(cells)))

lines = ["# Snares and Nets as a box trap, 2026-10-26. Written by make_options.py."]
for name, desc, key, rows in options:
    assert len(rows) == N and all(len(r) == N for r in rows), (name, [len(r) for r in rows])
    lines += ["", f"# {desc}", f"@asset icon_res_{name}", "size 12 12", "budget 8", f"key {key}", "frame"] + rows
(HERE / "options.px").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"{len(options)} options written")
