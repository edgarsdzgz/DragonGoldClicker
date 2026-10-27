"""The bestiary batch, v1, 2026-10-27: 18 new monsters and the six existing ones shaded (v2).

Owner: "Let's try and make all of these in one batch. Keep to the patterns we already have for our monsters
and our NPCs. Light on details, still shading. Pixel art with rough color edges, no blending." Rulings: shade
every monster (the six existing redone as v2; their v1 stays locked), bosses vary in size, and the Unmaking
can take dragons (the Corrupted Wyvern and the Ember Wraith).

Output: out/mob_<id>[-strong|-stronger]_{idle,hit,hurt}.png, _walk_strip2.png, _death_strip4.png for each;
the six existing ones as out/v2/. preview/: walk and death GIFs, and contact sheets.
Run: python src/make_bestiary.py
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE / "src"))
sys.path.insert(0, str(HERE.parent / "41-minotaur" / "src"))
from kit import build, pixkit  # noqa: E402
from creatures import CREATURES  # noqa: E402
from make_mobs import MOBS  # noqa: E402
from make_unmade import CRACKS  # noqa: E402
import make_minotaur  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"


def main():
    (OUT / "v2").mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    rows = []
    for name, make in CREATURES.items():
        fill, key, pose, cracks, flip = make()
        rows.append((name, build(name, fill, key, pose, cracks, flip, OUT, PREVIEW)))
    pixkit.contact_sheet(rows, scale=4).save(PREVIEW / "bestiary_x4.png")
    old = []
    for name, m in MOBS.items():
        old.append((name, build(name, m["fill"], m["key"], m["pose"], CRACKS[name], name == "crawler",
                                OUT / "v2", PREVIEW)))
    old.append(("minotaur", build("minotaur", make_minotaur.fill(), make_minotaur.KEY, make_minotaur.POSE,
                                  make_minotaur.CRACKS, False, OUT / "v2", PREVIEW)))
    pixkit.contact_sheet(old, scale=4).save(PREVIEW / "existing_v2_x4.png")
    print(len(rows), "new monsters,", len(old), "existing shaded")


if __name__ == "__main__":
    main()
