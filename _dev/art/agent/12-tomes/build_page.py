"""Build the tomes page: the book and scroll icons we have, and Stats drawn as a record tome.

Builds the sprites from src/tomes.px (a hand grid), then a self-contained options.html: each icon
large and at game size between official icons. Run: python build_page.py
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

OFF = AGENT.parent / "official" / "icons"
O2, O3 = AGENT / "10-options-2" / "out", AGENT / "11-options-3" / "out"
# (title, intro, [(paths, name, note, dashed)])
GROUPS = [
    ("The books and scrolls we have", "What each one is for, so a Stats tome does not collide with them.", [
        ([OFF / "icon_book.png"], "Librarium book (official)",
         "The Librarium: its building, its banner and the research screen. Closed, seen from the spine side, purple with a gold diamond.", False),
        ([OFF / "icon_scroll.png"], "Journal scroll (official)",
         "The Journal button on the resource bar: Lirae's notes and the story entries. Today both this and the Librarium use the same Ionicon book; the pixel art splits them.", False),
        ([AGENT / "09-icons-4/out/icon_map.png"], "Map (sheet 4, pending)",
         "The map. Parchment, but folded, not bound.", False),
        ([AGENT / "08-food-journal/out/icon_journal_leather.png", AGENT / "08-food-journal/out/icon_journal_open.png",
          AGENT / "08-food-journal/out/icon_journal_quill.png"], "Not in use",
         "The Journal options you passed over: leather journal, open book, quill and inkpot. Free to reuse.", True),
        ([AGENT / "10-options-2/out/icon_unknown_notice.png"], "Not in use",
         "The notice on the board (Unknown C). Planned later: research category and node icons, and a Welcome Back ledger illustration.", True),
    ]),
    ("Stats as a tome", "Four record books, each unlike the Librarium book and the Journal scroll.", [
        ([AGENT / "09-icons-4/out/icon_stats.png"], "Now", "The sheet-4 bars.", True),
        ([O2 / "icon_stats_abacus.png"], "Abacus", "The one you were leaning toward.", True),
        ([OPT / "icon_tome_grimoire.png"], "A: Floating grimoire",
         "An open book hovering under sparkles: writing on the left page, a glowing trend line on the right.", False),
        ([OPT / "icon_tome_ribbons.png"], "B: Tome with ribbon bookmarks",
         "A brown leather record book, face-on, gold corners and sigil; three bookmarks hang in rising lengths like a hidden bar chart.", False),
        ([OPT / "icon_tome_lectern.png"], "C: The Chronicle on its lectern",
         "An open book on a wooden stand, the right page in glowing ink. The book the realm's records are kept in.", False),
        ([OPT / "icon_tome_stack.png"], "D: Stack of ledgers",
         "Three record books stacked, green on sea on brown: an archive.", False),
    ]),
    ("Earlier arcane Stats options", "From the last round, for comparison.", [
        ([O3 / "icon_stats_arcane_abacus.png"], "Arcane abacus", "Glowing beads in a dark frame.", False),
        ([O3 / "icon_stats_crystals.png"], "Crystal shards", "Three crystals, each taller.", False),
        ([O3 / "icon_stats_runetablet.png"], "Rune tablet", "Glowing bars in the Info stone.", False),
        ([O3 / "icon_stats_vials.png"], "Alchemist's vials", "Filled to rising levels.", False),
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


entries = pixkit.build(HERE / "src" / "tomes.px", HERE)
pixkit.write_manifest(entries, HERE)
bad = [e["file"] for e in entries if e["errors"]]
assert not bad, bad

official = OFF
sections = []
for title, intro, cards in GROUPS:
    body = "".join(card(paths, name, note, now=dashed) for paths, name, note, dashed in cards)
    sections.append(f'<section><h2>{html.escape(title)}</h2><p class="muted">{html.escape(intro)}</p>'
                    f'<div class="cards">{body}</div></section>')

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
    display: grid; gap: 10px; justify-items: center; align-content: start; width: 300px; max-width: 100%; }}
  .card.now {{ border-style: dashed; }}
  .big {{ display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 12px; }}
  .card img {{ image-rendering: pixelated; max-width: 100%; height: auto; flex: none; }}
  figcaption {{ display: grid; gap: 4px; text-align: center; }}
  figcaption b {{ font-family: Cinzel, Georgia, serif; color: var(--gold); font-size: .95rem; }}
  figcaption span {{ font-size: .85rem; color: var(--muted); }}
  .row {{ display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 6px; padding: 6px; background: var(--bg); }}
</style>
<main>
  <header>
    <h1>Interface icon options</h1>
    <p class="muted">Draconia Chronicles &middot; Books, scrolls and a Stats tome &middot;
      each option large (x8), then at game size (x4) between official icons &middot; 2026-10-26</p>
  </header>
  {"".join(sections)}
</main>
"""
(HERE / "options.html").write_text(page, encoding="utf-8")
print(f"options.html: {len(page) // 1024} KB, {len(entries)} sprites")
