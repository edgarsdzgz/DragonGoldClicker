"""Batch 4: the Warfront. Writes:

- out/map_warfront_base.png: the painted backdrop with the gate and wall taken out and the road
  and ground carried down to the bottom edge (the backdrop keeps its own colors).
- out/map_gate_<state>.png: the wall and gate in four states, full width, anchored on the wall line
  (see out/map_gate.json for where it and the torches go).
- out/map_torch_strip3.png: the gate torch, three frames.
- out/mon_<monster>_hit.png and _hurt.png for each monster, made by moving the idle's own pixels
  (the silhouette, size and palette stay the idle's); the raider's idle is drawn here too.

The Warfront is always night, so these are drawn in its night values, not the lit look.
Run: python make_warfront.py
"""
import json
import math
import pathlib
import random
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
BATCH = HERE.parent
ART = BATCH.parents[1]
sys.path.insert(0, str(BATCH.parent / "00-foundation"))

import pixkit  # noqa: E402

P = pixkit.PALETTE
REF = ART / "reference"
OUT, PREVIEW = BATCH / "out", BATCH / "preview"
INK = P["ink"]
W, H = 130, 282
WALL_Y = 222          # the top of the gate sprite's box (the gatehouse merlons start at 224)
GATE_H = H - WALL_Y   # 60
TORCHES = [(13, 23), (111, 23)]  # torch positions inside the gate box (x, y of the strip's top-left)


def rgb(name):
    return P[name] + (255,)


# =============================================================================== base map ==
def base_map():
    """Carry the road and ground down under where the wall was: each new row copies a row from
    above, stretched about the road's center so the road keeps widening toward the viewer."""
    src = Image.open(REF / "warfront-bg.png").convert("RGBA")
    out = src.copy()
    road = src.getpixel((65, 215))[:3]

    def half_width(y):  # how far the road reaches from the center on row y
        n = 0
        while 65 + n < W - 1 and src.getpixel((65 + n, y))[:3] == road:
            n += 1
        return n

    hw = {y: half_width(y) for y in range(170, WALL_Y)}
    ys = [y for y in hw if hw[y] > 0]
    slope = (hw[ys[-1]] - hw[ys[0]]) / max(1, ys[-1] - ys[0])
    for y in range(WALL_Y, H):
        ysrc = WALL_Y - 2 + (y % 2)  # the last two rows, alternating: no seams, the dither unbroken
        want = hw[ys[-1]] + slope * (y - ys[-1])
        k = hw[ysrc] / want if want else 1
        for x in range(W):
            d = x - 65
            reach = want + 8
            xs = 65 + d * k if abs(d) <= reach else x
            xs = int(round(max(0, min(W - 1, xs))))
            c = src.getpixel((xs, ysrc))
            if abs(d) < want - 1 and c[:3] != road:
                c = road + (255,)  # no copied pebbles: they would line up down the road
            out.putpixel((x, y), c)
    pebble = src.getpixel((65, 212))
    rng = random.Random(4)
    for y in range(WALL_Y, H):          # scatter fresh pebbles over the new stretch of road
        want = hw[ys[-1]] + slope * (y - ys[-1])
        if rng.random() < 0.35:
            out.putpixel((int(65 + rng.uniform(-want + 2, want - 2)), y), pebble)
    return out


# =============================================================================== the gate ==
STONE = {"light": "night3", "face": "night2", "shade": "night1", "mortar": "night1"}


