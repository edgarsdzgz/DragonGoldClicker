"""The 18 new monsters of the bestiary (_dev/docs/bestiary.md), v1, 2026-10-27: their idle fill grids.

Each returns (fill rows, key, pose, cracks, flip). Pose and crack coordinates follow 22-mobs and
24-mobs-unmaking: pose in image coordinates (fill + 1 column, + 2 rows), cracks in fill coordinates.
Gold eyes on every one; signature colors no townsperson wears; red only for damage, magenta only for the
Unmaking's cracks. Bosses vary in size (owner): human-shaped near the Minotaur's 20x25, the rest bigger.
"""
from kit import Canvas, hx

NONE = lambda x, y: False  # noqa: E731


def pose(waist, body, dark, spots, weapon=NONE, eyes="gold5", lid=None):
    return dict(waist=waist + 2, back=0, eyes={hx(eyes)}, lid=hx(lid or body), body=hx(body), dark=hx(dark),
                spots=spots, weapon=weapon)


# --- The early horde --------------------------------------------------------------------------------

def giant_rat():
    """A hunched rat as big as a kobold: round ears, a pointed snout, buck teeth, a bald tail."""
    c = Canvas(14, 12)
    c.rect(2, 0, 3, 1, "P", sym=False)
    c.rect(9, 0, 10, 1, "P")
    c.rect(3, 1, 9, 5, "A")
    c.pts([(4, 2), (8, 2)], "e")
    c.rect(5, 4, 7, 6, "A")
    c.px(6, 6, "n")
    c.pts([(6, 7), (6, 8)], "W")
    c.rect(2, 7, 10, 10, "A")
    c.rect(4, 8, 8, 10, "b")
    c.pts([(6, 7), (6, 8)], "W")
    c.pts([(2, 9), (10, 9)], "P")
    c.rect(2, 11, 4, 11, "P")
    c.rect(8, 11, 10, 11, "P")
    c.pts([(11, 9), (12, 8), (13, 7), (13, 6), (12, 5)], "T")
    # v2: peach, not pink, for the ears, feet, nose and tail, so the Unmaking's magenta cracks stand out
    key = {"P": "skin2", "A": "ash3", "e": "gold5", "n": "clay2", "W": "parch3", "b": "steel4", "T": "skin1"}
    return c.rows(), key, pose(6, "ash3", "ash2", [(4, 10), (10, 11)]), \
        [[(4, 1), (5, 2), (5, 3), (6, 4)], [(8, 1), (8, 2), (9, 3)], [(2, 7), (3, 8), (3, 9), (4, 10)],
         [(7, 8), (6, 9), (7, 10)], [(9, 7), (10, 8), (10, 9)]], False   # v2: longer, more of them (owner)


def goblin_scout():
    """A goblin in a ragged hood, lean, with a sling."""
    c = Canvas(12, 13)
    c.rect(2, 0, 8, 2, "H")
    c.rect(1, 2, 9, 6, "H")
    c.pts([(0, 4), (10, 4)], "G")
    c.rect(3, 3, 7, 6, "G")
    c.pts([(4, 4), (6, 4)], "e")
    c.pts([(4, 6), (6, 6)], "a")
    c.px(5, 6, "W")
    c.rect(2, 7, 8, 10, "H")
    c.rect(3, 9, 7, 9, "L")
    c.pts([(1, 8), (1, 9), (9, 8), (9, 9)], "G")
    c.pts([(3, 11), (3, 12), (7, 11), (7, 12)], "G")
    c.pts([(10, 9), (10, 10)], "p")
    c.px(11, 11, "s")
    key = {"H": "wood1", "G": "goblin2", "e": "gold5", "a": "ink", "W": "parch3", "L": "wood3", "p": "wood3",
           "s": "steel3"}
    return c.rows(), key, pose(9, "goblin2", "goblin1", [(5, 10), (8, 12)], lambda x, y: x >= 11 and y >= 11), \
        [[(5, 0), (5, 1)], [(3, 8), (4, 9)], [(7, 11), (7, 12)]], False


