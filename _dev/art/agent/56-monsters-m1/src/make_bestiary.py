"""Monster batch M1, built by 44-bestiary's kit. Output: out/mob_<id>[-strong|-stronger]_{idle,hit,hurt}.png,
_walk_strip2.png, _death_strip4.png; out/mob_<id>_shadow.png for fliers. A two-frame monster's walk is its own two
frames (like 48-bestiary-fliers); a rider walks with the kit's bob. Every crack must land on the body in every frame.
Run: python -I src/make_bestiary.py
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parents[1]
AGENT = HERE.parent
sys.path.insert(0, str(HERE / "src"))
sys.path.insert(0, str(AGENT / "44-bestiary" / "src"))
from m1 import CREATURES, FLIERS, RIDERS  # noqa: E402
from kit import FPS, LOOKS, build, crack, death, draw, hit_pose, hurt_pose, pixkit, red_flash  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"


def shadow(width):
    """A flat ink oval about half the flier's width, three rows tall (as 48-bestiary-fliers)."""
    w = max(6, width // 2) | 1
    img = Image.new("RGBA", (w, 3), (0, 0, 0, 0))
    ink = pixkit.PALETTE["ink"] + (255,)
    for y, inset in ((0, 2), (1, 0), (2, 2)):
        for x in range(inset, w - inset):
            img.putpixel((x, y), ink)
    return img


def check(name, fills, cracks):
    for fill in fills:
        for line in cracks:
            for x, y in line:
                assert fill[y][x] != ".", f"{name}: crack cell {(x, y)} is off the body"


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
            if name in FLIERS:
                shadow(idle.width).save(OUT / f"mob_{name}_shadow.png")
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
        check(name, fills, cracks)
        rows.append((name, build_pair(name, fills, key, pose, cracks, flip)))
    for name, make in RIDERS.items():
        fill, key, pose, cracks, flip = make()
        check(name, [fill], cracks)
        rows.append((name, build(name, fill, key, pose, cracks, flip, OUT, PREVIEW)))
    pixkit.contact_sheet(rows, scale=6).save(PREVIEW / "m1_x6.png")
    print(len(rows), "monsters")


if __name__ == "__main__":
    main()
