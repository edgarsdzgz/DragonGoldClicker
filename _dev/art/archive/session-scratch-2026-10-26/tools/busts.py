"""Character busts and townsfolk variants for the Draconia mockups.

Usage: busts.py <outdir>. Reuses the helpers in pixelgen.py.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw  # noqa: E402

import pixelgen as pg  # noqa: E402

OUT = sys.argv[1]
INK = pg.INK
W, H = 44, 46


def mirror(left_half):
    """Mirror the left 22 columns onto the right."""
    left = left_half.crop((0, 0, W // 2, H))
    full = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    full.paste(left, (0, 0))
    full.paste(left.transpose(Image.FLIP_LEFT_RIGHT), (W // 2, 0))
    return full


# ---------------------------------------------------------------- Elder Pyreth, elder dragon
def pyreth():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    scale, scale_lt, scale_dk = (170, 58, 38, 255), (206, 92, 56, 255), (112, 32, 26, 255)
    bone, white = (232, 214, 170, 255), (240, 236, 228, 255)
    mantle, gold = (70, 30, 60, 255), (226, 170, 70, 255)
    # mantle and neck
    d.polygon([(2, 46), (6, 36), (15, 31), (22, 31), (22, 46)], fill=mantle)
    d.line([(6, 36), (15, 31), (22, 31)], fill=gold)
    d.rectangle([15, 26, 22, 36], fill=scale_dk)
    # horns sweeping back and up
    d.line([(13, 10), (8, 5), (5, 0)], fill=bone, width=3)
    d.line([(11, 14), (4, 12), (1, 8)], fill=bone, width=2)
    # head and brow
    d.ellipse([10, 7, 33, 25], fill=scale)
    d.ellipse([13, 8, 22, 15], fill=scale_lt)
    # long snout toward the viewer
    d.polygon([(15, 17), (22, 17), (22, 30), (16, 28)], fill=scale)
    d.ellipse([14, 22, 30, 35], fill=scale)
    d.ellipse([16, 25, 27, 34], fill=scale_lt)
    # ear frill and spiked cheek frills along the jaw
    d.polygon([(10, 13), (4, 16), (10, 20)], fill=scale_dk)
    d.polygon([(10, 19), (3, 22), (11, 23)], fill=bone)
    d.polygon([(11, 23), (5, 28), (13, 27)], fill=bone)
    # white brows and long whisker-barbels
    d.line([(13, 13), (19, 14)], fill=white, width=2)
    d.line([(17, 27), (13, 32), (11, 40), (12, 44)], fill=white)
    d.line([(18, 29), (16, 35), (15, 41)], fill=white)
    d.polygon([(19, 31), (22, 31), (22, 39), (20, 37)], fill=white)
    img = mirror(img)
    d = ImageDraw.Draw(img)
    # eyes with slit pupils, nostrils, ember amulet
    for ex in (15, 27):
        d.rectangle([ex, 16, ex + 2, 17], fill=(255, 196, 70, 255))
        d.point((ex + 1, 16), fill=INK)
        d.point((ex + 1, 17), fill=INK)
    d.rectangle([18, 30, 19, 31], fill=INK)
    d.rectangle([24, 30, 25, 31], fill=INK)
    d.ellipse([20, 40, 24, 44], fill=(255, 150, 50, 255))
    d.point((21, 41), fill=(255, 232, 160, 255))
    return pg.outline(img)


# ---------------------------------------------------------------- Lirae the Ink-Wing, apprentice dragon
def lirae():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ink, ink_lt, ink_dk = (58, 74, 128, 255), (94, 114, 172, 255), (30, 36, 70, 255)
    belly = (168, 186, 214, 255)
    # folded wings behind the shoulders, ink-stained
    d.polygon([(1, 26), (6, 14), (12, 24), (12, 40), (3, 40)], fill=ink_dk)
    d.point((5, 28), fill=(20, 20, 30, 255))
    d.point((7, 33), fill=(20, 20, 30, 255))
    # body and round head
    d.ellipse([9, 26, 35, 52], fill=ink)
    d.ellipse([16, 31, 28, 46], fill=belly)
    d.ellipse([11, 6, 33, 28], fill=ink)
    d.ellipse([14, 7, 23, 15], fill=ink_lt)
    # stubby horn nubs and a little head fin
    d.polygon([(14, 9), (12, 2), (17, 7)], fill=(214, 200, 160, 255))
    d.polygon([(21, 6), (22, 1), (23, 6)], fill=ink_lt)
    # short muzzle
    d.ellipse([16, 18, 28, 27], fill=ink_lt)
    img = mirror(img)
    d = ImageDraw.Draw(img)
    # big eyes behind round gold spectacles
    for ex in (14, 25):
        d.ellipse([ex - 1, 12, ex + 5, 18], outline=(226, 176, 70, 255))
        d.rectangle([ex + 1, 14, ex + 3, 16], fill=(250, 246, 236, 255))
        d.rectangle([ex + 2, 14, ex + 3, 16], fill=INK)
    d.line([(19, 15), (24, 15)], fill=(226, 176, 70, 255))
    d.point((20, 24), fill=INK)
    d.point((23, 24), fill=INK)
    # a book hugged to the chest, and a quill
    d.rectangle([14, 34, 29, 44], fill=(120, 60, 40, 255))
    d.rectangle([14, 34, 29, 35], fill=(226, 176, 70, 255))
    d.line([(21, 34), (21, 44)], fill=(80, 36, 26, 255))
    d.line([(31, 42), (37, 26)], fill=(240, 236, 228, 255), width=2)
    d.line([(31, 42), (33, 44)], fill=(40, 40, 60, 255))
    return pg.outline(img)


# ---------------------------------------------------------------- Kael Ironwright, human smith
def kael():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    skin, skin_dk = (214, 160, 120, 255), (170, 118, 88, 255)
    hair = (60, 36, 26, 255)
    apron, shirt = (110, 70, 40, 255), (150, 150, 140, 255)
    d.polygon([(4, 46), (8, 32), (18, 28), (26, 28), (36, 32), (40, 46)], fill=shirt)
    d.polygon([(12, 46), (14, 32), (30, 32), (32, 46)], fill=apron)
    d.line([(14, 32), (18, 28)], fill=apron, width=2)
    d.line([(30, 32), (26, 28)], fill=apron, width=2)
    d.rectangle([18, 24, 26, 30], fill=skin_dk)
    d.ellipse([12, 6, 32, 28], fill=skin)
    d.chord([11, 3, 33, 22], 180, 360, fill=hair)
    d.rectangle([11, 10, 14, 22], fill=hair)
    d.rectangle([30, 10, 33, 18], fill=hair)
    d.polygon([(30, 8), (38, 4), (36, 10)], fill=hair)  # tied-back tail
    d.rectangle([11, 9, 33, 11], fill=(170, 40, 34, 255))  # bandana
    for ex in (17, 25):
        d.rectangle([ex, 15, ex + 1, 17], fill=INK)
    d.line([(16, 13), (19, 13)], fill=hair)
    d.line([(24, 13), (27, 13)], fill=hair)
    d.line([(19, 23), (24, 23)], fill=(150, 80, 70, 255))
    d.point((14, 19), fill=(80, 70, 70, 255))  # soot smudge
    d.point((15, 20), fill=(80, 70, 70, 255))
    # hammer over the shoulder
    d.line([(36, 44), (40, 22)], fill=(140, 96, 52, 255), width=2)
    d.rectangle([36, 16, 43, 22], fill=(150, 154, 166, 255))
    return pg.outline(img)


# ---------------------------------------------------------------- Captain Rodain, orc veteran
def rodain():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    skin, skin_dk = (112, 134, 98, 255), (78, 96, 70, 255)
    steel, steel_lt = (120, 128, 142, 255), (178, 186, 200, 255)
    sash = (168, 38, 34, 255)
    d.polygon([(0, 46), (3, 33), (15, 28), (22, 28), (22, 46)], fill=(70, 60, 56, 255))
    d.ellipse([0, 28, 15, 40], fill=steel)
    d.ellipse([2, 29, 9, 34], fill=steel_lt)
    d.rectangle([16, 22, 22, 30], fill=skin_dk)
    d.ellipse([9, 5, 33, 28], fill=skin)
    d.rectangle([10, 17, 33, 28], fill=skin)
    d.ellipse([12, 6, 20, 12], fill=(134, 156, 116, 255))
    d.polygon([(9, 13), (4, 9), (10, 18)], fill=skin_dk)  # ear
    d.line([(13, 13), (19, 15)], fill=skin_dk, width=2)  # heavy brow
    img = mirror(img)
    d = ImageDraw.Draw(img)
    for ex in (15, 26):
        d.rectangle([ex, 16, ex + 2, 17], fill=(240, 200, 90, 255))
        d.point((ex + 1, 16), fill=INK)
    # tusks, jaw, scar over the left eye
    d.rectangle([16, 24, 17, 27], fill=(236, 226, 196, 255))
    d.rectangle([26, 24, 27, 27], fill=(236, 226, 196, 255))
    d.line([(18, 26), (25, 26)], fill=(50, 40, 40, 255))
    d.line([(14, 12), (18, 21)], fill=(200, 120, 110, 255))
    # top-knot
    d.rectangle([20, 1, 23, 6], fill=(40, 32, 30, 255))
    d.ellipse([19, 0, 24, 3], fill=(40, 32, 30, 255))
    # captain's sash across the chest and a spear
    d.polygon([(10, 46), (30, 30), (34, 34), (16, 46)], fill=sash)
    d.point((31, 33), fill=(240, 192, 96, 255))
    d.line([(41, 46), (41, 4)], fill=(120, 84, 50, 255), width=2)
    d.polygon([(39, 6), (41, 0), (43, 6)], fill=steel_lt)
    return pg.outline(img)


# ---------------------------------------------------------------- Scout Mirael, wood elf
def mirael():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    skin, skin_dk = (238, 206, 176, 255), (206, 164, 136, 255)
    hair, hair_lt = (186, 90, 46, 255), (222, 130, 70, 255)
    cloak, cloak_dk = (42, 112, 100, 255), (24, 70, 64, 255)
    d.polygon([(2, 46), (6, 30), (16, 26), (22, 26), (22, 46)], fill=cloak)
    d.polygon([(4, 46), (7, 32), (12, 30), (10, 46)], fill=cloak_dk)  # hood folds
    d.rectangle([17, 22, 22, 28], fill=skin_dk)
    d.ellipse([12, 6, 32, 28], fill=skin)
    # long elven ear
    d.polygon([(12, 14), (2, 6), (5, 12), (12, 19)], fill=skin)
    d.line([(11, 15), (5, 10)], fill=skin_dk)
    d.chord([11, 3, 33, 22], 180, 360, fill=hair)
    d.rectangle([12, 9, 15, 14], fill=hair)
    img = mirror(img)
    d = ImageDraw.Draw(img)
    # braid over the right shoulder
    for i, y in enumerate(range(14, 38, 4)):
        d.ellipse([29 + (i % 2), y, 34 + (i % 2), y + 5], fill=hair if i % 2 else hair_lt)
    for ex in (16, 26):
        d.rectangle([ex, 15, ex + 1, 17], fill=(40, 120, 90, 255))
        d.point((ex, 15), fill=INK)
    d.line([(15, 13), (18, 12)], fill=hair)
    d.line([(26, 12), (29, 13)], fill=hair)
    for fx, fy in [(15, 20), (17, 21), (27, 20), (29, 21)]:
        d.point((fx, fy), fill=(200, 130, 100, 255))  # freckles
    d.line([(20, 24), (24, 24)], fill=(170, 100, 90, 255))
    # brass compass on the chest
    d.ellipse([18, 34, 26, 42], fill=(214, 170, 70, 255))
    d.ellipse([20, 36, 24, 40], fill=(240, 228, 190, 255))
    d.line([(22, 37), (23, 39)], fill=(170, 40, 34, 255))
    return pg.outline(img)


# ---------------------------------------------------------------- townsfolk of many peoples (11x16)
def townsfolk(kind, carry):
    img = Image.new("RGBA", (11, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    skins = {"human": (232, 184, 140, 255), "elf": (240, 214, 184, 255),
             "dwarf": (214, 160, 120, 255), "horned": (150, 120, 168, 255)}
    hairs = {"human": (110, 70, 40, 255), "elf": (232, 206, 120, 255),
             "dwarf": (170, 80, 40, 255), "horned": (40, 30, 50, 255)}
    tunics = {"human": (150, 64, 44, 255), "elf": (60, 120, 90, 255),
              "dwarf": (90, 96, 130, 255), "horned": (120, 90, 50, 255)}
    skin, hair, tunic = skins[kind], hairs[kind], tunics[kind]
    top = 2 if kind == "dwarf" else 1  # dwarves stand a little shorter
    d.rectangle([3, top, 7, top + 4], fill=skin)
    d.rectangle([3, top - 1, 7, top], fill=hair)
    d.point((4, top + 2), fill=INK)
    d.point((6, top + 2), fill=INK)
    if kind == "elf":
        d.point((2, top + 1), fill=skin)
        d.point((8, top + 1), fill=skin)
    if kind == "horned":
        d.point((3, top - 2), fill=(230, 220, 200, 255))
        d.point((7, top - 2), fill=(230, 220, 200, 255))
    d.rectangle([2, top + 5, 8, 11], fill=tunic)
    if kind == "dwarf":
        d.rectangle([3, top + 3, 7, top + 7], fill=hair)  # big beard
        d.point((4, top + 2), fill=INK)
        d.point((6, top + 2), fill=INK)
    d.rectangle([2, 11, 8, 12], fill=(96, 60, 36, 255))
    d.rectangle([3, 13, 4, 15], fill=(70, 50, 40, 255))
    d.rectangle([6, 13, 7, 15], fill=(70, 50, 40, 255))
    if carry:
        d.ellipse([6, 4, 10, 9], fill=(200, 160, 90, 255))
        d.point((8, 5), fill=(240, 210, 120, 255))
    return pg.outline(img)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, fn in [("bust-pyreth", pyreth), ("bust-lirae", lirae), ("bust-kael", kael),
                     ("bust-rodain", rodain), ("bust-mirael", mirael)]:
        pg.save(fn(), name + ".png", 4)
    for kind in ("human", "elf", "dwarf", "horned"):
        pg.save(townsfolk(kind, False), f"folk-{kind}.png", 3)
        pg.save(townsfolk(kind, True), f"folk-{kind}-carry.png", 3)
    print("ok")
