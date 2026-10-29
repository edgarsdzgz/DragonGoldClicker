"""Build the Saffron Dunes board. Run after src/make_bestiary.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
MOBS = HERE.parents[1] / "official" / "mobs"

MONSTERS = [
    ("serpopard", "Serpopard (regular)",
     "Second source: the Two Dog Palette page (talesfromthetwolands.org) confirms the very long serpentine neck; "
     "the Narmer-palette detail stays on the Wikipedia source only. A lean lioness with a long banded neck, "
     "teal so it stands off the sand."),
    ("nasnas", "Nasnas (regular)",
     "Second source: mythicalencyclopedia.com quoting Edward Lane (half a head, half a body, one arm, one leg, "
     "hops). Half a figure with a dark hollow where the other half should be, no sectarian dress."),
    ("mummy", "Mummy (regular) [D&D SRD 5.2, CC BY 4.0: the credits need the SRD credit]",
     "Pale gray wrappings cut by ink gaps, an azure collar, arms raised, trailing strips. Wrapped head and no bones, "
     "so it does not read as the Skeleton."),
    ("bungisngis", "Bungisngis (regular)",
     "Second source: pantheon.org (one eye in the forehead, constant laughter, hurls a carabao, easily tricked). "
     "Tusks are on the Wikipedia source only. Blue giant, one big gold eye, two tusks, a laughing mouth."),
    ("girtablilu", "Girtablilu (elite)",
     "Second source: godsandmonsters.info (made by Tiamat, guards the gate of Mashu, deadly gaze). Bearded man on "
     "a green chitin scorpion body, pincers raised, tail arched over. Only the creature, never a god."),
    ("poludnitsa", "Poludnitsa (elite)",
     "Two sources already (Polevik; the sacred-texts Serbian chapter). A tall figure in a white gown, grass hair, "
     "mismatched eyes (gold and pale blue), the hem rippling like heat."),
    ("manticore", "Manticore (mini-boss)",
     "Second source: theoi.com (human face, lion body, three rows of teeth in each jaw, scorpion tail, man-eater). "
     "A violet lion with a human face in an orange mane and an arched stinger tail. D&D SRD status not checked."),
]


def monster(mid, name, note):
    n = f"mob_{mid}"
    figs = [fig(OUT / f"{n}_idle.png", 6, "idle"), fig(OUT / f"{n}_hit.png", 6, "hit"),
            fig(OUT / f"{n}_hurt.png", 6, "hurt"), gif_fig(PREVIEW / f"{n}_walk.gif", 1, "walk"),
            gif_fig(PREVIEW / f"{n}_death.gif", 1, "death"),
            fig(OUT / f"{n}-strong_idle.png", 6, "strong"), fig(OUT / f"{n}-stronger_idle.png", 6, "stronger")]
    return section(name, note, figs)


sections = [monster(*m) for m in MONSTERS]
sections.append(section("Size line-up", "The locked kobold, the regulars, the elites, the Manticore, the locked Basilisk "
                        "and the locked Corrupted Drake (this Land's boss).", [
    fig(MOBS / "mob_kobold_idle.png", 6, "kobold (locked)"), fig(OUT / "mob_nasnas_idle.png", 6, "nasnas"),
    fig(OUT / "mob_serpopard_idle.png", 6, "serpopard"), fig(OUT / "mob_mummy_idle.png", 6, "mummy"),
    fig(OUT / "mob_bungisngis_idle.png", 6, "bungisngis"), fig(OUT / "mob_poludnitsa_idle.png", 6, "poludnitsa"),
    fig(OUT / "mob_girtablilu_idle.png", 6, "girtablilu"), fig(OUT / "mob_manticore_idle.png", 6, "manticore"),
    fig(MOBS / "mob_basilisk_idle.png", 6, "basilisk (locked)"),
    fig(MOBS / "mob_corrupted-drake_idle.png", 6, "corrupted drake (locked)")]))

out = page("Monsters Saffron Dunes", "Saffron Dunes: seven monsters, round 1",
           "Idle, hit, hurt, walk and death at all three Unmaking tiers. Every folklore monster found a second source (see each note); where only the Wikipedia page backs a detail, the note says so. SRD monster: the Mummy (credit needed). "
           "&middot; 2026-10-29", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
