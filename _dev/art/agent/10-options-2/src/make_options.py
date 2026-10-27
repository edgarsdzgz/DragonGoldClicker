"""Write options.px: options for Rising and Falling stores, Unknown, Info and Stats, 12x12.

Hand grids where the shape is simple; arrows, gems, sacks and the crystal ball are drawn from
shapes and toned by the light from the upper left. Run: python make_options.py
"""
import math
import pathlib

N = 12
HERE = pathlib.Path(__file__).parent
N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))


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


def inside(x, y):
    return 1 <= x <= N - 2 and 1 <= y <= N - 2


def disc(cx, cy, r):
    return {(x, y) for x in range(N) for y in range(N)
            if inside(x, y) and math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r}


def line(ax, ay, bx, by, r):
    out = set()
    for x in range(N):
        for y in range(N):
            px, py = x + 0.5, y + 0.5
            vx, vy, wx, wy = bx - ax, by - ay, px - ax, py - ay
            t = max(0, min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy)))
            if inside(x, y) and math.hypot(px - (ax + t * vx), py - (ay + t * vy)) <= r:
                out.add((x, y))
    return out


def tone(m, light, mid, dark):
    """Light on edges facing up or left, dark on edges facing down or right."""
    c = {}
    for x, y in m:
        up = (x, y - 1) not in m or (x - 1, y) not in m
        down = (x, y + 1) not in m or (x + 1, y) not in m
        c[(x, y)] = light if up and not down else (dark if down and not up else mid)
    return c


def flip(m):
    return {(x, N - 1 - y) for x, y in m}


RISE = "a=ink H=green3 g=green2 G=green1"
FALL = "a=ink H=clay3 g=clay2 G=clay1"
options = []


def pair(stem, desc, rise_cells, fall_cells, extra=""):
    options.append((f"rising_{stem}", f"Rising {desc}", (RISE + " " + extra).strip(), outlined(rise_cells)))
    options.append((f"falling_{stem}", f"Falling {desc}", (FALL + " " + extra).strip(), outlined(fall_cells)))


# --- Rising and falling stores ------------------------------------------------------------
# A: the zigzag, polished: a thicker line in clean 45-degree runs and a broad arrowhead.
path = [(1.5, 10.0), (4.0, 7.5), (5.5, 9.0), (8.0, 6.5)]
zig = set()
for (ax, ay), (bx, by) in zip(path, path[1:]):
    zig |= line(ax, ay, bx, by, 0.95)
zig |= {(x, y) for x in range(5, 11) for y in range(1, 7) if (10 - x) + (y - 1) <= 5}
pair("zigzag", "A: the trend line, polished", tone(zig, "H", "g", "G"), tone(flip(zig), "H", "g", "G"))

# B: one bold diagonal arrow.
diag = line(2.0, 10.0, 7.0, 5.0, 1.15)
diag |= {(x, y) for x in range(5, 11) for y in range(1, 7) if (10 - x) + (y - 1) <= 5}
pair("diagonal", "B: one bold diagonal arrow", tone(diag, "H", "g", "G"), tone(flip(diag), "H", "g", "G"))


def chevron(cy):
    return {(x, y) for x in range(N) for y in range(N) if inside(x, y)
            and abs(x + 0.5 - 6) <= 4.0 and 0 <= (y + 0.5) - (cy + abs(x + 0.5 - 6)) < 2.0}


chev = chevron(1.0) | chevron(5.5)
pair("chevrons", "C: two stacked chevrons, the sign a herald would paint",
     tone(chev, "H", "g", "G"), tone(flip(chev), "H", "g", "G"))

# D: a faceted gem triangle: lit left face, shaded right face.
gem = {(x, y) for x in range(N) for y in range(N) if inside(x, y)
       and abs(x + 0.5 - 6) <= (y + 0.5 - 1.2) * 0.58 and y <= 9}


