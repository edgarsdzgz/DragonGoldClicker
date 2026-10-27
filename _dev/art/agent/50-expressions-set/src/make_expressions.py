"""The standard set of faces for every bust, v1, 2026-10-27.

Owner: "Let's go ahead and make expressions for each character bust that we have." The set (proposed and
approved the same day): neutral, happy, grieving, angry, alarmed, worried, determined. Each locked bust is
redrawn from its own function and only its brows, eyes and mouth change, as in 42-expressions; the redrawn
neutral face must equal the locked bust. The faces 42-expressions already locked fill their slots and are not
redrawn (Varn's fierce and Sera's roaring are their determined, Thornwick's startled his alarmed).

Most faces come from one engine, driven by each face's anatomy (where its brows, eyes and mouth sit). Ashara
(whose neutral face is already a scowl, a furnace for a mouth), Lirae (spectacles and a beak) and the Hollow
Knight (no face, by design: its feeling is a light inside the visor slit) are drawn by hand.

Output: out/bust_<id>_<face>_v1.png. preview/: x8 of each. Run: python src/make_expressions.py
"""
import importlib.util
import pathlib
import sys

from PIL import Image, ImageChops

HERE = pathlib.Path(__file__).resolve().parents[1]
AGENT = HERE.parent
OFFICIAL = AGENT.parent / "official" / "cast"
OUT, PREVIEW = HERE / "out", HERE / "preview"


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


# 35-busts-more imports Bust from a module named make_busts, so 31's file is loaded under that name.
simple = load("make_busts", AGENT / "31-busts-simple" / "src" / "make_busts.py")
more = load("busts_more", AGENT / "35-busts-more" / "src" / "make_busts.py")
Bust, W = simple.Bust, simple.W
upscale = simple.upscale
_image = Bust.image

FACES = ["happy", "grieving", "angry", "alarmed", "worried", "determined"]
# Already locked in 42-expressions, under their own names: (bust, standard face) -> its file's face
LOCKED = {("pyreth", "grieving"): "grieving", ("rodain", "grieving"): "grieving", ("mirael", "alarmed"): "alarmed",
          ("kael", "angry"): "angry", ("lirae", "grieving"): "grieving", ("varn", "determined"): "fierce",
          ("ashara", "grieving"): "grieving", ("thornwick", "alarmed"): "startled", ("sera", "determined"): "roaring"}


def cells_of(draw):
    """Run a bust's drawing but stop before the image, to get its cells."""
    Bust.image = lambda self: self
    try:
        return draw()
    finally:
        Bust.image = _image


def mx(x):
    return W - 1 - x


def put(b, pts, c, sym=False):
    for x, y in pts:
        b.cells[(x, y)] = c
        if sym:
            b.cells[(mx(x), y)] = c


# --- The engine ---------------------------------------------------------------------------------------
# A face's anatomy, left side only (mirrored): brows on one row (outer to inner), eyes, the mouth's row and
# its left and right ends, and what to paint back where a feature leaves.

class Face:
    def __init__(self, skin, brow, brow_c, eye, eye_c, eye_dim, mouth_y, mouth_x, mouth_bg, clear_mouth=(),
                 brow_bg=None, tear="azure3", teeth="parch3", hidden_brows=False, keep=(), lift=2):
        self.skin, self.brow, self.brow_c = skin, brow, brow_c
        self.eye, self.eye_c, self.eye_dim = eye, eye_c, eye_dim
        self.mouth_y, (self.ml, self.mr), self.mouth_bg = mouth_y, mouth_x, mouth_bg
        self.clear_mouth, self.brow_bg = clear_mouth, brow_bg or skin
        self.tear, self.teeth, self.hidden_brows, self.keep = tear, teeth, hidden_brows, keep
        self.lift = lift                                                  # rows the brows can rise (a helm or hat above)


def brows_at(b, f, cells):
    """Erase the neutral brows (unless the face has none showing) and draw these, mirrored."""
    if not f.hidden_brows:
        put(b, f.brow, f.brow_bg, True)
    put(b, cells, f.brow_c, True)


