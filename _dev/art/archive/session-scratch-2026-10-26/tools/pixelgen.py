"""Generate pixel-art mockup assets for the Draconia UI mockups.

Everything is drawn at low resolution and upscaled with nearest-neighbour,
so the output is true pixel art. Usage: pixelgen.py <outdir>
"""
import math
import os
import random
import sys

from PIL import Image, ImageDraw

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

INK = (18, 10, 16, 255)
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def save(img, name, scale):
    img.resize((img.width * scale, img.height * scale), Image.NEAREST).save(os.path.join(OUT, name))


def outline(img, color=INK):
    """Grow a 1px outline around every opaque region."""
    w, h = img.size
    src = img.load()
    out = img.copy()
    dst = out.load()
    for y in range(h):
        for x in range(w):
            if src[x, y][3] > 0:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and src[nx, ny][3] > 0:
                    dst[x, y] = color
                    break
    return out


def dither_mix(c0, c1, t, x, y):
    return c1 if t * 16 > BAYER[y % 4][x % 4] else c0


def gradient(img, box, stops):
    """Vertical banded gradient with ordered dithering between stops."""
    x0, y0, x1, y1 = box
    px = img.load()
    n = len(stops) - 1
    for y in range(y0, y1):
        f = (y - y0) / max(1, (y1 - y0 - 1)) * n
        i = min(int(f), n - 1)
        t = f - i
        for x in range(x0, x1):
            px[x, y] = dither_mix(stops[i], stops[i + 1], t, x, y)


def shade(img, fn):
    """Multiply every pixel by fn(x, y) in [0, 1.5], quantised for a pixel look."""
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            k = fn(x, y)
            k = round(k * 6) / 6
            px[x, y] = (min(255, int(r * k)), min(255, int(g * k)), min(255, int(b * k)), a)


# ---------------------------------------------------------------- dragon
def dragon():
    W, H = 64, 54
    half = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(half)
    wing, wing_dk = (178, 96, 34, 255), (120, 54, 22, 255)
    bone, bone_dk = (238, 214, 160, 255), (186, 150, 100, 255)
    body, body_lt, body_dk = (140, 44, 32, 255), (186, 70, 44, 255), (90, 24, 24, 255)
    # wing membrane (left side), scalloped lower edge
    d.polygon([(27, 27), (13, 7), (1, 2), (0, 15), (4, 13), (3, 25), (8, 21), (10, 31), (15, 26), (19, 35), (26, 35)], fill=wing)
    d.polygon([(13, 7), (1, 2), (0, 15), (4, 13), (3, 25), (8, 21), (12, 16)], fill=wing_dk)
    # arm and finger bones
    d.line([(28, 26), (13, 7)], fill=body, width=3)
    for tip in [(1, 2), (0, 15), (3, 25), (10, 31)]:
        d.line([(13, 7), tip], fill=bone_dk, width=1)
    d.point((13, 6), fill=bone)
    d.point((12, 6), fill=bone)
    # neck, head, horns
    d.polygon([(27, 28), (37, 28), (35, 14), (29, 14)], fill=body)
    d.ellipse([27, 8, 37, 17], fill=body)
    d.line([(29, 10), (24, 2)], fill=bone, width=2)
    d.line([(24, 2), (23, 0)], fill=bone, width=1)
    # body and haunches
    d.ellipse([22, 24, 42, 47], fill=body)
    d.ellipse([16, 38, 30, 52], fill=body_dk)
    d.ellipse([24, 26, 31, 36], fill=body_lt)
    # mirror to make it symmetric
    left = half.crop((0, 0, 32, H))
    full = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    full.paste(left, (0, 0))
    full.paste(left.transpose(Image.FLIP_LEFT_RIGHT), (32, 0))
    d = ImageDraw.Draw(full)
    # spine ridge down the middle
    for y in range(15, 46, 3):
        d.point((31, y), fill=bone)
        d.point((32, y), fill=bone)
        d.point((31, y + 1), fill=bone_dk)
    # tail curling off to the right, over the wall
    d.line([(36, 46), (44, 50), (52, 49), (57, 45)], fill=body, width=3)
    d.polygon([(57, 42), (61, 44), (57, 47)], fill=bone)
    # claws gripping the wall
    for x in (19, 22, 25, 38, 41, 44):
        d.point((x, 52), fill=bone)
        d.point((x, 53), fill=bone)
    full = outline(full)
    return full


