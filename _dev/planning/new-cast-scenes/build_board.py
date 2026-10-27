"""The new cast's scenes, draft v1: one live phone per chapter, then the script with every line's face.

Writes board.html beside this script. Art is the app's own copy of the official sprites (assets/art).
Nothing here is in the game: on the owner's approval the lines go into src/data/story/lines.ts.
"""
import base64
import html
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
ART = ROOT / "assets/art"
OUT = pathlib.Path(__file__).with_name("board.html")


def uri(rel):
    return "data:image/png;base64," + base64.b64encode((ART / f"{rel}.png").read_bytes()).decode()


NAMES = {
    "pyreth": "Elder Pyreth", "mirael": "Scout Mirael", "lirae": "Lirae the Ink-Wing", "varn": "Varn",
    "sera": "Sera the Shieldmaiden", "thornwick": "Thornwick", "ashara": "Ashara the Elder Wyrm",
    "hollow-knight": "The Hollow Knight",
}
# Faces locked before the standard set keep their own names (src/art/cast.ts FACE_FILE)
FACE_FILE = {("varn", "determined"): "fierce", ("sera", "determined"): "roaring", ("thornwick", "alarmed"): "startled"}
BACKDROP = {"city": uri("city/map_city_base"),"warfront": uri("warfront/map_warfront_base")}


def face(who, mood):
    return f"cast/bust_{who}" + (f"_{FACE_FILE.get((who, mood), mood)}" if mood else "")


# Each chapter: its scenes in order. A scene is one speaker; two scenes back to back on one stage
# make a conversation (as the Breach does). Lines are (mood or None for neutral, text).
CHAPTERS = [
    {
        "n": 9, "title": "A Small Pair of Wings", "back": "city", "end": "Welcome him",
        "when": "A minute after the claws are reforged in Dragonsteel (the Reforge the Claws quest).",
        "brings": "A second, small dragon on the wall who strikes on his own. Needs a small Varn sprite on the "
                  "Warfront (new art).",
        "scenes": [
            {"who": "lirae", "stage": ["lirae", "varn"], "lines": [
                ("alarmed", "My lord, someone is circling the Keep. Oh! Oh. Varn? Varn, is that you?"),
                ("happy", "He was a first-year at the Academy. I thought no one else got out."),
            ]},
            {"who": "varn", "stage": ["lirae", "varn"], "lines": [
                ("happy", "Lirae! And you're the dragon on the gate. You're even bigger than the stories."),
                ("grieving", "I hid in the bell tower when the Rift opened. I've been hiding ever since. I'm done hiding."),
                ("determined", "I want to fight like you. Let me stand on the wall. I can breathe fire. A little."),
            ]},
        ],
    },
    {
        "n": 10, "title": "She Did Not Ask", "back": "warfront", "end": "To the wall", "sting": "Sera (shield bash)",
        "when": "During a siege, the next time the wall drops below half its strength after Varn's chapter.",
        "brings": "A shield wall: monsters that reach the wall strike it for less.",
        "scenes": [
            {"who": "sera", "lines": [
                ("determined", "Shields up, little ones! Hold that line!"),
                ("happy", "Hah! That's better. So you're the gate-dragon. Sera, of the northern clans."),
                ("grieving", "My clan held the high pass until there was no pass left to hold. I walked south, toward "
                             "the sound of a fight."),
                (None, "Don't thank me. Give me the front of the wall and a shield that won't split."),
            ]},
        ],
    },
    {
        "n": 11, "title": "The Exile", "back": "city", "end": "Build the tower", "sting": "Thornwick (spark)",
        "when": "An expedition brings him home: the first expedition to return after Sera's chapter.",
        "brings": "The Wizard's Tower, as the story plan already says (its interior header is drawn).",
        "scenes": [
            {"who": "mirael", "stage": ["mirael", "thornwick"], "lines": [
                ("worried", "My lord, the expedition found someone in the eastern ruins. He was setting a monster on "
                            "fire at the time."),
                (None, "He says he is a mage. He also says the fire was on purpose."),
            ]},
            {"who": "thornwick", "stage": ["mirael", "thornwick"], "lines": [
                ("happy", "Thornwick, at your service. Formerly of the eastern towers. They asked me to leave after "
                          "the third fire."),
                ("alarmed", "The first two were not my fault! The third was... a learning experience."),
                ("determined", "Give me a tower, high up and well away from anything that burns, and I will show that "
                               "horde what a real fire looks like."),
            ]},
        ],
    },
    {
        "n": 12, "title": "The Eldest", "back": "city", "end": "Continue",
        "when": "The first time the Unmaking rises to its highest tier.",
        "brings": "Her strength behind yours: your strikes hit harder.",
        "scenes": [
            {"who": "pyreth", "stage": ["pyreth", "ashara"], "lines": [
                ("alarmed", "My lord, something vast is coming down from the mountain. No, hold your fire!"),
                ("happy", "Ashara. I thought we had lost you. She is the eldest of us, my lord, older than these walls."),
            ]},
            {"who": "ashara", "stage": ["pyreth", "ashara"], "lines": [
                (None, "Pyreth. You got old. And this is the one who holds the gate? Smaller than I pictured."),
                ("grieving", "I slept beneath the mountain while the world came apart. I woke to silence where my kin "
                             "should be."),
                ("angry", "I am old. I am tired. And I am very, very angry."),
                ("determined", "Let them come to the wall. They will learn why the old ones were feared."),
            ]},
        ],
    },
    {
        "n": 13, "title": "The Hollow Knight", "back": "warfront", "end": "Continue",
        "sting": "The Hollow Knight (armor, hollow echo)",
        "when": "After Ashara's chapter, the first night a boss falls at the gate.",
        "brings": "It holds the gate while you are away: your army counts for more in time away.",
        "scenes": [
            {"who": "hollow-knight", "lines": [
                (None, "..."),
                (None, "I have come to stand at your gate."),
                ("grieving", "Do not ask my name. I have none left to give."),
                ("determined", "Point me at the dark. I will walk into it."),
            ]},
        ],
    },
]

