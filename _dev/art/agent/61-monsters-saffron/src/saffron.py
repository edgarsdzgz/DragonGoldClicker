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


def line(c, pts, ch, w=2):
    """Connect the points with a thick line (w x w blocks), so tails and limbs are one unbroken shape."""
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(abs(x1 - x0), abs(y1 - y0), 1)
        for i in range(n + 1):
            x = round(x0 + (x1 - x0) * i / n)
            y = round(y0 + (y1 - y0) * i / n)
            c.rect(x, y, x + w - 1, y + w - 1, ch)


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


def serpopard():
    """Egyptian serpent-necked leopard, v2, front-on: a leopard's broad chest and two front legs facing us, haunches
    and hind paws peeking behind, a very long S-curve neck rising from the shoulders to a small cat head, flat spot
    clusters, a tail curling up at the side. Teal. Walk: the neck sways, the front paws alternate."""
    frames = []
    for alt in (False, True):
        c = Canvas(28, 30)
        ph = 1.8 if alt else 0.0

        def off(y):
            return round(2.4 * math.sin((17 - y) / 2.6 + ph))
        line(c, [(22, 22), (25, 20), (26, 15), (24, 11)], "B", 2)        # the tail curling up at the side
        c.rect(23, 8, 25, 10, "T")                                       # the tuft
        c.rect(4, 19, 8, 26, "D")                                        # haunches behind
        c.rect(19, 19, 23, 26, "D")
        c.rect(4, 26, 7, 27, "b")                                        # hind paws peeking out
        c.rect(20, 26, 23, 27, "b")
        c.rect(7, 16, 20, 24, "B")                                       # the broad chest
        c.pts([(7, 16), (20, 16)], ".")
        c.rect(11, 20, 16, 24, "b")                                      # pale chest
        ext = 1 if alt else 0
        c.rect(7, 24, 10, 27 + ext, "B")                                 # the two front legs
        c.rect(17, 24, 20, 28 - ext, "B")
        c.rect(6, 28 + ext - 1, 11, 28 + ext, "b")                       # big front paws
        c.rect(16, 28 - ext - 1, 21, 28 - ext, "b")
        for y in range(5, 17):                                           # the long neck, four wide
            o = off(y)
            c.rect(11 + o, y, 14 + o, y, "B")
        hx = 12 + off(5)
        c.rect(hx - 2, 1, hx + 3, 4, "B")                                # a small cat head
        c.pts([(hx - 2, 0), (hx - 1, 0), (hx + 2, 0), (hx + 3, 0)], "N")  # ears
        c.pts([(hx - 1, 2), (hx + 2, 2)], "e")
        c.pts([(hx, 3), (hx + 1, 3)], "n")
        c.rect(hx, 5, hx + 1, 5, "b")
        for sx, sy in ((9, 18), (10, 19), (10, 18), (17, 18), (18, 19), (17, 19), (14, 22), (15, 22)):   # spot clusters
            c.px(sx, sy, "N")
        for y in (8, 12):
            c.pts([(11 + off(y), y), (12 + off(y), y), (13 + off(y), y + 1)], "N")
        frames.append(c.rows())
    key = {"B": "sea2", "b": "sea3", "N": "sea1", "D": "sea1", "T": "sea1", "e": "gold5", "n": "ink"}
    p = pose(20, "sea2", "sea1", spots([(10, 20), (17, 21)]))
    return frames, key, p, [crack_path(frames, 9, 17, 4), crack_path(frames, 18, 17, 4), crack_path(frames, 12, 8, 4)], False


