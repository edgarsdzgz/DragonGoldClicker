"""Build the heartstone board: the four shapes at 12x12 and 16x16, each in a row of the locked icons at the
game's icon size, and on a rough item card. Run after src/make_heartstone.py. Output: board.html.
"""
import html
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section, uri  # noqa: E402

OUT = HERE / "out"
ICONS = HERE.parents[1] / "official" / "icons"
SHAPES = [("teardrop", "A: Teardrop", "A drop hanging point down from a gold cap."),
          ("round", "B: Round", "A round stone with gold filigree studs on its rim."),
          ("diamond", "C: Diamond", "A diamond-cut crystal on a gold point, like Pyreth's ember."),
          ("heart", "D: Heart", "A heart-shaped stone with a gold clasp between the lobes.")]
CSS = """
  .icons { display: flex; gap: 10px; align-items: center; background: #1c1524; padding: 8px 12px;
    border: 1px solid var(--line); }
  .icons img, .card img { image-rendering: pixelated; }
  .card { display: flex; gap: 14px; align-items: center; width: 340px; max-width: 100%; background: #1c1524;
    border: 1px solid var(--line); padding: 12px 14px; }
  .card b { color: var(--gold); font-family: Cinzel, Georgia, serif; font-weight: 600; }
  .card p { font-size: .85rem; color: var(--muted); }
"""


def img(path, scale):
    i = Image.open(path).convert("RGBA")
    return f'<img src="{uri(i)}" width="{i.width * scale}" height="{i.height * scale}" alt="">'


shapes = []
for sid, name, note in SHAPES:
    small, big = OUT / f"icon_heartstone-{sid}_12.png", OUT / f"icon_heartstone-{sid}_16.png"
    row = "".join(img(ICONS / f"icon_{n}.png", 4) for n in ("flame", "shield", "star")) + img(small, 4) + \
        "".join(img(ICONS / f"icon_{n}.png", 4) for n in ("scroll", "compass"))
    card = (f'<div class="card">{img(big, 4)}<div><b>The Heartstone</b><p>A drop of your heart-flame in '
            f'aetherglass, glowing. Not a weapon: a heart.</p></div></div>')
    shapes.append(section(name, html.escape(note), [
        fig(small, 8, "12x12 (x8)"), fig(big, 8, "16x16 (x8)"),
        gif_fig(HERE / "preview" / f"icon_heartstone-{sid}_16_pulse.gif", 1, "The pulse, 16x16 (x8)"),
        gif_fig(HERE / "preview" / f"icon_heartstone-{sid}_12_pulse.gif", 1, "The pulse, 12x12 (x8)"),
        f'<figure><div class="icons">{row}</div><figcaption>Among the icons (x4)</figcaption></figure>',
        f'<figure>{card}<figcaption>On an item card (16x16, x4)</figcaption></figure>']))

out = page("Draconia Heartstone", "The heartstone, v2",
           "From the lore's Arcana Pendants: a crystal of aetherglass holding a droplet of the wearer's "
           "heart-flame, in silver-gold filigree. “The Pendants we wear are not weapons, but hearts.” "
           "v2: the flame is now a glowing pulse, a white-gold core that swells and fades in 4 frames, like a "
           "heartbeat. Four shapes, each at the icon set's 12x12 and at 16x16. The v1 flame board is kept "
           "&middot; 2026-10-27", shapes, CSS)
(HERE / "board_v2.html").write_text(out, encoding="utf-8")
print(f"board_v2.html: {len(out) // 1024} KB")
