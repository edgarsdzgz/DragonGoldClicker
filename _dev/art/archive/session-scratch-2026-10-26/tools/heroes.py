"""Hero dragon, Pyreth v2 and the pixel bestiary. Usage: heroes.py <outdir>"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw  # noqa: E402

import pixelgen as pg  # noqa: E402

OUT = sys.argv[1]
INK = pg.INK


def mirror(img):
    w, h = img.size
    left = img.crop((0, 0, w // 2, h))
    full = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    full.paste(left, (0, 0))
    full.paste(left.transpose(Image.FLIP_LEFT_RIGHT), (w - w // 2, 0))
    return full


# ---------------------------------------------------------------- the hero: side view, rearing, facing left
def hero():
    W, H = 80, 72
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    red, red_lt, red_dk = (168, 40, 30, 255), (214, 74, 44, 255), (100, 20, 22, 255)
    gold, gold_dk = (240, 186, 80, 255), (190, 124, 44, 255)
    mem, mem_lt, mem_dk = (196, 92, 34, 255), (238, 140, 60, 255), (110, 38, 24, 255)
    bone = (238, 220, 176, 255)
    # far wing, behind and darker
    d.polygon([(44, 34), (46, 4), (38, 0), (52, 0), (62, 8), (60, 20), (54, 30)], fill=mem_dk)
    d.line([(44, 34), (46, 4)], fill=red_dk, width=2)
    # tail curling along the wall
    d.line([(64, 60), (72, 66), (78, 63), (79, 58)], fill=red, width=4)
    d.polygon([(76, 56), (79, 50), (80, 58)], fill=bone)
    # haunch and body
    d.ellipse([46, 42, 70, 66], fill=red_dk)
    d.ellipse([34, 30, 62, 60], fill=red)
    d.ellipse([46, 44, 60, 56], fill=(124, 28, 26, 255))
    # golden belly plates down the chest
    d.ellipse([31, 33, 45, 58], fill=gold)
    for y in range(36, 58, 4):
        d.line([(32, y), (44, y)], fill=gold_dk)
    # front leg braced on the wall, hind claws
    d.polygon([(34, 52), (41, 52), (42, 66), (33, 68)], fill=red)
    for x in (32, 35, 38, 50, 54, 58):
        d.point((x, 70), fill=bone)
        d.point((x, 71), fill=bone)
    # neck rising to the head
    d.polygon([(32, 36), (44, 36), (34, 18), (24, 18)], fill=red)
    d.polygon([(32, 36), (36, 36), (28, 20), (24, 20)], fill=gold)
    # head facing left, jaws parted with fire inside
    d.ellipse([19, 7, 34, 21], fill=red)
    d.polygon([(22, 9), (6, 12), (3, 16), (8, 18), (24, 18)], fill=red)
    d.polygon([(8, 19), (24, 20), (22, 24), (11, 23)], fill=red_dk)
    d.line([(7, 18), (22, 19)], fill=(255, 150, 50, 255))
    d.point((8, 18), fill=(255, 230, 140, 255))
    d.point((10, 18), fill=(255, 230, 140, 255))
    d.ellipse([20, 8, 28, 13], fill=red_lt)
    # horns swept back, frill spikes down the neck and back
    d.line([(27, 9), (36, 3), (42, 1)], fill=bone, width=2)
    d.line([(29, 12), (40, 9), (45, 9)], fill=bone, width=2)
    for x, y in [(34, 20), (37, 25), (40, 30), (46, 32), (52, 34), (58, 38)]:
        d.polygon([(x, y), (x + 3, y - 4), (x + 3, y + 1)], fill=bone)
    # near wing, raised high and lit by torchlight
    d.polygon([(48, 38), (62, 8), (66, 0), (79, 4), (79, 20), (74, 31), (66, 40)], fill=mem)
    d.polygon([(62, 8), (66, 0), (79, 4), (79, 12), (68, 10)], fill=mem_lt)
    clear = (0, 0, 0, 0)
    d.ellipse([75, 22, 82, 30], fill=clear)
    d.ellipse([68, 32, 75, 41], fill=clear)
    d.ellipse([60, 38, 67, 46], fill=clear)
    d.line([(48, 38), (62, 8)], fill=red, width=3)
    for tip in [(66, 0), (79, 4), (79, 20), (74, 31)]:
        d.line([(62, 8), tip], fill=mem_dk)
    d.point((62, 7), fill=bone)
    d.point((61, 7), fill=bone)
    img = pg.outline(img)
    d = ImageDraw.Draw(img)
    # glowing amber eye with a slit pupil under a heavy brow
    d.rectangle([22, 11, 24, 12], fill=(255, 210, 80, 255))
    d.point((23, 11), fill=INK)
    d.line([(20, 10), (25, 9)], fill=red_dk)
    d.point((7, 14), fill=INK)
    return img


# ---------------------------------------------------------------- Pyreth v2: robed elder, three-quarter profile
def pyreth():
    W, H = 46, 48
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    scale, scale_lt, scale_dk = (150, 66, 48, 255), (190, 98, 66, 255), (96, 40, 34, 255)
    cream = (232, 210, 170, 255)
    bone, bone_dk = (226, 206, 160, 255), (170, 140, 100, 255)
    white, white_dk = (244, 240, 232, 255), (196, 190, 184, 255)
    robe, robe_dk, gold = (88, 44, 104, 255), (58, 26, 72, 255), (226, 170, 70, 255)
    # staff with the ember orb
    d.line([(6, 14), (6, 48)], fill=(110, 70, 40, 255), width=2)
    d.ellipse([1, 4, 11, 14], fill=(255, 150, 50, 255))
    d.ellipse([3, 6, 8, 11], fill=(255, 220, 130, 255))
    # robe with high collar and gold trim
    d.polygon([(8, 48), (11, 32), (22, 27), (34, 30), (40, 48)], fill=robe)
    d.polygon([(30, 48), (32, 34), (36, 32), (40, 48)], fill=robe_dk)
    d.line([(11, 32), (22, 27), (34, 30)], fill=gold)
    d.line([(24, 30), (26, 48)], fill=gold)
    # neck
    d.polygon([(17, 30), (21, 17), (30, 17), (29, 30)], fill=scale)
    # white mane down the back of the neck
    d.polygon([(19, 11), (13, 18), (12, 30), (18, 31), (20, 20)], fill=white)
    d.line([(14, 20), (14, 28)], fill=white_dk)
    # head facing right with a long muzzle
    d.ellipse([17, 7, 32, 21], fill=scale)
    d.polygon([(27, 10), (41, 13), (43, 17), (40, 20), (27, 21)], fill=scale)
    d.polygon([(28, 18), (40, 19), (38, 22), (28, 22)], fill=cream)
    d.ellipse([20, 8, 27, 13], fill=scale_lt)
    # curled ram horn
    d.line([(21, 9), (17, 4), (12, 4), (9, 8), (10, 13), (14, 15), (16, 12)], fill=bone, width=3)
    for p in [(14, 4), (10, 7), (10, 11)]:
        d.point(p, fill=bone_dk)
    d.polygon([(25, 8), (28, 2), (29, 8)], fill=bone)
    # long white beard flowing over the robe
    d.polygon([(25, 21), (37, 21), (34, 30), (30, 38), (27, 44), (24, 36), (22, 27)], fill=white)
    d.line([(27, 25), (27, 38)], fill=white_dk)
    d.line([(31, 24), (30, 33)], fill=white_dk)
    # clawed hand on the staff
    d.ellipse([4, 28, 10, 33], fill=scale_dk)
    img = pg.outline(img)
    d = ImageDraw.Draw(img)
    # wise, heavy-lidded amber eye with a white brow; nostril; mouth line
    d.rectangle([28, 13, 30, 13], fill=(255, 196, 70, 255))
    d.point((29, 13), fill=INK)
    d.line([(26, 11), (31, 11)], fill=white, width=1)
    d.line([(27, 12), (31, 12)], fill=scale_dk)
    d.point((40, 15), fill=INK)
    d.line([(31, 19), (40, 19)], fill=scale_dk)
    return img


# ---------------------------------------------------------------- goblin
def goblin():
    W, H = 36, 40
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    skin, skin_lt, skin_dk = (110, 150, 60, 255), (150, 186, 84, 255), (70, 100, 40, 255)
    rag = (110, 80, 56, 255)
    d.polygon([(10, 12), (0, 6), (4, 14), (11, 18)], fill=skin)  # long ear
    d.ellipse([8, 6, 28, 24], fill=skin)
    d.ellipse([10, 7, 18, 13], fill=skin_lt)
    d.polygon([(10, 22), (26, 22), (28, 36), (8, 36)], fill=rag)
    d.polygon([(10, 36), (14, 36), (14, 40), (10, 40)], fill=skin_dk)
    img = mirror(img)
    d = ImageDraw.Draw(img)
    for ex in (12, 21):
        d.rectangle([ex, 13, ex + 2, 15], fill=(255, 220, 60, 255))
        d.point((ex + 1, 14), fill=INK)
    d.polygon([(17, 15), (19, 15), (18, 19)], fill=skin_dk)  # long nose
    d.line([(12, 20), (24, 20)], fill=INK)
    for x in (13, 16, 20, 23):
        d.point((x, 21), fill=(240, 236, 220, 255))  # crooked teeth
    d.line([(29, 24), (35, 14)], fill=(176, 184, 196, 255), width=2)  # dagger
    d.rectangle([27, 24, 30, 27], fill=(90, 60, 40, 255))
    return pg.outline(img)


# ---------------------------------------------------------------- shadow crawler
def crawler():
    W, H = 50, 34
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    body, body_lt, body_dk = (58, 34, 78, 255), (92, 58, 120, 255), (32, 18, 44, 255)
    for (x0, y0, x1, y1, x2, y2) in [(14, 16, 5, 8, 1, 26), (15, 19, 6, 16, 2, 32), (16, 21, 9, 22, 6, 33), (17, 22, 12, 26, 11, 33)]:
        d.line([(x0, y0), (x1, y1), (x2, y2)], fill=body_dk, width=2)
    d.ellipse([12, 10, 38, 28], fill=body)
    d.ellipse([16, 11, 28, 18], fill=body_lt)
    d.polygon([(18, 10), (21, 4), (24, 10)], fill=body_dk)  # back spines
    d.polygon([(12, 14), (8, 9), (14, 12)], fill=body_dk)
    img = mirror(img)
    d = ImageDraw.Draw(img)
    for (x, y, c) in [(20, 19, (255, 80, 200, 255)), (23, 18, (120, 240, 255, 255)), (26, 18, (120, 240, 255, 255)),
                      (29, 19, (255, 80, 200, 255)), (22, 22, (255, 80, 200, 255)), (27, 22, (255, 80, 200, 255))]:
        d.point((x, y), fill=c)
    for x in (21, 24, 27):
        d.point((x, 25), fill=(230, 220, 240, 255))  # fangs
    return pg.outline(img)


# ---------------------------------------------------------------- ashen orc (the Unmade)
def ashen_orc():
    W, H = 46, 54
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ash, ash_lt, ash_dk = (118, 112, 124, 255), (150, 144, 156, 255), (78, 72, 86, 255)
    rust = (120, 72, 50, 255)
    d.ellipse([4, 18, 18, 30], fill=rust)  # pauldron
    d.ellipse([8, 20, 38, 50], fill=ash)
    d.ellipse([12, 6, 34, 26], fill=ash)
    d.ellipse([14, 7, 22, 13], fill=ash_lt)
    d.polygon([(12, 14), (6, 10), (12, 20)], fill=ash_dk)
    d.rectangle([12, 44, 20, 54], fill=ash_dk)
    d.rectangle([12, 34, 34, 38], fill=rust)  # belt
    img = mirror(img)
    d = ImageDraw.Draw(img)
    violet, violet_lt = (170, 70, 230, 255), (230, 170, 255, 255)
    for ex in (17, 27):
        d.rectangle([ex, 15, ex + 2, 16], fill=violet_lt)
    d.rectangle([18, 22, 19, 25], fill=(220, 214, 196, 255))
    d.rectangle([27, 22, 28, 25], fill=(220, 214, 196, 255))
    d.line([(20, 24), (26, 24)], fill=INK)
    # the Unmaking's cracks, glowing through the skin
    for pts in [[(20, 8), (22, 12), (21, 15)], [(14, 28), (18, 32), (17, 38)], [(30, 26), (28, 31), (32, 36)], [(24, 40), (26, 46)]]:
        d.line(pts, fill=violet)
    d.line([(40, 50), (42, 20)], fill=(90, 60, 40, 255), width=2)  # cleaver
    d.polygon([(42, 18), (46, 16), (46, 30), (42, 30)], fill=(150, 150, 160, 255))
    d.point((45, 20), fill=(110, 40, 40, 255))
    return pg.outline(img)


if __name__ == "__main__":
    pg.save(hero(), "hero-dragon.png", 4)
    pg.save(pyreth(), "bust-pyreth2.png", 4)
    pg.save(goblin(), "goblin.png", 5)
    pg.save(crawler(), "crawler.png", 5)
    pg.save(ashen_orc(), "ashen-orc.png", 5)
    print("ok")
