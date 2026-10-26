"""Preview: the fighter jabs on the Warfront wall, and the hit spark fires at the tip.

Writes preview/scene_warfront.gif at x6. Run after build.py: python scene.py
"""
import pathlib

from PIL import Image

HERE = pathlib.Path(__file__).parent
REF = HERE.parents[1] / "reference"
OUT = HERE / "out"
CROP = (30, 190, 100, 240)  # the wall top in warfront-bg
FEET = (30, 38)             # the fighter's feet, inside the crop


def load(p):
    return Image.open(p).convert("RGBA")


def frames(name, n, w):
    s = load(OUT / f"{name}_strip{n}.png")
    return [s.crop((i * w, 0, (i + 1) * w, s.height)) for i in range(n)]


bg = load(REF / "warfront-bg.png").crop(CROP)
idle = load(OUT / "ppl_fighter_idle.png")
back, thrust = frames("ppl_fighter_attack", 2, 16)
spark = frames("fx_spark", 4, 12)

# (fighter, spark frame or None, hold in ms)
beats = [(idle, None, 500), (back, None, 160), (thrust, 0, 90), (thrust, 1, 90),
         (thrust, 2, 90), (back, 3, 120), (idle, None, 300)]
out, durations = [], []
for fig, sp, ms in beats:
    f = bg.copy()
    f.alpha_composite(fig, (FEET[0] - 5, FEET[1] - 19))
    if sp is not None:
        f.alpha_composite(spark[sp], (FEET[0] - 5 + 15 - 5, FEET[1] - 19 + 12 - 5))
    out.append(f.resize((f.width * 6, f.height * 6), Image.NEAREST).convert("RGB"))
    durations.append(ms)
out[0].save(HERE / "preview" / "scene_warfront.gif", save_all=True, append_images=out[1:],
            duration=durations, loop=0)
out[3].save(HERE / "preview" / "scene_warfront_still.png")
print("scene written")
