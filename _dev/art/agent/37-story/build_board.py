"""Build the story illustrations board. Run after src/make_story.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, page, section  # noqa: E402

OUT = HERE / "out"

sections = [
    section("The prologue: The Walls of Draconia", "\"My lord, the monsters have reached the walls.\" The blood "
            "moon, the horde's fires along the ridge, the horde far off on the road, the nearer ranks, and the "
            "first of them at the wall.", [fig(OUT / "story_prologue_v1.png", 3, "x3, about full width")]),
    section("The Breach: The Wall Falls", "The sky burning, smoke rising, the wall broken open and the horde "
            "pouring through the gap. Uses the locked breached gate, so the gap is the one the Warfront shows.",
            [fig(OUT / "story_breach_v1.png", 3, "x3, about full width")]),
]

out = page("Draconia Story Pictures", "Story illustrations",
           "The two optional full pictures: the prologue and the Breach. 130x96, the map's width, in the event "
           "banners' look. Built around the locked art: the gate states and every monster's idle pose, with "
           "the far horde as half-size shapes &middot; 2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
