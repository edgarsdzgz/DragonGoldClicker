"""The simple mobs, version 2: marked by the Unmaking (owner, 2026-10-27: "our monsters are affected
by the unmaking, so they all need the purple cracks throughout their body. Regardless of the color
of their skin").

Each mob's idle from 22-mobs gets crack lines over its body: head, torso and limbs, over clothes
too (owner: "even humans need to have cracks"). The three looks are wave tiers (owner: "weak >
strong > stronger, for deeper waves"): weak is the uncracked 22-mobs art; strong has dark cracks
(magenta2 lines, a magenta3 heart); stronger has glowing cracks (magenta3 lines, a magenta4 heart).
Hit, hurt and walk are rebuilt from the cracked idle, so the cracks move with the body.

Run: python make_unmade.py
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
BATCH = HERE.parent
sys.path.insert(0, str(BATCH.parent / "22-mobs" / "src"))

import make_mobs as v1  # noqa: E402
from make_mobs import MOBS, draw, hit_pose, hurt_pose, pixkit, red_flash, walk  # noqa: E402

P = pixkit.PALETTE
OUT, PREVIEW = BATCH / "out", BATCH / "preview"
LOOKS = {"strong": ("magenta2", "magenta3"), "stronger": ("magenta3", "magenta4")}

# Crack lines in fill-grid coordinates (x, y); the middle pixel of each line is its bright heart.
CRACKS = {
    "kobold": [[(6, 1), (5, 2), (5, 3)], [(2, 7), (2, 8), (3, 9)], [(8, 9), (7, 10)]],
    "goblin": [[(7, 1), (6, 2), (6, 3)], [(1, 8), (1, 9)], [(4, 8), (5, 9), (5, 10)], [(8, 11), (8, 12)]],
    "crawler": [[(7, 0), (6, 1), (6, 2)], [(4, 3), (4, 4)], [(9, 3), (8, 4)], [(2, 4)]],
    "orc": [[(5, 0), (4, 1), (5, 2)], [(1, 9), (2, 10)], [(9, 8), (8, 9)], [(7, 14), (6, 15)], [(4, 8), (5, 9), (5, 10)]],
    "raider": [[(6, 0), (7, 1), (7, 2)], [(4, 4), (5, 5)], [(3, 7), (4, 8), (4, 9)], [(6, 13), (5, 14)]],
}


def crack(img, lines, line, heart):
    out = img.copy()
    for pts in lines:
        for i, (x, y) in enumerate(pts):
            # draw() adds one column of margin and two rows on top.
            out.putpixel((x + 1, y + 2), P[heart if i == len(pts) // 2 else line] + (255,))
    return out


def main():
    rows = []
    for look, (line, heart) in LOOKS.items():
        (OUT / look).mkdir(parents=True, exist_ok=True)
        (PREVIEW / look).mkdir(parents=True, exist_ok=True)
        for name, m in MOBS.items():
            idle = draw(m["fill"], m["key"])
            idle = crack(idle, CRACKS[name], line, heart)
            hit, hurt = red_flash(hit_pose(idle, m["pose"])), hurt_pose(idle, m["pose"])
            for st, im in (("idle", idle), ("hit", hit), ("hurt", hurt)):
                im.save(OUT / look / f"mob_{name}-{look}_{st}.png")
            frames = walk(idle)
            pixkit.strip(frames).save(OUT / look / f"mob_{name}-{look}_walk_strip2.png")
            pixkit.write_gif(frames, 4, PREVIEW / look / f"mob_{name}-{look}_walk.gif", scale=6)
            rows.append((f"{look} {name}", [idle, hit, hurt]))
    pixkit.contact_sheet(rows, scale=6).save(PREVIEW / "unmade_x6.png")
    print("written", v1.__name__)


if __name__ == "__main__":
    main()
