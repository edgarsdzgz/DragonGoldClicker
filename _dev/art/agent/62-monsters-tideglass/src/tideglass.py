"""Tideglass Coast monsters (2026-10-29), drawn as fill grids for 44-bestiary's kit, built like batch 57.

Blue Man (regular), Funayurei (regular), Archelon (regular), Stymphalian Bird (flier regular), Fomorian Raider (elite),
Siren (flier elite), Nuckelavee (mini-boss) and the Kraken (boss, rising up a flooded road). Each function returns
(fills, key, pose, cracks, flip); fills is [frame A, frame B] (A is the idle). Pose in image coordinates, cracks in
fill coordinates. Every crack cell must be on the body in both frames.
"""
import math
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "44-bestiary" / "src"))
from creatures import pose as _pose  # noqa: E402  (44-bestiary's)
from kit import Canvas as _Canvas  # noqa: E402


class Canvas(_Canvas):
    """The kit's canvas, clipped to its edges, with ellipses and tapering curves."""

    def px(self, x, y, ch, sym=False):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.g[y][x] = ch
        if sym and 0 <= self.w - 1 - x < self.w and 0 <= y < self.h:
            self.g[y][self.w - 1 - x] = ch

    def ell(self, cx, cy, rx, ry, ch, sym=False):
        for y in range(math.floor(cy - ry), math.ceil(cy + ry) + 1):
            for x in range(math.floor(cx - rx), math.ceil(cx + rx) + 1):
                if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0:
                    self.px(x, y, ch, sym)

    def curve(self, p0, p1, p2, r0, r1, ch, steps=40):
        """A quadratic curve whose radius tapers from r0 to r1."""
        for i in range(steps + 1):
            t = i / steps
            x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]
            y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
            r = r0 + (r1 - r0) * t
            if r < 0.8:
                self.px(round(x), round(y), ch)
            else:
                self.ell(x, y, r, r, ch)


def pz(waist, body, dark, spots, weapon=None):
    """44-bestiary's pose with fill-grid spots (the kit wants image coordinates: +1 column, +2 rows)."""
    return _pose(waist, body, dark, [(x + 1, y + 2) for x, y in spots], weapon or (lambda x, y: False))


