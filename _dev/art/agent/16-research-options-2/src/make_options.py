"""Write options.px: second-round options for Dragon Anatomy, Mortar Craft and Tempered Steel, 12x12.

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


def disc(cx, cy, r):
    return cells_where(lambda px, py: math.hypot(px - cx, py - cy) <= r)


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


def tone(m, light, mid, dark):
    """Light on edges facing up or left, dark on edges facing down or right."""
    c = {}
    for x, y in m:
        up = (x, y - 1) not in m or (x - 1, y) not in m
        down = (x, y + 1) not in m or (x + 1, y) not in m
        c[(x, y)] = light if up and not down else (dark if down and not up else mid)
    return c


def ink_ring(cells, shape):
    """Separate a shape drawn over other cells with an ink line."""
    for x, y in shape:
        for dx, dy in N4:
            q = (x + dx, y + dy)
            if q in cells and q not in shape:
                cells[q] = "a"


options = []

# === Dragon Anatomy: the study that makes the dragon's strike land where it hurts =========
# A: a bone with a crack across it, the science of where a strike breaks things.
bone = line(3.4, 8.6, 8.6, 3.4, 0.95) | disc(2.6, 8.0, 1.25) | disc(4.0, 9.4, 1.25) \
    | disc(8.0, 2.6, 1.25) | disc(9.4, 4.0, 1.25)
cells = tone(bone, "H", "m", "d")
cells.update({(5, 5): "a", (6, 6): "a", (6, 5): "a"})
options.append(("anatomy_bone", "Dragon Anatomy A: a bone cracked through: where a strike does the most harm",
                "a=ink H=parch3 m=skin3 d=parch1", outlined(cells)))

# B: a tall lavender crystal shard, faceted, a white glint: the strike, sharpened by magic.
options.append(("anatomy_crystal", "Dragon Anatomy B: a faceted crystal shard: the strike, sharpened by magic",
                "a=ink W=steel5 L=night4 m=night3 d=night2", [
                    ".....aa.....",
                    "....aWLa....",
                    "...aWLmda...",
                    "...aLLmda...",
                    "..aLLLmdda..",
                    "..aLWLmdda..",
                    "..aLLLmdda..",
                    "..aLLmmdda..",
                    "...aLmmda...",
                    "....aLda....",
                    ".....aa.....",
                    "............"]))

# C: an alchemist's flask, glowing ember liquid, a bubble rising: the study in the Librarium.
bulb = disc(6.0, 7.6, 3.6)
neck = {(5, y) for y in range(1, 5)} | {(6, y) for y in range(1, 5)}
cells = {p: "q" for p in bulb | neck}
cells.update({p: ("Y" if p[1] <= 7 else "O") for p in bulb if p[1] >= 7})
cells.update({(5, 1): "c", (6, 1): "c", (4, 5): "W", (3, 7): "W", (6, 9): "W"})
options.append(("anatomy_flask", "Dragon Anatomy C: an alchemist's flask of glowing ember draught",
                "a=ink q=night3 c=wood3 W=steel5 Y=fire2 O=fire1", outlined(cells)))

# === Mortar Craft =========================================================================
def trowel():
    blade = cells_where(lambda px, py: in_poly(px, py, [(1.0, 11.0), (3.7, 4.8), (7.2, 8.3)]))
    shank = line(5.8, 6.2, 7.4, 4.6, 0.55) - blade
    handle = line(7.8, 4.2, 10.4, 1.6, 0.95) - blade - shank
    c = {}
    for x, y in blade:  # two facets split along the blade's axis, lit upper left
        c[(x, y)] = "h" if (x + 0.5) - (y + 0.5) < -4.6 + 0.0 or (y + 0.5) < 11.6 - 1.6 * (x + 0.5) else "s"
    c.update({p: "m" for p in shank})
    c.update({p: ("W" if p[0] + p[1] <= 10 else "w") for p in handle})
    return c, blade | shank | handle


cells, _ = trowel()
options.append(("mortar_trowel2", "Mortar Craft A: a mason's trowel after the reference: pointed blade, bent neck, wooden handle",
                "a=ink h=steel4 s=steel3 m=steel2 W=parch2 w=parch1", outlined(cells)))

wall_rows = [
    "aaaaaaaaaaaa",
    "aSSSMSSSSMSa",
    "asssMssssMsa",
    "adddMddddMda",
    "aMMMMMMMMMMa",
    "aSSMSSSSMSSa",
    "assMssssMssa",
    "addMddddMdda",
    "aMMMMMMMMMMa",
    "aSSSSMSSSSSa",
    "addddMddddda",
    "aaaaaaaaaaaa"]
options.append(("mortar_wall2", "Mortar Craft B: a stone wall, the joints thick with pale lime mortar",
                "a=ink S=steel4 s=steel3 d=steel2 M=parch3", wall_rows))

wall = {(x, y): ch for y, r in enumerate(wall_rows) for x, ch in enumerate(r) if ch != "a"}
tc, tshape = trowel()
cells = dict(wall)
ink_ring(cells, tshape)
cells.update(tc)
options.append(("mortar_wall_trowel", "Mortar Craft C: the trowel laid across a freshly mortared wall",
                "a=ink S=steel4 s=steel3 d=steel2 M=parch3 h=steel5 m=steel1 W=parch2 w=parch1",
                [("".join(cells.get((x, y), "a") for x in range(N))) for y in range(N)]))

bowl = {(x, 6) for x in range(1, 11)} | {(x, 7) for x in range(1, 11)} | {(x, 8) for x in range(2, 10)} \
    | {(x, 9) for x in range(3, 9)} | {(x, 10) for x in range(4, 8)}
pestle = line(6.0, 6.2, 9.6, 1.6, 0.85) - bowl
cells = tone(bowl, "h", "m", "s")
cells.update({(x, 6): "k" for x in range(2, 10)})
cells.update(tone(pestle, "W", "w", "w"))
options.append(("mortar_pestle", "Mortar Craft D: a mortar and pestle: the other mortar, where the mix is ground",
                "a=ink h=steel4 m=steel3 s=steel2 k=steel1 W=wood4 w=wood3", outlined(cells)))

# === Tempered Steel: Kael's anvil =========================================================
def anvil(dy):
    face = {(x, 4 + dy) for x in range(1, 11)}
    body = {(x, 5 + dy) for x in range(3, 10)}
    waist = {(x, y + dy) for x in range(4, 8) for y in (6, 7)}
    base = {(x, y + dy) for x in range(3, 10) for y in (8, 9)}
    c = {p: "h" for p in face}
    c.update({p: ("s" if p[0] == 9 else "m") for p in body})
    c.update({p: ("s" if p[0] == 7 else "m") for p in waist})
    c.update({p: ("s" if p[1] == 9 + dy or p[0] == 9 else "m") for p in base})
    return c


# B: the smith's hammer resting on the anvil.
cells = anvil(1)
head = {(x, y) for x in range(2, 5) for y in (3, 4)}
handle = line(5.2, 4.0, 10.4, 1.6, 0.6) - head
cells.update({p: ("H" if p[1] == 3 else "M") for p in head})
cells.update({p: "w" for p in handle})
options.append(("steel_hammer_rest", "Tempered Steel B: the smith's hammer resting on Kael's anvil",
                "a=ink h=steel4 m=steel2 s=steel1 H=steel5 M=steel3 w=wood4", outlined(cells)))

# C: the hammer raised over a glowing blade, sparks flying.
cells = anvil(1)
cells.update({(x, 4): ("W" if x <= 4 else ("Y" if x <= 6 else "O")) for x in range(3, 9)})
cells.update({(x, y): ("H" if y == 1 else "h") for x in range(1, 4) for y in (1, 2)})
cells.update({p: "w" for p in line(4.4, 1.5, 8.6, 1.5, 0.5)})
cells.update({(9, 3): "Y", (10, 2): "W", (6, 2): "Y"})
options.append(("steel_strike", "Tempered Steel C: the hammer raised over a glowing blade, sparks flying",
                "a=ink h=steel4 m=steel2 s=steel1 H=steel5 w=wood4 W=fire3 Y=fire2 O=fire1", outlined(cells)))

# D: the anvil alone, a burst of sparks above it: Kael's sigil.
cells = anvil(1)
spark = {(5, 1), (6, 1), (4, 2), (5, 2), (6, 2), (7, 2), (5, 3), (6, 3)}
cells.update({p: ("W" if p in ((5, 2), (6, 2)) else "Y") for p in spark})
cells.update({(2, 3): "O", (9, 3): "O"})
options.append(("steel_anvil_sparks", "Tempered Steel D: Kael's anvil with a burst of sparks above it",
                "a=ink h=steel4 m=steel2 s=steel1 W=fire3 Y=fire2 O=fire1", outlined(cells)))

lines = ["# Research options, round 2, 2026-10-26. Written by make_options.py."]
for name, desc, key, rows in options:
    assert len(rows) == N and all(len(r) == N for r in rows), (name, [len(r) for r in rows])
    lines += ["", f"# {desc}", f"@asset icon_res_{name}", "size 12 12", "budget 8", f"key {key}", "frame"] + rows
(HERE / "options.px").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"{len(options)} options written")
