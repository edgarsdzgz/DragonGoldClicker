"""Build the sound effects board: a player for each sound. Run after src/make_sound.py. Output: board.html."""
import base64
import html
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import page, section  # noqa: E402

OUT = HERE / "out"
BEATS = json.loads((OUT / "splash_beats.json").read_text())


def player(name, caption):
    data = base64.b64encode((OUT / f"{name}.m4a").read_bytes()).decode()
    return (f'<figure class="snd"><audio controls preload="none" src="data:audio/mp4;base64,{data}"></audio>'
            f'<figcaption><b>{html.escape(name)}</b><br>{html.escape(caption)}</figcaption></figure>')


def at(beat):
    return f"at {BEATS[beat]:.2f} s"


sections = [
    section("The studio splash, whole", "Every beat below, placed on the splash's own frame timing. Play it "
            "while watching the seal to judge the fit.", [player("splash_full", "7.7 s, slam to smash")]),
    section("The studio splash, beat by beat", "Each starts on its beat's first frame (seal_build_timing.json).", [
        player("splash_slam", f"the plates slam together, {at('slam')}"),
        player("splash_medallion-top", f"a medallion settles, {at('medallion_top')}"),
        player("splash_medallion-left", f"a step higher, {at('medallion_left')}"),
        player("splash_medallion-right", f"a step higher again, {at('medallion_right')}"),
        player("splash_etch", f"runes etched in blue, {at('etch')} until the slash"),
        player("splash_slash", f"the name cut in gold, {at('slash')}"),
        player("splash_spread", f"gold runs out from the cut, {at('spread')}"),
        player("splash_smash", f"the seal smashes to gold, {at('smash')}"),
    ]),
    section("The Warfront and the city", "", [
        player("sfx_monster-death", "on the death strip: squash, fall, the thud as it lands (250 ms), "
               "glints as it is unmade (375 ms)"),
        player("sfx_wall-hit", "a monster strikes the wall"),
        player("sfx_breach", "the wall falls"),
        player("sfx_build-complete", "three hammer taps and a warm chord"),
        player("sfx_heartstone", "the heartstone's soft pulse"),
    ]),
]

css = """  .snd { justify-items: start; width: 300px; }
  .snd audio { width: 100%; }
  .snd figcaption { text-align: left; max-width: none; }"""
out = page("Draconia Sound Effects", "Sound effects",
           "Sounds for what the app has no sound for yet. Synthesized from oscillators and noise in Python (no "
           "samples, no generators), timed to the locked art. Each is also saved as .m4a, the format "
           "assets/music/out uses &middot; 2026-10-27", sections, css)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
