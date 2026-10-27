"""Build icon sheet 2: assets, checks, manifest, and a sheet beside the official icons.

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


official = HERE.parents[1] / "official" / "icons"
new = [load(HERE / "out" / f"icon_{n}.png") for n in ("padlock", "flag", "compass", "upgrade", "check")]
locked = [load(p) for p in sorted(official.glob("icon_*.png"))]
rows = [("Sheet 2", new), ("Official set", locked)]
pixkit.contact_sheet(rows, scale=6).save(HERE / "preview" / "sheet_x6.png")
print("sheet written")
