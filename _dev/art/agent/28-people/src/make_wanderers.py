"""The four wanderer groups: small parties at townsfolk scale on a strip of road (Batch 6).

The figures come from people.px (part_*); each stands with its feet (its anchor) on the road's
walking line. The road is packed dirt with wheel ruts, a few stones and grass at its edges.

Run: python src/make_wanderers.py (after build.py has drawn the figures)
"""
import json
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE.parent / "00-foundation"))
import pixkit  # noqa: E402

OUT = HERE / "out"
W, H = 34, 22
FEET = 19            # the row the feet stand on
P = pixkit.PALETTE

# (scene, [(figure, anchor x on the road)])
GROUPS = [
    ("evt_wanderer-lone", [("traveler", 17)]),
    ("evt_wanderer-couple", [("traveler", 11), ("walker", 23)]),
    ("evt_wanderer-family", [("walker", 8), ("child", 17), ("traveler", 26)]),
    ("evt_wanderer-veteran", [("veteran", 17)]),
]


def rgba(name):
    return P[name] + (255,)


def road():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = img.load()
    for y in range(FEET - 2, H):
        for x in range(W):
            px[x, y] = rgba("wood2")
    for x in range(W):                                   # the edge, grass tufts along it
        px[x, FEET - 3] = rgba("green2" if x % 5 in (0, 1, 3) else "wood2")
        if x % 5 == 0:
            px[x, FEET - 4] = rgba("green2")
    for y, phase in ((FEET + 1, 0), (H - 1, 2)):         # wheel ruts
        for x in range(W):
            if (x + phase) % 6 < 4:
                px[x, y] = rgba("wood1")
    for x, y in ((3, FEET), (29, FEET - 1), (14, H - 2), (21, FEET + 1)):   # stones
        px[x, y] = rgba("steel2")
    return img


def main():
    manifest = {e["name"]: e for e in json.loads((HERE / "manifest.json").read_text(encoding="utf-8"))}
    for scene, cast in GROUPS:
        img = road()
        for name, x in cast:
            fig = Image.open(OUT / f"part_{name}.png").convert("RGBA")
            ax, ay = manifest[f"part_{name}"]["anchor"]
            img.alpha_composite(fig, (x - ax, FEET - ay))
        img.save(OUT / f"{scene}.png")
        pixkit.upscale(img, 4).save(HERE / "preview" / f"{scene}_x4.png")
    print(len(GROUPS), "wanderer scenes")


if __name__ == "__main__":
    main()
