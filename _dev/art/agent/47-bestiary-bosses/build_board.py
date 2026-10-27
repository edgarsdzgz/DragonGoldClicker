"""Build the bosses board. Run after src/make_bestiary.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
OFFICIAL = HERE.parents[1] / "official"

GROUPS = [
    ("Beasts", [
        ("basilisk", "Basilisk", "A crowned serpent-lizard: a frill of gold spikes, eyes burning white-gold, a low "
                                 "splayed body, a curling tail (24x20). Hurt, a crown spike breaks."),
        ("spider-queen", "Spider Queen", "The Shadow Crawlers' mother: a bloated abdomen carrying pale egg sacs, "
                                         "eight eyes, fangs, eight long legs (26x20). She dies on her back, like "
                                         "the crawler."),
        ("corrupted-drake", "Corrupted Drake", "The Ember Wraith's great cousin: thick swept horns, cracked charcoal "
                                               "scales with fire in the seams and jaws, small raised wings, far "
                                               "smaller than the Wyvern's (24x22)."),
    ]),
    ("The risen dead", [
        ("lich", "Lich", "The master of the Skeletons and Spectral Hounds: a crowned skull in a high-collared robe, "
                         "a staff with a pale green orb, magic in its bony hand (20x25). Hurt, the orb shatters."),
    ]),
]


def full_set(mid, out, preview, tag=""):
    n = f"mob_{mid}"
    return [fig(out / f"{n}_idle.png", 5, f"{tag}idle"), fig(out / f"{n}_hit.png", 5, f"{tag}hit"),
            fig(out / f"{n}_hurt.png", 5, f"{tag}hurt"), gif_fig(preview / f"{n}_walk.gif", 1, f"{tag}walk"),
            gif_fig(preview / f"{n}_death.gif", 1, f"{tag}death"),
            fig(out / f"{n}-strong_idle.png", 5, f"{tag}strong"), fig(out / f"{n}-stronger_idle.png", 5, f"{tag}stronger")]


def monster(mid, name, note):
    if mid != "lich":
        return section(name, note, full_set(mid, OUT, PREVIEW))
    note += (" v2 (owner: v1 looked too alive): v2a, the first row, is cold gray bone; v2b, the second, is corpse "
             "gray-green. Both have sunken cheeks. v1's warm bone at the end, for comparison.")
    return section(name, note, full_set(mid, OUT, PREVIEW, "v2a ") +
                   full_set(mid, OUT / "lich_v2b", PREVIEW / "lich_v2b", "v2b ") +
                   [fig(OUT / "lich_v1" / "mob_lich_idle.png", 5, "v1"),
                    fig(OUT / "lich_v1" / "mob_lich-stronger_idle.png", 5, "v1 stronger")])


sections = []
for group, items in GROUPS:
    sections.append(f"<h2 style='margin-top:12px'>{group}</h2>")
    sections += [monster(*m) for m in items]
KIN = [("crawler", "crawler"), ("spider-queen", None), ("ember-wraith", "ember wraith"),
       ("corrupted-drake", None), ("corrupted-wyvern", "corrupted wyvern"), ("skeleton", "skeleton"),
       ("lich", None), ("khagan", "khagan")]
sections.append(section("Beside their kin", "Each boss next to the monster it leads or echoes, and the locked "
                        "bosses for size.",
                        [fig((OFFICIAL / "mobs" if (OFFICIAL / "mobs" / f"mob_{m}_idle.png").exists() else OUT)
                             / f"mob_{m}_idle.png", 4, cap or m.replace("-", " ")) for m, cap in KIN]))

out = page("Bestiary Bosses", "The bestiary, batch 3 of 3: bosses",
           "Four bosses, sized like the locked ones (beasts bigger than the human-shaped), built exactly like the "
           "locked bestiary: shaded from the upper left, no blending, idle, hit, hurt, walk and death at all three "
           "Unmaking tiers. The last batch of the second round. &middot; 2026-10-27",
           sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
