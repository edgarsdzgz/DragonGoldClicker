"""Build the board for the rest of M1 (Aitvaras, Gargoyle, Wild Hunt Rider). Run after src/make_bestiary.py.
Output: board_m1_rest.html (board.html and board_v1.html are left as they are)."""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
AGENT = HERE.parent
OFFICIAL = HERE.parents[1] / "official"

MONSTERS = [
    ("aitvaras", "Aitvaras", True,
     "Lithuanian folklore: a black rooster that flies as a dragon in the open. Comb, gold eyes and beak, spread "
     "wings, a serpent body trailing a long S-curved flame like a meteor. Fire is orange and gold only. A flier: "
     "the walk is a wingbeat, and it has a shadow."),
    ("gargoyle", "Gargoyle", True,
     "D&D SRD monster (CC BY 4.0), the shielded flier: a crouched, horned stone body in ash gray, its heavy slab "
     "wings held forward over its front like a shield, ribbed like armor. A flier: the walk lifts the wings, and "
     "it has a shadow."),
    ("wild-hunt-rider", "Wild Hunt Rider", False,
     "Germanic and Norse folklore: an anonymous spectral huntsman, wide bone antlers on a dark hood, a hunting "
     "horn, on a heavy black ghost horse with glowing eyes and a black hound at its side. A ground rider: it "
     "walks, no shadow."),
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
    figs = [fig(OUT / f"{n}_idle.png", 8, "idle"), fig(OUT / f"{n}_hit.png", 8, "hit"),
            fig(OUT / f"{n}_hurt.png", 8, "hurt"), gif_fig(PREVIEW / f"{n}_walk.gif", 1, "walk"),
            gif_fig(PREVIEW / f"{n}_death.gif", 1, "death"),
            fig(OUT / f"{n}-strong_idle.png", 8, "strong"), fig(OUT / f"{n}-stronger_idle.png", 8, "stronger")]
    if flier:
        figs.append(lifted(mid, 8))
    return section(name, note, figs)


sections = [monster(*m) for m in MONSTERS]
sections.append(section("Rider against the locked Storm Rider",
                        "The Wild Hunt Rider is kept only if it reads as a different monster: antlers, a hound, a "
                        "heavy black horse on the ground, against the Storm Rider's gray wind horse and lance.", [
    fig(AGENT / "48-bestiary-fliers" / "out" / "mob_storm-rider_idle.png", 8, "storm rider (locked)"),
    fig(OUT / "mob_wild-hunt-rider_idle.png", 8, "wild hunt rider")]))
sections.append(section("Size line-up", "Kobold, Kamaitachi and the three new monsters, side by side.", [
    fig(OFFICIAL / "mobs" / "mob_kobold_idle.png", 8, "kobold"),
    fig(OUT / "mob_kamaitachi_idle.png", 8, "kamaitachi"), fig(OUT / "mob_aitvaras_idle.png", 8, "aitvaras"),
    fig(OUT / "mob_gargoyle_idle.png", 8, "gargoyle"),
    fig(OUT / "mob_wild-hunt-rider_idle.png", 8, "wild hunt rider")]))

out = page("Monsters M1, the rest", "Monster batch M1: the Aitvaras, Gargoyle and Wild Hunt Rider",
           "Three more regulars of Mistral Peaks, built like the Kamaitachi: idle, hit, hurt, walk and death at all "
           "three Unmaking tiers. &middot; 2026-10-29", sections)
(HERE / "board_m1_rest.html").write_text(out, encoding="utf-8")
print(f"board_m1_rest.html: {len(out) // 1024} KB")
