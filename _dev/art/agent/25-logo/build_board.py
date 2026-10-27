"""Build the logo board: each concept as an app icon (1x, 2x, under the round and rounded-square
masks the phones apply, and at x4) and as the full logo with the wordmark. Run after
src/make_logo.py. Output: board.html.
"""
import base64
import html
import io
import pathlib

from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).parent
OUT = HERE / "out"
CONCEPTS = [
    ("shield", "A: The claw-struck shield",
     "The city's shield, struck by three ember claw marks. The dragon is there only by its mark: "
     "it defends the city, and its strike is the game's tap."),
    ("gate", "B: The gate under the ember moon",
     "Draconia's gate and towers, the hearth glowing behind the portcullis, a gold moon rising. "
     "The city the dragon guards, the place the whole game defends."),
    ("monogram", "C: The D monogram",
     "A bold gold D with Pyreth's ember burning in its heart. The simplest to read at small sizes, "
     "and it pairs directly with the wordmark."),
]


def uri(img):
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def fig(img, scale, caption):
    return (f'<figure><img src="{uri(img)}" width="{img.width * scale}" height="{img.height * scale}" '
            f'alt="{html.escape(caption)}"><figcaption>{html.escape(caption)}</figcaption></figure>')


def masked(img, shape, scale=2):
    """The icon at 2x under a phone's mask, so the edges show what a launcher would cut."""
    big = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
    m = Image.new("L", big.size, 0)
    d = ImageDraw.Draw(m)
    if shape == "circle":
        d.ellipse((0, 0, big.width - 1, big.height - 1), fill=255)
    else:
        d.rounded_rectangle((0, 0, big.width - 1, big.height - 1), radius=big.width // 4.5, fill=255)
    out = Image.new("RGBA", big.size, (0, 0, 0, 0))
    out.paste(big, (0, 0), m)
    return out


gif = HERE / "preview" / "splash.gif"
g = Image.open(gif)
chosen = (f'<figure><img src="data:image/gif;base64,{base64.b64encode(gif.read_bytes()).decode()}" '
          f'width="{g.width}" height="{g.height}" alt="The splash animation"><figcaption>The splash, x3: towers, '
          f'moon, windows, portcullis, the path of light, the wordmark</figcaption></figure>')
for name, cap in (("app_icon_1024", "The app icon (A), shown at 256"), ("app_adaptive_1024", "Android adaptive foreground (A), shown at 256")):
    im = Image.open(OUT / f"{name}.png")
    chosen += (f'<figure><img src="{uri(im)}" width="256" height="256" alt="{cap}"><figcaption>{cap}</figcaption></figure>')
intro = HERE / "preview" / "studio_intro.gif"
si = Image.open(intro)
studio = (f'<figure><img src="data:image/gif;base64,{base64.b64encode(intro.read_bytes()).decode()}" '
          f'width="{si.width}" height="{si.height}" alt="The Raxdeg Studios intro"><figcaption>The studio intro, x3: '
          f'the slam, the claws, then one more slash carves RAXDEG STUDIOS</figcaption></figure>')
anim = HERE / "preview" / "logo_anim.gif"
a = Image.open(anim)
chosen = (f'<figure><img src="data:image/gif;base64,{base64.b64encode(anim.read_bytes()).decode()}" '
          f'width="{a.width}" height="{a.height}" alt="Logo A in motion"><figcaption>A in motion, x4: the slam, '
          f'the claws, the debris</figcaption></figure>') + chosen
cards = ('<h3>Chosen: A is the logo and app icon, B is the splash</h3><p class="muted">The splash fades in from '
         'the dark one piece at a time in palette steps (silhouette, dusk, lit), 5.5 seconds in all, ending on a hold. A also has an intro of its own: the shield slams in from the foreground, the claws rip upward, the debris settles, about 3 seconds.</p>'
         f'<div class="tiles">{chosen}</div>')
for cid, title, note in CONCEPTS:
    icon = Image.open(OUT / f"logo_{cid}_icon.png").convert("RGBA")
    lock = Image.open(OUT / f"logo_{cid}_lockup.png").convert("RGBA")
    figs = (fig(icon, 1, "1x, a home screen") + fig(icon, 2, "2x") + fig(masked(icon, "circle"), 1, "Android round")
            + fig(masked(icon, "rounded"), 1, "iPhone rounded") + fig(icon, 4, "x4") + fig(lock, 3, "The logo, x3"))
    cards += (f"<h3>{html.escape(title)}</h3><p class=\"muted\">{html.escape(note)}</p>"
              f"<div class=\"tiles\">{figs}</div>")

# The bottom section: everything RAXDEG STUDIOS, the shield as the studio's startup splash.
FONTS = HERE.parent / "26-studio-fonts"
OPTIONS = [("light", "Light gold above", "The five-by-seven face in the gold ramp; the current intro."),
           ("steel", "Bold steel, framing", "A bold block face in silver above, STUDIOS in small spaced caps below."),
           ("ember", "Ember italic", "A bold face leaning like a slash, in ember tones."),
           ("ribbon", "The ribbon", "A parchment ribbon across the shield's foot, the name inked on it."),
           ("side", "Side by side", "A horizontal lockup: the shield left, RAXDEG over STUDIOS right.")]
opts = "".join(fig(Image.open(FONTS / "out" / f"studio_{k}.png").convert("RGBA"), 3, f"{t}: {n}") for k, t, n in OPTIONS)
data = (FONTS / "out" / "playground_data.json").read_text(encoding="utf-8").replace("</", "<\\/")
script = (FONTS / "playground.js").read_text(encoding="utf-8")
SEAL = HERE.parent / "27-raxdeg-seal"


def gif_fig(path, caption):
    im = Image.open(path)
    return (f'<figure><img src="data:image/gif;base64,{base64.b64encode(path.read_bytes()).decode()}" '
            f'width="{im.width}" height="{im.height}" alt="{html.escape(caption)}">'
            f'<figcaption>{html.escape(caption)}</figcaption></figure>')


seal_intros = "".join(gif_fig(SEAL / "preview" / f"seal_intro_{k}.gif", f"{label}, x2")
                      for k, label in (("gold", "Gold, engraved"), ("arcane", "Arcane, a spell circle"), ("wax", "Wax, pressed")))
build_fig = gif_fig(SEAL / "preview" / "seal_build.gif", "The seal builds, the name struck through it, x2")
build_v4 = gif_fig(SEAL / "preview" / "seal_build_v4.gif", "Before: the seal turned gold all at once, x2")
build_v3 = gif_fig(SEAL / "preview" / "seal_build_v3.gif", "Before: gold first, then the smaller name, x2")
build_v2 = gif_fig(SEAL / "preview" / "seal_build_v2.gif", "Before: the name arched over the top, x2")
build_v1 = gif_fig(SEAL / "preview" / "seal_build_v1.gif", "Before: the small name below, x2")
runic_figs = "".join(fig(Image.open(SEAL / "out" / f"runic_{k}.png").convert("RGBA"), 4, label)
                     for k, label in (("gold", "Gold"), ("arcane", "Arcane"), ("wax", "Ruby wax"), ("steel", "Steel")))
bottom = f"""
  <section class="studio">
    <h2>RAXDEG STUDIOS</h2>
    <p class="muted">The studio's startup splash, before the game's own. The shield belongs to the game, so the studio
      takes Raxdeg's own wax seal, with the shield's slam and slash. Raxdeg is Edgar, with an X; code is the spell,
      and calling it casts it.</p>
    <h3>The seal builds itself: arcane blue, then a gold SMASH</h3>
    <p class="muted">The plates land first: the body slams down in a ring of dust, then the three medallions land one
      by one, each with its own impact. Then the details are etched in arcane blue, a little at a time, each new cut
      flashing white: the triangle traces from the top medallion down and across, the runes burn in around the ring,
      the E, G and D appear, the small symbols, and the knot last, from its center out. Then the slash strikes
      straight through the blue seal and carves the name in gold behind it, in a larger runic face (fifteen pixels
      tall, drawn from the small face's own shapes: the T's drooping wings, the A's spike and dot, the O's diamond)
      with a two-pixel black outline, running past the ring on both sides. Then the gold spreads up and down from
      the cut, a white-hot edge running ahead of it, and the SMASH: a white-hot flash, a hard shake, a
      shockwave, and the seal is gold under the name. About 7 seconds on the first launch; later launches start
      at the finished blue etching (about 3 seconds). Locked in the official library and playing in the app.
      Beside it, the earlier versions.</p>
    <div class="tiles">{build_fig}{build_v4}{build_v3}{build_v2}{build_v1}</div>
    <h3>Earlier: the seal intro, in three finishes</h3>
    <p class="muted">The seal flies in from the foreground, unlit, and slams down in a ring of dust. Then the spell
      ignites: a white-hot wave runs out from the center knot to the outer ring and the seal cools to its finish.
      Last, the slash rips left to right and carves RAXDEG&middot;STVDIOS. About 4 seconds, then it holds.</p>
    <div class="tiles">{seal_intros}</div>
    <h3>The runic face, from the seal</h3>
    <p class="muted">One-pixel strokes and angular letters like the seal's runes, a dot inside the A and the O like the
      seal's dots, a V for U the way old inscriptions carve it, and a dot between the words.</p>
    <div class="tiles">{runic_figs}</div>
    <h3>Earlier: the shield version</h3>
    <p class="muted">The shield's slam and claws, then one more slash carves the name. The shield is now the game's
      alone; this stays for reference.</p>
    <div class="tiles">{studio}</div>
    <h3>Earlier: lettering ideas around the shield, x3</h3>
    <div class="tiles">{opts}</div>
    <h3>Playground</h3>
    <p class="muted">Pick an emblem, a face, a color, a layout, the letter spacing and the zoom; the card redraws in
      real pixels.</p>
    <div class="pg">
      <div class="controls">
        <label>Emblem <select id="pg-emblem">
          <option value="seal-gold">The seal, gold</option><option value="seal-arcane">The seal, arcane</option>
          <option value="seal-wax">The seal, wax</option><option value="shield">The shield</option></select></label>
        <label>Face <select id="pg-font">
          <option value="runic">Runic, from the seal (5x7)</option><option value="light">Light (5x7)</option><option value="bold">Bold block (7x9)</option>
          <option value="ember">Bold italic (6x7)</option><option value="tiny">Small caps (3x5)</option></select></label>
        <label>Color <select id="pg-color">
          <option value="gold">Gold</option><option value="arcane">Arcane</option><option value="steel">Steel</option><option value="ember">Ember</option>
          <option value="parchment">Parchment</option><option value="ruby">Ruby</option>
          <option value="emerald">Emerald</option><option value="ink">Ink (for the ribbon)</option></select></label>
        <label>Layout <select id="pg-layout">
          <option value="above">Name above</option><option value="below">Name below</option>
          <option value="split">RAXDEG above, STUDIOS below</option><option value="ribbon">Ribbon across the shield</option>
          <option value="side">Side by side</option></select></label>
        <label>Letter spacing <input id="pg-gap" type="range" min="1" max="3" value="1"> <output id="pg-gap-out">1</output></label>
        <label>Zoom <input id="pg-zoom" type="range" min="2" max="6" value="4"> <output id="pg-zoom-out">x4</output></label>
        <p class="muted" id="pg-size"></p>
      </div>
      <div class="stage"><canvas id="pg-canvas" aria-label="The studio card as set in the playground"></canvas></div>
    </div>
  </section>
  <script type="application/json" id="pg-data">{data}</script>
  <script>{script}</script>"""

page = f"""<meta charset="utf-8">
<title>Draconia Logo</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Nunito:wght@400;700&display=swap">
<style>
  :root {{ --bg: #1c1524; --panel: #281e32; --line: #463a5a; --fg: #ecd6aa; --muted: #9678a8;
    --gold: #f0c060; color-scheme: dark; }}
  body {{ background: var(--bg); color: var(--fg); font: 15px/1.55 Nunito, system-ui, sans-serif;
    padding-left: max(16px, env(safe-area-inset-left, 0px));
    padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 24px 48px; }}
  main {{ max-width: 1100px; margin: 0 auto; display: grid; gap: 14px; }}
  h1, h3 {{ font-family: Cinzel, Georgia, serif; color: var(--gold); margin: 0; text-wrap: balance; }}
  h1 {{ font-size: 1.7rem; }}
  h3 {{ font-size: .95rem; color: var(--fg); margin-top: 18px; }}
  p {{ margin: 0; max-width: 65ch; }}
  .muted {{ color: var(--muted); }}
  .tiles {{ display: flex; flex-wrap: wrap; gap: 16px 24px; align-items: flex-end;
    background: var(--panel); border: 1px solid var(--line); padding: 16px; }}
  figure {{ margin: 0; display: grid; gap: 6px; justify-items: center; max-width: 100%; }}
  figure img {{ image-rendering: pixelated; max-width: 100%; height: auto; }}
  figcaption {{ font-size: .8rem; color: var(--muted); text-align: center; }}
  h2 {{ font-family: Cinzel, Georgia, serif; color: var(--gold); margin: 0; font-size: 1.3rem; letter-spacing: .04em; }}
  .studio {{ display: grid; gap: 14px; margin-top: 40px; padding-top: 28px; border-top: 2px solid var(--line); min-width: 0; }}
  .pg {{ display: flex; flex-wrap: wrap; gap: 20px; background: var(--panel); border: 1px solid var(--line); padding: 16px; }}
  .controls {{ display: grid; gap: 12px; align-content: start; min-width: 220px; flex: 0 1 260px; }}
  .controls label {{ display: grid; gap: 4px; font-size: .85rem; color: var(--muted); }}
  .controls select, .controls input {{ font: inherit; color: var(--fg); background: var(--bg); border: 1px solid var(--line);
    padding: 6px 8px; min-height: 36px; }}
  .controls input[type=range] {{ padding: 0; accent-color: var(--gold); }}
  .controls output {{ color: var(--fg); }}
  .stage {{ flex: 1 1 300px; min-width: 0; display: grid; place-items: center; overflow-x: auto; }}
  #pg-canvas {{ image-rendering: pixelated; max-width: 100%; height: auto; }}
</style>
<main>
  <header>
    <h1>The Draconia Chronicles logo</h1>
    <p class="muted">One emblem as both the logo and the app icon. The protagonist stays with the artist, so the dragon
      appears only by its marks: its claws, its ember, the city it guards. Icons are 64x64 pixels, scaled by 16 to the
      stores' 1024x1024, with the emblem inside the middle the phones never crop. The wordmark is the same for all
      three &middot; 2026-10-27</p>
  </header>
  {cards}
  {bottom}
</main>
"""
(HERE / "board.html").write_text(page, encoding="utf-8")
print(f"board.html: {len(page) // 1024} KB")