def goblin_archer():
    """The goblin's wide head and long ears, a leather vest, a bow taller than it is."""
    c = Canvas(13, 13)
    c.pts([(2, 0), (3, 0), (11, 0), (12, 0)], "G")
    c.rect(3, 1, 11, 1, "G")
    c.rect(4, 2, 10, 6, "G")
    c.pts([(5, 3), (9, 3)], "e")
    c.pts([(5, 5), (7, 5), (9, 5)], "a")
    c.pts([(6, 5), (8, 5)], "W")
    c.rect(4, 7, 10, 10, "T")
    c.pts([(3, 8), (3, 9), (11, 8), (11, 9)], "G")
    c.rect(4, 11, 5, 11, "T")
    c.rect(9, 11, 10, 11, "T")
    c.rect(4, 12, 5, 12, "G")
    c.rect(9, 12, 10, 12, "G")
    c.pts([(1, 0)] + [(0, y) for y in range(1, 12)] + [(1, 12)], "B")
    c.pts([(1, y) for y in range(1, 12)], "S")
    key = {"G": "goblin2", "e": "gold5", "a": "ink", "W": "parch3", "T": "wood2", "B": "wood3", "S": "steel4"}
    return c.rows(), key, pose(7, "goblin2", "goblin1", [(7, 5), (11, 11)], lambda x, y: x <= 2), \
        [[(8, 1), (7, 2), (7, 3)], [(3, 8), (3, 9)], [(6, 8), (7, 9), (7, 10)]], False


def banner_runner():
    """A thin raider in wind-wraps, face covered, carrying a tattered war banner."""
    c = Canvas(14, 16)
    c.rect(4, 1, 7, 1, "N")
    c.rect(4, 2, 7, 5, "F")
    c.pts([(5, 3), (6, 3)], "e")
    c.rect(4, 6, 7, 10, "N")
    c.pts([(3, 7), (3, 8), (8, 7), (8, 8), (9, 8)], "N")
    c.rect(4, 10, 7, 10, "L")
    c.rect(4, 11, 4, 14, "D")
    c.rect(7, 11, 7, 14, "D")
    c.pts([(3, 15), (4, 15), (7, 15), (8, 15)], "K")
    c.rect(10, 0, 10, 15, "p")
    c.rect(11, 0, 13, 4, "S")
    c.clear([(12, 4)])
    c.pts([(12, 1), (12, 2)], "g")
    key = {"N": "sea1", "F": "sea2", "e": "gold5", "L": "wood2", "D": "sea1", "K": "wood1", "p": "wood3",
           "S": "sea2", "g": "gold4"}
    return c.rows(), key, pose(10, "sea1", "night1", [(6, 9), (8, 13)], lambda x, y: x >= 11 and y <= 8), \
        [[(5, 1), (6, 2)], [(5, 7), (6, 8), (6, 9)], [(4, 12), (4, 13)]], False


# --- The middle horde -------------------------------------------------------------------------------

def shield_bearer():
    """An orc in a steel cap behind a tall, scarred tower shield."""
    c = Canvas(14, 18)
    c.rect(4, 0, 9, 1, "M")
    c.rect(4, 2, 9, 6, "A")
    c.pts([(5, 3), (8, 3)], "e")
    c.pts([(5, 5), (8, 5)], "W")
    c.pts([(6, 5), (7, 5)], "a")
    c.rect(2, 6, 11, 15, "R")
    c.rect(3, 7, 10, 14, "S")
    c.rect(6, 9, 7, 11, "b")
    c.pts([(4, 8), (5, 9), (9, 12)], "x")
    c.rect(4, 16, 5, 17, "A")
    c.rect(8, 16, 9, 17, "A")
    key = {"M": "steel2", "A": "ash2", "e": "gold5", "W": "parch3", "a": "ink", "R": "steel3", "S": "wood2",
           "b": "steel4", "x": "wood1"}
    return c.rows(), key, pose(9, "ash2", "ash1", [(6, 4), (9, 18)], lambda x, y: x >= 10 and 8 <= y <= 11), \
        [[(6, 2), (7, 3)], [(4, 10), (5, 11), (5, 12)], [(9, 13), (10, 14)], [(4, 16), (4, 17)]], False


