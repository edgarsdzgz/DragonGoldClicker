"""Mockup v3 images: the two map composites from the locked art, plus copies of the sprites the boards show.

Every image stays at its art size; the boards scale it with image-rendering: pixelated.
"""
import pathlib
import shutil

from PIL import Image

ART = pathlib.Path("R:/Coding_Projects/_dragonGold/assets/art")
OUT = pathlib.Path(__file__).parent / "assets"
OUT.mkdir(exist_ok=True)


def png(rel, frame=0, frames=1):
    img = Image.open(ART / rel).convert("RGBA")
    if frames > 1:
        w = img.width // frames
        img = img.crop((w * frame, 0, w * (frame + 1), img.height))
    return img


# The Warfront late in the story: the gate sound, four fighters on the wall, Varn on the gatehouse tower
war = png("warfront/map_warfront_base.png")
war.alpha_composite(png("warfront/map_gate_sound.png"), (0, 222))
for x in (13, 111):
    war.alpha_composite(png("warfront/map_torch_strip3.png", 0, 3), (x, 245))
for x in (24, 96, 4, 113):
    war.alpha_composite(png("people/ppl_fighter_idle.png"), (x, 234 - 20))
war.alpha_composite(png("people/ppl_varn_idle.png"), (59, 222 + 6 - 19 + 1))
war.save(OUT / "warfront.png")

# The city, lit, with everything the story has built by chapter 11; the housing and the wall towers are still fog
BUILT = {"keep": "bld_keep_restored", "outpost": "bld_outpost_upgraded", "wizard-tower": "bld_wizard-tower_built",
"lodge": "bld_lodge_lv3", "forge": ("bld_forge_lit_strip3", 3),
         "librarium": "bld_librarium_built", "garrison": "bld_garrison_lv3"}
FOG = {"housing": (72, 100, "32x32"), "tower-west": (34, 214, "20x32"), "tower-east": (76, 214, "20x32")}
ANCHOR = {"keep": (65, 98), "outpost": (24, 90), "wizard-tower": (108, 92), "housing": (88, 132), "lodge": (26, 144),
          "forge": (104, 174), "librarium": (26, 212), "garrison": (102, 214), "tower-west": (44, 246),
          "tower-east": (86, 246)}
city = png("city/map_city_base.png")
for x, y, size in FOG.values():
    city.alpha_composite(png(f"city/map_fog_{size}.png"), (x, y))
for plot in sorted(BUILT, key=lambda p: ANCHOR[p][1]):
    spec = BUILT[plot]
    sprite = png(f"buildings/{spec[0]}.png", 0, spec[1]) if isinstance(spec, tuple) else png(f"buildings/{spec}.png")
    ax, ay = ANCHOR[plot]
    city.alpha_composite(sprite, (ax - sprite.width // 2, ay - sprite.height))
city.save(OUT / "city.png")

# The monster at the gate (an orc, walking), Varn's breath frame
png("mobs/mob_orc_walk_strip2.png", 0, 2).save(OUT / "orc.png")
png("people/ppl_varn_breath_strip2.png", 1, 2).save(OUT / "varn_breath.png")

COPY = [
    "logo/splash_lockup.png", "logo/logo_lockup.png", "studio/seal_card.png",
    "interiors/int_keep.png", "interiors/int_garrison.png", "interiors/int_forge.png", "interiors/int_lodge.png",
    "interiors/int_outpost.png", "interiors/int_librarium.png", "interiors/int_wizard-tower.png",
    "story/story_prologue.png", "story/story_the-exile.png", "story/story_breach.png",
    "cast/bust_pyreth.png", "cast/bust_mirael.png", "cast/bust_thornwick_happy.png", "cast/bust_rodain_grieving.png",
    "cast/bust_lirae.png", "cast/bust_kael.png",
    "cast/cast_sigil-pyreth.png", "cast/cast_sigil-mirael.png", "cast/cast_sigil-thornwick.png", "cast/cast_sigil-rodain.png",
    "events/evt_wanderer-family.png", "events/evt_granary_3.png",
]
ICONS = ["flame", "wheat", "cog", "castle", "scroll", "food", "villager", "shield", "hammer", "train", "compass",
         "padlock", "check", "close", "upgrade", "hourglass", "book", "swords", "shield_gear", "helm", "claws",
         "star", "warning", "sparkles", "reassign", "skull", "todo", "map", "stats", "damage", "info", "rations"]
for rel in COPY:
    src = ART / rel
    if src.exists():
        shutil.copy(src, OUT / src.name)
    else:
        print("missing", rel)
for n in ICONS:
    src = ART / "icons" / f"icon_{n}.png"
    if src.exists():
        shutil.copy(src, OUT / src.name)
    else:
        print("missing icon", n)
print(len(list(OUT.iterdir())), "files")
