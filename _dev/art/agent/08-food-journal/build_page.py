"""Build the Food and Journal options page: the current icon beside each option, large and at game size.

Run after src/make_options.py and the pixkit build. Output: options.html (self-contained).
"""
import base64
import html
import pathlib

HERE = pathlib.Path(__file__).parent
AGENT = HERE.parent
OPT = HERE / "out"

GROUPS = [
    ("Food", AGENT.parent / "official/icons/icon_food.png", [
        ("food_loaf", "A: Crusty loaf", "A long loaf with three scored cuts showing the crumb. The current idea, done properly."),
        ("food_drumstick", "B: Drumstick", "Roast meat on the bone: the classic game 'food' that reads at any size."),
        ("food_cheese", "C: Cheese wedge", "A wedge with holes. Unmistakable, and warm gold like the rest of the stores."),
        ("food_apple", "D: Apple", "A brick-red apple with a stem and a leaf. Simple and friendly."),
    ]),
    ("Journal", AGENT.parent / "official/icons/icon_scroll.png", [
        ("journal_leather", "A: Leather journal", "A brown leather journal with a brass clasp and a red ribbon. Clearly not the Librarium's blue book."),
        ("journal_open", "B: Open book", "An open book with lines of writing: something you read."),
        ("journal_quill", "C: Quill and inkpot", "Lirae's quill (her sigil) in an inkpot: the Journal is hers."),
        ("journal_scroll", "D: Rolled scroll", "The current idea, redrawn with rolled ends, writing and a wax seal."),
    ]),
]
NEIGHBORS = ["icon_rations", "icon_wheat", "icon_bell", "icon_star"]


def uri(p):
    return "data:image/png;base64," + base64.b64encode(p.read_bytes()).decode()


def img(p, scale, alt=""):
    return f'<img src="{uri(p)}" width="{12 * scale}" height="{12 * scale}" alt="{html.escape(alt)}">'


official = AGENT.parent / "official" / "icons"
sections = []
for title, current, opts in GROUPS:
    cards = [f'<figure class="card now">{img(current, 8, "Current " + title)}'
             f'<figcaption><b>Now</b><span>The current version.</span></figcaption></figure>']
    for stem, name, note in opts:
        p = OPT / f"icon_{stem}.png"
        row = "".join(img(official / f"{n}.png", 4) for n in NEIGHBORS[:2]) + img(p, 4, name) \
            + "".join(img(official / f"{n}.png", 4) for n in NEIGHBORS[2:])
        cards.append(f'<figure class="card">{img(p, 8, name)}'
                     f'<figcaption><b>{html.escape(name)}</b><span>{html.escape(note)}</span></figcaption>'
                     f'<div class="row" aria-label="At game size beside other icons">{row}</div></figure>')
    sections.append(f'<section><h2>{html.escape(title)}</h2><div class="cards">{"".join(cards)}</div></section>')

page = f"""<title>Food and Journal Options</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Nunito:wght@400;700&display=swap">
<style>
  :root {{ --bg: #1c1524; --panel: #281e32; --line: #463a5a; --fg: #ecd6aa; --muted: #9678a8;
    --gold: #f0c060; color-scheme: dark; }}
  body {{ background: var(--bg); color: var(--fg); font: 15px/1.5 Nunito, system-ui, sans-serif;
    padding-left: max(16px, env(safe-area-inset-left, 0px));
    padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 24px 48px; }}
  main {{ max-width: 1100px; margin: 0 auto; display: grid; gap: 32px; }}
  h1, h2 {{ font-family: Cinzel, Georgia, serif; color: var(--gold); margin: 0; text-wrap: balance; }}
  h1 {{ font-size: 1.7rem; }}
  h2 {{ font-size: 1.15rem; letter-spacing: .04em; }}
  p {{ margin: 0; max-width: 65ch; }}
  .muted {{ color: var(--muted); }}
  section {{ display: grid; gap: 12px; }}
  .cards {{ display: flex; flex-wrap: wrap; gap: 14px; }}
  .card {{ margin: 0; background: var(--panel); border: 1px solid var(--line); padding: 14px;
    display: grid; gap: 10px; justify-items: center; width: 300px; max-width: 100%; }}
  .card.now {{ border-style: dashed; }}
  .card img {{ image-rendering: pixelated; max-width: 100%; height: auto; }}
  figcaption {{ display: grid; gap: 4px; text-align: center; }}
  figcaption b {{ font-family: Cinzel, Georgia, serif; color: var(--gold); font-size: .95rem; }}
  figcaption span {{ font-size: .85rem; color: var(--muted); }}
  .row {{ display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; padding: 6px; background: var(--bg); }}
  .row img {{ flex: none; }}
</style>
<main>
  <header>
    <h1>Food and Journal options</h1>
    <p class="muted">Draconia Chronicles &middot; Food and Journal &middot; each option large (x8), then at game size (x4) between official icons &middot; 2026-10-26</p>
  </header>
  {"".join(sections)}
</main>
"""
(HERE / "options.html").write_text(page, encoding="utf-8")
print(f"options.html: {len(page) // 1024} KB")
