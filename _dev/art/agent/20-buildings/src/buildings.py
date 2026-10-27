"""Batch 3: every building in every state, drawn with the kit. Each function returns a finished
(outlined) RGBA image the size of the building's plot (see 19-city/out/map_plots.json).

Run: python buildings.py  (writes ../out/bld_<id>_<state>.png)
"""
import pathlib

from kit import CLAY_ROOF, MOSS_ROOF, SLATE_ROOF, THATCH_ROOF, WARM_STONE, Canvas

OUT = pathlib.Path(__file__).resolve().parents[1] / "out"
BUILDINGS = {}


def building(bid, state):
    def wrap(fn):
        BUILDINGS[(bid, state)] = fn
        return fn
    return wrap


# === Housing (32 x 32) =====================================================================
def cottage(c, x0, x1, floor, wall_h, roof_h, lit=True, chimney=True, roof=CLAY_ROOF):
    c.timber_wall(x0, floor - wall_h + 1, x1, floor)
    cx = (x0 + x1 + 1) / 2
    if chimney:
        c.stone_wall(x1 - 3, floor - wall_h - roof_h + 1, x1 - 2, floor - wall_h - 2)
    c.gable(cx, floor - wall_h, (x1 - x0) / 2 + 1, roof_h, roof)
    dw = 3
    c.door(int(cx) - 1, floor - 4, dw, 5)
    c.window(x0 + 2, floor - wall_h + 3, lit=lit)
    c.window(x1 - 3, floor - wall_h + 3, lit=lit)


@building("housing", "house")
def housing_one():
    c = Canvas(32, 32)
    cottage(c, 8, 23, 29, 9, 9)
    return c.finish()


@building("housing", "row")
def housing_row():
    c = Canvas(32, 32)
    cottage(c, 10, 21, 25, 7, 7, chimney=False, roof=THATCH_ROOF)   # behind
    cottage(c, 1, 12, 29, 8, 7)
    cottage(c, 19, 30, 29, 8, 7, chimney=False)
    return c.finish()


# === Ranger's Lodge (32 x 32) =============================================================
def antlers(c, cx, y):
    for dx, dy in ((-1, 0), (-2, -1), (-3, -2), (-2, -3), (1, 0), (2, -1), (3, -2), (2, -3)):
        c.put(cx + dx, y + dy, "parch3")


