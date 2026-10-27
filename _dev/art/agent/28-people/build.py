"""Build Batch 6, People: the role sprites and wanderer figures from src/people.px, then the wanderer
scenes (src/make_wanderers.py) and the line-up beside the townsfolk.

Run: python build.py
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))

import pixkit  # noqa: E402

text = (HERE / "src" / "people.px").read_text(encoding="utf-8")
for a in pixkit.px.parse(text):
    for i, rows in enumerate(a["frames"]):
        w, h = a["spec"]["size"]
        bad = [n for n, r in enumerate(rows) if len(r) != w]
        if bad or len(rows) != h:
            raise SystemExit(f"{a['name']} frame {i + 1}: {len(rows)} rows, wrong widths at rows {bad}")
entries = pixkit.build(HERE / "src" / "people.px", HERE)
pixkit.write_manifest(entries, HERE)
for e in entries:
    print(f"{'FAIL' if e['errors'] else 'ok':4} {e['file']:28} {e['errors'][:3]} {e['warnings'][:2]}")
