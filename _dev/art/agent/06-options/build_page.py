"""Build the options page: the current icon beside each option, large and at game size.

Run after src/make_options.py and the pixkit build. Output: options.html (self-contained).
"""
import base64
import html
import pathlib

HERE = pathlib.Path(__file__).parent
AGENT = HERE.parent
OPT = HERE / "out"

GROUPS = [
    ("Close", AGENT / "05-icons-3/out/icon_close.png", [
        ("close_plate", "A: Stone plate", "A steel X on a stepped stone plate, the same shape as the game's panels. Reads as a button."),
        ("close_boss", "B: Steel boss", "An X cut into a round steel shield boss. Quiet, heraldic."),
        ("close_seal", "C: Wax seal", "An X pressed into a brick-red wax seal: the letter is closed. The most in-world."),
        ("close_planks", "D: Boarded shut", "Two boards nailed in an X. Playful, and says 'closed' literally."),
    ]),
    ("Reassign", AGENT / "05-icons-3/out/icon_reassign.png", [
        ("reassign_cycle", "A: Loop", "Two arrows chasing each other round a circle, steel and gold: people moving between jobs."),
        ("reassign_chunky", "B: Chunky", "The current idea with big heads and a dark underside for depth; steel over gold."),
        ("reassign_plate", "C: On a plate", "The two arrows on the same stone plate as Close A, so the two buttons match."),
    ]),
    ("Soldiers (helm)", AGENT / "05-icons-3/../02-icon-redraw/out/icon_helm.png", [
        ("helm_barbute", "A: Barbute", "A rounded dome with the dark T opening, the shape most of the references share."),
        ("helm_sugarloaf", "B: Sugarloaf", "A pointed great helm with the brass cross and eye slits: the current idea, minus the box."),
        ("helm_plumed", "C: Plumed barbute", "The barbute with a red crest on top."),
    ]),
]
NEIGHBORS = ["icon_cog", "icon_padlock", "icon_check", "icon_star"]


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

page = f"""<title>Icon Options</title>
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
    <h1>Icon options</h1>
    <p class="muted">Draconia Chronicles &middot; Close, Reassign and the Soldiers helm &middot; each option large (x8), then at game size (x4) between official icons &middot; 2026-10-26</p>
  </header>
  {"".join(sections)}
</main>
"""
(HERE / "options.html").write_text(page, encoding="utf-8")
print(f"options.html: {len(page) // 1024} KB")
