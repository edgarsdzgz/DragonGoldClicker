"""Draft masks for the compass, upgrade arrow and check mark; print outlined grids."""
import math

N = 12


def show(name, cells):
    """cells: {(x, y): letter}. Adds the ink outline and prints."""
    print(name)
    for y in range(N):
        row = ""
        for x in range(N):
            if (x, y) in cells:
                row += cells[(x, y)]
            elif any((x + dx, y + dy) in cells for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                row += "a"
            else:
                row += "."
        print(" ", row)


def seg_dist(px, py, ax, ay, bx, by):
    vx, vy, wx, wy = bx - ax, by - ay, px - ax, py - ay
    t = max(0, min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy)))
    return math.hypot(px - (ax + t * vx), py - (ay + t * vy))


# Compass: a brass case with a bow on top, cream face, needle pointing north-east.
cx, cy, r = 5.5, 6.5, 4.3
comp = {}
for y in range(N):
    for x in range(N):
        d = math.hypot(x - cx, y - cy)
        if d <= r:
            comp[(x, y)] = "g" if d > r - 1.2 else "f"
for x, y in ((5, 1), (6, 1)):
    comp[(x, y)] = "G"  # the bow
for x, y in ((8, 4), (7, 5)):
    comp[(x, y)] = "R"  # north: red
for x, y in ((4, 7), (3, 8)):
    comp[(x, y)] = "S"  # south: steel
comp[(6, 6)] = "R"
comp[(5, 7)] = "S"
show("compass", comp)

# Upgrade arrow: a head widening by one each side per row, then a shaft.
arrow = {}
for i, y in enumerate(range(1, 6)):
    for x in range(5 - i, 7 + i):
        arrow[(x, y)] = "g" if x <= 5 else "G"
for y in range(6, 11):
    for x in range(4, 8):
        arrow[(x, y)] = "g" if x <= 5 else "G"
show("arrow", arrow)

# Check mark: a short arm and a long arm, about 2 px thick.
check = {}
for y in range(N):
    for x in range(N):
        if seg_dist(x, y, 2, 6, 4.5, 8.5) <= 0.9 or seg_dist(x, y, 4.5, 8.5, 9.5, 2.5) <= 0.9:
            check[(x, y)] = "g"
show("check", check)
