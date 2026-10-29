"""Riverglass Delta (2026-10-29): seven river and marsh monsters, drawn as fill grids for 44-bestiary's kit.

Kappa, Kongamato (flier), Nixie, Jenny Greenteeth, Ahuizotl, Berberoka (mini-boss), Lernaean Hydra (boss).
Each function returns (fills, key, pose, cracks, flip); fills is [frame A, frame B] (A is the idle). Pose in image
coordinates (fill + 1 column, + 2 rows), cracks in fill coordinates. Every crack cell must be on the body in both frames.
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "44-bestiary" / "src"))
from creatures import pose  # noqa: E402  (44-bestiary's)
from kit import Canvas  # noqa: E402


def kappa():
    """Japanese river imp (regular, swarm): a teal child with a big water dish on a bowl-cut head, a gold beak, a
    brown turtle shell showing at both shoulders and a parchment belly plate. Hurt: the dish water is spilled."""
    frames = []
    for alt in (False, True):
        c = Canvas(18, 17)
        c.rect(0, 7, 3, 12, "H", sym=True)                               # a broad turtle shell behind the shoulders
        c.pts([(1, 8), (2, 8), (1, 10), (2, 10), (1, 12), (2, 12)], "J", sym=True)   # its plates
        c.rect(4, 2, 13, 7, "S")                                         # head
        c.rect(4, 2, 5, 4, "h", sym=True)                                # bowl-cut hair
        c.rect(6, 2, 11, 2, "h")
        c.rect(4, 1, 13, 1, "D")                                         # the big dish, its water brimming
        c.rect(5, 0, 12, 0, "W")
        c.rect(6, 4, 7, 4, "e")
        c.rect(10, 4, 11, 4, "e")
        c.pts([(6, 3), (7, 3), (10, 3), (11, 3)], "n")                   # a heavy brow
        c.rect(8, 5, 9, 6, "Y")                                          # a small pale beak
        c.rect(7, 5, 10, 5, "Y")
        c.pts([(8, 7), (9, 7)], "y")
        c.rect(3, 8, 14, 13, "S")                                        # body
        c.rect(6, 9, 11, 13, "b")                                        # belly plate
        c.pts([(6, 11), (7, 11), (10, 11), (11, 11), (8, 9), (9, 9)], "H")
        c.rect(3, 13, 3, 15, "S", sym=True)                              # arms and claws
        c.pts([(2, 15), (2, 16), (4, 16)], "Y", sym=True)
        c.rect(5, 14, 7, 14 if alt else 15, "S")                         # legs, the left one lifts in step B
        c.rect(10, 14, 12, 15, "S")
        c.rect(4, 15 if alt else 16, 7, 15 if alt else 16, "f")         # webbed feet
        c.rect(10, 16, 13, 16, "f")
        frames.append(c.rows())
    key = {"S": "teal2", "b": "parch2", "H": "wood2", "J": "wood4", "h": "night1", "D": "steel3", "W": "azure3",
           "e": "gold5", "Y": "parch3", "y": "parch1", "f": "teal1", "n": "ink"}
    p = pose(9, "teal2", "teal1", [(6, 11), (13, 13)], lambda x, y: y == 4 and 7 <= x <= 14)
    cracks = [[(9, 3), (9, 4), (8, 5)], [(5, 9), (5, 10), (4, 11)], [(12, 9), (12, 10), (13, 11)], [(8, 12), (8, 13)]]
    return frames, key, p, cracks, False


def _wing(c, top, bottom, bones):
    for x, t in top.items():
        c.px(x, t, "W", sym=True)
        for y in range(t + 1, bottom[x] + 1):
            c.px(x, y, "m", sym=True)
    for x in bones:
        for y in range(top[x], bottom[x] + 1):
            c.px(x, y, "W", sym=True)


def kongamato():
    """Zambian river pterosaur (regular flier): rust-red body and leathery wings on bone fingers, a tall backward
    head crest and a long beak full of white teeth. Frames: wings raised, wings swept down."""
    frames = []
    for up in (True, False):
        c = Canvas(28, 24)
        if up:
            top = {x: x for x in range(12)}
            bottom = dict(zip(range(12), (3, 7, 6, 10, 9, 12, 11, 13, 12, 14, 13, 14)))
        else:
            top = {x: 21 - x for x in range(12)}
            bottom = {x: min(23, top[x] + 4 + x + x % 2) for x in range(12)}
        _wing(c, top, bottom, (1, 3, 5, 7, 9))
        c.rect(10, 9, 15, 14, "B")                                       # body
        c.rect(11, 10, 14, 13, "b")
        c.pts([(11, 15), (11, 16), (14, 15), (14, 16)], "B")             # trailing feet
        c.pts([(11, 17), (14, 17)], "t")
        c.rect(10, 4, 15, 8, "B")                                        # head
        c.rect(5, 3, 9, 4, "C")                                          # the tall backward crest
        c.rect(7, 2, 8, 2, "C")
        c.rect(3, 4, 4, 4, "C")
        c.pts([(11, 6), (14, 6)], "e")
        c.rect(16, 6, 22, 6, "Y")                                        # long toothed beak
        c.rect(16, 7, 23, 7, "Y")
        c.rect(16, 9, 20, 9, "Y")
        c.pts([(17, 8), (19, 8), (21, 8), (23, 8)], "t")
        frames.append(c.rows())
    key = {"W": "clay3", "m": "clay1", "B": "clay2", "b": "clay3", "C": "clay3", "e": "gold5", "Y": "parch2",
           "t": "steel5"}
    p = pose(9, "clay2", "clay1", [(12, 13), (15, 13)], lambda x, y: x >= 24 and 10 <= y <= 12)
    cracks = [[(12, 4), (12, 5)], [(11, 10), (11, 11), (12, 12)], [(14, 10), (14, 11), (13, 13)], [(12, 14), (13, 14)]]
    return frames, key, p, cracks, False


def nixie():
    """German water spirit (regular, ranged): a small pale-gray figure with a big head, long wet sea-blue hair and
    a golden harp it plays to lure. Hurt: the harp breaks."""
    frames = []
    for alt in (False, True):
        c = Canvas(16, 19)
        c.rect(3, 0, 12, 2, "h")                                         # hair
        c.rect(2, 3, 3, 12, "h", sym=True)
        c.rect(4, 1, 11, 7, "S")                                         # the big head
        c.pts([(3, 4), (3, 5)], "S", sym=True)                           # pointed fin-ears
        c.rect(5, 1, 10, 1, "h")
        c.rect(5, 4, 6, 4, "e")
        c.rect(9, 4, 10, 4, "e")
        c.pts([(7, 6), (8, 6)], "n")
        c.rect(5, 8, 10, 14, "d")                                        # wet dress
        c.rect(5, 8, 10, 8, "S")
        c.pts([(5, 11), (6, 12), (9, 11), (10, 12), (7, 14), (8, 14)], "c")
        c.rect(3, 9, 4, 11, "S")                                         # arms
        c.rect(11, 9, 11, 11, "S")
        c.clear([(4, 1), (11, 1), (4, 7), (11, 7)])                      # a rounder head
        c.pts([(2, 13), (3, 14), (12, 13), (13, 14)], "h")               # wet hair ends curl out
        c.rect(12, 5, 12, 14, "G")                                       # the harp: spine, curved neck, pillar
        c.pts([(13, 5), (14, 6), (15, 7)], "G")
        c.rect(15, 8, 15, 14, "G")
        c.rect(13, 14, 14, 14, "G")
        c.rect(13, 6, 13, 13, "g")
        c.rect(14, 8, 14, 12, "g")
        c.rect(6, 15, 6, 16, "S")                                        # legs, webbed feet
        c.rect(9, 15, 9, 15 if alt else 16, "S")
        c.rect(5, 17, 7, 17, "F")
        c.rect(8, 16 if alt else 17, 10, 16 if alt else 17, "F")
        frames.append(c.rows())
    key = {"h": "sea2", "S": "steel3", "d": "sea1", "c": "sea3", "e": "gold5", "n": "ink", "G": "gold3", "g": "gold5",
           "F": "sea2"}
    p = pose(8, "steel3", "steel1", [(6, 11), (10, 14)], lambda x, y: x >= 14 and y <= 16)
    cracks = [[(7, 2), (7, 3), (8, 3)], [(6, 10), (6, 11), (7, 12)], [(9, 9), (9, 10), (8, 12)], [(7, 13), (8, 13)]]
    return frames, key, p, cracks, False


def jenny():
    """English river hag (elite brute): bright emerald skin, a dark tangle of hair hung with duckweed, a grin of
    green teeth, long clawed arms reaching out of the water she is rising from."""
    frames = []
    for alt in (False, True):
        c = Canvas(24, 24)
        d = 1 if alt else 0
        for y, x0 in ((19, 4), (20, 2), (21, 1), (22, 1), (23, 1)):      # the water, ragged at the top
            c.rect(x0, y, 23 - x0, y, "q")
        for x in range(2, 22):
            if (x + d * 2) % 5 < 2:
                c.px(x, 20, "Q")
            if (x + d * 3) % 6 < 2:
                c.px(x, 22, "Q")
        c.rect(6, 1, 17, 2, "h")                                         # a wild tangle of hair
        c.rect(5, 3, 7, 12, "h", sym=True)
        c.pts([(4, 5), (4, 6), (3, 8), (4, 9), (5, 13), (5, 14), (6, 14), (7, 15), (3, 11), (4, 12)], "h", sym=True)
        c.rect(8, 3, 15, 9, "S")                                         # head
        c.clear([(8, 3), (15, 3)])
        c.rect(7, 11, 16, 13, "S")                                       # shoulders
        c.rect(9, 10, 14, 10, "S")
        c.rect(8, 14, 15, 18, "r")                                       # rags
        c.rect(9, 5, 10, 5, "e")
        c.rect(13, 5, 14, 5, "e")
        c.pts([(9, 4), (10, 4), (13, 4), (14, 4)], "s")                  # heavy brow
        c.pts([(11, 6), (12, 6), (11, 7), (12, 7)], "s")
        c.rect(9, 8, 14, 9, "n")                                         # the grin
        c.pts([(9, 8), (11, 8), (13, 8), (10, 9), (12, 9), (14, 9)], "t")
        for k in range(7):                                               # long arms out to the water
            x, y = 6 - k, 12 + k + d
            c.px(x, y, "S", sym=True)
            c.px(x, y + 1, "S", sym=True)
        c.pts([(0, 20 + d), (0, 21 + d), (1, 21 + d), (2, 20 + d), (2, 21 + d), (0, 22 + d)], "C", sym=True)
        c.pts([(6, 1), (9, 0), (17, 2), (4, 3), (19, 4)], "w")           # duckweed
        for x, y in ((5, 19), (9, 19), (15, 19), (18, 19), (12, 19)):
            c.px(x + d, y, "w")
        frames.append(c.rows())
    key = {"h": "green1", "S": "emerald3", "s": "emerald2", "r": "green2", "e": "gold5", "n": "ink", "t": "goblin3",
           "q": "sea2", "Q": "sea3", "C": "parch3", "w": "goblin2"}
    p = pose(12, "emerald3", "emerald2", [(11, 13), (14, 16)], lambda x, y: x <= 3 and y >= 21)
    cracks = [[(12, 3), (12, 4), (11, 5)], [(9, 11), (10, 12), (10, 13)], [(14, 11), (13, 12), (13, 14)],
              [(11, 15), (11, 16), (12, 17)]]
    return frames, key, p, cracks, False


def ahuizotl():
    """Aztec water beast (elite brute): a dog-sized beast in wet, spiked black-purple fur, monkey hands, and a tail
    that rises beside it and ends in a big pale human hand. Hurt: the tail hand is lost."""
    frames = []
    for alt in (False, True):
        c = Canvas(26, 22)
        d = 1 if alt else 0
        c.rect(5, 13, 7, 18, "B", sym=True)                              # forelegs
        c.rect(4, 19, 7, 20, "k", sym=True)                              # monkey hands
        c.pts([(4, 21), (6, 21)], "k", sym=True)
        c.rect(8, 18, 9, 20 - d, "B", sym=True)                          # hind legs
        c.rect(7, 10, 18, 17, "B")                                       # body
        c.pts([(7, 8), (7, 9), (8, 9), (8, 7)], "B", sym=True)           # wet spikes
        c.rect(9, 3, 16, 9, "B")                                         # head
        c.pts([(8, 3), (8, 4), (7, 4), (7, 5), (7, 6)], "B", sym=True)     # floppy ears hang out
        c.px(11, 5, "e")
        c.px(14, 5, "e")
        c.rect(11, 7, 14, 9, "M")
        c.pts([(12, 7), (13, 7), (12, 9), (13, 9)], "n")
        c.pts([(11, 9), (14, 9)], "t")
        c.rect(19, 14, 20, 16, "B")                                      # the tail rises
        c.rect(22, 10 + d, 23, 15, "B")
        c.rect(20, 14, 22, 15, "B")
        c.rect(20, 6 + d, 25, 9 + d, "H")                                # the hand: palm, fingers apart, thumb
        c.rect(20, 3 + d, 20, 5 + d, "H")
        c.rect(22, 2 + d, 22, 5 + d, "H")
        c.rect(24, 3 + d, 24, 5 + d, "H")
        c.rect(25, 6 + d, 25, 6 + d, "H")
        c.pts([(19, 7 + d), (19, 8 + d), (18, 8 + d)], "H")
        frames.append(c.rows())
    key = {"B": "shadow2", "k": "shadow3", "M": "shadow3", "e": "gold5", "n": "ink", "t": "steel5", "H": "steel4"}
    p = pose(10, "shadow2", "shadow1", [(11, 16), (16, 13)], lambda x, y: x >= 22 and y <= 14)
    cracks = [[(12, 3), (12, 4), (13, 5)], [(9, 11), (9, 12), (10, 13), (10, 14)], [(15, 11), (15, 12), (14, 14)],
              [(12, 15), (12, 16)]]
    return frames, key, p, cracks, False


def berberoka():
    """Philippine pond-drainer (mini-boss): a huge moss-and-mud lump with two gold eyes on bulbs, reeds on its
    crown and a wide toothed mouth; the pond's water it drank floods out in front of it with stranded fish."""
    frames = []
    rows = {3: (12, 17), 4: (9, 20), 5: (7, 22), 6: (5, 24), 7: (4, 25), 8: (3, 26), 9: (3, 26), 10: (2, 27),
            11: (2, 27), 12: (2, 27), 13: (2, 27), 14: (2, 27), 15: (2, 27), 16: (2, 27), 17: (3, 26)}
    for alt in (False, True):
        c = Canvas(30, 26)
        d = 1 if alt else 0
        for y, (x0, x1) in rows.items():
            c.rect(x0, y, x1, y, "B")
        c.rect(5, 2, 9, 5, "B", sym=True)                                # eye bulbs
        c.rect(7, 2, 8, 3, "e", sym=True)
        for x, h in ((12, 3), (14, 3), (15, 3), (17, 3)):                 # reeds
            c.pts([(x + (d if x < 15 else -d), 2 - k) for k in range(h)], "r")
        c.pts([(6, 7), (7, 7), (7, 8), (22, 7), (23, 7), (22, 8), (12, 6), (13, 6), (17, 5), (18, 5), (4, 12), (25, 12)],
              "g")                                                       # moss
        c.rect(5, 11, 24, 17, "n")                                       # the wide mouth
        c.rect(8, 15, 21, 16, "q")
        for x in range(6, 24, 2):
            c.pts([(x + d, 11), (x + d, 12), (x + 1 - d, 17), (x + 1 - d, 16)], "t")
        for y, x0 in ((18, 3), (19, 2), (20, 1), (21, 1), (22, 1), (23, 1), (24, 1)):    # the flood
            c.rect(x0, y, 29 - x0, y, "q")
        for y in (19, 21, 23):
            for x in range(1, 29):
                if (x + y * 2 + d * 3) % 7 < 2:
                    c.px(x, y, "Q")
        c.pts([(6, 20), (7, 20), (8, 20), (9, 19), (9, 21), (20, 22), (21, 22), (22, 22), (23, 21), (23, 23)], "f")
        frames.append(c.rows())
    key = {"B": "wood2", "e": "gold5", "r": "goblin2", "g": "orc2", "n": "ink", "t": "parch3", "q": "sea2",
           "Q": "sea3", "f": "steel4"}
    p = pose(10, "wood2", "wood1", [(9, 11), (23, 11)], lambda x, y: y <= 6 and 13 <= x <= 19)
    cracks = [[(14, 4), (14, 5), (15, 6)], [(9, 6), (9, 7), (10, 8), (10, 9)], [(20, 6), (20, 7), (19, 8), (19, 9)],
              [(5, 9), (5, 10)], [(24, 9), (24, 10)]]
    return frames, key, p, cracks, False


