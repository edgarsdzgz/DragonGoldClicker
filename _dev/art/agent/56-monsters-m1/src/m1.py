"""Monster batch M1 (pilot), 2026-10-29: the Kamaitachi, drawn as fill grids for 44-bestiary's kit.

Each function returns (fills, key, pose, cracks, flip); fills is [frame A, frame B] (A is the idle; B is the
second walk frame). Pose in image coordinates (fill + 1 column, + 2 rows), cracks in fill coordinates.
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "44-bestiary" / "src"))
from creatures import pose  # noqa: E402  (44-bestiary's)
from kit import Canvas  # noqa: E402


def _kamaitachi(alt):
    """The sickle weasel reared up on a whirlwind. alt flips the swirl's lean and the tail's curl."""
    c = Canvas(16, 16)
    c.pts([(5, 1), (10, 1), (5, 2), (10, 2)], "F")                       # small round ears
    c.rect(6, 1, 9, 4, "F")                                              # head
    c.pts([(6, 3), (9, 3)], "e")                                         # glowing gold eyes
    c.rect(7, 5, 8, 5, "N")                                              # narrow snout
    c.pts([(7, 5), (8, 5)], "W")                                         # bared fangs
    c.rect(5, 6, 10, 11, "F")                                            # lean body
    c.rect(7, 7, 8, 11, "B")                                             # pale belly
    c.pts([(4, 3), (11, 3), (4, 5), (11, 5), (3, 7), (12, 7), (4, 9), (11, 9)], "S")   # bristled spines, pale tips
    c.pts([(5, 0), (10, 0)], "S")
    for side in (0, 1):                                                  # both sickle forelimbs, raised
        def x(v, side=side):
            return v if side == 0 else 15 - v
        c.pts([(x(4), 7), (x(3), 6), (x(3), 5)], "F")                    # fur arm
        c.pts([(x(2), 5), (x(2), 4), (x(2), 3), (x(1), 3), (x(1), 2), (x(2), 1), (x(3), 1), (x(4), 0)], "K")
        c.pts([(x(2), 2), (x(3), 2)], "K")
        c.pts([(x(1), 4), (x(1), 5), (x(1), 6)], "L")                    # blade back edge, lighter
    c.rect(5, 12, 6, 12, "F")                                            # hind feet
    c.rect(9, 12, 10, 12, "F")
    sw = 1 if alt else 0
    c.rect(2 + sw, 13, 5 + sw, 13, "V")                                  # the whirlwind: broken arcs that
    c.rect(8 + sw, 13, 13 - sw, 13, "V")                                 # swap their gaps between frames
    c.rect(1 - sw, 14, 6, 14, "U")
    c.rect(9 - sw, 14, 14, 14, "U")
    c.rect(4 + sw * 3, 15, 8 + sw * 3, 15, "V")
    if alt:                                                              # tail swept down and out
        c.pts([(11, 10), (12, 11), (13, 11), (14, 11), (14, 10), (15, 9), (15, 8), (14, 10)], "T")
    else:                                                                # tail curled up
        c.pts([(11, 10), (12, 10), (12, 9), (13, 9), (14, 8), (14, 7), (14, 6), (13, 5), (13, 4)], "T")
    return c.rows()


def kamaitachi():
    key = {"F": "teal2", "N": "teal1", "B": "teal3", "e": "gold5", "W": "steel5", "S": "teal3",
           "K": "steel3", "L": "steel5", "V": "steel2", "U": "steel1", "T": "teal2"}
    p = pose(7, "teal2", "teal1", [(6, 8), (9, 10)], lambda x, y: x <= 3 and y <= 7)
    cracks = [[(6, 1), (6, 2), (7, 3), (7, 4)], [(9, 6), (9, 7), (8, 8), (9, 9)], [(5, 8), (5, 9), (6, 10), (5, 11)],
              [(8, 9), (8, 10), (9, 11), (10, 11)]]
    return [_kamaitachi(False), _kamaitachi(True)], key, p, cracks, False


CREATURES = {"kamaitachi": kamaitachi}
