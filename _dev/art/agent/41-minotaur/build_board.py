"""Build the Minotaur board. Run after src/make_minotaur.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
OFFICIAL = HERE.parents[1] / "official"

sections = []
for t, label in (("", "weak"), ("-strong", "strong"), ("-stronger", "stronger")):
    n = f"mob_minotaur{t}"
    sections.append(section(f"The Minotaur, {label}", "", [
        fig(OUT / f"{n}_idle.png", 5, "idle"), fig(OUT / f"{n}_hit.png", 5, "hit: the red flash"),
        fig(OUT / f"{n}_hurt.png", 5, "hurt: hunched, axe broken"),
        gif_fig(PREVIEW / f"{n}_walk.gif", 1, "walk (x6)"), gif_fig(PREVIEW / f"{n}_death.gif", 1, "death (x6)")]))
sections.append(section("Beside the orc and the raider", "All at x5: the Minotaur is 20x25, the orc 14x19.", [
    fig(OUT / "mob_minotaur_idle.png", 5, "Minotaur"), fig(OFFICIAL / "mobs" / "mob_orc_idle.png", 5, "orc"),
    fig(OFFICIAL / "mobs" / "mob_raider_idle.png", 5, "raider")]))
out = page("Draconia Minotaur", "The Minotaur boss",
           "The full set the other monsters have, in their simple style and bigger, so it reads as a boss: idle, "
           "hit, hurt, walk and death at all three Unmaking tiers. Every pose but the idle is made by the same code "
           "that made the locked monsters &middot; 2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
