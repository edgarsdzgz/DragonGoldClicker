"""The bestiary's batch 3 of 3, v1, 2026-10-27: four bosses, built by 44-bestiary's kit.

Output: out/mob_<id>[-strong|-stronger]_{idle,hit,hurt}.png, _walk_strip2.png, _death_strip4.png for each.
preview/: walk and death GIFs, and a contact sheet. Every crack must land on the body (the crack code paints
any cell it is given).
Run: python src/make_bestiary.py
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE / "src"))
from bosses import CREATURES, lich  # noqa: E402
from kit import build, pixkit  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    rows = []
    for name, make in CREATURES.items():
        fill, key, pose, cracks, flip = make()
        for line in cracks:
            for x, y in line:
                assert fill[y][x] != ".", f"{name}: crack cell {(x, y)} is off the body"
        rows.append((name, build(name, fill, key, pose, cracks, flip, OUT, PREVIEW)))
    pixkit.contact_sheet(rows, scale=4).save(PREVIEW / "bosses_x4.png")
    # The Lich v2b, corpse gray-green, for comparison with v2a (the main build); v1 is kept in out/lich_v1/
    (OUT / "lich_v2b").mkdir(exist_ok=True)
    (PREVIEW / "lich_v2b").mkdir(exist_ok=True)
    build("lich", *lich("orc3", "orc2"), OUT / "lich_v2b", PREVIEW / "lich_v2b")
    print(len(rows), "bosses")


if __name__ == "__main__":
    main()
