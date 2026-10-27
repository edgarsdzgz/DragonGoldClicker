"""Build the interior headers board. Run after src/make_interiors.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, page, section  # noqa: E402

OUT = HERE / "out"
ROOMS = [
    ("keep", "Draconia Keep", "The throne hall: blue banners, the throne at the end of a runner, torches, night windows."),
    ("lodge", "Ranger's Lodge", "Plank walls, a rack of bows, a stretched pelt, antlers, a quiver on the table, a bedroll."),
    ("outpost", "Explorer's Outpost", "The big map pinned up with its dashed route, the planning table, a lantern, a chest, a waymarker."),
    ("librarium", "Librarium", "Two tall shelves of books, a reading desk with an open tome and a candle."),
    ("forge", "The Forge", "The hearth burning, tools on the wall, the anvil with a hot blade, the quench barrel."),
    ("garrison", "Garrison", "A spear rack, shields on the wall, a straw training dummy, a bench, a torch."),
    ("housing", "Housing", "A hearth with its pot, a window with flowers, a table with bread and a cup, a bed under a quilt."),
    ("tower", "Wall towers (east and west)", "Arrow slits, stairs up the wall, a barrel of arrows, a crate of stones."),
    ("wizard-tower", "Wizard's Tower", "A star chart, shelves of jars, the cauldron glowing teal, a telescope."),
]

sections = [section(name, note, [fig(OUT / f"int_{rid}_v1.png", 3, "x3")]) for rid, name, note in ROOMS]

out = page("Draconia Interiors", "Building interior headers",
           "A picture at the top of each building's screen. 110x34, the event banners' size and look: flat "
           "bands and clusters, no dither, props outlined in ink. The two wall towers share one &middot; "
           "2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