def beetle_guard():
    """An upright beetle in dark plates: a short horn, mandibles, pincer arms."""
    c = Canvas(14, 15)
    c.pts([(6, 0), (7, 0)], "h")
    c.rect(5, 1, 8, 3, "H")
    c.pts([(5, 2), (8, 2)], "e")
    c.pts([(5, 4), (8, 4)], "M")
    c.rect(3, 4, 10, 11, "C")
    c.clear([(3, 4), (10, 4), (3, 11), (10, 11)])
    c.rect(5, 5, 8, 10, "B")
    c.rect(5, 7, 8, 7, "L")
    c.rect(5, 9, 8, 9, "L")
    c.pts([(2, 5), (1, 6), (1, 7), (0, 8), (2, 8)], "C")
    c.pts([(11, 5), (12, 6), (12, 7), (13, 8), (11, 8)], "C")
    c.rect(4, 12, 5, 14, "C")
    c.rect(8, 12, 9, 14, "C")
    key = {"h": "teal2", "H": "teal1", "e": "gold5", "M": "parch1", "C": "teal1", "B": "teal2", "L": "teal1"}
    return c.rows(), key, pose(8, "teal1", "night1", [(6, 7), (10, 10)], lambda x, y: x >= 13 and y <= 10), \
        [[(6, 1), (7, 2)], [(4, 5), (4, 6), (5, 7)], [(9, 9), (10, 10)]], True


def chitin_warrior():
    """A tall ant soldier in dark brown chitin, a pale belly, antennae, a spear."""
    c = Canvas(13, 19)
    c.pts([(3, 0), (9, 0)], "a")
    c.rect(4, 1, 8, 4, "C")
    c.pts([(5, 2), (7, 2)], "e")
    c.pts([(5, 5), (7, 5)], "M")
    c.px(6, 5, "C")
    c.rect(4, 6, 8, 10, "C")
    c.rect(5, 7, 7, 9, "B")
    c.pts([(3, 7), (2, 8), (2, 9), (9, 7), (10, 8)], "C")
    c.px(6, 11, "C")
    c.rect(4, 12, 8, 14, "C")
    c.rect(4, 15, 4, 18, "C")
    c.rect(8, 15, 8, 18, "C")
    c.pts([(3, 18), (9, 18)], "C")
    c.rect(11, 0, 11, 18, "p")
    c.pts([(11, 0), (11, 1), (10, 1), (12, 1), (11, 2)], "s")
    key = {"C": "wood2", "a": "wood1", "e": "gold5", "M": "parch1", "B": "parch1", "p": "wood3", "s": "steel4"}
    return c.rows(), key, pose(11, "wood2", "wood1", [(6, 4), (7, 15)], lambda x, y: x >= 11 and y <= 5), \
        [[(6, 1), (5, 2)], [(5, 7), (6, 8)], [(6, 12), (6, 13), (7, 14)]], False


def nomad_warrior():
    """A wind-burned raider: a fur hood, a face wrap, layered furs, a curved blade."""
    c = Canvas(14, 17)
    c.rect(3, 0, 9, 2, "F")
    c.clear([(3, 0), (9, 0)])
    c.rect(4, 2, 8, 5, "W")
    c.pts([(5, 3), (7, 3)], "e")
    c.rect(2, 6, 10, 7, "F")
    c.rect(3, 8, 9, 11, "T")
    c.rect(3, 11, 9, 11, "L")
    c.rect(1, 8, 2, 10, "F")
    c.rect(10, 8, 11, 10, "F")
    c.rect(4, 12, 5, 15, "D")
    c.rect(7, 12, 8, 15, "D")
    c.rect(3, 16, 5, 16, "K")
    c.rect(7, 16, 9, 16, "K")
    c.pts([(12, 10), (12, 9), (12, 8), (13, 7), (13, 6)], "b")
    key = {"F": "parch1", "W": "sea2", "e": "gold5", "T": "sea1", "L": "wood2", "D": "wood2", "K": "wood1",
           "b": "steel4"}
    return c.rows(), key, pose(11, "parch1", "wood3", [(4, 8), (9, 13)], lambda x, y: x >= 13 and y <= 11), \
        [[(6, 1), (5, 2)], [(4, 8), (5, 9), (5, 10)], [(8, 13), (8, 14)]], False


# --- The Unmaking's own -----------------------------------------------------------------------------

