"""Build the talking frames board. Run after src/make_talking.py. Output: board_v2.html (board.html is v1).

The faces v2 changed come first, v1 and v2 playing side by side. Then each face plays as it will in the
dialogue box: the face and its talking frame in turn (preview/*_talk_v2.gif), then both stills side by side.
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
sys.path.insert(0, str(HERE / "src"))
from boardkit import fig, gif_fig, page, section  # noqa: E402
from make_talking import VERSION, pairs  # noqa: E402

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
}


def gif(name, img, twin):
    path = HERE / "preview" / f"{name}.gif"
    img.save(path, save_all=True, append_images=[twin], duration=SWAP_MS, loop=0, disposal=2)
    return path


changed, by_bust = [], {}
for bid, face, img, twin, stem in pairs():
    by_bust.setdefault(bid, []).append((face, img, twin))
    v1 = Image.open(HERE / "out" / f"{stem}_talk_v1.png").convert("RGBA")
    if v1.tobytes() != twin.tobytes():
        label = f"{NAMES[bid].split()[-1]}, {face}"
        changed.append(gif_fig(gif(f"{bid}_{face}_talk_v1", img, v1), 5, f"{label}: v1"))
        changed.append(gif_fig(gif(f"{bid}_{face}_talk_v{VERSION}", img, twin), 5, f"{label}: v2"))

sections = [section(f"Changed in v2 ({len(changed) // 2} faces)",
                    "Each pair: v1, then v2. A pale row above a dark one read as a mustache. Bared teeth now go dark "
                    "as the face speaks instead of opening dark under them, and an open mouth opens a row taller "
                    "instead of closing to a flat line beside its lip corners.", changed)]
for bid, faces in by_bust.items():
    figs = [gif_fig(gif(f"{bid}_{face}_talk_v{VERSION}", img, twin), 5, f"{face}, talking")
            for face, img, twin in faces]
    stills = [fig(im, 4, f"{face}{' talk' if k else ''}") for face, img, twin in faces for k, im in enumerate((img, twin))]
    sections.append(section(NAMES[bid], NOTES.get(bid, ""), figs))
    sections.append(section(f"{NAMES[bid]}: the frames", "", stills))

out = page("Talking Frames v2", "Talking frames for every face, v2",
           "A second frame for every face (70: ten busts, seven faces each), drawn on the locked busts with only "
           "the mouth changed. While a line types, the dialogue box shows the face and its talking frame in turn, "
           f"a swap every {SWAP_MS} ms, and rests on the face when the line is done. A shut mouth opens a row; a "
           "mouth already open (a gasp, a roar) opens a row taller; bared teeth go dark; a face with no mouth drawn "
           "opens a small one. &middot; 2026-10-28", sections)
(HERE / f"board_v{VERSION}.html").write_text(out, encoding="utf-8")
print(f"board_v{VERSION}.html: {len(out) // 1024} KB, {len(changed) // 2} changed")
