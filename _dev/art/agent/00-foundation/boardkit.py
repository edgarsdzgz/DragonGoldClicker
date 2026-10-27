"""Shared pieces for the batch review boards: images as data URIs, figures, and the page shell
(the same dark, gold-headed look as the earlier boards). Used from Batch 6 on.
"""
import base64
import html
import io
import pathlib

from PIL import Image


def uri(img):
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def fig(img, scale, caption):
    """A still at a whole-number scale, captioned."""
    if isinstance(img, (str, pathlib.Path)):
        img = Image.open(img).convert("RGBA")
    return (f'<figure><img src="{uri(img)}" width="{img.width * scale}" height="{img.height * scale}" '
            f'alt="{html.escape(caption)}"><figcaption>{html.escape(caption)}</figcaption></figure>')


def gif_fig(path, scale, caption):
    """An animated GIF, shown at scale times its own size."""
    path = pathlib.Path(path)
    g = Image.open(path)
    return (f'<figure><img src="data:image/gif;base64,{base64.b64encode(path.read_bytes()).decode()}" '
            f'width="{g.width * scale}" height="{g.height * scale}" alt="{html.escape(caption)}">'
            f'<figcaption>{html.escape(caption)}</figcaption></figure>')


def section(title, note, figures):
    note = f'<p class="muted">{note}</p>' if note else ""
    return f'<section><h2>{html.escape(title)}</h2>{note}<div class="tiles">{"".join(figures)}</div></section>'


def page(title, heading, intro, sections, css=""):
    """The whole board. intro, section notes and css are trusted text written by the art tools."""
    return f"""<title>{html.escape(title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta charset="utf-8">
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
  p {{ margin: 0; max-width: 65ch; }}
  .muted {{ color: var(--muted); }}
  section {{ display: grid; gap: 12px; min-width: 0; }}
  .tiles {{ display: flex; flex-wrap: wrap; gap: 16px 20px; align-items: flex-end;
    background: var(--panel); border: 1px solid var(--line); padding: 16px; }}
  figure {{ margin: 0; display: grid; gap: 6px; justify-items: center; max-width: 100%; }}
  figure img {{ image-rendering: pixelated; max-width: 100%; height: auto; }}
  figcaption {{ font-size: .8rem; color: var(--muted); text-align: center; max-width: 22ch; }}
{css}
</style>
<main>
  <header>
    <h1>{html.escape(heading)}</h1>
    <p class="muted">{intro}</p>
  </header>
  {"".join(sections)}
</main>
"""
