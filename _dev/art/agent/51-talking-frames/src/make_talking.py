"""Talking frames, v2, 2026-10-28: a second frame of every face, swapped while a line types.

v2 (owner, 2026-10-28: Rodain, Mirael, Kael, Thornwick and Sera "look like they have a mustache"): a pale row
above a dark one reads as a mustache at this size. Bared teeth no longer get dark opened under them; the teeth
go dark instead (a shout through them). An open mouth no longer closes to a flat line beside its lip corners;
it opens a row taller. Skin painted over the neutral mouth no longer counts as mouth (it widened Rodain's).
v1 frames stay in out/ as *_talk_v1.png.

Owner: talking frames were next after the new cast's scenes ("4, 3, 1"). Each locked face (neutral and the
standard six, 70 in all) gets a twin with the mouth moving; the dialogue box shows the twin and the face in
turn while the words type out, and rests on the face itself.

Drawn on the locked images in official/cast; only the mouth changes (the Hollow Knight's light, which is its
face). One rule covers the faces with a mouth, from each bust's mouth (the anatomy in 50-expressions-set):
- a mouth that is shut opens by a row below (its corners stay, so a smile opens into a smile);
- a mouth already open (a gasp, a roar) opens a row taller;
- bared teeth (the angry faces) go dark;
- a face whose mouth is not drawn (Pyreth's snout, Kael's and Mirael's lips) opens a small dark mouth.
Ashara's furnace flares instead (it grows a row taller and burns hotter). The Hollow Knight has no mouth: its
light flickers (a glow around the light goes out, or comes up; the empty slit shows a dim light).

Output: out/bust_<id>[_<face>]_talk_v2.png. preview/: x8 of each. Run: python src/make_talking.py
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parents[1]
AGENT = HERE.parent
OFFICIAL = AGENT.parent / "official" / "cast"
OUT, PREVIEW = HERE / "out", HERE / "preview"
sys.path.insert(0, str(AGENT / "00-foundation"))
from pixkit import PALETTE, upscale  # noqa: E402

W = 22
VERSION = 2
INK = PALETTE["ink"]
TEETH = PALETTE["parch3"]
FACES = ["neutral", "happy", "grieving", "angry", "alarmed", "worried", "determined"]
# Faces locked before the standard set keep their own names (src/art/cast.ts FACE_FILE)
FACE_FILE = {("varn", "determined"): "fierce", ("sera", "determined"): "roaring",
             ("thornwick", "alarmed"): "startled"}
PEOPLE = ["pyreth", "rodain", "mirael", "kael", "lirae", "varn", "ashara", "thornwick", "sera", "hollow-knight"]


class Mouth:
    """Where a bust's mouth can be: columns x0..x1 and rows y0..y1; a new mouth goes at (mid, mid + 1) on row y."""

    def __init__(self, x0, x1, y0, y1, y, mid=10):
        self.x0, self.x1, self.y0, self.y1, self.y, self.mid = x0, x1, y0, y1, y, mid


# From each face's anatomy in 50-expressions-set (FACE_OF): the mouth row, and the row either side of it.
# Lirae's box starts on the mouth row, so her nostrils above it are not taken for a mouth.
MOUTH = {
    "pyreth": Mouth(9, 12, 12, 14, 13),
    "rodain": Mouth(8, 13, 11, 13, 12),
    "mirael": Mouth(9, 12, 11, 13, 12),
    "kael": Mouth(9, 12, 11, 13, 12),
    "lirae": Mouth(9, 12, 12, 13, 12),
    "varn": Mouth(9, 12, 14, 16, 15),
    "thornwick": Mouth(9, 12, 14, 16, 15),
    "sera": Mouth(9, 12, 12, 14, 13),
}


def file_of(bid, face):
    if face == "neutral":
        return f"bust_{bid}"
    return f"bust_{bid}_{FACE_FILE.get((bid, face), face)}"


def rgb(p):
    return tuple(p[:3])


def is_ink(p):
    return p[3] and rgb(p) == INK


def skin_left(img, x, y):
    """The first colored, non-ink pixel left of (x, y): what a closed mouth is painted back to."""
    for sx in range(x - 1, -1, -1):
        p = img.getpixel((sx, y))
        if p[3] and not is_ink(p):
            return p
    raise ValueError(f"no skin left of {(x, y)}")


