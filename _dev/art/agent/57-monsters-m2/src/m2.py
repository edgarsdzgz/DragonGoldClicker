"""Monster batch M2 (2026-10-29): Mistral Peaks' elites and boss, drawn as fill grids for 44-bestiary's kit.

Impundulu (flier elite), Omukade (elite) and the Tempest Lord of the Peaks (boss, level 30). Each function returns
(fills, key, pose, cracks, flip); fills is [frame A, frame B] (A is the idle). Pose in image coordinates (fill + 1
column, + 2 rows), cracks in fill coordinates. Every crack cell must be on the body in both frames.
"""
import math
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "44-bestiary" / "src"))
from creatures import pose  # noqa: E402  (44-bestiary's)
from kit import Canvas  # noqa: E402


def wing(c, top, bottom, edge, fill):
    """A wing on each side: for each column x, the edge at top[x] and the membrane down to bottom[x]."""
    for x, t in top.items():
        c.px(x, t, edge, sym=True)
        for y in range(t + 1, bottom[x] + 1):
            c.px(x, y, fill, sym=True)


def impundulu():
    """Zulu lightning bird, v2: a storm bird of prey, body tilted, a dagger beak to one side, a long backward
    hammer crest, long angular wings raised in a V with feather fingers (white wing bars and a white breast edge),
    a forked tail, and two long zigzag bolts off the wingtips. Frames: wings raised in a V, wings swept down."""
    dx = 2                                                               # margin for the bolts

    def P(c, cells, ch, sym=False):
        c.pts([(x + dx, y) for x, y in cells], ch, sym=sym)

    frames = []
    for up in (True, False):
        c = Canvas(27, 24)
        if up:
            P(c, [(10, 12), (9, 11), (8, 10), (7, 9), (6, 8), (5, 7), (4, 5), (3, 4), (2, 3), (1, 2), (0, 1)], "W", True)
            for x0, y0, y1 in ((1, 3, 8), (3, 5, 11), (5, 8, 14), (7, 10, 16), (9, 12, 16)):    # feather fingers
                P(c, [(x0, y) for y in range(y0, y1 + 1)], "F", True)
            c.pts([(1, 3), (0, 4), (1, 5), (0, 6), (1, 7), (0, 8), (1, 9), (0, 10), (1, 11), (0, 12), (1, 13),
                   (0, 14), (1, 15)], "Z", sym=True)                     # a long zigzag bolt past the body
        else:
            P(c, [(10, 12), (9, 13), (8, 14), (7, 14), (6, 15), (5, 16), (4, 16), (3, 17), (2, 18), (1, 18), (0, 19)],
              "W", True)
            for x0, y0 in ((1, 19), (3, 17), (5, 16), (7, 14), (9, 13)):
                P(c, [(x0, y) for y in range(y0 + 1, y0 + 5)], "F", True)
            c.pts([(0, 20), (1, 21), (0, 22), (1, 23), (0, 23)], "Z", sym=True)
        P(c, [(10, 6), (9, 6), (8, 5), (7, 5), (6, 4)], "B")             # the long backward crest, a hammer head
        P(c, [(11, 5), (12, 5)], "B")
        c.rect(13, 6, 16, 9, "B")                                        # head
        c.pts([(14, 7), (16, 7)], "e")
        c.pts([(17, 8), (18, 8), (19, 9), (20, 9), (21, 10), (21, 11)], "Y")     # a long hooked dagger beak
        c.rect(11, 10, 16, 12, "B")                                      # the tilted body
        c.rect(12, 13, 17, 15, "B")
        c.rect(13, 16, 18, 17, "B")
        c.pts([(12, 10), (12, 11), (12, 12), (13, 13), (13, 14), (14, 15), (14, 16)], "W")   # white breast edge
        c.pts([(14, 18), (14, 19), (13, 20), (13, 21), (13, 22), (18, 18), (19, 19), (20, 20), (20, 21), (20, 22)],
              "B")                                                       # a long forked tail
        frames.append(c.rows())
    key = {"w": "night3", "F": "night2", "B": "night1", "e": "gold5", "Y": "gold3", "W": "steel5", "Z": "gold6"}
    p = pose(11, "night1", "ink", [(14, 12), (15, 15)], lambda x, y: x <= 4)
    cracks = [[(15, 6), (15, 7), (15, 8), (14, 9)], [(13, 10), (13, 11), (14, 12), (14, 13)],
              [(15, 10), (15, 11), (16, 12), (16, 14)], [(14, 16), (15, 17)]]
    return frames, key, p, cracks, False


