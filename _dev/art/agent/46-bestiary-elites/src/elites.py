"""The bestiary's batch 2 of 3, v1, 2026-10-27: seven elites, their idle fill grids.

Owner: "I like the batch! Let's work on the next." Elites sit between a monster and a boss: about 16x20
(regulars are about 12x15, bosses 20x25 and up). The three leaders keep their kind's look (the kobold's
scales and horns, the goblin's wide head and ears, the orc's ash-gray and tusks). Same patterns as
44-bestiary: pose in image coordinates (fill + 1 column, + 2 rows), cracks in fill coordinates.
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "44-bestiary" / "src"))
from creatures import pose  # noqa: E402  (44-bestiary's)
from kit import Canvas  # noqa: E402


def kobold_shaman():
    """A big kobold under a bone mask and a crest of feathers, a skull-topped staff, green fire in one hand."""
    c = Canvas(15, 19)
    c.rect(0, 0, 2, 0, "B")
    c.pts([(0, 1), (2, 1)], "a")
    c.pts([(1, 1), (1, 2)], "B")
    c.rect(1, 3, 1, 18, "p")
    c.pts([(4, 0), (5, 1)], "h", sym=True)
    c.pts([(6, 0), (7, 0), (8, 0), (7, 1)], "f")
    c.rect(5, 2, 9, 6, "K")
    c.rect(5, 3, 9, 4, "M")
    c.pts([(6, 3), (8, 3)], "e")
    c.rect(6, 5, 8, 6, "S")
    c.pts([(6, 5), (8, 5)], "n")
    c.rect(5, 7, 9, 7, "K")
    c.pts([(5, 7), (7, 7), (9, 7)], "g")
    c.rect(4, 8, 10, 15, "R")
    c.rect(6, 8, 8, 12, "k")
    c.pts([(4, 15), (6, 15), (8, 15), (10, 15)], ".")
    c.pts([(3, 9), (2, 10)], "K")
    c.pts([(11, 9), (11, 10), (12, 11)], "K")
    c.pts([(12, 8), (12, 9), (13, 9), (13, 10)], "F")
    c.px(12, 10, "G")
    c.rect(5, 16, 6, 17, "K")
    c.rect(8, 16, 9, 17, "K")
    c.pts([(4, 18), (5, 18), (6, 18), (8, 18), (9, 18), (10, 18)], "K")
    c.pts([(11, 15), (12, 14), (13, 13), (13, 12)], "T")
    key = {"B": "parch3", "a": "ink", "p": "wood3", "h": "parch1", "f": "emerald2", "K": "kobold2",
           "M": "parch3", "e": "gold5", "S": "kobold3", "n": "ink", "g": "gold4", "R": "wood3", "k": "kobold3",
           "F": "emerald3", "G": "emerald4", "T": "kobold2"}
    return c.rows(), key, pose(8, "kobold2", "kobold1", [(7, 13), (10, 19)], lambda x, y: x <= 3 and y <= 4), \
        [[(7, 2), (7, 3), (6, 4), (6, 5)], [(5, 9), (6, 10), (6, 11), (7, 12)], [(9, 10), (10, 11), (9, 12), (10, 13)],
         [(5, 16), (5, 17), (6, 18)], [(12, 14), (13, 13), (13, 12)]], False


def goblin_chieftain():
    """A fat goblin under a crown of bones, a dark fur mantle with a gold clasp, a heavy cleaver."""
    c = Canvas(17, 18)
    c.pts([(5, 0), (8, 0), (11, 0)], "c")
    c.rect(5, 1, 11, 1, "c")
    c.pts([(0, 2), (1, 2), (1, 3), (2, 3), (3, 3)], "G", sym=True)
    c.rect(4, 2, 12, 7, "G")
    c.rect(5, 1, 11, 1, "c")
    c.pts([(6, 4), (10, 4)], "e")
    c.pts([(6, 6), (8, 6), (10, 6)], "a")
    c.pts([(7, 6), (9, 6)], "W")
    c.rect(3, 9, 13, 14, "G")
    c.rect(5, 10, 11, 13, "b")
    c.rect(2, 8, 14, 9, "F")
    c.px(8, 8, "g")
    c.rect(3, 14, 13, 14, "L")
    c.px(8, 14, "g")
    c.rect(1, 10, 2, 13, "G")
    c.pts([(14, 10), (15, 11), (15, 12)], "G")
    c.rect(14, 13, 16, 16, "s")
    c.pts([(14, 16), (15, 16), (16, 16)], "S")
    c.rect(4, 15, 6, 16, "G")
    c.rect(10, 15, 12, 16, "G")
    c.rect(3, 17, 6, 17, "G")
    c.rect(10, 17, 13, 17, "G")
    key = {"c": "parch3", "G": "goblin2", "e": "gold5", "a": "ink", "W": "parch3", "b": "goblin3", "F": "wood1",
           "g": "gold4", "L": "wood2", "s": "steel3", "S": "steel4"}
    return c.rows(), key, pose(8, "goblin2", "goblin1", [(6, 13), (12, 6)], lambda x, y: x >= 15 and y >= 15), \
        [[(7, 2), (7, 3), (8, 4), (8, 5)], [(5, 10), (6, 11), (6, 12), (7, 13)], [(11, 10), (10, 11), (11, 12)],
         [(4, 15), (5, 16), (5, 17)], [(1, 2), (2, 3), (3, 3)]], False


def orc_warchief():
    """A big orc in a horned steel helm and spiked pauldrons, a rust war banner on his back, a great axe."""
    c = Canvas(18, 20)
    c.rect(0, 0, 0, 12, "p")
    c.rect(1, 0, 3, 4, "N")
    c.px(3, 4, ".")
    c.px(2, 2, "g")
    c.pts([(5, 0), (5, 1), (6, 1)], "h")
    c.pts([(13, 0), (13, 1), (12, 1)], "h")
    c.rect(7, 1, 11, 1, "M")
    c.rect(6, 2, 12, 3, "M")
    c.rect(6, 4, 12, 8, "A")
    c.pts([(7, 5), (11, 5)], "e")
    c.pts([(7, 7), (11, 7)], "W")
    c.rect(8, 7, 10, 7, "a")
    c.rect(3, 9, 6, 10, "S")
    c.rect(12, 9, 15, 10, "S")
    c.pts([(4, 8), (14, 8)], "s")
    c.rect(6, 9, 12, 14, "L")
    c.rect(3, 11, 5, 14, "A")
    c.rect(13, 11, 15, 14, "A")
    c.rect(6, 15, 12, 15, "B")
    c.px(9, 15, "g")
    c.rect(6, 16, 8, 18, "L")
    c.rect(10, 16, 12, 18, "L")
    c.rect(5, 19, 8, 19, "A")
    c.rect(10, 19, 13, 19, "A")
    c.rect(16, 2, 16, 17, "p")
    c.rect(15, 2, 17, 5, "x")
    c.pts([(15, 2), (15, 5)], ".")
    key = {"p": "wood3", "N": "clay2", "g": "gold4", "h": "parch3", "M": "steel3", "A": "ash2", "e": "gold5",
           "W": "parch3", "a": "ink", "S": "steel2", "s": "steel4", "L": "wood2", "B": "wood3", "x": "steel3"}
    return c.rows(), key, pose(9, "ash2", "ash1", [(5, 13), (9, 7)], lambda x, y: x >= 16 and y <= 7),         [[(8, 1), (9, 2), (9, 3), (8, 4)], [(7, 10), (8, 11), (8, 12), (9, 13)], [(14, 11), (13, 12), (14, 13)],
         [(11, 16), (11, 17), (12, 18)], [(1, 1), (2, 3)]], False


def troll():
    """A hunched troll: shoulders above its small head, a long nose, moss on its back, long arms, a club."""
    c = Canvas(17, 21)
    c.pts([(7, 0), (9, 0), (8, 1)], "m")
    c.rect(6, 2, 10, 6, "T")
    c.pts([(7, 4), (9, 4)], "e")
    c.pts([(8, 5), (8, 6)], "N")
    c.rect(6, 7, 10, 7, "T")
    c.pts([(7, 7), (9, 7)], "W")
    c.rect(3, 5, 5, 9, "T")
    c.rect(11, 5, 13, 9, "T")
    c.rect(4, 8, 12, 14, "T")
    c.pts([(3, 5), (4, 5), (12, 5), (13, 6), (6, 12), (11, 11)], "m")
    c.rect(6, 14, 10, 16, "L")
    c.rect(2, 9, 3, 16, "T")
    c.rect(1, 17, 3, 18, "T")
    c.rect(13, 9, 14, 15, "T")
    c.pts([(13, 16), (14, 16)], "T")
    c.pts([(15, 15), (15, 16), (15, 17)], "c")
    c.rect(14, 18, 16, 20, "C")
    c.px(15, 19, "k")
    c.rect(5, 17, 7, 19, "T")
    c.rect(9, 17, 11, 19, "T")
    c.rect(4, 20, 7, 20, "T")
    c.rect(9, 20, 12, 20, "T")
    key = {"m": "green2", "T": "orc2", "e": "gold5", "N": "orc3", "W": "parch3", "L": "wood1", "c": "wood2",
           "C": "wood3", "k": "wood2"}
    return c.rows(), key, pose(14, "orc2", "orc1", [(6, 12), (11, 18)], lambda x, y: x >= 15 and y >= 20), \
        [[(7, 2), (7, 3), (8, 4)], [(5, 8), (6, 9), (6, 10), (7, 11)], [(10, 9), (11, 10), (10, 11), (11, 12)],
         [(2, 11), (2, 12), (3, 13), (2, 14)], [(10, 17), (10, 18), (9, 19)]], False


def ogre():
    """A huge, dim ogre: a small head under a heavy brow, an underbite with tusks, a belly, a log on the shoulder."""
    c = Canvas(18, 21)
    c.rect(6, 0, 11, 5, "O")
    c.clear([(6, 0), (11, 0)])
    c.rect(6, 1, 11, 1, "b")
    c.pts([(7, 2), (10, 2)], "e")
    c.pts([(8, 4), (9, 4)], "a")
    c.pts([(7, 4), (10, 4)], "W")
    c.rect(2, 6, 15, 15, "O")
    c.clear([(2, 6), (15, 6)])
    c.rect(5, 9, 12, 14, "B")
    c.rect(4, 15, 13, 17, "L")
    c.rect(4, 15, 13, 15, "r")
    c.rect(0, 7, 1, 13, "O")
    c.rect(0, 14, 2, 15, "O")
    c.rect(16, 6, 17, 9, "O")
    c.rect(14, 0, 16, 5, "C")
    c.clear([(14, 0), (16, 0)])
    c.pts([(15, 1), (15, 3)], "k")
    c.pts([(16, 5), (17, 5)], "O")
    c.rect(4, 18, 7, 19, "O")
    c.rect(10, 18, 13, 19, "O")
    c.rect(3, 20, 7, 20, "O")
    c.rect(10, 20, 14, 20, "O")
    key = {"O": "clay3", "b": "clay2", "e": "gold5", "a": "ink", "W": "parch3", "B": "skin1", "L": "wood2",
           "r": "parch1", "C": "wood3", "k": "wood2"}
    return c.rows(), key, pose(15, "clay3", "clay2", [(4, 10), (14, 14)], lambda x, y: x >= 15 and y <= 6), \
        [[(8, 0), (8, 1), (9, 2), (9, 3)], [(3, 8), (4, 9), (4, 10), (3, 11)], [(7, 10), (8, 11), (8, 12), (9, 13)],
         [(13, 8), (14, 9), (13, 10)], [(11, 18), (11, 19), (12, 20)]], False


def iron_golem():
    """The Stone Golem's smaller, riveted cousin: iron plates, an eye slit, a furnace burning in its chest."""
    c = Canvas(16, 20)
    c.rect(5, 0, 10, 4, "I")
    c.rect(6, 2, 9, 2, "v")
    c.pts([(6, 2), (9, 2)], "e")
    c.pts([(7, 5), (8, 5)], "d")
    c.rect(4, 6, 11, 13, "I")
    c.rect(1, 5, 4, 8, "I", sym=True)
    c.pts([(2, 6)], "r", sym=True)
    c.rect(6, 8, 9, 10, "f")
    c.pts([(7, 9), (8, 9)], "F")
    c.rect(6, 11, 9, 11, "d")
    c.rect(4, 12, 11, 12, "d")
    c.pts([(5, 7), (5, 11)], "r", sym=True)
    c.rect(1, 9, 3, 14, "I", sym=True)
    c.rect(0, 15, 3, 16, "d", sym=True)
    c.rect(4, 14, 11, 14, "d")
    c.rect(4, 15, 6, 18, "I", sym=True)
    c.rect(3, 19, 6, 19, "d", sym=True)
    key = {"I": "steel2", "v": "ink", "e": "gold5", "d": "steel1", "r": "steel4", "f": "fire1", "F": "fire2"}
    return c.rows(), key, pose(14, "steel2", "steel1", [(5, 11), (11, 15)], lambda x, y: x >= 13 and y >= 17), \
        [[(6, 0), (6, 1), (7, 3), (7, 4)], [(4, 7), (5, 8), (5, 9), (4, 10)], [(10, 9), (11, 10), (10, 11)],
         [(2, 10), (2, 11), (3, 12)], [(9, 15), (10, 16), (10, 17)]], False


