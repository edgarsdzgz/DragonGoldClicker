"""Build the batch 90 review board: Valley Finds v1. Run after src/make_finds.py. Output: board.html.
Each find is shown at 1x, enlarged, on crops of the batch 55 backdrops (layouts a and b, lit, dusk, night)
and as animated strips. Dusk and night run the finds through the same palette swap as the backdrop.
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parents[0] / "00-foundation"))
import pixkit  # noqa: E402
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
BACK = HERE.parents[0] / "55-forage-scene" / "out"
LEVELS = [("", "lit", None), ("_dusk", "dusk", pixkit.DUSK), ("_night", "night", pixkit.NIGHT)]


def load(name):
    return Image.open(OUT / f"{name}.png").convert("RGBA")


def frame(strip, i):
    return strip.crop((i * 24, 0, i * 24 + 24, 24))


rabbit = load("find_rabbit_idle")
run = load("find_rabbit_run_strip4")
berries = [load(f"find_berries_{i}") for i in range(4)]
fishs = load("find_fish_leap_strip4")
honey = load("find_honey_strip4")

# crop box on the 130x282 backdrop, and where each find sits inside the crop (top-left of its 24x24 canvas)
LAYOUTS = {
    "a": ((0, 128, 110, 218), {"rabbit": (6, 56), "berries": (74, 10), "fish": (30, 24), "honey": (76, 58)}),
    "b": ((0, 134, 110, 224), {"rabbit": (8, 54), "berries": (30, 8), "fish": (66, 40), "honey": (6, 8)}),
}


def composite(key, level, suffix):
    box, spots = LAYOUTS[key]
    bg = Image.open(BACK / f"map_forage_base_{key}{suffix}.png").convert("RGBA").crop(box)

    def lit(im):
        return im if level is None else pixkit.relight(im, level)

    for name, im in (("rabbit", rabbit), ("berries", berries[0]), ("fish", frame(fishs, 1)), ("honey", frame(honey, 0))):
        bg.alpha_composite(lit(im), spots[name])
    return bg


sections = []

# 1. each find, 1x and enlarged
rows = [
    ("Rabbit", "A wild hare that darts sideways across the grass. One idle pose and a 4-frame run (gather, stretch, "
               "reach, push off). It faces right; the game flips it for the other direction.",
     [fig(rabbit, 1, "idle 1x"), fig(rabbit, 6, "idle x6")] + [fig(frame(run, i), 6, f"run {i + 1} x6") for i in range(4)]),
    ("Berry bush", "Four states, one per tap: full, two-thirds, one-third, bare. The silhouette never changes, only "
                   "the berries, so the tap target stays put.",
     [fig(berries[0], 1, "full 1x")] + [fig(b, 6, n) for b, n in zip(berries, ("full", "two-thirds", "one-third", "bare"))]),
    ("Leaping fish", "A river fish caught mid-leap: rising out of a splash, top of the arc, falling with droplets, "
                     "and going back in with a crown splash.",
     [fig(frame(fishs, 0), 1, "rising 1x")] + [fig(frame(fishs, i), 6, n) for i, n in
                                              enumerate(("rising", "top of arc", "falling", "entering"))]),
    ("Wild honey", "A honeycomb in the hollow of an old stump with three bees circling. The stump never moves; "
                   "only the bees do.",
     [fig(frame(honey, 0), 1, "stump 1x")] + [fig(frame(honey, i), 6, f"bees {i + 1} x6") for i in range(4)]),
]
for title, note, figs in rows:
    sections.append(section(title, note, figs))

# 2. on the backdrop
for key, name in (("a", "Layout A: from the back gate"), ("b", "Layout B: down in the valley")):
    figs = []
    for suffix, label, level in LEVELS:
        comp = composite(key, level, suffix)
        comp.resize((comp.width * 3, comp.height * 3), Image.NEAREST).save(PREVIEW / f"finds_on_{key}{suffix}_x3.png")
        figs.append(fig(comp, 3, f"{label}, x3 (one phone pixel step = 3 dp)"))
    sections.append(section(name + ": the four finds on the Forage backdrop",
                            "Each find sits at its native size on a crop of batch 55 (x3 here, the same scale as "
                            "the game). Dusk and night run the finds through the same palette swap as the valley.",
                            figs))

# 3. animated
gifs = [gif_fig(PREVIEW / "find_rabbit_run_strip4.gif", 3, "rabbit run, 10 fps"),
        gif_fig(PREVIEW / "find_fish_leap_strip4.gif", 3, "fish leap, 6 fps"),
        gif_fig(PREVIEW / "find_honey_strip4.gif", 3, "honey bees, 8 fps")]
sections.append(section("Animated strips", "All three loop. Previews sit on a dark plate.", gifs))

sections.append(section(
    "Questions",
    "1. Do the finds pop enough against the valley, especially the brown hare at night? "
    "2. Is the berry bush readable as a bush rather than a tree top? "
    "3. Is the stump with a comb the right honey spot, or do you want a hollow branch? "
    "4. Should the fish splash get a ring ripple on the river?", []))

(HERE / "board.html").write_text(page(
    "Valley Finds v1", "Valley Finds v1",
    "Batch 90, 2026-10-29. Four small finds that appear around the FORAGE orb for 1 to 3 seconds; a tap pays bonus "
    "food. Each is 24x24 native art pixels (72 dp at x3, so a 48 dp tap target fits inside the art). "
    "Ink outline on every find, so it pops in all three light levels.", sections), encoding="utf-8")
print("board.html written")
