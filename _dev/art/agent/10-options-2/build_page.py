"""Build the options page for Rising and Falling stores, Unknown, Info and Stats.

Builds the sprites from src/options.px (write it first with src/make_options.py), then a
self-contained options.html: the current sheet-4 icon beside each option, large and at game size.
Run: python build_page.py
"""
import base64
import html
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
AGENT = HERE.parent
sys.path.insert(0, str(AGENT / "00-foundation"))

import pixkit  # noqa: E402

OPT = HERE / "out"
NOW = AGENT / "09-icons-4" / "out"

GROUPS = [
    ("Rising and falling stores", ["icon_rising", "icon_falling"], [
        (["rising_zigzag", "falling_zigzag"], "A: Trend line, polished",
         "The current idea with a thicker line and a broad head. Still the most 'modern chart' of the set."),
        (["rising_diagonal", "falling_diagonal"], "B: Bold diagonal arrow",
         "One clean arrow, no zigzag. Reads instantly at game size."),
        (["rising_chevrons", "falling_chevrons"], "C: Stacked chevrons",
         "Two chevrons, the mark a herald would paint on a shield. The most fantasy of the arrows."),
        (["rising_gem", "falling_gem"], "D: Cut gem",
         "A faceted triangle, like a gem pointing the way. Compact, sits well beside numbers."),
        (["rising_sack", "falling_sack"], "E: Grain sack with an arrow",
         "The stores themselves, with a small arrow. Says 'stores' rather than just 'up'."),
    ]),
    ("Unknown and help", ["icon_unknown"], [
        (["unknown_runestone"], "A: Rune stone",
         "A question mark carved in a mossy standing stone. Pairs with Info A."),
        (["unknown_crystal"], "B: Crystal ball",
         "A question clouding inside a seer's crystal: the future not yet known."),
        (["unknown_notice"], "C: Notice on the board",
         "A parchment notice nailed up, a question inked on it. Pairs with Info B."),
        (["unknown_owl"], "D: Owl",
         "A wise owl. Best as the Help icon if Unknown and Help ever split."),
    ]),
    ("Info", ["icon_info"], [
        (["info_runestone"], "A: Rune stone", "An i carved in the same mossy stone. Pairs with Unknown A."),
        (["info_illuminated"], "B: Illuminated letter",
         "A blue i with a gold dot in a gilt frame, like a manuscript initial."),
        (["info_lantern"], "C: Lantern", "A brass lantern, lighting the way."),
    ]),
    ("Stats (we may leave this one alone)", ["icon_stats"], [
        (["stats_tally"], "B: Chalk tally", "Tally marks in chalk on a slate in a wooden frame."),
        (["stats_abacus"], "C: Abacus", "Beads counted along three rods in a wooden frame."),
    ]),
]
NEIGHBORS = ["icon_rations", "icon_wheat", "icon_bell", "icon_star"]


def uri(p):
    return "data:image/png;base64," + base64.b64encode(p.read_bytes()).decode()


def img(p, scale, alt=""):
    return f'<img src="{uri(p)}" width="{12 * scale}" height="{12 * scale}" alt="{html.escape(alt)}">'


def card(paths, name, note, now=False):
    big = "".join(img(p, 8, name) for p in paths)
    row = "".join(img(official / f"{n}.png", 4) for n in NEIGHBORS[:2]) \
        + "".join(img(p, 4, name) for p in paths) \
        + "".join(img(official / f"{n}.png", 4) for n in NEIGHBORS[2:])
    return (f'<figure class="card{" now" if now else ""}"><div class="big">{big}</div>'
            f'<figcaption><b>{html.escape(name)}</b><span>{html.escape(note)}</span></figcaption>'
            f'<div class="row" aria-label="At game size beside other icons">{row}</div></figure>')


entries = pixkit.build(HERE / "src" / "options.px", HERE)
pixkit.write_manifest(entries, HERE)
bad = [e["file"] for e in entries if e["errors"]]
assert not bad, bad

official = AGENT.parent / "official" / "icons"
sections = []
for title, now, opts in GROUPS:
    cards = [card([NOW / f"{n}.png" for n in now], "Now", "Sheet 4, as drawn.", now=True)]
    cards += [card([OPT / f"icon_{s}.png" for s in stems], name, note) for stems, name, note in opts]
    sections.append(f'<section><h2>{html.escape(title)}</h2><div class="cards">{"".join(cards)}</div></section>')

page = f"""<title>Interface Icon Options</title>
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
  .big {{ display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }}
  .card img {{ image-rendering: pixelated; max-width: 100%; height: auto; flex: none; }}
  figcaption {{ display: grid; gap: 4px; text-align: center; }}
  figcaption b {{ font-family: Cinzel, Georgia, serif; color: var(--gold); font-size: .95rem; }}
  figcaption span {{ font-size: .85rem; color: var(--muted); }}
  .row {{ display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; padding: 6px; background: var(--bg); }}
</style>
<main>
  <header>
    <h1>Interface icon options</h1>
    <p class="muted">Draconia Chronicles &middot; Rising and falling stores, Unknown, Info, Stats &middot;
      each option large (x8), then at game size (x4) between official icons &middot; 2026-10-26</p>
  </header>
  {"".join(sections)}
</main>
"""
(HERE / "options.html").write_text(page, encoding="utf-8")
print(f"options.html: {len(page) // 1024} KB, {len(entries)} sprites")