def gate(state):
    """The wall across the bottom with merlons, the raised gatehouse in the middle; damage grows
    with the state: sound, cracking, failing, breached."""
    img = Image.new("RGBA", (W, GATE_H), (0, 0, 0, 0))
    px = img.load()
    rng = random.Random({"sound": 1, "cracking": 2, "failing": 3, "breached": 4}[state])

    def put(x, y, name):
        if 0 <= x < W and 0 <= y < GATE_H:
            px[x, y] = rgb(name)

    def stones(x0, y0, x1, y1, block=8, course=5):
        for y in range(y0, y1 + 1):
            row, n = (y - y0) % course, (y - y0) // course
            for x in range(x0, x1 + 1):
                joint = row == course - 1 or (x - x0 + (n % 2) * 4) % block == 0
                put(x, y, STONE["mortar"] if joint else (STONE["light"] if row == 0 else STONE["face"]))

    wall_top = 14                       # the wall walk (row 236 on the map)
    gh0, gh1, gtop = 40, 91, 8          # the gatehouse: x range and its top row (230 on the map)
    stones(0, wall_top, W - 1, GATE_H - 1)
    for x in range(0, W, 9):            # the wall's merlons
        for dx in range(5):
            for y in range(wall_top - 4, wall_top):
                if not gh0 - 1 <= x + dx <= gh1 + 1:
                    put(x + dx, y, STONE["light"] if y == wall_top - 4 else STONE["face"])
    stones(gh0, gtop, gh1, wall_top + 13, block=7)
    for x in range(gh0, gh1 + 1, 10):   # the gatehouse merlons
        for dx in range(6):
            for y in range(gtop - 5, gtop):
                if x + dx <= gh1:
                    put(x + dx, y, STONE["light"] if y == gtop - 5 else STONE["face"])
    for y in range(gtop - 5, wall_top + 14):
        put(gh1, y, STONE["shade"])
    for x in range(gh0, gh1 + 1):       # the gatehouse stands in front of the wall walk
        put(x, wall_top + 14, "ink")

    def crack(x, y, length, spread=1):
        for _ in range(length):
            put(x, y, "ink")
            put(x + 1, y, "steel1")  # the pale broken lip beside the crack
            y += 1
            x += rng.choice((-1, 0, 0, 1)) * spread

    def bite(cx, cy, r):
        """Knock a chunk out: clear it, so the ground behind shows."""
        for y in range(int(cy - r), int(cy + r) + 1):
            for x in range(int(cx - r * 1.4), int(cx + r * 1.4) + 1):
                if math.hypot((x - cx) / 1.4, y - cy) <= r + rng.uniform(-0.6, 0.6) and 0 <= x < W and 0 <= y < GATE_H:
                    px[x, y] = (0, 0, 0, 0)

    if state in ("cracking", "failing", "breached"):
        crack(52, gtop, 14)
        crack(78, gtop + 2, 11)
        crack(22, wall_top, 9)
        crack(108, wall_top + 1, 8)
        bite(gh0 + 23, gtop - 3, 1.6)   # a merlon chipped
    if state in ("failing", "breached"):
        crack(60, gtop, 20)
        crack(70, gtop, 18)
        crack(45, wall_top + 2, 12)
        crack(88, wall_top + 3, 12)
        bite(gh0 + 5, gtop - 3, 2.6)
        bite(gh1 - 4, gtop - 2, 2.8)
        bite(14, wall_top - 2, 2.4)
        bite(118, wall_top - 2, 2.2)
    if state == "breached":
        for y in range(0, GATE_H):      # the gatehouse smashed open down to the ground
            span = 6 + (GATE_H - y) // 4 + rng.choice((-2, -1, 0, 1, 2))
            lean = rng.choice((-1, 0, 1))
            for x in range(65 - span + lean, 66 + span + lean):
                if 0 <= x < W:
                    px[x, y] = (0, 0, 0, 0)
        bite(gh0 + 10, gtop + 2, 3.4)
        bite(gh1 - 10, gtop + 3, 3.0)
        for x in range(46, 86):         # rubble spilling through the breach
            hgt = rng.choice((0, 1, 2, 2, 3))
            for dy in range(hgt):
                put(x, GATE_H - 1 - dy, STONE["face"] if dy == hgt - 1 else STONE["shade"])
    img = pixkit.outline(img)
    return img