def wraith():
    """A ragged gray shroud with no body inside: a hood, two gold eyes, long sleeves, a tattered hem."""
    c = Canvas(13, 16)
    c.rect(4, 0, 8, 1, "S")
    c.rect(3, 2, 9, 6, "S")
    c.rect(5, 3, 7, 6, "H")
    c.pts([(5, 4), (7, 4)], "e")
    c.rect(2, 7, 10, 12, "S")
    c.rect(4, 8, 4, 12, "f")
    c.rect(8, 8, 8, 12, "f")
    c.rect(0, 7, 1, 10, "S")
    c.rect(11, 7, 12, 10, "S")
    c.pts([(0, 11), (12, 11)], "c")
    c.pts([(2, 13), (4, 13), (5, 14), (7, 13), (8, 14), (10, 13), (6, 15)], "S")
    key = {"S": "steel3", "H": "night1", "e": "gold5", "f": "steel2", "c": "steel5"}
    return c.rows(), key, pose(9, "steel3", "steel2", [(5, 11), (9, 13)]), \
        [[(6, 0), (6, 1)], [(3, 8), (3, 9), (4, 10)], [(9, 11), (10, 12)]], False


def shadow_phantom():
    """A tall, flickering silhouette darker than night, with long arms and claws."""
    c = Canvas(13, 22)
    c.rect(4, 0, 8, 3, "N")
    c.pts([(5, 2), (7, 2)], "e")
    c.px(6, 4, "N")
    c.rect(3, 5, 9, 6, "N")
    c.rect(4, 7, 8, 13, "N")
    c.rect(5, 14, 7, 17, "N")
    c.clear([(5, 10), (7, 12)])
    c.rect(2, 6, 2, 15, "L")
    c.rect(10, 6, 10, 15, "L")
    c.pts([(1, 16), (3, 16), (2, 17), (9, 16), (11, 16), (10, 17)], "c")
    c.pts([(6, 18), (5, 19), (6, 20), (7, 21)], "N")
    key = {"N": "night1", "e": "gold5", "L": "shadow2", "c": "shadow3"}
    return c.rows(), key, pose(12, "night1", "ink", [(6, 10), (6, 15)], lambda x, y: x <= 4 and y >= 18), \
        [[(6, 0), (6, 1)], [(5, 8), (6, 9), (6, 10)], [(6, 15), (6, 16)]], False


def ashen_convert():
    """A human gone ash-gray: burned scalp, a bone-pale mask, a rust robe with a rope belt, a crude knife."""
    c = Canvas(12, 17)
    c.rect(3, 0, 8, 4, "A")
    c.clear([(3, 0), (8, 0)])
    c.pts([(4, 0), (7, 1)], "b")
    c.rect(3, 2, 8, 4, "M")
    c.pts([(4, 3), (7, 3)], "e")
    c.pts([(5, 5), (6, 5)], "A")
    c.rect(2, 6, 9, 15, "R")
    c.rect(2, 10, 9, 10, "L")
    c.rect(1, 7, 1, 10, "R")
    c.rect(10, 7, 10, 10, "R")
    c.pts([(1, 11), (10, 11)], "A")
    c.pts([(10, 12), (10, 13)], "d")
    c.clear([(2, 15), (9, 15)])
    c.pts([(3, 16), (4, 16), (7, 16), (8, 16)], "A")
    key = {"A": "ash3", "b": "ash1", "M": "parch2", "e": "gold5", "R": "clay1", "L": "parch1", "d": "steel3"}
    return c.rows(), key, pose(10, "clay1", "wood1", [(5, 10), (7, 15)], lambda x, y: x >= 11 and y >= 13), \
        [[(5, 0), (6, 1)], [(4, 7), (5, 8), (5, 9)], [(7, 12), (7, 13)]], False


