"""Hero dragon studies: a small shading engine plus five poses in four palettes.

Usage: herostudy.py <outdir>. Prints each sprite's grid size and colour count.
"""
import json
import os
import sys

from PIL import Image, ImageDraw

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]

# material codes
BODY, BELLY, MEMB, BONE, MEMB_FAR, EYE, FIRE, BODY_DK, IRIS, PUPIL, SHINE = range(1, 12)
FLAT = {EYE, FIRE, PUPIL, SHINE}


class Sprite:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.lab = Image.new("L", (w, h), 0)
        self.d = ImageDraw.Draw(self.lab)

    def poly(self, code, pts):
        self.d.polygon(pts, fill=code)

    def ell(self, code, box):
        self.d.ellipse(box, fill=code)

    def line(self, code, pts, w=1):
        self.d.line(pts, fill=code, width=w)

    def pts(self, code, pts):
        for p in pts:
            self.d.point(p, fill=code)

    def rect(self, code, box):
        self.d.rectangle(box, fill=code)

    def temp(self):
        return Sprite(self.w, self.h)

    def stamp(self, other, under=False):
        src, dst = other.lab.load(), self.lab.load()
        for y in range(self.h):
            for x in range(self.w):
                if src[x, y] and (not under or dst[x, y] == 0):
                    dst[x, y] = src[x, y]

    def mirror(self):
        half = self.w // 2
        left = self.lab.crop((0, 0, half, self.h))
        self.lab.paste(left.transpose(Image.FLIP_LEFT_RIGHT), (self.w - half, 0))
        self.d = ImageDraw.Draw(self.lab)


def darker(ramp):
    first = tuple(int(c * 0.65) for c in ramp[0])
    return [first] + ramp[:4]


