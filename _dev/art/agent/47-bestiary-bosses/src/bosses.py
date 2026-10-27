"""The bestiary's batch 3 of 3, v1, 2026-10-27: four bosses, their idle fill grids.

Owner: "Approved! Let's move to the next batch." Bosses vary in size (owner, 44-bestiary): human-shaped near the
Khagan's 20x25, beasts bigger. Same patterns as 44-bestiary: pose in image coordinates (fill + 1 column,
+ 2 rows), cracks in fill coordinates.
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "44-bestiary" / "src"))
from creatures import pose  # noqa: E402  (44-bestiary's)
from kit import Canvas  # noqa: E402


def basilisk():
    """A crowned serpent-lizard: a frill of gold spikes, eyes that burn white-gold, a low splayed body, a tail."""
    c = Canvas(24, 20)
    c.pts([(8, 0), (8, 1), (10, 0), (10, 1), (11, 1)], "c", sym=True)
    c.rect(8, 2, 15, 2, "c")
    c.rect(7, 3, 16, 8, "S")
    c.rect(8, 4, 10, 4, "d", sym=True)
    c.rect(9, 5, 10, 5, "E", sym=True)
    c.rect(9, 7, 14, 9, "S")
    c.pts([(10, 8), (13, 8)], "a")
    c.rect(10, 9, 13, 9, "a")
    c.pts([(10, 10), (13, 10)], "W")
    c.rect(9, 10, 14, 12, "S")
    c.pts([(10, 10), (13, 10)], "W")
    c.rect(11, 10, 12, 12, "B")
    c.pts([(5, 11), (7, 11)], "x", sym=True)
    c.rect(3, 12, 20, 16, "S")
    c.rect(8, 13, 15, 16, "B")
    c.rect(1, 14, 3, 17, "S", sym=True)
    c.rect(0, 18, 2, 18, "W", sym=True)
    c.rect(5, 17, 7, 18, "S", sym=True)
    c.pts([(5, 19), (7, 19)], "W", sym=True)
    c.pts([(21, 11), (22, 10), (23, 9), (23, 8), (22, 7)], "S")
    key = {"c": "gold3", "S": "emerald2", "d": "emerald1", "E": "gold6", "a": "ink", "W": "parch3", "B": "parch1",
           "x": "emerald1"}
    return c.rows(), key, pose(12, "emerald2", "emerald1", [(6, 15), (18, 17)], lambda x, y: x <= 10 and y <= 3,
                               eyes="gold6"), \
        [[(12, 3), (11, 4), (11, 5), (12, 6)], [(5, 12), (6, 13), (6, 14), (7, 15)],
         [(17, 12), (16, 13), (17, 14), (16, 15)], [(9, 14), (10, 15), (10, 16)], [(1, 14), (2, 15), (2, 16)]], False


def spider_queen():
    """The crawlers' mother: a bloated abdomen carrying pale egg sacs, eight eyes, fangs, eight long legs."""
    c = Canvas(26, 20)
    c.rect(7, 0, 18, 8, "A")
    c.clear([(7, 0), (8, 0), (7, 1), (7, 8)], sym=True)
    c.rect(12, 1, 13, 7, "s")
    c.pts([(9, 1), (10, 1), (9, 2), (15, 4), (16, 4), (16, 5), (10, 6), (11, 6)], "g")   # egg sacs, lopsided
    c.rect(8, 9, 17, 14, "B")
    c.clear([(8, 14)], sym=True)
    c.pts([(9, 10), (11, 10), (10, 11), (12, 11)], "e", sym=True)
    c.pts([(11, 14), (11, 15), (14, 14), (14, 15)], "W")
    legs = [[(7, 9), (6, 8), (5, 7), (4, 7), (3, 8), (2, 9), (1, 10), (0, 11)],
            [(7, 11), (6, 10), (5, 10), (4, 10), (3, 11), (2, 12), (1, 13), (1, 14)],
            [(7, 13), (6, 13), (5, 13), (4, 14), (3, 15), (3, 16), (2, 17)],
            [(8, 14), (7, 15), (6, 16), (6, 17), (5, 18), (5, 19)]]
    for leg in legs:
        c.pts(leg, "L", sym=True)
    key = {"A": "shadow3", "s": "shadow2", "g": "parch3", "B": "shadow3", "e": "gold5", "W": "parch3",
           "L": "shadow2"}
    return c.rows(), key, pose(9, "shadow3", "shadow2", [(11, 4), (16, 13)],
                               lambda x, y: (x, y) in {(12, 16), (12, 17), (15, 16), (15, 17)}), \
        [[(11, 0), (11, 1), (10, 2), (11, 3)], [(8, 4), (9, 5), (9, 6), (8, 7)], [(16, 1), (17, 2), (17, 3)],
         [(9, 11), (10, 12), (10, 13)], [(15, 11), (15, 12), (16, 13)]], True