def ember_prophet():
    """A hooded cultist, cinders glowing in the dark of the hood, swinging a burning censer."""
    c = Canvas(14, 18)
    c.rect(4, 0, 9, 5, "R")
    c.clear([(4, 0), (9, 0)])
    c.rect(5, 2, 8, 5, "H")
    c.pts([(5, 3), (8, 3)], "e")
    c.pts([(6, 5), (7, 4)], "c")
    c.rect(3, 6, 10, 16, "R")
    c.rect(5, 6, 5, 16, "T")
    c.rect(8, 6, 8, 16, "T")
    c.rect(2, 7, 2, 11, "R")
    c.pts([(11, 6), (11, 7)], "R")
    c.pts([(11, 8), (12, 9), (12, 10)], "k")
    c.rect(11, 11, 13, 13, "s")
    c.px(12, 11, "f")
    c.px(13, 10, "m")
    c.clear([(3, 16), (10, 16)])
    c.pts([(4, 17), (9, 17)], "K")
    key = {"R": "wood1", "H": "night1", "e": "gold5", "c": "fire1", "T": "clay2", "k": "steel2", "s": "gold3",
           "f": "fire2", "m": "ash3", "K": "wood2"}
    return c.rows(), key, pose(10, "wood1", "night1", [(6, 12), (9, 15)], lambda x, y: x >= 12 and y >= 11), \
        [[(6, 0), (7, 1)], [(4, 8), (4, 9), (5, 10)], [(9, 13), (9, 14)]], False


def ember_wraith():
    """A small drake of smoke and embers: small horns, ragged wings, a burning belly, a tail."""
    c = Canvas(15, 14)
    c.pts([(5, 0), (9, 0)], "h")
    c.rect(5, 1, 9, 4, "S")
    c.pts([(6, 2), (8, 2)], "e")
    c.rect(6, 4, 8, 5, "S")
    c.px(7, 5, "F")
    c.pts([(0, 1), (1, 2), (2, 3), (1, 3), (2, 4), (3, 5), (2, 5), (3, 6), (4, 6)], "w", sym=True)
    c.rect(4, 6, 10, 11, "S")
    c.pts([(6, 7), (7, 8), (8, 9), (7, 10)], "f")
    c.px(7, 8, "F")
    c.rect(4, 12, 5, 13, "S")
    c.rect(9, 12, 10, 13, "S")
    c.pts([(11, 10), (12, 11), (13, 12)], "S")
    key = {"h": "ash2", "S": "ash1", "e": "gold5", "F": "fire2", "w": "ash2", "f": "fire1"}
    return c.rows(), key, pose(8, "ash1", "night1", [(6, 9), (10, 12)]), \
        [[(7, 1), (7, 2)], [(5, 7), (5, 8)], [(9, 10), (9, 11)]], False


# --- Bosses -----------------------------------------------------------------------------------------

def stone_golem():
    """A hulking figure of stacked rubble, moss in the cracks, gold seams glowing between the stones."""
    c = Canvas(22, 26)
    c.rect(8, 0, 13, 5, "S")
    c.pts([(9, 2), (12, 2)], "e")
    c.rect(2, 6, 8, 11, "S")
    c.rect(13, 6, 19, 11, "S")
    c.rect(6, 7, 15, 16, "S")
    c.rect(6, 11, 15, 11, "d")
    c.rect(10, 7, 10, 16, "d")
    c.pts([(10, 9), (11, 10), (10, 12), (11, 13), (10, 14)], "g")
    c.pts([(3, 6), (4, 6), (14, 6), (7, 15), (8, 15), (17, 10)], "m")
    c.rect(1, 12, 4, 19, "S")
    c.rect(17, 12, 20, 19, "S")
    c.rect(0, 20, 5, 22, "S")
    c.rect(16, 20, 21, 22, "S")
    c.rect(6, 17, 9, 24, "S")
    c.rect(12, 17, 15, 24, "S")
    c.rect(5, 25, 10, 25, "S")
    c.rect(11, 25, 16, 25, "S")
    key = {"S": "steel2", "e": "gold5", "d": "steel1", "g": "gold4", "m": "green2"}
    return c.rows(), key, pose(16, "steel2", "steel1", [(8, 10), (14, 14)], lambda x, y: x >= 18 and y >= 22), \
        [[(11, 1), (10, 2), (11, 3)], [(4, 8), (5, 9)], [(13, 13), (14, 14), (13, 15)], [(7, 20), (8, 21)],
         [(18, 14), (18, 15)]], False


