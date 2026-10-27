"""Build the expressions board. Run after src/make_expressions.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, page, section  # noqa: E402
from sheet import rows  # noqa: E402

NAMES = {"pyreth": "Elder Pyreth", "rodain": "Captain Rodain", "mirael": "Scout Mirael", "kael": "Kael Ironwright",
         "lirae": "Lirae the Ink-Wing", "varn": "Varn", "ashara": "Ashara", "thornwick": "Thornwick",
         "sera": "Sera", "hollow-knight": "The Hollow Knight"}
NOTES = {
    "ashara": "Her neutral face is already a scowl, so the feeling is in her brows and the furnace of her mouth: "
              "a smile of embers, the furnace thrown open in anger, banked low with worry, steady and hot when "
              "determined.",
    "lirae": "Spectacles and a beak: the feeling is in her eyes behind the lenses and the feather tufts above them.",
    "hollow-knight": "No face, by design: the helm stays empty. What it feels shows as a light inside the visor slit: "
                     "warm gold glad, cold blue grieving, fire angry, white alarmed, a dim teal worried, bright gold "
                     "determined.",
    "thornwick": "His wry brows (one cocked) are evened out for every other face.",
    "varn": "His determined face is the locked fierce one.",
    "sera": "Her determined face is the locked roaring one.",
}
FACES = ["neutral", "happy", "grieving", "angry", "alarmed", "worried", "determined"]

sections = []
for bid, imgs in rows():
    figs = [fig(im, 5, f"{face}{' (locked)' if locked else ''}") for face, (im, locked) in zip(FACES, imgs)]
    sections.append(section(NAMES[bid], NOTES.get(bid, ""), figs))

out = page("Bust Expressions", "Every bust, every face",
           "The standard set for every character: neutral, happy, grieving, angry, alarmed, worried, determined. "
           "Drawn on the locked busts, changing only brows, eyes and mouth (each redrawn neutral face is checked "
           "against the locked file). Faces already locked fill their slots and say so. 51 new faces. "
           "&middot; 2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
