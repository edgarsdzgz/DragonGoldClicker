"""The bestiary's fliers and riders, v1, 2026-10-27: their fill grids.

Owner: "Why do flyers and riders need an air battlefield? Can't they just be 'higher' up on the warfront?"
So they use the road like everything else. A flier is drawn higher, over a shadow of its own (out/mob_<id>_
shadow.png), and its two walk frames are a wingbeat (or a gallop on the wind) in place of the walk bob. A
rider on a mount simply walks.

Each flier returns ([frame A, frame B], key, pose, cracks, flip); frame A is the idle. Cracks stay on the body,
so they land on both frames. Pose in image coordinates (fill + 1 column, + 2 rows), cracks in fill coordinates.
"""
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


def giant_bat():
    """A giant brown bat: big ears, gold eyes, fangs, leathery wings; the wingbeat is its flight."""
    frames = []
    for up in (True, False):
        c = Canvas(19, 11)
        if up:
            wing(c, {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6}, {0: 1, 1: 3, 2: 5, 3: 4, 4: 6, 5: 7, 6: 8}, "b", "M")
        else:
            wing(c, {0: 9, 1: 8, 2: 7, 3: 7, 4: 6, 5: 6, 6: 6}, {0: 9, 1: 10, 2: 9, 3: 10, 4: 9, 5: 10, 6: 10}, "b",
                 "M")
        c.pts([(7, 0), (7, 1)], "B", sym=True)
        c.rect(7, 2, 11, 5, "B")
        c.pts([(8, 3), (10, 3)], "e")
        c.px(9, 4, "n")
        c.pts([(8, 5), (10, 5)], "W")
        c.rect(7, 6, 11, 9, "B")
        c.rect(8, 6, 10, 8, "f")
        c.pts([(8, 10), (10, 10)], "B")
        frames.append(c.rows())
    key = {"b": "wood3", "M": "wood1", "B": "wood2", "e": "gold5", "n": "ink", "W": "parch3", "f": "wood3"}
    return frames, key, pose(6, "wood2", "wood1", [(9, 9), (12, 11)], lambda x, y: x <= 2), \
        [[(9, 2), (9, 3), (8, 4)], [(8, 6), (8, 7), (9, 8), (9, 9)], [(11, 6), (10, 7), (11, 8)]], False


def harpy():
    """A harpy: a gray-green hag's face under stringy hair, feathered wings, a feathered body, taloned feet."""
    frames = []
    for up in (True, False):
        c = Canvas(19, 15)
        if up:
            wing(c, {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6}, {0: 2, 1: 4, 2: 4, 3: 6, 4: 6, 5: 8, 6: 9}, "w", "F")
        else:
            wing(c, {0: 10, 1: 9, 2: 8, 3: 8, 4: 7, 5: 7, 6: 7}, {0: 12, 1: 11, 2: 12, 3: 11, 4: 12, 5: 11, 6: 11},
                 "w", "F")
        c.rect(7, 0, 11, 1, "H")
        c.rect(6, 1, 6, 5, "H", sym=True)
        c.rect(7, 2, 11, 5, "S")
        c.pts([(8, 3), (10, 3)], "e")
        c.px(9, 4, "N")
        c.rect(8, 5, 10, 5, "a")
        c.pts([(8, 5), (10, 5)], "W")
        c.px(9, 6, "S")
        c.rect(7, 7, 11, 11, "F")
        c.rect(8, 7, 10, 9, "f")
        c.pts([(8, 12), (8, 13), (10, 12), (10, 13)], "L")
        c.pts([(7, 14), (9, 14), (11, 14)], "T")
        frames.append(c.rows())
    key = {"w": "wood3", "F": "wood2", "H": "ash1", "S": "orc2", "e": "gold5", "N": "orc1", "a": "ink",
           "W": "parch3", "f": "wood3", "L": "gold2", "T": "parch3"}
    return frames, key, pose(7, "orc2", "orc1", [(9, 12), (11, 13)], lambda x, y: x <= 2), \
        [[(8, 2), (9, 3), (9, 4)], [(8, 7), (8, 8), (9, 9), (9, 10)], [(11, 7), (10, 8), (11, 9), (11, 10)]], False


