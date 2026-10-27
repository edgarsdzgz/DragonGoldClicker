"""Simple mobs in the townsfolk's language (owner, 2026-10-27: "simple mobs, closer to the villagers").

Each monster is drawn as a flat fill grid, front-on like the townsfolk (one flat color per part,
dot eyes), then given its ink outline. What marks them as enemies: glowing gold eyes (a glow
color, so they shine at night), their signature colors (which no townsperson wears), and a weapon
or a menacing shape. Hit and hurt reuse Batch 4's poses: the idle's own pixels, moved.

Run: python make_mobs.py
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
BATCH = HERE.parent
sys.path.insert(0, str(BATCH.parent / "00-foundation"))
sys.path.insert(0, str(BATCH.parent / "21-warfront" / "src"))

import pixkit  # noqa: E402
from make_warfront import hit_pose, hurt_pose  # noqa: E402

P = pixkit.PALETTE
OUT, PREVIEW = BATCH / "out", BATCH / "preview"


def hx(name):
    return "%02x%02x%02x" % P[name]


def draw(fill, key):
    """A fill grid (no outline) gets a one-pixel margin and its ink outline."""
    w, h = len(fill[0]), len(fill)
    rows = ["." * (w + 2)] + ["." + r + "." for r in fill] + ["." * (w + 2)]
    return pixkit.outline(pixkit.from_grid(rows, key))


MOBS = {
    # Kobold: small and scaly: horns sweeping back, a pale snout with nostrils, a tail curling out,
    # a short spear.
    "kobold": dict(
        fill=["t.h.....h..",
              "t..hKKKh...",
              "p.KKKKKKK..",
              "p.KeKKKeK..",
              "p.KKKKKKK..",
              "p..SnSnS...",
              "p..SSSSS...",
              "pKKKKKKKK..",
              "p.KKkkkKK..",
              "p.KKkkkKK.T",
              "p.KKkkkKKTT",
              "p..KK.KKT..",
              "p.KKK.KKK.."],
        key={"K": "kobold2", "k": "kobold3", "S": "kobold3", "e": "gold5", "h": "parch1",
             "n": "ink", "T": "kobold2", "t": "steel4", "p": "wood3"},
        pose=dict(waist=7, back=0, eyes={hx("gold5")}, lid=hx("kobold2"), body=hx("kobold2"),
                  dark=hx("kobold1"), spots=[(4, 9), (8, 10)], weapon=lambda x, y: x <= 1 and y <= 5)),
    # Goblin: a wide head with long ears, a toothy grin, a ragged tunic, a dagger.
    "goblin": dict(
        fill=["GG.......GG",
              ".GGGGGGGGG.",
              "..GGGGGGG..",
              "..GeGGGeG..",
              "..GGGGGGG..",
              "..GaWaWaG.d",
              "...GGGGG..d",
              "..TTTTTTT.d",
              ".GTTTTTTTGh",
              ".GTTTTTTTG.",
              "..TTTTTTT..",
              "..TT...TT..",
              "..GG...GG.."],
        key={"G": "goblin2", "e": "gold5", "a": "ink", "W": "parch3", "T": "wood3", "d": "steel4",
             "h": "wood1"},
        pose=dict(waist=8, back=0, eyes={hx("gold5")}, lid=hx("goblin2"), body=hx("goblin2"),
                  dark=hx("goblin1"), spots=[(3, 3), (9, 4)], weapon=lambda x, y: x >= 11 and y <= 6)),
    # Shadow Crawler: a round shadow-purple spider, eight bent legs, four glowing eyes, fangs.
    "crawler": dict(
        fill=["....BBBBB....",
              "L..BBBBBBB..L",
              ".L.BeBBBeB.L.",
              "..LBBeBeBBL..",
              "LLLBBBBBBBLLL",
              "...LBWBWBL...",
              "..L..BBB..L..",
              ".L.........L."],
        key={"B": "shadow3", "L": "shadow1", "e": "gold5", "W": "parch3"},
        pose=dict(waist=6, back=0, eyes={hx("gold5")}, lid=hx("shadow3"), body=hx("shadow3"),
                  dark=hx("shadow2"), spots=[(5, 2), (9, 6)], weapon=lambda x, y: (x, y) in {(7, 7), (9, 7)})),
    # Orc: big and ash-gray, tusks, a leather harness with steel shoulders, a heavy axe.
    "orc": dict(
        fill=["...AAAAA....",
              "..AAAAAAA.ss",
              "..AeAAAeA.ss",
              "..AAAAAAA.sp",
              "..AWAAAWA..p",
              "..AWaaaWA..p",
              "...AAAAA...p",
              "MMMLLLLLMMMp",
              "MAALLLLLAAAp",
              ".AALLLLLAA.p",
              ".AALLLLLAA.p",
              ".A.BBBBB.A.p",
              "...LLLLL....",
              "...LL.LL....",
              "...AA.AA....",
              "..AAA.AAA..."],
        key={"A": "ash2", "e": "gold5", "W": "parch3", "a": "ink", "M": "steel2", "L": "wood2",
             "B": "wood3", "s": "steel4", "p": "wood3"},
        pose=dict(waist=7, back=0, eyes={hx("gold5")}, lid=hx("ash2"), body=hx("ash2"),
                  dark=hx("ash1"), spots=[(4, 2), (3, 10)], weapon=lambda x, y: x >= 11 and y <= 3)),
    # Raider: a human bandit at townsfolk size: a dark hood, a cloth mask, a stolen sack, a blade.
    "raider": dict(
        fill=["...NNNNN...",
              "..NNNNNNN..",
              "..NNCCCNN..",
              "..NaCaCNN..".replace("NaCaCNN", "NCaCaNN"),
              "..NMMMMMN..",
              "..NMMMMMN..",
              ".NNNNNNNNSS",
              "dNNNNNNNSSS",
              "dNNNNNNNSSS",
              "dNNNNNNN.S.",
              ".NNNNNNN...",
              ".NEEEEEEN..",
              "..FF.FF....",
              "..FF.FF....",
              "..FF.FF....",
              ".BBB.BBB..."],
        key={"N": "night2", "C": "skin1", "a": "ink", "M": "wood1", "S": "parch2", "d": "steel4",
             "E": "wood2", "F": "night1", "B": "wood2"},
        pose=dict(waist=7, back=0, eyes=set(), lid=None, body=None, dark=None, spots=[],
                  weapon=lambda x, y: x <= 1 and y <= 8)),
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    rows = []
    for name, m in MOBS.items():
        idle = draw(m["fill"], m["key"])
        hit, hurt = hit_pose(idle, m["pose"]), hurt_pose(idle, m["pose"])
        for st, im in (("idle", idle), ("hit", hit), ("hurt", hurt)):
            im.save(OUT / f"mob_{name}_{st}.png")
        rows.append((name, [idle, hit, hurt]))
    folk = [Image.open(p).convert("RGBA") for p in sorted((BATCH.parents[1] / "official" / "people").glob("ppl_*.png"))
            if "strip" not in p.name][:6]
    rows.append(("townsfolk", folk))
    pixkit.contact_sheet(rows, scale=6).save(PREVIEW / "mobs_x6.png")
    print("written")


if __name__ == "__main__":
    main()
