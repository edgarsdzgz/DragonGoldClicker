"""The five future busts, v1, 2026-10-27: Varn, Ashara, Thornwick, Sera, the Hollow Knight.

Same rules as the locked simpler busts (31-busts-simple, v4): 22x23, shown at x2, light from the upper
left, drawn with that batch's Bust class. Who they are comes from refined-systems.md (Unique Recruits)
and cast-and-peoples.md:
- Varn, Dragon Recruit: "A young dragon, barely fledged ... I want to fight like you."
- Ashara, Elder Wyrm: "She is ancient. She is tired. She is angry."
- Thornwick, the Exiled Mage: banished for "reckless experimentation"; wry, reckless.
- Sera the Shieldmaiden: "A warrior of the old guard."
- The Hollow Knight: "No one knows what's inside the armor." Nothing shows through the visor.

Run: python src/make_busts.py
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE.parent / "00-foundation"))
sys.path.insert(0, str(HERE.parent / "31-busts-simple" / "src"))
from make_busts import Bust  # noqa: E402
from pixkit import upscale  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"


def varn():
    b = Bust()
    b.pts([(2, 13), (1, 14), (2, 14), (3, 14), (1, 15), (2, 15), (3, 15), (2, 16), (3, 16)],
          "emerald1", True)                                              # wing nubs, barely fledged
    b.pts([(2, 13), (19, 13)], "emerald2")
    b.rect(3, 17, 10, 22, "emerald2", True, round=True)                  # body
    b.shade(3, 17, 18, 22, "emerald2", "emerald3", "emerald1")
    b.rect(9, 17, 12, 22, "parch3")                                      # belly scales
    for y in (18, 20, 22):
        b.rect(9, y, 12, y, "parch2")
    b.pts([(6, 2), (6, 3), (7, 3)], "parch3", True)                      # little horns
    b.pts([(15, 2), (15, 3)], "parch2")
    b.rect(5, 4, 16, 16, "emerald2", round=True)                         # a big young head
    b.shade(5, 4, 16, 16, "emerald2", "emerald3", "emerald1")
    b.rect(7, 8, 8, 10, "gold5", True)                                   # wide eyes
    b.px(7, 8, "gold6", True)
    b.rect(8, 12, 13, 15, "emerald3")                                    # snout
    b.rect(13, 12, 13, 15, "emerald2")
    b.px(9, 13, "ink", True)
    b.rect(10, 15, 11, 15, "ink")                                        # a grin
    b.rect(19, 2, 19, 14, "wood3")                                       # the wooden practice sword
    b.pts([(19, 4), (19, 7), (19, 10)], "wood4")
    b.rect(17, 15, 21, 15, "wood1")                                      # crossguard
    b.rect(19, 16, 19, 18, "wood2")                                      # grip, in his claw
    b.rect(18, 17, 20, 18, "emerald2")
    b.px(18, 17, "emerald3")
    return b.image()


def ashara():
    b = Bust()
    b.rect(1, 16, 10, 22, "ash1", True, round=True)                      # neck and shoulders
    b.shade(1, 16, 20, 22, "ash1", "ash2", "shadow1")
    b.rect(8, 16, 13, 22, "parch1")                                      # throat plates
    for y in (17, 19, 21):
        b.rect(8, y, 13, y, "wood3")
    b.pts([(5, 4), (4, 3), (4, 2), (3, 2), (3, 1), (2, 1), (2, 0), (1, 0)], "parch2")   # a long swept horn
    b.pts([(4, 2), (3, 1)], "parch3")
    b.pts([(16, 4), (17, 3), (17, 2), (18, 2)], "parch2")                # the other, broken off
    b.px(18, 1, "parch1")
    b.pts([(3, 6), (2, 7), (3, 7), (3, 9), (2, 10), (3, 10), (4, 12)], "parch1", True)  # ragged frills
    b.rect(5, 3, 16, 15, "ash2", round=True)                             # head
    b.shade(5, 3, 16, 15, "ash2", "ash3", "ash1")
    b.pts([(6, 6), (7, 6), (7, 7), (8, 7), (9, 7)], "shadow1", True)     # the brow, drawn down
    b.rect(8, 8, 9, 8, "fire2", True)                                    # narrow, burning eyes
    b.rect(8, 10, 13, 14, "ash3")                                        # the long snout
    b.rect(13, 10, 13, 14, "ash2")
    b.px(9, 11, "ink", True)
    b.rect(8, 14, 13, 14, "fire1")                                       # the furnace behind her teeth
    b.pts([(8, 13), (13, 13)], "parch3")
    b.pts([(13, 5), (14, 6), (14, 7)], "ash1")                           # an old wound in the scales
    b.pts([(19, 6), (20, 5), (19, 4), (20, 3), (21, 2)], "ash3")         # smoke, rising
    return b.image()


def thornwick():
    b = Bust()
    b.rect(1, 16, 11, 22, "azure1", True, round=True)                    # robe
    b.shade(1, 16, 20, 22, "azure1", "azure2", "night2")
    b.pts([(4, 19), (6, 21), (16, 20)], "gold5")                         # stars on the robe
    b.rect(6, 8, 15, 15, "skin1", round=True)                            # face
    b.shade(6, 8, 15, 15, "skin1", "skin2", "clay3")
    b.pts([(7, 9), (8, 9)], "ash3")                                      # one brow level
    b.pts([(13, 8), (14, 8)], "ash3")                                    # the other raised: wry
    b.pts([(7, 10), (8, 10), (13, 10), (14, 10)], "night1")              # eyes
    b.pts([(10, 11), (11, 11), (11, 12)], "clay3")                       # nose
    b.rect(7, 13, 14, 18, "ash3", round=True)                            # beard
    b.rect(14, 14, 14, 17, "ash2")
    b.pts([(8, 18), (10, 19), (12, 18), (13, 19), (7, 17)], "ash1")      # its singed ends
    b.pts([(11, 15), (12, 15)], "ink")                                   # a crooked smile
    for y, x0, x1 in ((7, 3, 18), (6, 5, 16), (5, 6, 15), (4, 7, 14), (3, 8, 13), (2, 9, 12), (1, 11, 13)):
        b.rect(x0, y, x1, y, "azure1")                                   # the hat
    b.shade(3, 1, 18, 7, "azure1", "azure2", "night2")
    b.rect(5, 6, 16, 6, "gold4")                                         # its band
    b.pts([(13, 0), (14, 0), (14, 1)], "ink")                            # a scorched tip
    b.pts([(15, 0), (16, 1)], "ash3")
    b.rect(7, 4, 9, 5, "steel3")                                         # goggles on the band
    b.rect(12, 4, 14, 5, "steel3")
    b.pts([(8, 5), (13, 5)], "sea3")
    b.rect(18, 17, 19, 18, "skin1")                                      # his hand, holding a spark
    b.pts([(19, 13), (18, 14), (20, 14), (19, 15)], "fire2")
    b.px(19, 14, "fire3")
    b.pts([(17, 12), (21, 12), (21, 16)], "fire1")
    return b.image()


def sera():
    b = Bust()
    b.rect(1, 16, 11, 22, "steel2", True, round=True)                    # mail
    b.shade(1, 16, 20, 22, "steel2", "steel3", "steel1")
    for y in range(17, 23):
        for x in range(2 + y % 2, 20, 2):
            if b.cells.get((x, y)) == "steel2":
                b.px(x, y, "steel1")                                     # the rings
    b.rect(5, 7, 16, 15, "skin2", round=True)                            # face
    b.shade(5, 7, 16, 15, "skin2", "skin3", "skin1")
    for y in range(7, 19):                                               # gray braids, both sides
        b.rect(4, y, 5, y, "ash3" if y % 2 else "ash2", True)
    b.rect(5, 2, 16, 7, "steel3", round=True)                            # the helm
    b.shade(5, 2, 16, 7, "steel3", "steel4", "steel2")
    b.rect(10, 1, 11, 7, "steel4")                                       # its ridge
    b.rect(10, 8, 11, 11, "steel3")                                      # nose guard
    b.px(11, 11, "steel2")
    b.rect(7, 9, 8, 9, "azure3", True)                                   # eyes
    b.pts([(7, 8), (8, 8)], "ash2", True)                                # brows
    b.rect(9, 13, 12, 13, "skin1")                                       # a set mouth
    b.pts([(7, 12), (14, 12)], "skin1")                                  # lines of age
    for y in range(14, 23):                                              # the round shield, in front
        for x in range(0, 11):
            d = (x - 5) ** 2 + (y - 19) ** 2
            if d <= 26:
                b.px(x, y, "steel3" if d > 17 else "wood3")
    b.pts([(3, 16), (2, 17), (2, 18)], "wood4")
    b.rect(4, 18, 6, 20, "gold4", round=True)                            # its boss
    b.px(5, 18, "gold5")
    b.rect(0, 22, 10, 22, "steel1")
    return b.image()


def hollow_knight():
    b = Bust()
    b.rect(1, 16, 11, 22, "shadow2", True, round=True)                   # a tattered cloak
    b.shade(1, 16, 20, 22, "shadow2", "shadow3", "shadow1")
    for x in (2, 5, 9, 15, 18):
        b.cells.pop((x, 22), None)                                       # its torn hem
    b.rect(2, 15, 6, 18, "steel2", True, round=True)                     # pauldrons
    b.rect(3, 15, 5, 15, "steel3", True)
    b.rect(2, 18, 6, 18, "steel1", True)
    b.rect(7, 15, 14, 16, "steel2")                                      # gorget
    b.rect(5, 3, 16, 14, "steel3", round=True)                           # the great helm
    b.shade(5, 3, 16, 14, "steel3", "steel4", "steel1")
    b.rect(10, 3, 10, 14, "steel4")                                      # its ridge
    b.rect(6, 8, 15, 8, "ink")                                           # the visor's slits: nothing behind
    b.rect(10, 8, 11, 12, "ink")
    b.pts([(7, 11), (7, 13), (14, 11), (14, 13), (8, 12), (13, 12)], "steel1")   # breathing holes
    b.pts([(14, 5), (15, 6)], "steel2")                                  # a dent
    b.pts([(11, 0), (12, 0), (12, 1), (13, 1), (14, 1), (13, 2), (12, 2), (11, 2)], "shadow1")   # a black plume
    b.px(12, 1, "shadow2")
    return b.image()


BUSTS = {"varn": varn, "ashara": ashara, "thornwick": thornwick, "sera": sera, "hollow-knight": hollow_knight}


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    for name, f in BUSTS.items():
        img = f()
        img.save(OUT / f"bust_{name}_v1.png")
        upscale(img, 8).save(PREVIEW / f"bust_{name}_v1_x8.png")
    print(len(BUSTS), "busts")


if __name__ == "__main__":
    main()
