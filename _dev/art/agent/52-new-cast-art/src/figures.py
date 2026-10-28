"""The new cast as small figures, v1, 2026-10-28, at the people's scale (official/people: 11-15 wide, 16-20 tall).

Owner: chapters 9 to 13 approved ("Lock them in"); their art is a story picture for each chapter and a small
Varn on the Warfront wall, who strikes on his own. The busts (official/cast) set each figure's colors and
marks; the figures are drawn here at the size of the people on the wall.

Each grid is the figure's colors only; the ink outline is grown around it (pixkit.outline), so the grids are
one pixel smaller than the sprite on every side. 'k' inside a grid is ink drawn on purpose (eyes, a visor).
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from pixkit import from_grid, outline  # noqa: E402

CLEAR = (0, 0, 0, 0)


def figure(rows, key):
    """A grid, padded by a pixel and wrapped in ink."""
    img = from_grid(rows, {"k": "ink", **key})
    pad = Image.new("RGBA", (img.width + 2, img.height + 2), CLEAR)
    pad.alpha_composite(img, (1, 1))
    return outline(pad)


# --- Varn: a young green dragon, a first-year (bust: emerald, parch belly and horns, gold eyes) ---------
VARN = {"B": "emerald2", "C": "emerald3", "A": "emerald1", "H": "parch3", "G": "parch2", "h": "parch2",
        "D": "gold5", "F": "fire2", "f": "fire3", "e": "fire1"}

VARN_PERCHED = [
    "...........",
    "...........",
    "...........",
    "...........",
    "...........",
    "..h.....h..",
    ".CCBBBBBBA.",
    ".CBDBBBDBA.",
    ".CBDBBBDBA.",
    ".CBBBBBBBA.",
    ".CCCkCkCCA.",
    "..CCCCCCA..",
    "AA.BHHHB.AA",
    "AA.BGGGB.AA",
    "AA.BHHHB.AA",
    ".A.BGGGB.A.",
    "...BB.BBAA.",
]

# Rearing to breathe: the wings lift and the head goes back
VARN_REAR = [
    "...........",
    "...........",
    "...........",
    "...........",
    "..h.....h..",
    ".CCBBBBBBA.",
    ".CBDBBBDBA.",
    "ACBDBBBDBAA",
    "ACBBBBBBBAA",
    "ACCCkCkCCAA",
    "AACCCCCCAAA",
    "A..BHHHB..A",
    "...BGGGB...",
    "...BHHHB...",
    "...BGGGB...",
    "...BB.BBAA.",
    "...........",
]

# The breath: the jaw open, a gout of fire
VARN_BREATH = [
    "....e.e....",
    "...eFfFe...",
    "....FfF....",
    "...eFfFe...",
    "....eFe....",
    ".h.kfffk.h.",
    ".CCkkkkkCA.",
    ".CBBBBBBBA.",
    ".CBDBBBDBA.",
    ".CBBBBBBBA.",
    "..CCCCCCA..",
    "AA.BHHHB.AA",
    "AA.BGGGB.AA",
    "AA.BHHHB.AA",
    ".A.BGGGB.A.",
    "...BB.BBAA.",
    "...........",
]

VARN_FLYING = [
    "......h.....h......",
    ".....CCBBBBBBA.....",
    ".....CBDBBBDBA.....",
    "A....CBDBBBDBA....A",
    "AA...CBBBBBBBA...AA",
    "AAA..CCCkCkCCA..AAA",
    "AAAA..CCCCCCA..AAAA",
    "AAAAAABHHHHHBAAAAAA",
    ".AAAAABGGGGGBAAAAA.",
    "..AAA.BHHHHHB.AAA..",
    "....A..BGGGB..A....",
    ".......B...BAA.....",
]

# --- Sera: a bear of the northern clans, steel cap, mail, the round shield with its gold cross ---------
SERA = {"N": "wood3", "O": "wood4", "L": "wood1", "C": "ash3", "B": "ash2", "J": "steel3", "K": "steel4",
        "I": "steel2", "H": "steel1", "M": "wood2", "m": "wood3", "D": "gold4", "P": "steel3"}

SERA_STANDING = [
    "..NN.KJK.NN.",
    "..NLKKJKKLN.",
    "..NNNKJKNNO.",
    "..NNNNNNNNO.",
    "..NNkNNNkNO.",
    "..NNCCCCCNO.",
    "..NNCCkCCNO.",
    "...NCCCCCO..",
    "..PPPNNNNO..",
    ".PMMMP.HIHI.",
    "PMMDMMPIHIHN",
    "PMDDDMPHIHIN",
    "PMMDMMPIHIHN",
    "PMMDMMPHIHI.",
    ".PMMMP.IHIH.",
    "..PPP..OO.O.",
    "......OO..OO",
    "......KK..KK",
]

# --- Thornwick: the exiled mage, tall blue hat with its gold band, gray beard, starry robe, staff ------
THORN = {"D": "azure1", "E": "azure2", "M": "night2", "J": "gold4", "Q": "wood4", "P": "wood3", "C": "ash3",
         "B": "ash2", "K": "gold5", "w": "wood2", "s": "gold5", "S": "fire2"}

THORNWICK_STANDING = [
    "....D.....s.",
    "....DD...sSs",
    "...DDM....w.",
    "...DDDM...w.",
    "..DDDDDM..w.",
    "JJJJJJJJJ.w.",
    ".QQQQQQQ..w.",
    ".QkQQQkQ..w.",
    ".QQPPPQQ..w.",
    ".QCCCCCQ..w.",
    "..CCCCC...w.",
    ".DDCCCDDDDw.",
    "EDDDCDDDDDw.",
    "EDKDDDDKDDw.",
    "EDDDDDDDDDw.",
    "EDDDKDDDDDw.",
    "EDDDDDDDKDw.",
    "EDDKDDDDDDw.",
    ".DDDDDDDDD..",
    "..QQ...QQ...",
]

# --- The Hollow Knight: a great helm with a dim light in its slit, dark crest, dark surcoat ------------
KNIGHT = {"G": "steel3", "H": "steel4", "E": "steel1", "F": "steel2", "B": "shadow1", "C": "shadow2",
          "D": "shadow3", "l": "steel2", "J": "steel4"}

KNIGHT_STANDING = [
    "....BB....",
    "...BCB....",
    "..HHHHHE..",
    ".HGGGGGGE.",
    ".HGGHGGGE.",
    ".kkkkkkkk.",
    ".HlkkklkE.",
    ".HGGHGGGE.",
    ".HGGHGGGE.",
    "FFHGGGGEFF",
    "FDCCCCCCBF",
    "GDCCCCCCBG",
    ".DCCCCCCBJ",
    ".DCCCCCCBJ",
    ".DCCCCCCBJ",
    ".DCCC.CCBJ",
    ".DCC..CCB.",
    "..GG..GG..",
]
KNIGHT_WALKING = [
    "....BB....",
    "...BCB....",
    "..HHHHHE..",
    ".HGGGGGGE.",
    ".HGGHGGGE.",
    ".kkkkkkkk.",
    ".HlkkklkE.",
    ".HGGHGGGE.",
    ".HGGHGGGE.",
    "FFHGGGGEFF",
    "FDCCCCCCBF",
    "GDCCCCCCBG",
    ".DCCCCCCBJ",
    ".DCCCCCCBJ",
    ".DCCCCCCBJ",
    ".DCC..CCBJ",
    ".GG....GG.",
    "GG......GG",
]


def figures():
    """Every figure: (name, image)."""
    return [
        ("ppl_varn_perched", figure(VARN_PERCHED, VARN)),
        ("ppl_varn_rear", figure(VARN_REAR, VARN)),
        ("ppl_varn_breath", figure(VARN_BREATH, VARN)),
        ("ppl_varn_flying", figure(VARN_FLYING, VARN)),
        ("ppl_sera", figure(SERA_STANDING, SERA)),
        ("ppl_thornwick", figure(THORNWICK_STANDING, THORN)),
        ("ppl_hollow-knight", figure(KNIGHT_STANDING, KNIGHT)),
        ("ppl_hollow-knight_walk", figure(KNIGHT_WALKING, KNIGHT)),
    ]


# --- Ashara: the eldest, vast and gray, long horns swept back, gold eyes, the furnace in her jaw ---------
ASHARA = {"C": "ash3", "B": "ash2", "A": "ash1", "W": "wood3", "Y": "gold4", "F": "fire2", "f": "fire1"}

ASHARA_HEAD = [
    "W...........W",
    "WW.........WW",
    ".WW.......WW.",
    "..WWBBBBBWW..",
    "...CBBBBBA...",
    "..CBYBBBYBA..",
    "..CBBBBBBBA..",
    "...CBBBBBA...",
    "...CkFFFkA...",
    "....CfFfA....",
    ".....BBB.....",
]


def ashara_flying():
    """Ashara coming down from the mountain, wings spread: 49x33. She is far bigger than the people: the
    head is a grid, wings and body are shapes at her own pixel scale; then all of her is wrapped in ink. The
    near (left) side is lit."""
    from PIL import ImageDraw
    from pixkit import PALETTE as P

    w, h = 47, 31
    img = Image.new("RGBA", (w, h), CLEAR)
    d = ImageDraw.Draw(img)
    c = lambda n: P[n] + (255,)  # noqa: E731
    mid = w // 2
    for side in (-1, 1):
        x = lambda v: mid + side * v  # noqa: E731
        lit = side < 0
        bone, skin = c("ash3" if lit else "ash2"), c("ash1")
        d.polygon([(x(4), 14), (x(13), 7), (x(23), 3), (x(22), 10), (x(19), 18), (x(13), 21), (x(6), 20)], fill=skin)
        d.line([(x(4), 14), (x(13), 7), (x(23), 3)], fill=bone)                 # the arm and the long finger
        d.line([(x(13), 7), (x(19), 17)], fill=bone)
        d.line([(x(13), 7), (x(12), 20)], fill=bone)
    d.ellipse([mid - 5, 13, mid + 5, 27], fill=c("ash2"))                         # the body
    d.line([(mid - 5, 18), (mid - 5, 22)], fill=c("ash3"))
    d.rectangle([mid - 2, 9, mid + 2, 14], fill=c("ash2"))                        # the neck
    for y in range(11, 26, 2):                                                    # the throat and belly plates
        half = 1 if y < 14 else (3 if 15 < y < 24 else 2)
        d.line([(mid - half, y), (mid + half, y)], fill=c("parch1"))
    for lx in (mid - 5, mid + 4):                                                 # the hind legs
        d.rectangle([lx, 26, lx + 1, 28], fill=c("ash1"))
    d.line([(mid + 1, 27), (mid + 6, 30), (mid + 10, 29)], fill=c("ash1"))        # the tail
    head = from_grid(ASHARA_HEAD, {"k": "ink", **ASHARA})
    img.alpha_composite(head, (mid - 6, 0))
    pad = Image.new("RGBA", (w + 2, h + 2), CLEAR)
    pad.alpha_composite(img, (1, 1))
    return outline(pad)
