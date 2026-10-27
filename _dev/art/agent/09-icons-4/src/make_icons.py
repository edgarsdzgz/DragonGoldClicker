"""Write icons.px: icon sheet 4, the last twelve interface icons, 12x12.

Hand grids where the shape is simple; strokes, discs and stars are drawn from shapes and toned
by the light from the upper left. Run: python make_icons.py
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


def star(cx, cy, arm, core):
    """A four-point sparkle: a one-pixel cross with a diamond at its heart."""
    return {(x, y) for x in range(N) for y in range(N) if inside(x, y) and (
        (abs(x + 0.5 - cx) <= 0.5 and abs(y + 0.5 - cy) <= arm)
        or (abs(y + 0.5 - cy) <= 0.5 and abs(x + 0.5 - cx) <= arm)
        or abs(x + 0.5 - cx) + abs(y + 0.5 - cy) <= core)}


icons = []

# --- Next ---------------------------------------------------------------------------------
# The Upgrade arrow turned to point right: same gold, lit on its top half.
head = {(x, y) for x in range(6, 11) for y in range(N) if abs(y + 0.5 - 6) <= 10.5 - x}
shaft = {(x, y) for x in range(1, 6) for y in range(4, 8)}
arrow = head | shaft
cells = {p: ("g" if p[1] <= 5 else "G") for p in arrow}
cells.update({p: "H" for p in arrow if (p[0], p[1] - 1) not in arrow})
icons.append(("next", "Next, go. The Upgrade arrow turned to point right.",
              "a=ink H=gold5 g=gold4 G=gold3", outlined(cells)))

# --- Unknown and Info: plates in the family of the red Close plate ------------------------
icons.append(("unknown", "Unknown and help. A gold question mark on a dusk-purple plate.",
              "a=ink n=night4 m=night3 d=night2 H=gold5 g=gold3", [
                  "..aaaaaaaa..",
                  ".annnnnnnna.",
                  "anmmmmmmmmda",
                  "anmmHHHHmmda",
                  "anmHgmmHgmda",
                  "anmmmmmHgmda",
                  "anmmmmHgmmda",
                  "anmmmHgmmmda",
                  "anmmmmmmmmda",
                  "anmmmHgmmmda",
                  ".adddddddda.",
                  "..aaaaaaaa.."]))

icons.append(("info", "Info. A white i on a sea-blue plate.",
              "a=ink n=sea3 m=sea2 d=sea1 h=steel5 s=steel3", [
                  "..aaaaaaaa..",
                  ".annnnnnnna.",
                  "anmmmmmmmmda",
                  "anmmmhsmmmda",
                  "anmmmmmmmmda",
                  "anmmhhsmmmda",
                  "anmmmhsmmmda",
                  "anmmmhsmmmda",
                  "anmmmhsmmmda",
                  "anmmhhhsmmda",
                  ".adddddddda.",
                  "..aaaaaaaa.."]))

# --- Rising and falling stores ------------------------------------------------------------
# A zigzag trend line ending in a solid arrowhead in the top-right corner.
path = [(1.5, 9.5), (4.5, 6.5), (6.5, 8.5), (8.6, 5.4)]
trend = set()
for (ax, ay), (bx, by) in zip(path, path[1:]):
    trend |= line(ax, ay, bx, by, 0.75)
trend |= {(x, y) for x in range(6, 11) for y in range(1, 6) if (10 - x) + (y - 1) <= 4}
rising = tone(trend, "H", "g", "G")
icons.append(("rising", "Rising stores. A green zigzag climbing to the upper right.",
              "a=ink H=green3 g=green2 G=green1", outlined(rising)))
falling = tone({(x, N - 1 - y) for x, y in trend}, "H", "g", "G")
icons.append(("falling", "Falling stores. The same line falling, in brick (red is kept for HP and danger).",
              "a=ink H=clay3 g=clay2 G=clay1", outlined(falling)))

# --- Rank ---------------------------------------------------------------------------------
# A gold medal hanging from a slate-blue ribbon (the army's color from the Fighters shield).
left, right = line(2.6, 1.0, 5.2, 5.6, 1.0), line(9.4, 1.0, 6.8, 5.6, 1.0)
medal = disc(6.0, 8.0, 3.2)
cells = {p: "n" for p in left - medal}
cells.update({p: "d" for p in right - medal - left})
rim = {p for p in medal if math.hypot(p[0] + 0.5 - 6, p[1] + 0.5 - 8) > 1.9}
cells.update(tone(rim, "H", "g", "G"))
cells.update({p: "g" for p in medal - rim})
cells[(5, 7)] = "W"  # the glint on the raised face
icons.append(("rank", "Rank. A gold medal hanging from a slate-blue ribbon.",
              "a=ink W=gold6 H=gold5 g=gold4 G=gold2 n=night4 d=night3", outlined(cells)))

# --- Shield gear --------------------------------------------------------------------------
# A round wooden shield: steel rim, planks with dark seams, a steel boss. Round, so it never
# reads as the Fighters' heater shield.
shield = disc(6.0, 6.0, 5.0)
rim = {p for p in shield if math.hypot(p[0] + 0.5 - 6, p[1] + 0.5 - 6) > 3.6}
cells = tone(rim, "h", "m", "s")
for x, y in shield - rim:
    cells[(x, y)] = "k" if x in (4, 7) else ("w" if x < 6 else "W")
cells.update({(5, 5): "h", (6, 5): "m", (5, 6): "m", (6, 6): "s"})
icons.append(("shield_gear", "Shield gear. A round wooden shield with a steel rim and boss.",
              "a=ink h=steel5 m=steel3 s=steel2 w=wood4 W=wood3 k=wood1", outlined(cells)))

# --- Claws --------------------------------------------------------------------------------
# Three curved slash marks, tapered at both ends. The nine tier icons stay for the tiers.
def slash(p0, p1, p2, rmax):
    out = set()
    for k in range(121):
        t = k / 120
        cx = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]
        cy = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
        r = 0.3 + rmax * math.sin(math.pi * t)
        out |= {(x, y) for x in range(N) for y in range(N)
                if inside(x, y) and math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r}
    return out


marks = set()
for i in range(3):
    marks |= slash((5.6 + 3.2 * i, 1.0), (2.6 + 3.2 * i, 4.0), (1.4 + 3.2 * i, 11.0), 0.55)
cells = {p: ("s" if (p[0] + 1, p[1]) not in marks else "H") for p in marks}
icons.append(("claws", "Claws. Three curved slash marks, lit on their leading edge.",
              "a=ink H=steel5 s=steel3", outlined(cells)))

# --- Moon ---------------------------------------------------------------------------------
crescent = disc(5.4, 6.4, 4.6) - disc(7.9, 4.6, 3.6)
cells = tone(crescent, "H", "m", "d")
spark = star(8.5, 4.5, 1.0, 0.0)
cells.update({p: "H" for p in spark})
icons.append(("moon", "Offline, rest. A pale crescent moon with a star.",
              "a=ink H=gold6 m=parch3 d=parch1", outlined(cells)))

# --- Sparkles -----------------------------------------------------------------------------
# Lavender and white, so the Wizard's Tower never borrows the gold of the Renown star.
cells = {}
for cx, cy, arm, core in ((4.5, 6.5, 3.6, 1.2), (9.5, 2.5, 1.6, 0.0), (9.5, 9.5, 1.0, 0.0)):
    for x, y in star(cx, cy, arm, core):
        d = abs(x + 0.5 - cx) + abs(y + 0.5 - cy)
        cells[(x, y)] = "W" if d <= 0.8 else ("L" if d <= 2.0 else "n")
icons.append(("sparkles", "Wizard's Tower. Lavender sparkles with white hearts.",
              "a=ink W=steel5 L=night4 n=night3", outlined(cells)))

# --- Map ----------------------------------------------------------------------------------
icons.append(("map", "Map. A three-fold map: a wood, a dotted path and an X.",
              "a=ink P=parch3 Q=parch2 D=parch1 g=green2 l=wood2 x=clay2", [
                  "aaaa....aaaa",
                  "aPPPaaaaPPPa",
                  "aggPQQQQxPxa",
                  "agPPQQQQPxPa",
                  "aPPPQQQQxPxa",
                  "aPPPQQlQPPPa",
                  "aPPPQlQQPPPa",
                  "aPPPQQQQPPPa",
                  "aPlPQQQQPPPa",
                  "aDDDQQQQDDDa",
                  "aaaaDDDDaaaa",
                  "....aaaa...."]))

# --- Stats --------------------------------------------------------------------------------
icons.append(("stats", "Stats. Three bars climbing: sea, green and gold.",
              "a=ink B=sea3 b=sea2 E=green3 e=green2 H=gold5 g=gold3", [
                  "............",
                  ".......aaaa.",
                  ".......aHga.",
                  "....aaaaHga.",
                  "....aEeaHga.",
                  "....aEeaHga.",
                  ".aaaaEeaHga.",
                  ".aBbaEeaHga.",
                  ".aBbaEeaHga.",
                  ".aBbaEeaHga.",
                  "aaaaaaaaaaaa",
                  "............"]))

lines = ["# Icon sheet 4, 2026-10-26: the last twelve interface icons. Written by make_icons.py.",
         "# 12x12, ink outline, light from the upper left. Research notes: ../README.md"]
for name, desc, key, rows in icons:
    assert len(rows) == N and all(len(r) == N for r in rows), name
    lines += ["", f"# {desc}", f"@asset icon_{name}", "size 12 12", "budget 8", f"key {key}", "frame"] + rows
(HERE / "icons.px").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"{len(icons)} icons written")
