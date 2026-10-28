"""Chapters 9 to 13: the new cast's figures, Varn on the wall, and a story picture for each chapter, v1, 2026-10-28.

Owner: chapters 9 to 13 approved 2026-10-27 ("Lock them in"); "continue, as you recommend": their art first.
The pictures are 130x96 like every story picture (43-story-scenes), built from locked art the same way, with
the newcomers' figures (figures.py) standing in them. No protagonist dragon is drawn.

- ppl_varn_idle: Varn perched on the Warfront's gatehouse tower. ppl_varn_breath_strip2: he rears, then
  breathes fire up at the field (his strike, on his own). ppl_varn_flying, ppl_sera, ppl_thornwick,
  ppl_hollow-knight(_walk), ppl_ashara_flying: the figures the pictures use.
- story_<chapter>: small-wings (9), she-did-not-ask (10), the-exile (11), the-eldest (12), hollow-knight (13).

Output: out/<name>_v1.png; preview/: x3 pictures, x6 figures. Run: python src/make_art.py
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parents[1]
AGENT = HERE.parent
sys.path.insert(0, str(HERE / "src"))
sys.path.insert(0, str(AGENT / "43-story-scenes" / "src"))
sys.path.insert(0, str(AGENT / "00-foundation"))
from figures import ashara_flying, figures  # noqa: E402
from make_scenes import (DUSK_SKY, NIGHT_SKY, H, W, art, bands, campfires, city, far, ground, person,  # noqa: E402
                         ridge, stand, wall, warfront)
from pixkit import DUSK, relight, strip, upscale  # noqa: E402
from PIL import Image  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
FIG = dict(figures())
FIG["ppl_ashara_flying"] = ashara_flying()

# The city by chapter 9: everything the story has built by Dragonsteel; the Wizard's Tower is still a ruin
# (Thornwick's chapter raises it)
BUILT = {"keep": "bld_keep_restored", "outpost": "bld_outpost_built", "housing": "bld_housing_row",
         "lodge": "bld_lodge_lv3", "librarium": "bld_librarium_built", "garrison": "bld_garrison_lv3",
         "forge": "bld_forge_built"}


def small_wings():
    """9. A Small Pair of Wings: a small dragon circling the Keep by day; townsfolk on the road look up."""
    img = city("lit", BUILT, 0)
    stand(img, FIG["ppl_varn_flying"], 34, 22)
    for x, feet, n in ((60, 94, "elf"), (71, 92, "human")):
        stand(img, person(n), x, feet)
    return img


def she_did_not_ask():
    """10. She Did Not Ask: the wall cracking under the horde, Sera at the front of it, shield up."""
    img = warfront(NIGHT_SKY)
    far(img, ["kobold", "goblin", "orc"], 47, [44, 50, 56, 61, 70, 76, 82, 88])
    for x, n in ((34, "orc"), (56, "goblin"), (78, "orc"), (100, "kobold")):
        stand(img, art(f"mobs/mob_{n}_hit.png"), x, 74)
    wall(img, "cracking", 22)
    stand(img, art("fx/fx_wall-impact_strip4.png", frame=1, frames=4), 56, 80)
    for x in (14, 116):
        stand(img, art("people/ppl_fighter_idle.png"), x, 95)
    stand(img, FIG["ppl_sera"], 65, 92)
    return img


def the_exile():
    """11. The Exile: the eastern ruins at dusk, a monster on fire, the mage who set it so."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    bands(img, DUSK_SKY)
    ridge(img, 40, "shadow1")
    ground(img, 40, 65, (44, 86), road="parch1", earth="wood1")
    stand(img, relight(art("buildings/bld_wizard-tower_ruin.png"), DUSK), 108, 66)
    stand(img, art("mobs/mob_goblin_hurt.png"), 84, 72)
    for i, (x, y) in enumerate(((80, 60), (86, 58), (90, 64), (83, 66), (78, 70))):
        stand(img, art("fx/fx_ember_strip3.png", frame=i % 3, frames=3), x, y)
    for x, feet in ((18, 88), (30, 92)):
        stand(img, art("people/ppl_explorer.png"), x, feet)
    stand(img, FIG["ppl_thornwick"], 58, 94)
    return img


def the_eldest():
    """12. The Eldest: something vast comes down over the Keep; the people below look up."""
    img = city("lit", BUILT, 0)
    stand(img, FIG["ppl_ashara_flying"], 65, 34)
    for x, feet, n in ((58, 94, "human"), (68, 92, "dwarf"), (76, 95, "halfling")):
        stand(img, person(n), x, feet)
    return img


def hollow_knight():
    """13. The Hollow Knight: a boss fallen on the field at night, a lone knight walking up to the gate."""
    img = warfront(NIGHT_SKY)
    campfires(img, 41, [6, 15, 22, 108, 116, 124])
    stand(img, art("mobs/mob_stone-golem_death_strip4.png", frame=2, frames=4), 38, 64)
    stand(img, FIG["ppl_hollow-knight_walk"], 68, 78)
    wall(img, "sound", 18)
    for x in (16, 114):
        stand(img, art("people/ppl_fighter_idle.png"), x, 95)
    return img


PICTURES = {"small-wings": small_wings, "she-did-not-ask": she_did_not_ask, "the-exile": the_exile,
            "the-eldest": the_eldest, "hollow-knight": hollow_knight}


def sprites():
    """The figures as files: Varn's two for the wall (perched; rear and breath as a strip), and the rest."""
    out = {name: img for name, img in FIG.items() if not name.startswith(("ppl_varn_perched", "ppl_varn_rear",
                                                                          "ppl_varn_breath"))}
    out["ppl_varn_idle"] = FIG["ppl_varn_perched"]
    out["ppl_varn_breath_strip2"] = strip([FIG["ppl_varn_rear"], FIG["ppl_varn_breath"]])
    return out


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    for name, img in sprites().items():
        img.save(OUT / f"{name}_v1.png")
        upscale(img, 6).save(PREVIEW / f"{name}_v1_x6.png")
    for name, f in PICTURES.items():
        img = f()
        assert img.size == (W, H), (name, img.size)
        img.save(OUT / f"story_{name}_v1.png")
        upscale(img, 3).save(PREVIEW / f"story_{name}_v1_x3.png")
    print(len(sprites()), "figures,", len(PICTURES), "pictures")


if __name__ == "__main__":
    main()
