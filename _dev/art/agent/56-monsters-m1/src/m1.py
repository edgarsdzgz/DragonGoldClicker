"""Monster batch M1 (pilot), v2 2026-10-29: the Kamaitachi, drawn as fill grids for 44-bestiary's kit.

v2 (owner review): a weasel, not a cat. A narrow head with a long pointed snout and low side ears, a long body
leaning into a thick tail that sweeps out to one side with a gold tip, and an open spiral of wind (not a base).
Each function returns (fills, key, pose, cracks, flip); fills is [frame A, frame B] (A is the idle; B is the
second walk frame). Pose in image coordinates (fill + 1 column, + 2 rows), cracks in fill coordinates.
v1 is kept in m1_v1.py.
"""
import math
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "44-bestiary" / "src"))
from creatures import pose  # noqa: E402  (44-bestiary's)
from kit import Canvas  # noqa: E402

TAIL_A = [(11, 12, 13, 13), (13, 11, 15, 12), (15, 10, 16, 11), (16, 9, 16, 8)]       # sweeps up and out
TAIL_B = [(11, 12, 14, 12), (13, 13, 16, 13), (15, 12, 16, 12), (16, 11, 16, 11)]     # flicked low
SWIRL_A = [(1, 10), (1, 11), (2, 12), (3, 13), (5, 14), (6, 15), (8, 15), (13, 14), (14, 13), (14, 15)]
SWIRL_B = [(2, 9), (1, 11), (1, 12), (2, 13), (4, 14), (5, 15), (9, 15), (12, 14), (13, 15), (15, 14)]


def _kamaitachi(alt):
    c = Canvas(18, 16)
    c.rect(7, 1, 10, 4, "F")                                             # narrow head
    c.pts([(6, 3), (11, 3), (6, 4), (11, 4)], "F")                       # small round ears, low on the sides
    c.pts([(7, 3), (10, 3)], "e")                                        # glowing gold eyes
    c.rect(8, 5, 9, 5, "F")                                              # long snout
    c.pts([(8, 6), (9, 6)], "N")                                         # pointed nose
    c.rect(7, 6, 10, 7, "F")                                             # neck, then the long body curving
    c.pts([(8, 6), (9, 6)], "N")
    c.rect(6, 8, 10, 9, "F")                                             # shoulders
    c.rect(7, 10, 11, 11, "F")                                           # the body leans right
    c.rect(9, 12, 12, 12, "F")                                           # and tapers into the tail
    c.pts([(8, 7), (8, 8), (8, 9), (9, 10), (9, 11)], "B")               # pale belly line
    c.pts([(5, 9), (11, 9), (6, 11), (12, 11), (11, 7), (12, 5)], "S")   # bristled spines, pale tips
    for side in (0, 1):                                                  # both sickle forelimbs, raised
        def x(v, side=side):
            return v if side == 0 else 16 - v
        c.pts([(x(5), 8), (x(4), 7), (x(4), 6)], "F")                    # fur arm
        c.pts([(x(3), 6), (x(3), 5), (x(3), 4), (x(2), 4), (x(2), 3), (x(3), 2), (x(4), 1), (x(5), 1)], "K")
        c.pts([(x(3), 3), (x(4), 2), (x(2), 5), (x(2), 6)], "K")
        c.pts([(x(2), 4), (x(2), 5), (x(2), 6)], "L")                    # blade back edge, lighter
    for x0, y0, x1, y1 in (TAIL_B if alt else TAIL_A):
        c.rect(x0, y0, x1, y1, "T")
    tip = (16, 11) if alt else (16, 8)
    c.px(*tip, "G")                                                      # the tail's contrasting tip
    for sx, sy in (SWIRL_B if alt else SWIRL_A):                         # an open spiral, gaps all through
        c.px(sx, sy, "V")
    return c.rows()


def kamaitachi():
    key = {"F": "teal2", "N": "ink", "B": "teal3", "e": "gold5", "S": "teal3", "K": "steel3", "L": "steel5",
           "V": "steel3", "T": "teal2", "G": "gold3"}
    p = pose(8, "teal2", "teal1", [(8, 9), (10, 12)], lambda x, y: x <= 5 and y <= 8)
    cracks = [[(8, 1), (8, 2), (9, 3), (9, 4)], [(7, 7), (8, 8), (8, 9), (9, 10)], [(7, 8), (7, 9), (8, 10), (8, 11)],
              [(10, 10), (10, 11), (11, 11), (11, 12)]]
    return [_kamaitachi(False), _kamaitachi(True)], key, p, cracks, False




# --- The rest of M1 (2026-10-29) ----------------------------------------------------------------------------