def shift(cells, dy=0, dx=0):
    return [(x + dx, y + dy) for x, y in cells]


def clear_mouth(b, f):
    put(b, f.clear_mouth, f.mouth_bg)


def happy(b, f):
    brows_at(b, f, shift(f.brow, -1))                                     # brows lift
    clear_mouth(b, f)
    put(b, [(f.ml, f.mouth_y - 1), (f.mr, f.mouth_y - 1)], "ink")         # a smile: corners up
    put(b, [(x, f.mouth_y) for x in range(f.ml + 1, f.mr)], "ink")


def grieving(b, f):
    outer, *rest = f.brow
    brows_at(b, f, [outer] + shift(rest, -1))                             # brows rise at the middle
    put(b, f.eye, f.eye_dim, True)                                        # the eyes dim
    ex, ey = max(f.eye, key=lambda c: (c[1], -c[0]))
    put(b, [(ex, ey + 1), (ex, ey + 2)], f.tear)                          # a tear, one side
    clear_mouth(b, f)
    put(b, [(x, f.mouth_y) for x in range(f.ml + 1, f.mr)], "ink")        # the mouth turns down
    put(b, [(f.ml, f.mouth_y + 1), (f.mr, f.mouth_y + 1)], "ink")


def angry(b, f):
    outer, *rest = f.brow
    inner = rest[-1] if rest else outer
    brows_at(b, f, shift([outer], -1) + rest + [(inner[0] + 1, inner[1])])   # brows slant down inward
    clear_mouth(b, f)
    put(b, [(f.ml, f.mouth_y), (f.mr, f.mouth_y)], "ink")                 # teeth gritted
    put(b, [(x, f.mouth_y) for x in range(f.ml + 1, f.mr)], f.teeth)


def alarmed(b, f):
    brows_at(b, f, shift(f.brow, -f.lift))                                # brows high
    low = max(y for _, y in f.eye)
    put(b, [(x, low + 1) for x, y in f.eye if y == low], f.eye_c, True)   # the eyes wide
    clear_mouth(b, f)
    mid = (f.ml + f.mr) // 2
    put(b, [(mid, f.mouth_y), (mid + 1, f.mouth_y), (mid, f.mouth_y - 1), (mid + 1, f.mouth_y - 1)], "ink")  # a gasp


def worried(b, f):
    outer, *rest = f.brow
    brows_at(b, f, [outer] + shift(rest, -1))                             # brows rise at the middle
    clear_mouth(b, f)
    mid = (f.ml + f.mr) // 2
    put(b, [(mid, f.mouth_y), (mid + 1, f.mouth_y)], "ink")               # a small, tight mouth
    put(b, [(mid + 2, f.mouth_y + 1)], "ink")                             # pulled down at one side


def determined(b, f):
    inner = f.brow[-1]
    brows_at(b, f, f.brow + [(inner[0] + 1, inner[1])])                   # brows set straight and low
    top = min(y for _, y in f.eye)
    if len({y for _, y in f.eye}) > 1:
        put(b, [(x, y) for x, y in f.eye if y == top], f.skin, True)      # the eyes narrow
    clear_mouth(b, f)
    put(b, [(x, f.mouth_y) for x in range(f.ml, f.mr + 1)], "ink")       # the mouth a firm line


ENGINE = {"happy": happy, "grieving": grieving, "angry": angry, "alarmed": alarmed, "worried": worried,
          "determined": determined}

