"""Batch 2: the Draconia city base map and its shared plot pieces, drawn in the lit look.

Writes out/map_city_base.png (130x282, no buildings), map_plots.json (the ten plots), the plot
pieces per plot size (fog, cleared ground, foundation, scaffold), the two 8x8 map markers, and
preview boards (lit, dusk and night; the plots outlined; the pieces placed on their plots).
The game darkens the lit look with the night and dusk maps (pixkit.NIGHT, pixkit.DUSK).

Layout follows the old painted backdrop (`reference/city-bg.png`): the Keep at the top, the road
winding down to the gate in the city wall at the bottom. Run: python make_city.py
"""
import json
import math
import pathlib
import random
import sys

from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).resolve().parent
BATCH = HERE.parent
sys.path.insert(0, str(BATCH.parent / "00-foundation"))

import pixkit  # noqa: E402

P = pixkit.PALETTE
W, H = 130, 282
OUT, PREVIEW = BATCH / "out", BATCH / "preview"
WALL_TOP = 244  # first row of the city wall

# id: (x, y, w, h). Four sizes: the Keep, the towers on the wall, the Wizard's Tower, and a common
# 32x32 for the rest. Anchor: bottom center (where a building's base sits).
PLOTS = {
    "keep": (40, 16, 50, 82),
    "outpost": (8, 58, 32, 32),
    "wizard-tower": (96, 52, 24, 40),
    "housing": (72, 100, 32, 32),
    "lodge": (10, 112, 32, 32),
    "forge": (88, 142, 32, 32),
    "librarium": (10, 180, 32, 32),
    "garrison": (86, 182, 32, 32),
    "tower-west": (34, 214, 20, 32),
    "tower-east": (76, 214, 20, 32),
}
ROAD = [(65, 97), (66, 110), (62, 124), (57, 140), (56, 156), (60, 168), (68, 180), (72, 192),
        (68, 206), (61, 220), (60, 234), (63, 246)]


def put(img, x, y, name):
    if 0 <= x < img.width and 0 <= y < img.height:
        img.putpixel((x, y), P[name] + (255,))


def disc(img, cx, cy, r, name):
    for y in range(int(cy - r) - 1, int(cy + r) + 2):
        for x in range(int(cx - r) - 1, int(cx + r) + 2):
            if math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r:
                put(img, x, y, name)


def seg_dist(px, py, a, b):
    (ax, ay), (bx, by) = a, b
    vx, vy, wx, wy = bx - ax, by - ay, px - ax, py - ay
    t = max(0, min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy)))
    return math.hypot(px - (ax + t * vx), py - (ay + t * vy))


