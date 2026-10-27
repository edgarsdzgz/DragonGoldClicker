"""Build the test run: every asset, its checks, the manifest and the review sheet.

Run: python build.py
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
ART = HERE.parents[1]
sys.path[:0] = [str(HERE.parent / "00-foundation"), str(HERE / "src")]

from PIL import Image  # noqa: E402

import pixkit  # noqa: E402
from granary import granary  # noqa: E402

pixkit.write_files(HERE.parent / "00-foundation" / "palette")
entries = pixkit.build(HERE / "src" / "test-run.px", HERE)

for level in (0, 50, 100):
    name = f"evt_granary_{level}"
    img = granary(level)
    img.save(HERE / "out" / f"{name}.png")
    pixkit.upscale(img, 4).save(HERE / "preview" / f"{name}_x4.png")
    errors, warnings = pixkit.check(img, {"size": (32, 32), "budget": 16})
    entries.append({"name": name, "file": f"{name}.png", "size": [32, 32], "frames": 1,
                    "fps": None, "anchor": [16, 31], "errors": errors, "warnings": warnings})

pixkit.write_manifest(entries, HERE)
for e in entries:
    status = "FAIL" if e["errors"] else "ok"
    print(f"{status:4} {e['file']:32} {e['errors'][:3]} {len(e['warnings'])} warnings")

# Review sheet: the new art beside the existing art it must match.
ref = ART / "reference"
out = HERE / "out"


def load(p):
    return Image.open(p).convert("RGBA")


def frames(name, n, w):
    s = load(out / f"{name}_strip{n}.png")
    return [s.crop((i * w, 0, (i + 1) * w, s.height)) for i in range(n)]


# The set as it stands: the cog, sheaf and hammer come from the 02-icon-redraw batch.
redraw = HERE.parent / "02-icon-redraw" / "out"
old_icons = [load(redraw / f"icon_{n}.png") if n in ("hammer", "sheaf", "cog") else load(ref / f"icon-{n}.png")
             for n in ("star", "food", "villager", "swords", "helm", "hammer", "sheaf", "scroll", "castle",
                       "cog")]
rows = [
    ("Icons: new | existing", [load(out / "icon_hourglass.png"), load(out / "icon_flame.png")] + old_icons),
    ("Fighter | townsfolk", [load(out / "ppl_fighter_idle.png")] + frames("ppl_fighter_attack", 2, 16)
     + [load(ref / "folk-human.png"), load(ref / "folk-dwarf.png"), load(ref / "folk-elf.png")]),
    ("Hit spark, 4 frames", frames("fx_spark", 4, 12)),
    ("Granary 0 | 50 | 100", [load(out / f"evt_granary_{n}.png") for n in (0, 50, 100)]),
]
pixkit.contact_sheet(rows).save(HERE / "preview" / "sheet_x4.png")
print("sheet written")