# ---------------------------------------------------------------- kobold (from the game's silhouette)
def kobold():
    src = Image.open(sys.argv[2]).convert("RGBA")
    bbox = src.getbbox()
    src = src.crop(bbox)
    w = 36
    h = round(src.height * w / src.width)
    small = src.resize((w, h), Image.BOX)
    px = small.load()
    out = Image.new("RGBA", (w + 2, h + 2), (0, 0, 0, 0))
    po = out.load()
    base, light, dark = (112, 120, 64, 255), (150, 160, 88, 255), (74, 80, 44, 255)
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > 110:
                # simple light from the top-left
                above = y == 0 or px[x, y - 1][3] <= 110
                left = x == 0 or px[x - 1, y][3] <= 110
                below = y == h - 1 or px[x, y + 1][3] <= 110
                right = x == w - 1 or px[x + 1, y][3] <= 110
                c = base
                if above or left:
                    c = light
                elif below or right:
                    c = dark
                po[x + 1, y + 1] = c
    # the spear shaft reads as wood
    out = outline(out)
    po = out.load()
    # glowing eye
    ex, ey = 11, 7
    po[ex, ey] = (255, 196, 64, 255)
    po[ex + 1, ey] = (255, 120, 40, 255)
    return out


# ---------------------------------------------------------------- minotaur boss
def minotaur():
    W, H = 56, 60
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    fur, fur_lt, fur_dk = (96, 52, 44, 255), (132, 76, 58, 255), (60, 30, 30, 255)
    horn = (226, 210, 170, 255)
    iron = (110, 116, 128, 255)
    d.ellipse([12, 20, 44, 50], fill=fur)
    d.ellipse([6, 18, 22, 34], fill=fur_dk)
    d.ellipse([34, 18, 50, 34], fill=fur_dk)
    d.ellipse([20, 6, 36, 24], fill=fur)
    d.ellipse([23, 16, 33, 25], fill=fur_lt)
    d.line([(21, 10), (12, 6), (8, 1)], fill=horn, width=3)
    d.line([(35, 10), (44, 6), (48, 1)], fill=horn, width=3)
    d.rectangle([16, 46, 24, 58], fill=fur_dk)
    d.rectangle([32, 46, 40, 58], fill=fur_dk)
    d.ellipse([20, 26, 36, 40], fill=fur_lt)
    # great axe
    d.line([(50, 8), (50, 58)], fill=(110, 70, 40, 255), width=2)
    d.polygon([(51, 8), (55, 12), (55, 22), (51, 26)], fill=iron)
    img = outline(img)
    d = ImageDraw.Draw(img)
    d.point((25, 14), fill=(255, 70, 40, 255))
    d.point((31, 14), fill=(255, 70, 40, 255))
    d.point((27, 21), fill=(230, 210, 120, 255))
    d.point((29, 21), fill=(230, 210, 120, 255))
    return img


