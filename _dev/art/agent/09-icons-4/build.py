"""Build icon sheet 4: assets, checks, manifest, and a sheet beside the official icons.

Run: python build.py (after src/make_icons.py)
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))

from PIL import Image  # noqa: E402

import pixkit  # noqa: E402

NAMES = ("next", "unknown", "info", "rising", "falling", "rank",
         "shield_gear", "claws", "moon", "sparkles", "map", "stats")

entries = pixkit.build(HERE / "src" / "icons.px", HERE)
pixkit.write_manifest(entries, HERE)
for e in entries:
    print(f"{'FAIL' if e['errors'] else 'ok':4} {e['file']:24} {e['errors'][:3]} {len(e['warnings'])} warnings")


def load(p):
    return Image.open(p).convert("RGBA")


official = HERE.parents[1] / "official" / "icons"
new = [load(HERE / "out" / f"icon_{n}.png") for n in NAMES]
locked = [load(p) for p in sorted(official.glob("icon_*.png")) if "claw-" not in p.name]
(HERE / "preview").mkdir(exist_ok=True)
pixkit.contact_sheet([("Sheet 4", new), ("Official set", locked)], scale=6).save(HERE / "preview" / "sheet_x6.png")
pixkit.contact_sheet([("Sheet 4", new[:6]), ("", new[6:])], scale=10).save(HERE / "preview" / "close_x10.png")
print("sheets written")
