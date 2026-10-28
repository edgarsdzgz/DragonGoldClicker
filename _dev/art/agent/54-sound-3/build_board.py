"""Build the sound batch 3 board: a player for each sound. Run after src/make_sound.py. Output: board.html."""
import base64
import html
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import page, section  # noqa: E402

OUT = HERE / "out"
# Batch 2's rally horn and monster death, to hear the new ones beside what is already locked
LOCKED = HERE.parents[2] / "art" / "official" / "sound"


def player(path, name, caption):
    data = base64.b64encode(path.read_bytes()).decode()
    return (f'<figure class="snd"><audio controls preload="none" src="data:audio/mp4;base64,{data}"></audio>'
            f'<figcaption><b>{html.escape(name)}</b><br>{html.escape(caption)}</figcaption></figure>')


def new(name, caption):
    return player(OUT / f"{name}.m4a", name, caption)


GROUPS = [
    ("Bosses", "Every boss and mini-boss closes a level of the horde. Monsters still get no voices: the horde "
     "speaks through its war horn and drums.", [
        new("sfx_boss-arrives", "a boss reaches the gate: two drums, the war horn's long low call (out of tune "
            "on purpose), a third drum"),
        new("sfx_miniboss-arrives", "a mini-boss reaches the gate: one drum, one shorter blast"),
        new("sfx_boss-falls", "a boss or mini-boss falls, on its death strip: it lands hard at 250 ms, is "
            "unmade at 375 ms, then Draconia's horn answers"),
    ]),
    ("Varn", "He breathes every 3 seconds once he is on the wall, so this one is soft and short.", [
        new("sfx_varn-breath", "Varn's breath: a quick draw of air while he rears, then a burst of flame"),
    ]),
    ("The claws", "In place of the stock coin the claws use today.", [
        new("sfx_claw-sharpen", "sharpening: two whetstone strokes, the second higher, then the edge rings"),
        new("sfx_claw-reforge", "reforging: three blows on the anvil, the quench's hiss, an ember's glow"),
    ]),
]
REFERENCE = [
    (LOCKED / "sfx_rally.m4a", "sfx_rally (locked)", "the rally horn the boss's fall answers with"),
    (LOCKED / "sfx_monster-death.m4a", "sfx_monster-death (locked)", "an ordinary monster's death"),
    (LOCKED / "sfx_slash-ember.m4a", "sfx_slash-ember (locked)", "the ember claws, the nearest fire to Varn's"),
]

sections = [section(title, note, items) for title, note, items in GROUPS]
sections.append(section("For comparison", "Locked sounds the new ones sit beside.",
                        [player(p, n, c) for p, n, c in REFERENCE if p.exists()]))

css = """  .snd { justify-items: start; width: 300px; }
  .snd audio { width: 100%; }
  .snd figcaption { text-align: left; max-width: none; }"""
out = page("Draconia Sounds 3", "Sound effects, batch 3",
           "The moments still silent: bosses at the gate and falling, Varn's breath, sharpening and "
           "reforging the claws. Synthesized in Python like batches 1 and 2. No monster voices, by the "
           "owner's ruling &middot; 2026-10-28", sections, css)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
