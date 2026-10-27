"""Build the Batch 2 review board: the city base map in lit, dusk and night, the plots outlined and
named, the plot pieces on their plots, and every piece and marker on its own.

Run after src/make_city.py. Output: board.html (self-contained).
"""
import base64
import html
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "00-foundation"))

from PIL import Image  # noqa: E402

import pixkit  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
plots = json.loads((OUT / "map_plots.json").read_text(encoding="utf-8"))["plots"]
NAMES = {"keep": "Draconia Keep", "outpost": "Wayfinder's Outpost", "wizard-tower": "Wizard's Tower",
         "housing": "Housing", "lodge": "Ranger's Lodge", "forge": "The Forge", "librarium": "The Librarium",
         "garrison": "The Garrison", "tower-west": "Tower West", "tower-east": "Tower East"}


def uri(img):
    import io
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def fig(img, scale, caption):
    return (f'<figure><img src="{uri(img)}" width="{img.width * scale}" height="{img.height * scale}" '
            f'alt="{html.escape(caption)}"><figcaption>{html.escape(caption)}</figcaption></figure>')


base = Image.open(OUT / "map_city_base.png").convert("RGBA")
levels = "".join(fig(im, 2, cap) for im, cap in (
    (base, "Lit (as drawn)"), (pixkit.relight(base, pixkit.DUSK), "Dusk map"),
    (pixkit.relight(base, pixkit.NIGHT), "Night map")))
plot_img = Image.open(PREVIEW / "plots_x3.png").convert("RGBA")
staged = Image.open(PREVIEW / "pieces_on_plots_x3.png").convert("RGBA")
staged_night = Image.open(PREVIEW / "pieces_on_plots_night_x3.png").convert("RGBA")
plot_rows = "".join(
    f"<tr><td>{html.escape(NAMES[p['id']])}</td><td><code>{p['id']}</code></td>"
    f"<td>{p['x']}, {p['y']}</td><td>{p['width']} x {p['height']}</td></tr>" for p in plots)
pieces = []
for kind, label in (("fog", "Fog (undiscovered)"), ("plot-empty", "Cleared ground (unbuilt)"),
                    ("foundation", "Foundation (first step)"), ("scaffold", "Scaffold (building)")):
    imgs = sorted(OUT.glob(f"map_{kind}_*.png"), key=lambda f: f.name)
    pieces.append(f"<h3>{label}</h3><div class=\"tiles\">" + "".join(
        fig(Image.open(f).convert("RGBA"), 3, f.stem.split("_")[-1]) for f in imgs) + "</div>")
markers = "".join(fig(Image.open(OUT / f"map_marker-{n}.png").convert("RGBA"), 8, cap)
                  for n, cap in (("upgrade", "Upgrade ready"), ("todo", "Something to do")))

page = f"""<title>Draconia City Map</title>
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
  .table-wrap {{ overflow-x: auto; }}
  table {{ border-collapse: collapse; font-size: .9rem; }}
  th, td {{ text-align: left; padding: 4px 12px 4px 0; border-bottom: 1px solid var(--line); }}
  th {{ color: var(--muted); font-weight: 700; }}
  code {{ color: var(--gold); }}
</style>
<main>
  <header>
    <h1>Draconia city map</h1>
    <p class="muted">Batch 2 &middot; the base map with no buildings, its ten plots, and the pieces that stand on a plot before
      its building does &middot; drawn in the lit look; the game darkens it with the dusk and night maps &middot; 2026-10-26</p>
  </header>

  <section>
    <h2>Light levels</h2>
    <p class="muted">One drawing, three palette maps. Torch, window and fire colors keep their value in every map.</p>
    <div class="tiles">{levels}</div>
  </section>

  <section>
    <h2>The ten plots</h2>
    <div class="tiles">{fig(plot_img, 1, "Plots outlined, x3")}
      <div class="table-wrap"><table><tr><th>Building</th><th>Plot id</th><th>x, y</th><th>Size</th></tr>{plot_rows}</table></div>
    </div>
    <p class="muted">Four sizes: the Keep 50 x 82, the Wizard's Tower 24 x 40, the wall towers 20 x 32, and 32 x 32 for the rest.
      Each building's base sits at the bottom center of its plot. Written to <code>map_plots.json</code>.</p>
  </section>

  <section>
    <h2>The pieces on their plots</h2>
    <p class="muted">A mix, to see them in place: fog, cleared ground, foundation and scaffold, by day and by night.</p>
    <div class="tiles">{fig(staged, 1, "Lit, x3")}{fig(staged_night, 1, "Night, x3")}</div>
  </section>

  <section>
    <h2>Every piece, by plot size</h2>
    {"".join(pieces)}
    <h3>Map markers, 8 x 8</h3>
    <div class="tiles">{markers}</div>
  </section>
</main>
"""
(HERE / "board.html").write_text(page, encoding="utf-8")
print(f"board.html: {len(page) // 1024} KB")