# ---------------------------------------------------------------- warfront background
def warfront_bg():
    W, H = 130, 282
    rnd = random.Random(7)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    gradient(img, (0, 0, W, 112), [(10, 8, 22, 255), (22, 14, 36, 255), (44, 22, 44, 255), (92, 34, 38, 255), (150, 56, 34, 255)])
    d = ImageDraw.Draw(img)
    # blood moon behind smoke
    d.ellipse([92, 14, 112, 34], fill=(176, 74, 58, 255))
    d.ellipse([97, 18, 101, 22], fill=(150, 58, 48, 255))
    d.ellipse([104, 25, 107, 28], fill=(150, 58, 48, 255))
    for i in range(5):
        y = 30 + i * 9
        x = rnd.randint(-20, 60)
        d.rectangle([x, y, x + rnd.randint(40, 90), y + 2], fill=(30, 18, 34, 255))
    # jagged mountains
    pts = [(0, 112)]
    y = 92
    for x in range(0, W + 4, 4):
        y = max(80, min(106, y + rnd.randint(-5, 5)))
        pts.append((x, y))
    pts.append((W, 112))
    d.polygon(pts, fill=(26, 16, 30, 255))
    # the horde's camp on the horizon
    gradient(img, (0, 108, W, 126), [(34, 20, 30, 255), (44, 28, 34, 255)])
    for _ in range(26):
        x, y = rnd.randint(2, W - 3), rnd.randint(108, 122)
        d.polygon([(x - 3, y + 2), (x, y - 2), (x + 3, y + 2)], fill=(20, 12, 18, 255))
    for _ in range(30):
        x, y = rnd.randint(1, W - 2), rnd.randint(108, 124)
        d.point((x, y - 1), fill=(120, 36, 24, 255))
        d.point((x, y), fill=(250, 140, 48, 255))
        d.point((x, y + 1), fill=(255, 220, 120, 255))
    # scorched field
    gradient(img, (0, 126, W, 236), [(46, 30, 36, 255), (58, 40, 40, 255), (66, 48, 44, 255)])
    # road from the horizon to the gate
    d.polygon([(61, 122), (69, 122), (100, 236), (30, 236)], fill=(66, 52, 48, 255))
    d.line([(61, 122), (30, 236)], fill=(56, 42, 40, 255))
    d.line([(69, 122), (100, 236)], fill=(56, 42, 40, 255))
    for i in range(90):
        t = rnd.random()
        y = 124 + t * 110
        half_w = 4 + t * 34
        x = 65 + rnd.uniform(-half_w, half_w)
        d.point((x, y), fill=(80, 64, 56, 255))
    # dead trees and rocks
    for x, y, s in [(14, 150, 10), (112, 170, 12), (20, 205, 14), (118, 214, 9), (6, 182, 8)]:
        d.line([(x, y), (x, y - s)], fill=(24, 16, 20, 255))
        d.line([(x, y - s + 3), (x - 3, y - s)], fill=(24, 16, 20, 255))
        d.line([(x, y - s + 5), (x + 3, y - s + 1)], fill=(24, 16, 20, 255))
    for _ in range(14):
        x, y = rnd.randint(0, W), rnd.randint(140, 232)
        if 28 < x < 102 and y > 160:
            continue
        d.rectangle([x, y, x + 2, y + 1], fill=(38, 28, 32, 255))
    # the wall of Draconia
    wall, mortar = (76, 70, 80, 255), (46, 40, 50, 255)
    d.rectangle([0, 244, W, H], fill=wall)
    for row, y in enumerate(range(244, H, 6)):
        d.line([(0, y), (W, y)], fill=mortar)
        off = 0 if row % 2 else 6
        for x in range(off, W, 12):
            d.line([(x, y), (x, y + 6)], fill=mortar)
    for x in range(0, W, 12):
        d.rectangle([x, 236, x + 6, 244], fill=wall)
        d.rectangle([x, 236, x + 6, 237], fill=(104, 98, 108, 255))
    # gatehouse under the dragon
    d.rectangle([40, 230, 90, 250], fill=(88, 80, 90, 255))
    d.rectangle([40, 230, 90, 231], fill=(120, 112, 122, 255))
    for x in range(40, 91, 10):
        d.rectangle([x, 224, x + 5, 230], fill=(88, 80, 90, 255))
    # torches with warm light
    for tx in (16, 114):
        d.rectangle([tx, 250, tx + 1, 258], fill=(60, 38, 24, 255))
        d.point((tx, 248), fill=(255, 200, 80, 255))
        d.point((tx + 1, 247), fill=(255, 140, 40, 255))
        d.point((tx, 246), fill=(220, 80, 30, 255))

    def light(x, y):
        k = 1.0
        for tx in (16, 114):
            dist = math.hypot(x - tx, (y - 248) * 1.3)
            k = max(k, 1.45 - dist / 40)
        # cold dark vignette: the apocalypse at the edges
        edge = min(x, W - x) / 26
        top = y / 60
        return min(k, 1.5) * min(1.0, 0.45 + 0.55 * min(edge, 1.0)) * min(1.0, 0.6 + 0.4 * min(top, 1.0))

    shade(img, light)
    return img