def blue_man():
    """Blue Man of the Minch: a blue half-figure with a gray face and streaming dark-blue hair, chest-deep in the
    waves, both long arms thrown up and out with grasping hands. Frames: the waves slide, the arms sway."""
    frames = []
    for alt in (False, True):
        c = Canvas(20, 19)
        c.ell(9.5, 4.5, 5, 4.5, "h")                                     # streaming hair
        c.pts([(3, 6), (3, 7), (4, 8), (15, 6), (16, 7), (15, 8)], "h")
        c.rect(7, 2, 12, 6, "f")                                         # the gray face
        c.pts([(8, 4), (11, 4)], "e")
        c.pts([(8, 3), (9, 3), (10, 3), (11, 3)], "n")                   # a heavy brow
        c.pts([(9, 6), (10, 6)], "n")
        c.rect(8, 7, 11, 8, "b")                                         # neck
        c.rect(4, 8, 15, 14, "b")                                        # chest and shoulders
        c.rect(9, 9, 10, 13, "d")
        d = 1 if alt else 0
        for i in range(7):                                               # long arms, thrown up and out
            c.rect(3 - i // 2 - d * (i // 4), 9 - i, 4 - i // 2, 10 - i, "b", sym=True)
        c.rect(0, 1 + d, 2, 3 + d, "f", sym=True)                        # the hands
        c.pts([(0, 0 + d), (2, 0 + d)], "f", sym=True)
        off = 3 if alt else 0
        for x in range(20):                                              # the waves: crest and dark water
            if (x + off) % 6 < 3:
                c.px(x, 12, "c")
            c.px(x, 13, "w")
            if (x + off + 2) % 6 < 2:
                c.px(x, 14, "c")
        c.rect(0, 15, 19, 18, "w")
        for x in range(20):
            if (x + off) % 5 == 0:
                c.px(x, 16, "m")
        frames.append(c.rows())
    key = {"h": "azure1", "f": "steel3", "e": "gold5", "n": "ink", "b": "azure2", "d": "azure1", "c": "azure3",
           "w": "azure1", "m": "azure2"}
    p = pz(8, "azure2", "azure1", [(6, 10), (13, 11)], lambda x, y: y <= 4 and (x <= 4 or x >= 16))
    cracks = [[(6, 9), (6, 10), (7, 11), (6, 12)], [(12, 9), (13, 10), (12, 11), (13, 12)], [(9, 8), (10, 9)]]
    return frames, key, p, cracks, False


def funayurei():
    """Funayurei: the drowned sailor's ghost in a cream burial robe and a white forehead cloth, black hair plastered
    to the face, hollow gold eyes, one long arm holding out a huge wooden ladle for the ship's bucket, and no legs,
    only a trail of sea-teal water wisps. Frames: the wisps and the ladle sway."""
    frames = []
    for alt in (False, True):
        c = Canvas(20, 25)
        s = 1 if alt else 0
        c.ell(9, 5, 4.5, 4.5, "k")                                       # black hair
        c.rect(4, 6, 6, 13 + s, "k")                                     # long wet hair down both sides
        c.rect(12, 6, 14, 13 + s, "k")
        c.rect(7, 3, 11, 8, "p")                                         # the pale face
        c.rect(7, 2, 11, 3, "t")                                         # the white forehead cloth
        c.pts([(8, 5), (10, 5)], "e")
        c.pts([(7, 5), (8, 4), (9, 4), (10, 4), (11, 5), (11, 4)], "n")  # hollow sockets
        c.pts([(9, 7), (9, 8)], "n")
        c.rect(7, 9, 11, 10, "r")                                        # neck and collar
        c.pts([(8, 9), (9, 10), (10, 9)], "n")
        c.rect(5, 10, 13, 20, "r")                                       # the robe
        for y in range(13, 22):                                          # the robe flares and trails off
            c.rect(5 - (y - 13) // 4, y, 13 + (y - 13) // 4, y, "r")
        c.pts([(9, 11), (9, 12), (9, 13), (9, 14), (9, 15)], "q")        # robe fold
        c.rect(3, 12, 4, 17 + s, "r")                                    # the left sleeve hangs
        c.rect(2, 18 + s, 4, 19 + s, "p")                                # its hand
        for i in range(4):                                               # the right arm lifts the ladle
            c.rect(14 + i, 12 - i, 15 + i, 13 - i, "r")
        c.rect(18, 8 - s, 19, 9 - s, "p")                                # the hand
        c.rect(18, 5 - s, 18, 9 - s, "w")                                # the long handle
        c.ell(17, 2.5 - s, 2.8, 2.5, "l")                                # the ladle: a round bowl, hollow
        c.ell(17, 2.5 - s, 1.6, 1.4, "o")
        c.pts([(17, 5 - s), (18, 5 - s)], "w")
        for y in range(21, 25):                                          # sea-teal wisps in place of legs
            for x in range(4, 16):
                if (x * 3 + y * 5 + (4 if alt else 0)) % 7 < 4 - (y - 21) // 2 and 5 - (y - 21) <= x <= 14 + (y - 21):
                    c.px(x, y, "g" if (x + y) % 3 else "G")
        c.pts([(2, 21), (16, 23), (3, 24)], "G")
        frames.append(c.rows())
    key = {"k": "night1", "p": "parch3", "t": "steel5", "e": "gold5", "n": "ink", "r": "parch3", "q": "parch2",
           "w": "wood3", "l": "wood2", "o": "wood1", "g": "teal2", "G": "teal3"}
    p = pz(11, "parch3", "parch2", [(7, 13), (11, 16)], lambda x, y: x >= 16 and y <= 6)
    cracks = [[(7, 12), (7, 13), (8, 14), (7, 16)], [(11, 12), (11, 13), (12, 15), (11, 17)], [(9, 3), (9, 4)]]
    return frames, key, p, cracks, False


def archelon():
    """Archelon: a giant sea turtle seen from the front, a broad green dome shell cut into plates and rimmed in
    sandy leather, a hooked beak and gold eyes on a big head, broad flippers out to both sides. The shield of the
    Land. Frames: the flippers beat."""
    frames = []
    for alt in (False, True):
        c = Canvas(26, 21)
        f = 1 if alt else 0
        c.ell(13, 8, 11, 8, "r")                                         # the sandy shell rim
        c.ell(13, 7.5, 9.5, 6.5, "s")                                    # the dome
        for y in range(1, 15):                                           # plates cut by dark lines
            for x in range(3, 24):
                if c.g[y][x] == "s" and (x % 6 == 1 or (y + 3 * (x // 6)) % 5 == 0):
                    c.g[y][x] = "l"
        c.rect(12, 1, 14, 14, "k")                                       # the ridge
        c.ell(13, 14, 5, 4, "h")                                       # the head, low in front
        c.ell(13, 17, 2.5, 2, "h")
        c.pts([(12, 19), (13, 19), (14, 19), (13, 20)], "Y")             # the hooked beak
        c.pts([(11, 13), (15, 13)], "e")
        c.pts([(10, 12), (11, 12), (15, 12), (16, 12)], "n")             # a heavy brow
        c.ell(3, 13 + f, 3.2, 2.2, "h", sym=True)                        # front flippers
        c.pts([(0, 15 + f), (1, 16 + f), (0, 16 + f), (1, 17 + f)], "h", sym=True)
        c.ell(6, 18, 2, 1.5, "h", sym=True)                              # the hind flippers
        frames.append(c.rows())
    key = {"r": "parch1", "s": "green2", "l": "green1", "k": "green3", "h": "parch2", "e": "gold5", "n": "ink",
           "Y": "gold3"}
    p = pz(11, "green2", "green1", [(6, 5), (18, 7)])
    cracks = [[(8, 3), (8, 4), (9, 5), (9, 7)], [(17, 3), (18, 4), (17, 6), (18, 8)], [(12, 10), (13, 11)]]
    return frames, key, p, cracks, False


def stymphalian():
    """Stymphalian Bird: a bronze bird of prey facing front, a steel hooked beak, gold eyes under a hard brow,
    wings raised in a V (then swept down) whose feathers end in steel arrowheads, and steel talons. Flier."""
    frames = []
    for up in (True, False):
        c = Canvas(24, 19)
        if up:
            for i in range(5):                                           # the wing: a thick arm and long feathers
                c.rect(7 - i, 8 - i, 8 - i, 9 - i, "w", sym=True)
            for k, (x0, y0) in enumerate(((0, 1), (1, 2), (3, 3), (5, 4))):
                c.rect(x0, y0, x0, y0 + 5 - k, "a", sym=True)            # feather spikes, steel at the tips
                c.px(x0, y0 - 1, "S", sym=True)
                c.px(x0, y0, "S", sym=True)
            c.rect(2, 4, 8, 9, "w", sym=True)
        else:
            for i in range(5):
                c.rect(7 - i, 10 + i, 8 - i, 11 + i, "w", sym=True)
            for k, (x0, y0) in enumerate(((0, 17), (1, 15), (3, 14), (5, 13))):
                c.rect(x0, y0 - 4 + k, x0, y0, "a", sym=True)
                c.px(x0, y0, "S", sym=True)
            c.rect(2, 9, 8, 12, "w", sym=True)
        c.ell(11.5, 11, 4, 5.5, "b")                                     # the body
        c.rect(10, 9, 13, 14, "a")                                       # a lighter breast
        c.ell(11.5, 4.5, 3.5, 3.5, "b")                                  # the head
        c.pts([(9, 4), (14, 4)], "e")
        c.pts([(8, 3), (9, 3), (10, 3), (13, 3), (14, 3), (15, 3)], "n")  # hard brow
        c.pts([(11, 5), (12, 5), (11, 6), (12, 6), (11, 7), (12, 8)], "S")   # the hooked steel beak
        c.pts([(10, 16), (10, 17), (9, 18), (13, 16), (13, 17), (14, 18)], "S")   # talons
        c.pts([(11, 16), (12, 16), (11, 17), (12, 17)], "b")
        frames.append(c.rows())
    key = {"w": "gold1", "a": "gold2", "b": "clay3", "S": "steel4", "e": "gold5", "n": "ink"}
    p = pz(9, "clay3", "clay2", [(11, 11), (13, 14)], lambda x, y: y <= 8 and (x <= 4 or x >= 21))
    cracks = [[(10, 8), (11, 9), (11, 11), (11, 13)], [(13, 8), (12, 10)], [(5, 9), (6, 9)]]
    return frames, key, p, cracks, False


def fomorian():
    """Fomorian Raider (v2): a generic sea-raider giant, upright and deliberately lopsided: a goat's head with curling
    horns, one huge shoulder and arm hauling a rusted anchor, one small withered arm, one thick leg and one thin peg
    leg, kelp rags. Never a named figure. Frames: the legs swap, the anchor swings."""
    frames = []
    for alt in (False, True):
        c = Canvas(30, 32)
        s = 1 if alt else 0
        c.ell(13, 5, 4.5, 4.5, "g")                                      # the goat's head
        c.rect(11, 8, 15, 11, "g")                                       # long muzzle
        c.pts([(13, 12), (13, 13), (12, 13), (14, 13)], "B")             # beard
        c.pts([(10, 4), (16, 4)], "e")
        c.pts([(9, 3), (10, 3), (11, 3), (15, 3), (16, 3), (17, 3)], "n")
        c.pts([(12, 11), (14, 11), (12, 9), (14, 9)], "n")
        c.pts([(9, 2), (8, 1), (7, 0), (6, 0), (5, 1), (5, 2), (6, 3), (7, 3)], "H")   # curling horns
        c.pts([(17, 2), (18, 1), (19, 0), (20, 0), (21, 1), (21, 2), (20, 3), (19, 3)], "H")
        c.rect(10, 12, 16, 13, "g")                                      # neck
        for y in range(13, 22):                                          # wide shoulders, tapering to a narrow waist
            x0 = 3 if y < 16 else 3 + (y - 15)
            x1 = 26 if y < 16 else 26 - (y - 15)
            c.rect(x0, y, x1, y, "g")
        c.rect(10, 15, 20, 20, "p")                                      # pale belly
        c.rect(0, 14, 3, 18, "g")                                        # the small left arm
        c.rect(0, 19, 2, 20, "p")
        c.rect(23, 16, 27, 25, "g")                                      # the huge right arm
        c.rect(23, 26 - s, 27, 27 - s, "p")                              # fist
        c.rect(25, 17 - s, 26, 29 - s, "w")                              # the anchor's rope-wrapped shaft
        c.rect(21, 17 - s, 29, 18 - s, "i")                              # crossbar
        c.rect(24, 15 - s, 27, 16 - s, "i")                              # ring
        c.pts([(21, 28 - s), (22, 29 - s), (23, 30 - s), (24, 30 - s), (27, 30 - s), (28, 30 - s), (29, 29 - s),
               (29, 28 - s)], "i")
        c.rect(7, 21, 20, 23, "k")                                       # kelp rags
        for x in range(8, 20, 3):
            c.rect(x, 24, x, 25 + (x // 3 + s) % 2, "k")
        c.rect(14, 22, 20, 29 - s, "g")                                  # the thick leg
        c.rect(12, 30 - s, 21, 31 - s, "g")
        c.rect(8, 24, 10, 27 + s, "g")                                   # the thin leg
        c.rect(9, 28 + s, 9, 31, "w")                                    # ending in a peg
        frames.append(c.rows())
    key = {"g": "steel2", "p": "steel3", "B": "parch3", "H": "parch3", "e": "gold5", "n": "ink", "w": "wood3",
           "i": "clay1", "k": "green1"}
    p = pz(15, "steel2", "steel1", [(13, 7), (8, 15), (13, 18), (17, 26)], lambda x, y: x >= 22 and y >= 15)
    cracks = [[(12, 3), (12, 5), (13, 7)], [(7, 14), (8, 15), (8, 17)], [(24, 18), (24, 20), (25, 22)],
              [(16, 24), (16, 26), (17, 28)]]
    return frames, key, p, cracks, False


def siren():
    """Siren: a bird-woman, a pale face with an open singing mouth and long dark hair on a feathered green breast,
    huge green wings in a V (then swept down) with pale tips, taloned legs and a feather fan. Flier."""
    frames = []
    for up in (True, False):
        c = Canvas(28, 26)
        if up:
            for i in range(8):
                c.rect(9 - i, 11 - i, 10 - i, 12 - i, "w", sym=True)
            for k, (x0, y0) in enumerate(((0, 0), (2, 1), (4, 2), (6, 4))):
                c.rect(x0, y0, x0, y0 + 7 - k, "w", sym=True)
                c.px(x0, y0, "T", sym=True)
            c.rect(3, 2, 9, 11, "w", sym=True)
            c.pts([(1, 8), (3, 9), (5, 10)], "W", sym=True)
        else:
            for i in range(8):
                c.rect(9 - i, 11 + i, 10 - i, 12 + i, "w", sym=True)
            for k, (x0, y0) in enumerate(((0, 25), (2, 23), (4, 22), (6, 20))):
                c.rect(x0, y0 - 7 + k, x0, y0, "w", sym=True)
                c.px(x0, y0, "T", sym=True)
            c.rect(3, 11, 9, 20, "w", sym=True)
            c.pts([(1, 18), (3, 17), (5, 16)], "W", sym=True)
        c.ell(13.5, 12, 4.5, 6.5, "b")                                   # the feathered breast
        for y in range(8, 20, 2):
            c.pts([(11, y), (13, y + 1), (15, y)], "W")
        c.ell(13.5, 5, 4.5, 4.5, "H")                                    # long dark hair
        c.rect(9, 6, 10, 14, "H")
        c.rect(17, 6, 18, 14, "H")
        c.rect(11, 3, 16, 8, "f")                                        # the pale face
        c.pts([(12, 5), (15, 5)], "e")
        c.pts([(11, 4), (12, 4), (15, 4), (16, 4)], "n")
        c.rect(13, 7, 14, 8, "n")                                        # an open singing mouth
        c.pts([(12, 19), (12, 20), (11, 21), (15, 19), (15, 20), (16, 21)], "T")   # legs and talons
        c.pts([(10, 22), (11, 22), (16, 22), (17, 22)], "T")
        c.rect(12, 21, 15, 24, "w")                                      # a feather fan
        c.pts([(11, 23), (16, 23), (13, 25), (14, 25)], "W")
        frames.append(c.rows())
    key = {"w": "emerald1", "W": "emerald3", "b": "emerald2", "T": "steel4", "H": "night1", "f": "steel5",
           "e": "gold5", "n": "ink"}
    p = pz(9, "emerald2", "emerald1", [(13, 12), (14, 16)], lambda x, y: y <= 10 and (x <= 5 or x >= 22))
    cracks = [[(12, 11), (12, 13), (13, 15)], [(15, 11), (15, 13), (14, 16)], [(13, 17), (13, 18)]]
    return frames, key, p, cracks, False


def nuckelavee():
    """Nuckelavee (v2): a skinless horse-demon with a man's torso grown from its back, seen in profile facing the gate
    like a centaur. Raw clay-orange muscle striped with pale sinew; a long horse head lowered at the left with one
    gold eye and flared nostrils, finned legs, a rider with a huge head, one great gold eye and arms that reach the
    ground. Frames: the arms sway, the legs step."""
    frames = []
    for alt in (False, True):
        c = Canvas(34, 30)
        s = 1 if alt else 0
        c.ell(21, 20, 10, 5, "m")                                        # the horse's body
        c.curve((12, 20), (9, 15), (6, 17), 3.0, 3.4, "m", 20)           # arched neck
        c.rect(2, 16, 9, 21, "m")                                        # the long skinless horse head
        c.rect(0, 19, 3, 22, "m")                                        # muzzle
        c.pts([(1, 20), (1, 21)], "n")                                   # flared nostrils
        c.pts([(6, 17)], "e")                                            # its gold eye
        c.pts([(6, 14), (7, 13), (7, 14), (8, 14), (8, 13)], "m")        # ears
        c.pts([(10, 16), (11, 15), (12, 15), (10, 17), (11, 17)], "t")   # mane
        for x in (5, 16, 24):
            c.rect(x, 17, x, 20 if x < 9 else 23, "t")                   # sinew bands
        for lx, ly in ((12, 0), (17, 1), (24, s), (29, 1 - s)):          # four finned legs
            c.rect(lx, 24, lx + 2, 28 - ly, "m")
            c.rect(lx - 1, 28 - ly, lx + 3, 29 - ly, "t")
        c.curve((30, 18), (33, 20), (33, 26), 1.6, 0.8, "t", 12)         # a thin pale tail
        c.rect(19, 9, 26, 17, "m")                                       # the rider's torso grown from the back
        for x in (21, 24):
            c.rect(x, 10, x, 17, "t")
        c.ell(22, 5, 5.5, 4.5, "m")                                      # the huge head
        c.rect(19, 8, 25, 9, "m")
        c.rect(20, 3, 24, 6, "e")                                        # one great gold eye
        c.rect(21, 4, 23, 5, "n")
        c.rect(22, 4, 22, 4, "e")
        c.pts([(20, 8), (24, 8)], "n")
        c.curve((19, 12), (13, 15 + s), (12, 25 - s), 2.0, 1.0, "m", 26)  # the long arms to the ground
        c.curve((26, 12), (31, 14 - s), (31, 23 + s), 2.0, 1.0, "m", 26)
        c.pts([(11, 26 - s), (12, 27 - s), (13, 26 - s), (30, 24 + s), (31, 25 + s), (32, 24 + s)], "t")   # claws
        frames.append(c.rows())
    key = {"m": "clay2", "t": "parch3", "e": "gold5", "n": "ink"}
    p = pz(14, "clay2", "clay1", [(21, 12), (14, 20), (22, 21), (6, 19)])
    cracks = [[(20, 10), (20, 12), (21, 14)], [(25, 10), (24, 12), (25, 15)], [(16, 19), (17, 21)],
              [(23, 19), (24, 21), (24, 22)], [(5, 17), (5, 19)]]
    return frames, key, p, cracks, False


def kraken():
    """The Kraken, rising up a flooded stretch of road: a vast dark-green mantle with fins, one great gold eye
    with a slit pupil lifting out of black water, and tentacles reaching ahead (to the left, toward the gate)
    with pale suckers, the road's cobbles showing under the flood. Frames: the tentacles writhe."""
    frames = []
    for alt in (False, True):
        c = Canvas(46, 34)
        s = 1 if alt else 0
        c.ell(27, 14, 12, 12, "m")                                       # the mantle
        c.ell(27, 4, 11, 3, "m")
        c.pts([(18, 4), (17, 1), (18, 2), (20, 3), (24, 0), (25, 3)], "n")   # fin spikes
        c.ell(27, 15, 8, 6, "M")                                         # lighter crown scales
        for x, y in ((22, 6), (27, 5), (32, 6), (20, 10), (34, 10)):
            c.rect(x, y, x + 1, y + 1, "L")
        c.ell(27, 17, 6, 5, "E")                                         # the great eye
        c.rect(26, 13, 28, 21, "N")                                      # slit pupil
        c.pts([(21, 11), (22, 11), (23, 11), (31, 11), (32, 11), (33, 11)], "N")   # heavy brow
        left = [((16, 22), (6 + s * 2, 16), (0, 24 - s * 3), 3.4, 1.0),
                ((18, 25), (8 - s * 2, 28), (0, 31 - s), 3.2, 1.0),
                ((20, 24), (11, 21 + s * 2), (4, 11 - s * 3), 3.0, 1.0)]
        right = [((38, 22), (45, 17 + s * 2), (43, 8 - s * 2), 3.2, 1.0),
                 ((36, 25), (44, 29 - s), (45, 22), 3.0, 1.0)]
        for a, b, d, r0, r1 in left + right:
            c.curve(a, b, d, r0, r1, "m")
        for a, b, d, r0, r1 in left + right:                             # pale suckers along each arm
            for t in (0.3, 0.5, 0.7, 0.9):
                x = (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * b[0] + t * t * d[0]
                y = (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * b[1] + t * t * d[1]
                c.px(round(x), round(y + 1), "u")
        for y in range(26, 34):                                          # the flood: black water over the road
            for x in range(46):
                c.px(x, y, "w")
        for x in range(46):
            if (x + (4 if alt else 0)) % 8 < 3:
                c.px(x, 26, "c")
            if (x + (4 if alt else 0) + 4) % 9 < 2:
                c.px(x, 29, "c")
        for x0 in range(2, 44, 11):                                      # cobbles of the road, under the water
            c.rect(x0, 32, x0 + 4, 33, "R")
        frames.append(c.rows())
    key = {"m": "sea1", "M": "sea2", "L": "sea3", "n": "sea2", "E": "gold5", "N": "ink", "u": "parch3",
           "w": "azure1", "c": "azure2", "R": "parch1"}
    p = pz(14, "sea1", "sea1", [(26, 10), (30, 9)])
    cracks = [[(21, 8), (22, 9), (22, 11)], [(33, 8), (32, 10), (33, 12)], [(20, 17), (20, 19), (21, 21)],
              [(34, 16), (35, 18), (34, 20)], [(26, 22), (27, 23)]]
    return frames, key, p, cracks, False


CREATURES = {"blue-man": blue_man, "funayurei": funayurei, "archelon": archelon, "stymphalian": stymphalian,
             "fomorian": fomorian, "siren": siren, "nuckelavee": nuckelavee, "kraken": kraken}
FLIERS = {"stymphalian", "siren"}
RIDERS = {}
