"""Build the story scenes board. Run after src/make_scenes.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
OFFICIAL = HERE.parents[1] / "official"

SCENES = [
    ("elder-approaches", "The Elder Approaches", "The ruined city at night; a lantern comes up the road to the Keep."),
    ("renown", "Renown", "The people of Draconia on the wall, the fallen before the Gate."),
    ("wall-holds", "The Wall Holds", "Fighters along the wall; four monsters down."),
    ("wall-shakes", "The Wall Shakes", "The horde strikes the cracking wall; Rodain's company takes it."),
    ("young-claws", "Young Claws", "An orc shrugs off a plain slash."),
    ("wall-is-yours", "The Wall Is Yours", "The wall mended at dusk, menders at work."),
    ("stores-run-low", "Our Stores Run Low", "A near-empty granary, the meal bell, the small gate to the valley."),
    ("stranger", "A Stranger on the Road", "A lone traveler at dusk; a ranger watches from the wall."),
    ("city-not-a-wall", "A City, Not a Wall", "The first scaffold and foundation on the plots."),
    ("forge-is-cold", "The Forge Is Cold", "The forge's ruin at night; the smith come to look."),
    ("beyond-the-walls", "Beyond the Walls", "The old outpost in ruins; explorers setting out."),
    ("keep-restored", "The Keep Restored", "The Keep restored, its people before it."),
    ("rangers-lodge", "The Ranger's Lodge", "The lodge at the forest's edge: a gatherer, a trapper, a ranger."),
    ("ink-wing", "The Ink-Wing", "The Librarium at night, a light in its window."),
    ("dragonsteel", "Dragonsteel", "The forge blazing at night, sparks flying."),
    ("they-come-bigger", "They Come Bigger", "The Minotaur at the head of the deep Unmaking's monsters."),
    ("ancient-magic", "The Ancient Magic", "A pillar of light from the Keep; the horde flees."),
]
sections = [section(title, note, [fig(OUT / f"story_{sid}_v1.png", 3, "x3")]) for sid, title, note in SCENES]
out = page("Draconia Story Scenes", "Story illustrations for every scene",
           "The 17 scenes that had only a bust, in the locked prologue and Breach style: 130x96, built from locked "
           "art at its own scale. City scenes are windows of the real city map with each plot where the story has "
           "it. No dragon is drawn &middot; 2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
