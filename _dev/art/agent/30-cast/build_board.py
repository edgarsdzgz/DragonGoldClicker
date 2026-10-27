"""Build the Batch 8 review board: each sigil large, then on a dialogue name tag beside its speaker's bust
(the mockup's tag: a dark frame, an ember-red plate, the sigil, the name), and the Gate of Draconia's
emblem in a bust's place. Run after src/make_cast.py. Output: board.html.
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

# (id, the game's speaker name, the sigil)
CAST = [("pyreth", "Elder Pyreth", "the ember"), ("rodain", "Captain Rodain", "crossed spears"),
        ("mirael", "Scout Mirael", "the compass star"), ("kael", "Kael Ironwright", "the anvil"),
        ("lirae", "Lirae the Ink-Wing", "the quill")]

CSS = """
  .speaker { display: grid; gap: 0; justify-items: start; }
  .speaker > img { image-rendering: pixelated; margin-left: 12px; }
  .tag { background: #12090f; padding: 3px; margin-top: -10px; position: relative; }
  .tag span { display: flex; align-items: center; gap: 8px; padding: 6px 14px 6px 10px;
    background: linear-gradient(#a8401e, #6e2412); box-shadow: inset 0 2px 0 #f0a060;
    font-family: Cinzel, Georgia, serif; font-weight: 600; font-size: 14px; letter-spacing: 1px;
    color: #fff0d0; text-transform: uppercase; white-space: nowrap; }
  .tag img { image-rendering: pixelated; }
"""


def png(path, scale, alt):
    i = Image.open(path).convert("RGBA")
    return f'<img src="{uri(i)}" width="{i.width * scale}" height="{i.height * scale}" alt="{html.escape(alt)}">'


def speaker(portrait, sigil, name):
    mark = png(sigil, 2, "") if sigil else ""
    return (f'<figure><div class="speaker">{png(portrait, 3, name)}'
            f'<div class="tag"><span>{mark}{html.escape(name)}</span></div></div>'
            f'<figcaption>On the dialogue tag (bust x3, sigil x2)</figcaption></figure>')


sigils = [fig(OUT / f"cast_sigil-{cid}.png", 8, f"{name}: {what}") for cid, name, what in CAST]
tags = [speaker(REF / f"bust-{cid}.png", OUT / f"cast_sigil-{cid}.png", name) for cid, name, _ in CAST]
gate = [fig(OUT / "cast_emblem-gate.png", 6, "The Gate of Draconia (x6)"),
        speaker(OUT / "cast_emblem-gate.png", None, "The Gate of Draconia")]
line = [fig(REF / f"bust-{cid}.png", 4, name) for cid, name, _ in CAST] + \
    [fig(OUT / "cast_emblem-gate.png", 4, "The Gate of Draconia")]

sections = [
    section("The sigils (10x10, x8)",
            "Each from the mockup's own glyph, pulled in by a pixel so its outline fits: Pyreth's gold ember "
            "glowing orange at its lower edge, Rodain's crossed spears, Mirael's compass star with its dark "
            "center, Kael's anvil, Lirae's quill with its nib dipped in ink.", sigils),
    section("On the dialogue name tag", "The mockup's tag: a dark frame, an ember-red plate, the sigil, then the "
            "speaker's name as the game writes it.", tags),
    section("The Gate of Draconia",
            "The prologue's narrator is the gate itself, so its emblem takes a bust's place: the gatehouse "
            "front-on in the wall's stone, gold-lit arrow slits, gold banners with an ember, and the arch glowing "
            "behind a dark portcullis, as if it speaks. Its tag has no sigil; the emblem is its mark.", gate),
    section("Beside the busts (x4)", "", line),
]
out = page("Draconia Cast Sigils", "Batch 8: Cast extras",
           "The five sigils as real files and the prologue's emblem &middot; 2026-10-27", sections, CSS)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