def omukade():
    """Japanese giant mountain centipede, v2: a small flat head with hooked forcipules and long antennae over a
    narrow S-curved column of alternating light and dark plates, each cut off by an ink line and fringed with a
    pair of thin legs, rising from a coil. Walk: the legs ripple. Dark bronze shell."""
    def off(y):
        return round(2 * math.sin(y / 3.2))

    frames = []
    for alt in (False, True):
        c = Canvas(17, 25)
        c.pts([(4, 1), (3, 0), (2, 0), (1, 1), (0, 2), (0, 3)], "A", sym=True)             # long antennae
        c.rect(5, 1, 11, 3, "C")                                         # a small flat head, square corners
        c.pts([(6, 2), (10, 2)], "e")
        c.pts([(5, 4), (4, 5), (4, 6), (5, 7), (6, 7)], "M", sym=True)   # forcipules, hooked inward
        seg = 0
        for y0 in range(5, 21, 3):                                       # six plates, each cut off by an ink line
            plate = "C" if seg % 2 == 0 else "H"
            for y in (y0, y0 + 1):
                o = off(y)
                c.rect(6 + o, y, 10 + o, y, plate)
                for side, x in ((-1, 6 + o), (1, 10 + o)):               # a pair of thin legs from every plate
                    tip = y + (1 if (seg + y + (1 if alt else 0)) % 2 == 0 else -1)
                    c.pts([(x + side, y), (x + 2 * side, y)], "L")
                    c.px(x + 3 * side, tip, "T")
            c.rect(6 + off(y0 + 2), y0 + 2, 10 + off(y0 + 2), y0 + 2, "n")
            seg += 1
        for y, x0, x1 in ((21, 4, 12), (22, 3, 13), (23, 3, 5), (24, 4, 12)):    # the coil at the base
            c.rect(x0, y, x1, y, "C" if y % 2 else "H")
        c.rect(11, 23, 13, 23, "H")
        frames.append(c.rows())
    key = {"A": "gold2", "C": "gold1", "H": "gold2", "n": "ink", "e": "gold5", "M": "gold3", "L": "gold2",
           "T": "parch3"}
    p = pose(14, "gold1", "wood2", [(8, 14), (8, 20)], lambda x, y: x >= 13 and y <= 10)
    cracks = [[(8 + off(y), y) for y in range(5, 9)], [(8 + off(y), y) for y in range(9, 14)],
              [(8 + off(y), y) for y in range(14, 19)], [(8, 1), (8, 2), (8, 3)]]
    return frames, key, p, cracks, False


def tempest_lord():
    """The first of the Storm-Callers: a tall hooded priest in wind-whipped robes, arms raised, a crown of
    lightning and a staff; below the waist the robe dissolves into a churning storm funnel."""
    frames = []
    for alt in (False, True):
        c = Canvas(24, 27)
        c.rect(2, 3, 2, 25, "P")                                         # the staff
        c.pts([(1, 1), (2, 0), (3, 1), (2, 2)], "O")
        for cx, h in ((7, 1), (9, 2), (11, 3), (12, 3), (14, 2), (16, 1)):   # the crown: tall lightning spikes
            c.rect(cx, 3 - h, cx, 2, "Z")
        c.rect(9, 3, 14, 9, "H")                                         # the hood
        c.rect(10, 5, 13, 8, "n")
        c.pts([(10, 6), (13, 6)], "e")
        c.rect(6, 9, 17, 10, "R")                                        # broad shoulders
        c.rect(8, 11, 15, 17, "R")                                       # torso and robe
        c.rect(11, 9, 12, 17, "r")
        c.rect(8, 13, 15, 13, "O")                                       # a sash
        for sx in (0, 1):                                                # both arms raised, wide sleeves
            def x(v, sx=sx):
                return v if sx == 0 else 23 - v
            c.pts([(x(8), 10), (x(7), 9), (x(6), 8), (x(5), 7), (x(5), 6), (x(4), 6), (x(4), 5), (x(7), 10),
                   (x(6), 9), (x(5), 8), (x(6), 7)], "R")
            c.pts([(x(4), 4), (x(5), 4)], "h")                           # hands
        c.pts([(3, 4), (3, 5), (3, 3)], "h")                             # the hand on the staff
        c.pts([(21, 3), (20, 2), (21, 1), (20, 0)], "Z")                 # a bolt off the free hand
        if alt:                                                          # the robes whip
            c.pts([(16, 14), (17, 15), (18, 15), (19, 16), (17, 17), (18, 17), (16, 16)], "R")
            c.pts([(7, 16), (6, 17), (5, 17)], "R")
        else:
            c.pts([(16, 13), (17, 14), (18, 14), (19, 13), (17, 16), (18, 16), (16, 15)], "R")
            c.pts([(7, 15), (6, 16), (5, 15)], "R")
        for y in range(17, 27):                                          # the storm funnel, ragged and wide
            w = 20 - (y - 17) * 16 // 9
            jit = (y * 5 + (2 if alt else 0)) % 3 - 1
            x0 = 12 - w // 2 + jit
            for xx in range(x0, x0 + w):
                band = (xx + y * 2 + (2 if alt else 0)) % 6
                c.px(xx, y, "c" if band == 0 else ("d" if band < 3 else "C"))
        c.pts([(8, 20), (15, 21), (11, 24)], "Z")                        # lightning flashing in the cloud
        c.pts([(4, 18), (19, 19), (3, 17), (20, 17)], "c")                # churning wisps
        frames.append(c.rows())
    key = {"P": "wood3", "O": "gold4", "Z": "gold6", "H": "night1", "n": "ink", "e": "gold5", "R": "night2",
           "r": "night1", "h": "night4", "C": "steel1", "c": "steel3", "d": "night2"}
    p = pose(18, "night2", "night1", [(11, 12), (14, 15)], lambda x, y: x <= 4 and y <= 14)
    cracks = [[(11, 3), (11, 4), (12, 5), (12, 6)], [(9, 10), (10, 11), (10, 12), (9, 14)],
              [(14, 10), (13, 11), (14, 12), (14, 14)], [(7, 9), (6, 8), (5, 7), (5, 6)],
              [(10, 19), (11, 20), (11, 21), (12, 22)], [(13, 19), (12, 20), (13, 21)]]
    return frames, key, p, cracks, False


CREATURES = {"impundulu": impundulu, "omukade": omukade, "tempest-lord": tempest_lord}
FLIERS = {"impundulu"}
RIDERS = {}