def windcaller():
    """A Wind-Taken mage: a tall hood and face wrap, a long robe, a ringed staff, a whirlwind over one hand."""
    c = Canvas(15, 20)
    c.pts([(0, 1), (1, 0), (2, 1), (1, 2)], "s")
    c.px(1, 1, "c")
    c.rect(1, 3, 1, 19, "p")
    c.pts([(6, 0), (7, 0), (8, 0)], "H")
    c.rect(4, 1, 10, 5, "H")
    c.clear([(4, 1), (10, 1)])
    c.rect(5, 3, 9, 5, "W")
    c.rect(5, 3, 9, 3, "v")
    c.pts([(6, 3), (8, 3)], "e")
    c.rect(4, 6, 10, 17, "R")
    c.rect(7, 6, 7, 17, "t")
    c.rect(4, 10, 10, 10, "L")
    c.rect(3, 13, 11, 17, "R")
    c.rect(7, 13, 7, 17, "t")
    c.pts([(3, 7), (2, 8)], "R")
    c.pts([(11, 7), (12, 6), (12, 5)], "R")
    c.px(12, 4, "W")
    c.pts([(11, 3), (11, 2), (12, 1), (13, 1), (14, 2), (14, 3), (13, 4)], "w")
    c.pts([(12, 15), (12, 16)], "R")
    c.pts([(5, 18), (6, 18), (8, 18), (9, 18)], "K")
    c.pts([(5, 19), (9, 19)], "K")
    key = {"s": "steel4", "c": "sea3", "p": "wood3", "H": "parch1", "W": "sea2", "v": "night1", "e": "gold5",
           "R": "sea1", "t": "parch2", "L": "wood2", "w": "sea3", "K": "wood1"}
    return c.rows(), key, pose(10, "sea1", "night1", [(6, 15), (11, 18)], lambda x, y: x >= 12 and y <= 6), \
        [[(7, 0), (7, 1), (6, 2)], [(5, 7), (5, 8), (6, 9)], [(9, 11), (8, 12), (9, 13), (9, 14)],
         [(4, 14), (5, 15), (5, 16), (4, 17)], [(10, 6), (10, 7), (9, 8)]], False


CREATURES = {
    "kobold-shaman": kobold_shaman, "goblin-chieftain": goblin_chieftain, "orc-warchief": orc_warchief,
    "troll": troll, "ogre": ogre, "iron-golem": iron_golem, "windcaller": windcaller,
}
