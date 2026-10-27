"""Build the icon redraw: assets, checks, manifest, and an old-versus-new sheet.

Run: python build.py
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))

from PIL import Image  # noqa: E402

import pixkit  # noqa: E402

entries = pixkit.build(HERE / "src" / "icons.px", HERE)
pixkit.write_manifest(entries, HERE)
for e in entries:
    print(f"{'FAIL' if e['errors'] else 'ok':4} {e['file']:20} {e['errors'][:3]} {len(e['warnings'])} warnings")


def load(p):
    return Image.open(p).convert("RGBA")


ref = HERE.parents[1] / "reference"
out = HERE / "out"
pairs = [("cog", "cog"), ("wheat", "sheaf"), ("hammer", "hammer"), ("helm", "helm")]
rows = [("Old", [load(ref / f"icon-{old}.png") for old, _ in pairs]),
        ("New", [load(out / f"icon_{new}.png") for _, new in pairs]),
        ("New beside the set", [load(out / f"icon_{new}.png") for _, new in pairs]
         + [load(ref / f"icon-{n}.png") for n in ("star", "food", "villager", "swords", "scroll",
                                                   "castle")])]
pixkit.contact_sheet(rows, scale=6).save(HERE / "preview" / "sheet_x6.png")
print("sheet written")
