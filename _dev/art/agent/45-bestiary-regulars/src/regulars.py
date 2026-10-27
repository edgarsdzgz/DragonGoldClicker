"""The bestiary's second batch, v1, 2026-10-27: six regular monsters, their idle fill grids.

Owner: "Break them up into batches that you think optimal and begin with the first." Batch 1 is the regular
monsters (this one), batch 2 the elites, batch 3 the bosses. Same patterns as 44-bestiary: each returns
(fill rows, key, pose, cracks, flip); pose in image coordinates (fill + 1 column, + 2 rows), cracks in fill
coordinates. Cracks are drawn long from the start (the rat's first cracks did not read).
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "44-bestiary" / "src"))
from creatures import pose  # noqa: E402  (44-bestiary's)
from kit import Canvas  # noqa: E402


def war_hound():
    """A lean, scarred dog of the horde: tall pointed ears, a long snout snarling, a spiked steel collar."""
    c = Canvas(14, 14)
    c.pts([(3, 0), (3, 1), (4, 1), (3, 2), (4, 2), (5, 2)], "H", sym=True)
    c.pts([(4, 2), (9, 2)], "D")
    c.rect(4, 3, 9, 5, "H")
    c.pts([(5, 4), (8, 4)], "e")
    c.pts([(8, 3), (9, 5)], "x")
    c.rect(5, 6, 8, 7, "M")
    c.pts([(6, 7), (7, 7)], "n")
    c.pts([(5, 8), (8, 8)], "W")
    c.pts([(6, 8), (7, 8)], "a")
    c.rect(1, 10, 12, 12, "D")
    c.rect(3, 9, 10, 9, "C")
    c.pts([(2, 9), (11, 9)], "s")
    c.rect(3, 10, 10, 11, "H")
    c.rect(6, 10, 7, 11, "M")
    c.rect(3, 12, 4, 13, "H")
    c.rect(9, 12, 10, 13, "H")
    c.pts([(1, 13), (12, 13)], "D")
    c.pts([(12, 8), (13, 7), (13, 6)], "T")
    key = {"H": "wood2", "e": "gold5", "x": "parch1", "M": "wood4", "n": "ink", "a": "ink", "W": "parch3",
           "D": "wood1", "C": "steel1", "s": "steel4", "T": "wood2"}
    return c.rows(), key, pose(9, "wood2", "wood1", [(5, 12), (9, 6)], lambda x, y: (x, y) in {(3, 11), (12, 11)}),         [[(4, 1), (4, 2), (4, 3)], [(6, 3), (6, 4), (7, 5), (7, 6)], [(4, 10), (4, 11), (3, 12), (4, 13)],
         [(10, 10), (9, 11), (9, 12), (10, 13)]], False


def skeleton():
    """A soldier the Unmaking raised: a bare skull, an open ribcage, a rusted sword, a rotted round shield."""
    c = Canvas(14, 17)
    c.rect(4, 0, 8, 3, "B")
    c.clear([(4, 0), (8, 0)])
    c.pts([(5, 2), (7, 2)], "e")
    c.px(6, 3, "a")
    c.pts([(5, 4), (7, 4)], "B")
    c.px(6, 4, "a")
    c.px(6, 5, "b")
    c.rect(3, 6, 9, 6, "B")
    c.rect(4, 7, 8, 10, "d")
    c.rect(4, 7, 8, 7, "B")
    c.rect(4, 9, 8, 9, "B")
    c.rect(6, 7, 6, 10, "b")
    c.rect(4, 11, 8, 11, "B")
    c.pts([(9, 7), (10, 8), (10, 9), (11, 10)], "B")
    c.rect(4, 12, 4, 15, "B")
    c.rect(8, 12, 8, 15, "B")
    c.pts([(3, 16), (4, 16), (8, 16), (9, 16)], "B")
    c.rect(0, 7, 3, 12, "S")
    c.clear([(0, 7), (0, 12)])
    c.pts([(1, 9), (2, 10)], "r")
    c.rect(12, 1, 12, 8, "k")
    c.rect(11, 9, 13, 9, "h")
    c.rect(12, 10, 12, 11, "g")
    key = {"B": "parch3", "b": "parch2", "e": "gold5", "a": "ink", "d": "night1", "S": "wood2", "r": "steel1",
           "k": "clay2", "h": "steel1", "g": "wood1"}
    return c.rows(), key, pose(11, "parch3", "parch2", [(5, 9), (9, 17)], lambda x, y: x >= 13 and y <= 10), \
        [[(7, 0), (6, 1), (6, 2), (5, 3)], [(1, 8), (2, 9), (1, 10), (2, 11)], [(3, 6), (4, 7), (5, 8)],
         [(8, 12), (8, 13), (8, 14), (9, 16)]], False


def spectral_hound():
    """The Wraith's hound: a pale ghost of a dog, its jaws open in a howl, its legs fading into wisps."""
    c = Canvas(14, 14)
    c.pts([(3, 0), (3, 1), (4, 1), (3, 2), (4, 2), (5, 2)], "G", sym=True)
    c.rect(4, 3, 9, 5, "G")
    c.pts([(5, 4), (8, 4)], "e")
    c.rect(5, 6, 8, 6, "W")
    c.pts([(5, 7), (8, 7), (5, 8), (8, 8)], "W")
    c.rect(6, 7, 7, 8, "m")
    c.rect(3, 9, 10, 10, "G")
    c.rect(5, 9, 8, 10, "f")
    c.rect(2, 9, 2, 11, "G")
    c.rect(11, 9, 11, 11, "G")
    c.pts([(3, 11), (4, 11), (9, 11), (10, 11)], "G")
    c.pts([(3, 12), (10, 12), (6, 11)], "w")
    c.pts([(4, 13), (9, 13), (7, 12)], "v")
    c.pts([(12, 8), (13, 7), (13, 6), (12, 5)], "w")
    key = {"G": "steel4", "e": "gold5", "m": "night1", "W": "steel5", "f": "steel3", "w": "steel3", "v": "steel2"}
    return c.rows(), key, pose(9, "steel4", "steel3", [(5, 12), (10, 12)]),         [[(4, 1), (4, 2), (4, 3)], [(6, 3), (6, 4), (7, 5), (7, 6)], [(3, 9), (4, 10), (4, 11)],
         [(10, 9), (9, 10), (10, 11), (10, 12)]], False