def mantair_corsair():
    """A raider in a rust head-wrap riding a flying manta: wide sea-dark wings, cephalic fins, a curved blade."""
    frames = []
    for up in (True, False):
        c = Canvas(23, 15)
        if up:
            wing(c, {0: 4, 1: 4, 2: 5, 3: 5, 4: 6, 5: 7}, {0: 5, 1: 6, 2: 7, 3: 8, 4: 9, 5: 10}, "E", "M")
        else:
            wing(c, {0: 10, 1: 9, 2: 9, 3: 8, 4: 8, 5: 7}, {0: 11, 1: 11, 2: 11, 3: 11, 4: 10, 5: 10}, "E", "M")
        c.rect(9, 0, 13, 3, "H")
        c.rect(10, 2, 12, 2, "v")
        c.pts([(10, 2), (12, 2)], "e")
        c.rect(9, 4, 13, 6, "R")
        c.pts([(14, 4), (15, 3)], "R")
        c.pts([(16, 2), (16, 1), (17, 0)], "b")
        c.rect(6, 7, 16, 10, "M")
        c.rect(6, 7, 16, 7, "E")
        c.pts([(7, 8), (15, 8)], "e")
        c.rect(9, 10, 13, 10, "a")
        c.pts([(7, 10), (7, 11), (8, 11)], "c", sym=True)
        c.rect(9, 11, 13, 11, "B")
        c.pts([(11, 12), (11, 13), (11, 14)], "M")
        frames.append(c.rows())
    key = {"E": "sea2", "M": "sea1", "H": "clay2", "v": "night1", "e": "gold5", "R": "wood2", "b": "steel4",
           "a": "ink", "c": "sea2", "B": "sea3"}
    return frames, key, pose(7, "sea1", "night1", [(9, 11), (15, 12)], lambda x, y: x >= 17 and y <= 5), \
        [[(9, 0), (10, 1), (9, 2)], [(9, 4), (10, 5), (10, 6)], [(7, 7), (8, 8), (8, 9), (9, 10)],
         [(14, 7), (14, 8), (15, 9), (14, 10)]], False


def storm_rider():
    """A Wind-Taken rider on a storm-gray horse that runs on the wind: a white blaze, a cloud mane, lightning
    under its hooves, a lance with a pennant."""
    frames = []
    for a in (True, False):
        c = Canvas(20, 22)
        c.rect(8, 0, 11, 3, "h")
        c.rect(8, 2, 11, 3, "W")
        c.rect(8, 2, 11, 2, "v")
        c.pts([(8, 2), (11, 2)], "e")
        c.rect(7, 4, 12, 7, "T")
        c.pts([(6, 5), (5, 6), (13, 5), (14, 6), (15, 6)], "T")
        c.rect(16, 0, 16, 13, "p")
        c.px(16, 0, "s")
        c.pts([(17, 1), (18, 1), (17, 2)], "P")
        c.rect(4, 10, 15, 13, "d")
        c.pts([(3, 10), (3, 11), (16, 10), (16, 11)], "D")
        c.pts([(3, 12), (16, 12)], "K")
        c.rect(5, 14, 14, 16, "H")
        c.pts([(7, 6), (7, 7)], "H", sym=True)
        c.pts([(6, 8), (6, 9), (5, 10), (6, 11)], "c", sym=True)
        c.rect(8, 8, 11, 14, "H")
        c.rect(9, 9, 10, 12, "b")
        c.pts([(8, 10), (11, 10)], "e")
        c.rect(8, 13, 11, 14, "m")
        c.pts([(9, 14), (10, 14)], "a")
        if a:
            c.rect(6, 17, 7, 18, "H", sym=True)
            c.pts([(6, 19), (7, 19)], "k", sym=True)
            c.pts([(4, 20), (5, 21)], "c", sym=True)
            c.pts([(9, 18), (10, 19), (9, 20)], "z")
        else:
            c.pts([(6, 17), (7, 17), (7, 18)], "H", sym=True)
            c.px(8, 19, "k", sym=True)
            c.pts([(3, 21), (5, 20)], "c", sym=True)
            c.pts([(10, 18), (9, 19), (10, 20)], "z")
        frames.append(c.rows())
    key = {"h": "parch1", "W": "sea2", "v": "night1", "e": "gold5", "T": "sea1", "p": "wood3", "s": "steel4",
           "P": "sea2", "D": "wood2", "K": "wood1", "H": "steel2", "d": "steel1", "b": "steel4", "m": "steel3",
           "a": "ink", "c": "steel4", "k": "night1", "z": "azure3"}
    return frames, key, pose(8, "steel2", "steel1", [(8, 17), (14, 16)], lambda x, y: x >= 17 and y <= 8),         [[(8, 4), (9, 5), (9, 6), (10, 7)], [(11, 8), (11, 9), (10, 10), (10, 11)], [(5, 14), (6, 15), (6, 16)],
         [(14, 14), (13, 15), (13, 16), (12, 17)]], False


