"""Build the Batch 5 board: each effect's frames, and each effect playing over the Warfront.
Run after src/make_fx.py. Output: preview/*.gif and board.html.
"""
import base64
import html
import io
import pathlib

from PIL import Image

HERE = pathlib.Path(__file__).parent
OUT, PREVIEW = HERE / "out", HERE / "preview"
AGENT = HERE.parent
WF = AGENT / "21-warfront" / "out"
MOBS = AGENT / "22-mobs" / "out"
GATE_Y = 222


def load(p):
    return Image.open(p).convert("RGBA")


def frames(name):
    p = next(OUT.glob(f"fx_{name}_strip*.png"))
    s = load(p)
    n = int(p.stem.rsplit("strip", 1)[1])
    w = s.width // n
    return [s.crop((i * w, 0, (i + 1) * w, s.height)) for i in range(n)]


def warfront(gate="sound"):
    img = load(WF / "map_warfront_base.png")
    img.alpha_composite(load(WF / f"map_gate_{gate}.png"), (0, GATE_Y))
    torch = load(WF / "map_torch_strip3.png").crop((0, 0, 6, 12))
    for x in (13, 111):
        img.alpha_composite(torch, (x, 245))
    return img


def double(img):
    return img.resize((img.width * 2, img.height * 2), Image.NEAREST)


def scene(beats, crop, scale, path):
    """beats: [(image, ms)]; writes a GIF of the crop at a whole-number scale."""
    out = [b.crop(crop).resize(((crop[2] - crop[0]) * scale, (crop[3] - crop[1]) * scale), Image.NEAREST).convert("RGB")
           for b, _ in beats]
    out[0].save(path, save_all=True, append_images=out[1:], duration=[ms for _, ms in beats], loop=0)


