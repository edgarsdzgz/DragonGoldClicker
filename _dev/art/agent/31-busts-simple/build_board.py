"""Build the simpler-busts board: v1 beside the simpler drawing at the same size, the simpler ones alone,
and on the dialogue tag with the locked sigils. Run after src/make_busts.py. Output: board.html.
"""
import html
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, page, section, uri  # noqa: E402

OUT = HERE / "out"
REF = HERE.parents[1] / "reference"
CAST = HERE.parents[1] / "official" / "cast"
NAMES = [("pyreth", "Elder Pyreth"), ("rodain", "Captain Rodain"), ("mirael", "Scout Mirael"),
         ("kael", "Kael Ironwright"), ("lirae", "Lirae the Ink-Wing")]
CSS = """
  .pair { display: flex; gap: 10px; align-items: flex-end; }
  .speaker { display: grid; justify-items: start; }
  .speaker > img { image-rendering: pixelated; margin-left: 12px; }
  .tag { background: #12090f; padding: 3px; margin-top: -10px; position: relative; }
  .tag span { display: flex; align-items: center; gap: 8px; padding: 6px 14px 6px 10px;
    background: linear-gradient(#a8401e, #6e2412); box-shadow: inset 0 2px 0 #f0a060;
    font-family: Cinzel, Georgia, serif; font-weight: 600; font-size: 14px; letter-spacing: 1px;
    color: #fff0d0; text-transform: uppercase; white-space: nowrap; }
  .tag img, .pair img { image-rendering: pixelated; }
"""


def png(path, scale, alt):
    i = Image.open(path).convert("RGBA")
    return f'<img src="{uri(i)}" width="{i.width * scale}" height="{i.height * scale}" alt="{html.escape(alt)}">'


pairs = [f'<figure><div class="pair">{png(REF / f"bust-{n}.png", 3, name + " v1")}'
         f'{png(OUT / f"bust_{n}_simple.png", 6, name + " simpler")}</div>'
         f'<figcaption>{html.escape(name)}: v1 | simpler</figcaption></figure>' for n, name in NAMES]
alone = [fig(OUT / f"bust_{n}_simple.png", 8, f"{name} (22x23, x8)") for n, name in NAMES]
tags = [f'<figure><div class="speaker">{png(OUT / f"bust_{n}_simple.png", 6, name)}<div class="tag"><span>'
        f'{png(CAST / f"cast_sigil-{n}.png", 2, "")}{html.escape(name)}</span></div></div>'
        f'<figcaption>On the dialogue tag</figcaption></figure>' for n, name in NAMES]
sections = [
    section("v1 beside the simpler drawing, same size", "Each simpler bust is drawn at half the resolution "
            "(22x23) and shown at double, so it fills the v1's slot with pixels twice as big: one flat color per "
            "part, two tones at most, small solid eyes, the game palette only. The v1 reds (Rodain's sash, Kael's "
            "headband) become rust, since red is kept for danger. Freckles, the scar and fine highlights are gone.",
            pairs),
    section("The simpler busts alone (x8)", "", alone),
    section("On the dialogue tag, with the locked sigils", "", tags),
]
out = page("Draconia Simpler Busts", "Simpler busts",
           "An option beside the v1 busts, which stay as they are &middot; 2026-10-27", sections, CSS)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
