"""Build the city light levels board. Run after src/make_light.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, page, section  # noqa: E402

PREVIEW = HERE / "preview"
LEVELS = [("night", "Night"), ("dusk", "Dusk"), ("lit", "Lit (the locked art)")]

sections = [
    section("A city in ruins", "Every plot ruined or bare, at each level. At night only fire and the brightest "
            "gold keep their light, so a ruined city goes dark.",
            [fig(PREVIEW / f"city_{lv}_ruin.png", 1, f"{name}, ruined (x2)") for lv, name in LEVELS]),
    section("A city restored", "Every plot built. The lit windows, the forge and the torches stay bright at "
            "night: the rebuilt city glows.",
            [fig(PREVIEW / f"city_{lv}_built.png", 1, f"{name}, restored (x2)") for lv, name in LEVELS]),
    section("How the game could choose", "My suggestion, for the code: the light follows how much of the city "
            "is restored. Night while fewer than a third of the plots are built, dusk below two thirds, lit "
            "after that. Each piece the city screen draws has a _night and a _dusk file (46 pieces, 92 files), "
            "so the switch is a choice of file, with no color filter at run time.", []),
]

out = page("Draconia City Light", "City light levels",
           "The city brightens as I rebuild it: night, dusk, lit. Built from the locked city map, plot pieces "
           "and buildings with the toolkit's night and dusk light maps (Batch 2), never redrawn &middot; "
           "2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