def hydra():
    """Lernaean Hydra (boss): a huge marsh serpent with nine heads on long necks fanned over a low coiled body, a
    parchment belly; the middle head, the deathless one, is pale. Walk: the heads sway. Hurt: one head is cut off."""
    frames = []
    for alt in (False, True):
        c = Canvas(37, 32)
        for y, (x0, x1) in {22: (11, 25), 23: (8, 28), 24: (5, 31), 25: (3, 33), 26: (2, 34), 27: (2, 34), 28: (2, 34),
                            29: (2, 34), 30: (2, 34), 31: (3, 33)}.items():
            c.rect(x0, y, x1, y, "S")
        c.rect(15, 24, 21, 31, "b")
        for y in (26, 28, 30):
            c.rect(15, y, 21, y, "p")
        tops = {0: 1, 1: 7, 2: 3, 3: 7, 4: 3}
        for k in range(-4, 5):
            sway = 0 if k == 0 else (1 if (k + alt) % 2 == 0 else -1)
            cx, top = max(2, min(34, 18 + 4 * k + sway)), tops[abs(k)]
            hub, bot = 18 + 2 * k, top + (5 if k == 0 else 4)
            for y in range(bot, 23):
                x = round(cx + (hub - cx) * (y - bot) / (22 - bot))
                c.rect(x - 1, y, x + 1, y, "S")
            if k == 0:
                c.rect(14, top, 22, top + 4, "I")                        # the deathless head, bigger and pale
                c.pts([(15, top + 1), (16, top + 1), (20, top + 1), (21, top + 1)], "e")
                c.rect(15, top + 4, 21, top + 4, "n")
                c.pts([(15, top + 4), (17, top + 4), (19, top + 4), (21, top + 4)], "t")
                c.pts([(14, top - 1), (16, top - 1), (20, top - 1), (22, top - 1)], "I")     # a crown of horns
            else:
                c.rect(cx - 2, top, cx + 2, top + 3, "S")
                c.pts([(cx - 1, top + 1), (cx + 1, top + 1)], "e")
                c.rect(cx - 1, top + 3, cx + 1, top + 3, "n")
                c.pts([(cx - 1, top + 3), (cx + 1, top + 3)], "t")
        frames.append(c.rows())
    key = {"S": "green2", "I": "steel3", "b": "parch2", "p": "parch1", "e": "gold5", "n": "ink", "t": "steel5"}
    p = pose(22, "green2", "green1", [(13, 28), (25, 28)], lambda x, y: x >= 33 and y <= 11)
    cracks = [[(18, 2), (18, 3), (17, 4)], [(18, 9), (18, 10), (18, 11), (17, 12)], [(12, 25), (12, 26), (13, 27)],
              [(24, 25), (24, 26), (23, 27)], [(18, 16), (18, 17), (19, 18)]]
    return frames, key, p, cracks, False


CREATURES = {"kappa": kappa, "kongamato": kongamato, "nixie": nixie, "jenny-greenteeth": jenny,
             "ahuizotl": ahuizotl, "berberoka": berberoka, "hydra": hydra}
FLIERS = {"kongamato"}
RIDERS = {}
