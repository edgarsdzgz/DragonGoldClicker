"""Build the elites board. Run after src/make_bestiary.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
OFFICIAL = HERE.parents[1] / "official"

GROUPS = [
    ("Leaders of their kind", [
        ("kobold-shaman", "Kobold Shaman", "A big kobold under a bone mask and a crest of feathers, a skull-topped "
                                           "staff, green fire in one hand. Hurt, the skull breaks off."),
        ("goblin-chieftain", "Goblin Chieftain", "A fat goblin under a crown of bones, a dark fur mantle with a gold "
                                                 "clasp, a heavy cleaver."),
        ("orc-warchief", "Orc Warchief", "A big orc in a horned steel helm and spiked pauldrons, a rust war banner "
                                         "on his back, a great axe."),
    ]),
    ("Brutes", [
        ("troll", "Troll", "Hunched, its shoulders above its small head: a long nose, moss on its back, arms down to "
                           "its knees, a club."),
        ("ogre", "Ogre", "Huge and dim: a small head under a heavy brow, an underbite with tusks, a bare belly, a "
                         "log on its shoulder."),
        ("iron-golem", "Iron Golem", "The Stone Golem's smaller, riveted cousin: iron plates, an eye slit, a "
                                     "furnace burning in its chest."),
    ]),
    ("The Wind-Taken", [
        ("windcaller", "Windcaller", "A nomad wind-mage: a tall hood and face wrap, a long robe, a ringed staff, a "
                                     "whirlwind over one hand. Hurt, the whirlwind dies."),
    ]),
]


def monster(mid, name, note):
    n = f"mob_{mid}"
    return section(name, note, [
        fig(OUT / f"{n}_idle.png", 5, "idle"), fig(OUT / f"{n}_hit.png", 5, "hit"),
        fig(OUT / f"{n}_hurt.png", 5, "hurt"), gif_fig(PREVIEW / f"{n}_walk.gif", 1, "walk"),
        gif_fig(PREVIEW / f"{n}_death.gif", 1, "death"),
        fig(OUT / f"{n}-strong_idle.png", 5, "strong"), fig(OUT / f"{n}-stronger_idle.png", 5, "stronger")])


sections = []
for group, items in GROUPS:
    sections.append(f"<h2 style='margin-top:12px'>{group}</h2>")
    sections += [monster(*m) for m in items]
KIN = [("kobold", "kobold"), ("kobold-shaman", None), ("goblin", "goblin"), ("goblin-chieftain", None),
       ("orc", "orc"), ("orc-warchief", None), ("stone-golem", "stone golem"), ("iron-golem", None),
       ("nomad-warrior", "nomad warrior"), ("windcaller", None)]
sections.append(section("Beside their kin", "Each elite next to the locked monster it leads or echoes: bigger "
                        "than a regular, smaller than a boss.",
                        [fig(OFFICIAL / "mobs" / f"mob_{m}_idle.png", 5, cap) if cap else
                         fig(OUT / f"mob_{m}_idle.png", 5, m.replace("-", " ")) for m, cap in KIN]))

out = page("Bestiary Elites", "The bestiary, batch 2 of 3: elites",
           "Seven elites, between a regular monster and a boss in size (about 16x20), built exactly like the "
           "locked bestiary: shaded from the upper left, no blending, idle, hit, hurt, walk and death at all three "
           "Unmaking tiers. The three leaders keep their kind's look. Next: batch 3, the bosses. &middot; 2026-10-27",
           sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
