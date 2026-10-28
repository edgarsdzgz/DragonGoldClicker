"""Build the talking frames board. Run after src/make_talking.py. Output: board_v3.html (board_v2.html and
board.html are the earlier rounds).

The faces this round changed come first, the last round and this one playing side by side, then the alternative
yell for the angry faces. Then each face plays as it will in the
dialogue box: the face and its talking frame in turn (preview/*_talk_v3.gif), then both stills side by side.
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
sys.path.insert(0, str(HERE / "src"))
from boardkit import fig, gif_fig, page, section  # noqa: E402
from make_talking import MOUTH, OFFICIAL, VERSION, pairs, talk_mouth  # noqa: E402

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


PREV = VERSION - 1
changed, wide, by_bust = [], [], {}
for bid, face, img, twin, stem in pairs():
    by_bust.setdefault(bid, []).append((face, img, twin))
    label = f"{NAMES[bid].split()[-1]}, {face}"
    old_face = Image.open(OFFICIAL / f"{stem}.png").convert("RGBA")
    prev = Image.open(HERE / "out" / f"{stem}_talk_v{PREV}.png").convert("RGBA")
    if prev.tobytes() != twin.tobytes() or old_face.tobytes() != img.tobytes():
        changed.append(gif_fig(gif(f"{bid}_{face}_talk_v{PREV}", old_face, prev), 5, f"{label}: v{PREV}"))
        changed.append(gif_fig(gif(f"{bid}_{face}_talk_v{VERSION}", img, twin), 5, f"{label}: v{VERSION}"))
    if bid in MOUTH:
        alt = talk_mouth(img, Image.open(OFFICIAL / f"bust_{bid}.png").convert("RGBA"), MOUTH[bid], wide_yell=True)
        if alt.tobytes() != twin.tobytes():
            wide.append(gif_fig(gif(f"{bid}_{face}_talk_v{VERSION}_wide", img, alt), 5, f"{label}: wide"))

sections = [section(f"Changed in v{VERSION} ({len(changed) // 2} faces)",
                    f"Each pair: v{PREV}, then v{VERSION}. Angry: the teeth go dark and the mouth opens a row down "
                    "under them, like the alarmed gasp but wider, a yell. Two alarmed faces are redrawn (v2, not "
                    "locked yet): Mirael without the lip corners beside her gasp (42-expressions), and Sera with a "
                    "row of snout between her nose and her gasp (50-expressions-set).", changed),
            section("The other way: a wide yell", "The corners open too, a full-width mouth. Not the choice: on "
                    "Kael and Rodain the dark block starts to read as a mustache again.", wide)]
for bid, faces in by_bust.items():
    figs = [gif_fig(gif(f"{bid}_{face}_talk_v{VERSION}", img, twin), 5, f"{face}, talking")
            for face, img, twin in faces]
    stills = [fig(im, 4, f"{face}{' talk' if k else ''}") for face, img, twin in faces for k, im in enumerate((img, twin))]
    sections.append(section(NAMES[bid], NOTES.get(bid, ""), figs))
    sections.append(section(f"{NAMES[bid]}: the frames", "", stills))

out = page(f"Talking Frames v{VERSION}", f"Talking frames for every face, v{VERSION}",
           "A second frame for every face (70: ten busts, seven faces each), drawn on the locked busts with only "
           "the mouth changed. While a line types, the dialogue box shows the face and its talking frame in turn, "
           f"a swap every {SWAP_MS} ms, and rests on the face when the line is done. A shut mouth opens a row; a "
           "mouth already open (a gasp, a roar) opens a row taller; bared teeth go dark and open into a yell; a face with no mouth drawn "
           "opens a small one. &middot; 2026-10-28", sections)
(HERE / f"board_v{VERSION}.html").write_text(out, encoding="utf-8")
print(f"board_v{VERSION}.html: {len(out) // 1024} KB, {len(changed) // 2} changed")
