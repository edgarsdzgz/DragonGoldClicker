"""Build the sound batch 2 board: a player for each sound. Run after src/make_sound.py. Output: board.html."""
import base64
import html
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import page, section  # noqa: E402

OUT = HERE / "out"


def player(name, caption, loop=False):
    data = base64.b64encode((OUT / f"{name}.m4a").read_bytes()).decode()
    attr = " loop" if loop else ""
    return (f'<figure class="snd"><audio controls{attr} preload="none" src="data:audio/mp4;base64,{data}"></audio>'
            f'<figcaption><b>{html.escape(name)}</b><br>{html.escape(caption)}</figcaption></figure>')


GROUPS = [
    ("The Warfront", "", [
        ("sfx_crit", "a critical hit: a harder cut, a heavy impact, a sparkle"),
        ("sfx_slash-ember", "the ember claws: a fire whoosh to lay over the strike"),
        ("sfx_walk-up", "the next monster's three footfalls, across the 350 ms walk-up"),
        ("sfx_gate-crack", "the wall cracks: a stone groan, a crack, grit falling"),
        ("sfx_unmaking-rise", "the Unmaking rises: a reversed shimmer, then a low, uneasy swell"),
        ("sfx_rally", "the rally horn: a call, then a higher, longer note"),
        ("sfx_mend", "mending the wall: chisel taps, then a mallet"),
    ]),
    ("The city", "", [
        ("sfx_build-start", "construction starts: saw strokes, two mallet knocks"),
        ("sfx_city-brightens", "the city brightens: a rising chime over a warm chord"),
        ("sfx_research-done", "research done: a page turns, two bright notes"),
        ("sfx_expedition-out", "an expedition leaves: a horn note, footsteps going away"),
        ("sfx_expedition-back", "an expedition returns: footsteps coming near, a two-note horn"),
        ("sfx_find", "a find: a chest creaks open, something glitters"),
        ("sfx_gate-knock", "someone at the gate: three knocks on heavy wood"),
    ]),
    ("Forage", "", [
        ("sfx_food-low", "food running low: a low bell, tolled twice"),
        ("sfx_food-raid", "a food raid: a quick alarm bell over a scuffle"),
        ("sfx_granary-full", "the granary is full: a sack thumps down, a pleased chime"),
    ]),
    ("Story", "", [
        ("sfx_scene-open", "a story scene opens: a parchment unrolls"),
        ("sfx_fanfare", "a quest done or Renown gained: horns up a major chord"),
        ("sfx_welcome-back", "welcome back: a soft dawn"),
        ("sfx_sting-sera", "Sera arrives: a shield bash, wood and iron"),
        ("sfx_sting-thornwick", "Thornwick arrives: a spark fizzes up and pops"),
        ("sfx_sting-hollow-knight", "the Hollow Knight arrives: one armored step, ringing as if the armor were empty"),
    ]),
]
LOOPS = [
    ("amb_torches", "the Warfront torches: a soft flame and its crackle"),
    ("amb_forge", "the forge: a deeper fire, the bellows breathing every few seconds"),
    ("amb_night-wind", "night wind, drifting"),
    ("amb_horde-drums", "the horde's drums far off, twelve beats at 90 a minute"),
]

sections = [section(title, note, [player(n, c) for n, c in items]) for title, note, items in GROUPS]
sections.append(section("Ambient loops", "8 seconds each, seamless: these players repeat, so listen for the "
                        "seam. Meant to play quietly behind a screen.", [player(n, c, True) for n, c in LOOPS]))

css = """  .snd { justify-items: start; width: 300px; }
  .snd audio { width: 100%; }
  .snd figcaption { text-align: left; max-width: none; }"""
out = page("Draconia Sounds 2", "Sound effects, batch 2",
           "The list locked in the todo: the Warfront, the city, forage, story, and four ambient loops. "
           "Synthesized in Python like batch 1, from oscillators and noise. No monster voices, by the "
           "owner's ruling &middot; 2026-10-27", sections, css)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
