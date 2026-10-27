"""Build the mobs review board: each mob's idle, hit and hurt beside the townsfolk, and the mobs on
the Warfront at the backdrop's scale and at double. Run after src/make_mobs.py. Output: board.html.
"""
import base64
import html
import io
import pathlib

from PIL import Image

HERE = pathlib.Path(__file__).parent
OUT, PREVIEW = HERE / "out", HERE / "preview"
OFFICIAL = HERE.parents[1] / "official" / "people"
MOBS = [("kobold", "Kobold", "Small and scaly: swept-back horns, a pale snout, a tail, a short spear."),
        ("goblin", "Goblin", "A wide head with long ears, a toothy grin, a ragged tunic, a dagger."),
        ("crawler", "Shadow Crawler", "A round shadow-purple spider: eight legs, four glowing eyes, fangs."),
        ("orc", "Orc", "Big and ash-gray: tusks, a leather harness with steel shoulders, a heavy axe."),
        ("raider", "Raider", "A human bandit at townsfolk size: a dark hood, a cloth mask, a stolen sack, a blade.")]


def uri(img):
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def fig(img, scale, caption):
    return (f'<figure><img src="{uri(img)}" width="{img.width * scale}" height="{img.height * scale}" '
            f'alt="{html.escape(caption)}"><figcaption>{html.escape(caption)}</figcaption></figure>')


cards = ""
for mid, name, note in MOBS:
    figs = "".join(fig(Image.open(OUT / f"mob_{mid}_{st}.png").convert("RGBA"), 6, cap)
                   for st, cap in (("idle", "Idle"), ("hit", "Hit"), ("hurt", "Hurt")))
    cards += f"<h3>{html.escape(name)}</h3><p class=\"muted\">{html.escape(note)}</p><div class=\"tiles\">{figs}</div>"
folk = "".join(fig(Image.open(p).convert("RGBA"), 6, p.stem.replace("ppl_", "").replace("_", " "))
               for p in sorted(OFFICIAL.glob("ppl_*.png")) if "strip" not in p.name)
wf = Image.open(PREVIEW / "on_warfront.png").convert("RGBA")
half = (wf.width - 24) // 2
on_wf = fig(wf.crop((0, 0, half, wf.height)), 1, "At the backdrop's scale") + \
    fig(wf.crop((half + 24, 0, wf.width, wf.height)), 1, "At double")

page = f"""<title>Draconia Mobs</title>
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
    <h1>Simple mobs</h1>
    <p class="muted">The monsters redrawn in the townsfolk's language: front-on, flat, one color per part. Glowing gold
      eyes, their signature colors and a weapon mark them as enemies; no townsperson shares any of the three
      &middot; 2026-10-27</p>
  </header>
  <section>
    <h2>The mobs, idle, hit and hurt (x6)</h2>
    {cards}
  </section>
  <section>
    <h2>Beside the townsfolk (x6)</h2>
    <div class="tiles">{folk}</div>
  </section>
  <section>
    <h2>On the Warfront</h2>
    <p class="muted">A goblin at the gate, a kobold and an orc on the road. At the backdrop's scale they are small to
      tap; at double they read and tap easily, with pixels twice the backdrop's.</p>
    <div class="tiles">{on_wf}</div>
  </section>
</main>
"""
(HERE / "board.html").write_text(page, encoding="utf-8")
print(f"board.html: {len(page) // 1024} KB")
