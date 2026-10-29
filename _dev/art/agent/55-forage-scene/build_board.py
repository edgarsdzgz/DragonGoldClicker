"""Build the batch 55 review board: the Forage valley backdrop, two layouts, each lit, at dusk and at
night, beside the Warfront and city backdrops it must match. Run after src/make_forage.py. Output: board.html.
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parents[0] / "00-foundation"))
from boardkit import fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
AGENT = HERE.parents[0]

sections = []
for key, name, note in [
    ("a", "A: from the back gate",
     "Looking out of Draconia's small back gate, down the valley. The city's back wall and the open postern sit at "
     "the bottom. It frames the city's own look (the Draconia tab has the same wall and gate), but the wall is bright "
     "under the command row and the bridge is hard to read."),
    ("b", "B: down in the valley",
     "River and meadow in front, forest on both sides, the gatherers' hut, the farms the horde passed by, the old "
     "mines in the hillside, and the city small on the ridge. The quiet foreground keeps the orbs readable. The "
     "builder's pick. The city, mines and fields sit under the granary panel, so they are partly covered."),
]:
    base = f"map_forage_base_{key}"
    sections.append(section(name, note, [
        fig(OUT / f"{base}.png", 2, "Lit"),
        fig(OUT / f"{base}_dusk.png", 2, "Dusk"),
        fig(OUT / f"{base}_night.png", 2, "Night"),
        fig(PREVIEW / f"{base}_ui_x3.png", 1, "Under the Forage screen (gray boxes = the interface)"),
    ]))

sections.append(section(
    "It must match", "The Warfront and Draconia backdrops, at the same scale.",
    [fig(AGENT / "21-warfront" / "out" / "map_warfront_base.png", 2, "Warfront"),
     fig(AGENT / "19-city" / "out" / "map_city_base.png", 2, "Draconia")]))

sections.append(section(
    "Questions", "1. A or B (or parts of both)? 2. Is the water too saturated next to the muted city? "
    "3. Should the far city show warm window dots at dusk and night? 4. Should the scene follow the city's light "
    "level (night, dusk, lit) as Draconia does?", []))

(HERE / "board.html").write_text(page(
    "Forage Valley v1", "The Forage valley: backdrop v1",
    "Batch 55, 2026-10-29. Each image is 130x282 native, shown at x2. Dusk and night come from the same "
    "palette swap as the city's light levels.", sections), encoding="utf-8")
print("board.html written")