def nomad_scout():
    """A light Wind-Taken scout: a pointed brown hood, a cloak flaring in the wind, a face wrap, a javelin."""
    c = Canvas(13, 16)
    c.rect(5, 0, 7, 0, "C")
    c.clear([(5, 0), (7, 0)])
    c.rect(4, 1, 8, 4, "C")
    c.rect(5, 2, 7, 4, "W")
    c.rect(5, 2, 7, 2, "v")
    c.pts([(5, 2), (7, 2)], "e")
    c.rect(3, 5, 9, 9, "T")
    for y, x0 in ((4, 3), (5, 2), (6, 1), (7, 1), (8, 0), (9, 0), (10, 1), (11, 2)):
        c.rect(x0, y, 3, y, "C")                                  # the cloak, flaring left in the wind
    c.clear([(0, 9), (2, 11)])
    c.rect(4, 9, 8, 9, "L")
    c.pts([(9, 6), (10, 7), (10, 8)], "T")
    c.rect(4, 10, 4, 13, "D")
    c.rect(7, 10, 7, 13, "D")
    c.pts([(3, 14), (4, 14), (7, 14), (8, 14)], "K")
    c.rect(11, 1, 11, 14, "p")
    c.pts([(11, 0), (11, 1)], "s")
    key = {"C": "wood3", "W": "sea2", "v": "night1", "e": "gold5", "T": "sea1", "L": "parch1", "D": "wood2",
           "K": "wood1", "p": "wood4", "s": "steel4"}
    return c.rows(), key, pose(9, "sea1", "night1", [(5, 9), (8, 13)], lambda x, y: x >= 12 and y <= 9),         [[(6, 0), (6, 1), (5, 3)], [(2, 6), (3, 7), (2, 8), (2, 9)], [(4, 6), (5, 7), (5, 8), (6, 9)],
         [(7, 10), (7, 11), (7, 12)]], False


