"""Monster batch 59 (2026-10-29): Elderbough Crown, drawn as fill grids for 44-bestiary's kit.

Each function returns (fills, key, pose, cracks, flip); fills is [frame A, frame B] (A is the idle). The pose is in
image coordinates (fill + 1 column, + 2 rows), built here by P() from fill coordinates; cracks are in fill
coordinates and every crack cell must be on the body in both frames. Four regulars (Amomongo, Nogitsune, Swarm of
Spiders, Kalanoro), two elites (Leshy, Sasabonsam) and the boss (Humbaba).
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "44-bestiary" / "src"))
from creatures import pose  # noqa: E402  (44-bestiary's)
from kit import Canvas  # noqa: E402


def P(waist, body, dark, spots, weapon=None):
    """44-bestiary's pose with the broken spots given in fill coordinates."""
    s = [(x + 1, y + 2) for x, y in spots]
    return pose(waist, body, dark, s, weapon) if weapon else pose(waist, body, dark, s)


def amomongo():
    """Negros hairy white ape: heavy shoulders, long arms hanging to long parchment-colored nails, a dark face,
    short bowed legs. Walk: the head dips into the shoulders."""
    a = ["......FFFFFF......",
         ".....FFFFFFFF.....",
         ".....FDDDDDDF.....",
         ".....FDeDDeDF.....",
         ".....FDDDDDDF.....",
         "......DWnnWD......",
         "..FFFFFFFFFFFFFF..",
         ".FFFFFFFFFFFFFFFF.",
         "FFFF.FFFFFFFF.FFFF",
         "FFFF.FFGGGGFF.FFFF",
         "FFFF.FFGGGGFF.FFFF",
         ".FFF.FFFGGFFF.FFF.",
         ".FFF.FFFFFFFF.FFF.",
         ".FFF.FFF..FFF.FFF.",
         ".FFF.FFF..FFF.FFF.",
         ".FFF.FFF..FFF.FFF.",
         ".p.p.FFF..FFF.p.p."]
    b = ["." * 18] + a[:4] + a[5:]
    key = {"F": "steel4", "G": "steel3", "D": "ash2", "e": "gold5", "W": "parch3", "n": "ink", "p": "parch3"}
    p = P(8, "steel4", "steel2", [(5, 10), (12, 11)])
    cracks = [[(6, 7), (6, 8), (7, 9), (7, 10)], [(11, 7), (11, 8), (10, 9), (10, 11)], [(1, 9), (1, 10), (2, 11)],
              [(16, 9), (16, 11), (15, 12)]]
    return [a, b], key, p, cracks, False


def nogitsune_v1():
    """Wild fox (v2): tall pointed ears, a narrow white muzzle, a white ruff and chest, and four separate tails fanned
    up and outward behind it, each tipped with teal fox-fire. Walk: the fire flickers and a front paw lifts."""
    frames = []
    for alt in (False, True):
        c = Canvas(18, 17)
        fl = 1 if alt else 0
        for y in range(2, 10):                                           # outer tails, 2 wide, gap, inner tails
            c.rect(0, y, 1, y, "T", True)
        for y in range(5, 10):
            c.rect(3, y, 4, y, "E", True)
        c.rect(1, 10, 2, 10, "T", True)
        c.rect(2, 11, 3, 11, "T", True)
        c.rect(3, 12, 5, 12, "T", True)
        c.rect(4, 10, 5, 10, "E", True)
        c.rect(5, 11, 5, 11, "E", True)
        c.rect(0, 0 + fl, 1, 1 + fl, "f", True)                          # fox-fire tips
        c.rect(3, 3 + fl, 4, 4 + fl, "f", True)
        rows = [".....EE....EE.....",
                ".....EEE..EEE.....",
                ".....EEEEEEEE.....",
                ".....EeEEEEeE.....",
                ".....WWEEEEWW.....",
                "......WWWWWW......",
                ".......WWWW.......",
                "........nn........",
                ".....EEEWWEEE.....",
                "......EWWWWE......",
                "......EWWWWE......",
                "......EEWWEE......",
                "......EEEEEE......",
                "......EE..EE......",
                "......EE..EE......",
                "......EE..EE......",
                "......WW..WW......"]
        if alt:
            rows[15] = "......EE..W......."
            rows[16] = "......WW.........."
        for y, r in enumerate(rows):
            for x, ch in enumerate(r):
                if ch != ".":
                    c.px(x, y, ch)
        frames.append(c.rows())
    key = {"E": "clay3", "T": "clay2", "W": "parch3", "e": "gold5", "n": "ink", "f": "teal4"}
    p = P(9, "clay3", "clay1", [(7, 9), (10, 12)])
    cracks = [[(6, 9), (6, 10), (7, 11), (7, 12)], [(11, 9), (11, 10), (10, 11), (10, 12)], [(8, 2), (8, 3)],
              [(0, 4), (0, 5), (1, 6)], [(17, 4), (17, 5), (16, 6)], [(3, 7), (3, 8)], [(14, 7), (14, 8)]]
    return frames, key, p, cracks, False


