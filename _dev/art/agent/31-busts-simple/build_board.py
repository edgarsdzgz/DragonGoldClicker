"""Build the simpler-busts v3 board (board_v3.html): each character as v1, v2 and v3 at the same size, Kael's
between-version at its own 44x46, and the v3 busts on the dialogue tag with the locked sigils. The v2 board
is kept as board.html and board_v2.html. Run after src/make_busts.py.
"""
import html
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import page, section, uri  # noqa: E402

OUT = HERE / "out"
REF = HERE.parents[1] / "reference"
CAST = HERE.parents[1] / "official" / "cast"
CHARS = [("pyreth", "Elder Pyreth", "Pupils in his eyes; shading on the head, horns, beard and robe."),
         ("rodain", "Captain Rodain", "The scar back, straight down through his eye; the sash two pixels "
                                      "to the right and a pixel thicker; shading on the head, plates and leather."),
         ("mirael", "Scout Mirael", "Her freckles back, the compass kept on her shirt; shading on the hair, "
                                    "face and cloak."),
         ("kael", "Kael Ironwright", "Two takes: the 22x23 drawing with shading, and a new render between v1 "
                                     "and v2 (last): v1 at its own size, snapped to the palette and cleaned, "
                                     "the headband rust."),
         ("lirae", "Lirae the Ink-Wing", "Wings with a claw at each tip, a lit wing bone, membrane folds and a "
                                         "scalloped edge; the tome with lines of writing on both pages, a shaded "
                                         "gutter and a gold ribbon. Her blue kept, with only a darker edge.")]
CSS = """
  .row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
  .row img, .tag img, .speaker > img { image-rendering: pixelated; }
  .speaker { display: grid; justify-items: start; }
  .speaker > img { margin-left: 12px; }
  .tag { background: #12090f; padding: 3px; margin-top: -10px; position: relative; }
  .tag span { display: flex; align-items: center; gap: 8px; padding: 6px 14px 6px 10px;
    background: linear-gradient(#a8401e, #6e2412); box-shadow: inset 0 2px 0 #f0a060;
    font-family: Cinzel, Georgia, serif; font-weight: 600; font-size: 14px; letter-spacing: 1px;
    color: #fff0d0; text-transform: uppercase; white-space: nowrap; }
"""


def png(path, slot, alt):
    """At 3x the 44x46 slot: a 22x23 drawing at x6, a 44x46 one at x3."""
    i = Image.open(path).convert("RGBA")
    s = slot * 44 // i.width
    return f'<img src="{uri(i)}" width="{i.width * s}" height="{i.height * s}" alt="{html.escape(alt)}">'


def sigil(cid):
    """The locked sigil at x2, as on the dialogue tag."""
    i = Image.open(CAST / f"cast_sigil-{cid}.png").convert("RGBA")
    return f'<img src="{uri(i)}" width="{i.width * 2}" height="{i.height * 2}" alt="">'


def labeled(path, label):
    return f'<figure>{png(path, 3, label)}<figcaption>{html.escape(label)}</figcaption></figure>'


sections = []
for cid, name, note in CHARS:
    figs = [labeled(REF / f"bust-{cid}.png", "v1"), labeled(OUT / f"bust_{cid}_v2.png", "v2"),
            labeled(OUT / f"bust_{cid}_v3.png", "v3")]
    if cid == "kael":
        figs.append(labeled(OUT / "bust_kael-full_v3.png", "v3, between v1 and v2"))
    sections.append(section(name, html.escape(note), [f'<div class="row">{"".join(figs)}</div>']))

tags = []
for cid, name, _ in CHARS:
    for path in [OUT / f"bust_{cid}_v3.png"] + ([OUT / "bust_kael-full_v3.png"] if cid == "kael" else []):
        tags.append(f'<figure><div class="speaker">{png(path, 2, name)}<div class="tag"><span>'
                    f'{sigil(cid)}{html.escape(name)}</span></div></div></figure>')
sections.append(section("v3 on the dialogue tag", "", tags))

out = page("Draconia Busts v3", "Simpler busts, v3",
           "Your notes on v2, with v1 and v2 beside each for comparison. Light from the upper left: lighter "
           "left and top edges, a darker right edge. The v1 busts stay as they are &middot; 2026-10-27",
           sections, CSS)
(HERE / "board_v3.html").write_text(out, encoding="utf-8")
print(f"board_v3.html: {len(out) // 1024} KB")