def nomad_archer():
    """A Wind-Taken archer: the warrior's fur hood and face wrap, a recurve bow, arrows over the shoulder."""
    c = Canvas(15, 17)
    c.pts([(2, 0), (1, 1)] + [(0, y) for y in range(2, 14)] + [(1, 14), (2, 15)], "B")
    c.pts([(2, y) for y in range(1, 15)], "S")
    c.rect(5, 0, 11, 2, "F")
    c.clear([(5, 0), (11, 0)])
    c.rect(6, 2, 10, 5, "W")
    c.pts([(7, 3), (9, 3)], "e")
    c.pts([(12, 1), (13, 2)], "q")
    c.pts([(11, 3), (12, 3), (12, 4), (13, 3)], "Q")
    c.rect(5, 6, 11, 6, "F")
    c.rect(5, 7, 11, 11, "T")
    c.rect(5, 11, 11, 11, "L")
    c.rect(3, 7, 4, 9, "T")
    c.rect(12, 7, 12, 10, "T")
    c.rect(6, 12, 7, 15, "D")
    c.rect(9, 12, 10, 15, "D")
    c.rect(5, 16, 7, 16, "K")
    c.rect(9, 16, 11, 16, "K")
    key = {"B": "wood3", "S": "steel4", "F": "parch1", "W": "sea2", "e": "gold5", "q": "parch3", "Q": "wood1",
           "T": "sea1", "L": "wood2", "D": "wood2", "K": "wood1"}
    return c.rows(), key, pose(11, "sea1", "night1", [(7, 10), (11, 14)], lambda x, y: x <= 3), \
        [[(8, 0), (8, 1), (7, 2), (7, 3)], [(6, 7), (7, 8), (7, 9), (8, 10)], [(10, 8), (11, 9)],
         [(9, 12), (9, 13), (10, 14)]], False


def cult_apprentice():
    """A young cultist below the Prophet: a plain hood, an open book held in ash-gray hands, smoke rising off it."""
    c = Canvas(12, 15)
    c.rect(3, 0, 8, 4, "R")
    c.clear([(3, 0), (8, 0)])
    c.rect(4, 2, 7, 4, "H")
    c.pts([(4, 3), (7, 3)], "e")
    c.rect(2, 5, 9, 13, "R")
    c.pts([(1, 6), (1, 7), (10, 6), (10, 7)], "R")
    c.rect(4, 8, 7, 9, "P")
    c.pts([(5, 9), (6, 9)], "p")
    c.px(6, 8, "f")
    c.rect(4, 10, 7, 10, "B")
    c.pts([(3, 9), (8, 9)], "A")
    c.pts([(6, 7), (5, 6), (6, 5)], "m")
    c.rect(3, 12, 8, 12, "t")
    c.clear([(2, 13), (9, 13)])
    c.pts([(3, 14), (4, 14), (7, 14), (8, 14)], "K")
    key = {"R": "wood2", "H": "night1", "e": "gold5", "P": "parch3", "p": "parch2", "B": "clay1", "f": "fire1",
           "A": "ash3", "m": "ash3", "t": "clay2", "K": "wood1"}
    return c.rows(), key, pose(9, "wood2", "wood1", [(4, 13), (9, 7)], lambda x, y: (x, y) in {(7, 9), (6, 8), (7, 7)}),         [[(5, 0), (5, 1), (6, 2)], [(3, 5), (4, 6), (4, 7)], [(8, 10), (8, 11), (7, 12)],
         [(3, 10), (3, 11), (4, 12)]], False


CREATURES = {
    "war-hound": war_hound, "skeleton": skeleton, "spectral-hound": spectral_hound,
    "nomad-scout": nomad_scout, "nomad-archer": nomad_archer, "cult-apprentice": cult_apprentice,
}
