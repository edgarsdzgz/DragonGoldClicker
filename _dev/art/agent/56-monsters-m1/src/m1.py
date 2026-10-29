"""Monster batch M1 (pilot), v2 2026-10-29: the Kamaitachi, drawn as fill grids for 44-bestiary's kit.

v2 (owner review): a weasel, not a cat. A narrow head with a long pointed snout and low side ears, a long body
leaning into a thick tail that sweeps out to one side with a gold tip, and an open spiral of wind (not a base).
Each function returns (fills, key, pose, cracks, flip); fills is [frame A, frame B] (A is the idle; B is the
second walk frame). Pose in image coordinates (fill + 1 column, + 2 rows), cracks in fill coordinates.
v1 is kept in m1_v1.py.
"""
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


CREATURES = {"kamaitachi": kamaitachi}