# ---------------------------------------------------------------------------- the base map --
def base_map():
    img = Image.new("RGBA", (W, H), P["green2"] + (255,))
    rng = random.Random(26)

    # Grass: flat clusters, never noise. Darker hollows and lit tufts, spaced out.
    for _ in range(26):
        x, y = rng.randrange(10, 120), rng.randrange(16, WALL_TOP - 6)
        for dx, dy in ((0, 0), (1, 0), (2, 0), (1, -1), (0, 1), (1, 1)):
            put(img, x + dx, y + dy, "green1")
    for _ in range(70):
        x, y = rng.randrange(8, 122), rng.randrange(14, WALL_TOP - 3)
        put(img, x, y, "green3")
        put(img, x - 1, y + 1, "green3")
        put(img, x + 1, y + 1, "green3")

    # The road: packed dirt, a darker rim, worn lighter down the middle.
    for y in range(H):
        for x in range(W):
            d = min(seg_dist(x + 0.5, y + 0.5, a, b) for a, b in zip(ROAD, ROAD[1:]))
            if d <= 0.6:
                put(img, x, y, "parch2")
            elif d <= 2.6:
                put(img, x, y, "parch1")
            elif d <= 3.4:
                put(img, x, y, "wood3")
            elif d <= 4.0 and (x + y) % 2 == 0:
                put(img, x, y, "green1")

    # The forest at the top and both sides: rounded canopies, lit on their upper left.
    trees = [(x, rng.uniform(2, 9)) for x in range(-2, W + 4, 7)]
    trees += [(rng.uniform(-1, 5), y) for y in range(10, WALL_TOP, 8)]
    trees += [(W - rng.uniform(-1, 5), y) for y in range(10, WALL_TOP, 8)]
    for cx, cy in trees:
        r = rng.uniform(4.0, 5.5)
        disc(img, cx, cy, r, "green1")
        disc(img, cx - 1.2, cy - 1.2, r * 0.45, "orc1")
        put(img, int(cx - 2), int(cy - 2), "green2")

    # Shadow where the grass meets the wall.
    for x in range(W):
        put(img, x, WALL_TOP - 1, "green1")

    # The city wall: merlons, the walk, then courses of stone with pale mortar.
    for x in range(W):
        if x % 6 < 4:
            for y in (WALL_TOP, WALL_TOP + 1, WALL_TOP + 2):
                put(img, x, y, "steel4" if y == WALL_TOP else "steel2")
            put(img, x, WALL_TOP - 1, "ink")
        else:
            put(img, x, WALL_TOP + 2, "ink")
        put(img, x, WALL_TOP + 3, "steel3")
        put(img, x, WALL_TOP + 4, "ink")
    for y in range(WALL_TOP + 5, H):
        course = (y - WALL_TOP - 5) // 4
        row = (y - WALL_TOP - 5) % 4
        for x in range(W):
            if row == 3 or (x + course * 4) % 8 == 0:
                put(img, x, y, "steel1")
            else:
                put(img, x, y, "steel3" if row == 0 else ("steel1" if row == 2 else "steel2"))
    for x in range(W):
        if x % 6 < 4:
            put(img, x - 1 if x % 6 == 0 else x, WALL_TOP, "steel4")
    for x in range(W):  # ink between the merlons and down their sides
        if x % 6 == 4 or x % 6 == 5:
            put(img, x, WALL_TOP, "green2")
            put(img, x, WALL_TOP + 1, "green2")
    for x in range(W):
        if x % 6 == 0 or x % 6 == 3:
            pass

    # The gate: an arch in the wall, closed wooden doors with iron bands.
    gx0, gx1, gy = 56, 75, WALL_TOP + 8
    cx, top = (gx0 + gx1 + 1) / 2, gy + 6
    for y in range(gy, H):
        for x in range(gx0 - 1, gx1 + 2):
            inside = gx0 <= x <= gx1 and (y >= top or math.hypot(x + 0.5 - cx, y + 0.5 - top) <= (gx1 - gx0 + 1) / 2)
            edge = gx0 - 1 <= x <= gx1 + 1 and (y >= top - 1 or math.hypot(x + 0.5 - cx, y + 0.5 - top) <= (gx1 - gx0 + 3) / 2)
            if inside:
                band = (y - gy) % 7 == 4
                seam = x in (int(cx) - 1, int(cx))
                put(img, x, y, "ink" if seam else ("steel1" if band else ("wood4" if x < cx - 4 else ("wood2" if x > cx + 3 else "wood3"))))
            elif edge:
                put(img, x, y, "ink")
    for x in range(gx0 - 4, gx1 + 5):  # the voussoirs: a ring of pale stone around the arch
        for y in range(gy - 4, gy + 14):
            dd = math.hypot(x + 0.5 - cx, y + 0.5 - top)
            if (gx1 - gx0 + 3) / 2 < dd <= (gx1 - gx0 + 3) / 2 + 2.2 and y < top:
                put(img, x, y, "steel4" if dd < (gx1 - gx0 + 3) / 2 + 1.2 else "ink")
    return img


