"""Build the Gloamfen Mire board. Run after src/make_bestiary.py. Output: board.html."""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
MOBS = HERE.parents[1] / "official" / "mobs"
AGENT = HERE.parent

UNV = " UNVERIFIED: no second source found; drawn anyway."
SRD = " D&D SRD 5.2 monster (CC BY 4.0): the game's credits need the SRD credit."

MONSTERS = [
    ("jiangshi", "Jiangshi (regular)", False,
     "Chinese hopping corpse: a tall black official's hat, a paper talisman down the face, a pale mint face with "
     "fangs, a dark jade robe with a gold rank badge, both arms straight out. Second source: The World of Chinese "
     "(2014) confirms the stiff hopping corpse, the forehead fu and the tall hat."),
    ("adze", "Adze (regular, swarm, flier)", True,
     "Ewe firefly swarm: one big firefly, two small, drifting sparks, glowing abdomens. The firefly only, never the "
     "possessed human. Second source read (godsandmonsters.info) says the firefly form is a 1993 Bunson "
     "encyclopedia image, not Ewe testimony itself:" + UNV + " Living belief: handle with care."),
    ("will-o-wisp", "Will-o'-Wisp (regular, floating light, flier)", True,
     "A floating teal flame with a face and a curling tail." + SRD),
    ("kikimora", "Kikimora (regular)", False,
     "Slavic marsh hag: wild moss hair, a long sharp nose, thin arms, bare feet, a spindle. Sources: Wikipedia and "
     "the sacred-texts Slavic folklore pages named in the brief. Unsure: the face is the weakest read of the batch."),
    ("draugr", "Draugr (elite)", False,
     "Norse grave-brute: a swollen death-blue corpse in a rusted horned helm, mail pauldrons, gray beard, belly "
     "over a belt, a rusted axe. Second source: Grettir's Saga (Gutenberg 347), per the brief."),
    ("empousa", "Empousa (elite)", False,
     "Greek spirit: hair of flame, pale fanged face, tattered dress, a bronze leg with a plate foot and a gray "
     "donkey leg with a hoof. Second source: History Cooperative (cites Aristophanes' Frogs and Philostratus)."),
    ("dullahan", "Dullahan (mini-boss, level 55, a rider)", False,
     "Irish headless rider: a hollow-collared cloaked rider behind a huge black horse's face, his own pale grinning "
     "head held out on one arm, a spine whip. Second source: Notre Dame Rare Books page confirms the headless "
     "rider with the head under his arm (Croker); no Irish Folklore Commission record exists."),
]


def lifted(mid, scale):
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


V1 = HERE / "out_v1"
sections = [monster(*m) for m in MONSTERS]
sections.insert(0, section("v1 beside v2", "Left of each pair, v1 (kept in out_v1/); right, v2. Kikimora: v1 read as a "
                           "gray funnel, v2 is smaller, thin, with a narrow pale face and a one-line hooked nose. "
                           "Dullahan: v1's head read as a cream shield, v2 has a round skull head, a dark neck "
                           "stump and a long horse face.", [
    fig(V1 / "mob_kikimora_idle.png", 6, "kikimora v1"), fig(OUT / "mob_kikimora_idle.png", 6, "kikimora v2"),
    fig(V1 / "mob_kikimora_hurt.png", 6, "kikimora v1 hurt"), fig(OUT / "mob_kikimora_hurt.png", 6, "kikimora v2 hurt"),
    fig(V1 / "mob_dullahan_idle.png", 6, "dullahan v1"), fig(OUT / "mob_dullahan_idle.png", 6, "dullahan v2"),
    fig(V1 / "mob_dullahan_hurt.png", 6, "dullahan v1 hurt"), fig(OUT / "mob_dullahan_hurt.png", 6, "dullahan v2 hurt")]))
sections.append(section("Undead beside the locked ones", "The Jiangshi and the Draugr must not read as the "
                        "Skeleton or the Wraith.", [
    fig(MOBS / "mob_skeleton_idle.png", 6, "skeleton (locked)"), fig(MOBS / "mob_wraith_idle.png", 6, "wraith (locked)"),
    fig(OUT / "mob_jiangshi_idle.png", 6, "jiangshi"), fig(OUT / "mob_draugr_idle.png", 6, "draugr")]))
sections.append(section("Size line-up", "Locked kobold, Lich (this Land's boss) and Basilisk beside the new set.", [
    fig(MOBS / "mob_kobold_idle.png", 6, "kobold"), fig(OUT / "mob_will-o-wisp_idle.png", 6, "wisp"), fig(OUT / "mob_adze_idle.png", 6, "adze"),
    fig(OUT / "mob_kikimora_idle.png", 6, "kikimora"), fig(OUT / "mob_jiangshi_idle.png", 6, "jiangshi"),
    fig(OUT / "mob_empousa_idle.png", 6, "empousa"), fig(OUT / "mob_draugr_idle.png", 6, "draugr"),
    fig(OUT / "mob_dullahan_idle.png", 6, "dullahan"), fig(MOBS / "mob_lich_idle.png", 6, "lich (locked)"),
    fig(MOBS / "mob_basilisk_idle.png", 6, "basilisk (locked)")]))

out = page("Monsters Gloamfen", "Gloamfen Mire: seven monsters, round 1",
           "Jiangshi, Adze, Will-o'-Wisp, Kikimora, Draugr, Empousa and the Dullahan, built like batch 57: idle, hit, "
           "hurt, walk and death at all three Unmaking tiers. Unverified (one source only): Adze. SRD credit needed: "
           "Will-o'-Wisp. &middot; 2026-10-29", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
