"""Monster batch 60 (2026-10-29): Gloamfen Mire, drawn as fill grids for 44-bestiary's kit.

Jiangshi, Adze (swarm flier), Will-o-Wisp (floating light, flier), Kikimora, Draugr (elite), Empousa (elite),
Dullahan (mini-boss, a rider). Each function returns (fills, key, pose, cracks, flip). fills is a list: two frames
for the fliers (A is the idle), one frame for the rest. Pose in image coordinates (fill + 1 column, + 2 rows),
cracks in fill coordinates. Every crack cell must be on the body in every frame.
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "44-bestiary" / "src"))
from creatures import pose  # noqa: E402  (44-bestiary's)
from kit import Canvas  # noqa: E402


def rows(w, spec):
    """A fill grid from lines of (x0, text) segments; '.' is clear."""
    out = []
    for segs in spec:
        r = ["."] * w
        if isinstance(segs, tuple):
            segs = [segs]
        for x0, t in segs:
            for i, ch in enumerate(t):
                r[x0 + i] = ch
        out.append("".join(r))
    return out


def jiangshi():
    """Chinese hopping corpse: a tall black official's hat, a paper talisman down the face, a pale mint corpse
    face with fangs, a dark jade robe with a gold rank badge, and both arms held straight out, claws open."""
    spec = [
        (10, "GG"),
        (7, "HHHHHHHH"), (7, "HHHHHHHH"), (7, "HHHTTHHH"),
        (6, "hhhhTthhhh"),
        (8, "FFTtFF"), (8, "FeTTeF"), (8, "FFtTFF"),
        (8, "FnWWnF"), (9, "FFFF"),
        [(0, "FF"), (2, "RRRRRRRRRRRRRRRRRR"), (20, "FF")],
        [(0, "FF"), (2, "RRRRR"), (7, "rrGGGGrr"), (15, "RRRRR"), (20, "FF")],
        [(0, "FF"), (2, "RRRRR"), (7, "rrGGGGrr"), (15, "RRRRR"), (20, "FF")],
        (7, "RRRRRRRR"),
        (7, "SSSSSSSS"),
        (7, "RRrRRrRR"),
        (6, "RRRRRRRRRR"), (6, "RRRRrrRRRR"), (6, "RRRRRRRRRR"),
        (6, "RRRRRRRRRR"),
        [(7, "LLLL"), (12, "LLLL")], [(7, "LLLL"), (12, "LLLL")],
    ]
    fill = rows(22, spec)
    key = {"G": "gold3", "H": "night1", "h": "night2", "T": "parch3", "t": "gold2", "F": "emerald4", "e": "gold5",
           "n": "ink", "W": "parch3", "R": "emerald1", "r": "emerald2", "S": "gold2", "L": "night1"}
    p = pose(13, "emerald1", "ink", [(9, 17), (13, 19), (11, 21)], lambda x, y: x >= 21 and 12 <= y <= 14)
    cracks = [[(8, 13), (8, 14), (9, 15)], [(13, 15), (13, 16), (12, 17)], [(9, 2), (9, 3)], [(4, 10), (5, 11)],
              [(17, 11), (16, 12)]]
    return [fill], key, p, cracks, False


def _fly(c, cx, top, big, up):
    """One firefly: a dark head with gold eyes, a thorax, a glowing abdomen and two wings (up or down)."""
    s = 2 if big else 1
    c.rect(cx - 1, top, cx + 1, top + s, "k")
    c.pts([(cx - 1, top + s), (cx + 1, top + s)] if big else [(cx, top)], "e")
    c.pts([(cx - 2, top - 1), (cx + 2, top - 1)], "A")
    if big:
        c.pts([(cx - 3, top - 2), (cx + 3, top - 2)], "A")
    c.rect(cx - s, top + s + 1, cx + s, top + 2 * s + 1, "k")
    ab0 = top + 2 * s + 2
    c.rect(cx - s, ab0, cx + s, ab0 + 2 * s + 1, "G")
    c.rect(cx - (s - 1), ab0 + 1, cx + (s - 1), ab0 + 2 * s, "g")
    wy = top + s + 1
    for side in (-1, 1):
        for dx in range(1, 3 * s + 2):
            x = cx + side * (s + dx)
            if up:
                lo, hi = wy - (dx * 4) // 5 - 1, wy - dx // 4
            else:
                lo, hi = wy + dx // 4 + 1, wy + (dx * 3) // 5 + 1
            for y in range(lo, hi + 1):
                if 0 <= x < c.w and 0 <= y < c.h:
                    c.px(x, y, "W")


def adze():
    """Ewe firefly swarm: one big firefly with two smaller ones and drifting sparks, glowing abdomens, pale wings.
    Frames: wings raised, wings swept down. (The firefly only; never the possessed human.)"""
    frames = []
    for up in (True, False):
        c = Canvas(25, 24)
        _fly(c, 12, 6, True, up)
        _fly(c, 4, 11, False, up)
        _fly(c, 20, 9, False, not up)
        c.pts([(1, 6), (22, 15), (8, 20), (18, 3), (3, 19), (23, 20)], "g")
        frames.append(c.rows())
    key = {"k": "night1", "e": "gold5", "A": "night2", "G": "fire2", "g": "fire3", "W": "steel4"}
    p = pose(12, "night1", "ink", [(13, 10), (13, 11)], lambda x, y: x >= 22 and y <= 14)
    cracks = [[(12, 9), (12, 10)], [(11, 12), (11, 13)], [(13, 12), (13, 14)]]
    return frames, key, p, cracks, False


def will_o_wisp():
    """SRD will-o'-wisp (Tiny/Small undead): a floating teal flame with a face, a curling tail and two orbiting
    sparks. Frames: the tip leans left, the tip leans right."""
    base = rows(15, [
        (6, "t"), (6, "tt"), (5, "ttTt"), (5, "tTTTt"), (4, "ttTTTtt"), (3, "ttTTcTTtt"), (3, "tTTTcTTTt"),
        (2, "ttTeTcTeTtt"), (2, "tTTeTTTeTTt"), (2, "tTTTcccTTTt"), (2, "ttTTnnnTTtt"), (3, "ttTTTTTtt"),
        (4, "ttTTTtt"), (5, "ttTtt"), (6, "ttt"), (7, "tt"), (6, "tt"), (6, "t"),
    ])
    frames = []
    for lean in (False, True):
        out = [["."] * 15 for _ in base]
        for y, r in enumerate(base):
            d = 0
            if y < 5:
                d = [2, 1, 1, 0, 0][y] if lean else -[2, 1, 1, 0, 0][y]
            elif y >= 14:
                d = -2 if lean else 2
            for x, ch in enumerate(r):
                if ch != "." and 0 <= x + d < 15:
                    out[y][x + d] = ch
        sp = [(1, 4), (1, 5), (13, 12), (13, 13)] if not lean else [(1, 11), (1, 12), (13, 3), (13, 4)]
        for x, y in sp:
            out[y][x] = "T"
        frames.append(["".join(r) for r in out])
    key = {"t": "teal2", "T": "teal3", "c": "teal4", "e": "gold5", "n": "ink"}
    p = pose(9, "teal3", "teal2", [(6, 12), (9, 14)], lambda x, y: x <= 3 and y >= 14)
    cracks = [[(6, 6), (6, 7)], [(9, 10), (9, 11)], [(5, 11), (6, 12)]]
    return frames, key, p, cracks, False


def kikimora_v1():
    """Slavic marsh hag: a hunched little crone with wild moss hair, a long sharp nose and chin, thin arms, bare
    feet and a spindle with a ball of wool."""
    spec = [
        [(3, "M"), (7, "MM"), (11, "M"), (14, "M")],
        (2, "MmMMMMMMMMMMmM"),
        (1, "MMmM"), (1, "MmM"), (1, "MmM"),
        (1, "mMM"), (1, "MmMm"), (1, "MmMmMm"), (2, "MmMmM"), (2, "mMmM"),
        (4, "DDDDDDDDDDDD"), (4, "DDDdDDDDdDDD"), (5, "DDDDDDDD"), (5, "DDDDDDDD"), (4, "DDdDDDDDDD"),
        (3, "DDDDDDDDDDDD"), (3, "DDdDDDDDDdDD"), (3, "DDDDDDDDDDDD"),
        [(4, "SSS"), (11, "SSS")], [(3, "SSSS"), (11, "SSSS")],
    ]
    g = rows(18, spec)
    c = Canvas(18, 20)
    c.g = [list(r) for r in g]
    c.rect(1, 2, 16, 2, "M")
    c.rect(5, 2, 12, 2, "S")
    c.rect(4, 3, 13, 3, "S")
    c.pts([(6, 3), (11, 3)], "e")
    c.rect(4, 4, 13, 4, "S")
    c.rect(5, 5, 12, 5, "S")
    c.rect(6, 6, 11, 6, "S")
    c.rect(7, 7, 10, 7, "S")
    c.rect(8, 4, 9, 7, "N")
    c.pts([(8, 8), (9, 8)], "N")
    c.pts([(9, 9)], "N")
    c.pts([(7, 8), (10, 8)], "S")
    c.pts([(8, 7)], "n")
    c.rect(2, 10, 3, 14, "D")
    c.rect(2, 15, 3, 16, "S")
    c.rect(14, 10, 15, 12, "D")
    c.pts([(15, 13), (16, 13)], "S")
    c.rect(17, 4, 17, 19, "P")
    c.pts([(16, 6), (17, 6), (16, 7), (17, 7), (16, 8), (17, 8)], "Y")
    c.pts([(16, 13), (17, 13)], "S")
    key = {"M": "green2", "m": "green1", "S": "steel3", "N": "steel4", "n": "ink", "e": "gold5", "D": "wood2",
           "d": "wood1", "P": "wood4", "Y": "parch3"}
    p = pose(10, "wood2", "wood1", [(9, 15), (6, 17), (9, 19)], lambda x, y: x >= 18)
    cracks = [[(5, 1), (6, 2), (7, 3)], [(11, 4), (11, 5)], [(7, 11), (7, 12), (8, 13)],
              [(10, 15), (10, 16), (9, 17)], [(3, 11), (3, 12)]]
    return [c.rows()], key, p, cracks, False


def _mir(c, x0, y0, x1, y1, ch, m):
    c.rect(x0, y0, x1, y1, ch)
    c.rect(m - x1, y0, m - x0, y1, ch)


def draugr():
    """Norse grave-brute: a swollen death-blue corpse in a rusted horned helm and mail pauldrons, a long gray
    beard, a bloated belly over a belt, huge fists, and a rusted axe."""
    c = Canvas(28, 28)
    m = 23
    c.rect(10, 0, 13, 0, "g")
    c.rect(8, 1, 15, 2, "g")
    c.rect(8, 3, 15, 3, "q")
    c.pts([(7, 2), (6, 1), (6, 0)], "h")
    c.pts([(16, 2), (17, 1), (17, 0)], "h")
    c.rect(8, 4, 15, 6, "g")
    c.rect(9, 4, 14, 6, "F")
    c.pts([(10, 4), (13, 4)], "e")
    c.rect(11, 4, 12, 6, "g")
    c.rect(8, 7, 15, 8, "B")
    c.pts([(11, 7), (12, 7)], "n")
    c.rect(9, 9, 14, 10, "B")
    c.rect(10, 11, 13, 12, "B")
    _mir(c, 0, 7, 6, 10, "P", m)
    c.rect(5, 9, 18, 12, "N")
    c.rect(4, 13, 19, 15, "N")
    c.rect(3, 16, 20, 20, "N")
    _mir(c, 1, 11, 4, 19, "N", m)
    _mir(c, 4, 11, 4, 15, "d", m)
    c.rect(9, 9, 14, 10, "B")
    c.rect(10, 11, 13, 12, "B")
    c.rect(3, 19, 20, 19, "T")
    c.rect(11, 19, 12, 19, "Y")
    _mir(c, 0, 20, 4, 22, "N", m)
    _mir(c, 5, 21, 9, 25, "N", m)
    _mir(c, 4, 26, 10, 27, "T", m)
    c.rect(24, 3, 24, 24, "w")
    c.rect(25, 3, 27, 9, "a")
    c.rect(27, 4, 27, 8, "A")
    c.px(24, 2, "a")
    key = {"g": "gold1", "q": "gold2", "h": "parch3", "F": "steel4", "e": "gold5", "B": "steel2", "n": "ink",
           "P": "steel1", "N": "night3", "d": "night2", "T": "wood1", "Y": "gold3", "w": "wood3", "a": "steel2",
           "A": "steel4"}
    p = pose(11, "night3", "night2", [(8, 16), (16, 19), (11, 20)], lambda x, y: x >= 26)
    cracks = [[(8, 9), (9, 10), (9, 11), (10, 12)], [(14, 16), (14, 17), (15, 18), (15, 19)],
              [(6, 17), (6, 18), (5, 19)], [(9, 1), (9, 2)], [(7, 22), (7, 23)], [(21, 12), (21, 13)]]
    return [c.rows()], key, p, cracks, False


def empousa():
    """Greek shapeshifting spirit: hair of flame, a pale face with fangs, a tattered dark dress, arms out with
    claws, and mismatched legs: a thick bronze leg with a flat plate foot, a thin gray donkey leg with a hoof."""
    c = Canvas(22, 27)
    for x, h in ((4, 3), (6, 5), (8, 4), (10, 6), (11, 6), (13, 4), (15, 5), (17, 3)):
        c.rect(x, 6 - h, x, 6, "O")
    for x, h in ((6, 3), (10, 4), (11, 4), (15, 3)):
        c.rect(x, 6 - h + 1, x, 6, "o")
    c.rect(5, 5, 16, 8, "O")
    c.rect(9, 5, 12, 6, "o")
    c.rect(6, 9, 7, 13, "O")
    c.rect(14, 9, 15, 13, "O")
    c.rect(8, 7, 13, 11, "F")
    c.pts([(9, 8), (12, 8)], "e")
    c.pts([(10, 10), (11, 10)], "n")
    c.pts([(9, 10), (12, 10)], "W")
    c.rect(9, 12, 12, 12, "F")
    c.rect(7, 13, 14, 14, "D")
    for pts in ([(6, 14), (5, 14), (5, 15), (4, 15), (4, 16), (3, 16), (3, 17), (2, 17)], [(2, 18), (1, 18), (1, 19)]):
        c.pts(pts, "F", sym=True)
    c.rect(7, 15, 14, 18, "D")
    c.rect(6, 19, 15, 20, "D")
    c.rect(5, 21, 16, 21, "D")
    c.pts([(5, 22), (7, 22), (9, 22), (12, 22), (14, 22), (16, 22)], "D")
    c.rect(7, 22, 9, 25, "Q")
    c.rect(7, 23, 9, 23, "q")
    c.rect(4, 26, 10, 26, "Q")
    c.rect(13, 22, 14, 24, "K")
    c.rect(14, 25, 15, 25, "K")
    c.rect(13, 26, 15, 26, "H")
    key = {"O": "fire1", "o": "fire2", "F": "steel4", "e": "gold5", "n": "ink", "W": "steel5", "D": "night2",
           "Q": "gold3", "q": "gold2", "K": "ash2", "H": "wood1"}
    p = pose(12, "night2", "night1", [(9, 17), (12, 19), (10, 20)], lambda x, y: x <= 6 and y >= 28)
    cracks = [[(9, 16), (10, 17), (10, 18)], [(12, 15), (12, 16), (11, 19)], [(10, 7), (10, 8)], [(8, 23), (8, 24)],
              [(13, 23)]]
    return [c.rows()], key, p, cracks, False


def dullahan_v1():
    """Irish headless rider, a mini-boss: a hollow-collared cloaked rider seated behind the long black face of a
    huge horse (ghostly mane, gold eyes), his own pale grinning head held out on one arm, a spine for a whip."""
    c = Canvas(28, 32)
    m = 27
    c.rect(4, 13, 23, 26, "H")                                           # the horse's barrel
    _mir(c, 6, 27, 9, 30, "H", m)                                        # front legs
    _mir(c, 5, 31, 10, 31, "o", m)                                       # hooves
    c.rect(11, 1, 16, 3, "C")                                            # the rider: a high hollow collar
    c.rect(12, 1, 15, 2, "n")
    c.pts([(13, 1), (14, 1)], "e")
    c.rect(8, 4, 19, 5, "C")                                             # shoulders
    c.rect(9, 6, 18, 9, "C")
    c.rect(12, 5, 15, 9, "J")
    c.rect(5, 10, 22, 12, "C")                                           # cloak over the horse's back
    c.pts([(5, 13), (22, 13), (4, 14)], "C")
    c.pts([(8, 5), (7, 5), (7, 4), (6, 4), (5, 4), (5, 3), (4, 3), (6, 5), (7, 6), (8, 6)], "C")    # whip arm
    c.rect(2, 2, 3, 3, "F")
    c.rect(1, 4, 1, 15, "Z")
    c.pts([(2, 1), (2, 0), (3, 0), (2, 15), (2, 16)], "Z")
    c.rect(19, 5, 22, 8, "C")                                            # the arm that holds the head
    c.rect(20, 8, 26, 15, "F")                                           # the head
    c.rect(21, 7, 25, 7, "F")
    c.rect(21, 16, 25, 16, "F")
    c.pts([(21, 10), (22, 10), (24, 10), (25, 10)], "e")
    c.rect(21, 13, 25, 13, "n")
    c.pts([(22, 13), (24, 13)], "W")
    _mir(c, 8, 12, 10, 22, "M", m)                                       # the ghostly mane
    c.rect(11, 12, 16, 23, "H")                                          # the long face
    c.pts([(11, 10), (11, 11), (10, 9), (16, 10), (16, 11), (17, 9)], "H")   # ears
    c.pts([(12, 15), (15, 15)], "e")
    c.rect(12, 20, 15, 23, "u")
    c.pts([(12, 22), (15, 22)], "n")
    key = {"H": "night1", "o": "steel1", "C": "steel1", "J": "night2", "n": "ink", "e": "gold5", "F": "parch3",
           "Z": "steel4", "W": "steel5", "M": "steel2", "u": "night2"}
    p = pose(12, "night1", "ink", [(8, 20), (19, 22), (13, 26)], lambda x, y: x <= 3 and y <= 17)
    cracks = [[(11, 6), (11, 7), (12, 8)], [(16, 7), (16, 8), (15, 9)], [(7, 19), (7, 20), (8, 21)],
              [(20, 20), (19, 21), (19, 22)], [(13, 13), (13, 14)], [(23, 11), (23, 12)]]
    return [c.rows()], key, p, cracks, False


def kikimora():
    """v2: a small, thin, wild house spirit: a narrow pale face with a long hooked nose drawn as one ink line, a
    sharp chin, gold eyes, long dark-green hair spilling past the shoulders, a thin body in a ragged brown shift,
    long bony fingers and a distaff with a tuft of wool."""
    c = Canvas(14, 18)
    c.pts([(3, 0), (6, 0), (7, 0), (10, 0)], "M")
    c.rect(2, 1, 11, 1, "M")
    c.rect(1, 2, 12, 7, "M")
    c.rect(1, 8, 3, 12, "M")
    c.rect(10, 8, 12, 12, "M")
    c.pts([(1, 13), (2, 14), (12, 13), (11, 14), (3, 13), (10, 13)], "m")
    c.pts([(2, 4), (3, 6), (11, 5), (10, 7), (2, 9), (12, 10), (1, 11)], "m")
    c.rect(5, 2, 8, 6, "S")
    c.pts([(5, 3), (8, 3)], "e")
    c.pts([(6, 4), (6, 5), (6, 6), (7, 6)], "n")
    c.pts([(6, 7), (7, 7), (7, 8)], "S")
    c.rect(4, 9, 9, 10, "D")
    c.rect(4, 11, 9, 13, "D")
    c.rect(3, 14, 10, 15, "D")
    c.pts([(3, 16), (5, 16), (8, 16), (10, 16), (7, 15), (4, 15)], "D")
    c.pts([(3, 9), (3, 10), (3, 11), (3, 12), (3, 13)], "D")
    c.pts([(2, 14), (3, 14), (2, 15), (1, 16)], "S")
    c.pts([(10, 9), (10, 10), (10, 11)], "D")
    c.pts([(11, 12), (12, 12), (11, 11)], "S")
    c.rect(12, 3, 12, 17, "P")
    c.rect(11, 1, 13, 2, "Y")
    c.pts([(12, 12)], "S")
    c.pts([(5, 17), (4, 17), (8, 17), (9, 17)], "S")
    key = {"M": "green1", "m": "green2", "S": "steel4", "n": "ink", "e": "gold5", "D": "wood2", "P": "wood4",
           "Y": "parch3"}
    p = pose(8, "wood2", "wood1", [(6, 12), (8, 14)], lambda x, y: x >= 13)
    cracks = [[(3, 2), (3, 3)], [(7, 3), (7, 4)], [(6, 11), (6, 12), (7, 13)], [(8, 14), (8, 15)]]
    return [c.rows()], key, p, cracks, False


def dullahan():
    """v2: the rider's shoulders end in a ragged collar around a dark stump (no head); his own small round
    skull-white head, with gold eyes, a wide toothy grin and strands of dark hair, is held out on one arm; the
    horse has a long narrow face, tall ears and nostrils at the bottom."""
    c = Canvas(28, 32)
    m = 27
    c.rect(4, 13, 23, 26, "H")
    _mir(c, 6, 27, 9, 30, "H", m)
    _mir(c, 5, 31, 10, 31, "o", m)
    c.rect(10, 2, 17, 4, "C")
    c.pts([(10, 1), (12, 1), (15, 1), (17, 1), (11, 0), (16, 0)], "C")
    c.rect(12, 1, 15, 3, "n")
    c.rect(8, 4, 19, 5, "C")
    c.rect(9, 6, 18, 9, "C")
    c.rect(12, 5, 15, 9, "J")
    c.rect(5, 10, 22, 12, "C")
    c.pts([(5, 13), (22, 13), (4, 14)], "C")
    c.pts([(8, 5), (7, 5), (7, 4), (6, 4), (5, 4), (5, 3), (4, 3), (6, 5), (7, 6), (8, 6)], "C")
    c.rect(2, 2, 3, 3, "F")
    c.rect(1, 4, 1, 15, "Z")
    c.pts([(2, 1), (2, 0), (3, 0), (2, 15), (2, 16)], "Z")
    c.rect(19, 5, 22, 8, "C")
    c.rect(21, 9, 24, 9, "F")
    c.rect(20, 10, 25, 13, "F")
    c.rect(21, 14, 24, 14, "F")
    c.pts([(21, 8), (23, 8), (24, 7), (22, 7)], "k")
    c.pts([(21, 11), (24, 11)], "e")
    c.rect(21, 13, 24, 13, "n")
    c.pts([(21, 12), (23, 12)], "W")
    c.pts([(22, 13), (24, 13)], "W")
    _mir(c, 8, 12, 10, 22, "M", m)
    c.rect(11, 12, 16, 16, "H")
    c.rect(12, 17, 15, 19, "H")
    c.rect(13, 20, 14, 24, "u")
    c.pts([(11, 11), (11, 10), (11, 9), (16, 11), (16, 10), (16, 9)], "H")
    c.pts([(12, 14), (15, 14)], "e")
    c.pts([(13, 23), (14, 23)], "n")
    key = {"H": "night1", "o": "steel1", "C": "steel1", "J": "night2", "n": "ink", "e": "gold5", "F": "steel4",
           "Z": "steel4", "W": "steel5", "M": "steel2", "u": "night2", "k": "night2"}
    p = pose(12, "night1", "ink", [(8, 20), (19, 22), (13, 26)], lambda x, y: x <= 3 and y <= 17)
    cracks = [[(11, 6), (11, 7), (12, 8)], [(16, 7), (16, 8), (15, 9)], [(7, 19), (7, 20), (8, 21)],
              [(20, 20), (19, 21), (19, 22)], [(13, 13), (13, 14)], [(22, 10), (22, 11)]]
    return [c.rows()], key, p, cracks, False


CREATURES = {"jiangshi": jiangshi, "adze": adze, "will-o-wisp": will_o_wisp, "kikimora": kikimora,
             "draugr": draugr, "empousa": empousa, "dullahan": dullahan}
FLIERS = {"adze", "will-o-wisp"}
