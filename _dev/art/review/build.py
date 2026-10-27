"""Build the art review page: every sprite as its own image in wrapping rows (no sideways scroll).

Sections: the batch awaiting approval, then the official library (read from OFFICIAL.md), then
the animations. Output is one self-contained HTML file. Run: python build.py [output.html]
"""
import base64
import html
import pathlib
import re
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
ART = HERE.parent
AGENT = ART / "agent"
OFFICIAL = ART / "official"
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "review.html"

# The batch awaiting the owner's approval: (title, [(path under agent/, label), ...]), or None.
PENDING = None
MOTION = [
    (AGENT / "01-test-run/preview/scene_warfront.gif", "The fighter's jab and the hit spark on the Warfront wall"),
    (AGENT / "01-test-run/preview/ppl_fighter_attack.gif", "Fighter jab, 6 fps"),
    (AGENT / "01-test-run/preview/fx_spark.gif", "Hit spark, 12 fps"),
]
SCALE = {"icons": 6, "people": 6, "fx": 6, "events": 4}


def uri(path):
    kind = "gif" if path.suffix == ".gif" else "png"
    return f"data:image/{kind};base64," + base64.b64encode(path.read_bytes()).decode()


def tile(path, label, scale=None):
    """One figure: the sprite at a whole-number scale (or a preview GIF at its own size)."""
    img = Image.open(path)
    w, h = img.size
    if scale:
        w, h = w * scale, h * scale
    alt = html.escape(label)
    return (f'<figure><img src="{uri(path)}" width="{w}" height="{h}" alt="{alt}">'
            f"<figcaption>{alt}</figcaption></figure>")


def official_rows():
    """[(group, path, label)] from the register table in OFFICIAL.md."""
    rows = []
    for line in (OFFICIAL / "OFFICIAL.md").read_text(encoding="utf-8").splitlines():
        m = re.match(r"\| `([^`]+\.png)` \| [^|]* \| ([^|]+) \|", line)
        if m:
            rel, what = m.group(1), m.group(2).strip()
            if "_strip" not in rel:
                rows.append((rel.split("/")[0], OFFICIAL / rel, what))
    return rows


pending_section = ""
if PENDING:
    title, items = PENDING
    tiles = "".join(tile(AGENT / rel, label, 6) for rel, label in items)
    pending_section = (f'<section><h2>{html.escape(title)} <span class="tag">awaiting approval</span></h2>'
                       f'<div class="tiles">{tiles}</div></section>')
groups = {"icons": [], "people": [], "fx": [], "events": []}
for group, path, what in official_rows():
    groups[group].append(tile(path, what, SCALE[group]))
motion = "".join(tile(p, label) for p, label in MOTION)
count = sum(len(v) for v in groups.values())

page = f"""<title>Pixel Art Test Run</title>
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
  h3 {{ font-size: .95rem; letter-spacing: .04em; color: var(--fg); }}
  p {{ margin: 0; max-width: 65ch; }}
  .muted {{ color: var(--muted); }}
  section {{ display: grid; gap: 12px; }}
  .tiles {{ display: flex; flex-wrap: wrap; gap: 16px 20px; align-items: flex-end;
    background: var(--panel); border: 1px solid var(--line); padding: 16px; }}
  figure {{ margin: 0; display: grid; gap: 6px; justify-items: center; max-width: 100%; }}
  figure img {{ image-rendering: pixelated; max-width: 100%; height: auto; }}
  figcaption {{ font-size: .8rem; color: var(--muted); text-align: center; max-width: 14ch; }}
  .tag {{ font: 700 .7rem/1 Nunito, sans-serif; letter-spacing: .08em; text-transform: uppercase;
    color: var(--bg); background: var(--gold); padding: 3px 6px; margin-left: 8px; vertical-align: middle; }}
</style>
<main>
  <header>
    <h1>Pixel art test run</h1>
    <p class="muted">Draconia Chronicles &middot; every sprite at its game scale &middot; 2026-10-26</p>
  </header>

  {pending_section}

  <section>
    <h2>The official library ({count} sprites)</h2>
    <p class="muted">Locked by the owner. Never edited in place; a change comes back as a new version for approval.</p>
    <h3>Icons, x6</h3><div class="tiles">{"".join(groups["icons"])}</div>
    <h3>People, x6</h3><div class="tiles">{"".join(groups["people"])}</div>
    <h3>Effects and events</h3><div class="tiles">{"".join(groups["fx"] + groups["events"])}</div>
  </section>

  <section>
    <h2>In motion</h2>
    <div class="tiles">{motion}</div>
  </section>
</main>
"""
OUT.write_text(page, encoding="utf-8")
print(f"{OUT}: {len(page) // 1024} KB, {count} official sprites")