def _tail(c, base, tip, ch, flame, flick):
    """A feathery tail: a stroke from the rump to the tip, widening toward the tip, the last steps teal fire."""
    n = 14
    for i in range(n + 1):
        t = i / n
        x = round(base[0] + (tip[0] - base[0]) * t)
        y = round(base[1] + (tip[1] - base[1]) * t)
        half = 2 if 0.3 < t < 0.85 else 1
        col = flame if t > 0.88 else ch
        yy = y + (flick if t > 0.8 else 0)
        c.rect(x - half, yy, x + half, yy + 1, col)


def nogitsune():
    """Wild fox (v2): a long-snouted head with tall pointed ears and a white muzzle on a lean low body, and four wide
    feathery tails fanned behind and above it from the rump, each tipped with teal fox-fire. The fan is the silhouette.
    Walk: the fire flickers, the tails sway and a front paw lifts."""
    frames = []
    for alt in (False, True):
        c = Canvas(22, 17)
        fl = 1 if alt else 0
        base = (11, 12)
        tips = ((2, 5 + fl), (6, 1 + fl), (15, 1 + fl), (19, 5 + fl))
        for i, tip in enumerate(tips):
            _tail(c, base, tip, "T" if i % 2 == 0 else "E", "f", 0)
        rows = ["..........................",
                ]
        body = [(7, 3, 8, 5), (14, 3, 15, 5)]
        for x0, y0, x1, y1 in body:                                     # tall pointed ears
            c.rect(x0, y0, x1, y1, "E")
        c.pts([(8, 2), (15, 2)], "E")
        c.rect(7, 6, 15, 9, "E")                                        # head
        c.rect(6, 8, 16, 9, "W")                                        # cheek ruff
        c.pts([(8, 7), (14, 7)], "e")
        c.rect(10, 9, 12, 11, "W")                                      # long white muzzle
        c.pts([(11, 12)], "n")
        c.rect(8, 11, 14, 14, "E")                                      # lean body
        c.rect(10, 12, 12, 14, "W")
        c.rect(8, 15, 9, 15, "E")
        c.rect(13, 15 - fl, 14, 15 - fl, "E")
        c.pts([(8, 16), (9, 16)], "W")
        if not alt:
            c.pts([(13, 16), (14, 16)], "W")
        frames.append(c.rows())
    key = {"E": "clay3", "T": "clay2", "W": "parch3", "e": "gold5", "n": "ink", "f": "teal4"}
    p = P(11, "clay3", "clay1", [(9, 12), (13, 13)])
    cracks = [[(8, 12), (8, 13)], [(14, 12), (14, 13)], [(11, 6), (11, 7)]]
    return frames, key, p, cracks, False


def spider(c, cx, cy, alt):
    """One spider: a small head with two gold eyes over a round dark body, four thin legs a side bent outward."""
    c.rect(cx - 1, cy, cx + 1, cy + 1, "H")
    c.pts([(cx - 1, cy), (cx + 1, cy)], "e")
    c.rect(cx - 2, cy + 2, cx + 2, cy + 4, "S")
    c.pts([(cx - 2, cy + 2), (cx + 2, cy + 2)], ".")
    for i in range(4):
        r = cy + 1 + i
        b = -1 if i < 2 else 1
        for side in (-1, 1):
            c.px(cx + side * 3, r, "L")
            c.px(cx + side * 4, max(0, min(c.h - 1, r + b)), "L")


SPIDERS = ((5, 0, 1, 1), (15, 0, -1, 1), (10, 5, 1, 0), (5, 10, -1, -1), (15, 10, 1, -1))


