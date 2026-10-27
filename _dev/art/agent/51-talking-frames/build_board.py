"""Build the talking frames board. Run after src/make_talking.py. Output: board.html.

Each face plays as it will in the dialogue box: the face and its talking frame in turn (preview/*_talk.gif),
then both stills side by side.
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402
from sheet import rows  # noqa: E402

# The swap the dialogue box would use: a new frame every 4 letters (a letter types every 28 ms)
SWAP_MS = 112
NAMES = {"pyreth": "Elder Pyreth", "rodain": "Captain Rodain", "mirael": "Scout Mirael", "kael": "Kael Ironwright",
         "lirae": "Lirae the Ink-Wing", "varn": "Varn", "ashara": "Ashara", "thornwick": "Thornwick",
         "sera": "Sera", "hollow-knight": "The Hollow Knight"}
NOTES = {
    "pyreth": "His mouth is hidden in the snout until he speaks; then a small dark mouth opens above the beard.",
    "ashara": "Her mouth is a furnace: speaking, it grows a row taller, or burns a step hotter where it is already "
              "thrown open.",
    "hollow-knight": "No mouth, by design. Its light flickers as it speaks: a glow around the light goes out, or comes "
                     "up around a bare one. The empty neutral slit shows a dim light.",
    "sera": "Her roar (determined) and her gasp close a little between words; every other face opens.",
}

sections = []
for bid, faces in rows():
    figs = []
    for face, img, twin in faces:
        gif = HERE / "preview" / f"{bid}_{face}_talk.gif"
        img.save(gif, save_all=True, append_images=[twin], duration=SWAP_MS, loop=0, disposal=2)
        figs.append(gif_fig(gif, 5, f"{face}, talking"))
    stills = [fig(im, 4, f"{face}{' talk' if k else ''}") for face, img, twin in faces for k, im in enumerate((img, twin))]
    sections.append(section(NAMES[bid], NOTES.get(bid, ""), figs))
    sections.append(section(f"{NAMES[bid]}: the frames", "", stills))

out = page("Talking Frames", "Talking frames for every face",
           "A second frame for every face (70: ten busts, seven faces each), drawn on the locked busts with only "
           "the mouth changed. While a line types, the dialogue box shows the face and its talking frame in turn, "
           f"a swap every {SWAP_MS} ms, and rests on the face when the line is done. A shut mouth opens a row; a "
           "mouth already open (a gasp, a roar) closes a row; a face with no mouth drawn opens a small one. "
           "&middot; 2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
