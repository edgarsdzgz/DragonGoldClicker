"""The bestiary's fliers and riders, v1, 2026-10-27, built by 44-bestiary's kit.

A flier's walk strip is its own two frames (a wingbeat, or a gallop on the wind), the second lifted a pixel
like the walk bob; everything else (hit, hurt, cracks, death) is the kit's. Each flier also gets a shadow, a
flat ink oval for the game to draw on the road beneath it. Riders on mounts build like any monster.

Output: out/mob_<id>[-strong|-stronger]_{idle,hit,hurt}.png, _walk_strip2.png, _death_strip4.png;
out/mob_<id>_shadow.png for fliers. preview/: GIFs and a contact sheet. Every crack must land on the body.
Run: python src/make_bestiary.py
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE / "src"))
from fliers import FLIERS, RIDERS  # noqa: E402
from kit import FPS, LOOKS, build, crack, death, draw, hit_pose, hurt_pose, pixkit, red_flash, walk  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"


def check(name, fills, cracks):
    for fill in fills:
        for line in cracks:
            for x, y in line:
                assert fill[y][x] != ".", f"{name}: crack cell {(x, y)} is off the body"


def shadow(width):
    """A flat ink oval about half the flier's width, three rows tall."""
    w = max(6, width // 2) | 1
    img = Image.new("RGBA", (w, 3), (0, 0, 0, 0))
    ink = pixkit.PALETTE["ink"] + (255,)
    for y, inset in ((0, 2), (1, 0), (2, 2)):
        for x in range(inset, w - inset):
            img.putpixel((x, y), ink)
    return img


def build_flier(name, fills, key, pose, cracks, flip):
    bases = [draw(f, key) for f in fills]
    sheet = None
    for tier in ("", "strong", "stronger"):
        n = f"mob_{name}-{tier}" if tier else f"mob_{name}"
        idle, beat = (crack(b, cracks, *LOOKS[tier]) if tier else b for b in bases)
        hit, hurt = red_flash(hit_pose(idle, pose)), hurt_pose(idle, pose)
        for st, im in (("idle", idle), ("hit", hit), ("hurt", hurt)):
            im.save(OUT / f"{n}_{st}.png")
        frames = [idle, walk(beat)[1]]
        pixkit.strip(frames).save(OUT / f"{n}_walk_strip2.png")
        dies = death(hurt, flip)
        pixkit.strip(dies).save(OUT / f"{n}_death_strip4.png")
        if not tier:
            pixkit.write_gif(frames, 4, PREVIEW / f"{n}_walk.gif", scale=5)
            pixkit.write_gif(dies + [dies[-1]] * 3, FPS, PREVIEW / f"{n}_death.gif", scale=5)
            shadow(idle.width).save(OUT / f"mob_{name}_shadow.png")
            sheet = [idle, frames[1], hit, hurt]
        else:
            sheet.append(idle)
    return sheet


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    rows = []
    for name, make in FLIERS.items():
        fills, key, pose, cracks, flip = make()
        check(name, fills, cracks)
        rows.append((name, build_flier(name, fills, key, pose, cracks, flip)))
    for name, make in RIDERS.items():
        fill, key, pose, cracks, flip = make()
        check(name, [fill], cracks)
        rows.append((name, build(name, fill, key, pose, cracks, flip, OUT, PREVIEW)))
    pixkit.contact_sheet(rows, scale=4).save(PREVIEW / "fliers_x4.png")
    print(len(rows), "fliers and riders")


if __name__ == "__main__":
    main()
