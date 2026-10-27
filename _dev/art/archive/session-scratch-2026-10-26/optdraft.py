"""Draft grids for the close and reassign options that are easier to lay out in code."""
import math

N = 12
XSET = {(3, 3), (4, 3), (7, 3), (8, 3), (4, 4), (5, 4), (6, 4), (7, 4), (5, 5), (6, 5),
        (5, 6), (6, 6), (4, 7), (5, 7), (6, 7), (7, 7), (3, 8), (4, 8), (7, 8), (8, 8)}


def outlined(cells):
    rows = []
    for y in range(N):
        r = ""
        for x in range(N):
            if (x, y) in cells:
                r += cells[(x, y)]
            elif any((x + dx, y + dy) in cells for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                r += "a"
            else:
                r += "."
        rows.append(r)
    return rows


def disc(rows):
    return {(x, y) for y, xs in rows.items() for x in xs}


def rim_shade(m, inner):
    c = {}
    for x, y in m:
        edge = any((x + dx, y + dy) not in m for dx in (-1, 0, 1) for dy in (-1, 0, 1))
        if edge:
            c[(x, y)] = "H" if x + y <= 9 else ("g" if x + y <= 12 else "G")
        else:
            c[(x, y)] = inner(x, y)
    return c


ROUND = {1: range(4, 8), 2: range(2, 10), **{y: range(1, 11) for y in range(3, 9)},
         9: range(2, 10), 10: range(4, 8)}

# C2 steel boss: a domed buckler, the X engraved in ink.
m = disc(ROUND)
boss = rim_shade(m, lambda x, y: "h" if x + y <= 8 else "m")
for p in XSET:
    boss[p] = "a"
print("C2 boss")
print("\n".join(outlined(boss)))

# C3 wax seal: an uneven red-brick blob with the X pressed in.
m = disc(ROUND) | {(0, 5), (11, 7), (6, 11), (3, 0)}
seal = rim_shade(m, lambda x, y: "g")
for p in XSET:
    seal[p] = "G"
for p in ((4, 3), (5, 4), (4, 8), (5, 7)):
    seal[p] = "k"  # the deepest part of the impression
print("C3 seal")
print("\n".join(outlined(seal)))

# C4 crossed planks: two boards nailed over each other.
planks = {}
for x in range(1, 11):
    for y in range(1, 11):
        if x - y in (0, 1) or x - y == -1 and False:
            planks[(x, y)] = "w" if x - y == 1 else "W"
        if x + y in (10, 11):
            planks[(x, y)] = "v" if x + y == 10 else "V"
for p in ((5, 5), (6, 5)):
    planks[p] = "n"  # the nail where they cross
print("C4 planks")
print("\n".join(outlined(planks)))

# R1 cycle: a ring of two arcs chasing each other, a head at the end of each.
ring = {}
for y in range(N):
    for x in range(N):
        d = math.hypot(x - 5.5, y - 5.5)
        ang = math.degrees(math.atan2(5.5 - y, x - 5.5)) % 360
        if 2.6 <= d <= 4.4 and not (120 <= ang <= 160 or 300 <= ang <= 340):
            ring[(x, y)] = "H" if 0 <= ang < 180 else "g"
print("R1 cycle")
print("\n".join(outlined(ring)))