# ---------------------------------------------------------------- Draconia city background
def city_bg():
    W, H = 130, 282
    rnd = random.Random(3)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    gradient(img, (0, 0, W, 60), [(12, 10, 24, 255), (30, 20, 40, 255), (70, 34, 44, 255)])
    d = ImageDraw.Draw(img)
    # hill the city climbs
    gradient(img, (0, 52, W, H), [(46, 40, 44, 255), (56, 48, 50, 255), (62, 54, 54, 255)])
    d.polygon([(0, 60), (30, 50), (65, 44), (100, 50), (130, 58), (130, 66), (0, 66)], fill=(40, 34, 40, 255))
    # winding street
    street = [(65, 252), (58, 220), (72, 190), (56, 160), (66, 120), (65, 96)]
    d.line(street, fill=(92, 78, 66, 255), width=6)
    d.line(street, fill=(110, 94, 78, 255), width=2)
    lights = []

    def house(x, y, w, h, lit, ruined=False, roof=(120, 52, 40, 255)):
        wallc = (150, 130, 104, 255) if not ruined else (70, 66, 70, 255)
        d.rectangle([x, y, x + w, y + h], fill=wallc)
        if not ruined:
            d.polygon([(x - 1, y), (x + w // 2, y - h // 2 - 1), (x + w + 1, y)], fill=roof)
        else:
            d.line([(x, y), (x + 2, y - 2), (x + 4, y + 1)], fill=(50, 46, 50, 255))
        win = (255, 200, 90, 255) if lit else (30, 26, 34, 255)
        d.rectangle([x + 2, y + 2, x + 3, y + 3], fill=win)
        if w > 7:
            d.rectangle([x + w - 3, y + 2, x + w - 2, y + 3], fill=win)
        if lit:
            lights.append((x + w // 2, y + 2, 26))

    # the Keep on the crown of the hill
    d.rectangle([48, 58, 82, 96], fill=(120, 112, 120, 255))
    d.rectangle([42, 48, 52, 96], fill=(132, 124, 132, 255))
    d.rectangle([78, 48, 88, 96], fill=(132, 124, 132, 255))
    for x in range(42, 89, 4):
        d.rectangle([x, 44, x + 2, 48], fill=(132, 124, 132, 255))
    d.rectangle([60, 40, 70, 60], fill=(140, 132, 140, 255))
    d.polygon([(58, 40), (65, 28), (72, 40)], fill=(150, 40, 36, 255))
    d.line([(65, 28), (65, 20)], fill=(60, 50, 50, 255))
    d.polygon([(66, 20), (74, 23), (66, 26)], fill=(220, 160, 50, 255))
    for wx, wy in [(46, 60), (82, 60), (46, 76), (82, 76), (64, 48), (56, 70), (72, 70)]:
        d.rectangle([wx, wy, wx + 1, wy + 2], fill=(255, 206, 96, 255))
    d.rectangle([61, 86, 69, 96], fill=(60, 40, 30, 255))
    lights.append((65, 70, 52))
    # Ranger's Lodge (built, lit)
    d.rectangle([14, 130, 38, 146], fill=(110, 76, 48, 255))
    d.polygon([(11, 130), (26, 118), (41, 130)], fill=(52, 96, 56, 255))
    d.rectangle([24, 138, 28, 146], fill=(50, 32, 24, 255))
    d.rectangle([17, 134, 19, 136], fill=(255, 200, 90, 255))
    d.rectangle([33, 134, 35, 136], fill=(255, 200, 90, 255))
    lights.append((26, 134, 34))
    # Explorer's Outpost (under construction: scaffolding)
    d.rectangle([92, 150, 116, 168], fill=(120, 104, 86, 255))
    for x in range(90, 120, 5):
        d.line([(x, 140), (x, 170)], fill=(150, 110, 60, 255))
    for y in range(142, 170, 6):
        d.line([(90, y), (118, y)], fill=(150, 110, 60, 255))
    d.line([(90, 142), (118, 168)], fill=(150, 110, 60, 255))
    lights.append((104, 156, 18))
    # Librarium (ruin, still dark)
    d.rectangle([14, 196, 40, 214], fill=(64, 60, 66, 255))
    d.polygon([(14, 196), (18, 188), (22, 196)], fill=(64, 60, 66, 255))
    d.rectangle([34, 186, 38, 196], fill=(64, 60, 66, 255))
    d.line([(14, 196), (40, 196)], fill=(46, 42, 48, 255))
    for x in (18, 26, 34):
        d.rectangle([x, 202, x + 2, 210], fill=(26, 22, 30, 255))
    # ordinary houses: lit near the Keep, ruined at the edges
    for x, y, w, h, lit, ruined in [
        (46, 108, 9, 7, True, False), (76, 106, 10, 7, True, False), (88, 118, 8, 6, True, False),
        (40, 122, 8, 6, True, False), (100, 100, 8, 6, False, True), (6, 100, 8, 6, False, True),
        (74, 136, 9, 7, True, False), (44, 150, 9, 6, False, False), (78, 176, 9, 7, False, True),
        (90, 196, 10, 7, False, True), (52, 200, 8, 6, False, True), (104, 226, 9, 6, False, True),
        (12, 232, 9, 6, False, True), (114, 128, 8, 6, False, True), (4, 160, 8, 6, False, True),
    ]:
        house(x, y, w, h, lit, ruined)
    # inner wall and gate at the bottom
    d.rectangle([0, 252, W, H], fill=(76, 70, 80, 255))
    for x in range(0, W, 10):
        d.rectangle([x, 246, x + 5, 252], fill=(76, 70, 80, 255))
    d.rectangle([56, 258, 74, 282], fill=(40, 28, 24, 255))
    d.rectangle([56, 258, 74, 259], fill=(120, 112, 122, 255))
    for tx in (44, 86):
        d.point((tx, 248), fill=(255, 200, 80, 255))
        lights.append((tx, 250, 20))

    def lightmap(x, y):
        k = 0.34
        for lx, ly, r in lights:
            dist = math.hypot(x - lx, y - ly)
            k = max(k, 1.25 - dist / r * 0.9)
        edge = min(x, W - x) / 20
        return min(k, 1.35) * min(1.0, 0.5 + 0.5 * min(edge, 1.0))

    shade(img, lightmap)
    return img


# ---------------------------------------------------------------- forage valley header and strips
def valley_bg():
    W, H = 130, 96
    rnd = random.Random(11)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    gradient(img, (0, 0, W, 44), [(44, 30, 60, 255), (150, 72, 60, 255), (236, 150, 80, 255)])
    d = ImageDraw.Draw(img)
    d.ellipse([84, 30, 100, 46], fill=(255, 210, 120, 255))
    pts = [(0, 50)]
    y = 40
    for x in range(0, W + 4, 5):
        y = max(32, min(48, y + rnd.randint(-4, 4)))
        pts.append((x, y))
    pts.append((W, 50))
    d.polygon(pts, fill=(70, 50, 70, 255))
    gradient(img, (0, 46, W, H), [(86, 96, 54, 255), (110, 120, 60, 255), (80, 92, 48, 255)])
    # fields in strips
    for i, c in enumerate([(176, 150, 70, 255), (130, 140, 64, 255), (190, 160, 80, 255)]):
        d.polygon([(10 + i * 38, 60), (44 + i * 38, 60), (40 + i * 38, 76), (2 + i * 38, 76)], fill=c)
    # river
    d.line([(0, 84), (40, 80), (80, 88), (130, 82)], fill=(80, 130, 170, 255), width=4)
    d.line([(0, 84), (40, 80), (80, 88), (130, 82)], fill=(150, 196, 220, 255), width=1)
    # forest edge
    for x in range(0, W, 6):
        h = rnd.randint(6, 12)
        d.polygon([(x, 58), (x + 3, 58 - h), (x + 6, 58)], fill=(40, 70, 46, 255))
    # the city wall glimpsed at the left edge
    d.rectangle([0, 30, 10, 60], fill=(90, 84, 94, 255))
    for y in range(30, 60, 6):
        d.line([(0, y), (10, y)], fill=(60, 54, 64, 255))
    return img


def strip(kind):
    W, H = 110, 34
    rnd = random.Random(len(kind))
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    d = ImageDraw.Draw(img)
    if kind == "meadow":
        gradient(img, (0, 0, W, 16), [(120, 150, 180, 255), (200, 190, 150, 255)])
        gradient(img, (0, 16, W, H), [(110, 130, 60, 255), (86, 104, 48, 255)])
        for x in range(0, W, 7):
            d.line([(x, 16), (x + 2, 12)], fill=(150, 170, 80, 255))
    elif kind == "forest":
        gradient(img, (0, 0, W, H), [(30, 52, 40, 255), (46, 72, 46, 255), (60, 80, 44, 255)])
        for x in range(-4, W, 9):
            h = rnd.randint(14, 22)
            d.polygon([(x, 22), (x + 5, 22 - h), (x + 10, 22)], fill=(24, 44, 32, 255))
            d.rectangle([x + 4, 22, x + 5, 25], fill=(60, 40, 30, 255))
    else:  # river
        gradient(img, (0, 0, W, 14), [(90, 110, 150, 255), (170, 160, 150, 255)])
        gradient(img, (0, 14, W, H), [(70, 110, 140, 255), (50, 86, 120, 255)])
        for _ in range(30):
            x, y = rnd.randint(0, W), rnd.randint(16, H - 1)
            d.line([(x, y), (x + 3, y)], fill=(150, 196, 220, 255))
        d.rectangle([0, 26, W, H], fill=(96, 84, 66, 255))
    return img


def villager(carry):
    img = Image.new("RGBA", (11, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([3, 1, 7, 5], fill=(232, 184, 140, 255))
    d.rectangle([3, 0, 7, 1], fill=(110, 70, 40, 255))
    d.point((4, 3), fill=INK)
    d.point((6, 3), fill=INK)
    d.rectangle([2, 6, 8, 11], fill=(150, 64, 44, 255))
    d.rectangle([2, 11, 8, 12], fill=(96, 60, 36, 255))
    d.rectangle([3, 13, 4, 15], fill=(70, 50, 40, 255))
    d.rectangle([6, 13, 7, 15], fill=(70, 50, 40, 255))
    if carry:
        d.ellipse([6, 4, 10, 9], fill=(200, 160, 90, 255))
        d.point((8, 5), fill=(240, 210, 120, 255))
    return outline(img)


def chest():
    img = Image.new("RGBA", (16, 13), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([1, 5, 14, 12], fill=(150, 80, 40, 255))
    d.rectangle([1, 1, 14, 5], fill=(180, 100, 50, 255))
    d.rectangle([1, 5, 14, 6], fill=(240, 190, 80, 255))
    d.rectangle([7, 4, 8, 8], fill=(255, 220, 120, 255))
    d.line([(4, 1), (4, 12)], fill=(240, 190, 80, 255))
    d.line([(11, 1), (11, 12)], fill=(240, 190, 80, 255))
    return outline(img)


# ---------------------------------------------------------------- Elder Pyreth bust
def pyreth():
    W, H = 44, 46
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    robe, robe_dk = (150, 48, 34, 255), (100, 28, 24, 255)
    skin, skin_dk = (226, 176, 136, 255), (180, 128, 98, 255)
    white = (236, 230, 220, 255)
    d.polygon([(4, 46), (8, 30), (22, 24), (36, 30), (40, 46)], fill=robe)
    d.polygon([(10, 22), (12, 6), (22, 1), (32, 6), (34, 22), (30, 30), (14, 30)], fill=robe_dk)
    d.ellipse([14, 8, 30, 26], fill=skin)
    d.rectangle([15, 21, 29, 23], fill=skin_dk)
    d.polygon([(14, 19), (22, 40), (30, 19), (26, 23), (22, 22), (18, 23)], fill=white)
    d.line([(15, 13), (20, 12)], fill=white, width=2)
    d.line([(24, 12), (29, 13)], fill=white, width=2)
    for ex in (17, 25):
        d.rectangle([ex, 15, ex + 1, 16], fill=INK)
        d.point((ex + 1, 15), fill=(255, 170, 70, 255))
    # ember amulet
    d.ellipse([20, 36, 24, 40], fill=(255, 150, 50, 255))
    d.point((21, 37), fill=(255, 230, 150, 255))
    # gold trim on the hood
    d.line([(12, 6), (22, 1), (32, 6)], fill=(230, 170, 70, 255))
    return outline(img)


# ---------------------------------------------------------------- 12x12 icons from ASCII
ICONS = {
    "star": ("y=240,192,96 w=255,236,180 o=176,120,40", [
        ".....kk.....",
        "....kwyk....",
        "....kyyk....",
        "kkkkkyykkkkk",
        "kwwyyyyyyyok",
        ".kyyyyyyyok.",
        "..kyyyyyok..",
        "..kyyyyyok..",
        ".kyyykkyyok.",
        ".kyok..kyok.",
        "kyok....kyok",
        "kkk......kkk"]),
    "food": ("b=214,150,72 w=246,206,130 d=150,90,40", [
        "............",
        "...kkkkkk...",
        "..kwwbbbbk..",
        ".kwbwbbwbbk.",
        "kwbbbbbbbbbk",
        "kbwbbwbbwbbk",
        "kbbbbbbbbbbk",
        "kdbbbbbbbbdk",
        ".kddddddddk.",
        "..kkkkkkkk..",
        "............",
        "............"]),
    "helm": ("s=150,160,176 w=226,232,242 d=96,104,120", [
        "....kkkk....",
        "...kwwssk...",
        "..kwwsssdk..",
        ".kwssssssdk.",
        ".kwsssssssk.",
        ".kkkkkkkkkk.",
        ".kssk..ksdk.",
        ".kssk..ksdk.",
        ".ksskkkksdk.",
        ".ksssssssdk.",
        "..kssssssk..",
        "...kkkkkk..."]),
    "villager": ("f=232,184,140 g=150,64,44 h=110,70,40", [
        "....kkkk....",
        "...khhhhk...",
        "..kffffffk..",
        "..kfkffkfk..",
        "..kffffffk..",
        "...kffffk...",
        "....kkkk....",
        "..kkggggkk..",
        ".kggggggggk.",
        "kggggggggggk",
        "kggggggggggk",
        "kkkkkkkkkkkk"]),
    "scroll": ("p=236,214,170 d=180,150,100 r=150,48,34", [
        "............",
        ".kkkkkkkkkk.",
        "kddppppppddk",
        ".kpppppppk..",
        ".kpkkkkppk..",
        ".kppppppkk..",
        ".kpkkkkppk..",
        ".kppppppppk.",
        ".kpkkkpprrk.",
        "kddppppprrdk",
        ".kkkkkkkkkk.",
        "............"]),
    "swords": ("s=210,218,230 h=176,120,40 d=120,128,140", [
        "kk........kk",
        "ksk......ksk",
        ".ksk....ksk.",
        "..ksk..ksk..",
        "...kskksk...",
        "....kssk....",
        "....kssk....",
        "...kdkkdk...",
        "..khk..khk..",
        ".khkk..kkhk.",
        "kkk......kkk",
        "kk........kk"]),
    "castle": ("s=170,164,176 d=110,104,118 g=240,192,96", [
        "k.k.k..k.k.k",
        "kkkkk..kkkkk",
        "ksssk..ksssk",
        "ksssk..ksssk",
        "kssskkkksssk",
        "ksssssssssdk",
        "kssgssssgsdk",
        "ksssssssssdk",
        "kssssddssssk",
        "ksssdkkdsssk",
        "kssdk..kdssk",
        "kkkkk..kkkkk"]),
    "wheat": ("y=236,192,90 d=176,130,50 s=150,120,50", [
        ".....kk.....",
        "....kyyk....",
        "...kykkyk...",
        "...kyyyyk...",
        "..kykyykyk..",
        "..kyyyyyyk..",
        "...kdyydk...",
        "....kssk....",
        "....kssk....",
        "...kksskk...",
        "....kssk....",
        "....kkkk...."]),
    "cog": ("s=170,170,180 d=110,110,124", [
        "....kkkk....",
        ".kk.kssk.kk.",
        ".ksskssksdk.",
        "..kssssssk..",
        "kkssskkssskk",
        "kssk....kssk",
        "kssk....kdsk",
        "kkssskksddkk",
        "..kssssddk..",
        ".ksdkddkddk.",
        ".kk.kddk.kk.",
        "....kkkk...."]),
    "hammer": ("s=170,170,186 w=226,230,240 h=150,96,50", [
        "............",
        ".kkkkkkk....",
        "kwwssssk....",
        "kwssssskk...",
        ".kkkkkkhk...",
        "......khk...",
        ".......khk..",
        "........khk.",
        ".........khk",
        "..........kk",
        "............",
        "............"]),
}


def icon(spec, rows):
    pal = {"k": INK, ".": (0, 0, 0, 0)}
    for part in spec.split():
        key, rgb = part.split("=")
        pal[key] = tuple(int(v) for v in rgb.split(",")) + (255,)
    img = Image.new("RGBA", (12, 12), (0, 0, 0, 0))
    px = img.load()
    for y, row in enumerate(rows):
        row = (row + "." * 12)[:12]
        for x, ch in enumerate(row):
            px[x, y] = pal[ch]
    return img


if __name__ == "__main__":
    save(dragon(), "dragon.png", 5)
    save(kobold(), "kobold.png", 5)
    save(minotaur(), "minotaur.png", 5)
    save(warfront_bg(), "warfront-bg.png", 3)
    save(city_bg(), "city-bg.png", 3)
    save(valley_bg(), "valley-bg.png", 3)
    for k in ("meadow", "forest", "river"):
        save(strip(k), f"strip-{k}.png", 3)
    save(villager(False), "villager.png", 3)
    save(villager(True), "villager-carry.png", 3)
    save(chest(), "chest.png", 3)
    save(pyreth(), "pyreth.png", 4)
    for name, (spec, rows) in ICONS.items():
        save(icon(spec, rows), f"icon-{name}.png", 4)
    print("ok", sorted(os.listdir(OUT)))
