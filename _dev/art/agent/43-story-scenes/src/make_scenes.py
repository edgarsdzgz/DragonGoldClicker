"""Story illustrations for the other 17 scenes, v1, 2026-10-27 (src/data/story/lines.ts).

Same size and look as the locked prologue and Breach (37-story): 130x96, built from locked art at its own
scale, never redrawn. City scenes are 96-row windows of the city map itself, each plot set to the state
the story has reached, at the light level the scene calls for. Warfront scenes reuse 37-story's sky,
ridge, road and wall. No dragon is drawn (the player is commissioned); scenes show places and people.

Run: python src/make_scenes.py
"""
import json
import math
import pathlib
import sys

from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).resolve().parents[1]
AGENT = HERE.parent
OFFICIAL = AGENT.parent / "official"
sys.path.insert(0, str(AGENT / "00-foundation"))
sys.path.insert(0, str(AGENT / "37-story" / "src"))
from make_story import H, W, bands, campfires, far, ground, mob, ridge, smoke, wall  # noqa: E402
from pixkit import DUSK, NIGHT, PALETTE as P, relight, upscale  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
PLOTS = {p["id"]: p for p in json.loads((OFFICIAL / "city" / "map_plots.json").read_text())["plots"]}


def art(rel, level="lit", frame=None, frames=1):
    """A locked file at a light level (its _night or _dusk copy, else relit), or one frame of a strip."""
    path = OFFICIAL / rel
    if level != "lit":
        stem = path.stem
        if "_strip" in stem:
            base, n = stem.rsplit("_strip", 1)
            path = path.with_name(f"{base}_{level}_strip{n}.png")
        else:
            path = path.with_name(f"{stem}_{level}.png")
    if path.exists():
        img = Image.open(path).convert("RGBA")
    else:                                   # only city pieces have saved light levels; relight the rest
        img = relight(Image.open(OFFICIAL / rel).convert("RGBA"), {"night": NIGHT, "dusk": DUSK}[level])
    if frame is not None:
        w = img.width // frames
        img = img.crop((frame * w, 0, frame * w + w, img.height))
    return img