FACE_OF = {
    # Pyreth: brows of clay over gold eyes; the mouth on the snout, above the beard
    "pyreth": Face("clay2", [(7, 7), (8, 7), (9, 7)], "clay1", [(8, 8), (9, 8)], "gold5", "gold3",
                   13, (9, 12), "clay3"),
    # Rodain: one heavy brow ridge, the scar through it (kept); the grim mouth between his tusks
    "rodain": Face("orc2", [(6, 6), (7, 6), (8, 6), (9, 6), (10, 6)], "orc1", [(8, 8), (9, 8)], "gold4", "gold3",
                   12, (9, 12), "orc2", clear_mouth=[(8, 12), (9, 12), (10, 12), (11, 12), (12, 12), (13, 12)],
                   keep=[((8, 5), "clay1"), ((8, 6), "clay1"), ((8, 7), "clay1"), ((8, 9), "clay1")]),
    # Mirael: no brows showing until she needs them; tall green eyes; small lips
    "mirael": Face("skin3", [(7, 8), (8, 8)], "clay2", [(8, 9), (8, 10)], "emerald2", "emerald1",
                   12, (9, 12), "skin3", clear_mouth=[(9, 12), (10, 12), (11, 12), (12, 12)], hidden_brows=True),
    # Kael: dark eyes, brows of soot only when he needs them, a small mouth
    "kael": Face("skin1", [(7, 8), (8, 8), (9, 8)], "wood1", [(8, 9)], "ink", "ink",
                 12, (9, 12), "skin1", clear_mouth=[(10, 12), (11, 12)], hidden_brows=True, lift=1),
    # Varn: big gold eyes, brows only when he needs them, the mouth at the end of his snout
    "varn": Face("emerald2", [(6, 7), (7, 7), (8, 7)], "emerald1",
                 [(7, 8), (8, 8), (7, 9), (8, 9), (7, 10), (8, 10)], "gold5", "gold3",
                 15, (9, 12), "emerald3", clear_mouth=[(10, 15), (11, 15)], hidden_brows=True),
    # Thornwick: his wry brows (one up) evened out for every other face; the mouth in the gray beard
    "thornwick": Face("wood4", [(7, 9), (8, 9)], "ash3", [(7, 10), (8, 10)], "ink", "ink",
                      15, (9, 12), "ash3", clear_mouth=[(11, 15), (12, 15)], lift=1),
    # Sera: gray brows over small dark eyes; the mouth on the pale muzzle, under the nose
    "sera": Face("wood3", [(7, 7), (8, 7)], "ash3", [(8, 8)], "night1", "night1",
                 13, (9, 12), "ash3", clear_mouth=[(10, 13), (11, 13)], lift=1),
}


def engine_face(bid, face):
    def edit(b):
        f = FACE_OF[bid]
        if bid == "thornwick":
            put(b, [(13, 8), (14, 8)], "clay3")                            # the raised right brow, cleared
            put(b, [(13, 9), (14, 9)], "wood4")
        ENGINE[face](b, f)
        for (x, y), c in f.keep:                                           # marks the face must keep (a scar)
            b.cells[(x, y)] = c
    return edit


# --- Ashara: her neutral face is already a scowl; the furnace of her mouth carries the feeling ----------

ASH_BROW = [(6, 6), (7, 6), (7, 7), (8, 7), (9, 7)]


def ashara(face):
    def edit(b):
        put(b, ASH_BROW, "ash2", True)                                     # clear the scowl
        if face == "happy":
            put(b, [(6, 6), (7, 6), (8, 6), (9, 6)], "shadow1", True)       # brows level and raised
            put(b, [(8, 14), (13, 14)], "ash1")                            # a smile of embers
            put(b, [(9, 14), (10, 14), (11, 14), (12, 14)], "fire2")
            put(b, [(8, 13), (13, 13)], "fire1")
        elif face == "angry":
            put(b, [(6, 5), (7, 6), (8, 7), (9, 7), (10, 8)], "shadow1", True)   # the scowl, deeper
            put(b, [(9, 13), (10, 13), (11, 13), (12, 13)], "fire1")       # the furnace opens
            put(b, [(9, 14), (10, 14), (11, 14), (12, 14)], "fire2")
        elif face == "alarmed":
            put(b, [(6, 5), (7, 5), (8, 5), (9, 5)], "shadow1", True)       # brows high
            put(b, [(8, 9), (9, 9)], "fire2", True)                        # the fire in her eyes flares
            put(b, [(8, 14), (9, 14), (12, 14), (13, 14)], "ash1")         # a round, open furnace
            put(b, [(10, 13), (11, 13)], "fire1")
        elif face == "worried":
            put(b, [(6, 7), (7, 7), (8, 6), (9, 6)], "shadow1", True)       # brows rise at the middle
            put(b, [(8, 14), (9, 14), (12, 14), (13, 14)], "ash1")         # the furnace banked low
            put(b, [(10, 14), (11, 14)], "fire1")
        elif face == "determined":
            put(b, [(6, 7), (7, 7), (8, 7), (9, 7), (10, 7)], "shadow1", True)   # brows straight and low
            put(b, [(8, 14), (13, 14)], "ash1")
            put(b, [(9, 14), (10, 14), (11, 14), (12, 14)], "fire2")       # the furnace steady, hot
    return edit


