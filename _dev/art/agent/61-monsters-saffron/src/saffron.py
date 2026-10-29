"""Saffron Dunes monsters (2026-10-29), fill grids for 44-bestiary's kit, same contract as 57's m2.py.
Each function returns (fills, key, pose, cracks, flip). Cracks are walked down the body over cells filled in every
frame (see crack_path), so the build's crack check always holds."""
import math
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "44-bestiary" / "src"))
from creatures import pose  # noqa: E402  (44-bestiary's)
from kit import Canvas  # noqa: E402


def crack_path(frames, x, y0, n, step=3):
    """A zigzag crack going down from (x, y0): every cell is filled in every frame."""
    cells, cx, y = [], x, y0
    while len(cells) < n and y < len(frames[0]):
        for tx in (cx, cx + 1, cx - 1):
            if all(0 <= tx < len(f[y]) and f[y][tx] != "." for f in frames):
                cx = tx
                cells.append((cx, y))
                break
        y += 1
        if len(cells) % step == 0:
            cx += 1 if (y // step) % 2 else -1
    return cells


def spots(pts):
    """Hurt marks in image coordinates (+1 column, +2 rows) from fill cells."""
    return [(x + 1, y + 2) for x, y in pts]


def serpopard():
    """Egyptian serpent-necked leopard: a lean lioness body with a very long, banded S-curve neck, the round-eared
    head swaying on top, a tufted tail. Teal, so it stands off the sand. Walk: neck sways, legs alternate."""
    frames = []
    for alt in (False, True):
        c = Canvas(24, 22)
        ph = 1.6 if alt else 0.0

        def off(y):
            return round(2.2 * math.sin((13 - y) / 2.1 + ph))
        c.rect(5, 13, 18, 17, "B")                                       # the lean body
        c.rect(6, 17, 17, 17, "b")                                       # lighter belly
        for i, lx in enumerate((5, 9, 13, 17)):
            ext = 1 if (i + alt) % 2 else 0
            c.rect(lx, 18, lx + 1, 20 + ext, "B")
            c.rect(lx, 21, lx + 2, 21, "b")
        c.pts([(19, 14), (20, 13), (21, 12), (21, 11), (21, 10)], "B")    # tail
        c.rect(20, 7, 22, 9, "T")                                        # the tuft
        for y in range(5, 14):                                           # the long neck, three wide
            o = off(y)
            c.rect(6 + o, y, 8 + o, y, "B" if y % 3 else "N")
        hx = 7 + off(5)
        c.rect(hx - 2, 2, hx + 2, 5, "B")                                # round-eared head
        c.rect(hx + 2, 4, hx + 5, 5, "b")                                # blunt cat muzzle
        c.pts([(hx - 2, 1), (hx - 1, 1), (hx + 1, 1), (hx + 2, 1)], "B")
        c.pts([(hx - 2, 0), (hx + 2, 0)], "N")                           # ear tips
        c.px(hx, 3, "e")
        c.px(hx + 2, 3, "e")
        c.px(hx + 5, 4, "n")
        frames.append(c.rows())
    key = {"B": "sea2", "b": "sea3", "N": "sea1", "T": "sea1", "e": "gold5", "n": "ink"}
    p = pose(15, "sea2", "sea1", spots([(8, 15), (13, 15)]))
    return frames, key, p, [crack_path(frames, 9, 13, 4), crack_path(frames, 14, 13, 4), crack_path(frames, 7, 7, 4)], False


def line(c, pts, ch, w=2):
    """Connect the points with a thick line (w x w blocks), so tails and limbs are one unbroken shape."""
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(abs(x1 - x0), abs(y1 - y0), 1)
        for i in range(n + 1):
            x = round(x0 + (x1 - x0) * i / n)
            y = round(y0 + (y1 - y0) * i / n)
            c.rect(x, y, x + w - 1, y + w - 1, ch)


def nasnas():
    """Arabian half-man: half a head, half a body, one arm, one leg; the cut side is a dark hollow with ragged
    edges. Gray skin, one big gold eye, a balancing tail. Walk: a crouch and a leap (the leg bends)."""
    frames = []
    for alt in (False, True):
        c = Canvas(18, 23)
        d = 2 if alt else 0                                              # crouch depth
        line(c, [(10, 14 + d), (13, 12 + d), (15, 9 + d)], "H", 1)       # a balancing tail
        c.pts([(2, 2 + d), (3, 0 + d), (4, 2 + d), (5, 0 + d), (6, 2 + d)], "R")   # wild hair spikes
        c.rect(2, 2 + d, 7, 7 + d, "S")                                  # half a head
        c.rect(8, 2 + d, 8, 7 + d, "H")                                  # the hollow cut side
        c.pts([(9, 3 + d), (9, 5 + d), (9, 7 + d)], "H")
        c.rect(3, 3 + d, 5, 5 + d, "e")                                  # one big eye
        c.px(4, 4 + d, "n")
        c.rect(3, 7 + d, 6, 7 + d, "n")                                  # a wide mouth
        c.rect(3, 8 + d, 7, 14 + d, "S")                                 # half a torso, narrower than the head
        c.rect(8, 8 + d, 8, 14 + d, "H")
        c.pts([(9, 9 + d), (9, 12 + d)], "H")
        c.rect(3, 11 + d, 7, 11 + d, "R")                                # a sash
        line(c, [(2, 9 + d), (0, 13 + d), (0, 16 + d)], "S", 2)          # the one arm, reaching down and out
        c.rect(3, 15 + d, 7, 16 + d, "L")                                # a rag skirt
        if alt:                                                          # the leg bent, foot tucked
            c.rect(3, 17 + d, 5, 18 + d, "S")
            c.rect(5, 19, 8, 20, "S")
            c.rect(2, 21, 7, 21, "S")
        else:
            c.rect(3, 17, 5, 20, "S")
            c.rect(2, 21, 7, 22, "S")
        frames.append(c.rows())
    key = {"S": "ash3", "H": "shadow1", "R": "shadow3", "L": "night2", "e": "gold5", "n": "ink"}
    p = pose(13, "ash3", "ash2", spots([(4, 9), (4, 14)]))
    return frames, key, p, [crack_path(frames, 4, 8, 4, 2), crack_path(frames, 5, 3, 3, 2)], False


def bungisngis():
    """Philippine one-eyed laughing giant: a huge blue head with ONE big gold eye under a heavy brow, a wide
    laughing mouth, two white tusks curving up from the jaw, thick arms hanging, a belly and a hide loincloth.
    Walk: a laughing bob, one fist raised."""
    frames = []
    for alt in (False, True):
        c = Canvas(26, 24)
        b = 1 if alt else 0                                              # a bob in the laugh
        c.pts([(8, 1 + b), (10, 0 + b), (12, 1 + b), (14, 0 + b), (16, 1 + b)], "R")     # wild hair
        c.rect(7, 2 + b, 18, 10 + b, "B")                                # big head
        c.rect(7, 2 + b, 18, 3 + b, "R")                                 # hair line
        c.rect(8, 4 + b, 17, 4 + b, "n")                                 # heavy brow
        c.rect(11, 5 + b, 14, 8 + b, "W")                                # the single eye
        c.rect(12, 6 + b, 13, 7 + b, "e")
        c.rect(7, 9 + b, 18, 10 + b, "n")                                # the laughing mouth
        c.pts([(9, 9 + b), (11, 9 + b), (14, 9 + b), (16, 9 + b)], "W")
        c.pts([(6, 6 + b), (6, 7 + b), (6, 8 + b), (6, 9 + b), (7, 8 + b)], "W")     # tusks
        c.pts([(19, 6 + b), (19, 7 + b), (19, 8 + b), (19, 9 + b), (18, 8 + b)], "W")
        c.rect(5, 11 + b, 20, 19, "B")                                   # barrel body
        c.rect(9, 13 + b, 16, 17, "b")                                   # belly
        c.rect(5, 18, 20, 19, "L")                                       # loincloth
        c.rect(1, 12 + b, 4, 19, "B")                                    # the left arm hangs
        c.rect(0, 20, 4, 22, "B")                                        # its fist
        if alt:                                                          # the right fist raised in the laugh
            c.rect(21, 8, 24, 16, "B")
            c.rect(21, 5, 25, 7, "B")
        else:
            c.rect(21, 12, 24, 19, "B")
            c.rect(21, 20, 25, 22, "B")
        c.rect(6, 20, 11, 23, "B")
        c.rect(14, 20, 19, 23, "B")
        c.pts([(6, 23), (7, 23), (18, 23), (19, 23)], "n")
        frames.append(c.rows())
    key = {"B": "azure2", "b": "azure3", "R": "azure1", "n": "ink", "W": "steel5", "e": "gold5", "L": "wood3"}
    p = pose(19, "azure2", "azure1", spots([(8, 14), (16, 16)]))
    return frames, key, p, [crack_path(frames, 9, 11, 5), crack_path(frames, 16, 11, 5), crack_path(frames, 14, 2, 2)], False


def girtablilu():
    """Babylonian scorpion-man: a bearded human head with a horned tiara, torso and raised arms on a chitin
    scorpion body with big pincers, four legs a side and a tail arching over with a barbed sting. Green chitin."""
    frames = []
    for alt in (False, True):
        c = Canvas(30, 28)
        s = 1 if alt else 0
        line(c, [(23, 20), (27, 17), (28, 11 - s), (26, 6 - s), (22, 3 - s), (19, 5 - s)], "C", 2)    # the tail arch
        c.pts([(17, 6 - s), (18, 7 - s), (16, 5 - s), (17, 7 - s), (19, 7 - s)], "S")     # the barbed sting
        c.rect(5, 17, 24, 23, "C")                                       # the carapace
        c.pts([(5, 17), (24, 17), (5, 23), (24, 23)], ".")
        c.rect(7, 17, 22, 18, "D")
        for x in (9, 13, 17, 21):
            c.rect(x, 19, x, 23, "D")                                    # plate lines
        for i, y in enumerate((18, 20, 22, 23)):                         # four legs a side
            lo = (1 if (i + s) % 2 else 0)
            c.pts([(4, y), (3, y), (2, y + 1 + lo), (1, y + 2 + lo)], "C")
            c.pts([(25, y), (26, y), (27, y + 1 + lo), (28, y + 2 + lo)], "C")
        for sx in (0, 1):                                                # the big pincers
            def x(v, sx=sx):
                return v if sx == 0 else 29 - v
            c.rect(x(1), 11 - s, x(3), 17, "C")
            c.rect(x(0), 6 - s, x(1), 10 - s, "C")                       # the claw's two prongs
            c.rect(x(3), 6 - s, x(4), 10 - s, "C")
            c.px(x(2), 6 - s, "D")
        c.rect(11, 8, 18, 17, "K")                                       # human torso (gray skin)
        c.rect(12, 14, 17, 17, "L")                                      # kilt
        c.rect(9, 9, 10, 14, "K")                                        # arms raised, palms out
        c.rect(19, 9, 20, 14, "K")
        c.pts([(8, 8), (9, 8), (8, 7), (20, 8), (21, 8), (21, 7)], "K")
        c.rect(11, 2, 18, 7, "K")                                        # the head
        c.rect(12, 6, 17, 8, "N")                                        # the long beard
        c.pts([(13, 4), (16, 4)], "e")
        c.pts([(11, 1), (11, 0), (10, 0), (18, 1), (18, 0), (19, 0)], "G")   # horned tiara
        c.rect(12, 1, 17, 1, "G")
        frames.append(c.rows())
    key = {"C": "emerald2", "D": "emerald1", "K": "ash2", "N": "night1", "L": "wood3", "G": "gold4", "S": "steel5",
           "e": "gold5"}
    p = pose(16, "emerald2", "emerald1", spots([(14, 20), (20, 21)]))
    return frames, key, p, [crack_path(frames, 12, 17, 5), crack_path(frames, 19, 17, 5), crack_path(frames, 14, 8, 4)], False


def manticore():
    """Persian man-eater (mini-boss): a violet lion with a human face in an orange mane, a mouth of three rows of
    white teeth, and a scorpion tail arching over the back with a gold-tipped sting."""
    frames = []
    for alt in (False, True):
        c = Canvas(36, 31)
        s = 1 if alt else 0
        line(c, [(24, 24), (30, 20), (32, 13 - s), (29, 7 - s), (24, 4 - s), (20, 6 - s)], "B", 2)   # the tail arch
        c.pts([(18, 7 - s), (19, 8 - s), (17, 6 - s), (18, 9 - s)], "S")
        c.pts([(17, 7 - s), (16, 8 - s)], "Y")
        c.rect(4, 1, 25, 16, "M")                                        # the mane
        c.pts([(4, 1), (25, 1), (4, 16), (25, 16)], ".")
        c.pts([(7, 0), (10, 0), (13, 0), (16, 0), (19, 0), (22, 0), (3, 5), (3, 9), (3, 13), (26, 5), (26, 9), (26, 13)], "M")
        c.rect(8, 3, 21, 15, "K")                                        # the human face
        c.rect(8, 3, 21, 4, "H")                                         # hair
        c.rect(9, 5, 20, 5, "n")                                         # brows
        c.pts([(11, 6), (12, 6), (17, 6), (18, 6)], "e")
        c.rect(10, 9, 19, 14, "n")                                       # the open mouth, three rows of teeth
        for y in (9, 11, 13):
            for x in range(10, 20):
                if (x + y // 2) % 2 == 0:
                    c.px(x, y, "W")
        c.rect(5, 17, 24, 25, "B")                                       # the lion body, broad chest
        c.rect(10, 18, 19, 23, "b")
        c.rect(3, 20, 6, 26, "B")                                        # shoulders and haunches
        c.rect(23, 20, 26, 26, "B")
        c.rect(5 + s, 26, 11, 30, "B")
        c.rect(18, 26, 24 - s, 30, "B")
        c.rect(4 + s, 30, 11, 30, "b")
        c.rect(18, 30, 25 - s, 30, "b")
        frames.append(c.rows())
    key = {"B": "shadow2", "b": "shadow3", "M": "fire1", "K": "night4", "H": "shadow1", "n": "ink", "W": "steel5",
           "e": "gold5", "S": "steel5", "Y": "gold5"}
    p = pose(20, "shadow2", "shadow1", spots([(12, 19), (19, 22)]))
    return frames, key, p, [crack_path(frames, 11, 17, 6), crack_path(frames, 18, 17, 6), crack_path(frames, 14, 2, 2)], False


def mummy():
    """SRD mummy: stiff, bandaged from crown to toes in pale gray wrappings cut by ink gaps, arms raised forward,
    loose strips trailing, an azure broad collar with gold beads. Not a skeleton: no bones, a wrapped head."""
    frames = []
    for alt in (False, True):
        c = Canvas(18, 24)
        c.rect(5, 1, 12, 7, "W")                                         # wrapped head
        c.rect(5, 4, 12, 5, "n")                                         # the eye gap
        c.pts([(7, 4), (10, 4)], "e")
        for y in (2, 6):
            c.rect(5, y, 12, y, "V")
        c.rect(3, 8, 14, 9, "A")                                         # the broad collar
        c.pts([(5, 9), (8, 9), (11, 9)], "G")
        c.rect(4, 10, 13, 17, "W")                                       # torso
        for y in (11, 13, 15, 17):
            c.rect(4, y, 13, y, "V")
        for sx in (0, 1):                                                # arms raised, wrapped
            def x(v, sx=sx):
                return v if sx == 0 else 17 - v
            up = (alt and sx == 0) or (not alt and sx == 1)
            ytop = 8 if up else 10
            c.rect(x(2), ytop, x(3), ytop + 6, "W")
            c.rect(x(1), ytop - 1, x(2), ytop, "W")
            c.pts([(x(2), ytop + 2), (x(3), ytop + 4)], "V")
            c.pts([(x(1), ytop + 5), (x(0), ytop + 6)], "T")
        c.rect(5, 18, 8, 23, "W")                                        # legs
        c.rect(9, 18, 12, 23, "W")
        c.pts([(5, 20), (6, 20), (9, 21), (10, 21)], "V")
        if alt:
            c.pts([(13, 18), (14, 19), (14, 20), (15, 20), (15, 21)], "T")
            c.pts([(4, 18), (3, 19), (3, 20)], "T")
        else:
            c.pts([(13, 18), (13, 19), (14, 20), (14, 21)], "T")
            c.pts([(4, 18), (4, 19), (3, 20), (3, 21), (2, 21)], "T")
        frames.append(c.rows())
    key = {"W": "steel4", "V": "steel2", "n": "ink", "e": "gold5", "A": "azure2", "G": "gold4", "T": "steel3"}
    p = pose(16, "steel4", "steel2", spots([(7, 12), (10, 16)]))
    return frames, key, p, [crack_path(frames, 8, 10, 4), crack_path(frames, 11, 10, 4), crack_path(frames, 7, 1, 3)], False


def poludnitsa():
    """Slavic noon spirit: a tall woman in a white gown with grass for hair, mismatched eyes (gold and pale blue),
    pale violet skin, long reaching arms, the hem shimmering like heat. Walk: the hem and the grass ripple."""
    frames = []
    for alt in (False, True):
        c = Canvas(20, 30)
        a = 1 if alt else 0
        for x in range(4, 16, 2):                                        # grass hair, spiked
            xx = x + (a if x % 4 else 0)
            c.rect(xx, 0, xx, 2, "G")
        c.rect(4, 2, 15, 9, "G")                                         # hair mass
        c.rect(3 - a, 7, 4, 17, "G")                                     # long grass strands
        c.rect(15, 7, 16 + a, 17, "G")
        c.rect(6, 3, 13, 9, "K")                                         # the face
        c.px(8, 5, "e")
        c.px(11, 5, "E")
        c.pts([(9, 8), (10, 8)], "n")
        c.rect(7, 10, 12, 12, "W")                                       # shoulders
        for y in range(11, 29):                                          # the gown, flaring
            w = 3 + (y - 11) * 4 // 9
            c.rect(9 - w, y, 10 + w - 1, y, "W" if (y + a) % 5 else "V")
        for y in (28, 29):                                               # the wavering hem
            for x in range(1, 19):
                if (x + y + a * 2) % 4 == 0:
                    c.px(x, y, ".")
        c.pts([(x, 29) for x in range(3, 17) if (x + a) % 3], "V")
        for sx in (0, 1):                                                # reaching arms
            def x(v, sx=sx):
                return v if sx == 0 else 19 - v
            c.rect(x(6), 11, x(7), 12, "W")
            c.rect(x(4), 12 + a, x(6), 13 + a, "W")
            c.rect(x(2), 14 + a, x(4), 15 + a, "K")
            c.pts([(x(1), 16 + a), (x(2), 16 + a), (x(1), 17 + a)], "K")
        frames.append(c.rows())
    key = {"G": "green2", "K": "night4", "e": "gold5", "E": "azure3", "n": "ink", "W": "steel5", "V": "steel4"}
    p = pose(18, "steel5", "steel3", spots([(9, 15), (10, 22)]))
    return frames, key, p, [crack_path(frames, 9, 12, 5), crack_path(frames, 12, 14, 5), crack_path(frames, 8, 3, 3)], False


CREATURES = {"serpopard": serpopard, "nasnas": nasnas, "mummy": mummy, "bungisngis": bungisngis,
             "girtablilu": girtablilu, "poludnitsa": poludnitsa, "manticore": manticore}
FLIERS = set()
RIDERS = {}