def stand(img, sprite, cx, feet):
    """A sprite bottom-centered at (cx, feet)."""
    img.alpha_composite(sprite, (cx - sprite.width // 2, feet - sprite.height + 1))


def city(level, states, y0):
    """The city map at a light level with each plot in a state, cut to the 96 rows from y0.

    states: plot id -> a building file stem (bld_...), or a plot piece ('empty', 'foundation', 'scaffold',
    'fog'); plots not named are left ruined (or empty for housing)."""
    img = art("city/map_city_base.png", level)
    for pid, p in PLOTS.items():
        state = states.get(pid, "empty" if pid == "housing" else f"bld_{pid}_ruin")
        if state.startswith("bld_"):
            strip = "_strip" in state
            b = art(f"buildings/{state}.png", level, 0 if strip else None, 3 if strip else 1)
        else:
            b = art(f"city/map_{'plot-empty' if state == 'empty' else state}_{p['width']}x{p['height']}.png", level)
        stand(img, b, p["anchor"][0], p["anchor"][1] - 1)
    return img.crop((0, y0, W, y0 + H))


def warfront(sky):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    bands(img, sky)
    ridge(img, 40)
    ground(img, 40, 65, (44, 86), earth="shadow2")
    return img


NIGHT_SKY = [(0, "night1"), (12, "night2"), (22, "shadow2"), (29, "shadow3"), (34, "rose1")]
DUSK_SKY = [(0, "night2"), (8, "shadow3"), (16, "rose1"), (24, "rose2"), (30, "fire1"), (35, "gold4")]
PEOPLE = ["human", "elf", "dwarf", "halfling", "catfolk", "orc", "horned", "birdfolk", "fishfolk"]


def person(name, level="lit"):
    return art(f"people/ppl_{name}.png", level)


def glow(img, cx, cy, r, c="gold5"):
    """A soft ring of light (a few dots, no dither): lanterns and windows at night."""
    d = ImageDraw.Draw(img)
    for i in range(12):
        a = i * math.pi / 6
        d.point((round(cx + r * math.cos(a)), round(cy + r * math.sin(a))), fill=P[c])


# --- The scenes -------------------------------------------------------------------------------------

def elder_approaches():
    """The ruined city at night; a lantern comes up the road from the Keep."""
    img = city("night", {}, 6)
    d = ImageDraw.Draw(img)
    d.rectangle([66, 84, 67, 85], fill=P["fire2"])
    d.point((66, 83), fill=P["wood2"])
    glow(img, 66.5, 84.5, 3, "gold4")
    return img


def first_renown():
    """The people of Draconia on the wall, the fallen before the Gate."""
    img = warfront(NIGHT_SKY)
    campfires(img, 41, [6, 15, 22, 31, 38, 47, 84, 92, 99, 107, 116, 124])
    for x, n in ((40, "kobold"), (64, "goblin"), (88, "kobold")):
        stand(img, art(f"mobs/mob_{n}_death_strip4.png", frame=2, frames=4), x, 66)
    wall(img, "sound", 20)
    for i, x in enumerate(range(10, 125, 15)):
        stand(img, person(PEOPLE[i % len(PEOPLE)]), x, 94)
    return img


def call_to_arms():
    """The wall holds: fighters along the wall, four monsters down before the Gate."""
    img = warfront(NIGHT_SKY)
    campfires(img, 41, [6, 15, 22, 31, 38, 84, 92, 99, 107, 116, 124])
    for x, n in ((34, "kobold"), (54, "goblin"), (76, "kobold"), (96, "goblin")):
        stand(img, art(f"mobs/mob_{n}_death_strip4.png", frame=2, frames=4), x, 64 + (x % 3))
    wall(img, "sound", 20)
    for x in range(12, 125, 14):
        stand(img, art("people/ppl_fighter_idle.png"), x, 94)
    return img


def the_breach():
    """The wall shakes: the horde strikes the stone; Rodain's company takes the wall."""
    img = warfront(NIGHT_SKY)
    far(img, ["kobold", "goblin", "orc"], 47, [50, 56, 61, 66, 71, 76, 82, 44, 88])
    for x, n in ((30, "orc"), (52, "goblin"), (76, "orc"), (100, "kobold")):
        stand(img, art(f"mobs/mob_{n}_hit.png"), x, 74)
    wall(img, "cracking", 22)
    for x in (30, 76):
        stand(img, art("fx/fx_wall-impact_strip4.png", frame=1, frames=4), x, 80)
    ranks = ["conscript", "footman", "knight", "footman", "conscript", "footman", "knight", "footman", "conscript"]
    for i, x in enumerate(range(8, 128, 14)):
        stand(img, person(ranks[i]), x, 95)
    return img


def sharpen_claws():
    """Young claws: an orc shrugs off a plain slash, more orcs behind it."""
    img = warfront(NIGHT_SKY)
    campfires(img, 41, [6, 15, 22, 108, 116, 124])
    for x in (40, 52, 78, 90):
        stand(img, relight(art("mobs/mob_orc_idle.png"), DUSK), x, 62)
    stand(img, art("mobs/mob_orc-strong_idle.png"), 65, 84)
    stand(img, art("fx/fx_slash-plain_strip4.png", frame=2, frames=4), 65, 80)
    return img


def the_wall_is_yours():
    """The wall mended at dusk, menders at work along it."""
    img = warfront(DUSK_SKY)
    wall(img, "sound", 20)
    for x in (18, 44, 86, 112):
        stand(img, art("people/ppl_repairer_strip2.png", frame=x % 2, frames=2), x, 94)
        stand(img, art("fx/fx_repair_strip4.png", frame=(x // 7) % 4, frames=4), x + 8, 86)
    return img


def empty_stores():
    """The stores run low: a near-empty granary, the meal bell, the small gate to the valley."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    bands(img, DUSK_SKY)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 40, W - 1, H - 1], fill=P["wood1"])
    d.rectangle([0, 40, W - 1, 41], fill=P["wood2"])
    back = art("warfront/map_gate_sound.png").crop((0, 2, W, 30))
    img.alpha_composite(back, (0, 18))
    d.rectangle([96, 26, 110, 46], fill=P["green1"])                   # the small gate, open on the forest
    d.rectangle([96, 36, 110, 46], fill=P["green2"])
    d.line([96, 42, 110, 40], fill=P["sea2"])
    stand(img, art("events/evt_granary_25.png"), 40, 74)
    post = Image.new("RGBA", (12, 26), (0, 0, 0, 0))
    ImageDraw.Draw(post).rectangle([5, 10, 6, 25], fill=P["wood2"])
    post.alpha_composite(art("icons/icon_bell.png"), (0, 0))
    stand(img, post, 70, 74)
    stand(img, art("people/ppl_gatherer.png"), 103, 62)
    for x in (12, 20):
        d.rectangle([x, 66, x + 6, 72], fill=P["wood3"])
        d.line([x, 66, x + 6, 66], fill=P["wood4"])
    return img


def strangers_at_gate():
    """A stranger on the road at dusk; a ranger watches from the wall."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    bands(img, DUSK_SKY)
    ridge(img, 40, "shadow1")
    ground(img, 40, 65, (44, 86), road="parch1", earth="wood1")
    stand(img, person("human", "dusk"), 65, 70)                         # alone on the road
    wall(img, "sound", 18)
    stand(img, art("people/ppl_ranger.png"), 24, 93)
    return img


def a_city_to_build():
    """A city, not a wall: the first scaffolds and foundations on the plots, at dusk."""
    img = city("dusk", {"garrison": "scaffold", "forge": "foundation", "librarium": "bld_librarium_ruin"}, 140)
    for x, feet, n in ((60, 70, "human"), (72, 80, "dwarf"), (84, 66, "halfling")):
        stand(img, person(n, "dusk"), x, feet)
    return img


def the_smith():
    """The forge is cold: its ruin at night, the smith come to look at it."""
    img = city("night", {"housing": "bld_housing_house"}, 104)
    stand(img, person("human", "night"), 84, 72)
    return img


def beyond_the_walls():
    """Beyond the walls: the old outpost on the ridge, explorers setting out."""
    img = city("dusk", {"keep": "bld_keep_built", "outpost": "bld_outpost_ruin"}, 30)
    for x, feet in ((44, 66), (54, 70)):
        stand(img, art("people/ppl_explorer.png", "dusk"), x, feet)
    return img


def the_keep():
    """The Keep restored, its people gathered on the road before it."""
    img = city("lit", {"keep": "bld_keep_restored", "outpost": "bld_outpost_built",
                       "wizard-tower": "bld_wizard-tower_ruin", "housing": "bld_housing_row"}, 10)
    for i, x in enumerate((48, 57, 74, 83)):
        stand(img, person(PEOPLE[i]), x, 95)
    return img


def the_lodge():
    """The Ranger's Lodge at the forest's edge, its trappers and rangers."""
    img = city("lit", {"lodge": "bld_lodge_lv3", "housing": "bld_housing_house"}, 92)
    for x, feet, n in ((50, 56, "gatherer"), (60, 62, "trapper"), (48, 72, "ranger")):
        stand(img, art(f"people/ppl_{n}.png"), x, feet)
    return img


def the_scholar():
    """The Ink-Wing comes: the Librarium at night, a light in its window."""
    img = city("night", {"librarium": "bld_librarium_built", "garrison": "bld_garrison_lv1",
                         "forge": "bld_forge_built"}, 140)
    return img


def dragonsteel():
    """Dragonsteel: the forge blazing at night, sparks flying."""
    img = city("night", {"forge": "bld_forge_lit_strip3", "housing": "bld_housing_row",
                         "garrison": "bld_garrison_lv3", "lodge": "bld_lodge_lv3"}, 104)
    for i, (x, y) in enumerate(((96, 30), (108, 26), (102, 22), (114, 32))):
        stand(img, art("fx/fx_spark_strip4.png", frame=i % 4, frames=4), x, y)
    return img


def the_horde_grows():
    """They come bigger: the Minotaur at the head of the deep Unmaking's monsters."""
    img = warfront(NIGHT_SKY)
    campfires(img, 41, [6, 15, 22, 31, 96, 104, 113, 122])
    far(img, ["orc", "goblin", "orc"], 47, [44, 50, 56, 61, 66, 71, 76, 82, 88])
    for x, n in ((34, "orc-stronger"), (52, "goblin-stronger"), (80, "raider-stronger"), (98, "orc-stronger")):
        stand(img, relight(art(f"mobs/mob_{n}_idle.png"), DUSK), x, 66)
    # The Minotaur is not locked yet: its art comes from its batch (41-minotaur)
    stand(img, Image.open(AGENT / "41-minotaur" / "out" / "mob_minotaur-stronger_idle.png").convert("RGBA"), 66, 84)
    wall(img, "cracking", 14)
    return img


def ancient_magic():
    """The ancient magic: a pillar of light from the Keep; the horde breaks and flees."""
    img = city("night", {"keep": "bld_keep_built"}, 4)
    d = ImageDraw.Draw(img)
    for y in range(0, 40):                                             # the pillar, rising from the Keep
        d.line([62, y, 68, y], fill=P["gold5"])
        d.line([64, y, 66, y], fill=P["gold6"])
    for i, (x, y) in enumerate(((54, 10), (76, 6), (50, 24), (80, 20), (58, 2), (72, 30), (46, 14), (84, 12))):
        d.point((x, y), fill=P["gold6" if i % 2 else "teal3"])
    for x in (20, 30, 98, 110):
        far(img, ["kobold", "goblin"], 92, [x])
    return img


SCENES = {
    "elder-approaches": elder_approaches, "renown": first_renown, "wall-holds": call_to_arms,
    "wall-shakes": the_breach, "young-claws": sharpen_claws, "wall-is-yours": the_wall_is_yours,
    "stores-run-low": empty_stores, "stranger": strangers_at_gate, "city-not-a-wall": a_city_to_build,
    "forge-is-cold": the_smith, "beyond-the-walls": beyond_the_walls, "keep-restored": the_keep,
    "rangers-lodge": the_lodge, "ink-wing": the_scholar, "dragonsteel": dragonsteel,
    "they-come-bigger": the_horde_grows, "ancient-magic": ancient_magic,
}


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    for name, f in SCENES.items():
        img = f()
        assert img.size == (W, H), (name, img.size)
        img.save(OUT / f"story_{name}_v1.png")
        upscale(img, 3).save(PREVIEW / f"story_{name}_v1_x3.png")
    print(len(SCENES), "scenes")


if __name__ == "__main__":
    main()
