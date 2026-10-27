"""Preview the buildings: each building's states in story order at x4, the Forge's fire strip, and
the city at three moments (start, mid-game, late game), lit and at night, on the Batch 2 base map.

Run: python preview.py
"""
import json
import pathlib

from PIL import Image

import buildings
from kit import pixkit

HERE = pathlib.Path(__file__).resolve().parent
BATCH = HERE.parent
CITY = BATCH.parent / "19-city" / "out"
PREVIEW = BATCH / "preview"
P = pixkit.PALETTE

# The city at three moments: what stands on each plot (a building state, or a plot piece).
MOMENTS = {
    "start": {"keep": "ruin", "lodge": "ruin", "librarium": "ruin", "garrison": "ruin", "forge": "ruin",
              "tower-west": "ruin", "tower-east": "ruin", "housing": "fog", "outpost": "fog",
              "wizard-tower": "fog"},
    "mid": {"keep": "built", "lodge": "lv1", "librarium": "ruin", "garrison": "lv3", "forge": "lit",
            "tower-west": "built", "tower-east": "ruin", "housing": "house", "outpost": "scaffold",
            "wizard-tower": "fog"},
    "late": {"keep": "restored", "lodge": "lv3", "librarium": "built", "garrison": "lv5", "forge": "lit",
             "tower-west": "built", "tower-east": "built", "housing": "row", "outpost": "upgraded",
             "wizard-tower": "built"},
}


def by_building():
    rows = {}
    for (bid, state) in buildings.BUILDINGS:  # definition order is story order
        rows.setdefault(bid, []).append(state)
    return rows


def sheet():
    rows = [(bid, [Image.open(buildings.OUT / f"bld_{bid}_{s}.png").convert("RGBA") for s in states])
            for bid, states in by_building().items()]
    pixkit.contact_sheet(rows, scale=4).save(PREVIEW / "states_x4.png")


def forge_strip():
    frames = buildings.forge_lit_strip()
    pixkit.strip(frames).save(buildings.OUT / "bld_forge_lit_strip3.png")
    pixkit.write_gif(frames, 6, PREVIEW / "forge_lit.gif", scale=4)


def scene(pick):
    base = Image.open(CITY / "map_city_base.png").convert("RGBA")
    plots = {p["id"]: p for p in json.loads((CITY / "map_plots.json").read_text())["plots"]}
    for bid, state in pick.items():
        p = plots[bid]
        f = buildings.OUT / f"bld_{bid}_{state}.png"
        if not f.exists():
            f = CITY / f"map_{state}_{p['width']}x{p['height']}.png"
        base.alpha_composite(Image.open(f).convert("RGBA"), (p["x"], p["y"]))
    return base


def moments():
    for name, pick in MOMENTS.items():
        lit = scene(pick)
        pair = Image.new("RGBA", (lit.width * 2 + 8, lit.height), P["night1"] + (255,))
        pair.paste(lit, (0, 0))
        pair.paste(pixkit.relight(lit, pixkit.NIGHT), (lit.width + 8, 0))
        pixkit.upscale(pair, 3).save(PREVIEW / f"city_{name}_x3.png")


if __name__ == "__main__":
    PREVIEW.mkdir(exist_ok=True)
    buildings.build_all()
    sheet()
    forge_strip()
    moments()
    print("previews written")