def giant_elemental():
    """A towering column of flame with a rough body: arms of fire, a burning core, molten rock at its feet."""
    c = Canvas(22, 28)
    c.pts([(8, 0), (12, 0), (10, 1), (13, 1), (9, 1)], "f")
    c.rect(8, 2, 13, 7, "f")
    c.pts([(9, 4), (12, 4)], "e")
    c.rect(5, 8, 16, 18, "f")
    for y, x0, x1 in ((10, 10, 11), (11, 9, 12), (12, 8, 12), (13, 8, 13), (14, 9, 13), (15, 8, 12), (16, 9, 11)):
        c.rect(x0, y, x1, y, "F")                                # the inner flame, flickering
    c.pts([(10, 12), (11, 13), (10, 14), (11, 14)], "C")
    c.rect(1, 9, 4, 16, "f")
    c.rect(17, 9, 20, 16, "f")
    c.pts([(0, 9), (2, 8), (21, 9), (19, 8), (1, 17), (20, 17)], "f")
    c.rect(6, 19, 15, 22, "f")
    c.rect(8, 19, 13, 21, "F")
    c.rect(7, 23, 14, 25, "c")
    c.rect(5, 26, 16, 27, "r")
    c.clear([(5, 8), (16, 8), (1, 9), (20, 9)])
    key = {"f": "fire1", "F": "fire2", "C": "fire3", "e": "night1", "c": "clay2", "r": "ash1"}
    return c.rows(), key, pose(18, "fire1", "clay2", [(8, 12), (15, 16)], eyes="night1", lid="fire1"), \
        [[(10, 2), (11, 3)], [(7, 10), (8, 11), (7, 12)], [(13, 17), (14, 18)], [(9, 22), (10, 23)]], False


def khagan():
    """The Khagan of the Sirocco: a horned helm that hides the face, a fur mantle, steel, banners, a great blade."""
    c = Canvas(20, 25)
    c.rect(2, 0, 2, 10, "p")
    c.rect(17, 0, 17, 10, "p")
    c.rect(0, 0, 1, 2, "S")
    c.rect(18, 0, 19, 2, "S")
    c.pts([(0, 3), (19, 3)], "S")
    c.pts([(4, 0), (5, 1), (5, 2), (6, 3)], "h", sym=True)
    c.rect(7, 2, 12, 8, "H")
    c.clear([(7, 2), (12, 2)])
    c.rect(8, 5, 11, 5, "v")
    c.pts([(8, 5), (11, 5)], "e")
    c.rect(8, 8, 11, 9, "F")
    c.rect(3, 9, 16, 11, "F")
    c.rect(6, 12, 13, 16, "A")
    c.rect(6, 17, 13, 17, "g")
    c.rect(5, 18, 14, 20, "F")
    c.rect(3, 12, 5, 17, "F")
    c.rect(14, 12, 16, 17, "F")
    c.pts([(4, 18), (15, 18)], "G")
    c.rect(18, 11, 18, 22, "b")
    c.rect(17, 17, 19, 17, "g")
    c.rect(7, 21, 8, 23, "D")
    c.rect(11, 21, 12, 23, "D")
    c.rect(6, 24, 8, 24, "K")
    c.rect(11, 24, 13, 24, "K")
    key = {"p": "wood3", "S": "sea2", "h": "parch2", "H": "steel3", "v": "night1", "e": "gold5", "F": "parch1",
           "A": "steel2", "g": "gold4", "G": "steel1", "b": "steel4", "D": "wood1", "K": "night1"}
    return c.rows(), key, pose(17, "parch1", "wood3", [(6, 12), (12, 16)], lambda x, y: x >= 19 and y >= 19,
                               lid="steel3"), \
        [[(9, 2), (10, 3)], [(7, 13), (8, 14), (8, 15)], [(12, 19), (12, 20)], [(4, 10), (5, 11)]], False