def swarm():
    """Five spiders in a loose cluster (v2): each a round gray body with a small head, two gold eyes and thin
    pale legs, with background between them. Not the Spider Queen (one big purple crowned body). Walk: each spider
    steps a cell sideways and up or down."""
    frames = []
    for alt in (0, 1):
        c = Canvas(21, 16)
        for cx, cy, dx, dy in SPIDERS:
            spider(c, cx + dx * alt, cy + dy * alt, alt)
        frames.append(c.rows())
    key = {"S": "wood2", "H": "wood3", "L": "steel4", "e": "gold5"}
    p = P(8, "ash2", "ash1", [(10, 8), (5, 13), (15, 13)])
    cracks = [[(cx, cy + 2), (cx, cy + 3)] for cx, cy, dx, dy in SPIDERS]
    return frames, key, p, cracks, False


def spider_v1(c, cx, cy, big, alt):
    if big:
        c.rect(cx - 2, cy, cx + 2, cy + 2, "S")
        c.pts([(cx - 1, cy), (cx + 1, cy)], "e")
        c.pts([(cx, cy + 2)], "M")
        reach, dys = 3, (-1, 0, 1, 2, 3)
    else:
        c.rect(cx - 1, cy, cx + 1, cy + 1, "S")
        c.pts([(cx - 1, cy), (cx + 1, cy)], "e")
        reach, dys = 2, (-1, 0, 1, 2)
    for i, dy in enumerate(dys):
        s = -1 if (i + alt) % 2 == 0 else 1
        for side in (-1, 1):
            c.px(cx + side * reach, cy + dy, "L")
            c.px(cx + side * (reach + 1), max(0, min(13, cy + dy + s)), "L")


def swarm_v1():
    """Many small spiders heaped together, one a little bigger in the middle: brown bodies, gold eyes, bristling
    legs. Not the Spider Queen: no crown, no purple, no single large body. Walk: the legs ripple."""
    frames = []
    for alt in (0, 1):
        c = Canvas(18, 14)
        for cx, cy in ((3, 3), (14, 3), (9, 1), (4, 10), (13, 10)):
            spider_v1(c, cx, cy, False, alt)
        spider_v1(c, 9, 6, True, alt)
        frames.append(c.rows())
    key = {"S": "wood4", "L": "wood3", "e": "gold5", "M": "gold3"}
    p = P(7, "wood3", "wood1", [(8, 7), (3, 3), (13, 10)])
    cracks = [[(8, 6), (8, 7), (9, 8)], [(3, 3), (3, 4)], [(14, 3), (14, 4)], [(4, 10), (4, 11)], [(13, 10), (13, 11)],
              [(9, 1), (9, 2)]]
    return frames, key, p, cracks, False


def kalanoro():
    """Small shaggy forest imp, mossy-green fur, a wild head of hair and a long beard, gold eyes and bared fangs,
    thin arms, and feet turned the wrong way (heels forward, toes behind). Walk: it bobs."""
    a = ["..HH.HH.HH.HH.",
         ".HHHHHHHHHHHHH",
         "HHHHHHHHHHHHHH",
         "..HSSSSSSSSH..",
         "..HSeSSSSeSH..",
         "..HSSSSSSSSH..",
         "...SWnSSnWS...",
         "...HHHHHHHH...",
         ".HHHHHHHHHHHH.",
         ".HH.HHHHHH.HH.",
         ".HH.HHHHHH.HH.",
         ".pp.HHHHHH.pp.",
         "....HH..HH....",
         "....HH..HH....",
         "...KKK..KKK..."]
    b = ["." * 14] + a[:2] + a[3:]
    key = {"H": "emerald2", "S": "emerald3", "e": "gold5", "W": "parch3", "n": "ink", "p": "parch3", "K": "wood2"}
    p = P(9, "emerald2", "emerald1", [(5, 9), (8, 10)])
    cracks = [[(5, 8), (5, 9), (6, 10)], [(8, 8), (8, 9), (7, 10)], [(2, 8), (2, 9)], [(11, 8), (11, 9)]]
    return [a, b], key, p, cracks, False


