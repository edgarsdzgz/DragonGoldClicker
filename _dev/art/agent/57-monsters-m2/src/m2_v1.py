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
    """Zulu lightning bird: black wings, a white breast, a hammer-shaped crest, pale yellow lightning off the
    wingtips and talons. Frames: wings up, wings down."""
    frames = []
    for up in (True, False):
        c = Canvas(23, 22)
        if up:
            wing(c, {i: i for i in range(9)}, {0: 3, 1: 6, 2: 7, 3: 8, 4: 9, 5: 10, 6: 11, 7: 12, 8: 12}, "w", "F")
            c.pts([(0, 4), (0, 5), (1, 7), (0, 8), (1, 9), (0, 10), (2, 8)], "Z", sym=True)           # lightning off the wingtips
        else:
            wing(c, {0: 11, 1: 10, 2: 9, 3: 9, 4: 8, 5: 8, 6: 8, 7: 8, 8: 8},
                 {0: 15, 1: 16, 2: 17, 3: 16, 4: 17, 5: 16, 6: 15, 7: 14, 8: 13}, "w", "F")
            c.pts([(0, 16), (1, 17), (0, 18), (1, 19), (0, 20), (2, 18)], "Z", sym=True)
        c.rect(7, 1, 15, 2, "B")                                         # the hammer crest, a bar across the head
        c.pts([(6, 1), (16, 1), (7, 3), (15, 3)], "B")
        c.px(11, 0, "B")
        c.rect(9, 3, 13, 6, "B")                                         # head
        c.pts([(10, 4), (12, 4)], "e")
        c.rect(11, 5, 11, 9, "Y")                                        # a long pale beak
        c.rect(8, 7, 14, 12, "B")                                        # the black shoulders and body
        c.rect(9, 13, 13, 16, "B")
        c.rect(9, 8, 13, 12, "W")                                        # the white breast, narrowing
        c.rect(10, 13, 12, 15, "W")
        c.pts([(9, 8), (13, 8)], "B")
        c.rect(10, 17, 12, 18, "B")                                      # short tail
        c.pts([(9, 17), (9, 18), (9, 19), (13, 17), (13, 18), (13, 19)], "Y")   # long legs
        c.pts([(8, 20), (10, 20), (12, 20), (14, 20)], "Y")              # talons
        c.pts([(9, 21), (13, 21), (7, 21), (15, 21)], "Z")               # lightning at the talons
        frames.append(c.rows())
    key = {"w": "night3", "F": "night1", "B": "night1", "e": "gold5", "Y": "gold3", "W": "steel5", "Z": "gold6"}
    p = pose(9, "night1", "ink", [(10, 10), (12, 14)], lambda x, y: x <= 3)
    cracks = [[(11, 2), (11, 3), (10, 5)], [(10, 9), (10, 10), (11, 11), (11, 12)],
              [(12, 9), (12, 10), (12, 11), (12, 13)], [(8, 9), (8, 10), (9, 11), (9, 13)]]
    return frames, key, p, cracks, False


def omukade():
    """Japanese giant mountain centipede: a broad armored head, curved mandibles, a segmented body reared up, many
    legs along the sides. Walk: the legs ripple. Dark bronze shell."""
    frames = []
    for alt in (False, True):
        c = Canvas(18, 21)
        c.pts([(5, 0), (4, 0), (3, 0), (2, 1), (12, 0), (13, 0), (14, 0), (15, 1)], "A")      # long antennae
        c.rect(4, 1, 13, 6, "C")                                         # a broad armored head
        c.rect(4, 1, 13, 1, "D")                                         # a plate crest
        c.pts([(5, 3), (12, 3)], "e")
        c.pts([(8, 3), (9, 3), (8, 5), (9, 5)], "D")
        c.pts([(4, 7), (3, 8), (3, 9), (4, 10), (5, 10), (5, 9), (6, 9)], "M")   # curved mandibles
        c.pts([(13, 7), (14, 8), (14, 9), (13, 10), (12, 10), (12, 9), (11, 9)], "M")
        c.rect(7, 6, 10, 7, "D")                                         # the dark mouth
        for y in range(8, 18):                                           # the reared body, a gentle S
            off = round(1.4 * math.sin(y / 2.2))
            c.rect(6 + off, y, 11 + off, y, "C" if (y - 8) // 2 % 2 == 0 else "D")
            c.rect(8 + off, y, 9 + off, y, "H")
        for k in range(5):                                               # legs, rippling
            y = 8 + 2 * k
            o = (k + (1 if alt else 0)) % 2
            off = round(1.4 * math.sin((y + 1) / 2.2))
            c.pts([(5 + off, y + o), (4 + off, y + o), (3 + off, y + 1 + o), (2 + off, y + 1 + o)], "L")
            c.pts([(12 + off, y + o), (13 + off, y + o), (14 + off, y + 1 + o), (15 + off, y + 1 + o)], "L")
        c.rect(4, 18, 13, 19, "C")                                       # the coiled base
        c.rect(5, 20, 12, 20, "D")
        c.pts([(14, 18), (15, 17), (15, 16), (14, 15)], "C")             # the tail's curl
        c.pts([(3, 19), (2, 19), (1, 20), (14, 19), (15, 19), (16, 20)], "L")
        frames.append(c.rows())
    key = {"A": "gold2", "C": "gold1", "D": "wood2", "e": "gold5", "M": "gold2", "H": "gold2", "L": "wood3"}
    p = pose(10, "gold1", "wood2", [(8, 13), (10, 19)], lambda x, y: x >= 14 and y <= 11)
    cracks = [[(7, 1), (7, 2), (8, 3)], [(7, 9), (7, 10), (7, 11), (7, 12)], [(10, 9), (10, 10), (10, 11), (10, 12)],
              [(7, 14), (7, 15), (8, 16), (7, 17)], [(9, 18), (9, 19)]]
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
