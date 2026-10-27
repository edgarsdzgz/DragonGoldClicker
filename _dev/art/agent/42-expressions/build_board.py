"""Build the expressions board. Run after src/make_expressions.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
OFFICIAL = HERE.parents[1] / "official"

ROWS = [("pyreth", "grieving", "Elder Pyreth"), ("rodain", "grieving", "Captain Rodain: Fifty Became Thirty"),
        ("mirael", "alarmed", "Scout Mirael: she has seen something"),
        ("kael", "angry", "Kael Ironwright: The Forge Is Cold"), ("lirae", "grieving", "Lirae the Ink-Wing"),
        ("varn", "fierce", "Varn: I want to fight like you"),
        ("ashara", "grieving", "Ashara: her neutral face is already angry"),
        ("thornwick", "startled", "Thornwick: an experiment gone wrong"), ("sera", "roaring", "Sera: the old guard")]
sections = [section(name, "", [fig(OFFICIAL / "cast" / f"bust_{b}.png", 2, "locked (x2)"),
                               fig(OUT / f"bust_{b}_{e}_v1.png", 2, f"{e} (x2)"),
                               fig(OFFICIAL / "cast" / f"bust_{b}.png", 6, "locked (x6)"),
                               fig(OUT / f"bust_{b}_{e}_v1.png", 6, f"{e} (x6)")]) for b, e, name in ROWS]
out = page("Draconia Expressions", "A second expression for each bust",
           "Only the brows, eyes and mouth change; everything else is the locked bust, checked pixel for pixel. "
           "One expression each, chosen for the character. The Hollow Knight has no face, by design &middot; "
           "2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
