"""Build the Riverglass Delta board. Run after src/make_bestiary.py. Output: board.html."""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
MOBS = HERE.parents[1] / "official" / "mobs"

UNV = " <b>UNVERIFIED</b>: "
MONSTERS = [
    ("kappa", "Kappa (regular, swarm)", False,
     "Japanese river imp: a teal child with a big water dish brimming on its bowl-cut head, a small pale beak and a "
     "brown turtle shell behind the shoulders. A pest, not a deity. Hurt: the dish water spills. Second source: "
     "World History Encyclopedia (confirms dish, shell, beak, drowning, and that a spilled dish leaves it helpless)."),
    ("kongamato", "Kongamato (regular, flier)", True,
     "Zambian river pterosaur: rust-red body and leathery bone-fingered wings, a tall backward crest and a long "
     "beak of white teeth. The walk is a wingbeat; it has a shadow. Cryptid." + UNV +
     "second source is only a popular bestiary site (abookofcreatures.com), no scholarly one found."),
    ("nixie", "Nixie (regular, ranged)", False,
     "German water spirit: a small pale-gray figure with a big head, wet sea-blue hair and a golden harp it plays to "
     "lure. Hurt: the harp breaks. Two sources in the brief (Dash, Gutenberg)."),
    ("jenny-greenteeth", "Jenny Greenteeth (elite, brute)", False,
     "English river hag: bright emerald skin, a wild tangle of dark hair hung with duckweed, a grin of green teeth "
     "and long clawed arms reaching from the water she lurks in. Three sources in the brief."),
    ("ahuizotl", "Ahuizotl (elite, brute)", False,
     "Aztec water beast: dog-sized, wet spiked black-purple fur, monkey hands, and a tail that rises beside it and "
     "ends in a big pale human hand (the mark). Living-belief note: yellow; kept a monster, never a deity. Second "
     "source: godsandmonsters.info, which cites the Florentine Codex and Hernandez. Hurt: the tail hand is lost."),
    ("berberoka", "Berberoka (mini-boss, brute)", False,
     "Philippine pond-drainer: a huge mud-and-moss lump with gold eyes on bulbs, reeds on its crown, a wide toothed "
     "mouth, and the drained pond's water flooding out in front with stranded fish." + UNV +
     "the second source (FilipiKnow, a popular article) confirms only the drain-and-drown and the region; no source "
     "describes its body, so this design is mine."),
    ("hydra", "Lernaean Hydra (boss)", False,
     "Nine-headed marsh serpent: green heads on long necks fanned over a low coiled body with a parchment belly; the "
     "middle, deathless head is pale and horned. In the walk the heads sway. Hurt: one head is cut off. Second "
     "source: Apollodorus, Library 2.5.2 (Perseus). <b>SRD 5.1 monster (the Hydra): the SRD credit is needed "
     "when the game ships.</b>"),
]


def lifted(mid, scale):
    """The flier drawn lifted over its shadow, as the game places it."""
    idle = Image.open(OUT / f"mob_{mid}_idle.png").convert("RGBA")
    sh = Image.open(OUT / f"mob_{mid}_shadow.png").convert("RGBA")
    lift = 3
    img = Image.new("RGBA", (idle.width, idle.height + lift + sh.height), (0, 0, 0, 0))
    img.alpha_composite(sh, ((idle.width - sh.width) // 2, idle.height + lift))
    img.alpha_composite(idle, (0, 0))
    return fig(img, scale, "lifted over its shadow")


def monster(mid, name, flier, note):
    n = f"mob_{mid}"
    figs = [fig(OUT / f"{n}_idle.png", 6, "idle"), fig(OUT / f"{n}_hit.png", 6, "hit"),
            fig(OUT / f"{n}_hurt.png", 6, "hurt"), gif_fig(PREVIEW / f"{n}_walk.gif", 1, "walk"),
            gif_fig(PREVIEW / f"{n}_death.gif", 1, "death"),
            fig(OUT / f"{n}-strong_idle.png", 6, "strong"), fig(OUT / f"{n}-stronger_idle.png", 6, "stronger")]
    if flier:
        figs.append(lifted(mid, 6))
    return section(name, note, figs)


sections = [monster(*m) for m in MONSTERS]
sections.append(section("Size line-up", "The locked kobold, then the three regulars, the two elites, the mini-boss, "
                        "the locked Basilisk and the boss.", [
    fig(MOBS / "mob_kobold_idle.png", 6, "kobold (locked)"),
    fig(OUT / "mob_kappa_idle.png", 6, "kappa"), fig(OUT / "mob_kongamato_idle.png", 6, "kongamato"),
    fig(OUT / "mob_nixie_idle.png", 6, "nixie"),
    fig(OUT / "mob_jenny-greenteeth_idle.png", 6, "jenny greenteeth"), fig(OUT / "mob_ahuizotl_idle.png", 6, "ahuizotl"),
    fig(OUT / "mob_berberoka_idle.png", 6, "berberoka"),
    fig(MOBS / "mob_basilisk_idle.png", 6, "basilisk (locked)"), fig(OUT / "mob_hydra_idle.png", 6, "hydra")]))

out = page("Monsters Riverglass", "Riverglass Delta, round 1: seven river and marsh monsters",
           "Levels 31 to 40, element steam: Kappa, Kongamato, Nixie, Jenny Greenteeth, Ahuizotl, Berberoka and the "
           "Lernaean Hydra. Idle, hit, hurt, walk and death at all three Unmaking tiers. &middot; 2026-10-29", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
