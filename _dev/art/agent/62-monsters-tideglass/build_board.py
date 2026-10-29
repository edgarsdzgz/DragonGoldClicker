"""Build the Tideglass Coast board. Run after src/make_bestiary.py. Output: board.html."""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
MOBS = HERE.parents[1] / "official" / "mobs"

# (id, name, flier, note); notes carry the SRD and unverified marks
MONSTERS = [
    ("blue-man", "Blue Man of the Minch (regular)", False,
     "Scotland, the Minch. A swarm of blue half-figures with gray faces and long arms, chest-deep in the waves, "
     "arms thrown up. Signature color: bright blue skin over dark-blue water. Two sources (Wikipedia, Gutenberg)."),
    ("funayurei", "Funayurei (regular)", False,
     "Japan. The drowned sailor: a cream burial robe, a white forehead cloth, black hair plastered down, hollow gold "
     "eyes, a huge wooden ladle held out for the ship's bucket, and sea-teal wisps in place of legs. Not the Wraith. "
     "[UNVERIFIED] No second source read (yokai.jp refused with 403, a second site answered 429)."),
    ("archelon", "Archelon (regular)", False,
     "[SRD 5.2, CC BY 4.0: the game's credits need the SRD credit] A giant sea turtle: a green plated dome shell, a "
     "sandy rim and head, a hooked beak. The shield of the Land."),
    ("stymphalian", "Stymphalian Birds (regular, flier)", True,
     "Greece. A bronze bird of prey: steel beak and talons, wings whose feathers end in steel arrowheads. "
     "Two sources (theoi.com, Pausanias on Perseids). Flier: a wingbeat walk and a shadow."),
    ("fomorian", "Fomorian Raider (elite)", False,
     "Irish myth. A generic sea-raider giant (never Balor, Elatha or Bres): a goat's head with curling horns, one "
     "huge arm hauling an anchor, one withered arm, one thick leg and one peg leg, kelp rags. Two sources "
     "(Wikipedia, encyclopedia.com)."),
    ("siren", "Sirens (elite, flier)", True,
     "Greece. A bird-woman: v2: a woman's head and shoulders with long cream hair and a mouth open in song, a feathered green body with feathered thighs, "
     "big hooked talons, wings rising from her shoulders. Two sources (theoi.com, Audubon). Flier: a wingbeat walk and a shadow."),
    ("nuckelavee", "Nuckelavee (mini-boss, level 75)", False,
     "Orkney. v2, front-on: a skinless horse coming at us, one great gold eye and a huge open mouth, a rider's torso fused "
     "to its back with an oversized lolling head and arms past the knees, raw clay muscle with pale sinew. "
     "Two sources (Wikipedia, folklorescotland.com)."),
    ("kraken", "Kraken (boss, level 80)", False,
     "Norway and Iceland. Owner's staging: it rises up a flooded stretch of road. A vast mantle with one great gold "
     "eye lifts out of black water over the cobbles, tentacles reaching left toward the gate. Two sources "
     "(Wikipedia, Store norske leksikon)."),
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
V1 = HERE / "out_v1"
sections.insert(0, section("v1 beside v2", "Left of each pair, v1 (kept in out_v1/); right, v2. The side-on Nuckelavee "
                           "read as a brown blob or a camel, and the Siren's pale face under dark hair as a nun.", [
    fig(V1 / "mob_nuckelavee_idle.png", 6, "nuckelavee v1"), fig(OUT / "mob_nuckelavee_idle.png", 6, "nuckelavee v2"),
    fig(V1 / "mob_nuckelavee_hurt.png", 6, "nuckelavee v1 hurt"), fig(OUT / "mob_nuckelavee_hurt.png", 6, "nuckelavee v2 hurt"),
    fig(V1 / "mob_siren_idle.png", 6, "siren v1"), fig(OUT / "mob_siren_idle.png", 6, "siren v2"),
    fig(V1 / "mob_siren_hurt.png", 6, "siren v1 hurt"), fig(OUT / "mob_siren_hurt.png", 6, "siren v2 hurt")]))
sections.append(section("Size line-up", "Kobold, Kamaitachi, the regulars, the elites, the Basilisk, the Nuckelavee "
                        "and the Kraken, the widest of all.", [
    fig(MOBS / "mob_kobold_idle.png", 6, "kobold (locked)"),
    fig(MOBS / "mob_kamaitachi_idle.png", 6, "kamaitachi"),
    fig(OUT / "mob_blue-man_idle.png", 6, "blue man"), fig(OUT / "mob_funayurei_idle.png", 6, "funayurei"),
    fig(OUT / "mob_archelon_idle.png", 6, "archelon"), fig(OUT / "mob_stymphalian_idle.png", 6, "stymphalian"),
    fig(OUT / "mob_fomorian_idle.png", 6, "fomorian"), fig(OUT / "mob_siren_idle.png", 6, "siren"),
    fig(MOBS / "mob_basilisk_idle.png", 6, "basilisk (locked)"),
    fig(OUT / "mob_nuckelavee_idle.png", 6, "nuckelavee"), fig(OUT / "mob_kraken_idle.png", 6, "kraken")]))

out = page("Monsters Tideglass", "Tideglass Coast monsters, round 1",
           "Eight monsters for levels 71-80: idle, hit, hurt, walk and death at all three Unmaking tiers. Marked: "
           "[UNVERIFIED] Funayurei (no second source read); [SRD] Archelon (needs the SRD 5.2 credit, CC BY 4.0). "
           "&middot; 2026-10-29", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