def torch_strip():
    frames = []
    for f in range(3):
        img = Image.new("RGBA", (6, 12), (0, 0, 0, 0))
        g = img.load()
        for y in range(6, 12):
            g[2, y] = rgb("wood3")
            g[3, y] = rgb("wood2")
        g[1, 6] = rgb("steel1")
        g[4, 6] = rgb("steel1")
        flame = [[(2, 5, "fire1"), (3, 5, "fire1"), (2, 4, "fire2"), (3, 4, "fire2"), (2, 3, "fire3"), (3, 3, "fire2"), (2, 2, "fire2")],
                 [(2, 5, "fire1"), (3, 5, "fire1"), (2, 4, "fire2"), (3, 4, "fire3"), (3, 3, "fire2"), (2, 3, "fire1"), (3, 2, "fire2"), (3, 1, "fire1")],
                 [(2, 5, "fire1"), (3, 5, "fire2"), (2, 4, "fire3"), (3, 4, "fire2"), (2, 3, "fire2"), (1, 4, "fire1"), (2, 2, "fire1")]][f]
        for x, y, n in flame:
            g[x, y] = rgb(n)
        frames.append(pixkit.outline(img))
    return frames


# ============================================================================== monsters ==
def load(name):
    return Image.open(REF / f"{name}.png").convert("RGBA")


def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def shift_region(img, test, dx, dy):
    """Move every pixel that passes test(x, y) by (dx, dy); what it leaves behind goes clear, and
    it lands on top of whatever is there."""
    w, h = img.size
    src = img.load()
    moved = [(x, y, src[x, y]) for y in range(h) for x in range(w) if src[x, y][3] and test(x, y)]
    out = img.copy()
    o = out.load()
    for x, y, _ in moved:
        o[x, y] = (0, 0, 0, 0)
    for x, y, c in moved:
        if 0 <= x + dx < w and 0 <= y + dy < h:
            o[x + dx, y + dy] = c
    return out


def heal_outline(img):
    """Close gaps: ink any clear pixel touching a colored (non-ink) pixel."""
    w, h = img.size
    src = img.load()
    out = img.copy()
    o = out.load()
    for y in range(h):
        for x in range(w):
            if src[x, y][3]:
                continue
            for ddx, ddy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + ddx, y + ddy
                if 0 <= nx < w and 0 <= ny < h and src[nx, ny][3] and src[nx, ny][:3] != INK:
                    o[x, y] = INK + (255,)
                    break
    return out


def recolor(img, test, mapping):
    out = img.copy()
    o = out.load()
    for y in range(out.height):
        for x in range(out.width):
            c = o[x, y]
            if c[3] and test(x, y) and c[:3] in mapping:
                o[x, y] = mapping[c[:3]] + (255,)
    return out


def clear_where(img, test):
    out = img.copy()
    o = out.load()
    for y in range(out.height):
        for x in range(out.width):
            if test(x, y):
                o[x, y] = (0, 0, 0, 0)
    return out


def bruise(img, spots, body, dark):
    """Darken a few small patches of the body color to the monster's own darker tone."""
    out = img.copy()
    o = out.load()
    for cx, cy in spots:
        for x, y in ((cx, cy), (cx + 1, cy), (cx, cy + 1)):
            if 0 <= x < out.width and 0 <= y < out.height and o[x, y][3] and o[x, y][:3] == body:
                o[x, y] = dark + (255,)
    return out


# Each monster: the line above which the upper body moves (waist), which way is "back", its eye
# colors (shut to ink on a hit, half-lidded when hurt), its body and darker body color (bruises),
# and how its weapon breaks.
MONSTERS = {
    "goblin": dict(src="b-goblin", waist=22, back=0, eyes={"ffdc3c"}, lid="6e963c",
                   body="6e963c", dark="466428", spots=[(10, 12), (25, 9), (14, 30)],
                   weapon=lambda x, y: x >= 29 and y <= 17),
    "ashen-orc": dict(src="b-ashen-orc", waist=30, back=0, eyes={"e6aaff"}, lid="76707c",
                      body="76707c", dark="4e4856", spots=[(15, 10), (28, 20), (12, 36)],
                      weapon=lambda x, y: x >= 41 and y <= 21 and x + y <= 62),
    "crawler": dict(src="b-crawler", waist=24, back=0, eyes={"78f0ff"}, lid="5c3a78",
                    body="5c3a78", dark="3a224e", spots=[(16, 14), (30, 13)],
                    weapon=lambda x, y: x >= 44 and y >= 24),
    "kobold": dict(src="b-kobold", waist=21, back=1, eyes={"ffc440", "ff7828"}, lid="96a058",
                   body="707840", dark="4a502c", spots=[(6, 18), (16, 30)],
                   weapon=lambda x, y: x <= 9 and 22 <= y <= 31),
    "minotaur": dict(src="b-minotaur", waist=30, back=0, eyes=set(), lid=None,
                     body=None, dark=None, spots=[], weapon=lambda x, y: False),
}


