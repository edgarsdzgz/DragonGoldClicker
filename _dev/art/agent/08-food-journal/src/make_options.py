"""Write options.px: four Food and four Journal icon options, 12x12.

Hand grids where the shape is simple; circles and lines (drumstick, apple, quill) are drawn
from shapes and toned by the light from the upper left. Run: python make_options.py
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


def disc(cx, cy, r):
    return {(x, y) for x in range(N) for y in range(N) if math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r}


def line(ax, ay, bx, by, r):
    out = set()
    for x in range(N):
        for y in range(N):
            px, py = x + 0.5, y + 0.5
            vx, vy, wx, wy = bx - ax, by - ay, px - ax, py - ay
            t = max(0, min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy)))
            if math.hypot(px - (ax + t * vx), py - (ay + t * vy)) <= r:
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


options = []

# --- Food --------------------------------------------------------------------------------
options.append(("food_loaf", "Food A: a crusty loaf with three scored cuts",
                "a=ink H=gold5 m=gold3 p=parch3 G=gold2 D=gold1", [
                    "............",
                    "............",
                    "...aaaaaa...",
                    "..aHHHHHma..",
                    ".aHHmmmmmma.",
                    "aHmmpmpmpmGa",
                    "ammpmpmpmmGa",
                    "ammmmmmmmmGa",
                    ".aGGGGGGGGa.",
                    "..aDDDDDDa..",
                    "...aaaaaa...",
                    "............"]))

meat = disc(4.3, 4.3, 3.4)
bone = line(6.0, 6.0, 9.0, 9.0, 0.9) | disc(10.0, 8.8, 1.1) | disc(8.8, 10.0, 1.1)
cells = tone(meat, "H", "m", "G")
cells.update(tone(bone - meat, "w", "b", "s"))
options.append(("food_drumstick", "Food B: a roast drumstick, meat on the bone",
                "a=ink H=clay3 m=clay2 G=clay1 w=skin3 b=parch3 s=parch1", outlined(cells)))

options.append(("food_cheese", "Food C: a wedge of cheese with holes",
                "a=ink H=gold5 g=gold4 S=gold3 o=gold2", [
                    ".........aa.",
                    ".......aaHHa",
                    ".....aaHHHHa",
                    "...aaHHHoHHa",
                    ".aaHHHHHHHHa",
                    "agggggggggSa",
                    "aggogggoggSa",
                    "aggggoggggSa",
                    ".aaaaaaaaaa.",
                    "............",
                    "............",
                    "............"]))

apple = disc(5.5, 6.5, 4.2) - {(5, 2), (6, 2)}
cells = tone(apple, "H", "m", "G")
cells[(3, 4)] = "W"  # the shine
stem = {(5, 1), (5, 2)}
leaf = {(6, 1), (7, 1), (7, 0)} - {(7, 0)} | {(8, 1)}
cells.update({p: "s" for p in stem})
cells.update({p: "L" for p in leaf})
options.append(("food_apple", "Food D: an apple with a stem and a leaf",
                "a=ink W=parch3 H=clay3 m=clay2 G=clay1 s=wood2 L=green3", outlined(cells)))

# --- Journal -----------------------------------------------------------------------------
options.append(("journal_leather", "Journal A: a leather journal with a brass clasp and a ribbon",
                "a=ink S=wood1 L=wood4 m=wood3 d=wood2 p=parch3 g=gold4 H=gold5 R=clay2", [
                    ".aaaaaaaaaa.",
                    ".aSLLLLLLLpa",
                    ".aSLmmmmmmpa",
                    ".aSLmmmmmmpa",
                    ".aSLmmmmmmpa",
                    ".aSLmmmgHgga",
                    ".aSLmmmmmmpa",
                    ".aSLmmmmmmpa",
                    ".aSddddddddа".replace("а", "a"),
                    ".aaaaRaaaaa.",
                    "....aRa.....",
                    ".....a......"]))

options.append(("journal_open", "Journal B: an open book with lines of writing",
                "a=ink P=parch3 q=parch1 l=night3 C=night3", [
                    "............",
                    "............",
                    ".aaaa..aaaa.",
                    "aPPPPaaPPPPa",
                    "aPllPqqPllPa",
                    "aPPPPqqPPPPa",
                    "aPllPqqPllPa",
                    "aPPPPqqPPPPa",
                    "aPlPPqqPllPa",
                    "aCCCCCCCCCCa",
                    ".aaaaaaaaaa.",
                    "............"]))

pot = {(x, y) for x in range(2, 8) for y in range(8, 11)} | {(x, 7) for x in range(3, 7)}
cells = tone(pot, "h", "n", "d")
cells[(3, 8)] = "w"  # glint on the glass
shaft = {(5, 7), (6, 6), (7, 5), (8, 4), (9, 3), (10, 2), (10, 1)}
vane = {(6, 4), (7, 3), (8, 2), (9, 1), (7, 4), (8, 3), (9, 2), (6, 5), (5, 6)} - shaft
cells.update({p: "V" for p in vane})
cells.update({p: "q" for p in shaft if p not in pot})
cells[(4, 7)] = "k"  # the ink at the mouth
options.append(("journal_quill", "Journal C: Lirae's quill in an inkpot",
                "a=ink h=night4 n=night3 d=night2 w=steel5 V=steel4 q=gold4 k=night1", outlined(cells)))

options.append(("journal_scroll", "Journal D: a scroll with rolled ends, writing and a wax seal",
                "a=ink H=skin3 R=parch2 d=parch1 D=parch1 P=parch3 l=wood2 S=clay2", [
                    ".aaaaaaaaaa.",
                    "aHRRRRRRRRda",
                    "aDDDDDDDDDDa",
                    ".aPPPPPPPPa.",
                    ".aPllllllPa.",
                    ".aPPPPPPPPa.",
                    ".aPllllPPPa.",
                    ".aPPPPPSSPa.",
                    ".aPlllPSSPa.",
                    "aHRRRRRRRRda",
                    "aDDDDDDDDDDa",
                    ".aaaaaaaaaa."]))

lines = ["# Food and Journal options, 2026-10-26. Written by make_options.py."]
for name, desc, key, rows in options:
    lines += ["", f"# {desc}", f"@asset icon_{name}", "size 12 12", "budget 8", f"key {key}", "frame"] + rows
(HERE / "options.px").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"{len(options)} options written")
