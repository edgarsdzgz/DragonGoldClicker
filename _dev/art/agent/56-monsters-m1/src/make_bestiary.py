"""Monster batch M1 (pilot), built by 44-bestiary's kit. Output: out/mob_<id>[-strong|-stronger]_{idle,hit,hurt}.png,
_walk_strip2.png, _death_strip4.png. The walk is the monster's own two frames (like 48-bestiary-fliers).
Every crack must land on the body in both frames. Run: python -I src/make_bestiary.py
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parents[1]
AGENT = HERE.parent
sys.path.insert(0, str(HERE / "src"))
sys.path.insert(0, str(AGENT / "44-bestiary" / "src"))
from m1 import CREATURES  # noqa: E402
from kit import FPS, LOOKS, crack, death, draw, hit_pose, hurt_pose, pixkit, red_flash  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"


def build_pair(name, fills, key, pose, cracks, flip):
    bases = [draw(f, key) for f in fills]
    sheet = None
    for tier in ("", "strong", "stronger"):
        n = f"mob_{name}-{tier}" if tier else f"mob_{name}"
        idle, alt = (crack(b, cracks, *LOOKS[tier]) if tier else b for b in bases)
        hit, hurt = red_flash(hit_pose(idle, pose)), hurt_pose(idle, pose)
        for st, im in (("idle", idle), ("hit", hit), ("hurt", hurt)):
            im.save(OUT / f"{n}_{st}.png")
        frames = [idle, alt]
        pixkit.strip(frames).save(OUT / f"{n}_walk_strip2.png")
        dies = death(hurt, flip)
        pixkit.strip(dies).save(OUT / f"{n}_death_strip4.png")
        if not tier:
            pixkit.write_gif(frames, 4, PREVIEW / f"{n}_walk.gif", scale=5)
            pixkit.write_gif(dies + [dies[-1]] * 3, FPS, PREVIEW / f"{n}_death.gif", scale=5)
            sheet = [idle, alt, hit, hurt]
        else:
            sheet.append(idle)
    return sheet


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    rows = []
    for name, make in CREATURES.items():
        fills, key, pose, cracks, flip = make()
        for fill in fills:
            for line in cracks:
                for x, y in line:
                    assert fill[y][x] != ".", f"{name}: crack cell {(x, y)} is off the body"
        rows.append((name, build_pair(name, fills, key, pose, cracks, flip)))
    pixkit.contact_sheet(rows, scale=8).save(PREVIEW / "m1_x8.png")
    print(len(rows), "monsters")


if __name__ == "__main__":
    main()
