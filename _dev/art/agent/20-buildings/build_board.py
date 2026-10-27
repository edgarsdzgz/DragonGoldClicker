"""Build the Batch 3 review board: the city at three moments (lit and night), every building in
every state, the Forge's fire, and the ten building icons. Run after src/preview.py and src/icons.py.
"""
import base64
import html
import io
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE / "src"))

from PIL import Image  # noqa: E402

import buildings  # noqa: E402
from icons import ICONS  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
NAMES = {"keep": "Draconia Keep", "outpost": "Wayfinder's Outpost", "wizard-tower": "Wizard's Tower",
         "housing": "Housing", "lodge": "Ranger's Lodge", "forge": "The Forge", "librarium": "The Librarium",
         "garrison": "The Garrison", "tower-west": "Tower West", "tower-east": "Tower East"}
STATE_NAMES = {"ruin": "Ruin", "built": "Built", "restored": "Restored", "lit": "Lit", "lv1": "Level 1",
               "lv3": "Level 3", "lv5": "Level 5", "upgraded": "Upgraded", "house": "One house", "row": "A row"}


def uri_img(img):
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def fig(img, scale, caption, src=None):
    src = src or uri_img(img)
    return (f'<figure><img src="{src}" width="{img.width * scale}" height="{img.height * scale}" '
            f'alt="{html.escape(caption)}"><figcaption>{html.escape(caption)}</figcaption></figure>')


moments = ""
for name, cap in (("start", "Start: ruins and fog"), ("mid", "Mid-game: rebuilding"), ("late", "Late game: restored")):
    img = Image.open(PREVIEW / f"city_{name}_x3.png").convert("RGBA")
    half = img.width // 2
    lit, night = img.crop((0, 0, half - 4, img.height)), img.crop((half + 4, 0, img.width, img.height))
    moments += f"<h3>{cap}</h3><div class=\"tiles\">{fig(lit, 1, 'Lit')}{fig(night, 1, 'Night')}</div>"

rows = {}
for bid, state in buildings.BUILDINGS:
    rows.setdefault(bid, []).append(state)
states = ""
for bid, sts in rows.items():
    figs = "".join(fig(Image.open(OUT / f"bld_{bid}_{s}.png").convert("RGBA"), 4, STATE_NAMES.get(s, s)) for s in sts)
    if bid == "forge":
        gif = PREVIEW / "forge_lit.gif"
        g = Image.open(gif)
        figs += fig(g, 1, "Lit, the fire flickering (3 frames)",
                    "data:image/gif;base64," + base64.b64encode(gif.read_bytes()).decode())
    states += f"<h3>{html.escape(NAMES[bid])}</h3><div class=\"tiles\">{figs}</div>"
icons = "".join(fig(Image.open(OUT / f"icon_bld-{bid}.png").convert("RGBA"), 6, NAMES[bid]) for bid in ICONS)

page = f"""<title>Draconia Buildings</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Nunito:wght@400;700&display=swap">
<style>
  :root {{ --bg: #1c1524; --panel: #281e32; --line: #463a5a; --fg: #ecd6aa; --muted: #9678a8;
    --gold: #f0c060; color-scheme: dark; }}
  body {{ background: var(--bg); color: var(--fg); font: 15px/1.55 Nunito, system-ui, sans-serif;
    padding-left: max(16px, env(safe-area-inset-left, 0px));
    padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 24px 48px; }}
  main {{ max-width: 1100px; margin: 0 auto; display: grid; gap: 32px; }}
  h1, h2, h3 {{ font-family: Cinzel, Georgia, serif; color: var(--gold); margin: 0; text-wrap: balance; }}
  h1 {{ font-size: 1.7rem; }}
  h2 {{ font-size: 1.15rem; letter-spacing: .04em; }}
  h3 {{ font-size: .95rem; color: var(--fg); }}
  p {{ margin: 0; max-width: 65ch; }}
  .muted {{ color: var(--muted); }}
  section {{ display: grid; gap: 12px; min-width: 0; }}
  .tiles {{ display: flex; flex-wrap: wrap; gap: 16px 20px; align-items: flex-end;
    background: var(--panel); border: 1px solid var(--line); padding: 16px; }}
  figure {{ margin: 0; display: grid; gap: 6px; justify-items: center; max-width: 100%; }}
  figure img {{ image-rendering: pixelated; max-width: 100%; height: auto; }}
  figcaption {{ font-size: .8rem; color: var(--muted); text-align: center; }}
</style>
<main>
  <header>
    <h1>Draconia buildings</h1>
    <p class="muted">Batch 3 &middot; ten buildings in every state, each its own sprite on its plot of the city map
      &middot; drawn in the lit look; windows, torches and the forge keep their light at night &middot; 2026-10-26</p>
  </header>
  <section>
    <h2>The city at three moments</h2>
    <p class="muted">The same map and plots; only what stands on each plot changes. Fog marks a plot not yet found,
      a scaffold a building going up.</p>
    {moments}
  </section>
  <section>
    <h2>Every building, every state (x4)</h2>
    {states}
  </section>
  <section>
    <h2>Building icons, 16 x 16 (x6)</h2>
    <div class="tiles">{icons}</div>
  </section>
</main>
"""
(HERE / "board.html").write_text(page, encoding="utf-8")
print(f"board.html: {len(page) // 1024} KB")