def nasnas():
    """Arabian half-man, v2: split down the middle. Half a head with one eye, half a torso, one arm, one leg; the
    right edge is a clean vertical cut with nothing beyond it, so the silhouette itself is half a person. A ragged
    half-garment in violet-blue. Walk: a hop on the one leg (airborne, then down)."""
    frames = []
    for alt in (False, True):
        c = Canvas(11, 26)
        y0 = 0 if alt else 3                                             # airborne in frame B, grounded in A
        c.pts([(3, y0), (5, y0 - 0), (7, y0)], "R")                      # tufts of hair
        c.rect(3, y0 + 1, 7, y0 + 7, "S")                                # half a head, cut at column 7
        c.rect(2, y0 + 3, 2, y0 + 6, "S")
        c.rect(4, y0 + 3, 5, y0 + 5, "e")                                # the one big eye
        c.px(4, y0 + 4, "n")
        c.rect(3, y0 + 7, 6, y0 + 7, "n")                                # half a grin
        c.rect(3, y0 + 8, 7, y0 + 14, "S")                               # half a torso
        line(c, [(2, y0 + 9), (0, y0 + 13), (0, y0 + 17)], "S", 2)       # the one arm, long, hanging
        c.rect(3, y0 + 12, 7, y0 + 12, "R")                              # the sash
        for i, x in enumerate((3, 4, 5, 6, 7)):                          # a ragged half-skirt, torn hem
            c.rect(x, y0 + 13, x, y0 + 16 + (i % 2) * 2 + (1 if x == 3 else 0), "L")
        if alt:
            c.rect(5, y0 + 17, 7, y0 + 20, "S")                          # the leg dangling in the air
            c.rect(4, y0 + 21, 7, y0 + 22, "S")
        else:
            c.rect(5, y0 + 17, 7, y0 + 21, "S")                          # the leg planted
            c.rect(3, y0 + 22, 7, y0 + 22, "S")
        frames.append(c.rows())
    key = {"S": "ash3", "R": "shadow3", "L": "night3", "e": "gold5", "n": "ink"}
    p = pose(14, "ash3", "ash2", spots([(5, 11), (6, 14)]))
    return frames, key, p, [crack_path(frames, 5, 11, 4, 2), crack_path(frames, 5, 6, 3, 2)], False


def bungisngis():
    """Philippine one-eyed laughing giant, v2: the tallest regular. A hulking blue body, long arms, big fists and a
    club, one big gold eye in the middle of the forehead, a wide open laughing mouth with two big bone-white tusks
    curving up out of it, a belt and a loincloth. Walk: a laughing bob, the club swings."""
    frames = []
    for alt in (False, True):
        c = Canvas(32, 35)
        b = 1 if alt else 0                                              # a bob in the laugh
        c.pts([(9, 2 + b), (11, 1 + b), (13, 0 + b), (16, 0 + b), (19, 0 + b), (21, 1 + b), (23, 2 + b)], "R")
        c.rect(8, 3 + b, 23, 13 + b, "B")                                # big head
        c.rect(8, 3 + b, 23, 4 + b, "R")
        c.rect(10, 5 + b, 21, 5 + b, "n")                                # heavy brow
        c.rect(13, 6 + b, 18, 10 + b, "W")                               # the single eye
        c.rect(15, 7 + b, 16, 9 + b, "e")
        c.px(15, 8 + b, "n")
        c.rect(10, 11 + b, 21, 14 + b, "n")                              # the wide laughing mouth
        c.rect(12, 11 + b, 19, 11 + b, "W")                              # teeth
        for x0, tx in ((9, 1), (21, -1)):                                # two big tusks curving up and in
            for i, y in enumerate(range(14 + b, 5 + b, -1)):
                x = x0 + (tx if i > 5 else 0)
                c.rect(x, y, x + 1, y, "T")
        c.rect(6, 15 + b, 25, 27, "B")                                   # hulking shoulders and chest
        c.rect(10, 17 + b, 21, 23, "b")                                  # belly
        c.rect(9, 24, 22, 25, "O")                                       # belt
        c.rect(9, 26, 22, 30, "L")                                       # loincloth
        c.rect(1, 16 + b, 5, 30, "B")                                    # long left arm
        c.rect(0, 31, 6, 34, "B")                                        # big fist
        c.rect(26, 16 + b, 30, 30, "B")                                  # long right arm
        c.rect(25, 31, 31, 34, "B")
        cy = 12 if alt else 15                                           # the club, swinging
        c.rect(27, cy, 29, 31, "P")
        c.rect(26, cy - 5, 30, cy + 1, "P")
        c.pts([(28, cy - 4), (28, cy - 2)], "G")
        c.rect(9, 31, 14, 34, "B")
        c.rect(17, 31, 22, 34, "B")
        c.pts([(9, 34), (10, 34), (21, 34), (22, 34)], "n")
        frames.append(c.rows())
    key = {"B": "azure2", "b": "azure3", "R": "azure1", "n": "ink", "W": "steel5", "T": "parch3", "e": "gold5",
           "O": "gold4", "L": "wood3", "P": "wood2", "G": "steel3"}
    p = pose(26, "azure2", "azure1", spots([(9, 17), (20, 21)]))
    return frames, key, p, [crack_path(frames, 10, 15, 5), crack_path(frames, 20, 15, 5), crack_path(frames, 11, 3, 2)], False


