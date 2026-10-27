"""Export what the RAXDEG STUDIOS playground needs: the four faces as glyph rows, the color ramps, the
palette colors it draws with, and the shield icon. Writes out/playground_data.json, which the logo
board inlines beside playground.js.

Run: python export_playground.py (after make_options.py)
"""
import base64
import json
import pathlib
import sys

from make_options import BOLD, FACE, ICON, LOGO_OUT, OUT, TINY, embolden, pixkit

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "27-raxdeg-seal" / "src"))
from make_seal import OUT as SEAL_OUT, RUNIC  # noqa: E402

P = pixkit.PALETTE


def hx(name):
    return "#%02x%02x%02x" % P[name]


def glyphs(font):
    return {c: rows for c, rows in font.items() if c in "RAXDEGSTUIO"}


data = {
    "fonts": {
        "light": {"label": "Light (5x7)", "h": 7, "italic": 0, "glyphs": glyphs(FACE)},
        "bold": {"label": "Bold block (7x9)", "h": 9, "italic": 0, "glyphs": glyphs(BOLD)},
        "ember": {"label": "Bold italic (6x7)", "h": 7, "italic": 3,
                  "glyphs": glyphs(embolden({c: FACE[c] for c in "RAXDEGSTUIO"}))},
        "tiny": {"label": "Small caps (3x5)", "h": 5, "italic": 0, "glyphs": glyphs(TINY)},
        "runic": {"label": "Runic, from the seal (5x7)", "h": 7, "italic": 0, "roman": True, "glyphs": RUNIC},
    },
    "ramps": {
        "gold": [hx(n) for n in ("gold6", "gold5", "gold5", "gold4", "gold4", "gold3", "gold3", "gold2")],
        "steel": [hx(n) for n in ("steel5", "steel5", "steel4", "steel4", "steel3", "steel3", "steel2", "steel1")],
        "ember": [hx(n) for n in ("gold6", "gold6", "gold5", "fire2", "fire2", "fire1", "fire1", "gold3")],
        "parchment": [hx(n) for n in ("parch3", "parch3", "parch3", "parch2", "parch2", "parch1")],
        "ruby": [hx(n) for n in ("ruby4", "ruby3", "ruby3", "ruby2", "ruby2", "ruby1")],
        "emerald": [hx(n) for n in ("emerald4", "emerald3", "emerald3", "emerald2", "emerald2", "emerald1")],
        "arcane": [hx(n) for n in ("azure4", "azure4", "azure3", "azure3", "azure3", "azure2", "azure2")],
        "ink": [hx("ink")],
    },
    "pal": {n: hx(n) for n in ("ink", "night1", "night2", "parch1", "parch2", "parch3", "wood3", "steel3", "steel4")},
    "icon": "data:image/png;base64," + base64.b64encode((LOGO_OUT / "logo_shield_icon.png").read_bytes()).decode(),
    "emblems": {k: "data:image/png;base64," + base64.b64encode(p.read_bytes()).decode() for k, p in (
        ("shield", LOGO_OUT / "logo_shield_icon.png"), ("seal-gold", SEAL_OUT / "seal_gold_96.png"),
        ("seal-arcane", SEAL_OUT / "seal_arcane_96.png"), ("seal-wax", SEAL_OUT / "seal_wax_96.png"))},
}
(OUT / "playground_data.json").write_text(json.dumps(data), encoding="utf-8")
print("playground_data.json written", ICON.size)
