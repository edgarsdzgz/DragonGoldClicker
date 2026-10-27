"""Build the fliers board. Run after src/make_bestiary.py. Output: board.html, and preview/road_<id>.gif (each
flier beating its wings above its shadow on a strip of road, the shadow at half strength as the game would draw it).
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
import pixkit  # noqa: E402
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
OFFICIAL = HERE.parents[1] / "official"
LIFT = 8  # pixels of air between the flier's feet and its shadow

FLIERS = [
    ("giant-bat", "Giant Bat", "A brown bat as big as a goblin: big ears, gold eyes, fangs, leathery wings."),
    ("harpy", "Harpy", "A gray-green hag's face under stringy black hair, feathered wings, yellow legs with talons."),
    ("mantair-corsair", "Mantair Corsair", "A raider in a rust head-wrap riding a flying manta: wide sea-dark wings, "
                                           "cephalic fins, a curved blade. From the old Draconia game."),
    ("storm-rider", "Storm Rider", "A Wind-Taken rider on a storm-gray horse that runs on the wind: a white blaze, "
                                   "a cloud mane, lightning under the hooves, a lance with a pennant. Its two frames "
                                   "are a gallop, not a wingbeat."),
]
RIDERS = [
    ("wolf-rider", "Goblin Wolf Rider", "A goblin with a spear on a gray wolf with the War Hound's head, bigger. "
                                        "A ground rider: it walks the road like any monster."),
]


def road_gif(mid):
    """The flier's wingbeat over its shadow on a strip of road."""
    strip = Image.open(OUT / f"mob_{mid}_walk_strip2.png")
    fw = strip.width // 2
    shadow = Image.open(OUT / f"mob_{mid}_shadow.png")
    soft = shadow.copy()
    soft.putalpha(shadow.getchannel("A").point(lambda a: a // 2))
    w, h = fw + 8, strip.height + LIFT + 6
    frames = []
    for i in range(2):
        f = Image.new("RGBA", (w, h), pixkit.PALETTE["night1"] + (255,))
        f.paste(pixkit.PALETTE["wood4"] + (255,), (0, h - 6, w, h))
        f.alpha_composite(soft, ((w - shadow.width) // 2, h - 5))
        f.alpha_composite(strip.crop((i * fw, 0, (i + 1) * fw, strip.height)), (4, 0))
        frames.append(f)
    pixkit.write_gif(frames, 4, PREVIEW / f"road_{mid}.gif", scale=4)
    return PREVIEW / f"road_{mid}.gif"


def monster(mid, name, note, flier):
    n = f"mob_{mid}"
    figs = [fig(OUT / f"{n}_idle.png", 5, "idle"), fig(OUT / f"{n}_hit.png", 5, "hit"),
            fig(OUT / f"{n}_hurt.png", 5, "hurt"),
            gif_fig(PREVIEW / f"{n}_walk.gif", 1, "wingbeat" if flier and mid != "storm-rider" else
                    "gallop" if flier else "walk"),
            gif_fig(PREVIEW / f"{n}_death.gif", 1, "death"),
            fig(OUT / f"{n}-strong_idle.png", 5, "strong"), fig(OUT / f"{n}-stronger_idle.png", 5, "stronger")]
    if flier:
        figs += [fig(OUT / f"{n}_shadow.png", 5, "shadow"), gif_fig(road_gif(mid), 1, "on the road")]
    return section(name, note, figs)


sections = ["<h2 style='margin-top:12px'>Fliers</h2>"]
sections += [monster(*m, True) for m in FLIERS]
sections.append("<h2 style='margin-top:12px'>Riders</h2>")
sections += [monster(*m, False) for m in RIDERS]
sections.append(section("Beside their kin", "Each next to the locked monster it belongs with.", [
    fig(OFFICIAL / "mobs" / "mob_goblin_idle.png", 5, "goblin"), fig(OUT / "mob_giant-bat_idle.png", 5, "giant bat"),
    fig(OUT / "mob_wolf-rider_idle.png", 5, "wolf rider"),
    fig(OFFICIAL / "mobs" / "mob_nomad-warrior_idle.png", 5, "nomad warrior"),
    fig(OUT / "mob_storm-rider_idle.png", 5, "storm rider"),
    fig(OFFICIAL / "mobs" / "mob_banner-runner_idle.png", 5, "banner-runner"),
    fig(OUT / "mob_mantair-corsair_idle.png", 5, "mantair corsair")]))

out = page("Bestiary Fliers", "The bestiary: fliers and riders",
           "No new battlefield needed (owner): fliers use the road, drawn higher over a shadow of their own, and "
           "their two walk frames are a wingbeat (the Storm Rider's a gallop on the wind), so the game plays them "
           "where it plays any walk. Riders on mounts simply walk. Built like the locked bestiary: shaded, no "
           "blending, every pose at all three Unmaking tiers. Lifting fliers and drawing the shadow is app work. "
           "&middot; 2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
