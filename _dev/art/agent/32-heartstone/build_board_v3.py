"""Build the heartstone v3 board (board_v3.html): the teardrop with a flickering flame, at 12x12 and 16x16,
beside v2's glowing pulse, among the icons and on an item card. Run after src/make_flicker.py.
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section, uri  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
ICONS = HERE.parents[1] / "official" / "icons"
CSS = """
  .icons { display: flex; gap: 10px; align-items: center; background: #1c1524; padding: 8px 12px;
    border: 1px solid var(--line); }
  .icons img, .card img { image-rendering: pixelated; }
  .card { display: flex; gap: 14px; align-items: center; width: 340px; max-width: 100%; background: #1c1524;
    border: 1px solid var(--line); padding: 12px 14px; }
  .card b { color: var(--gold); font-family: Cinzel, Georgia, serif; font-weight: 600; }
  .card p { font-size: .85rem; color: var(--muted); }
"""


def tag(path, scale):
    i = Image.open(path).convert("RGBA")
    return f'<img src="{uri(i)}" width="{i.width * scale}" height="{i.height * scale}" alt="">'


def gif_tag(path, scale):
    """A GIF from the x8 previews, shown at `scale` times its art size."""
    import base64
    g = Image.open(path)
    w, h = g.width // 8 * scale, g.height // 8 * scale
    return f'<img src="data:image/gif;base64,{base64.b64encode(path.read_bytes()).decode()}" width="{w}" height="{h}" alt="">'


flick12 = PREVIEW / "icon_heartstone-teardrop-flame_12_flicker.gif"
flick16 = PREVIEW / "icon_heartstone-teardrop-flame_16_flicker.gif"
row = "".join(tag(ICONS / f"icon_{n}.png", 4) for n in ("flame", "shield", "star")) + gif_tag(flick12, 4) + \
    "".join(tag(ICONS / f"icon_{n}.png", 4) for n in ("scroll", "compass"))
card = (f'<div class="card">{gif_tag(flick16, 4)}<div><b>The Heartstone</b><p>A drop of your heart-flame in '
        f'aetherglass, still burning. Not a weapon: a heart.</p></div></div>')

sections = [
    section("The flicker (x8)", "Four flame shapes: at rest, leaning left, ducked low and wide, leaning right, "
            "held for uneven times (140, 90, 160, 110 ms) so it never settles into a beat. The glass beside the "
            "flame takes its light.",
            [gif_fig(flick16, 1, "16x16"), gif_fig(flick12, 1, "12x12"),
             fig(OUT / "icon_heartstone-teardrop-flame_16.png", 8, "16x16, still"),
             fig(OUT / "icon_heartstone-teardrop-flame_12.png", 8, "12x12, still")]),
    section("At game size", "", [
        f'<figure><div class="icons">{row}</div><figcaption>Among the icons (12x12, x4)</figcaption></figure>',
        f'<figure>{card}<figcaption>On an item card (16x16, x4)</figcaption></figure>']),
    section("Beside v2's glowing pulse (x8)", "",
            [gif_fig(flick16, 1, "v3: the flame, flickering"),
             gif_fig(PREVIEW / "icon_heartstone-teardrop_16_pulse.gif", 1, "v2: the glow, pulsing")]),
]
out = page("Draconia Heartstone v3", "The heartstone, v3",
           "The teardrop with its flame back, flickering. v1 (the still flames) and v2 (the glowing pulse) are "
           "kept &middot; 2026-10-27", sections, CSS)
(HERE / "board_v3.html").write_text(out, encoding="utf-8")
print(f"board_v3.html: {len(out) // 1024} KB")
