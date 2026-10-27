"""The Minotaur boss, v1, 2026-10-27: the whole set the other monsters have, in their simple style.

Drawn in 22-mobs' language (front-on, flat fills, glowing gold dot eyes, ink outline), bigger than the
orc so it reads as a boss: a bull's head with sweeping horns, a nose ring, a heavy brown body, a belt
and loincloth, a double axe. Then built exactly as the locked monsters were, with their own code:
- hit, hurt and walk: 22-mobs (hit flashes red, hurt hunches and breaks the axe, walk bobs);
- strong and stronger: 24-mobs-unmaking's cracks (magenta2 / magenta3 lines);
- death: 33-mob-deaths v2 (squash, fall, land in dust, unmade), centered on the walk's frame.

Output: out/mob_minotaur[-strong|-stronger]_{idle,hit,hurt}.png, _walk_strip2.png, _death_strip4.png.
Run: python src/make_minotaur.py
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parents[1]
AGENT = HERE.parent
sys.path.insert(0, str(AGENT / "22-mobs" / "src"))
sys.path.insert(0, str(AGENT / "24-mobs-unmaking" / "src"))
sys.path.insert(0, str(AGENT / "33-mob-deaths" / "src"))
from make_mobs import draw, hit_pose, hurt_pose, hx, pixkit, red_flash, walk  # noqa: E402
from make_unmade import LOOKS, crack  # noqa: E402
from make_deaths import FPS, death  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
W, H = 18, 22


def fill():
    """The fill grid, drawn with rectangles: 18 wide, 22 tall (the orc is 12 by 16)."""
    g = [["."] * W for _ in range(H)]

    def rect(x0, y0, x1, y1, ch):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                g[y][x] = ch

    def pts(cells, ch):
        for x, y in cells:
            g[y][x] = ch

    pts([(0, 0), (0, 1), (1, 1), (1, 2), (2, 2), (3, 2), (3, 3)], "h")                # horns, sweeping up
    pts([(15, 0), (15, 1), (14, 1), (14, 2), (13, 2), (12, 2), (12, 3)], "h")
    rect(4, 3, 11, 9, "B")                                                            # the bull's head
    pts([(3, 4), (12, 4)], "B")                                                       # ears
    pts([(5, 4), (6, 4), (9, 4), (10, 4)], "D")                                       # a heavy brow
    pts([(5, 5), (10, 5)], "e")                                                       # eyes
    rect(5, 7, 10, 9, "M")                                                            # the muzzle
    pts([(6, 8), (9, 8)], "a")                                                        # nostrils
    rect(3, 10, 12, 10, "B")                                                          # neck
    pts([(7, 10), (8, 10)], "r")                                                      # the nose ring
    rect(1, 11, 14, 14, "B")                                                          # shoulders and chest
    rect(0, 11, 1, 17, "B")                                                           # arms
    rect(14, 11, 15, 17, "B")
    pts([(5, 12), (10, 12), (6, 13), (9, 13)], "D")                                   # the chest's shape
    rect(2, 15, 13, 15, "L")                                                          # the belt
    pts([(7, 15), (8, 15)], "g")
    rect(4, 16, 11, 18, "T")                                                          # loincloth
    rect(4, 19, 6, 20, "B")                                                           # legs
    rect(9, 19, 11, 20, "B")
    rect(3, 21, 6, 21, "K")                                                           # hooves
    rect(9, 21, 12, 21, "K")
    rect(16, 5, 16, 21, "p")                                                          # the double axe
    rect(13, 5, 15, 9, "s")
    rect(17, 5, 17, 9, "s")
    pts([(13, 5), (14, 5)], "S")
    return ["".join(r) for r in g]


KEY = {"h": "parch2", "B": "wood3", "D": "wood2", "e": "gold5", "M": "parch1", "a": "ink", "r": "gold4",
       "L": "wood1", "g": "gold4", "T": "clay1", "K": "night1", "p": "wood2", "s": "steel3", "S": "steel5"}

# draw() adds one column on the left and two rows on top, so pose coordinates are fill + (1, 2).
POSE = dict(waist=17, back=0, eyes={hx("gold5")}, lid=hx("wood3"), body=hx("wood3"), dark=hx("wood2"),
            spots=[(5, 14), (13, 15)], weapon=lambda x, y: x >= 14 and 7 <= y <= 11)

# Unmaking cracks, in fill coordinates like 24-mobs-unmaking's: head, chest, an arm, a leg.
CRACKS = [[(7, 3), (6, 4), (7, 5)], [(3, 12), (4, 13)], [(11, 11), (12, 12), (11, 13)], [(15, 14), (15, 15)],
          [(10, 19), (10, 20)]]


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    base = draw(fill(), KEY)
    rows = []
    for tier in ("", "strong", "stronger"):
        name = f"mob_minotaur-{tier}" if tier else "mob_minotaur"
        idle = crack(base, CRACKS, *LOOKS[tier]) if tier else base
        hit, hurt = red_flash(hit_pose(idle, POSE)), hurt_pose(idle, POSE)
        for st, im in (("idle", idle), ("hit", hit), ("hurt", hurt)):
            im.save(OUT / f"{name}_{st}.png")
        frames = walk(idle)
        pixkit.strip(frames).save(OUT / f"{name}_walk_strip2.png")
        pixkit.write_gif(frames, 4, PREVIEW / f"{name}_walk.gif", scale=6)
        dies = death(hurt, flip=False)
        pixkit.strip(dies).save(OUT / f"{name}_death_strip4.png")
        pixkit.write_gif(dies + [dies[-1]] * 3, FPS, PREVIEW / f"{name}_death.gif", scale=6)
        rows.append((tier or "weak", [idle, hit, hurt] + frames + dies))
    pixkit.contact_sheet(rows, scale=6).save(PREVIEW / "minotaur_x6.png")
    print("minotaur:", base.size)


if __name__ == "__main__":
    main()