def manticore():
    """Persian man-eater, v2: a lion first, front-on: a broad chest, two thick front legs with clawed paws planted
    wide, haunches behind, a ragged spiky mane ring around a small human face (eyes, nose, beard, a wide mouth of
    three rows of teeth), and a segmented tail arched high with a spiked ball of spines. Violet with an orange mane."""
    frames = []
    for alt in (False, True):
        c = Canvas(40, 34)
        s = 1 if alt else 0
        pts = [(29, 25), (34, 21), (36, 14), (33, 7), (28, 4)]            # the segmented tail
        cells = []
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = max(abs(x1 - x0), abs(y1 - y0))
            cells += [(round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n)) for i in range(n)]
        for i, (x, y) in enumerate(cells):
            c.rect(x, y - s * (1 if y < 14 else 0), x + 1, y + 1 - s * (1 if y < 14 else 0), "B" if (i // 3) % 2 else "b")
        by = -s
        c.rect(25, 1 + by, 29, 6 + by, "S")                              # the spiked ball of spines
        c.pts([(24, 3 + by), (23, 3 + by), (30, 0 + by), (30, 7 + by), (27, 0 + by), (27, 7 + by), (25, 7 + by),
               (24, 1 + by)], "S")
        c.rect(5, 20, 11, 28, "D")                                       # haunches behind
        c.rect(26, 20, 32, 28, "D")
        c.rect(5, 28, 10, 29, "b")
        c.rect(27, 28, 32, 29, "b")
        for x in range(0, 40):                                           # the ragged mane ring
            for y in range(0, 26):
                dx, dy = x - 18, y - 11.5
                ang = math.atan2(dy, dx)
                r = math.hypot(dx * 0.92, dy)
                spike = (int((ang + math.pi) * 11 / math.pi) % 2) * 3 + (int((ang + math.pi) * 11 / math.pi) % 3)
                if r <= 8.2 + spike * 0.9:
                    c.px(x, y, "M")
        c.rect(7, 17, 29, 29, "B")                                       # the broad chest
        c.rect(12, 20, 24, 27, "b")                                      # pale chest
        c.pts([(7, 17), (29, 17), (7, 29), (29, 29)], ".")
        for lx, up in ((6, 0), (23, s)):                                 # two thick front legs, claws, planted wide
            c.rect(lx + 1, 27 - up, lx + 7, 31 - up, "B")
            c.rect(lx - 1, 31 - up, lx + 8, 33 - up, "b")
            c.pts([(lx - 1, 33 - up), (lx + 2, 33 - up), (lx + 5, 33 - up), (lx + 8, 33 - up)], "W")
        c.rect(14, 6, 22, 16, "K")                                       # the human face
        c.pts([(14, 6), (22, 6), (14, 16), (22, 16)], ".")
        c.rect(14, 6, 22, 7, "H")                                        # hair
        c.pts([(15, 8), (16, 8), (20, 8), (21, 8)], "e")                 # eyes
        c.pts([(18, 9), (18, 10)], "k")                                  # nose
        c.rect(15, 11, 21, 14, "n")                                      # the wide mouth
        for y in (11, 12, 13):                                           # three rows of teeth
            for x in range(15, 22):
                if (x + y) % 2 == 0:
                    c.px(x, y, "W")
        c.rect(16, 15, 20, 16, "H")                                      # the beard
        frames.append(c.rows())
    key = {"B": "shadow2", "b": "shadow3", "D": "shadow1", "M": "fire1", "K": "night4", "H": "shadow1", "n": "ink",
           "W": "steel5", "e": "gold5", "S": "steel5", "k": "night2"}
    p = pose(22, "shadow2", "shadow1", spots([(11, 20), (25, 22)]))
    return frames, key, p, [crack_path(frames, 11, 18, 6), crack_path(frames, 25, 18, 6), crack_path(frames, 18, 1, 3)], False


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
