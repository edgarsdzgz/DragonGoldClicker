"""Build icon todo: the asset, its checks, and a board beside the check mark and in a checklist row.

Run: python build.py (out/icon_todo.png, preview/, board.html)
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))

from PIL import Image  # noqa: E402

import pixkit  # noqa: E402
from boardkit import fig, page, section  # noqa: E402

entries = pixkit.build(HERE / "src" / "icons.px", HERE)
pixkit.write_manifest(entries, HERE)
for e in entries:
    print(f"{'FAIL' if e['errors'] else 'ok':4} {e['file']:20} {e['errors'][:3]} {len(e['warnings'])} warnings")

official = HERE.parents[1] / "official" / "icons"
todo = Image.open(HERE / "out" / "icon_todo.png").convert("RGBA")
check = Image.open(official / "icon_check.png").convert("RGBA")

# A checklist as the claws sheet and the journal draw it: done, done, not yet
row = Image.new("RGBA", (12, 12 * 3 + 8), pixkit.PALETTE["night1"] + (255,))
for i, icon in enumerate((check, check, todo)):
    row.alpha_composite(icon, (0, i * 16))

sections = [
    section("The ring beside the check", "The same frame, outline and light as the locked check mark.",
            [fig(check, 8, "check (locked)"), fig(todo, 8, "todo (new)"), fig(todo, 2, "todo, actual size")]),
    section("In a checklist", "Done, done, not yet: how the claws sheet, the journal and research list "
            "their requirements.", [fig(row, 6, "checklist")]),
]
out = page("Icon Todo", "A pixel icon for 'not done yet'",
           "The last vector icon players still see: the empty circle beside an unmet requirement in the claws "
           "sheet, the journal and research. This ring replaces it, drawn as the check mark's counterpart. "
           "&middot; 2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print("board.html written")
