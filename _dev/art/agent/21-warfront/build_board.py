"""Build the Batch 4 review board: the Warfront base and the gate's four states, the torch, and
every monster's idle, hit and hurt. Run after src/make_warfront.py. Output: board.html.
"""
import base64
import html
import io
import pathlib

from PIL import Image

HERE = pathlib.Path(__file__).parent
OUT, PREVIEW, REF = HERE / "out", HERE / "preview", HERE.parents[1] / "reference"
MONSTERS = [("goblin", "Goblin", "b-goblin"), ("kobold", "Kobold", "b-kobold"),
            ("crawler", "Shadow Crawler", "b-crawler"), ("ashen-orc", "Ashen Orc", "b-ashen-orc"),
            ("raider", "Raider (food raid, new)", None), ("minotaur", "Minotaur (boss, future)", "b-minotaur")]


def uri(img):
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def fig(img, scale, caption, src=None):
    return (f'<figure><img src="{src or uri(img)}" width="{img.width * scale}" height="{img.height * scale}" '
            f'alt="{html.escape(caption)}"><figcaption>{html.escape(caption)}</figcaption></figure>')


strip = Image.open(PREVIEW / "gate_states_x2.png").convert("RGBA")
panel_w = (strip.width - 4 * 16) // 5
gates = ""
for i, cap in enumerate(("Base, no wall", "Sound", "Cracking", "Failing", "Breached")):
    gates += fig(strip.crop((i * (panel_w + 16), 0, i * (panel_w + 16) + panel_w, strip.height)), 1, cap)
torch_gif = PREVIEW / "torch.gif"
torch = fig(Image.open(torch_gif), 1, "Gate torch, 3 frames at 6 fps",
            "data:image/gif;base64," + base64.b64encode(torch_gif.read_bytes()).decode())
mons = ""
for mid, name, ref in MONSTERS:
    idle = Image.open(REF / f"{ref}.png" if ref else OUT / f"mon_{mid}_idle.png").convert("RGBA")
    figs = fig(idle, 4, "Idle") + "".join(
        fig(Image.open(OUT / f"mon_{mid}_{st}.png").convert("RGBA"), 4, cap)
        for st, cap in (("hit", "Hit: recoil"), ("hurt", "Hurt: below half HP")))
    mons += f"<h3>{html.escape(name)}</h3><div class=\"tiles\">{figs}</div>"

page = f"""<title>Draconia Warfront</title>
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
</style>
<main>
  <header>
    <h1>The Warfront</h1>
    <p class="muted">Batch 4 &middot; the gate and wall as their own sprite in four states over a base with the wall
      removed, the gate torches, and every monster's hit and hurt &middot; 2026-10-26</p>
  </header>
  <section>
    <h2>The gate, sound to breached (x2)</h2>
    <p class="muted">The base carries the road down where the wall stood, so the breach opens onto ground. The wall is
      in the backdrop's muted purple stone; the torches burn on in every state.</p>
    <div class="tiles">{gates}</div>
    <div class="tiles">{torch}</div>
  </section>
  <section>
    <h2>The monsters (x4)</h2>
    <p class="muted">Hit and hurt move the idle's own pixels, so each keeps its exact silhouette, size and colors.
      Hit: the upper body snaps back and the eyes shut. Hurt: hunched two pixels, eyes half-lidded, bruised in the
      monster's own darker tone, the weapon broken. No gore.</p>
    {mons}
  </section>
</main>
"""
(HERE / "board.html").write_text(page, encoding="utf-8")
print(f"board.html: {len(page) // 1024} KB")