def leshy():
    """Slavic forest warden: a stout bark-skinned man, crown and long beard of green leaf-hair, one big gold eye and
    one small, moss on the shoulders, twig fingers, root feet. Walk: a limp, the right foot lifts."""
    frames = []
    for alt in (False, True):
        c = Canvas(22, 25)
        c.rect(6, 2, 15, 4, "G")
        c.pts([(6, 1), (8, 1), (10, 0), (11, 1), (13, 1), (15, 1), (4, 3), (5, 4), (3, 5), (17, 3), (16, 4), (18, 5)], "G")
        c.pts([(5, 2), (4, 1), (3, 0), (2, 0)], "B", True)               # twig antlers
        c.pts([(10, 1), (11, 1)], "M")
        c.rect(7, 4, 14, 9, "F")
        c.rect(7, 5, 14, 5, "k")
        c.rect(8, 6, 9, 7, "e")
        c.pts([(13, 6)], "e")
        c.pts([(11, 7), (11, 8)], "k")
        c.rect(6, 10, 15, 20, "B")
        c.rect(5, 10, 7, 11, "M")
        c.rect(14, 10, 16, 11, "M")
        c.rect(2, 11, 4, 19, "B")
        c.rect(17, 11, 19, 19, "B")
        c.pts([(1, 20), (2, 21), (3, 20), (4, 21), (2, 20), (3, 21)], "B")
        c.pts([(16, 20), (17, 21), (18, 20), (19, 21), (17, 20), (18, 21)], "B")
        c.rect(8, 9, 13, 13, "G")
        c.rect(7, 10, 14, 12, "G")
        c.rect(9, 14, 12, 16, "G")
        c.rect(10, 17, 11, 18, "G")
        c.pts([(14, 15), (7, 17)], "k")
        c.rect(6, 21, 9, 23, "B")
        c.rect(5, 24, 10, 24, "B")
        c.pts([(4, 24)], "B")
        if alt:
            c.rect(12, 21, 15, 22, "B")
            c.rect(11, 23, 16, 23, "B")
            c.pts([(17, 23)], "B")
        else:
            c.rect(12, 21, 15, 23, "B")
            c.rect(11, 24, 16, 24, "B")
            c.pts([(17, 24)], "B")
        frames.append(c.rows())
    key = {"G": "green2", "M": "green3", "F": "wood4", "k": "wood1", "e": "gold5", "B": "wood3"}
    p = P(15, "wood3", "wood1", [(6, 14), (15, 16)])
    cracks = [[(6, 13), (6, 14), (7, 15), (7, 16)], [(15, 13), (15, 14), (14, 16), (14, 17)],
              [(10, 19), (11, 20)], [(10, 7), (10, 8)], [(3, 13), (3, 15), (3, 17)]]
    return frames, key, p, cracks, False


def sasabonsam():
    """Akan tree ambusher: a gaunt indigo figure hunched on a bough, long pale hair to the shoulders, a mouth of
    iron-grey fangs, gold eyes, and two very long legs dangling below with the feet hooked one to each side.
    Walk: the legs swing outward."""
    frames = []
    for alt in (False, True):
        c = Canvas(24, 25)
        c.rect(1, 13, 22, 14, "T")
        c.rect(7, 1, 16, 3, "H")
        c.pts([(6, 0), (8, 0), (11, 0), (13, 0), (15, 0), (17, 1), (5, 2), (5, 5), (5, 8)], "H")
        c.rect(6, 4, 7, 11, "H")
        c.rect(16, 4, 17, 11, "H")
        c.rect(8, 3, 15, 8, "S")
        c.pts([(9, 5), (10, 5), (13, 5), (14, 5)], "e")
        c.pts([(9, 4), (10, 4), (13, 4), (14, 4)], "k")
        c.rect(9, 6, 14, 7, "n")
        c.pts([(9, 6), (11, 6), (12, 6), (14, 6), (10, 7), (13, 7)], "I")
        c.rect(6, 9, 17, 10, "B")
        c.rect(8, 9, 15, 13, "B")
        c.rect(4, 10, 5, 13, "A")
        c.rect(18, 10, 19, 13, "A")
        c.pts([(3, 13), (4, 14), (3, 14), (20, 14), (19, 14), (20, 13)], "p")
        o = 1 if alt else 0
        for y in range(14, 23):
            sh = 0 if y < 17 else (o if y < 20 else 2 * o)
            c.rect(8 - sh, y, 9 - sh, y, "A")
            c.rect(14 + sh, y, 15 + sh, y, "A")
        sh = 2 * o
        c.rect(5 - sh, 23, 9 - sh, 23, "A")
        c.rect(14 + sh, 23, 18 + sh, 23, "A")
        c.pts([(4 - sh, 24), (5 - sh, 24), (18 + sh, 24), (19 + sh, 24)], "p")
        frames.append(c.rows())
    key = {"T": "wood2", "H": "steel4", "S": "night2", "e": "gold5", "k": "azure1", "n": "ink", "I": "steel5",
           "B": "azure1", "A": "azure2", "p": "parch3"}
    p = P(11, "azure1", "ink", [(10, 11), (15, 10)])
    cracks = [[(10, 10), (10, 11), (11, 12)], [(13, 10), (13, 11), (12, 12)], [(8, 16), (8, 17)], [(15, 16), (15, 17)],
              [(11, 3), (11, 4)], [(4, 11), (4, 12)]]
    return frames, key, p, cracks, False