def strike(fx, mob="goblin", feet=(65, 226)):
    """A mob at double size before the gate; the effect lands on its chest and it flashes red."""
    idle, hit = double(load(MOBS / f"mob_{mob}_idle.png")), double(load(MOBS / f"mob_{mob}_hit.png"))
    pos = (feet[0] - idle.width // 2, feet[1] - idle.height)
    chest = (feet[0], feet[1] - idle.height // 2)
    beats = []
    for i, f in enumerate([None] + fx + [None]):
        img = warfront()
        img.alpha_composite(hit if f is not None and i in (2, 3) else idle, pos)
        img.alpha_composite(load(WF / "map_gate_sound.png"), (0, GATE_Y))
        if f is not None:
            img.alpha_composite(f, (chest[0] - f.width // 2, chest[1] - f.height // 2))
        beats.append((img, 450 if f is None else 83))
    return beats


CROP = (25, 176, 105, 246)


def scenes():
    for v in ("plain", "gold", "ember"):
        scene(strike(frames(f"slash-{v}")), CROP, 4, PREVIEW / f"scene_slash-{v}.gif")
    scene(strike(frames("crit"), "orc"), CROP, 4, PREVIEW / "scene_crit.gif")
    scene(strike(frames("ally-hit"), "kobold"), CROP, 4, PREVIEW / "scene_ally-hit.gif")

    # Embers rising past the left torch.
    em = frames("ember")
    beats = []
    for t in range(18):
        img = warfront()
        for k, (x0, y0) in enumerate(((15, 246), (18, 250), (13, 252))):
            y = y0 - ((t + k * 6) % 18)
            img.alpha_composite(em[(t + k) % 3], (x0 + (1 if (t // 3) % 2 else 0), y - 4))
        beats.append((img, 125))
    scene(beats, (0, 220, 40, 260), 6, PREVIEW / "scene_ember.gif")

    # A kobold strikes the wall: two bob steps, then the impact at the wall top.
    walk = double(load(MOBS / "mob_kobold_walk_strip2.png"))
    steps = [walk.crop((0, 0, walk.width // 2, walk.height)), walk.crop((walk.width // 2, 0, walk.width, walk.height))]
    wi = frames("wall-impact")
    beats = []
    for i, f in enumerate([None, None] + wi + [None]):
        img = warfront()
        k = steps[i % 2] if f is None else steps[0]
        img.alpha_composite(k, (50 - k.width // 2, 226 - k.height))
        img.alpha_composite(load(WF / "map_gate_sound.png"), (0, GATE_Y))
        if f is not None:
            img.alpha_composite(f, (52 - f.width // 2, 232 - f.height))
        beats.append((img, 250 if f is None else 83))
    scene(beats, CROP, 4, PREVIEW / "scene_wall-impact.gif")

    # Repair sparkles over a crack in the cracking gate.
    rp = frames("repair")
    beats = []
    for t in range(8):
        img = warfront("cracking")
        img.alpha_composite(rp[t % 4], (52, 226))
        img.alpha_composite(rp[(t + 2) % 4], (70, 232))
        beats.append((img, 125))
    scene(beats, CROP, 4, PREVIEW / "scene_repair.gif")

    # The breach over the whole gate.
    br = frames("breach")
    beats = []
    for i, f in enumerate(br):
        img = load(WF / "map_warfront_base.png")
        img.alpha_composite(f, (0, GATE_Y))
        beats.append((img, 700 if i == 0 else 1200 if i == len(br) - 1 else 125))
    scene(beats, (0, 182, 130, 282), 3, PREVIEW / "scene_breach.gif")


def uri(path):
    kind = "gif" if path.suffix == ".gif" else "png"
    return f"data:image/{kind};base64," + base64.b64encode(path.read_bytes()).decode()


def strip_fig(name, caption):
    p = next(OUT.glob(f"fx_{name}_strip*.png"))
    img = Image.open(p)
    scale = 3 if name == "breach" else 6
    return (f'<figure><img src="{uri(p)}" width="{img.width * scale}" height="{img.height * scale}" '
            f'alt="{html.escape(caption)}"><figcaption>{html.escape(caption)}</figcaption></figure>')


def gif_fig(path, caption):
    img = Image.open(path)
    return (f'<figure><img src="{uri(path)}" width="{img.width}" height="{img.height}" '
            f'alt="{html.escape(caption)}"><figcaption>{html.escape(caption)}</figcaption></figure>')


FX = [
    ("slash-plain", "Slash, plain", "The tap strike: three claw marks swept down and to the left. 24x24, 4 frames at 12 fps. Plain steel for claw tiers 1 to 4."),
    ("slash-gold", "Slash, gold", "The same strike in gold, from the Serrated tier."),
    ("slash-ember", "Slash, ember", "The same strike in fire, from the Ember tier."),
    ("crit", "Critical hit", "Bigger and brighter than the slash: an eight-ray star that bursts into a ring. 24x24, 4 frames at 12 fps."),
    ("ally-hit", "Ally hit", "The army's strike: a steel-blue X, crossed blades, kept apart from the spark's plus. 16x16, 3 frames at 12 fps."),
    ("ember", "Ember", "A floating ember that flickers bright to dim; the game moves it. 4x4, 3 frames at 8 fps, loops."),
    ("wall-impact", "Wall impact", "A monster strikes the wall: a flash, stone chips in the gate's colors, a puff of dust. 20x16, 4 frames at 12 fps."),
    ("repair", "Repair", "Warm gold twinkles on the wall, three stars growing and fading in turn. 12x12, 4 frames at 8 fps, loops."),
    ("breach", "Breach", "The wall falls: dust bursts from the cracks, stone chunks tumble out, and the cloud thins to the breached gate. 130x60, 6 frames at 8 fps; the last frame is the breached gate."),
]


def main():
    scenes()
    cards = ""
    for name, title, note in FX:
        figs = strip_fig(name, "The frames")
        figs += gif_fig(PREVIEW / f"scene_{name}.gif", "On the Warfront")
        cards += f"<h3>{html.escape(title)}</h3><p class=\"muted\">{html.escape(note)}</p><div class=\"tiles\">{figs}</div>"
    page = f"""<title>Draconia Effects</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Nunito:wght@400;700&display=swap">
<style>
  :root {{ --bg: #1c1524; --panel: #281e32; --line: #463a5a; --fg: #ecd6aa; --muted: #9678a8;
    --gold: #f0c060; color-scheme: dark; }}
  body {{ background: var(--bg); color: var(--fg); font: 15px/1.55 Nunito, system-ui, sans-serif;
    padding-left: max(16px, env(safe-area-inset-left, 0px));
    padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 24px 48px; }}
  main {{ max-width: 1100px; margin: 0 auto; display: grid; gap: 14px; }}
  h1, h2, h3 {{ font-family: Cinzel, Georgia, serif; color: var(--gold); margin: 0; text-wrap: balance; }}
  h1 {{ font-size: 1.7rem; }}
  h3 {{ font-size: .95rem; color: var(--fg); margin-top: 18px; }}
  p {{ margin: 0; max-width: 65ch; }}
  .muted {{ color: var(--muted); }}
  .tiles {{ display: flex; flex-wrap: wrap; gap: 16px 20px; align-items: flex-end;
    background: var(--panel); border: 1px solid var(--line); padding: 16px; }}
  figure {{ margin: 0; display: grid; gap: 6px; justify-items: center; max-width: 100%; }}
  figure img {{ image-rendering: pixelated; max-width: 100%; height: auto; }}
  figcaption {{ font-size: .8rem; color: var(--muted); text-align: center; }}
</style>
<main>
  <header>
    <h1>Batch 5: effects</h1>
    <p class="muted">Effects are light, not objects: glow colors, no ink outline. The wall impact and the breach use the
      gate's own stone. The hit spark is already official. Mobs are shown at double size; the effects at the
      backdrop's scale &middot; 2026-10-27</p>
  </header>
  {cards}
</main>
"""
    (HERE / "board.html").write_text(page, encoding="utf-8")
    print(f"board.html: {len(page) // 1024} KB")


if __name__ == "__main__":
    main()
