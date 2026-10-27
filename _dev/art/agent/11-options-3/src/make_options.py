"""Write options.px: the crystal ball with the gold question mark, and arcane Stats options, 12x12.

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


def tone(m, light, mid, dark):
    """Light on edges facing up or left, dark on edges facing down or right."""
    c = {}
    for x, y in m:
        up = (x, y - 1) not in m or (x - 1, y) not in m
        down = (x, y + 1) not in m or (x + 1, y) not in m
        c[(x, y)] = light if up and not down else (dark if down and not up else mid)
    return c


options = []

# --- Unknown: the crystal ball with the sheet-4 question mark -----------------------------
# A larger ball so the whole gold question mark (lit left, shaded right) fits inside the glass.
ball = {(x, y) for x in range(1, 11) for y in range(1, 10) if math.hypot(x + 0.5 - 6, y + 0.5 - 5.5) <= 4.6}
cells = tone(ball, "L", "m", "d")
glyph = {(4, 2): "H", (5, 2): "H", (6, 2): "H", (7, 2): "H",
         (3, 3): "H", (4, 3): "g", (7, 3): "H", (8, 3): "g",
         (7, 4): "H", (8, 4): "g",
         (6, 5): "H", (7, 5): "g",
         (5, 6): "H", (6, 6): "g",
         (5, 8): "H", (6, 8): "g"}
cells.update(glyph)
cells[(3, 2)] = "W"  # the glint on the glass
cells.update({(x, 10): "w" for x in range(3, 9)})
options.append(("unknown_crystal_gold", "Unknown: the crystal ball with the gold question mark",
                "a=ink W=steel5 L=night4 m=night3 d=night2 H=gold5 g=gold3 w=wood3", outlined(cells)))

# --- Stats, arcane ------------------------------------------------------------------------
options.append(("stats_arcane_abacus", "Stats B: an arcane abacus, glowing beads in a dark frame with gold corners",
                "a=ink G=gold4 D=wood2 k=night1 r=steel1 B=sea3 b=sea2 L=night4 l=night3", [
                    "aaaaaaaaaaaa",
                    "aGDDDDDDDDGa",
                    "aDBBkLLkkkDa",
                    "aDbbrllrrrDa",
                    "aDkkkkkkkkDa",
                    "aDkkkBBkLLDa",
                    "aDrrrbbrllDa",
                    "aDkkkkkkkkDa",
                    "aDLLBBkkkkDa",
                    "aDllbbrrrrDa",
                    "aGDDDDDDDDGa",
                    "aaaaaaaaaaaa"]))

options.append(("stats_crystals", "Stats C: three crystal shards growing from a rock, like rising bars",
                "a=ink W=steel5 H=sea3 g=sea2 S=steel3 s=steel2", [
                    "........a...",
                    ".......aWa..",
                    ".......aHga.",
                    ".....a.aHga.",
                    "....aWaaHga.",
                    "....aHgaHga.",
                    "..a.aHgaHga.",
                    ".aWaaHgaHga.",
                    ".aHgaHgaHga.",
                    ".aHgaHgaHga.",
                    "aSSSSSSSSSsa",
                    "aaaaaaaaaaaa"]))

options.append(("stats_runetablet", "Stats D: a standing stone with three glowing bars carved in it",
                "a=ink h=steel4 m=steel3 s=steel2 B=sea3 W=steel5 g=green2", [
                    "...aaaaaa...",
                    "..ahhhhhma..",
                    ".ahmmmmmmsa.",
                    ".ahmmmmWmsa.",
                    ".ahmmmmBmsa.",
                    ".ahmmWmBmsa.",
                    ".ahmmBmBmsa.",
                    ".ahWmBmBmsa.",
                    ".ahBmBmBmsa.",
                    ".ahBmBmBmsa.",
                    ".agggmmggga.",
                    ".aaaaaaaaaa."]))

options.append(("stats_vials", "Stats E: three alchemist's vials, filled to rising levels",
                "a=ink W=steel5 e=night2 B=sea3 b=sea2 L=green3 l=green2 H=gold5 g=gold3", [
                    ".aaaaaaaaaa.",
                    ".aWeaWeaWea.",
                    ".aeeaeeaHHa.",
                    ".aeeaeeagga.",
                    ".aeeaLLagga.",
                    ".aeeallagga.",
                    ".aBBallagga.",
                    ".abballagga.",
                    ".abballagga.",
                    ".abballagga.",
                    "..aa.aa.aa..",
                    "............"]))

lines = ["# Interface options 3, 2026-10-26. Written by make_options.py."]
for name, desc, key, rows in options:
    assert len(rows) == N and all(len(r) == N for r in rows), name
    lines += ["", f"# {desc}", f"@asset icon_{name}", "size 12 12", "budget 8", f"key {key}", "frame"] + rows
(HERE / "options.px").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"{len(options)} options written")