def eye_cells(img, eyes):
    return [(x, y) for y in range(img.height) for x in range(img.width)
            if img.getpixel((x, y))[3] and "%02x%02x%02x" % img.getpixel((x, y))[:3] in eyes]


def hit_pose(img, m):
    """Recoil: the upper body snaps back (up, and away from the way it faces) and the eyes shut."""
    dx = m["back"]
    out = shift_region(img, lambda x, y: y < m["waist"], dx, -1)
    src, o = img.load(), out.load()
    r = m["waist"] - 1
    for x in range(img.width):  # the waist row stays where it was: the body stretches to follow
        if not o[x, r][3] and src[x, r][3]:
            o[x, r] = src[x, r]
    if m["eyes"]:
        cells = eye_cells(out, m["eyes"])
        if cells:
            mid = round(sum(y for _, y in cells) / len(cells))
            mapping = {hexrgb(e): hexrgb(m["lid"]) for e in m["eyes"]}
            out = recolor(out, lambda x, y: (x, y) in cells and y != mid, mapping)
            out = recolor(out, lambda x, y: (x, y) in cells and y == mid, {hexrgb(e): INK for e in m["eyes"]})
    return heal_outline(out)


def hurt_pose(img, m):
    """Wounded below half HP: hunched (the upper body sags two rows, a pixel forward), the eyes
    half-lidded, bruised in the monster's own darker tone, and the weapon broken. No gore."""
    fwd = -m["back"]
    out = shift_region(img, lambda x, y: y < m["waist"], fwd, 2)
    out = clear_where(out, lambda x, y: m["weapon"](x, y))
    if m["eyes"]:
        cells = eye_cells(out, m["eyes"])
        if cells:
            top = min(y for _, y in cells)
            out = recolor(out, lambda x, y: (x, y) in cells and y == top,
                          {hexrgb(e): hexrgb(m["lid"]) for e in m["eyes"]})
    if m["body"]:
        out = bruise(out, [(x + fwd, y + 2 if y < m["waist"] else y) for x, y in m["spots"]],
                     hexrgb(m["body"]), hexrgb(m["dark"]))
    return heal_outline(out)


