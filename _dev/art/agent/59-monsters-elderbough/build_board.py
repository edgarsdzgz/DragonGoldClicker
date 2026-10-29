"""Build the Elderbough Crown board (batch 59). Run after src/make_bestiary.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
MOBS = HERE.parents[1] / "official" / "mobs"

UNV = "UNVERIFIED: no second source found. "
MONSTERS = [
    ("amomongo", "Amomongo (regular, brute)",
     "Negros hairy ape: a man-sized white ape with long nails. Second source: a SunStar news feature (hairy white "
     "ape, long sharp nails, attacks on livestock and two men). Treated as an animal, not a spirit."),
    ("nogitsune", "Nogitsune (regular, ranged)",
     "The wild fox of Japanese folklore, never an Inari fox or shrine fox: tall ears, a white muzzle, four tails "
     "tipped with teal fox-fire. Second source: Pitt (Dash) yokai page, listed in the brief."),
    ("swarm-of-spiders", "Swarm of Spiders (regular) [D&D SRD 5.1, CC BY 4.0: needs the SRD credit]",
     "Many small brown spiders heaped together with one bigger in the middle; the Spider Queen's brood. No crown, "
     "no purple: it must not read as another Spider Queen (see the line-up)."),
    ("kalanoro", "Kalanoro (regular, swarm)",
     "Small hairy forest imp with fangs, glowing eyes (gold here, as every monster's) and feet turned backward, "
     "only the small imp, never the Vazimba ancestors. Second source: PBS NOVA (hairy, backward feet, eyes like "
     "coals)."),
    ("leshy", "Leshy (elite, brute)",
     "Slavic forest warden: bark body, green leaf hair and beard, twig antlers, one big eye and one small. Sources "
     "in the brief: three (Wikipedia, sacred-texts, Gutenberg)."),
    ("sasabonsam", "Sasabonsam (elite, brute)",
     "Akan tree dweller, kept a generic forest ambusher: perched on a bough, iron-grey fangs, long pale hair, long "
     "legs dangling with the feet hooked both ways. Second source is weak: a vampires.com blog post (tree "
     "dweller, iron teeth in some accounts, winged), so treat it as lightly verified."),
    ("humbaba", "Humbaba (boss, level 50)",
     "Guardian of the Cedar Forest in Gilgamesh: a giant with a lion's grimace and a dragon's maw, seven rays of "
     "terror above his head, a bronze breastplate and an uprooted cedar. Second source: World History "
     "Encyclopedia (dragon's maw, lion's face, seven terrors). Never a god: only the creature."),
]


def monster(mid, name, note):
    n = f"mob_{mid}"
    figs = [fig(OUT / f"{n}_idle.png", 6, "idle"), fig(OUT / f"{n}_hit.png", 6, "hit"),
            fig(OUT / f"{n}_hurt.png", 6, "hurt"), gif_fig(PREVIEW / f"{n}_walk.gif", 1, "walk"),
            gif_fig(PREVIEW / f"{n}_death.gif", 1, "death"),
            fig(OUT / f"{n}-strong_idle.png", 6, "strong"), fig(OUT / f"{n}-stronger_idle.png", 6, "stronger")]
    return section(name, note, figs)


sections = [monster(*m) for m in MONSTERS]
sections.append(section("The Swarm beside the Spider Queen", "Many small spiders against one big crowned queen.", [
    fig(MOBS / "mob_spider-queen_idle.png", 6, "spider queen (locked)"),
    fig(OUT / "mob_swarm-of-spiders_idle.png", 6, "swarm of spiders")]))
sections.append(section("Size line-up", "The locked kobold, the Spider Queen and the Basilisk beside the Land's "
                        "seven.", [
    fig(MOBS / "mob_kobold_idle.png", 6, "kobold (locked)"),
    fig(OUT / "mob_kalanoro_idle.png", 6, "kalanoro"), fig(OUT / "mob_amomongo_idle.png", 6, "amomongo"),
    fig(OUT / "mob_nogitsune_idle.png", 6, "nogitsune"),
    fig(OUT / "mob_swarm-of-spiders_idle.png", 6, "swarm"),
    fig(MOBS / "mob_spider-queen_idle.png", 6, "spider queen (locked)"),
    fig(OUT / "mob_leshy_idle.png", 6, "leshy"), fig(OUT / "mob_sasabonsam_idle.png", 6, "sasabonsam"),
    fig(MOBS / "mob_basilisk_idle.png", 6, "basilisk (locked)"),
    fig(OUT / "mob_humbaba_idle.png", 6, "humbaba")]))

out = page("Elderbough Crown", "Elderbough Crown, round 1: seven monsters",
           "Feral fey of a misty forest, levels 41 to 50. Idle, hit, hurt, walk and death at all three Unmaking "
           "tiers. Every folklore monster found a second source (the Sasabonsam's is a weak blog, see README); D&D SRD: "
           "the Swarm of Spiders (needs the SRD credit). &middot; 2026-10-29", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
