"""Build the board for the mobs marked by the Unmaking: each mob as it was, with dark cracks and with
glowing cracks, in idle, hit, hurt and walk. Run after src/make_unmade.py. Output: board.html.
"""
import base64
import html
import pathlib

from PIL import Image

HERE = pathlib.Path(__file__).parent
OUT, PREVIEW = HERE / "out", HERE / "preview"
V1 = HERE.parent / "22-mobs"
MOBS = [("kobold", "Kobold"), ("goblin", "Goblin"), ("crawler", "Shadow Crawler"), ("orc", "Orc"),
        ("raider", "Raider (a human bandit: left uncracked)")]
LOOKS = [(V1 / "out", V1 / "preview", "Before"), (OUT / "dark", PREVIEW / "dark", "A: dark cracks"),
         (OUT / "glow", PREVIEW / "glow", "B: glowing cracks")]


def uri(path):
    kind = "gif" if path.suffix == ".gif" else "png"
    return f"data:image/{kind};base64," + base64.b64encode(path.read_bytes()).decode()


def fig(path, scale, caption):
    img = Image.open(path)
    return (f'<figure><img src="{uri(path)}" width="{img.width * scale}" height="{img.height * scale}" '
            f'alt="{html.escape(caption)}"><figcaption>{html.escape(caption)}</figcaption></figure>')


cards = ""
for mid, name in MOBS:
    groups = ""
    for out, prev, label in LOOKS:
        figs = "".join(fig(out / f"mob_{mid}_{st}.png", 6, st.capitalize()) for st in ("idle", "hit", "hurt"))
        figs += fig(prev / f"mob_{mid}_walk.gif", 1, "Walk")
        groups += f'<div class="look"><h4>{html.escape(label)}</h4><div class="row">{figs}</div></div>'
    cards += f'<h3>{html.escape(name)}</h3><div class="tiles">{groups}</div>'

page = f"""<title>Draconia Unmade Mobs</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Nunito:wght@400;700&display=swap">
<style>
  :root {{ --bg: #1c1524; --panel: #281e32; --line: #463a5a; --fg: #ecd6aa; --muted: #9678a8;
    --gold: #f0c060; color-scheme: dark; }}
  body {{ background: var(--bg); color: var(--fg); font: 15px/1.55 Nunito, system-ui, sans-serif;
    padding-left: max(16px, env(safe-area-inset-left, 0px));
    padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 24px 48px; }}
  main {{ max-width: 1100px; margin: 0 auto; display: grid; gap: 14px; }}
  h1, h3, h4 {{ font-family: Cinzel, Georgia, serif; color: var(--gold); margin: 0; text-wrap: balance; }}
  h1 {{ font-size: 1.7rem; }}
  h3 {{ font-size: .95rem; color: var(--fg); margin-top: 18px; }}
  h4 {{ font-size: .8rem; color: var(--muted); letter-spacing: .04em; }}
  p {{ margin: 0; max-width: 65ch; }}
  .muted {{ color: var(--muted); }}
  .tiles {{ display: flex; flex-wrap: wrap; gap: 20px 32px; background: var(--panel);
    border: 1px solid var(--line); padding: 16px; }}
  .look {{ display: grid; gap: 8px; min-width: 0; }}
  .row {{ display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }}
  figure {{ margin: 0; display: grid; gap: 6px; justify-items: center; max-width: 100%; }}
  figure img {{ image-rendering: pixelated; max-width: 100%; height: auto; }}
  figcaption {{ font-size: .8rem; color: var(--muted); text-align: center; }}
</style>
<main>
  <header>
    <h1>Mobs marked by the Unmaking</h1>
    <p class="muted">Purple cracks run through every monster's head, body and limbs, whatever its skin. A uses dark
      purple with a brighter heart; B glows, like the eyes, so it shines on the purple crawler too. The cracks move
      with the body in every pose. Version 2 of the locked mobs; the official files change only on approval
      &middot; 2026-10-27</p>
  </header>
  {cards}
</main>
"""
(HERE / "board.html").write_text(page, encoding="utf-8")
print(f"board.html: {len(page) // 1024} KB")
