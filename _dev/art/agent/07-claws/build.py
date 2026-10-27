"""Build the claw tiers: grids, checks, manifest, and a sheet in tier order.

Run: python build.py
"""
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))

from PIL import Image  # noqa: E402

import pixkit  # noqa: E402

subprocess.run([sys.executable, str(HERE / "src" / "make_claws.py")], check=True)
entries = pixkit.build(HERE / "src" / "claws.px", HERE)
pixkit.write_manifest(entries, HERE)
for e in entries:
    print(f"{'FAIL' if e['errors'] else 'ok':4} {e['file']:18} {e['errors'][:2]} {len(e['warnings'])} warnings")

tiers = [Image.open(HERE / "out" / f"icon_claw-{i}.png").convert("RGBA") for i in range(1, 10)]
pixkit.contact_sheet([("Tiers 1-9", tiers)], scale=6).save(HERE / "preview" / "sheet_x6.png")
print("sheet written")
