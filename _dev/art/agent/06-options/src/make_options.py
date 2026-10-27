"""Write options.px: candidate designs for the Close, Reassign and Soldiers (helm) icons.

Each option is a mask plus a color rule; the ink outline is added around every shape.
The owner picks one per icon before anything is locked. Run: python make_options.py
"""
import math
import pathlib

N = 12
HERE = pathlib.Path(__file__).parent
N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))

# A 2-px X inside the middle 6x6.
XSET = {(3, 3), (4, 3), (7, 3), (8, 3), (4, 4), (5, 4), (6, 4), (7, 4), (5, 5), (6, 5),
        (5, 6), (6, 6), (4, 7), (5, 7), (6, 7), (7, 7), (3, 8), (4, 8), (7, 8), (8, 8)}
ROUND = {1: range(4, 8), 2: range(2, 10), **{y: range(1, 11) for y in range(3, 9)},
         9: range(2, 10), 10: range(4, 8)}


def rows_to_set(rows):
    return {(x, y) for y, xs in rows.items() for x in xs}


def grid(cells):
    """cells: {(x, y): char}; '.' around, ink outline where a clear pixel touches the shape."""
    out = []
    for y in range(N):
        row = ""
        for x in range(N):
            if (x, y) in cells:
                row += cells[(x, y)]
            elif any((x + dx, y + dy) in cells for dx, dy in N4):
                row += "a"
            else:
                row += "."
        out.append(row)
    return out


def rim(m, x, y):
    return any((x + dx, y + dy) not in m for dx in (-1, 0, 1) for dy in (-1, 0, 1))


def diag_light(x, y):
    """On a round object lit from the upper left: light, mid or dark by position."""
    return "H" if x + y <= 9 else ("g" if x + y <= 12 else "G")


options = []

# --- Close ------------------------------------------------------------------------------
m = rows_to_set({1: range(2, 10), **{y: range(1, 11) for y in range(2, 10)}, 10: range(2, 10)})
c = {}
for x, y in m:
    c[(x, y)] = "n" if (y == 1 or x == 1) else ("d" if (y == 10 or x == 10) else "m")
for x, y in XSET:
    c[(x, y)] = "h" if (x == y or x + y == 11) else "s"
options.append(("close_plate", "Close A: a steel X on a stepped stone plate, like the game's panels",
                "a=ink n=night3 m=night2 d=night1 h=steel5 s=steel3", c))

m = rows_to_set(ROUND)
c = {(x, y): (diag_light(x, y) if rim(m, x, y) else ("h" if x + y <= 8 else "m")) for x, y in m}
c = {p: {"H": "H", "g": "m", "G": "s", "h": "h", "m": "m"}[v] for p, v in c.items()}
for p in XSET:
    c[p] = "a"
options.append(("close_boss", "Close B: an X cut into a round steel boss",
                "a=ink H=steel5 h=steel4 m=steel3 s=steel2", c))

m = rows_to_set(ROUND) | {(1, 2), (10, 9), (8, 10)}
c = {(x, y): (diag_light(x, y) if rim(m, x, y) else "g") for x, y in m}
for p in XSET:
    c[p] = "k"
for x, y in XSET:  # the lip of the impression catches the light below and to the right
    for q in ((x + 1, y + 1),):
        if q in m and q not in XSET:
            c[q] = "H"
options.append(("close_seal", "Close C: an X pressed into a brick-red wax seal",
                "a=ink H=clay3 g=clay2 G=clay1 k=red1", c))

c = {}
for x in range(1, 11):
    for y in range(1, 11):
        if x - y in (-1, 0, 1):
            c[(x, y)] = {1: "w", 0: "W", -1: "V"}[x - y]
        if x + y in (10, 11, 12):
            c[(x, y)] = {10: "w", 11: "W", 12: "V"}[x + y]
for p in ((5, 5), (6, 6)):
    c[p] = "n"  # nails where the boards cross
options.append(("close_planks", "Close D: two boards nailed in an X, boarded shut",
                "a=ink w=wood4 W=wood3 v=wood3 V=wood2 n=steel3", c))

# --- Reassign ---------------------------------------------------------------------------
top = rows_to_set({1: range(4, 8), 2: [3, 4, 7, 8], 3: [2, 3, 8, 9], 4: [2, 3, 7, 8, 9, 10], 5: [8, 9]})
bottom = {(11 - x, 11 - y) for x, y in top}
c = {p: ("H" if p[1] <= 3 else "m") for p in top}
c.update({p: ("g" if p[1] <= 7 else "G") for p in bottom})
options.append(("reassign_cycle", "Reassign A: two arrows chasing each other round a loop, steel and gold",
                "a=ink H=steel5 m=steel3 g=gold4 G=gold2", c))

