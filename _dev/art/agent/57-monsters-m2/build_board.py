"""Build the M2 board. Run after src/make_bestiary.py. Output: board.html."""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
AGENT = HERE.parent
MOBS = HERE.parents[1] / "official" / "mobs"

MONSTERS = [
    ("impundulu", "Impundulu", True,
     "Zulu lightning bird, an elite flier: a person-sized black-and-white storm bird with a hammer-shaped crest, a "
     "white breast, black wings spread and pale yellow-white lightning off the wingtips and talons. No red. The "
     "walk is a wingbeat, and it has a shadow."),
    ("omukade", "Omukade", False,
     "Japanese giant mountain centipede, an elite of the chitin type: a broad armored head with curved mandibles "
     "and gold eyes, a segmented body reared up in a gentle S, many legs that ripple in the walk, a coiled base. "
     "Dark bronze shell, not red."),
    ("tempest-lord", "Tempest Lord of the Peaks", False,
     "The boss (level 30), first of the Storm-Callers: a tall hooded priest, human-born but no longer a man. Arms "
     "raised, a crown of lightning, a staff, below the waist a churning storm funnel in place of legs. In the "
     "walk the cloud churns and the robes whip. No shadow."),
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
sections.append(section("The Tempest Lord beside the Windcaller and the Storm Rider",
                        "He must read as a different, bigger monster: a storm funnel where the legs should be.", [
    fig(MOBS / "mob_windcaller_idle.png", 6, "windcaller (locked)"),
    fig(AGENT / "48-bestiary-fliers" / "out" / "mob_storm-rider_idle.png", 6, "storm rider (locked)"),
    fig(OUT / "mob_tempest-lord_idle.png", 6, "tempest lord")]))
sections.append(section("Size line-up", "Kamaitachi (M1), an M1 elite-size reference (the Gargoyle), the two new "
                        "elites, then the Basilisk and the Tempest Lord.", [
    fig(MOBS / "mob_kamaitachi_idle.png", 6, "kamaitachi"), fig(MOBS / "mob_gargoyle_idle.png", 6, "gargoyle (M1)"),
    fig(OUT / "mob_impundulu_idle.png", 6, "impundulu"), fig(OUT / "mob_omukade_idle.png", 6, "omukade"),
    fig(MOBS / "mob_basilisk_idle.png", 6, "basilisk"), fig(OUT / "mob_tempest-lord_idle.png", 6, "tempest lord")]))

out = page("Monsters M2", "Monster batch M2: the Impundulu, Omukade and Tempest Lord",
           "Mistral Peaks' two elites and its boss, built like M1: idle, hit, hurt, walk and death at all three "
           "Unmaking tiers. &middot; 2026-10-29", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