@building("lodge", "ruin")
def lodge_ruin():
    c = Canvas(32, 32)
    c.log_wall(6, 22, 25, 29)
    c.break_top(6, 25, 22, 5, seed=4)
    for i in range(7):  # a fallen roof beam
        c.put(8 + i * 2, 21 + i // 2, "wood2")
        c.put(9 + i * 2, 21 + i // 2, "wood3")
    c.rubble(3, 28, 29, seed=5, pal=("wood4", "wood3", "wood2", "wood1"))
    return c.finish()


@building("lodge", "lv1")
def lodge_lv1():
    c = Canvas(32, 32)
    c.log_wall(7, 21, 24, 29)
    c.gable(16, 20, 10, 8, MOSS_ROOF)
    c.door(14, 24, 4, 6, pal=("wood2", "wood1"))
    c.window(9, 23)
    c.window(21, 23)
    antlers(c, 16, 15)
    return c.finish()


@building("lodge", "lv3")
def lodge_lv3():
    c = Canvas(32, 32)
    c.stone_wall(2, 25, 29, 29, WARM_STONE)
    c.log_wall(2, 17, 29, 25)
    c.stone_wall(24, 4, 26, 12)  # the chimney
    c.gable(16, 16, 15, 10, MOSS_ROOF)
    c.door(14, 22, 4, 8, pal=("wood2", "wood1"))
    for x in (5, 9, 21, 25):
        c.window(x, 20)
    c.window(15, 10, 2, 2)  # the loft window in the gable
    antlers(c, 16, 7)
    for y in range(19, 30):  # porch posts
        c.put(11, y, "wood4")
        c.put(20, y, "wood4")
    return c.finish()


# === Draconia Keep (50 x 82) ==============================================================
def keep_body(c, lit):
    floor = 80
    c.stone_wall(18, 18, 31, 47)         # the great tower, rising behind the curtain
    c.stone_wall(13, 49, 36, floor)      # the curtain wall
    c.stone_wall(3, 34, 12, floor)       # west tower
    c.stone_wall(37, 34, 46, floor)      # east tower
    c.merlons(3, 12, 33)
    c.merlons(37, 46, 33)
    c.merlons(14, 35, 47)
    c.ink_h(14, 35, 48)                  # the curtain stands in front of the great tower
    c.ink_v(13, 34, floor)               # the towers stand in front of the curtain
    c.ink_v(36, 34, floor)
    c.door(21, 67, 8, 14, pal=("wood3", "wood2"))
    for x, y in ((23, 24), (23, 34), (7, 42), (41, 42), (15, 56), (33, 56)):
        c.window(x if x != 23 else 23, y, 2 if x != 23 else 3, 3, lit=lit, arch=True)
    return floor


@building("keep", "ruin")
def keep_ruin():
    c = Canvas(50, 82)
    floor = keep_body(c, lit=False)
    c.break_top(18, 31, 18, 22, seed=11)   # the great tower, broken off
    c.break_top(3, 12, 32, 12, seed=12)
    c.break_top(37, 46, 32, 16, seed=13)
    c.break_top(13, 36, 46, 8, seed=14)
    c.rect(21, 67, 28, 79, "night1")         # the gate gone
    c.rubble(1, 48, floor, seed=15)
    c.rubble(14, 35, floor - 2, seed=16)
    return c.finish()


@building("keep", "built")
def keep_built():
    c = Canvas(50, 82)
    keep_body(c, lit=True)
    c.cone(24.5, 17, 9, 12, CLAY_ROOF)
    c.flag(24, 1, pole=5)
    return c.finish()


@building("keep", "restored")
def keep_restored():
    c = Canvas(50, 82)
    keep_body(c, lit=True)
    c.cone(24.5, 17, 9, 12, CLAY_ROOF)
    c.flag(24, 1, pole=5)
    c.flag(7, 26, pole=6)
    c.flag(41, 26, pole=6)
    for x in (14, 34):  # heraldic banners on the curtain wall
        c.banner(x, 50, h=7)
    for x in range(18, 32):  # a gold band under the great tower's top
        c.put(x, 19, "gold4")
    return c.finish()


# === The Garrison (32 x 32) ===============================================================
PLANK_ROOF = ("wood4", "wood3", "wood2")


@building("garrison", "ruin")
def garrison_ruin():
    c = Canvas(32, 32)
    c.stone_wall(3, 23, 28, 29)
    c.break_top(3, 28, 23, 4, seed=21)
    for x in (6, 15, 24):  # charred posts
        for y in range(15 + x % 4, 23):
            c.put(x, y, "wood1")
    c.rubble(1, 30, 29, seed=22)
    return c.finish()


@building("garrison", "lv1")
def garrison_lv1():
    c = Canvas(32, 32)
    c.plank_wall(4, 21, 27, 29, vertical=False)
    c.hip(2, 29, 20, 6, PLANK_ROOF)
    c.door(14, 24, 4, 6, pal=("wood2", "wood1"))
    c.window(7, 23)
    c.window(23, 23)
    c.flag(28, 9, pole=11, pal=("clay3", "clay1"))
    return c.finish()


@building("garrison", "lv3")
def garrison_lv3():
    c = Canvas(32, 32)
    c.stone_wall(3, 22, 28, 29)
    c.timber_wall(3, 14, 28, 21)
    c.hip(1, 30, 13, 7, CLAY_ROOF)
    c.door(13, 22, 6, 8)
    for x in (6, 23):
        c.window(x, 24)
        c.window(x, 16)
    c.banner(9, 15, h=5)
    c.banner(21, 15, h=5)
    return c.finish()


@building("garrison", "lv5")
def garrison_lv5():
    c = Canvas(32, 32)
    c.stone_wall(1, 16, 21, 29)
    c.hip(0, 22, 15, 6, CLAY_ROOF)
    c.stone_wall(22, 6, 29, 29)         # the watchtower
    c.merlons(22, 29, 5)
    c.ink_v(21, 16, 29)
    c.flag(25, 0, pole=4, pal=("clay3", "clay1"))
    c.door(8, 21, 6, 9)
    for x in (3, 16):
        c.window(x, 20)
    c.window(25, 10)
    c.window(25, 18)
    c.banner(4, 23, h=5)
    c.banner(16, 23, h=5)
    return c.finish()


# === The Forge (32 x 32) ==================================================================
def forge_body(c, mouth):
    c.stone_wall(3, 18, 22, 29, WARM_STONE)
    c.hip(1, 24, 17, 6, SLATE_ROOF)
    c.stone_wall(23, 5, 28, 29)          # the great chimney
    c.ink_v(22, 5, 29)
    for y in range(22, 30):              # the forge mouth: an arch in the front wall
        for x in range(6, 13):
            if not (y == 22 and x in (6, 12)):
                c.put(x, y, mouth(x, y))
    c.rect(15, 26, 19, 26, "steel3")     # the anvil before the door
    c.rect(16, 27, 18, 28, "steel2")
    c.put(14, 26, "steel4")


@building("forge", "ruin")
def forge_ruin():
    c = Canvas(32, 32)
    forge_body(c, lambda x, y: "night1")
    c.break_top(1, 24, 12, 10, seed=31)
    c.break_top(23, 28, 5, 12, seed=32)
    c.rubble(1, 30, 29, seed=33, pal=WARM_STONE)
    return c.finish()


@building("forge", "built")
def forge_built():
    c = Canvas(32, 32)
    forge_body(c, lambda x, y: "night1" if y < 27 else "wood1")
    return c.finish()


def forge_fire(frame):
    def mouth(x, y):
        k = (x * 3 + y * 5 + frame * 7) % 11
        if y >= 27:
            return "fire3" if k < 4 else "fire2"
        if y >= 25:
            return "fire2" if k < 6 else "fire1"
        return "fire1" if k < 5 else "night1"
    return mouth


@building("forge", "lit")
def forge_lit():
    c = Canvas(32, 32)
    forge_body(c, forge_fire(0))
    c.put(25, 4, "fire1")
    c.put(26, 4, "fire2")
    return c.finish()


def forge_lit_strip():
    frames = []
    for f in range(3):
        c = Canvas(32, 32)
        forge_body(c, forge_fire(f))
        c.put(25 + f % 2, 4, "fire1")
        c.put(26 - f % 2, 4, "fire2")
        frames.append(c.finish())
    return frames


# === Wayfinder's Outpost (32 x 32) ========================================================
def lookout(c, platform, roof):
    for x in (9, 21):                     # the stilts
        for y in range(platform + 2, 30):
            c.put(x, y, "wood4")
            c.put(x + 1, y, "wood2")
    for i in range(30 - platform - 3):    # an X brace between them
        t = i / max(1, 30 - platform - 4)
        c.put(int(11 + 9 * t), platform + 3 + i, "wood3")
        c.put(int(20 - 9 * t), platform + 3 + i, "wood3")
    c.rect(6, platform, 25, platform + 1, "wood4")
    for x in range(6, 26):
        c.put(x, platform + 1, "wood2")
    for x in (6, 11, 16, 20, 25):         # the railing
        for y in range(platform - 4, platform):
            c.put(x, y, "wood3")
    c.rect(6, platform - 4, 25, platform - 4, "wood4")
    if roof:
        c.gable(16, platform - 5, 11, 7, THATCH_ROOF)


@building("outpost", "ruin")
def outpost_ruin():
    c = Canvas(32, 32)
    for x, top in ((9, 20), (21, 23)):
        for y in range(top, 30):
            c.put(x, y, "wood4")
            c.put(x + 1, y, "wood2")
    for i in range(14):                   # the fallen platform
        c.put(5 + i, 27 - i // 4, "wood4")
        c.put(5 + i, 28 - i // 4, "wood2")
    c.rubble(2, 29, 29, seed=41, pal=("wood4", "wood3", "wood2", "wood1"))
    return c.finish()


@building("outpost", "built")
def outpost_built():
    c = Canvas(32, 32)
    lookout(c, 12, roof=False)
    c.flag(16, 1, pole=7, pal=("sea3", "sea2"))
    return c.finish()


@building("outpost", "upgraded")
def outpost_upgraded():
    c = Canvas(32, 32)
    lookout(c, 14, roof=True)
    c.flag(16, 0, pole=2, pal=("sea3", "sea2"))
    c.put(13, 11, "gold5")                # a lantern hung under the roof
    c.put(13, 12, "fire2")
    for y in range(16, 30):               # the ladder
        c.put(14, y, "wood3")
        c.put(17, y, "wood3")
        if y % 3 == 0:
            c.put(15, y, "wood4")
            c.put(16, y, "wood4")
    return c.finish()


# === The Librarium (32 x 32) ==============================================================
def librarium_body(c, lit):
    c.stone_wall(4, 16, 27, 29)
    c.stone_wall(1, 10, 5, 29)            # the two spires' shafts
    c.stone_wall(26, 10, 30, 29)
    c.ink_v(6, 10, 29)
    c.ink_v(25, 10, 29)
    for x in (9, 15, 21):                 # tall arched windows
        c.window(x, 19, 3, 6, lit=lit, arch=True)
    c.door(14, 26, 4, 4, pal=("sea2", "sea1"))


@building("librarium", "ruin")
def librarium_ruin():
    c = Canvas(32, 32)
    librarium_body(c, lit=False)
    c.cone(3.5, 9, 3, 6, SLATE_ROOF)
    c.break_top(1, 30, 3, 12, seed=51)
    c.break_top(7, 24, 16, 5, seed=52)
    c.rubble(1, 30, 29, seed=53)
    return c.finish()


@building("librarium", "built")
def librarium_built():
    c = Canvas(32, 32)
    librarium_body(c, lit=True)
    c.gable(16, 15, 11, 9, SLATE_ROOF)
    c.cone(3.5, 9, 3, 8, SLATE_ROOF)
    c.cone(28.5, 9, 3, 8, SLATE_ROOF)
    c.banner(15, 8, h=4, pal=("sea3", "sea1"), charge="parch3")
    return c.finish()


# === The Wizard's Tower (24 x 40) =========================================================
MAGIC_ROOF = ("night4", "night3", "night2")


def wizard_body(c, lit):
    c.stone_wall(7, 14, 16, 38, block=5)
    c.window(11, 18, 2, 3, lit=lit, arch=True)
    c.window(11, 26, 2, 3, lit=lit, arch=True)
    c.door(10, 33, 4, 6, pal=("night3", "night2"))
    c.rect(5, 23, 18, 23, "steel3")       # the balcony
    c.rect(5, 24, 18, 24, "steel2")


@building("wizard-tower", "ruin")
def wizard_ruin():
    c = Canvas(24, 40)
    wizard_body(c, lit=False)
    c.break_top(5, 18, 14, 14, seed=61)
    c.rubble(1, 22, 38, seed=62)
    return c.finish()


@building("wizard-tower", "built")
def wizard_built():
    c = Canvas(24, 40)
    wizard_body(c, lit=True)
    c.cone(12, 13, 7, 11, MAGIC_ROOF)
    c.put(11, 1, "gold5")                 # the star on the spire
    c.put(12, 1, "gold5")
    c.put(11, 0, "gold6")
    return c.finish()


# === Towers West and East on the wall (20 x 32) ===========================================
def wall_tower(c, lit, banner_x):
    c.stone_wall(4, 9, 15, 29)
    c.merlons(4, 15, 8)
    c.window(9, 15, 2, 3, lit=lit, arch=True)
    if lit:
        c.rect(8, 4, 11, 5, "steel2")     # the brazier, burning
        c.put(9, 3, "fire1")
        c.put(10, 3, "fire2")
        c.put(9, 2, "fire2")
        c.put(10, 2, "fire3")
        c.put(10, 1, "fire2")
        c.banner(banner_x, 11, h=5)


@building("tower-west", "ruin")
def tower_west_ruin():
    c = Canvas(20, 32)
    wall_tower(c, lit=False, banner_x=5)
    c.break_top(4, 15, 7, 12, seed=71)
    c.rubble(1, 18, 29, seed=72)
    return c.finish()


@building("tower-west", "built")
def tower_west_built():
    c = Canvas(20, 32)
    wall_tower(c, lit=True, banner_x=5)
    return c.finish()


@building("tower-east", "ruin")
def tower_east_ruin():
    c = Canvas(20, 32)
    wall_tower(c, lit=False, banner_x=13)
    c.break_top(4, 15, 7, 12, seed=73)
    c.rubble(1, 18, 29, seed=74)
    return c.finish()


@building("tower-east", "built")
def tower_east_built():
    c = Canvas(20, 32)
    wall_tower(c, lit=True, banner_x=13)
    return c.finish()


def build_all():
    OUT.mkdir(exist_ok=True)
    for (bid, state), fn in BUILDINGS.items():
        fn().save(OUT / f"bld_{bid}_{state}.png")
    return sorted(BUILDINGS)


if __name__ == "__main__":
    print(len(build_all()), "sprites written")