def forge_master():
    """The Forge-Master of the Inferno: bald and ash-gray, a melted forge apron dripping fire, a glowing hammer."""
    c = Canvas(20, 25)
    c.rect(15, 0, 19, 3, "H")
    c.pts([(16, 1), (17, 1)], "C")
    c.rect(17, 4, 17, 15, "p")
    c.rect(7, 1, 12, 6, "A")
    c.clear([(7, 1), (12, 1)])
    c.pts([(8, 2), (11, 2)], "d")
    c.pts([(8, 3), (11, 3)], "e")
    c.pts([(9, 5), (10, 5)], "a")
    c.rect(8, 6, 11, 7, "b")
    c.rect(3, 8, 16, 10, "A")
    c.rect(5, 8, 14, 17, "A")
    c.rect(6, 10, 13, 20, "L")
    c.pts([(6, 8), (6, 9), (13, 8), (13, 9)], "L")
    c.pts([(7, 21), (10, 21), (12, 21)], "L")
    c.pts([(6, 14), (13, 16), (9, 18), (11, 12)], "f")
    c.rect(2, 10, 4, 17, "A")
    c.rect(15, 10, 16, 15, "A")
    c.pts([(2, 18), (3, 18), (16, 16)], "A")
    c.rect(7, 21, 8, 23, "D")
    c.rect(11, 21, 12, 23, "D")
    c.rect(6, 24, 8, 24, "K")
    c.rect(11, 24, 13, 24, "K")
    key = {"H": "fire2", "C": "fire3", "p": "wood3", "A": "ash3", "d": "ash1", "e": "gold5", "a": "ink",
           "b": "ash1", "L": "wood2", "f": "fire1", "D": "wood1", "K": "night1"}
    return c.rows(), key, pose(17, "ash3", "ash2", [(6, 12), (16, 14)], lambda x, y: x >= 16 and y <= 5), \
        [[(9, 1), (10, 2)], [(6, 11), (7, 12)], [(14, 12), (14, 13)], [(11, 22), (11, 23)]], False


def corrupted_wyvern():
    """A wyvern the Unmaking has darkened: ragged wings raised like a cape, spikes, a long tail, talons."""
    c = Canvas(24, 24)
    for i in range(9):                                            # the wing bones, raised
        c.px(1 + i, 1 + i, "o", sym=True)
    for y in range(2, 13):                                        # the membranes below them
        for x in range(0, 10):
            if x < y - 1 and (x, y) not in ((2, 12), (4, 11), (6, 12), (0, 9)):
                c.px(x, y, "W", sym=True)
    c.rect(9, 0, 14, 4, "B")
    c.pts([(9, 0), (14, 0)], "x")
    c.px(11, 0, "x")
    c.pts([(10, 2), (13, 2)], "e")
    c.rect(10, 4, 13, 10, "B")
    c.pts([(11, 5), (12, 5)], "x")
    c.rect(7, 10, 16, 18, "B")
    c.rect(9, 11, 14, 17, "b")
    c.rect(7, 19, 9, 21, "B")
    c.rect(14, 19, 16, 21, "B")
    c.rect(6, 22, 9, 22, "B")
    c.rect(14, 22, 17, 22, "B")
    c.pts([(6, 23), (8, 23), (15, 23), (17, 23)], "x")
    c.pts([(17, 17), (18, 18), (19, 19), (20, 20), (21, 21), (22, 22)], "B")
    c.px(23, 22, "x")
    key = {"o": "night3", "W": "shadow1", "B": "night2", "x": "parch1", "e": "gold5", "b": "night3"}
    return c.rows(), key, pose(14, "night2", "night1", [(10, 13), (14, 16)], lambda x, y: x <= 3 and y <= 7), \
        [[(11, 1), (12, 2)], [(9, 12), (10, 13), (10, 14)], [(14, 15), (15, 16)], [(8, 20), (8, 21)],
         [(3, 6), (4, 7)]], False


CREATURES = {
    "rat": giant_rat, "goblin-scout": goblin_scout, "goblin-archer": goblin_archer,
    "banner-runner": banner_runner, "shield-bearer": shield_bearer, "beetle-guard": beetle_guard,
    "chitin-warrior": chitin_warrior, "nomad-warrior": nomad_warrior, "wraith": wraith,
    "shadow-phantom": shadow_phantom, "ashen-convert": ashen_convert, "ember-prophet": ember_prophet,
    "ember-wraith": ember_wraith, "stone-golem": stone_golem, "giant-elemental": giant_elemental,
    "khagan": khagan, "forge-master": forge_master, "corrupted-wyvern": corrupted_wyvern,
}