def talk_mouth(img, neutral, m):
    out = img.copy()
    cols, rows = range(m.x0, m.x1 + 1), range(m.y0, m.y1 + 1)
    skin = img.getpixel((m.x0 - 1, m.y))
    inked = {x: [y for y in rows if is_ink(img.getpixel((x, y)))] for x in cols}
    # A mouth's feature: ink, or anything the face drew in over the neutral one (teeth, lips); not skin painted
    # over the neutral mouth, which is no mouth at all
    feature = {x: [y for y in rows if is_ink(img.getpixel((x, y))) or
                   img.getpixel((x, y)) not in (neutral.getpixel((x, y)), skin)] for x in cols}
    open_cols = [x for x in cols if len(inked[x]) >= 2]
    if open_cols:                                                       # already open: a row taller
        for x in open_cols:
            out.putpixel((x, max(inked[x]) + 1), INK + (255,))
        return out
    teeth = [(x, y) for x in cols for y in rows
             if rgb(img.getpixel((x, y))) == TEETH and img.getpixel((x, y)) != neutral.getpixel((x, y))]
    if teeth:                                                           # bared teeth: a shout through them
        for c in teeth:
            out.putpixel(c, INK + (255,))
        return out
    marked = [x for x in cols if feature[x]]
    if not marked:                                                      # no mouth drawn: a small dark one
        for x in (m.mid, m.mid + 1):
            out.putpixel((x, m.y), INK + (255,))
        return out
    if len(marked) >= 3:                                                # the corners stay put
        marked = marked[1:-1]
    for x in marked:                                                    # open a row below
        y = max(feature[x]) + 1
        p = img.getpixel((x, y))
        if p[3] and not is_ink(p):
            out.putpixel((x, y), INK + (255,))
    return out


def talk_ashara(img):
    """The furnace flares: its top row catches (inside the corners) and the fire burns a step hotter."""
    out = img.copy()
    fire = {PALETTE["fire1"], PALETTE["fire2"], PALETTE["fire3"]}
    hotter = {PALETTE["fire1"]: PALETTE["fire2"], PALETTE["fire2"]: PALETTE["fire3"], PALETTE["fire3"]: PALETTE["fire2"]}
    top = [(x, 13) for x in range(9, 13)]
    if any(rgb(img.getpixel(c)) not in fire for c in top):
        for c in top:
            out.putpixel(c, PALETTE["fire1"] + (255,))
        return out
    for x in range(8, 14):
        for y in (13, 14):
            c = rgb(img.getpixel((x, y)))
            if c in hotter:
                out.putpixel((x, y), hotter[c] + (255,))
    return out


def talk_knight(img):
    """The light in the visor flickers: a glow goes out, or comes up around a bare light; an empty slit shows a
    dim one."""
    out = img.copy()
    core, glow = [(8, 8), (13, 8)], [(7, 8), (9, 8), (12, 8), (14, 8)]
    lit = [c for c in glow if not is_ink(img.getpixel(c))]
    if lit:
        for c in lit:
            out.putpixel(c, INK + (255,))
        return out
    if is_ink(img.getpixel(core[0])):
        for c in core:
            out.putpixel(c, PALETTE["steel2"] + (255,))
        return out
    light = img.getpixel(core[0])
    for x, y in [(7, 8), (14, 8)]:                                      # the light widens outward
        out.putpixel((x, y), light)
    return out


def talk(bid, img, neutral):
    if bid == "ashara":
        return talk_ashara(img)
    if bid == "hollow-knight":
        return talk_knight(img)
    return talk_mouth(img, neutral, MOUTH[bid])


def pairs():
    """Every face and its talking twin: (bust, face, the face, its twin, file stem)."""
    for bid in PEOPLE:
        neutral = Image.open(OFFICIAL / "bust_{}.png".format(bid)).convert("RGBA")
        for face in FACES:
            stem = file_of(bid, face)
            img = Image.open(OFFICIAL / f"{stem}.png").convert("RGBA")
            yield bid, face, img, talk(bid, img, neutral), stem


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    made = 0
    for bid, face, img, twin, stem in pairs():
        assert twin.tobytes() != img.tobytes(), f"{stem}: the talking frame is the same as the face"
        changed = [(x, y) for y in range(img.height) for x in range(W) if twin.getpixel((x, y)) != img.getpixel((x, y))]
        assert all(7 <= y <= 16 for _, y in changed), f"{stem}: changed outside the face: {changed}"
        twin.save(OUT / f"{stem}_talk_v{VERSION}.png")
        upscale(twin, 8).save(PREVIEW / f"{stem}_talk_v{VERSION}_x8.png")
        made += 1
    print(made, "talking frames")


if __name__ == "__main__":
    main()
