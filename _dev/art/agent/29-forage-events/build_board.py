"""Build the Batch 7 review board: the granary's five stages, the Forage orb, the food events and the
warning, and the seven banners, each on a rough mock of where it shows. Run after
src/make_events.py. Output: board.html.
"""
import html
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, page, section, uri  # noqa: E402

OUT = HERE / "out"
EVENTS = HERE.parents[1] / "official" / "events"


def img(name):
    path = OUT / f"{name}.png"
    return Image.open(path if path.exists() else EVENTS / f"{name}.png").convert("RGBA")


def tag(name, scale, alt):
    i = img(name)
    return f'<img src="{uri(i)}" width="{i.width * scale}" height="{i.height * scale}" alt="{html.escape(alt)}">'


CSS = """
  .orb { width: 132px; height: 132px; border-radius: 50%; display: grid; place-items: center;
    background: radial-gradient(circle at 35% 30%, #463a5a, #281e32 70%); border: 3px solid var(--gold); }
  .rows { display: grid; gap: 10px; width: min(100%, 460px); }
  .row { display: flex; gap: 12px; align-items: center; background: #1c1524; border: 1px solid var(--line);
    padding: 8px 12px; }
  .row b { color: var(--gold); font-family: Cinzel, Georgia, serif; font-weight: 600; }
  .row p { font-size: .85rem; color: var(--muted); }
  .chip { display: inline-flex; gap: 8px; align-items: center; background: #1c1524; padding: 6px 12px;
    border: 1px solid #8a2a58; border-radius: 999px; font-size: .85rem; }
  .sheet { width: 440px; max-width: 100%; background: #1c1524; border: 1px solid var(--line); display: grid; }
  .sheet img { width: 100%; height: auto; image-rendering: pixelated; display: block; }
  .sheet div { padding: 10px 14px 14px; display: grid; gap: 4px; }
  .sheet b { color: var(--gold); font-family: Cinzel, Georgia, serif; font-weight: 600; font-size: 1.05rem; }
  .sheet p { font-size: .85rem; color: var(--muted); }
"""

granary = [fig(img(f"evt_granary_{n}"), 6, f"{n}%" + (" (new)" if n in (25, 75) else " (locked)"))
           for n in (0, 25, 50, 75, 100)]
orb = (f'<figure><div class="orb">{tag("evt_forage-action", 4, "Basket and sheaf")}</div>'
       '<figcaption>In the FORAGE orb (x4)</figcaption></figure>'
       + fig(img("evt_forage-action"), 6, "Basket and sheaf (x6)"))
FOOD = [("evt_food-bountiful", "A Bountiful Harvest", "The fields gave more than expected."),
        ("evt_food-lean", "A Lean Season", "The foragers came back light."),
        ("evt_food-raid", "Raiders at the Stores", "Sacks slashed in the night, grain on the ground."),
        ("evt_food-refugees", "More Mouths", "Refugees share the stores now.")]
food = [fig(img(n), 6, t) for n, t, _ in FOOD]
food.append('<div class="rows">' + "".join(
    f'<div class="row">{tag(n, 2, t)}<div><b>{html.escape(t)}</b><p>{html.escape(line)}</p></div></div>'
    for n, t, line in FOOD) + "</div>")
warn = [fig(img("evt_food-warning"), 8, "Starvation warning (x8)"),
        f'<figure><span class="chip">{tag("evt_food-warning", 2, "Warning")} Food runs out in 2h</span>'
        '<figcaption>In a warning chip (x2)</figcaption></figure>']
BANNERS = [("evt_exp-light", "A Light in the Dark", "A lit window on a far ridge: someone is out there."),
           ("evt_exp-find", "A Lucky Find", "A chest half-buried in the sand, a glint of gold."),
           ("evt_exp-survivors", "Survivors Spotted", "A smoke signal, a ragged flag, people waving by a fire."),
           ("evt_exp-silent", "The Wasteland Was Silent", "Gray sky, a dead tree, old bones. Nothing else."),
           ("evt_welcome-back", "Welcome Back", "Dawn over the wall: the sun rising behind the gate."),
           ("evt_breach-report", "The Breach", "The broken gate at dawn, smoke rising, rubble below."),
           ("evt_refugees", "Refugees Approach", "A group on the road to the gate: a veteran, a traveler, a "
                                                 "child, a walker.")]
banners = [f'<figure><div class="sheet">{tag(n, 4, t)}<div><b>{html.escape(t)}</b><p>{html.escape(line)}</p>'
           f'</div></div><figcaption>On a report sheet (x4)</figcaption></figure>' for n, t, line in BANNERS]

sections = [
    section("The granary, five stages (x6)",
            "25 and 75 drawn from the same code as the locked three: grain in the doorway and sacks out front, "
            "the building unchanged.", granary),
    section("The Forage orb", "A woven basket with a wheat sheaf, every ear on its own.", orb),
    section("Food events (x6, and x2 in a list)",
            "One badge per food event: an overflowing basket with an apple and a loaf, a slumped near-empty sack, "
            "a slashed sack spilling grain with the dagger still in it, and three hooded refugees. Titles here are "
            "placeholders; the game's own text stays.", food),
    section("Starvation warning",
            "An empty bowl under a warning mark. The mark is red, the one place in this batch that uses it: a "
            "starving town is danger.", warn),
    section("Banners (110x34)",
            "Flat color bands and clusters, no dither. Welcome Back, the Breach and Refugees use the Warfront's "
            "own wall and gate, cropped from the locked art, so the walls match the battle screen.", banners),
]
out = page("Draconia Forage Events", "Batch 7: Forage and events",
           "The Forage screen's pieces and the art for events and reports &middot; 2026-10-27", sections, CSS)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
