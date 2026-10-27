"""Write options.px: options for Dragon Anatomy, Mortar Craft, Tempered Steel and Evacuation Drills.

Hand grids where the shape is simple; claws, lens, bucket, runner and horn are drawn from shapes.
Run: python make_options.py
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


def cells_where(test):
    return {(x, y) for x in range(N) for y in range(N) if inside(x, y) and test(x + 0.5, y + 0.5)}


def tone(m, light, mid, dark):
    """Light on edges facing up or left, dark on edges facing down or right."""
    c = {}
    for x, y in m:
        up = (x, y - 1) not in m or (x - 1, y) not in m
        down = (x, y + 1) not in m or (x + 1, y) not in m
        c[(x, y)] = light if up and not down else (dark if down and not up else mid)
    return c


def bezier(p0, p1, p2, t):
    return tuple((1 - t) ** 2 * a + 2 * (1 - t) * t * b + t * t * c for a, b, c in zip(p0, p1, p2))


def talon(p0, p1, p2, w0, clip=None):
    """A tapering curved claw: width w0 at p0 down to a point at p2."""
    out = set()
    for k in range(201):
        t = k / 200
        cx, cy = bezier(p0, p1, p2, t)
        r = 0.5 * w0 * (1 - t) + 0.35
        out |= cells_where(lambda px, py: math.hypot(px - cx, py - cy) <= r and (clip is None or clip(px, py)))
    return out


options = []

# === Dragon Anatomy =======================================================================
# A: a large claw sketched in ink across the page, the weak spot marked in brick.
options.append(("anatomy_sketch", "Dragon Anatomy A: a bold hooked claw sketched on Lirae's page, the weak spot marked",
                "a=ink P=parch3 D=parch1 k=wood1 x=clay2", [
                    ".aaaaaaaaaa.",
                    ".aPPPPPPPPa.",
                    ".aPPkkkkPPa.",
                    ".aPkkkkkkPa.",
                    ".akkkPPPkPa.",
                    ".akkkPPPkPa.",
                    ".akkkPxPxPa.",
                    ".akkkkPxPPa.",
                    ".akkkkxPxPa.",
                    ".aPPPPPPPPa.",
                    ".aDDDDDDDDa.",
                    ".aaaaaaaaaa."]))

# B: a claw seen through a scholar's magnifying glass.
lens = cells_where(lambda px, py: math.hypot(px - 5.0, py - 5.0) <= 4.0)
glass = {p for p in lens if math.hypot(p[0] + 0.5 - 5.0, p[1] + 0.5 - 5.0) <= 3.0}
cells = tone(lens - glass, "H", "g", "G")
cells.update({p: "q" for p in glass})
cells.update({p: "k" for p in talon((3.2, 7.4), (3.0, 3.2), (6.6, 3.4), 2.2) if p in glass})
cells[(3, 3)] = "W"
handle = cells_where(lambda px, py: abs((px - py)) <= 1.0 and 8.2 <= px <= 10.8 and 8.2 <= py <= 10.8)
cells.update({p: "w" for p in handle - lens})
options.append(("anatomy_lens", "Dragon Anatomy B: a claw studied through a brass magnifying glass",
                "a=ink H=gold5 g=gold4 G=gold2 q=parch3 k=wood1 W=steel5 w=wood3", outlined(cells)))

# C: a bare talon, bone-white, a gold ring around its deadly point.
bone = talon((2.4, 10.4), (2.6, 3.0), (8.4, 2.6), 3.6)
cells = tone(bone, "H", "m", "d")
ring = cells_where(lambda px, py: 1.5 <= math.hypot(px - 8.4, py - 3.6) <= 2.5) - bone
cells.update({p: "g" for p in ring if p[1] >= 1})
options.append(("anatomy_talon", "Dragon Anatomy C: a bare talon with a gold ring marking its deadly point",
                "a=ink H=parch3 m=skin3 d=parch1 g=gold5", outlined(cells)))

# === Mortar Craft =========================================================================
options.append(("mortar_trowel", "Mortar Craft A: a mason's trowel, the pointed blade down, mortar on it",
                "a=ink W=wood4 D=wood2 h=steel5 m=steel3 s=steel2 M=parch2", [
                    ".....aa.....",
                    "....aWDa....",
                    "....aWDa....",
                    "....aWDa....",
                    ".aaaaasaaaa.",
                    "ahhhhhhhhhsa",
                    ".ahMMMmmmsa.",
                    "..ahMMmmsa..",
                    "...ahmmsa...",
                    "....ahsa....",
                    ".....aa.....",
                    "............"]))

bucket = {(x, y) for y in range(5, 11) for x in range(2 + (y - 5) // 3, 9 - (y - 5) // 3)}
mortar = {(x, 4) for x in range(3, 8)} | {(x, 3) for x in range(4, 7)}
cells = {}
for x, y in bucket:
    lo, hi = min(px for px, py in bucket if py == y), max(px for px, py in bucket if py == y)
    cells[(x, y)] = "s" if y in (6, 9) else ("W" if x == lo else ("D" if x == hi else "w"))
cells.update({p: ("m" if p[1] == 3 or p[0] == 3 else "M") for p in mortar})
cells.update({(7, 3): "s", (8, 2): "W", (9, 1): "W"})
options.append(("mortar_bucket", "Mortar Craft B: a bucket of mortar with the trowel standing in it",
                "a=ink W=wood4 w=wood3 D=wood2 s=steel3 M=parch2 m=parch3", outlined(cells)))

options.append(("mortar_wall", "Mortar Craft C: a trowel laid on a fresh course of stone, the joints in pale mortar",
                "a=ink h=steel5 m=steel3 W=wood4 S=steel4 s=steel2 M=parch3", [
                    "............",
                    "............",
                    "..a.....aa..",
                    ".ahaa..aWWa.",
                    "ahmmhaaWWa..",
                    ".ahmaa.aa...",
                    "aaaaaaaaaaaa",
                    "aSSSMSSSSMSa",
                    "assSMssSsMsa",
                    "aMMMMMMMMMMa",
                    "aSMSSSSMSSSa",
                    "aaaaaaaaaaaa"]))

# === Tempered Steel =======================================================================
options.append(("steel_steam", "Tempered Steel A: the glowing sword, now with steam rising from the quench",
                "a=ink W=fire3 Y=fire2 O=fire1 h=steel5 s=steel3 H=gold5 d=wood2 S=steel4", [
                    ".....aa..aa.",
                    "....aWYaaSSa",
                    "..aaaYOaSSa.",
                    ".aSSaYOaaa..",
                    "..aaahsa....",
                    "....ahsa....",
                    "....ahsa....",
                    "..aaahsaaa..",
                    ".aHHHHHHHHa.",
                    "..aaaddaaa..",
                    "....aHHa....",
                    "....aaaa...."]))

options.append(("steel_trough", "Tempered Steel B: the sword plunged point-first into the quenching trough, glowing at the waterline",
                "a=ink H=gold5 d=wood2 h=steel5 s=steel3 O=fire1 W=wood4 B=sea3 b=sea2", [
                    ".....aa.....",
                    "....aHHa....",
                    "..aaaddaaa..",
                    ".aHHHHHHHHa.",
                    "..aaahsaaa..",
                    "....ahsa....",
                    ".aaaaOOaaaa.",
                    "aWBBBBBBBBda",
                    "aWbbbbbbbbda",
                    "aWbbbbbbbbda",
                    "adddddddddda",
                    "aaaaaaaaaaaa"]))

options.append(("steel_anvil", "Tempered Steel C: a blade glowing on Kael's anvil",
                "a=ink W=fire3 Y=fire2 O=fire1 h=steel4 m=steel2 s=steel1", [
                    "............",
                    "............",
                    "..aaaaaaaa..",
                    ".aWYYYYOOOa.",
                    "ahhhhhhhhhsa",
                    ".aammmmmmsa.",
                    "...ammmsaa..",
                    "...ammmsaa..",
                    "..ammmmmmsa.",
                    "..asssssssa.",
                    "..aaaaaaaaa.",
                    "............"]))

# === Evacuation Drills ====================================================================
# A: a townsperson running, in the townsfolk colors.
cells = {}
cells.update({p: "B" for p in [(5, 1), (6, 1), (7, 1), (8, 1), (5, 2)]})
cells.update({p: "C" for p in [(6, 2), (8, 2), (5, 3), (6, 3), (7, 3), (8, 3)]})
cells[(7, 2)] = "a"  # the eye, looking ahead
cells.update({(x, y): "D" for x in range(5, 9) for y in range(4, 7)})
cells.update({(x, 7): "E" for x in range(5, 9)})
cells.update({(4, 5): "D", (3, 6): "C", (9, 5): "D", (10, 4): "C"})
cells.update({p: "F" for p in [(5, 8), (6, 8), (4, 9), (5, 9), (3, 10), (4, 10),
                                (7, 8), (8, 8), (8, 9), (9, 9), (9, 10), (10, 10)]})
options.append(("evac_runner", "Evacuation Drills A: a townsperson running, the townsfolk colors",
                "a=ink B=wood3 C=skin2 D=clay1 E=wood2 F=wood1", outlined(cells)))

# B: a stone doorway, dark within, a gold arrow leading out.
door = {}
for y in range(1, 11):
    for x in range(1, 7):
        if y == 1 and x in (1, 6):
            continue
        edge = x in (1, 6) or y in (1, 10) or (y == 2 and x in (2, 5))
        door[(x, y)] = "m" if edge else "k"
arrow = {(x, y) for x in range(3, 8) for y in (6, 7)} | {(8, y) for y in range(4, 10)} \
    | {(9, y) for y in range(5, 9)} | {(10, 6), (10, 7)}
cells = dict(door)
cells.update({p: ("H" if p[1] <= 6 else "g") for p in arrow})
options.append(("evac_door", "Evacuation Drills B: a stone doorway with a gold arrow leading out",
                "a=ink m=steel3 k=night1 H=gold5 g=gold3", outlined(cells)))

# C: the war horn, redrawn: a clean crescent, gold bands, the bell open toward you.
horn, mouth = set(), set()
for k in range(201):
    t = k / 200
    cx, cy = bezier((1.6, 2.0), (2.6, 10.6), (9.4, 3.6), t)
    r = 0.5 + 1.75 * t ** 1.4
    for p in cells_where(lambda px, py: math.hypot(px - cx, py - cy) <= r):
        horn.add(p)
        if t == 1.0 and math.hypot(p[0] + 0.5 - cx, p[1] + 0.5 - cy) <= 1.0:
            mouth.add(p)
cells = tone(horn, "H", "m", "d")
for x, y in horn:
    if (x, y) not in mouth and x in (4, 7) and y >= 5:
        cells[(x, y)] = "g"
cells.update({p: "k" for p in mouth})
options.append(("evac_horn", "Evacuation Drills C: the war horn, redrawn as a clean crescent with gold bands",
                "a=ink H=parch3 m=skin3 d=parch1 g=gold4 k=wood1", outlined(cells)))

lines = ["# Research options, 2026-10-26. Written by make_options.py."]
for name, desc, key, rows in options:
    assert len(rows) == N and all(len(r) == N for r in rows), (name, [len(r) for r in rows])
    lines += ["", f"# {desc}", f"@asset icon_res_{name}", "size 12 12", "budget 8", f"key {key}", "frame"] + rows
(HERE / "options.px").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"{len(options)} options written")