def wolf_rider():
    """A goblin with a spear riding a gray wolf: the goblin's wide head and ears over the wolf's tall ears and
    snarling snout (the War Hound's head, bigger). Walks the road."""
    c = Canvas(18, 18)
    c.pts([(4, 0), (5, 1)], "G", sym=True)
    c.rect(6, 0, 11, 3, "G")
    c.pts([(7, 2), (10, 2)], "e")
    c.pts([(7, 3), (10, 3)], "a")
    c.pts([(8, 3), (9, 3)], "W")
    c.rect(7, 4, 10, 6, "T")
    c.pts([(6, 5), (11, 5), (12, 4), (13, 4), (14, 4)], "G")
    c.rect(15, 0, 15, 11, "p")
    c.px(15, 0, "s")
    c.rect(3, 9, 14, 12, "w")
    c.pts([(4, 5), (4, 6), (5, 6), (4, 7), (5, 7), (6, 7)], "L", sym=True)
    c.px(5, 7, "w", sym=True)
    c.pts([(3, 10), (3, 11), (14, 10), (14, 11)], "G")
    c.pts([(2, 12), (15, 12)], "G")
    c.rect(3, 12, 14, 14, "L")
    c.rect(1, 13, 2, 15, "w", sym=True)
    c.rect(5, 8, 12, 10, "L")
    c.pts([(6, 9), (11, 9)], "e")
    c.rect(7, 10, 10, 13, "M")
    c.pts([(8, 11), (9, 11)], "a")
    c.pts([(7, 13), (10, 13)], "F")
    c.pts([(8, 13), (9, 13)], "a")
    c.rect(4, 15, 5, 17, "L", sym=True)
    key = {"G": "goblin2", "e": "gold5", "a": "ink", "W": "parch3", "T": "wood3", "p": "wood3", "s": "steel4",
           "w": "steel1", "L": "steel2", "M": "steel3", "F": "parch3"}
    return c.rows(), key, pose(7, "steel2", "steel1", [(5, 16), (13, 15)], lambda x, y: x >= 16 and y <= 6,
                               lid="steel2"),         [[(7, 0), (8, 1), (8, 2)], [(9, 8), (9, 9), (10, 10), (10, 11)], [(3, 12), (4, 13), (4, 14), (5, 15)],
         [(14, 12), (13, 13), (13, 14), (12, 15)]], False


FLIERS = {"giant-bat": giant_bat, "harpy": harpy, "mantair-corsair": mantair_corsair, "storm-rider": storm_rider}
RIDERS = {"wolf-rider": wolf_rider}
