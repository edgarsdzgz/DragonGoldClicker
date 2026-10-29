"""Riverglass v2 redraws (2026-10-29): the Nixie and the Lernaean Hydra. The v1 versions stay in riverglass.py."""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "44-bestiary" / "src"))
from creatures import pose  # noqa: E402  (44-bestiary's)
from kit import Canvas  # noqa: E402

W = 40


def nixie():
    """German water spirit v2 (regular, ranged): a slender pale blue-green figure waist-deep in a small pool, long wet
    green hair falling over the shoulders, gold eyes, and a small gold harp held slanted against the chest (a curved
    frame with a pillar and string lines). Hurt: the harp's top breaks off."""
    frames = []
    for alt in (False, True):
        d = 1 if alt else 0
        c = Canvas(16, 18)
        c.rect(4, 0, 11, 1, "h")                                         # hair crown
        c.rect(3, 1, 4, 8, "h", sym=True)                                # hair framing the head
        c.rect(2, 9, 4, 12, "h", sym=True)                               # and over the shoulders
        c.pts([(2, 13), (3, 13), (13, 13), (12, 13), (1, 11 + d), (14, 11 + d)], "h")
        c.rect(5, 1, 10, 6, "S")                                         # the head
        c.clear([(5, 1), (10, 1), (5, 6), (10, 6)])
        c.pts([(6, 3), (9, 3)], "e")
        c.pts([(7, 5), (8, 5)], "s")
        c.rect(7, 7, 8, 7, "S")                                          # neck
        c.rect(5, 8, 10, 8, "S")                                         # shoulders
        c.rect(6, 9, 9, 12, "S")                                         # slender body
        c.rect(5, 9, 5, 11, "S")                                         # arms
        c.rect(10, 9, 10, 10, "S")
        for x in range(5, 11):                                           # the harp's curved frame, slanted
            c.px(x, 12 - (x - 5), "G")
        c.rect(10, 7, 10, 12, "G")
        c.rect(5, 12, 9, 12, "G")
        c.rect(7, 11, 7, 11, "g")                                        # strings
        c.rect(8, 10, 8, 11, "g")
        c.rect(9, 9, 9, 11, "g")
        c.rect(5, 13, 10, 13, "q")                                       # the pool, waist-deep
        for y, x0 in ((13, 3), (14, 2), (15, 0), (16, 0), (17, 0)):
            c.rect(x0, y, 15 - x0, y, "q")
        for y in (14, 16):
            for x in range(0, 16):
                if (x + y * 2 + d * 3) % 5 < 2 and c.g[y][x] == "q":
                    c.px(x, y, "Q")
        frames.append(c.rows())
    key = {"h": "emerald2", "S": "sea3", "s": "sea2", "e": "gold5", "G": "gold3", "g": "gold5", "q": "sea2",
           "Q": "sea3"}
    p = pose(7, "sea3", "sea2", [(8, 11), (7, 13)], lambda x, y: x == 11 and y <= 11)
    cracks = [[(7, 1), (7, 2), (8, 3)], [(7, 9), (7, 10), (8, 11)], [(3, 5), (3, 6), (4, 7)], [(12, 4), (12, 5)]]
    return frames, key, p, cracks, False


def _curve(p0, p1, p2, n=70):
    for i in range(n + 1):
        t = i / n
        yield (round((1 - t) ** 2 * p0[0] + 2 * t * (1 - t) * p1[0] + t * t * p2[0]),
               round((1 - t) ** 2 * p0[1] + 2 * t * (1 - t) * p1[1] + t * t * p2[1]), i)


def hydra():
    """Lernaean Hydra v2 (boss): a low, wide coiled body under five big heads on long curving necks: the huge pale
    middle head with white horns, two heads arching out to the sides, two curling forward over the belly. The necks
    sway in turn. Hurt: the left arching head is cut off."""
    frames = []
    for alt in (False, True):
        c = Canvas(W, 34)
        for y, x0 in {26: 11, 27: 7, 28: 4, 29: 2, 30: 1, 31: 1, 32: 1, 33: 2}.items():
            c.rect(x0, y, W - 1 - x0, y, "S")
        c.rect(15, 28, 24, 33, "b")
        for y in (29, 31, 33):
            c.rect(15, y, 24, y, "p")

        def stamp(side, x, y, w):
            x0, x1 = (x, x + w - 1) if side < 0 else (W - 1 - (x + w - 1), W - 1 - x)
            c.rect(x0, y, x1, y + 1, "S")

        def px(side, x, y, ch):
            c.px(x if side < 0 else W - 1 - x, y, ch)

        for side in (-1, 1):
            ph = 1 if (alt if side < 0 else not alt) else 0
            a_end = (8 + ph, 3)                                          # the arching head, neck rising and bending out
            for x, y, i in _curve((16, 26), (13 + 3 * ph, 4), a_end):
                stamp(side, x, y, 4 if i < 50 else 3)
            c_end = (9 + ph, 22)                                         # the head that curls forward
            for x, y, i in _curve((14, 26), (-4 + 4 * ph, 16), c_end):
                stamp(side, x, y, 4 if i < 50 else 3)
            ex, ey = a_end                                               # the arching head in profile, facing out
            for dy, x0, x1 in ((0, 0, 6), (1, 0, 7), (2, 0, 7), (4, 0, 5)):
                for dx in range(x0, x1 + 1):
                    px(side, ex - dx, ey + dy, "S")
            for dx in range(3, 8):
                px(side, ex - dx, ey + 3, "n")
            for dx in range(0, 3):
                px(side, ex - dx, ey + 3, "S")
            for dx in (4, 6):
                px(side, ex - dx, ey + 3, "t")
            for dx in (2, 3):
                px(side, ex - dx, ey + 1, "e")
            ex, ey = c_end                                               # the forward head, front-on
            for dx in range(-3, 4):
                for dy in range(0, 5):
                    px(side, ex + dx, ey + dy, "S")
            for dx in (-2, 2):
                px(side, ex + dx, ey + 1, "e")
            for dx in range(-2, 3):
                px(side, ex + dx, ey + 3, "n")
            for dx in (-2, 0, 2):
                px(side, ex + dx, ey + 3, "t")
        sw = 5 if alt else -1                                            # the middle neck, an S, and its huge head
        for x, y, i in _curve((19, 26), (24 + sw, 16), (19, 9)):
            c.rect(x - 1, y, x + 2, y + 1, "S")
        c.rect(15, 3, 24, 6, "I")
        c.rect(16, 7, 23, 7, "n")
        c.rect(17, 8, 22, 8, "I")
        c.pts([(16, 7), (18, 7), (21, 7), (23, 7)], "t")
        c.pts([(16, 4), (17, 4), (22, 4), (23, 4)], "e")
        c.pts([(15, 2), (15, 1), (15, 0), (24, 2), (24, 1), (24, 0), (17, 2), (17, 1), (22, 2), (22, 1)], "H")
        frames.append(c.rows())
    key = {"S": "green2", "I": "steel3", "H": "steel5", "b": "parch2", "p": "parch1", "e": "gold5", "n": "ink",
           "t": "steel5"}
    p = pose(26, "green2", "green1", [(9, 31), (32, 31)], lambda x, y: x <= 10 and y <= 13)
    cracks = [[(19, 3), (19, 4), (18, 5)], [(8, 29), (8, 30), (9, 31)], [(31, 29), (31, 30), (30, 31)],
              [(19, 29), (19, 30), (20, 31)], [(12, 28), (12, 29)], [(27, 28), (27, 29)]]
    return frames, key, p, cracks, False