# Every face the board shows, once, keyed by its file
ARTS = {}
for ch in CHAPTERS:
    for sc in ch["scenes"]:
        for who in sc.get("stage") or [sc["who"]]:
            ARTS.setdefault(face(who, None), uri(face(who, None)))
        for mood, _ in sc["lines"]:
            ARTS.setdefault(face(sc["who"], mood), uri(face(sc["who"], mood)))
SIGILS = {who: uri(f"cast/cast_sigil-{who}") for who in NAMES}

# The phones' data: a flat list of lines per chapter, each knowing its speaker, face and stage
DEMOS = []
for ch in CHAPTERS:
    flat = []
    for sc in ch["scenes"]:
        for mood, text in sc["lines"]:
            flat.append({"who": sc["who"], "face": face(sc["who"], mood), "stage": sc.get("stage"), "text": text})
    DEMOS.append({"end": ch["end"], "title": ch["title"].upper(), "back": ch["back"], "lines": flat})


def script(ch):
    rows = []
    for sc in ch["scenes"]:
        for mood, text in sc["lines"]:
            rows.append(
                f'<li><img class="px th" src="{ARTS[face(sc["who"], mood)]}" alt="">'
                f'<div><b>{html.escape(NAMES[sc["who"]])}</b> <span class="mood">{mood or "neutral"}</span>'
                f'<p>{html.escape(text)}</p></div></li>')
    return "".join(rows)