def facets(m, point_up):
    """Left face mid, right face dark; the lit edge is the left slope (up) or the flat top (down)."""
    c = {}
    for x, y in m:
        c[(x, y)] = "g" if x < 6 else "G"
        if point_up and (x - 1, y) not in m:
            c[(x, y)] = "H"
        if not point_up and (x, y - 1) not in m:
            c[(x, y)] = "H"
    return c


pair("gem", "D: a cut gem pointing the way", facets(gem, True), facets(flip(gem), False))

# E: a sack of grain with a small arrow beside it: the stores themselves.
sack = disc(4.4, 7.6, 3.3) | {(3, 3), (4, 3), (5, 3), (3, 4), (4, 4), (5, 4)}
grain = {(3, 2), (4, 2), (5, 2)}
up_arrow = {(9, 1), (8, 2), (9, 2), (10, 2), (9, 3), (9, 4), (9, 5), (9, 6)}
down_arrow = {(9, 1), (9, 2), (9, 3), (9, 4), (9, 5), (8, 5), (10, 5), (9, 6)}


def sack_cells(arrow):
    c = tone(sack, "p", "q", "Q")
    c.update({(3, 4): "t", (4, 4): "t", (5, 4): "t"})  # the tie
    c.update({p: "w" for p in grain})
    c.update({p: "g" for p in arrow})
    c[(9, 1 if arrow is up_arrow else 6)] = "H"
    return c


pair("sack", "E: a sack of grain with an arrow", sack_cells(up_arrow), sack_cells(down_arrow),
     "p=parch3 q=parch2 Q=parch1 t=wood2 w=gold5")

# --- Unknown and help ---------------------------------------------------------------------
options.append(("unknown_runestone", "Unknown A: a question mark carved in a mossy standing stone",
                "a=ink h=steel4 m=steel3 s=steel2 c=night1 e=steel5 g=green2", [
                    "...aaaaaa...",
                    "..ahhhhhma..",
                    ".ahmmmmmmsa.",
                    ".ahmcccmmsa.",
                    ".ahcemmcmsa.",
                    ".ahmmmmcesa.",
                    ".ahmmmcemsa.",
                    ".ahmmmcmmsa.",
                    ".ahmmmemmsa.",
                    ".ahmmmcmmsa.",
                    ".agggmmgggа.".replace("а", "a"),
                    ".aaaaaaaaaa."]))

ball = disc(6.0, 5.0, 4.2)
cells = tone(ball, "L", "m", "d")
mist = {(5, 2), (6, 2), (4, 3), (7, 3), (6, 4), (6, 5), (6, 7)}
cells.update({p: "q" for p in mist})
cells[(3, 3)] = "W"
cells.update({(x, 9): "w" for x in range(3, 9)})
cells.update({(x, 10): "D" for x in range(2, 10)})
options.append(("unknown_crystal", "Unknown B: a crystal ball, a question clouding inside",
                "a=ink W=steel5 q=steel4 L=night4 m=night3 d=night2 w=wood4 D=wood2", outlined(cells)))

options.append(("unknown_notice", "Unknown C: a notice nailed to a board, a question inked on it",
                "a=ink P=parch3 D=parch1 q=parch2 k=wood1 n=steel3", [
                    "............",
                    ".aaaaaaaaaa.",
                    ".aPPPnPPPDa.",
                    ".aPPkkkPPDa.",
                    ".aPkPPPkPDa.",
                    ".aPPPPPkPDa.",
                    ".aPPPPkPPDa.",
                    ".aPPPkPPPDa.",
                    ".aPPPPPPPDa.",
                    ".aPPPkPPDqa.",
                    ".aDDDDDDqa..",
                    ".aaaaaaaa..."]))

options.append(("unknown_owl", "Help D: a wise owl (for help more than for unknown)",
                "a=ink B=wood4 D=wood2 f=parch3 g=gold4 c=parch2 d=parch1", [
                    ".aa......aa.",
                    ".aBaaaaaaBa.",
                    "aBBBBBBBBBBa",
                    "aBfffBBfffBa",
                    "aBfafBBfafBa",
                    "aBfffggfffBa",
                    "aBBBBggBBBDa",
                    "aBBcccccBBDa",
                    ".aBcdcdcBDa.",
                    ".aBcccccBDa.",
                    "..aBBBBBDa..",
                    "...aaaaaa..."]))

