"""The city at three light levels: every locked city and building piece relit to night and dusk.

Lit is the locked art itself. Night and dusk come from pixkit's light maps (glow colors keep
their value, so windows and torches stay lit). Output: out/<name>_night.png, out/<name>_dusk.png,
and preview/ (the whole city at each level, with every plot built or ruined).
"""
import json
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent.parent
ART = HERE.parent.parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from pixkit import DUSK, NIGHT, relight, upscale  # noqa: E402

OFFICIAL = ART / "official"
OUT, PREVIEW = HERE / "out", HERE / "preview"
LEVELS = {"night": NIGHT, "dusk": DUSK}

# The pieces the city screen draws: the map, plot pieces, markers, and every building state
SOURCES = sorted((OFFICIAL / "city").glob("map_*.png")) + sorted((OFFICIAL / "buildings").glob("bld_*.png"))

# For the preview: each plot's building, ruined and restored
BUILT = {"keep": "keep_restored", "outpost": "outpost_upgraded", "wizard-tower": "wizard-tower_built",
         "lodge": "lodge_lv3", "librarium": "librarium_built", "housing": "housing_row",
         "forge": "forge_lit", "garrison": "garrison_lv5", "tower-east": "tower-east_built",
         "tower-west": "tower-west_built"}


def city(level, built):
    """The whole map with a building on every plot, bottom-centered on its anchor."""
    load = (lambda p: Image.open(p).convert("RGBA")) if level == "lit" else \
        (lambda p: Image.open(OUT / f"{p.stem}_{level}.png").convert("RGBA"))
    img = load(OFFICIAL / "city" / "map_city_base.png")
    plots = json.loads((OFFICIAL / "city" / "map_plots.json").read_text())["plots"]
    for p in plots:
        name = BUILT[p["id"]] if built else (p["id"] + "_ruin")
        path = OFFICIAL / "buildings" / f"bld_{name}.png"
        if p["id"] == "housing" and not built:
            path = OFFICIAL / "city" / "map_plot-empty_32x32.png"
        if not path.exists():
            continue
        b = load(path)
        if b.width > p["width"] * 1.5:  # a strip: its first frame
            b = b.crop((0, 0, p["width"], b.height))
        ax, ay = p["anchor"]
        img.alpha_composite(b, (ax - b.width // 2, ay - b.height))
    return img


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    for src in SOURCES:
        if src.suffix != ".png":
            continue
        img = Image.open(src).convert("RGBA")
        for level, mapping in LEVELS.items():
            relight(img, mapping).save(OUT / f"{src.stem}_{level}.png")
    for level in ("night", "dusk", "lit"):
        for built in (False, True):
            upscale(city(level, built), 2).save(PREVIEW / f"city_{level}_{'built' if built else 'ruin'}.png")
    print(f"{len(SOURCES)} pieces x 2 levels")


if __name__ == "__main__":
    main()