def chapter(i, ch):
    sting = f'<dt>Sting</dt><dd>{html.escape(ch["sting"])}, as they first appear</dd>' if ch.get("sting") else ""
    talk = " A conversation: two scenes back to back on one stage." if len(ch["scenes"]) > 1 else ""
    return f"""<section class="ch">
<div class="txt">
<p class="num">Chapter {ch["n"]}</p><h2>{html.escape(ch["title"])}</h2>
<dl><dt>When</dt><dd>{html.escape(ch["when"])}{talk}</dd>
<dt>Brings</dt><dd>{html.escape(ch["brings"])} <span class="open">Your call.</span></dd>{sting}</dl>
<ol class="script">{script(ch)}</ol>
</div>
<div class="phone" data-i="{i}" role="button" tabindex="0" aria-label="Chapter {ch["n"]} preview, tap to advance">
<img class="bg px" alt=""><div class="dim"></div><div class="ttl"></div><div class="stage"></div></div>
</section>"""


page = f"""<title>New Cast Scenes</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
:root {{ --bg:#0f0d0b; --s1:#161412; --s2:#1e1c19; --line:#2a2622; --text:#f1f1f5; --muted:#a3a3ad; --gold:#e0a840;
  color-scheme: dark }}
body {{ background:var(--bg); color:var(--text); font-family: system-ui, sans-serif; margin:0;
  padding-block: 24px 40px; padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)) }}
h1 {{ font-size:22px; margin:0 0 6px; text-wrap:balance }}
.intro {{ color:var(--muted); max-width:66ch; margin:0 0 28px; line-height:1.55 }}
.ch {{ display:flex; flex-wrap:wrap; gap:20px 32px; align-items:flex-start; padding:28px 0; border-top:1px solid var(--line) }}
.txt {{ flex:1 1 320px; min-width:0; max-width:620px }}
.num {{ margin:0; color:var(--gold); font:700 12px system-ui; letter-spacing:2px; text-transform:uppercase }}
h2 {{ font-size:19px; margin:4px 0 12px }}
dl {{ display:grid; grid-template-columns:auto 1fr; gap:6px 14px; margin:0 0 16px; line-height:1.5 }}
dt {{ color:var(--muted); font-size:13px; text-transform:uppercase; letter-spacing:1px; padding-top:2px }}
dd {{ margin:0 }} .open {{ color:var(--gold); font-size:13px }}
.script {{ list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px }}
.script li {{ display:flex; gap:12px; align-items:flex-start; background:var(--s1); border:1px solid var(--line); border-radius:10px; padding:8px 12px 8px 8px }}
.script li div {{ min-width:0 }} .script p {{ margin:2px 0 0; line-height:1.5 }}
.mood {{ color:var(--muted); font-size:12px; margin-left:6px }}
.th {{ width:66px; height:69px; flex:0 0 auto; background:var(--s2); border-radius:6px }}
.px, .bg {{ image-rendering: pixelated }}
.phone {{ position:relative; width:min(320px, 100%); aspect-ratio: 9 / 18; border-radius:22px; overflow:hidden;
  border:3px solid #2b2724; background:#000; cursor:pointer; user-select:none; flex:0 0 auto }}
.phone:focus-visible {{ outline:3px solid var(--gold); outline-offset:3px }}
.bg {{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position: top }}
.dim {{ position:absolute; inset:0; background:rgba(2,2,6,.6) }}
.ttl {{ position:absolute; top:14px; left:16px; color:var(--muted); font:12px system-ui; letter-spacing:2px }}
.stage {{ position:absolute; left:10px; right:10px; bottom:18px }}
.box {{ position:relative; background:var(--s1); border:1.5px solid rgba(224,168,64,.45); border-radius:10px;
  padding:16px 16px 30px; min-height:110px }}
.box p {{ margin:0; font-size:15px; line-height:22px; color:var(--text) }}
.cue {{ position:absolute; right:12px; bottom:8px; display:flex; align-items:center; gap:6px; color:var(--gold); font:700 12px system-ui }}
.cue i {{ width:0; height:0; border-top:5px solid transparent; border-bottom:5px solid transparent; border-left:7px solid var(--gold) }}
.cue.hidden {{ visibility:hidden }}
.plate {{ position:absolute; top:-15px; display:inline-flex; align-items:center; gap:6px; background:var(--s2);
  border:1.5px solid rgba(224,168,64,.45); border-radius:6px; padding:3px 10px; color:var(--gold); font:700 11px system-ui; letter-spacing:1px; z-index:2 }}
.plate img {{ width:14px; height:14px }} .plate.left {{ left:12px }} .plate.right {{ right:12px }}
.cast {{ position:absolute; left:0; right:0; bottom:100%; display:flex; margin-bottom:-4px }}
.cast.solo {{ justify-content:flex-start; padding-left:4px }} .cast.solo img {{ width:132px }}
.cast.pair {{ justify-content:space-between }} .cast.pair img {{ width:112px }}
.cast img.right {{ transform: scaleX(-1) }} .cast img.quiet {{ opacity:.35 }}
</style>
<h1>The new cast: chapters 9 to 13 (draft v1)</h1>
<p class="intro">Varn, Sera, Thornwick, Ashara and the Hollow Knight have every face but no lines yet. This is a
draft of when each one arrives, what they could bring, and what they say, in the order the old plan had them.
The story is paused after chapter 8 (Dragonsteel), so these would be the next five chapters. Each phone plays its
chapter over the game's own backdrop, the way the dialogue box shows it: tap (or press Enter) to type a line,
tap again for the next. The script beside it lists every line with the face it plays in. The "Brings" line is
only a suggestion; what each one does in the game is your decision. Drafted 2026-10-27; nothing here is in the
game yet.</p>
{"".join(chapter(i, ch) for i, ch in enumerate(CHAPTERS))}
<script>
const ARTS = {json.dumps(ARTS)}, SIGILS = {json.dumps(SIGILS)}, NAMES = {json.dumps({k: v.upper() for k, v in NAMES.items()})};
const BACK = {json.dumps(BACKDROP)}, DEMOS = {json.dumps(DEMOS)};
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const bust = who => ARTS['cast/bust_' + who];
function render(el, d, st) {{
  const L = d.lines[st.i], last = st.i === d.lines.length - 1;
  let cast, side = 'left';
  if (L.stage) {{
    const [l, r] = L.stage; side = L.who === r ? 'right' : 'left';
    const img = (w, cls) => `<img class="px ${{cls}}${{w === L.who ? '' : ' quiet'}}" src="${{w === L.who ? ARTS[L.face] : bust(w)}}" alt="">`;
    cast = `<div class="cast pair">${{img(l, '')}}${{img(r, 'right')}}</div>`;
  }} else cast = `<div class="cast solo"><img class="px" src="${{ARTS[L.face]}}" alt=""></div>`;
  el.querySelector('.stage').innerHTML = `<div style="position:relative">${{cast}}<div class="box">` +
    `<div class="plate ${{side}}"><img class="px" src="${{SIGILS[L.who]}}" alt="">${{NAMES[L.who]}}</div><p></p>` +
    `<div class="cue hidden">${{last ? d.end : ''}}<i></i></div></div></div>`;
  const p = el.querySelector('.box p'), cue = el.querySelector('.cue');
  const done = () => {{ clearInterval(st.timer); p.textContent = L.text; st.typing = false; cue.classList.remove('hidden'); }};
  clearInterval(st.timer); st.finish = done;
  if (calm) return done();
  st.typing = true; let n = 0;
  st.timer = setInterval(() => {{ n += 1; p.textContent = L.text.slice(0, n); if (n >= L.text.length) done(); }}, 28);
}}
document.querySelectorAll('.phone').forEach(el => {{
  const d = DEMOS[+el.dataset.i], st = {{ i: 0 }};
  el.querySelector('.bg').src = BACK[d.back];
  el.querySelector('.ttl').textContent = d.title;
  const advance = () => {{ if (st.typing) return st.finish(); st.i = (st.i + 1) % d.lines.length; render(el, d, st); }};
  el.addEventListener('click', advance);
  el.addEventListener('keydown', e => {{ if (e.key === 'Enter' || e.key === ' ') {{ e.preventDefault(); advance(); }} }});
  render(el, d, st);
}});
</script>
"""
OUT.write_text(page, encoding="utf-8")
print(OUT, len(page) // 1024, "KB")
