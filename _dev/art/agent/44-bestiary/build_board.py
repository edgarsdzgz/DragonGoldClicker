"""Build the bestiary board. Run after src/make_bestiary.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
OFFICIAL = HERE.parents[1] / "official"

GROUPS = [
    ("The early horde", [
        ("rat", "Giant Rat", "A hunched rat as big as a kobold: round pink ears, buck teeth, a bald tail."),
        ("goblin-scout", "Goblin Scout", "A goblin in a ragged hood, lean, with a sling."),
        ("goblin-archer", "Goblin Archer", "The goblin's wide head and long ears, a leather vest, a bow taller than it is."),
        ("banner-runner", "Banner-Runner", "A thin raider in wind-wraps, face covered, carrying a tattered war banner."),
    ]),
    ("The middle horde", [
        ("shield-bearer", "Shield Bearer", "An orc in a steel cap behind a tall, scarred tower shield."),
        ("beetle-guard", "Beetle Guard", "An upright beetle in dark plates, mandibles, pincer arms. It dies on its back."),
        ("chitin-warrior", "Chitin Warrior", "A tall ant soldier in dark brown chitin, a pale belly, a spear."),
        ("nomad-warrior", "Nomad Warrior", "A fur hood, a face wrap, layered furs, a curved blade."),
    ]),
    ("The Unmaking's own", [
        ("wraith", "Wraith", "A ragged gray shroud with no body inside: two gold eyes, long sleeves, a tattered hem."),
        ("shadow-phantom", "Shadow Phantom", "A tall silhouette darker than night, gaps flickering through it, long clawed arms."),
        ("ashen-convert", "Ashen Convert", "A human gone ash-gray: a burned scalp, a bone-pale mask, a rust robe, a crude knife."),
        ("ember-prophet", "Ember Prophet", "A hooded cultist, cinders in the dark of the hood, swinging a burning censer."),
        ("ember-wraith", "Ember Wraith", "A small drake of smoke and embers, what the Unmaking left of one."),
    ]),
    ("Bosses", [
        ("stone-golem", "Stone Golem", "Stacked rubble, moss in the cracks, gold seams glowing between the stones (22x26)."),
        ("giant-elemental", "Giant Elemental", "A column of flame with a rough body, arms of fire, molten rock at its feet (22x28)."),
        ("khagan", "Khagan of the Sirocco", "A horned helm that hides the face, a fur mantle, banners on his back, a great blade (20x25)."),
        ("forge-master", "Forge-Master of the Inferno", "Bald and ash-gray, a melted forge apron dripping fire, a glowing hammer (20x25)."),
        ("corrupted-wyvern", "Corrupted Wyvern", "Darkened by the Unmaking: ragged wings raised like a cape, spikes, talons (24x24)."),
    ]),
]


def monster(mid, name, note):
    n = f"mob_{mid}"
    figs = [fig(OUT / f"{n}_idle.png", 5, "idle"), fig(OUT / f"{n}_hit.png", 5, "hit"),
            fig(OUT / f"{n}_hurt.png", 5, "hurt"), gif_fig(PREVIEW / f"{n}_walk.gif", 1, "walk"),
            gif_fig(PREVIEW / f"{n}_death.gif", 1, "death"),
            fig(OUT / f"{n}-strong_idle.png", 5, "strong"), fig(OUT / f"{n}-stronger_idle.png", 5, "stronger")]
    if mid == "rat":
        figs += [fig(OUT / "rat_v1" / f"{n}{t}_idle.png", 5, f"v1 {t[1:] or 'weak'}") for t in ("", "-strong", "-stronger")]
        note += (" v2 (owner: the cracks did not read): five longer cracks, and peach in place of the pink, which "
                 "was too close to the Unmaking's magenta. v1 for comparison at the end.")
    return section(name, note, figs)


sections = []
for group, items in GROUPS:
    sections.append(f"<h2 style='margin-top:12px'>{group}</h2>")
    sections += [monster(*m) for m in items]
EXISTING = ["kobold", "goblin", "crawler", "orc", "raider"]
sections.append("<h2 style='margin-top:12px'>The existing six, shaded (v2)</h2>")
sections.append(section("Locked v1, then shaded v2", "The same drawings through the same shading step, so the "
                        "whole horde matches. Their v1 stays locked until this is approved.",
                        [f for n in EXISTING for f in (fig(OFFICIAL / "mobs" / f"mob_{n}_idle.png", 5, f"{n} v1"),
                                                       fig(OUT / "v2" / f"mob_{n}_idle.png", 5, f"{n} v2"))] +
                        [fig(OFFICIAL / "mobs" / "mob_minotaur_idle.png", 5, "minotaur v1"),
                         fig(OUT / "v2" / "mob_minotaur_idle.png", 5, "minotaur v2")]))
sections.append(section("Beside the townsfolk", "Monsters must never read as villagers.",
                        [fig(OFFICIAL / "people" / f"ppl_{n}.png", 5, n) for n in ("human", "elf", "dwarf", "orc")] +
                        [fig(OUT / f"mob_{n}_idle.png", 5, n) for n in ("banner-runner", "nomad-warrior", "ashen-convert")]))

out = page("Draconia Bestiary", "The bestiary",
           "Eighteen new monsters from the old Draconia bestiary, in the simple monster style with the busts' "
           "shading: light on the upper left, dark on the right, no blending. Each has idle, hit, hurt, walk and "
           "death at all three Unmaking tiers, built by the locked monsters' own code. Bosses vary in size. The "
           "existing six are shaded too, as v2. Locked: all but the Giant Rat, which is waiting on its v2 cracks. The first board is board_v1.html &middot; 2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