def wing(c, top, bottom, edge, fill):
    """A wing on each side: for each column x, the edge at top[x] and the membrane down to bottom[x]."""
    for x, t in top.items():
        c.px(x, t, edge, sym=True)
        for y in range(t + 1, bottom[x] + 1):
            c.px(x, y, fill, sym=True)


def aitvaras():
    """Lithuanian folklore: a black rooster that flies as a dragon, a serpent body trailing a meteor of flame.
    Fire is orange and gold only. Frames: wings up, wings down, the flame sways."""
    frames = []
    for up in (True, False):
        c = Canvas(19, 25)
        if up:
            wing(c, {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6}, {0: 2, 1: 4, 2: 4, 3: 6, 4: 6, 5: 8, 6: 9}, "w", "F")
        else:
            wing(c, {0: 10, 1: 9, 2: 8, 3: 8, 4: 7, 5: 7, 6: 7}, {0: 12, 1: 11, 2: 12, 3: 11, 4: 12, 5: 11, 6: 11},
                 "w", "F")
        c.pts([(9, 0), (8, 1), (9, 1), (10, 1)], "C")                    # the comb, orange
        c.rect(8, 2, 10, 4, "B")                                         # rooster head
        c.pts([(8, 3), (10, 3)], "e")
        c.pts([(9, 4), (9, 5)], "Y")                                     # a gold beak
        c.rect(8, 5, 10, 6, "B")
        c.pts([(9, 5)], "Y")
        c.pts([(9, 6)], "C")                                             # wattle
        c.rect(7, 7, 11, 11, "B")                                        # a deep chest
        c.rect(8, 8, 10, 10, "f")
        c.rect(8, 12, 10, 13, "B")                                       # the serpent body narrows
        s = 1 if up else -1                                              # the flame sways with the beat
        widths = [3, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1]
        for i, w in enumerate(widths):                                   # a long S-curved meteor tail
            cx = 9 + round(2 * math.sin(i / 1.6 + (0 if up else math.pi)))
            c.rect(cx - w // 2, 14 + i, cx - w // 2 + w - 1, 14 + i, "O")
            if w >= 3:
                c.px(cx, 14 + i, "Y")
        c.pts([(5 - s, 18), (13 + s, 20), (7 + s, 23)], "Y")             # sparks off the meteor
        frames.append(c.rows())
    key = {"w": "night3", "F": "night2", "B": "night1", "f": "night2", "e": "gold5", "C": "fire1", "Y": "gold4",
           "O": "fire1"}
    p = pose(9, "night1", "ink", [(9, 9), (9, 12)], lambda x, y: x <= 2)
    cracks = [[(9, 2), (9, 3), (9, 4)], [(8, 7), (8, 8), (9, 9), (9, 10)], [(10, 7), (10, 8), (11, 9), (10, 10)],
              [(9, 12), (9, 13)]]
    return frames, key, p, cracks, False


def gargoyle():
    """D&D SRD 5.1 monster: crouched stone, horned, its heavy stone wings held forward over the body like a shield.
    Frames: wings forward and braced, wings lifted a pixel and a column out (the flight beat)."""
    frames = []
    for up in (False, True):
        c = Canvas(19, 17)
        c.pts([(6, 1), (5, 0), (6, 0), (6, 2)], "h", sym=True)           # curved horns, bone
        c.rect(7, 1, 11, 5, "G")                                         # the head
        c.pts([(7, 2), (11, 2)], "D")                                    # a heavy brow
        c.pts([(8, 3), (10, 3)], "e")
        c.pts([(8, 5), (10, 5)], "W")                                    # fangs
        c.rect(6, 6, 12, 7, "G")                                         # hunched shoulders
        c.rect(8, 8, 10, 12, "G")                                        # the chest, seen between the wings
        c.rect(9, 8, 9, 12, "g")
        if up:
            c.rect(1, 4, 6, 11, "S", sym=True)                           # the wings, a slab each side
            c.rect(1, 4, 6, 4, "E", sym=True)
            c.rect(2, 7, 5, 7, "R", sym=True)                            # armor ribs across the slab
            c.rect(2, 9, 5, 9, "R", sym=True)
            c.clear([(1, 11), (2, 11)], sym=True)
        else:
            c.rect(2, 5, 7, 12, "S", sym=True)
            c.rect(2, 5, 7, 5, "E", sym=True)
            c.rect(3, 8, 6, 8, "R", sym=True)
            c.rect(3, 10, 6, 10, "R", sym=True)
            c.clear([(2, 12), (3, 12)], sym=True)
        c.pts([(6, 13), (7, 13), (11, 13), (12, 13)], "G")               # crouched haunches and claws
        c.rect(5, 14, 8, 15, "G")
        c.rect(10, 14, 13, 15, "G")
        c.pts([(5, 16), (7, 16), (11, 16), (13, 16)], "h")
        frames.append(c.rows())
    key = {"G": "ash2", "g": "ash3", "D": "ash1", "S": "ash1", "E": "ash3", "R": "ash2", "e": "gold5",
           "W": "parch3", "h": "parch2"}
    p = pose(10, "ash2", "ash1", [(9, 9), (7, 16)], lambda x, y: x <= 3 and y <= 12)
    cracks = [[(9, 2), (9, 3), (9, 4), (8, 5)], [(3, 6), (3, 7), (4, 8), (3, 9)], [(15, 6), (15, 7), (14, 8), (15, 9)],
              [(9, 8), (9, 9), (9, 10), (9, 11)], [(6, 14), (6, 15)]]
    return frames, key, p, cracks, False


def wild_hunt_rider():
    """Germanic and Norse folklore: an anonymous spectral huntsman, wide bone antlers on a dark hood, a tattered
    cloak, a hunting horn, on a heavy black ghost horse with a black hound at its side. Not Odin, no god."""
    c = Canvas(22, 24)
    c.pts([(7, 3), (6, 2), (5, 1), (4, 0), (6, 1), (6, 0), (3, 1), (2, 1)], "A", sym=True)   # wide antlers
    c.rect(8, 3, 13, 7, "H")                                             # the hood
    c.rect(9, 4, 12, 6, "n")                                             # an empty dark face
    c.pts([(9, 5), (12, 5)], "e")
    c.rect(6, 8, 15, 12, "M")                                            # the cloak
    c.pts([(5, 9), (5, 10), (16, 9), (16, 10), (4, 11), (17, 11)], "M")
    c.pts([(6, 8), (15, 8)], "m")
    c.pts([(17, 8), (18, 7), (19, 6), (19, 5), (20, 4), (20, 5), (19, 7)], "O")   # the hunting horn
    c.pts([(16, 8), (17, 9)], "M")
    c.rect(3, 13, 18, 18, "N")                                           # the heavy horse, wide
    c.pts([(2, 14), (2, 15), (19, 14), (19, 15)], "N")
    c.pts([(4, 12), (7, 12), (14, 12), (17, 12)], "m")                   # a ragged mane
    c.pts([(7, 11), (8, 11), (13, 11), (14, 11)], "H")                   # cloak tatters over the horse
    c.rect(9, 13, 12, 20, "N")                                           # the long horse head, front-on
    c.pts([(8, 11), (8, 12), (8, 13), (13, 11), (13, 12), (13, 13)], "N")  # tall pricked ears
    c.rect(9, 18, 12, 20, "P")                                           # pale muzzle
    c.pts([(9, 15), (12, 15)], "e")                                      # glowing eyes
    c.pts([(9, 19), (12, 19)], "a")
    c.pts([(0, 18), (4, 18)], "D")                                       # the black hound's ears
    c.rect(0, 19, 4, 22, "D")                                            # its head, at the horse's side
    c.pts([(1, 20), (3, 20)], "e")
    c.px(2, 21, "a")
    c.pts([(1, 22), (3, 22)], "W")
    c.rect(5, 19, 7, 22, "N")                                            # forelegs, spread
    c.rect(14, 19, 16, 22, "N")
    c.rect(4, 23, 7, 23, "K")
    c.rect(14, 23, 17, 23, "K")
    key = {"A": "parch3", "H": "shadow1", "n": "ink", "e": "gold5", "M": "shadow2", "m": "shadow3", "O": "gold3",
           "N": "night1", "P": "night2", "a": "ink", "D": "night2", "W": "parch3", "K": "ink"}
    p = pose(12, "night1", "ink", [(10, 10), (7, 17)], lambda x, y: x >= 18 and y <= 10)
    cracks = [[(10, 3), (10, 4), (11, 5), (11, 6)], [(8, 8), (9, 9), (9, 10), (10, 11)],
              [(13, 8), (13, 9), (12, 10), (13, 11)], [(5, 14), (5, 15), (6, 16), (6, 17)],
              [(16, 14), (16, 15), (15, 16), (15, 17)], [(10, 13), (10, 14), (11, 14), (11, 16)]]
    return c.rows(), key, p, cracks, False


# Two-frame monsters (frame A is the idle); the fliers also get a shadow. Riders walk with the kit bob.
CREATURES = {"kamaitachi": kamaitachi, "aitvaras": aitvaras, "gargoyle": gargoyle}
FLIERS = {"aitvaras", "gargoyle"}
RIDERS = {"wild-hunt-rider": wild_hunt_rider}