# ------------------------------------------------------------------------- the plot pieces --
def blank(w, h):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def fog(w, h):
    """Rolling fog over an undiscovered plot: overlapping billows, each lit on top with a darker
    lower rim, back rows first. Ragged edges, no ink line."""
    img = blank(w, h)
    rng = random.Random(w * 100 + h)
    puffs = []
    rows = max(2, h // 9)
    for r in range(rows):
        cy = 4 + (h - 8) * (r + 0.5) / rows
        n = max(2, w // 9)
        for i in range(n):
            cx = 3 + (w - 6) * (i + rng.uniform(0.2, 0.8)) / n
            puffs.append((cx, cy + rng.uniform(-1.5, 1.5), rng.uniform(4.2, 6.2)))
    puffs.sort(key=lambda p: p[1])
    for cx, cy, r in puffs:
        for y in range(int(cy - r) - 1, int(cy + r) + 2):
            for x in range(int(cx - r) - 1, int(cx + r) + 2):
                if not (0 <= x < w and 0 <= y < h):
                    continue
                dd = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
                if dd > r:
                    continue
                rel = (y + 0.5 - cy) / r
                name = "steel5" if rel < -0.55 else ("steel4" if rel < -0.1 else "steel3")
                if dd > r - 1.1 and rel > 0.1:
                    name = "steel2"
                put(img, x, y, name)
    return img


def cleared(w, h):
    """The unbuilt look: a patch of bare packed earth with a few stones and a stake at each corner."""
    img = blank(w, h)
    rng = random.Random(w * 7 + h)
    for y in range(2, h - 1):
        for x in range(1, w - 1):
            # rounded corners
            cx = min(x - 1, w - 2 - x)
            cy = min(y - 2, h - 2 - y)
            if cx + cy >= 2:
                put(img, x, y, "parch1" if (y < 4 or x < 3) else "wood3" if (y > h - 4 or x > w - 4) else "parch1")
    for y in range(4, h - 4):
        for x in range(3, w - 3):
            put(img, x, y, "wood4")
    for _ in range(max(3, w * h // 160)):
        x, y = rng.randrange(4, w - 5), rng.randrange(5, h - 5)
        put(img, x, y, "steel3")
        put(img, x + 1, y, "steel2")
    for sx, sy in ((1, 1), (w - 2, 1), (1, h - 4), (w - 2, h - 4)):
        for dy in range(3):
            put(img, sx, sy + dy, "wood2")
        put(img, sx, sy, "parch3")
    return img


def foundation(w, h):
    """The first build step: cut stones laid out around the plot on the bare earth."""
    img = cleared(w, h)
    for x in range(2, w - 2):
        for y in (h - 5, h - 4, 3, 4):
            put(img, x, y, "steel4" if y in (3, h - 5) else "steel3")
    for y in range(3, h - 3):
        for x in (2, 3, w - 4, w - 3):
            put(img, x, y, "steel4" if x in (2, w - 4) else "steel3")
    for x in range(2, w - 2, 5):  # joints between the stones
        put(img, x, 4, "steel1")
        put(img, x, h - 4, "steel1")
    for y in range(3, h - 3, 5):
        put(img, 3, y, "steel1")
        put(img, w - 3, y, "steel1")
    return img


def scaffold(w, h):
    """Construction: four poles, two plank decks, a crossed brace in each bay, a ladder."""
    img = blank(w, h)
    poles = sorted({1, w // 3, 2 * w // 3, w - 3})
    decks = [3, h // 2, h - 4]
    for px in poles:
        for y in range(1, h - 1):
            put(img, px, y, "wood4")
            put(img, px + 1, y, "wood2")
    for a_, b_ in zip(poles, poles[1:]):  # an X brace in each upper bay
        for t in range(101):
            x = a_ + 2 + (b_ - a_ - 2) * t / 100
            put(img, int(x), int(decks[0] + 1 + (decks[1] - decks[0] - 2) * t / 100), "wood3")
            put(img, int(x), int(decks[1] - 1 - (decks[1] - decks[0] - 2) * t / 100), "wood3")
    lx = poles[1] + 3  # a ladder in the lower middle bay
    for y in range(decks[1] + 1, h - 1):
        put(img, lx, y, "wood3")
        put(img, lx + 3, y, "wood3")
        if (y - decks[1]) % 3 == 0:
            put(img, lx + 1, y, "wood4")
            put(img, lx + 2, y, "wood4")
    for dy in decks:
        for x in range(0, w):
            put(img, x, dy, "parch2")
            put(img, x, dy + 1, "wood3")
    return pixkit.outline(img)


def marker_upgrade():
    rows = ["..aaaa..",
            ".aHHHGa.",
            "aHHaaGGa",
            "aHaHGaGa",
            "aaHHGGaa",
            ".aHHGGa.",
            ".aaaaaa.",
            "........"]
    return pixkit.from_grid(rows, {"a": "ink", "H": "gold5", "G": "gold3"})


def marker_todo():
    rows = ["..aaaa..",
            ".aHHHGa.",
            "aHHaaHGa",
            "aHHaaHGa",
            "aHHHHHGa",
            "aHHaaHGa",
            ".aGGGGa.",
            "..aaaa.."]
    return pixkit.from_grid(rows, {"a": "ink", "H": "gold5", "G": "gold3"})


# ------------------------------------------------------------------------------- write all --
def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    base = base_map()
    base.save(OUT / "map_city_base.png")

    plots = [{"id": k, "x": x, "y": y, "width": w, "height": h, "anchor": [x + w // 2, y + h]}
             for k, (x, y, w, h) in PLOTS.items()]
    (OUT / "map_plots.json").write_text(json.dumps({"map": "map_city_base.png", "size": [W, H],
                                                    "plots": plots}, indent=2) + "\n", encoding="utf-8")

    pieces = {}
    for w, h in sorted({(w, h) for _, _, w, h in PLOTS.values()}):
        for kind, fn in (("fog", fog), ("plot-empty", cleared), ("foundation", foundation), ("scaffold", scaffold)):
            img = fn(w, h)
            img.save(OUT / f"map_{kind}_{w}x{h}.png")
            pieces[(kind, w, h)] = img
    marker_upgrade().save(OUT / "map_marker-upgrade.png")
    marker_todo().save(OUT / "map_marker-todo.png")

    # Every pixel must be a master color.
    allowed = {v for v in P.values()}
    for f in OUT.glob("*.png"):
        bad = {px[:3] for px in Image.open(f).convert("RGBA").getdata() if px[3] and px[:3] not in allowed}
        assert not bad, (f.name, list(bad)[:3])

    # Previews: lit, dusk and night side by side; the plots outlined; the pieces on their plots.
    lit, dusk, night = base, pixkit.relight(base, pixkit.DUSK), pixkit.relight(base, pixkit.NIGHT)
    trio = Image.new("RGBA", (W * 3 + 16, H), P["night1"] + (255,))
    for i, im in enumerate((lit, dusk, night)):
        trio.paste(im, (i * (W + 8), 0))
    pixkit.upscale(trio, 2).save(PREVIEW / "light_levels_x2.png")

    outlined = base.copy()
    d = ImageDraw.Draw(outlined)
    for x, y, w, h in PLOTS.values():
        d.rectangle([x, y, x + w - 1, y + h - 1], outline=P["gold5"] + (255,))
    pixkit.upscale(outlined, 3).save(PREVIEW / "plots_x3.png")

    staged = base.copy()
    order = ["fog", "plot-empty", "foundation", "scaffold"]
    for i, (k, (x, y, w, h)) in enumerate(PLOTS.items()):
        kind = order[i % 4]
        piece = pieces[(kind, w, h)]
        staged.alpha_composite(piece, (x, y))
    pixkit.upscale(staged, 3).save(PREVIEW / "pieces_on_plots_x3.png")
    pixkit.upscale(pixkit.relight(staged, pixkit.NIGHT), 3).save(PREVIEW / "pieces_on_plots_night_x3.png")
    print("written:", len(list(OUT.glob("*"))), "files")


if __name__ == "__main__":
    main()
