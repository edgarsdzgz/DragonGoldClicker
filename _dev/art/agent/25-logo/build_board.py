"""Build the logo board: each concept as an app icon (1x, 2x, under the round and rounded-square
masks the phones apply, and at x4) and as the full logo with the wordmark. Run after
src/make_logo.py. Output: board.html.
"""
import base64
import html
import io
import pathlib

from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).parent
OUT = HERE / "out"
CONCEPTS = [
    ("shield", "A: The claw-struck shield",
     "The city's shield, struck by three ember claw marks. The dragon is there only by its mark: "
     "it defends the city, and its strike is the game's tap."),
    ("gate", "B: The gate under the ember moon",
     "Draconia's gate and towers, the hearth glowing behind the portcullis, a gold moon rising. "
     "The city the dragon guards, the place the whole game defends."),
    ("monogram", "C: The D monogram",
     "A bold gold D with Pyreth's ember burning in its heart. The simplest to read at small sizes, "
     "and it pairs directly with the wordmark."),
]


def uri(img):
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def fig(img, scale, caption):
    return (f'<figure><img src="{uri(img)}" width="{img.width * scale}" height="{img.height * scale}" '
            f'alt="{html.escape(caption)}"><figcaption>{html.escape(caption)}</figcaption></figure>')


def masked(img, shape, scale=2):
    """The icon at 2x under a phone's mask, so the edges show what a launcher would cut."""
    big = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
    m = Image.new("L", big.size, 0)
    d = ImageDraw.Draw(m)
    if shape == "circle":
        d.ellipse((0, 0, big.width - 1, big.height - 1), fill=255)
    else:
        d.rounded_rectangle((0, 0, big.width - 1, big.height - 1), radius=big.width // 4.5, fill=255)
    out = Image.new("RGBA", big.size, (0, 0, 0, 0))
    out.paste(big, (0, 0), m)
    return out


cards = ""
for cid, title, note in CONCEPTS:
    icon = Image.open(OUT / f"logo_{cid}_icon.png").convert("RGBA")
    lock = Image.open(OUT / f"logo_{cid}_lockup.png").convert("RGBA")
    figs = (fig(icon, 1, "1x, a home screen") + fig(icon, 2, "2x") + fig(masked(icon, "circle"), 1, "Android round")
            + fig(masked(icon, "rounded"), 1, "iPhone rounded") + fig(icon, 4, "x4") + fig(lock, 3, "The logo, x3"))
    cards += (f"<h3>{html.escape(title)}</h3><p class=\"muted\">{html.escape(note)}</p>"
              f"<div class=\"tiles\">{figs}</div>")

page = f"""<title>Draconia Logo</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Nunito:wght@400;700&display=swap">
<style>
  :root {{ --bg: #1c1524; --panel: #281e32; --line: #463a5a; --fg: #ecd6aa; --muted: #9678a8;
    --gold: #f0c060; color-scheme: dark; }}
  body {{ background: var(--bg); color: var(--fg); font: 15px/1.55 Nunito, system-ui, sans-serif;
    padding-left: max(16px, env(safe-area-inset-left, 0px));
    padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 24px 48px; }}
  main {{ max-width: 1100px; margin: 0 auto; display: grid; gap: 14px; }}
  h1, h3 {{ font-family: Cinzel, Georgia, serif; color: var(--gold); margin: 0; text-wrap: balance; }}
  h1 {{ font-size: 1.7rem; }}
  h3 {{ font-size: .95rem; color: var(--fg); margin-top: 18px; }}
  p {{ margin: 0; max-width: 65ch; }}
  .muted {{ color: var(--muted); }}
  .tiles {{ display: flex; flex-wrap: wrap; gap: 16px 24px; align-items: flex-end;
    background: var(--panel); border: 1px solid var(--line); padding: 16px; }}
  figure {{ margin: 0; display: grid; gap: 6px; justify-items: center; max-width: 100%; }}
  figure img {{ image-rendering: pixelated; max-width: 100%; height: auto; }}
  figcaption {{ font-size: .8rem; color: var(--muted); text-align: center; }}
</style>
<main>
  <header>
    <h1>The Draconia Chronicles logo</h1>
    <p class="muted">One emblem as both the logo and the app icon. The protagonist stays with the artist, so the dragon
      appears only by its marks: its claws, its ember, the city it guards. Icons are 64x64 pixels, scaled by 16 to the
      stores' 1024x1024, with the emblem inside the middle the phones never crop. The wordmark is the same for all
      three &middot; 2026-10-27</p>
  </header>
  {cards}
</main>
"""
(HERE / "board.html").write_text(page, encoding="utf-8")
print(f"board.html: {len(page) // 1024} KB")