def corrupted_drake():
    """The Ember Wraith's great cousin: a horned drake of cracked charcoal scales, fire in its jaws and seams."""
    c = Canvas(24, 22)
    c.pts([(5, 0), (6, 0), (6, 1), (7, 1), (7, 2), (8, 2)], "h", sym=True)
    c.rect(8, 2, 15, 8, "S")
    c.pts([(9, 4), (10, 5)], "e", sym=True)
    c.rect(9, 7, 14, 10, "S")
    c.pts([(10, 8), (13, 8)], "F")
    c.rect(11, 10, 12, 11, "F")
    c.pts([(11, 10), (12, 10)], "f")
    c.pts([(10, 10), (13, 10)], "W")
    c.pts([(10, 11), (13, 11)], "S")
    c.rect(9, 12, 14, 12, "S")
    c.pts([(0, 8), (1, 9), (0, 9), (1, 10), (2, 10), (1, 11), (2, 11), (3, 11)], "w", sym=True)
    c.pts([(4, 11), (3, 10), (2, 9), (1, 8), (0, 7)], "o", sym=True)
    c.pts([(6, 11), (8, 11)], "h", sym=True)
    c.rect(4, 12, 19, 18, "S")
    c.rect(8, 13, 15, 17, "B")
    c.pts([(9, 14), (10, 14), (13, 16), (14, 16), (11, 15)], "F")
    c.rect(3, 15, 5, 19, "S", sym=True)
    c.rect(2, 20, 4, 20, "W", sym=True)
    c.rect(6, 19, 8, 20, "S", sym=True)
    c.pts([(6, 21), (8, 21)], "W", sym=True)
    c.pts([(20, 17), (21, 16), (22, 15), (23, 14), (23, 13)], "S")
    key = {"h": "parch1", "S": "ash1", "e": "gold5", "F": "fire1", "f": "fire2", "W": "parch3", "w": "ash2", "o": "ash3",
           "B": "ash2"}
    return c.rows(), key, pose(12, "ash1", "night1", [(6, 15), (18, 17)], lambda x, y: x <= 7 and y <= 4), \
        [[(11, 2), (12, 3), (12, 4), (11, 5)], [(5, 13), (6, 14), (6, 15), (7, 16)],
         [(18, 13), (17, 14), (18, 15), (17, 16)], [(9, 16), (10, 17), (11, 17)], [(3, 16), (4, 17), (4, 18)]], False


def lich():
    """The master of the risen dead: a crowned skull in a high-collared robe, a staff with a pale green orb."""
    c = Canvas(20, 25)
    c.rect(16, 0, 18, 2, "o")
    c.clear([(16, 0), (18, 0), (16, 2), (18, 2)])
    c.px(17, 1, "O")
    c.pts([(16, 3), (18, 3)], "b")
    c.rect(17, 3, 17, 24, "b")
    c.pts([(6, 0), (6, 1), (8, 1), (9, 0), (9, 1)], "c", sym=True)
    c.rect(6, 2, 13, 2, "c")
    c.rect(7, 3, 12, 7, "K")
    c.rect(8, 4, 8, 5, "d", sym=True)
    c.pts([(8, 5), (11, 5)], "e")
    c.pts([(9, 6), (10, 6)], "a")
    c.pts([(8, 7), (10, 7)], "a")
    c.rect(5, 3, 6, 8, "R", sym=True)
    c.rect(5, 8, 14, 8, "R")
    c.rect(4, 9, 15, 22, "R")
    c.rect(8, 9, 11, 22, "r")
    c.rect(4, 14, 15, 14, "c")
    c.pts([(9, 14), (10, 14)], "o")
    c.pts([(4, 23), (6, 23), (8, 23), (11, 23), (13, 23), (15, 23)], "R")
    c.pts([(5, 24), (9, 24), (10, 24), (14, 24)], "R")
    c.rect(2, 9, 3, 13, "R")
    c.pts([(2, 8), (1, 7), (2, 7)], "K")
    c.pts([(0, 5), (1, 4), (2, 5), (1, 6)], "o")
    c.rect(15, 9, 16, 12, "R")
    c.px(16, 13, "K")
    key = {"o": "teal3", "O": "teal4", "b": "parch2", "c": "gold3", "K": "parch3", "d": "night1", "e": "gold5",
           "a": "ink", "R": "night2", "r": "night3"}
    return c.rows(), key, pose(14, "night2", "night1", [(6, 19), (14, 13)], lambda x, y: x >= 17 and y <= 5), \
        [[(10, 3), (10, 4), (9, 5)], [(5, 10), (6, 11), (6, 12), (5, 13)], [(13, 15), (14, 16), (13, 17), (14, 18)],
         [(9, 17), (10, 18), (10, 19), (9, 20)], [(2, 10), (3, 11), (2, 12)]], False


CREATURES = {
    "basilisk": basilisk, "spider-queen": spider_queen, "corrupted-drake": corrupted_drake, "lich": lich,
}