top = {(x, y) for x in range(1, 7) for y in (3, 4)} | {(7, y) for y in range(1, 6)} \
    | {(8, y) for y in range(2, 5)} | {(9, 3)}
bottom = {(11 - x, 11 - y) for x, y in top}
c = {p: ("d" if p[1] == 4 or (p[1] == 5) else "H") for p in top}
c.update({p: ("G" if p[1] == 8 or p[1] == 10 else "g") for p in bottom})
for p in bottom:
    if p[1] == 7 and p[0] >= 5:
        c[p] = "g"
options.append(("reassign_chunky", "Reassign B: chunky arrows with a dark underside, steel over gold",
                "a=ink H=steel5 d=steel1 g=gold4 G=gold1", c))


m = rows_to_set({1: range(2, 10), **{y: range(1, 11) for y in range(2, 10)}, 10: range(2, 10)})
c = {}
for x, y in m:
    c[(x, y)] = "n" if (y == 1 or x == 1) else ("d" if (y == 10 or x == 10) else "m")
for p in {(x, 4) for x in range(3, 7)} | {(7, 3), (7, 4), (7, 5), (8, 4)}:
    c[p] = "h"  # steel arrow, right
for p in {(x, 7) for x in range(5, 9)} | {(4, 6), (4, 7), (4, 8), (3, 7)}:
    c[p] = "g"  # gold arrow, left
options.append(("reassign_plate", "Reassign C: the two arrows on the stone plate, a pair with Close A",
                "a=ink n=night3 m=night2 d=night1 h=steel5 g=gold4", c))

# --- Soldiers (helm) --------------------------------------------------------------------


def helm(m, opening, ridge=()):
    c = {}
    for x, y in m:
        left = (x - 1, y) not in m
        right = (x + 1, y) not in m
        c[(x, y)] = ("r" if y == max(yy for _, yy in m) else "h" if left or (x, y) in ridge
                     else "s" if right else "m")
    for p in opening:
        c[p] = "a"
    return c


m = rows_to_set({1: range(4, 8), 2: range(3, 9), **{y: range(2, 10) for y in range(3, 11)}})
t_slot = {(x, 5) for x in range(3, 9)} | {(x, y) for x in (5, 6) for y in range(6, 11)}
options.append(("helm_barbute", "Helm A: a barbute, a rounded dome with the dark T opening",
                "a=ink h=steel5 m=steel3 s=steel2 r=steel1",
                helm(m, t_slot, ridge={(5, 1), (5, 2), (5, 3), (5, 4)})))

m = rows_to_set({1: [5, 6], 2: range(4, 8), 3: range(3, 9), **{y: range(2, 10) for y in range(4, 11)}})
c = helm(m, {(3, 5), (4, 5), (7, 5), (8, 5), (3, 8), (8, 8)})
for y in range(3, 11):
    c[(5, y)], c[(6, y)] = "g", "G"
options.append(("helm_sugarloaf", "Helm B: a sugarloaf great helm, pointed dome, brass cross, eye slits",
                "a=ink h=steel5 m=steel3 s=steel2 r=steel1 g=gold4 G=gold2", c))

m = rows_to_set({3: range(4, 8), 4: range(3, 9), **{y: range(2, 10) for y in range(5, 11)}})
t_slot = {(x, 6) for x in range(3, 9)} | {(x, y) for x in (5, 6) for y in range(7, 11)}
c = helm(m, t_slot, ridge={(5, 3), (5, 4), (5, 5)})
c.update({(x, 1): "R" for x in range(4, 8)})
c.update({(5, 2): "D", (6, 2): "D"})
options.append(("helm_plumed", "Helm C: the barbute with a red crest",
                "a=ink h=steel5 m=steel3 s=steel2 r=steel1 R=red3 D=red2", c))

lines = ["# Options for Close, Reassign and the Soldiers helm, 2026-10-26. Written by make_options.py."]
for name, desc, key, cells in options:
    lines += ["", f"# {desc}", f"@asset icon_{name}", "size 12 12", "budget 8", f"key {key}", "frame"]
    lines += grid(cells)
(HERE / "options.px").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"{len(options)} options written")
