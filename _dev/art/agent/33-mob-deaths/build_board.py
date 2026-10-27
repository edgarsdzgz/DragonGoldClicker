"""Build the monster deaths board: every monster's death at each Unmaking tier, playing, and its four frames.
Run after src/make_deaths.py. Output: board.html.
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
MOBS = [("kobold", "Kobold"), ("goblin", "Goblin"), ("crawler", "Shadow Crawler"), ("orc", "Orc"),
        ("raider", "Raider")]
TIERS = [("", "weak"), ("-strong", "strong"), ("-stronger", "stronger")]

sections = []
for mid, name in MOBS:
    figs = [gif_fig(PREVIEW / f"mob_{mid}{t}_death.gif", 1, f"{label} (x6)") for t, label in TIERS]
    strip = Image.open(OUT / f"mob_{mid}_death_strip4.png").convert("RGBA")
    w = strip.width // 4
    figs += [fig(strip.crop((i * w, 0, (i + 1) * w, strip.height)), 5, cap)
             for i, cap in enumerate(("1: knees buckle", "2: falling", "3: lands, dust", "4: unmade"))]
    note = ("It flips onto its back, legs up, instead of falling sideways." if mid == "crawler" else "")
    sections.append(section(name, note, figs))

out = page("Draconia Monster Deaths", "Monster deaths",
           "So a kill reads as a kill, not a heal: each monster buckles, falls, lands in a puff of dust, and is "
           "unmade, dimming as the Unmaking's purple rises off it. Built from each monster's own hurt pose at "
           "every tier, so the cracks carry through. 4 frames at 8 fps; the game holds the last, blinks it "
           "out, and the next monster walks up &middot; 2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