# --- Lirae: spectacles and a beak; the feeling is in her eyes behind the lenses -------------------------

def lirae(face):
    def edit(b):
        lens = [(7, 7), (8, 7), (7, 8), (8, 8)]
        put(b, lens, "steel5", True)                                       # clear the lenses
        if face == "happy":
            put(b, [(7, 8), (8, 7)], "ink", True)                          # eyes crinkled, smiling
            put(b, [(7, 5), (8, 4)], "night1", True)                       # tufts lifted
        elif face == "angry":
            put(b, [(7, 8), (8, 8)], "ink", True)                          # eyes narrowed to slits
            put(b, [(7, 5), (8, 6)], "night1", True)                       # tufts pulled down
            put(b, [(9, 12), (10, 12), (11, 12), (12, 12)], "ink")         # the beak clamped
        elif face == "alarmed":
            put(b, [(8, 8)], "ink", True)                                  # pupils small in wide eyes
            put(b, [(7, 4), (8, 4)], "night1", True)                       # tufts high
            put(b, [(10, 12), (11, 12), (10, 13), (11, 13)], "ink")        # the beak open
        elif face == "worried":
            put(b, [(8, 8)], "ink", True)
            put(b, [(7, 5), (8, 4)], "night1", True)                       # tufts rise at the middle
            put(b, [(10, 12), (11, 12)], "ink")
        elif face == "determined":
            put(b, [(7, 7), (8, 7)], "night4", True)                       # lids level and low
            put(b, [(8, 8)], "ink", True)
            put(b, [(7, 5), (8, 5)], "night1", True)
    return edit


# --- The Hollow Knight: no face, by design; a light inside the visor slit says what it feels -------------

KNIGHT_LIGHT = {"happy": ("gold5", "gold4"), "grieving": ("azure3", "azure1"), "angry": ("fire2", "fire1"),
                "alarmed": ("steel5", "steel4"), "worried": ("teal3", "teal1"), "determined": ("gold6", "gold5")}


def knight(face):
    def edit(b):
        core, glow = KNIGHT_LIGHT[face]
        put(b, [(8, 8)], core, True)                                       # two lights in the dark slit
        if face in ("angry", "determined"):
            put(b, [(7, 8), (9, 8)], glow, True)                           # burning wide
        elif face == "alarmed":
            put(b, [(7, 8)], glow, True)
    return edit


DRAWS = {"pyreth": simple.pyreth, "rodain": simple.rodain, "mirael": simple.mirael, "kael": simple.kael,
         "lirae": simple.lirae, "varn": more.varn, "ashara": more.ashara, "thornwick": more.thornwick_v3,
         "sera": more.sera_v2, "hollow-knight": more.hollow_knight}


def edit_for(bid, face):
    if bid == "ashara":
        return ashara(face)
    if bid == "lirae":
        return lirae(face)
    if bid == "hollow-knight":
        return knight(face)
    return engine_face(bid, face)


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    made = 0
    for bid, draw in DRAWS.items():
        base = cells_of(draw)
        locked = Image.open(OFFICIAL / f"bust_{bid}.png").convert("RGBA")
        assert ImageChops.difference(_image(base), locked).getbbox() is None, f"{bid}: redraw differs from the locked bust"
        for face in FACES:
            if (bid, face) in LOCKED:
                continue
            b = cells_of(draw)
            edit_for(bid, face)(b)
            img = _image(b)
            img.save(OUT / f"bust_{bid}_{face}_v1.png")
            upscale(img, 8).save(PREVIEW / f"bust_{bid}_{face}_v1_x8.png")
            made += 1
    print(made, "faces")


if __name__ == "__main__":
    main()
