"""The Consumption icon (the Stats screen's food eaten per second), options, 2026-10-27.

It was the Ionicons speedometer: too thin to read at 12x12, and too modern. The owner chose a leaking grain
sack (the stores draining, food and loss in one picture) and asked to see the other ideas beside it:
  a: a grain sack split at the corner, grain spilling into a little pile (the owner's choice);
  b: a candle clock, a marked candle burning down (time used up; says nothing of food);
  c: the gauge redrawn to read: a dark face, a green-to-gold arc, a two-pixel needle, a gold hub.

Output: out/icon_consumption_v2[a|b|c].png (v1 is out/icon_gauge_v1.png). Run: python src/make_consumption.py
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE / "src"))
from make_icons import OUT, PREVIEW, drawn, grid, line, upscale  # noqa: E402

SACK = (["............",
         "...TTT......",
         "....c.......",
         "...LSS......",
         "..LSSSS.....",
         ".LSSSSSs....",
         ".LSSSSSs....",
         ".LSSSSkg....",
         ".LSSSSs.g...",
         "..sssss.g...",
         ".......gGGg.",
         "............"],
        {"T": "parch3", "c": "wood2", "L": "parch3", "S": "parch2", "s": "parch1", "k": "wood1",
         "g": "gold4", "G": "gold5"})

CANDLE = (["............",
           ".....F......",
           ".....f......",
           "....WWw.....",
           "....WWw.....",
           "....mmm.....",
           "....WWw.....",
           "....WWw.....",
           "....mmm.....",
           "...dWWwd....",
           "..DDDDDDD...",
           "............"],
          {"F": "fire2", "f": "fire3", "W": "parch3", "w": "parch2", "m": "wood2", "d": "parch2", "D": "gold4"})


def gauge(cells):
    """A dark dial, a green-to-gold arc around it, a thick needle swung right, a gold hub."""
    import math
    for y in range(2, 10):
        for x in range(1, 11):
            dx, dy = x - 5.5, 9 - y
            d = math.hypot(dx, dy)
            if d > 5.2:
                continue
            if d > 4.3:
                cells[(x, y)] = "steel3"
            elif d > 3.2:
                a = math.atan2(dy, dx)
                cells[(x, y)] = "green3" if a > 2.1 else "gold4" if a > 1.0 else "gold5"
            else:
                cells[(x, y)] = "night2"
    line(cells, (5, 9), (8, 5), "steel5")
    line(cells, (6, 9), (9, 5), "steel4")
    for x in range(1, 11):
        cells[(x, 10)] = "steel2"
    cells[(5, 9)] = cells[(6, 9)] = "gold4"


def main():
    for name, img in (("icon_consumption_v2a", grid(*SACK)), ("icon_consumption_v2b", grid(*CANDLE)),
                      ("icon_consumption_v2c", drawn((12, 12), gauge))):
        img.save(OUT / f"{name}.png")
        upscale(img, 8).save(PREVIEW / f"{name}_x8.png")
    print("3 options")


if __name__ == "__main__":
    main()