def raider_idle():
    """A human bandit from the food raid: a dark hood and cloak, a cloth mask over the face, a
    stolen sack over one shoulder, a short blade. Never a townsperson's colors."""
    rows = [
        "....................................",
        "....................................",
        "..............aaaaaaa...............",
        ".............annnnnnna..............",
        "............annnnnnnnna.............",
        "...........annnmmmmmnnna............",
        "...........annmssssmmnna............",
        "...........annmsasassmna............",
        "...........annmmmmmmmnna............",
        "...........annmwwwwwwmna............",
        "...........annwwkwwkwwna............",
        "............anwwwwwwwna.............",
        "............aannnnnnnaa.............",
        "..........aannnnnnnnnnnaaa..........",
        ".........annnnnnnnnnnnnnppa.........",
        "........annnnnnnnnnnnnnpppppa.......",
        "........annnnnnnnnnnnnpppppppa......",
        ".......annnnnnnnnnnnnnpppqppppa.....",
        ".......annnnnnnnnnnnnnppppppppa.....",
        "......annnnnnnnnnnnnnnppppqpppa.....",
        "......annnnnnnnnnnnnnnnpppppppa.....",
        "......annnnbbbbbbbbbbbnnppppppa.....",
        "......ansnnbbobbbbbbbbnnnppppa......",
        "......assnnnnnnnnnnnnnnnnaaaa.......",
        ".....aessnnnnnnnnnnnnnnnna..........",
        "....aeeasnnnnnnnnnnnnnnnna..........",
        "...aeea.annnnnnnnnnnnnnnna..........",
        "..aeea..annnnnnnnnnnnnnnna..........",
        ".aeea...annnnnnnnnnnnnnnna..........",
        ".aea....annnnnnnnnnnnnnnna..........",
        "..a.....annnnnnnnnnnnnnnna..........",
        "........annnnnnnnnnnnnnnna..........",
        "........annnnnnnnnnnnnnnna..........",
        "........annnnnnnaannnnnnna..........",
        "........annnnnnna.annnnnna..........",
        ".........attttta...attttta..........",
        ".........attttta...attttta..........",
        ".........attttta...attttta..........",
        ".........attttta...attttta..........",
        "........abbbbbba...abbbbbba.........",
        "........abbbbbba...abbbbbba.........",
        "........aaaaaaaa...aaaaaaaa.........",
        "....................................",
        "...................................."]
    key = {"a": "ink", "n": "night2", "m": "night3", "s": "skin1", "w": "wood1", "k": "wood2",
           "p": "parch2", "q": "parch1", "b": "wood2", "o": "steel3", "e": "steel4", "t": "night1"}
    return pixkit.from_grid(rows, key)


RAIDER = dict(waist=22, back=0, eyes=set(), lid=None, body=None, dark=None,
              spots=[], weapon=lambda x, y: x <= 4 and y >= 26)


# ================================================================================= write ==
def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    base = base_map()
    base.save(OUT / "map_warfront_base.png")
    gates = {s: gate(s) for s in ("sound", "cracking", "failing", "breached")}
    for s, g in gates.items():
        g.save(OUT / f"map_gate_{s}.png")
    torches = torch_strip()
    pixkit.strip(torches).save(OUT / "map_torch_strip3.png")
    pixkit.write_gif(torches, 6, PREVIEW / "torch.gif", scale=8)
    (OUT / "map_gate.json").write_text(json.dumps({
        "gate": {"x": 0, "y": WALL_Y, "width": W, "height": GATE_H, "states": list(gates)},
        "torches": [{"x": x, "y": WALL_Y + y, "strip": "map_torch_strip3.png", "frames": 3, "fps": 6}
                    for x, y in TORCHES]}, indent=2) + "\n", encoding="utf-8")

    rows = []
    for name, m in MONSTERS.items():
        idle = load(m["src"])
        hit, hurt = hit_pose(idle, m), hurt_pose(idle, m)
        hit.save(OUT / f"mon_{name}_hit.png")
        hurt.save(OUT / f"mon_{name}_hurt.png")
        rows.append((name, [idle, hit, hurt]))
    r_idle = raider_idle()
    r_hit, r_hurt = hit_pose(r_idle, RAIDER), hurt_pose(r_idle, RAIDER)
    for st, im in (("idle", r_idle), ("hit", r_hit), ("hurt", r_hurt)):
        im.save(OUT / f"mon_raider_{st}.png")
    rows.append(("raider", [r_idle, r_hit, r_hurt]))
    pixkit.contact_sheet(rows, scale=5).save(PREVIEW / "monsters_x5.png")

    scenes = []
    for s, g in gates.items():
        sc = base.copy()
        sc.alpha_composite(g, (0, WALL_Y))
        for x, y in TORCHES:
            sc.alpha_composite(torches[0], (x, WALL_Y + y))
        scenes.append(sc)
    board = Image.new("RGBA", (W * 5 + 32, H), P["night1"] + (255,))
    board.paste(base, (0, 0))
    for i, sc in enumerate(scenes):
        board.paste(sc, ((i + 1) * (W + 8), 0))
    pixkit.upscale(board, 2).save(PREVIEW / "gate_states_x2.png")
    print("written")


if __name__ == "__main__":
    main()
