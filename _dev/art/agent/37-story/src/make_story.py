"""Story illustrations, v1, 2026-10-27: the prologue and the Breach.

130x96 (the map's width, so each spans the screen at the map's scale), in the event banners' look:
flat sky bands, a ridge, the road, and the locked art itself (the gate states and each monster's
idle pose). We stand behind the wall, as on the Warfront, and the horde comes down the road at us.
Distant monsters are relit to night, nearer ones to dusk, the closest are lit.

- prologue, "The Walls of Draconia": "My lord, the monsters have reached the walls."
- breach, "The Wall Falls": the wall is broken open and the horde pours through the gap.

Run: python src/make_story.py
"""
import pathlib
import sys

from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).resolve().parents[1]
OFFICIAL = HERE.parents[1] / "official"
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from pixkit import DUSK, NIGHT, PALETTE as P, relight, upscale  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
W, H = 130, 96


def bands(img, rows):
    d = ImageDraw.Draw(img)
    for i, (y0, c) in enumerate(rows):
        y1 = rows[i + 1][0] - 1 if i + 1 < len(rows) else img.height - 1
        d.rectangle([0, y0, W - 1, y1], fill=P[c])


def ground(img, top, horizon_x, foot, road="ash1", earth="shadow1"):
    """The earth below the ridge, and the road from the horizon down to the gate."""
    d = ImageDraw.Draw(img)
    d.rectangle([0, top, W - 1, H - 1], fill=P[earth])
    d.polygon([(horizon_x - 2, top), (horizon_x + 2, top), (foot[1], H - 1), (foot[0], H - 1)], fill=P[road])


def ridge(img, base, color="night1"):
    """A jagged line of hills along the horizon."""
    pts = [(0, base - 3), (9, base - 7), (17, base - 4), (26, base - 9), (35, base - 5), (44, base - 8),
           (53, base - 3), (62, base - 6), (71, base - 2), (80, base - 7), (90, base - 4), (99, base - 10),
           (108, base - 5), (118, base - 8), (129, base - 4), (129, base), (0, base)]
    ImageDraw.Draw(img).polygon(pts, fill=P[color])


def campfires(img, y, xs):
    d = ImageDraw.Draw(img)
    for i, x in enumerate(xs):
        d.point((x, y + i % 3), fill=P["fire2" if i % 2 else "fire1"])


def mob(img, name, cx, feet, light=None):
    """A monster's idle pose, bottom-centered at (cx, feet), relit for its distance."""
    m = Image.open(OFFICIAL / "mobs" / f"mob_{name}_idle.png").convert("RGBA")
    if light:
        m = relight(m, light)
    img.alpha_composite(m, (cx - m.width // 2, feet - m.height + 1))


def far(img, names, feet, xs, color="ink"):
    """The horde far off: each monster at half size, a dark shape on the road."""
    for i, x in enumerate(xs):
        m = Image.open(OFFICIAL / "mobs" / f"mob_{names[i % len(names)]}_idle.png").convert("RGBA")
        m = m.resize((m.width // 2, m.height // 2), Image.NEAREST)
        shape = Image.new("RGBA", m.size, P[color] + (255,))
        shape.putalpha(m.getchannel("A"))
        img.alpha_composite(shape, (x - m.width // 2, feet + (i % 2) - m.height + 1))


def wall(img, state, rows):
    """The top `rows` of the locked gate art, along the bottom of the picture."""
    g = Image.open(OFFICIAL / "warfront" / f"map_gate_{state}.png").convert("RGBA")
    img.alpha_composite(g.crop((0, 2, W, 2 + rows)), (0, H - rows))


def smoke(img, puffs):
    d = ImageDraw.Draw(img)
    for cx, cy, r, c in puffs:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=P[c])


def prologue():
    img = Image.new("RGBA", (W, H), P["night1"] + (255,))
    bands(img, [(0, "night1"), (12, "night2"), (22, "shadow2"), (29, "shadow3"), (34, "rose1")])
    d = ImageDraw.Draw(img)
    d.ellipse([90, 5, 110, 25], fill=P["red2"])                       # the blood moon
    d.ellipse([97, 9, 102, 14], fill=P["red1"])
    d.ellipse([93, 16, 97, 20], fill=P["red1"])
    for x0, x1, y in ((8, 30, 9), (40, 58, 16), (70, 86, 20)):        # thin clouds
        d.line([x0, y, x1, y], fill=P["shadow2"])
    ridge(img, 40)
    ground(img, 40, 65, (44, 86), earth="shadow2")
    campfires(img, 41, [6, 15, 22, 31, 38, 47, 84, 92, 99, 107, 116, 124])
    far(img, ["kobold", "goblin", "orc"], 47, [50, 56, 61, 66, 71, 76, 82, 44, 88])
    for x, n in ((38, "goblin"), (56, "crawler"), (74, "kobold"), (92, "goblin")):
        mob(img, n, x, 64, DUSK)
    for x, n in ((22, "raider"), (50, "orc"), (80, "orc"), (108, "raider")):   # at the wall
        mob(img, n, x, 86)
    wall(img, "sound", 20)
    return img


def breach():
    img = Image.new("RGBA", (W, H), P["ash1"] + (255,))
    bands(img, [(0, "ash1"), (9, "ash2"), (17, "rose1"), (23, "clay2"), (28, "fire1")])
    ridge(img, 34, "shadow1")
    ground(img, 34, 65, (50, 80), earth="shadow2")
    campfires(img, 35, [5, 13, 24, 33, 96, 104, 113, 122])
    smoke(img, [(42, 24, 4, "ash3"), (44, 18, 4, "ash3"), (47, 13, 3, "ash3"), (50, 8, 3, "ash2"),
                (54, 4, 2, "ash2"), (88, 24, 3, "ash3"), (90, 19, 3, "ash3"), (93, 14, 2, "ash2")])   # smoke, rising
    far(img, ["kobold", "goblin", "orc"], 41, [54, 59, 64, 69, 74, 49, 79])      # still coming
    for x, n in ((50, "goblin"), (65, "orc"), (80, "kobold")):
        mob(img, n, x, 55, DUSK)
    wall(img, "breached", 40)
    for x, n, feet in ((60, "raider", 82), (70, "crawler", 80), (55, "goblin", 92), (67, "orc", 95),
                       (77, "kobold", 93)):                            # pouring through the gap
        mob(img, n, x, feet)
    d = ImageDraw.Draw(img)
    for x, y in ((46, 93), (50, 90), (83, 92), (88, 94), (43, 95)):  # rubble
        d.rectangle([x, y, x + 2, y + 1], fill=P["night3"])
        d.point((x, y), fill=P["night4"])
    return img


PICTURES = {"prologue": prologue, "breach": breach}


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    for name, f in PICTURES.items():
        img = f()
        img.save(OUT / f"story_{name}_v1.png")
        upscale(img, 3).save(PREVIEW / f"story_{name}_v1_x3.png")
    print(len(PICTURES), "pictures")


if __name__ == "__main__":
    main()
