"""Build the M1 board. Run after src/make_bestiary.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
OFFICIAL = HERE.parents[1] / "official"

MONSTERS = [
    ("kamaitachi", "Kamaitachi", "Japanese folklore, the sickle weasel. A lean weasel reared up with both "
                                 "forelimbs ending in steel sickles, bristled spines, a long tail, riding a "
                                 "whirlwind. A regular (swarm) monster of Mistral Peaks. The walk swaps the "
                                 "swirl and the tail; hurt, the left blade breaks."),
]


def monster(mid, name, note):
    n = f"mob_{mid}"
    return section(name, note, [
        fig(OUT / f"{n}_idle.png", 8, "idle"), fig(OUT / f"{n}_hit.png", 8, "hit"),
        fig(OUT / f"{n}_hurt.png", 8, "hurt"), gif_fig(PREVIEW / f"{n}_walk.gif", 1, "walk"),
        gif_fig(PREVIEW / f"{n}_death.gif", 1, "death"),
        fig(OUT / f"{n}-strong_idle.png", 8, "strong"), fig(OUT / f"{n}-stronger_idle.png", 8, "stronger")])


sections = [monster(*m) for m in MONSTERS]
sections.append(section("Beside its kin", "Size check against the locked kobold.", [
    fig(OFFICIAL / "mobs" / "mob_kobold_idle.png", 8, "kobold"),
    fig(OUT / "mob_kamaitachi_idle.png", 8, "kamaitachi")]))

out = page("Monsters M1", "Monster batch M1: the pilot",
           "The Kamaitachi at all three Unmaking tiers, built exactly like the bestiary. Approve the look before "
           "the rest of the batch is drawn. &middot; 2026-10-29", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
