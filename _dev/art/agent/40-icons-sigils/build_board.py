"""Build the sigils and icons board. Run after src/make_icons.py. Output: board.html."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from boardkit import fig, gif_fig, page, section  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
OFFICIAL = HERE.parents[1] / "official"

SIGILS = [("varn", "Varn: a cracked egg, barely fledged"), ("ashara", "Ashara: her burning eye"),
          ("thornwick", "Thornwick: his scorched hat"), ("sera", "Sera: her round shield"),
          ("hollow-knight", "The Hollow Knight: an empty helm")]
ICONS = [("icon_res_cartography", "Cartography (study): a chart and dividers"),
         ("icon_res_keen_scouts", "Keen Scouts (study): a spyglass"),
         ("icon_warning", "warning: the confirm dialog"), ("icon_purse", "wallet: Shop, Settings"),
         ("icon_market", "business: Shop"), ("icon_hand", "hand-left: Settings, wanderer dialog"),
         ("icon_gauge", "speedometer: Settings"), ("icon_phone", "phone-portrait: Settings")]
sections = [
    section("Sigils for the new five", "10x10, each beside its bust. The five locked sigils follow.",
            [f for sid, cap in SIGILS for f in (fig(OUT / f"cast_sigil-{sid}_v1.png", 6, cap),
                                                 fig(OFFICIAL / "cast" / f"bust_{sid}.png", 3, "bust"))]),
    section("The locked sigils", "", [fig(OFFICIAL / "cast" / f"cast_sigil-{n}.png", 6, n)
                                      for n in ("pyreth", "rodain", "mirael", "kael", "lirae")]),
    section("Study and interface icons", "12x12 at x6, then at game size (x2), with the glyph each replaces.",
            [f for n, cap in ICONS for f in (fig(OUT / f"{n}_v1.png", 6, cap), fig(OUT / f"{n}_v1.png", 2, "x2"))]),
    section("Beside locked icons", "", [fig(OFFICIAL / "icons" / f"{n}.png", 6, n) for n in
                                        ("icon_map", "icon_res_rationing", "icon_bell", "icon_compass", "icon_padlock")]),
]
out = page("Draconia Sigils and Icons", "Sigils and icons",
           "Everything the app still draws without pixel art: sigils for the five new characters, the last two "
           "study icons, and six interface icons. Ink outline, light from the upper left; the warning is gold, "
           "since red is for danger &middot; 2026-10-27", sections)
(HERE / "board.html").write_text(out, encoding="utf-8")
print(f"board.html: {len(out) // 1024} KB")