# --- Info ---------------------------------------------------------------------------------
options.append(("info_runestone", "Info A: an i carved in the same mossy stone",
                "a=ink h=steel4 m=steel3 s=steel2 c=night1 e=steel5 g=green2", [
                    "...aaaaaa...",
                    "..ahhhhhma..",
                    ".ahmmmmmmsa.",
                    ".ahmmcemmsa.",
                    ".ahmmmmmmsa.",
                    ".ahmccemmsa.",
                    ".ahmmcemmsa.",
                    ".ahmmcemmsa.",
                    ".ahmmcemmsa.",
                    ".ahmcccemsa.",
                    ".agggmmggga.",
                    ".aaaaaaaaaa."]))

options.append(("info_illuminated", "Info B: an illuminated letter, blue with a gold dot, in a gilt frame",
                "a=ink H=gold5 G=gold2 P=parch3 b=sea2 B=sea1", [
                    ".aaaaaaaaaa.",
                    ".aHHHHHHHGa.",
                    ".aHPPPPPPGa.",
                    ".aHPPHHPPGa.",
                    ".aHPPPPPPGa.",
                    ".aHPbbBPPGa.",
                    ".aHPPbBPPGa.",
                    ".aHPPbBPPGa.",
                    ".aHPPbBPPGa.",
                    ".aHPbbbBPGa.",
                    ".aGGGGGGGGa.",
                    ".aaaaaaaaaa."]))

options.append(("info_lantern", "Info C: a brass lantern, lighting the way",
                "a=ink H=gold4 G=gold2 g=gold3 W=fire3 Y=fire2 O=fire1", [
                    "....aaaa....",
                    "....a..a....",
                    "...aaaaaa...",
                    "..aHHHHHGa..",
                    "..aaaaaaaa..",
                    "..agWWYgGa..",
                    "..agWYYgGa..",
                    "..agYYOgGa..",
                    "..agYOOgGa..",
                    "..aaaaaaaa..",
                    "..aHHHHHGa..",
                    "..aaaaaaaa.."]))

# --- Stats --------------------------------------------------------------------------------
options.append(("stats_tally", "Stats B: chalk tally marks on a slate in a wooden frame",
                "a=ink W=wood4 D=wood2 k=night2 c=parch3", [
                    "............",
                    "aaaaaaaaaaaa",
                    "aWWWWWWWWWDa",
                    "aWkkkkkkkkDa",
                    "aWkckckckcDa",
                    "aWkckckcccDa",
                    "aWkckccckcDa",
                    "aWkccckckcDa",
                    "aWcckckckcDa",
                    "aDDDDDDDDDDa",
                    "aaaaaaaaaaaa",
                    "............"]))

options.append(("stats_abacus", "Stats C: an abacus, beads counted along three rods",
                "a=ink W=wood4 D=wood2 k=night1 r=steel2 H=gold5 G=gold3 B=sea3 b=sea1", [
                    "aaaaaaaaaaaa",
                    "aWWWWWWWWWDa",
                    "aWHHkHHkkkDa",
                    "aWGGrGGrrrDa",
                    "aWkkkkkkkkDa",
                    "aWkkkBBkBBDa",
                    "aWrrrbbrbbDa",
                    "aWkkkkkkkkDa",
                    "aWHHHHkkkkDa",
                    "aWGGGGrrrrDa",
                    "aDDDDDDDDDDa",
                    "aaaaaaaaaaaa"]))

lines = ["# Interface options 2, 2026-10-26. Written by make_options.py."]
for name, desc, key, rows in options:
    assert len(rows) == N and all(len(r) == N for r in rows), name
    lines += ["", f"# {desc}", f"@asset icon_{name}", "size 12 12", "budget 8", f"key {key}", "frame"] + rows
(HERE / "options.px").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"{len(options)} options written")
