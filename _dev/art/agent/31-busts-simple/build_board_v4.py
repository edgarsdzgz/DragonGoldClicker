"""Build the busts v4 board (board_v4.html): the chosen set together, the two changes beside their v3,
and the set on the dialogue tag with the locked sigils. Run after src/make_busts.py.
"""
import html
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import page, section, uri  # noqa: E402

OUT = HERE / "out"
CAST = HERE.parents[1] / "official" / "cast"
CHARS = [("pyreth", "Elder Pyreth"), ("rodain", "Captain Rodain"), ("mirael", "Scout Mirael"),
         ("kael", "Kael Ironwright"), ("lirae", "Lirae the Ink-Wing")]
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


def img(path, scale, alt=""):
    i = Image.open(path).convert("RGBA")
    return f'<img src="{uri(i)}" width="{i.width * scale}" height="{i.height * scale}" alt="{html.escape(alt)}">'


def labeled(path, scale, label):
    return f'<figure>{img(path, scale, label)}<figcaption>{html.escape(label)}</figcaption></figure>'


the_set = [labeled(OUT / f"bust_{cid}_v4.png", 6, name) for cid, name in CHARS]
changes = [f'<div class="row">{labeled(OUT / f"bust_{cid}_v3.png", 6, f"{name}, v3")}'
           f'{labeled(OUT / f"bust_{cid}_v4.png", 6, f"{name}, v4")}</div>'
           for cid, name in (("pyreth", "Elder Pyreth"), ("lirae", "Lirae the Ink-Wing"))]
tags = [f'<figure><div class="speaker">{img(OUT / f"bust_{cid}_v4.png", 4, name)}<div class="tag"><span>'
        f'{img(CAST / f"cast_sigil-{cid}.png", 2)}{html.escape(name)}</span></div></div></figure>'
        for cid, name in CHARS]
sections = [
    section("The set (22x23, x6)", "Rodain, Mirael and Kael are v3 as they were; Kael is the 22x23 take.",
            the_set),
    section("What changed", "Pyreth's pupils are gone, his eyes plain gold again; the rest of his v3 stays. "
            "Lirae's paler chest is back, just above the tome, as on v1.", changes),
    section("On the dialogue tag", "", tags),
]
out = page("Draconia Busts v4", "Simpler busts, v4",
           "Your picks from v3 &middot; 2026-10-27", sections, CSS)
(HERE / "board_v4.html").write_text(out, encoding="utf-8")
print(f"board_v4.html: {len(out) // 1024} KB")
