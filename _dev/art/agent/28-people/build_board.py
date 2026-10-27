"""Build the Batch 6 review board: every role beside the fighter and the townsfolk, the rank and
forager lines, the repairer at work, and the four wanderer groups. Run after build.py and
src/make_wanderers.py. Output: board.html.
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT = HERE / "out"
FOLK = HERE.parents[1] / "official" / "people"


def role(name):
    return Image.open(OUT / f"ppl_{name}.png").convert("RGBA")


fighter = Image.open(FOLK / "ppl_fighter_idle.png").convert("RGBA")
repair = Image.open(OUT / "ppl_repairer_strip2.png").convert("RGBA")
line_up = [fig(fighter, 6, "Fighter (locked)")] + [fig(role(n), 6, c) for n, c in (
    ("conscript", "Conscript"), ("footman", "Footman"), ("knight", "Knight"), ("gatherer", "Gatherer"),
    ("trapper", "Trapper"), ("ranger", "Ranger"), ("explorer", "Explorer"))]
line_up.append(fig(repair.crop((0, 0, 15, 16)), 6, "Repairer"))
line_up += [fig(FOLK / f"ppl_{n}.png", 6, f"Townsfolk: {n}") for n in ("human", "dwarf", "halfling", "orc", "elf", "horned")]

sections = [
    section("The roles beside the townsfolk (x6)",
            "Feet on one line, as they will stand in the game. Each role is a different people, so the line-up "
            "shows the whole town.", line_up),
    section("Soldier ranks (x8)",
            "Rank reads from gear alone: the conscript in an undyed, patched tunic with a rope belt and a dull "
            "spear; the footman in a nasal helmet and dark gambeson behind a round shield; the knight in plate "
            "under a gold tabard, a great helm with a gold plume, and a lance with a gold pennant.",
            [fig(role(n), 8, c) for n, c in (("conscript", "Conscript (human)"), ("footman", "Footman (human)"),
                                              ("knight", "Knight (human)"))]),
    section("Forager tiers (x8)",
            "The gatherer is the halfling with a basket of greens and berries on the hip; the trapper is the orc "
            "in a fur cap with a pelt over the shoulder and a coil of snare rope at the belt; the ranger is an "
            "elf under a green hood with a longbow.",
            [fig(role(n), 8, c) for n, c in (("gatherer", "Gatherer (halfling)"), ("trapper", "Trapper (orc)"),
                                              ("ranger", "Ranger (elf)"))]),
    section("Explorer and repairer (x8)",
            "The explorer is horned folk in a traveling coat with pack straps, a crook staff and a lantern. The "
            "repairer is the dwarf with a hammer: raised, then striking, 2 frames at 4 fps.",
            [fig(role("explorer"), 8, "Explorer (horned folk)"),
             fig(repair.crop((0, 0, 15, 16)), 8, "Repairer: raised"),
             fig(repair.crop((15, 0, 30, 16)), 8, "Repairer: striking"),
             gif_fig(HERE / "preview" / "ppl_repairer.gif", 1, "Repairer at work (x6)")]),
    section("Wanderer groups (x6)",
            "Small parties on a strip of road, for the arrival events: a lone traveler with a walking staff, a "
            "couple, a family with a child, and an old soldier on a crutch with an eye patch and a bandaged leg.",
            [fig(OUT / f"evt_wanderer-{n}.png", 6, c) for n, c in (
                ("lone", "Lone"), ("couple", "Couple"), ("family", "Family"), ("veteran", "Veteran"))]),
]
html = page("Draconia People", "Batch 6: People",
            "The game's roles and the wanderers, at townsfolk scale and in the fighter's style &middot; 2026-10-27",
            sections)
(HERE / "board.html").write_text(html, encoding="utf-8")
print(f"board.html: {len(html) // 1024} KB")
