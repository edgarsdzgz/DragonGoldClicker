"""Build the research options page: Dragon Anatomy, Mortar Craft, Tempered Steel and Evacuation Drills.

Builds the sprites from src/options.px (write it first with src/make_options.py), then a
self-contained options.html: the version it replaces beside each option, large and at game size.
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

NOW = AGENT / "13-research" / "out"
GROUPS = [
    ("Dragon Anatomy", [NOW / "icon_res_dragon_anatomy.png"], "Lirae's sketch, as first drawn.", [
        (["res_anatomy_sketch"], "A: The claw sketch, bolder", "A bigger hooked claw on Lirae's page, the weak spot marked with an X."),
        (["res_anatomy_lens"], "B: Under the lens", "A claw studied through a brass magnifying glass: anatomy as study."),
        (["res_anatomy_talon"], "C: The marked talon", "A bare bone-white talon, a gold ring around its deadly point."),
    ]),
    ("Mortar Craft", [NOW / "icon_res_mortar_craft.png"], "The trowel, as first drawn.", [
        (["res_mortar_trowel"], "A: Pointed trowel", "The classic trowel shape: handle up, pointed blade down, mortar on it."),
        (["res_mortar_bucket"], "B: Mortar bucket", "A bucket heaped with mortar, the trowel standing in it."),
        (["res_mortar_wall"], "C: Trowel on the wall", "A trowel laid on a fresh course of stone, the joints in pale mortar."),
    ]),
    ("Tempered Steel", [NOW / "icon_res_tempered_steel.png"], "The glowing sword, as first drawn.", [
        (["res_steel_steam"], "A: With steam", "The same sword, steam rising from the quench."),
        (["res_steel_trough"], "B: In the trough", "Plunged point-first into the quenching trough, glowing at the waterline."),
        (["res_steel_anvil"], "C: On Kael's anvil", "A blade glowing on the anvil, Kael's own sigil."),
    ]),
    ("Evacuation Drills", [NOW / "icon_res_evacuation_drills.png"], "The war horn, as first drawn.", [
        (["res_evac_runner"], "A: The runner", "A townsperson running, in the townsfolk colors: everyone knows where to run."),
        (["res_evac_door"], "B: The way out", "A stone doorway, dark within, a gold arrow leading out."),
        (["res_evac_horn"], "C: The war horn, redrawn", "A cleaner crescent with gold bands and the bell open toward you."),
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
for title, now, note, opts in GROUPS:
    cards = [card(now, "Now", note, now=True)]
    cards += [card([OPT / f"icon_{s}.png" for s in stems], name, note) for stems, name, note in opts]
    sections.append(f'<section><h2>{html.escape(title)}</h2><div class="cards">{"".join(cards)}</div></section>')

page = f"""<title>Research Icon Options</title>
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
    <h1>Research icon options</h1>
    <p class="muted">Draconia Chronicles &middot; Research studies &middot;
      each option large (x8), then at game size (x4) between official icons &middot; 2026-10-26</p>
  </header>
  {"".join(sections)}
</main>
"""
(HERE / "options.html").write_text(page, encoding="utf-8")
print(f"options.html: {len(page) // 1024} KB, {len(entries)} sprites")
