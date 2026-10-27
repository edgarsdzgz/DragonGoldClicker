"""Build the townsfolk peoples: assets, checks, manifest, and a line-up beside the existing folk.

Run: python build.py
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))

from PIL import Image  # noqa: E402

import pixkit  # noqa: E402

entries = pixkit.build(HERE / "src" / "peoples.px", HERE)
pixkit.write_manifest(entries, HERE)
for e in entries:
    print(f"{'FAIL' if e['errors'] else 'ok':4} {e['file']:22} {e['errors'][:3]} {len(e['warnings'])} warnings")


def load(p):
    return Image.open(p).convert("RGBA")


ref = HERE.parents[1] / "reference"
out = HERE / "out"
rows = [
    ("Existing", [load(ref / f"folk-{n}.png") for n in ("human", "elf", "horned", "dwarf")]),
    ("New", [load(out / f"folk-{n}.png") for n in
             ("dwarf", "halfling", "orc", "birdfolk", "fishfolk", "catfolk")]),
    ("All together", [load(ref / "folk-human.png"), load(ref / "folk-elf.png"), load(ref / "folk-horned.png")]
     + [load(out / f"folk-{n}.png") for n in ("dwarf", "halfling", "orc", "birdfolk", "fishfolk", "catfolk")]),
]
pixkit.contact_sheet(rows, scale=6).save(HERE / "preview" / "lineup_x6.png")
print("line-up written")