def render(sp, pal, rim=True, bg=None):
    w, h = sp.w, sp.h
    lab = sp.lab.load()
    ramps = {BODY: pal["body"], BELLY: pal["belly"], MEMB: pal["memb"], BONE: pal["bone"],
             MEMB_FAR: darker(pal["memb"]), BODY_DK: darker(pal["body"]), IRIS: pal["iris"]}
    flat = {EYE: pal["eye"], FIRE: pal["fire"], PUPIL: (16, 6, 10), SHINE: (255, 250, 235)}
    img = bg.copy() if bg else Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = img.load()

    def code_at(x, y):
        return lab[x, y] if 0 <= x < w and 0 <= y < h else 0

    for y in range(h):
        for x in range(w):
            c = lab[x, y]
            if not c:
                continue
            if c in FLAT:
                px[x, y] = flat[c] + (255,)
                continue
            lit = sum(1 for k in (1, 2, 3) if code_at(x - k, y - k) != c) + sum(1 for k in (1, 2) if code_at(x, y - k) != c)
            shd = sum(1 for k in (1, 2, 3) if code_at(x + k, y + k) != c) + sum(1 for k in (1, 2) if code_at(x, y + k) != c)
            v = 2 + 0.55 * lit - 0.55 * shd
            if c in (BODY, BODY_DK) and y % 3 == 2 and (x + (y // 3) % 2 * 2) % 4 == 0:
                v -= 0.9  # scale arcs
            if c == BELLY and y % 4 == 0:
                v -= 0.8  # belly plates
            idx = int(v + (BAYER[y % 4][x % 4] + 0.5) / 16 - 0.5)
            col = ramps[c][max(0, min(4, idx))]
            if rim and code_at(x + 1, y) == 0 and lit <= 2:
                col = pal["rim"]
            px[x, y] = col + (255,)
    # outlines tinted by the material they wrap
    out = img.copy()
    po = out.load()
    for y in range(h):
        for x in range(w):
            if lab[x, y]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                n = code_at(x + dx, y + dy)
                if n:
                    base = ramps.get(n, [pal["ink"]])[0]
                    po[x, y] = tuple(int(c * 0.45) for c in base) + (255,)
                    break
    return out


def bg_tile(w, h, c0, c1, speck):
    img = Image.new("RGBA", (w, h))
    px = img.load()
    for y in range(h):
        for x in range(w):
            t = (x + (h - y)) / (w + h)
            px[x, y] = (c1 if t * 16 > BAYER[y % 4][x % 4] + 4 else c0) + (255,)
    d = ImageDraw.Draw(img)
    for i, (x, y) in enumerate([(6, 8), (50, 6), (56, 40), (10, 50), (30, 4), (44, 54), (3, 30)]):
        s = 2 if i % 2 else 1
        d.rectangle([x, y, x + s, y + s], fill=speck + (255,))
    return img


# ---------------------------------------------------------------- palettes
PALETTES = {
    "ember": {
        "label": "Ember Sentinel",
        "body": [(64, 12, 18), (112, 24, 26), (162, 40, 32), (208, 72, 44), (240, 122, 72)],
        "belly": [(120, 70, 24), (176, 112, 40), (224, 160, 64), (246, 200, 104), (255, 234, 170)],
        "memb": [(80, 24, 20), (132, 48, 26), (188, 86, 36), (228, 132, 58), (250, 178, 92)],
        "bone": [(110, 90, 70), (160, 140, 104), (206, 190, 150), (236, 224, 190), (255, 250, 230)],
        "iris": [(120, 40, 10), (190, 90, 20), (240, 150, 40), (255, 200, 80), (255, 240, 170)],
        "eye": (255, 210, 80), "fire": (255, 150, 50), "rim": (255, 176, 84), "ink": (24, 8, 12),
        "bg": ((26, 10, 14), (60, 18, 20), (140, 50, 30)),
    },
    "azure": {
        "label": "Azure Stormwing",
        "body": [(14, 24, 60), (26, 50, 112), (40, 88, 172), (70, 132, 212), (132, 192, 242)],
        "belly": [(40, 90, 120), (70, 140, 172), (110, 190, 212), (162, 226, 238), (222, 250, 255)],
        "memb": [(70, 10, 20), (122, 20, 30), (172, 36, 40), (212, 72, 60), (242, 122, 92)],
        "bone": [(110, 70, 20), (170, 120, 30), (220, 170, 50), (246, 210, 100), (255, 240, 170)],
        "iris": [(120, 40, 10), (190, 90, 20), (240, 150, 40), (255, 200, 80), (255, 240, 170)],
        "eye": (255, 214, 90), "fire": (170, 230, 255), "rim": (120, 224, 255), "ink": (8, 12, 30),
        "bg": ((10, 16, 40), (24, 40, 90), (80, 150, 230)),
    },
    "obsidian": {
        "label": "Obsidian Nightwing",
        "body": [(8, 8, 16), (18, 18, 34), (34, 34, 58), (54, 56, 92), (88, 98, 142)],
        "belly": [(20, 30, 70), (30, 62, 132), (42, 102, 192), (72, 152, 232), (152, 212, 255)],
        "memb": [(16, 10, 30), (36, 20, 62), (62, 36, 104), (98, 62, 152), (142, 102, 202)],
        "bone": [(60, 60, 80), (110, 110, 140), (170, 170, 200), (212, 216, 238), (246, 248, 255)],
        "iris": [(90, 0, 60), (160, 20, 110), (230, 60, 180), (255, 130, 220), (255, 210, 245)],
        "eye": (255, 70, 200), "fire": (196, 100, 255), "rim": (96, 206, 255), "ink": (4, 4, 10),
        "bg": ((20, 10, 40), (50, 24, 90), (120, 60, 200)),
    },
    "verdant": {
        "label": "Verdant Wyrm",
        "body": [(10, 40, 40), (18, 72, 70), (30, 112, 104), (56, 152, 140), (112, 202, 182)],
        "belly": [(70, 70, 30), (120, 120, 50), (172, 170, 80), (212, 206, 120), (242, 236, 180)],
        "memb": [(110, 80, 20), (172, 132, 40), (222, 182, 70), (246, 222, 122), (255, 246, 200)],
        "bone": [(100, 96, 80), (156, 150, 120), (206, 200, 170), (234, 230, 206), (252, 250, 240)],
        "iris": [(110, 10, 10), (180, 30, 20), (236, 70, 40), (255, 130, 80), (255, 210, 170)],
        "eye": (255, 90, 60), "fire": (255, 130, 60), "rim": (182, 255, 142), "ink": (6, 20, 18),
        "bg": ((6, 24, 20), (16, 60, 44), (60, 160, 110)),
    },
}


def s(pts, k=1.2, w=96):
    return [(min(w - 1, round(x * k)), round(y * k)) for x, y in pts]


# ---------------------------------------------------------------- pose A: the rearing sentinel (side view)
def pose_rearing():
    sp = Sprite(96, 88)
    far = sp.temp()
    far.poly(MEMB_FAR, s([(46, 34), (50, 6), (42, 1), (58, 0), (65, 7), (62, 18), (56, 28)]))
    far.ell(0, s([(58, 14), (66, 22)]))
    for tip in [(42, 1), (58, 0), (65, 7)]:
        far.line(BONE, s([(50, 6), tip]), 1)
    sp.stamp(far)
    tail = sp.temp()
    tail.line(BODY, s([(64, 60), (72, 66), (78, 63), (79, 58)]), 5)
    tail.poly(BONE, s([(76, 56), (79, 50), (80, 58)]))
    sp.stamp(tail)
    sp.ell(BODY_DK, s([(46, 42), (70, 66)]))
    sp.ell(BODY, s([(34, 30), (62, 60)]))
    sp.ell(BELLY, s([(31, 33), (45, 58)]))
    sp.poly(BODY, s([(34, 52), (41, 52), (42, 66), (33, 68)]))
    for x, y in ((32, 66), (35, 66), (38, 66), (51, 63), (55, 64), (59, 63)):
        sp.poly(BONE, s([(x, y), (x + 2, y), (x + 1, y + 4)]))
    sp.poly(BODY, s([(32, 36), (44, 36), (34, 18), (24, 18)]))
    sp.poly(BELLY, s([(32, 36), (36, 36), (28, 20), (24, 20)]))
    sp.ell(BODY, s([(19, 7), (34, 21)]))
    sp.poly(BODY, s([(22, 9), (6, 12), (3, 16), (8, 18), (24, 18)]))
    sp.poly(BODY_DK, s([(8, 19), (24, 20), (22, 24), (11, 23)]))
    sp.line(FIRE, s([(8, 18), (22, 19)]), 1)
    sp.poly(BODY_DK, s([(19, 10), (27, 8), (28, 10), (20, 12)]))
    sp.poly(BONE, s([(26, 9), (29, 8), (38, 2), (43, 0), (36, 5)]))
    sp.poly(BONE, s([(28, 12), (31, 11), (41, 8), (46, 9), (38, 11)]))
    for x, y in [(34, 20), (37, 25), (40, 30), (46, 32), (52, 34), (58, 38)]:
        sp.poly(BONE, s([(x, y), (x + 3, y - 4), (x + 3, y + 1)]))
    wing = sp.temp()
    wing.poly(MEMB, s([(48, 38), (62, 8), (66, 0), (79, 4), (79, 20), (74, 31), (66, 40)]))
    for box in [(75, 22, 82, 30), (68, 32, 75, 41), (60, 38, 67, 46)]:
        wing.ell(0, s([(box[0], box[1]), (box[2], box[3])]))
    wing.line(BODY, s([(48, 38), (62, 8)]), 4)
    for tip in [(66, 0), (79, 4), (79, 20), (74, 31)]:
        wing.line(BONE, s([(62, 8), tip]), 1)
    sp.stamp(wing)
    sp.rect(EYE, s([(22, 11), (24, 12)]))
    sp.pts(PUPIL, s([(23, 11), (23, 12)]))
    sp.pts(PUPIL, s([(7, 14)]))
    return sp


# ---------------------------------------------------------------- pose B: wings of the gate (front, wings spread)
def pose_spread():
    sp = Sprite(96, 80)
    wing = sp.temp()
    wing.poly(MEMB, [(40, 34), (14, 10), (2, 2), (0, 20), (4, 36), (14, 46), (26, 48), (38, 44)])
    for box in [(-3, 24, 4, 32), (5, 38, 12, 46), (17, 44, 24, 52)]:
        wing.ell(0, box)
    wing.line(BODY, [(40, 34), (26, 20), (14, 10)], 3)
    for tip in [(2, 2), (0, 20), (4, 36), (14, 46), (26, 48)]:
        wing.line(BONE, [(14, 10), tip], 1)
    wing.poly(BONE, [(14, 10), (10, 3), (16, 8)])
    sp.stamp(wing)
    sp.ell(BODY_DK, (30, 52, 46, 72))
    for x in (32, 36, 40):
        sp.poly(BONE, [(x, 68), (x + 2, 68), (x + 1, 74)])
    sp.ell(BODY, (32, 28, 64, 66))
    sp.ell(BELLY, (40, 32, 56, 66))
    sp.poly(BODY, [(34, 42), (41, 42), (40, 60), (33, 62)])
    sp.poly(BONE, [(33, 62), (36, 62), (34, 66)])
    sp.poly(BODY, [(42, 32), (54, 32), (52, 18), (44, 18)])
    sp.poly(BELLY, [(45, 32), (51, 32), (50, 20), (46, 20)])
    sp.ell(BODY, (38, 6, 58, 24))
    sp.poly(BODY, [(42, 16), (54, 16), (52, 28), (44, 28)])
    sp.poly(BODY_DK, [(44, 24), (52, 24), (51, 29), (45, 29)])
    sp.poly(BODY_DK, [(38, 11), (46, 12), (46, 14), (39, 13)])
    sp.poly(BONE, [(40, 9), (44, 8), (31, 0), (28, 0)])
    sp.poly(BONE, [(38, 13), (41, 12), (32, 8), (30, 9)])
    sp.poly(MEMB, [(39, 16), (32, 20), (40, 21)])
    sp.mirror()
    tail = sp.temp()
    tail.line(BODY, [(54, 68), (66, 74), (80, 73), (90, 66)], 4)
    tail.poly(BONE, [(88, 62), (95, 58), (92, 69)])
    sp.stamp(tail, under=True)
    sp.rect(EYE, (41, 14, 43, 15))
    sp.rect(EYE, (52, 14, 54, 15))
    sp.pts(PUPIL, [(42, 14), (42, 15), (53, 14), (53, 15), (45, 25), (50, 25)])
    sp.rect(FIRE, (45, 27, 50, 27))
    return sp


# ---------------------------------------------------------------- pose C: portrait (3/4, facing right)
def pose_portrait():
    sp = Sprite(64, 64)
    sp.poly(BODY, [(4, 64), (12, 42), (24, 32), (40, 34), (46, 64)])
    sp.poly(BELLY, [(32, 38), (42, 36), (48, 64), (34, 64)])
    for p in ([(16, 30), (6, 28), (14, 35)], [(12, 40), (2, 40), (11, 45)], [(9, 50), (1, 53), (9, 56)], [(7, 59), (0, 63), (7, 64)]):
        sp.poly(BONE, p)
    sp.poly(BONE, [(20, 12), (27, 14), (8, 2), (3, 0)])
    sp.poly(BONE, [(22, 19), (27, 21), (7, 14), (3, 13)])
    sp.poly(MEMB, [(22, 22), (11, 25), (21, 29)])
    sp.ell(BODY, (16, 10, 42, 34))
    sp.poly(BODY, [(36, 14), (60, 21), (63, 27), (59, 32), (36, 34)])
    sp.poly(BODY_DK, [(38, 33), (58, 33), (55, 39), (40, 40)])
    sp.line(FIRE, [(41, 34), (56, 34)], 1)
    sp.pts(BONE, [(44, 33), (48, 33), (52, 33), (56, 33), (46, 35), (50, 35), (54, 35)])
    sp.poly(BODY_DK, [(26, 15), (42, 15), (46, 19), (28, 19)])
    sp.poly(BONE, [(30, 30), (23, 34), (31, 34)])
    sp.ell(IRIS, (34, 20, 40, 24))
    sp.line(PUPIL, [(37, 20), (37, 24)], 1)
    sp.pts(SHINE, [(35, 21)])
    sp.rect(PUPIL, (57, 23, 58, 24))
    return sp


# ---------------------------------------------------------------- pose D: map token (32x32)
def pose_token():
    sp = Sprite(32, 32)
    wing = sp.temp()
    wing.poly(MEMB, [(12, 14), (6, 3), (1, 5), (0, 11), (3, 15), (8, 17)])
    for tip in [(1, 5), (0, 11), (3, 15)]:
        wing.line(BONE, [(6, 3), tip], 1)
    sp.stamp(wing)
    tail = sp.temp()
    tail.line(BODY, [(10, 25), (4, 28), (1, 25)], 2)
    tail.poly(BONE, [(0, 22), (2, 20), (3, 24)])
    sp.stamp(tail, under=True)
    sp.ell(BODY, (7, 14, 22, 28))
    sp.ell(BELLY, (14, 16, 21, 27))
    sp.rect(BODY_DK, (9, 26, 12, 30))
    sp.rect(BODY, (16, 26, 19, 30))
    sp.pts(BONE, [(9, 31), (11, 31), (16, 31), (18, 31)])
    sp.ell(BODY, (13, 3, 27, 16))
    sp.poly(BODY, [(23, 7), (31, 9), (31, 14), (23, 15)])
    sp.poly(BODY_DK, [(24, 13), (30, 13), (29, 16), (25, 16)])
    sp.poly(BONE, [(15, 6), (17, 5), (11, 0)])
    sp.poly(BONE, [(19, 4), (21, 4), (18, 0)])
    sp.rect(EYE, (23, 8, 24, 9))
    sp.pts(PUPIL, [(24, 8), (24, 9), (30, 10)])
    return sp


# ---------------------------------------------------------------- pose E: the dragon's eye (ability icon)
def pose_eye():
    sp = Sprite(32, 22)
    sp.ell(BODY, (0, 0, 31, 21))
    sp.poly(BONE, [(9, 4), (12, 0), (14, 4)])
    sp.poly(BONE, [(18, 3), (21, 0), (22, 4)])
    sp.poly(BODY_DK, [(4, 8), (16, 2), (29, 6), (28, 9), (16, 5), (5, 11)])
    sp.poly(IRIS, [(5, 11), (16, 6), (28, 9), (16, 16)])
    sp.poly(PUPIL, [(16, 7), (17, 7), (17, 15), (16, 15)])
    sp.pts(SHINE, [(13, 9), (14, 9)])
    sp.line(BODY_DK, [(6, 12), (16, 17), (27, 11)], 1)
    return sp


def colours(img):
    return len({p for p in img.getdata() if p[3] > 0})


if __name__ == "__main__":
    meta = {}
    poses = [("rearing", pose_rearing, 3, False), ("spread", pose_spread, 3, False),
             ("portrait", pose_portrait, 4, True), ("token", pose_token, 4, False), ("eye", pose_eye, 4, False)]
    for pose, fn, scale, with_bg in poses:
        for key, pal in PALETTES.items():
            sp = fn()
            bg = bg_tile(sp.w, sp.h, *pal["bg"]) if with_bg else None
            img = render(sp, pal, bg=bg)
            n = colours(img if not with_bg else render(sp, pal))
            name = f"{pose}-{key}.png"
            img.resize((sp.w * scale, sp.h * scale), Image.NEAREST).save(os.path.join(OUT, name))
            meta[name] = {"grid": f"{sp.w}x{sp.h}", "scale": scale, "colours": n}
            if pose == "token" and key == "ember":
                img.resize((sp.w * 10, sp.h * 10), Image.NEAREST).save(os.path.join(OUT, "token-ember-x10.png"))
    json.dump(meta, open(os.path.join(OUT, "meta.json"), "w"), indent=1)
    for k, v in meta.items():
        print(k, v)