def humbaba():
    """Humbaba, guardian of the Cedar Forest (boss, level 50): a giant with a lion's snarling face and a dragon's
    maw of fangs, a mane and beard of cedar-brown hair, a coiled mark on the brow, a bronze breastplate, and seven
    gold rays of terror above his head; he carries an uprooted cedar. Walk: a stomp."""
    frames = []
    rays = ((12, 0), (9, 1), (15, 1), (6, 2), (18, 2), (3, 2), (21, 2))      # seven rays: x, top row (bottom is 3)
    for alt in (False, True):
        c = Canvas(25, 27)
        for x, top in rays:
            c.rect(x, top, x, 3, "Z")
        c.rect(6, 4, 18, 6, "H")
        c.rect(6, 7, 7, 12, "H")
        c.rect(17, 7, 18, 12, "H")
        c.rect(8, 5, 16, 12, "S")
        c.rect(8, 6, 16, 6, "k")
        c.pts([(9, 7), (15, 7)], "e")
        c.rect(11, 5, 13, 5, "c")
        c.pts([(12, 8), (12, 9)], "s")
        c.rect(9, 10, 15, 12, "n")
        c.pts([(9, 10), (11, 10), (13, 10), (15, 10), (10, 12), (12, 12), (14, 12)], "W")
        c.rect(3, 14, 21, 17, "S")
        c.rect(6, 16, 18, 22, "S")
        c.rect(7, 17, 17, 21, "A")
        c.rect(7, 21, 17, 21, "k")
        c.rect(1, 15, 4, 22, "S")
        c.rect(0, 22, 4, 24, "S")
        c.rect(20, 15, 22, 21, "S")
        sway = -1 if alt else 0
        c.rect(21 + sway, 3, 24 + sway, 8, "G")
        c.rect(23, 9, 24, 26, "T")
        c.rect(21, 21, 24, 23, "S")
        c.rect(7, 13, 17, 17, "H")
        c.rect(9, 18, 15, 18, "H")
        c.rect(7, 23, 11, 25 - (1 if alt else 0), "S")
        c.rect(13, 23, 17, 25, "S")
        c.rect(6, 26 - (1 if alt else 0), 11, 26 - (1 if alt else 0), "K")
        c.rect(13, 26, 18, 26, "K")
        frames.append(c.rows())
    key = {"Z": "gold4", "H": "wood2", "S": "sea2", "k": "sea1", "e": "gold5", "c": "sea1", "s": "sea1", "n": "ink",
           "W": "parch3", "A": "gold3", "G": "green2", "T": "wood3", "K": "wood1"}
    p = P(17, "sea2", "sea1", [(9, 17), (15, 19)], lambda x, y: x >= 22)
    cracks = [[(9, 8), (9, 9)], [(15, 8), (15, 9)], [(8, 18), (9, 19), (9, 20)], [(16, 18), (15, 19), (15, 20)],
              [(2, 16), (2, 18), (2, 20)], [(21, 17), (21, 19)], [(9, 24), (9, 23)], [(15, 24), (15, 23)]]
    return frames, key, p, cracks, False


CREATURES = {"amomongo": amomongo, "nogitsune": nogitsune, "swarm-of-spiders": swarm, "kalanoro": kalanoro,
             "leshy": leshy, "sasabonsam": sasabonsam, "humbaba": humbaba}
FLIERS = set()
RIDERS = {}
