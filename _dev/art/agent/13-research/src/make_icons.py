"""Write icons.px: the thirteen research study icons, 12x12.

Hand grids where the shape is simple; the target, fire burst, spears, net, loaf, trowel and horn
are drawn from shapes and toned by the light from the upper left. Run: python make_icons.py
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


icons = []

# === The Dragon ===========================================================================
icons.append(("dragon_anatomy", "Dragon Anatomy. Lirae's sketch of a claw on parchment, the weak spot marked.",
              "a=ink P=parch3 D=parch1 k=wood1 x=clay2", [
                  ".aaaaaaaaaa.",
                  ".aPPPPPPPPa.",
                  ".aPPPkkkPPa.",
                  ".aPPkkPPkPa.",
                  ".aPkkPPPkPa.",
                  ".aPkkPPPPPa.",
                  ".aPkkPxPxPa.",
                  ".akkkPPxPPa.",
                  ".akkkkxPxPa.",
                  ".aPPPPPPPPa.",
                  ".aDDDDDDDDa.",
                  ".aaaaaaaaaa."]))

# Weak Points: an archery target, brick and cream rings, a gold heart.
target = cells_where(lambda px, py: math.hypot(px - 6, py - 6) <= 4.9)
cells = {}
for x, y in target:
    d = math.hypot(x + 0.5 - 6, y + 0.5 - 6)
    cells[(x, y)] = "H" if d <= 1.0 else ("r" if d <= 2.2 else ("P" if d <= 3.5 else "R"))
icons.append(("weak_points", "Weak Points. A target: one strike in ten finds the seam.",
              "a=ink H=gold5 r=clay2 R=clay1 P=parch3", outlined(cells)))

# Wyrm's Fury: an old wyrm's eye, fire in the iris, the slit pupil narrowed.
icons.append(("wyrms_fury", "Wyrm's Fury. An old wyrm's eye, fire in the iris.",
              "a=ink W=fire3 Y=fire2 O=fire1", [
                  "............",
                  "............",
                  "...aaaaaa...",
                  "..aOOYYOOa..",
                  ".aOYYaaYYOa.",
                  "aOYWYaaYYYOa",
                  "aOYYYaaYYYOa",
                  ".aOYYaaYYOa.",
                  "..aOOYYOOa..",
                  "...aaaaaa...",
                  "............",
                  "............"]))

# === The Army =============================================================================
icons.append(("drill_tactics", "Drill Tactics. A straw training dummy on its post.",
              "a=ink S=parch2 s=parch1 k=wood2 W=wood4 D=wood2", [
                  "....aaaa....",
                  "...aSSSsa...",
                  "...aSSSsa...",
                  ".aaaaWDaaaa.",
                  "aWWWWWWWWWDa",
                  ".aaaSSSsaaa.",
                  "...aSSSsa...",
                  "...akkkka...",
                  "...aSSSsa...",
                  "...aaWDaa...",
                  "..aWWWWWDa..",
                  "..aaaaaaaa.."]))

icons.append(("tempered_steel", "Tempered Steel. A sword fresh from the quench, its point still glowing.",
              "a=ink W=fire3 Y=fire2 O=fire1 h=steel5 s=steel3 H=gold5 G=gold3 d=wood2", [
                  ".....aa.....",
                  "....aWYa....",
                  "....aYOa....",
                  "....aYOa....",
                  "....ahsa....",
                  "....ahsa....",
                  "....ahsa....",
                  "..aaahsaaa..",
                  ".aHHHHHHHGa.",
                  "..aaaddaaa..",
                  "....aHGa....",
                  "....aaaa...."]))

# Battle Drill: three spears in a rank, the middle one raised.
cells = {}
for c, top in ((3, 3), (6, 1), (9, 3)):
    head = {(c, top), (c - 1, top + 1), (c, top + 1), (c + 1, top + 1), (c - 1, top + 2), (c, top + 2), (c + 1, top + 2)}
    for x, y in head:
        cells[(x, y)] = "h" if x < c or y == top else ("m" if x == c else "s")
    for y in range(top + 3, 11):
        cells[(c, y)] = "w"
icons.append(("battle_drill", "Battle Drill. Three spears in a rank, striking as one.",
              "a=ink h=steel5 m=steel4 s=steel2 w=wood4", outlined(cells)))

# === The Stores ===========================================================================
icons.append(("rationing", "Rationing. A brass balance on gold chains: every meal weighed.",
              "a=ink H=gold5 G=gold3 g=gold4", [
                  ".....aa.....",
                  "....aHGa....",
                  ".aaaaHGaaaa.",
                  "aHHHHHHHHHGa",
                  ".agaaHGaaga.",
                  ".agaaHGaaga.",
                  "aHHHaHGaHHHa",
                  "aGGGaHGaGGGa",
                  ".aaaaHGaaaa.",
                  "...aaHGaa...",
                  "..aHHHHHGa..",
                  "..aaaaaaaa.."]))

# Lean Rations: a square of hardtack, the soldier's marching biscuit, a corner broken off.
icons.append(("lean_rations", "Lean Rations. A broken square of hardtack: marching on little.",
              "a=ink H=gold4 g=gold3 G=gold2 p=gold1", [
                  "............",
                  ".aaaaaaa....",
                  ".aHHHHHa....",
                  ".aHgggggaa..",
                  ".aHgpgpgga..",
                  ".aHggggggGa.",
                  ".aHgpgpgpGa.",
                  ".aHggggggGa.",
                  ".aHgpgpgpGa.",
                  ".aGGGGGGGGa.",
                  ".aaaaaaaaaa.",
                  "............"]))

# Snares and Nets: a round rope net, the holes showing dark.
net = cells_where(lambda px, py: math.hypot(px - 6, py - 6) <= 4.9)
cells = {}
for x, y in net:
    d = math.hypot(x + 0.5 - 6, y + 0.5 - 6)
    if d > 4.0:
        cells[(x, y)] = "W" if (x + y) < 12 else "w"
    elif (x + y) % 3 == 0 or (x - y) % 3 == 0:
        cells[(x, y)] = "w" if (x + y) % 3 else "W"
    else:
        cells[(x, y)] = "k"
icons.append(("snares_and_nets", "Snares and Nets. A round rope net.",
              "a=ink W=wood4 w=wood3 k=night1", outlined(cells)))

icons.append(("feast_hall", "Feast Hall. A tankard of ale with a head of foam.",
              "a=ink F=parch3 f=parch2 W=wood4 w=wood3 D=wood2 S=steel3 s=steel2", [
                  "............",
                  ".aaaaaaa....",
                  "aFFFFFFFa...",
                  "aFfFFFfFaa..",
                  "aWwwwwwDWWa.",
                  "aSSSSSSsaWa.",
                  "aWwwwwwDaWa.",
                  "aWwwwwwDaWa.",
                  "aSSSSSSsWWa.",
                  "aWwwwwwDaa..",
                  "aDDDDDDDa...",
                  ".aaaaaaa...."]))

# === The Wall =============================================================================
def in_poly(px, py, pts):
    inside_ = False
    for (ax, ay), (bx, by) in zip(pts, pts[1:] + pts[:1]):
        if (ay > py) != (by > py) and px < ax + (py - ay) * (bx - ax) / (by - ay):
            inside_ = not inside_
    return inside_


blade = cells_where(lambda px, py: in_poly(px, py, [(6.2, 5.0), (1.0, 6.0), (1.0, 11.0), (6.0, 11.0)]))
handle = cells_where(lambda px, py: math.hypot(*(lambda t: (px - (10.0 - 3.0 * t), py - (1.8 + 3.0 * t)))(
    max(0, min(1, ((px - 10.0) * -3.0 + (py - 1.8) * 3.0) / 18.0)))) <= 0.8)
cells = tone(blade, "h", "m", "s")
cells.update({p: "w" for p in handle - blade})
cells.update({(2, 9): "M", (3, 9): "M", (2, 8): "M", (3, 8): "M", (4, 9): "M"})  # a dab of mortar
icons.append(("mortar_craft", "Mortar Craft. A mason's trowel with a dab of mortar.",
              "a=ink h=steel5 m=steel3 s=steel2 w=wood4 M=parch1", outlined(cells)))

icons.append(("night_ledgers", "Night Ledgers. A candle burning late over the count, a handle on its dish.",
              "a=ink Y=fire2 W=fire3 O=fire1 k=night1 P=parch3 p=parch1 H=gold5 G=gold3", [
                  ".....aa.....",
                  "....aYYa....",
                  "...aYWWYa...",
                  "....aWOa....",
                  "....akaa....",
                  "...aPPPpa...",
                  "...aPPPpa...",
                  "...aPPPpaaa.",
                  "...aPPPpaHGa",
                  ".aaaPPPpaaGa",
                  "aHHHHHHHHGGa",
                  ".aaaaaaaaaa."]))

# Evacuation Drills: a war horn, the call to run when the wall falls.
horn = set()
mouth = set()
for k in range(161):
    t = k / 160
    cx, cy = bezier((1.6, 3.2), (3.5, 10.5), (9.6, 5.4), t)
    r = 0.55 + 1.9 * t ** 1.6
    for x, y in cells_where(lambda px, py: math.hypot(px - cx, py - cy) <= r):
        horn.add((x, y))
        if t > 0.97 and math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r * 0.55:
            mouth.add((x, y))
cells = tone(horn, "H", "m", "d")
for x, y in horn:
    tx = (x + 0.5 - 1.6) / 8.0
    if abs(tx - 0.42) < 0.07 or abs(tx - 0.72) < 0.07:
        cells[(x, y)] = "g"
cells.update({p: "k" for p in mouth})
icons.append(("evacuation_drills", "Evacuation Drills. A war horn: when it sounds, everyone knows where to run.",
              "a=ink H=parch3 m=skin3 d=parch1 g=gold4 k=wood1", outlined(cells)))

lines = ["# Research study icons, 2026-10-26. Written by make_icons.py.",
         "# 12x12, ink outline, light from the upper left. Notes: ../README.md"]
for name, desc, key, rows in icons:
    assert len(rows) == N and all(len(r) == N for r in rows), name
    lines += ["", f"# {desc}", f"@asset icon_res_{name}", "size 12 12", "budget 8", f"key {key}", "frame"] + rows
(HERE / "icons.px").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"{len(icons)} icons written")
