"""Batch 90: Valley Finds v1. Rabbit, berry bush, leaping fish, wild honey. Run: python -I make_finds.py"""
import json
import math
import pathlib
import sys

from PIL import Image

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from vkit import BATCH, S, Sprite, pixkit

OUT, PREVIEW, PISKEL = BATCH / "out", BATCH / "preview", BATCH / "piskel"


# ------------------------------------------------------------------ rabbit
def hare_sit():
    s = Sprite()
    s.ellipse(10.5, 16.5, 6, 5, "wood4")            # haunch and body
    s.ellipse(14, 14.5, 3.5, 4.5, "wood4")          # chest
    s.rect(12, 6, 13, 9, "wood4")
    s.rect(15, 5, 16, 9, "wood4")                   # ears
    s.pts([(13, 6), (13, 7), (13, 8), (16, 5), (16, 6), (16, 7)], "skin2")
    s.ellipse(15.5, 10.5, 3.5, 3, "wood4")          # head
    s.ellipse(18.5, 11.5, 1.8, 1.5, "wood4")        # snout
    s.ellipse(4.5, 15.5, 1.8, 1.8, "steel5")        # tail
    s.pts([(9, 12), (10, 12), (11, 12), (12, 12)], "gold3")  # lit back
    s.rect(7, 19, 14, 20, "wood2")                  # shadow side of the haunch
    s.rect(14, 17, 16, 19, "skin2")                 # pale chest
    s.rect(9, 21, 12, 21, "wood3")
    s.rect(15, 20, 17, 21, "wood3")                 # feet
    s.put(17, 10, "wood1")                          # eye
    s.put(20, 11, "rose3")                          # nose
    return s.done()


def hare_run(pose):
    s = Sprite()
    if pose == 0:    # gather: bunched, head up
        s.ellipse(11, 15.5, 6.5, 4, "wood4")
        s.ellipse(17, 12.5, 3.3, 3, "wood4")
        s.ellipse(20.5, 13.5, 1.6, 1.4, "wood4")
        s.rect(13, 5, 14, 9, "wood4")
        s.rect(16, 4, 17, 8, "wood4")
        s.pts([(13, 6), (13, 7), (16, 5), (16, 6)], "skin2")
        s.pts([(7, 12), (8, 12), (9, 12), (10, 12), (11, 12), (6, 13)], "gold3")
        s.rect(6, 18, 11, 19, "wood2")
        s.rect(8, 21, 12, 21, "wood3")
        s.rect(15, 18, 17, 20, "wood3")
        s.ellipse(4.5, 14.5, 1.7, 1.7, "steel5")
        s.put(18, 12, "wood1")
        s.put(21, 13, "rose3")
    elif pose == 1:  # stretched, airborne, ears laid back
        s.ellipse(11, 12, 8.5, 3.4, "wood4")
        s.ellipse(18.5, 10.5, 3, 2.7, "wood4")
        s.ellipse(21.5, 11.5, 1.5, 1.3, "wood4")
        s.rect(11, 6, 17, 7, "wood4")
        s.rect(12, 7, 15, 7, "skin2")
        s.pts([(5, 9), (6, 9), (7, 9), (8, 9), (9, 9), (10, 9)], "gold3")
        s.rect(7, 14, 15, 14, "wood2")
        s.rect(1, 13, 4, 14, "wood4")
        s.rect(1, 15, 4, 15, "wood3")
        s.rect(16, 14, 19, 15, "wood4")
        s.rect(20, 14, 22, 15, "wood3")
        s.ellipse(3.6, 10.5, 1.6, 1.6, "steel5")
        s.put(19, 10, "wood1")
        s.put(22, 11, "rose3")
    elif pose == 2:  # front paws reach, hind coming through
        s.ellipse(11, 14.5, 7, 3.8, "wood4")
        s.ellipse(18, 14.5, 3.2, 3, "wood4")
        s.ellipse(21.2, 15.5, 1.6, 1.4, "wood4")
        s.rect(13, 7, 14, 11, "wood4")
        s.rect(16, 7, 17, 11, "wood4")
        s.pts([(13, 8), (13, 9), (16, 8), (16, 9)], "skin2")
        s.pts([(6, 11), (7, 11), (8, 11), (9, 11), (10, 11), (11, 11)], "gold3")
        s.rect(7, 17, 14, 17, "wood2")
        s.rect(3, 18, 8, 19, "wood3")
        s.rect(17, 18, 21, 21, "wood3")
        s.ellipse(3.5, 14, 1.7, 1.7, "steel5")
        s.put(19, 14, "wood1")
        s.put(22, 15, "rose3")
    else:            # push off: hind feet down, body rising
        s.ellipse(10, 14.5, 6, 4.5, "wood4")
        s.ellipse(16.5, 11, 3.4, 3.1, "wood4")
        s.ellipse(20, 11.8, 1.7, 1.4, "wood4")
        s.rect(9, 5, 14, 8, "wood4")
        s.rect(10, 6, 13, 6, "skin2")
        s.pts([(6, 11), (7, 11), (8, 11), (9, 11), (10, 11), (5, 12)], "gold3")
        s.rect(5, 17, 10, 18, "wood2")
        s.rect(2, 19, 9, 21, "wood3")
        s.rect(14, 15, 18, 17, "wood3")
        s.ellipse(3.5, 13, 1.7, 1.7, "steel5")
        s.put(17, 10, "wood1")
        s.put(21, 11, "rose3")
    return s.done()


# ------------------------------------------------------------------ berry bush
# picking order: each tap removes one group of four berries
PICK = [[(6, 11), (14, 8), (8, 15), (15, 15)],
        [(10, 9), (17, 11), (5, 17), (13, 18)],
        [(12, 13), (11, 17), (18, 16), (8, 19)]]


def bush(state):
    s = Sprite()
    s.ellipse(12, 15, 10, 6.5, "green2")
    s.ellipse(8, 12, 5, 4, "green2")
    s.ellipse(15.5, 11.5, 5, 4, "green2")
    s.ellipse(11, 10.5, 4.5, 3, "green2")
    for (cx, cy, rx, ry) in ((8, 10.5, 3.5, 2), (14.5, 9.5, 3.5, 2), (10.5, 8.5, 2.5, 1.5), (5.5, 14, 2.5, 2)):
        s.ellipse(cx, cy, rx, ry, "green3")
    for y in range(17, 22):                       # cool shaded underside
        for x in range(2, 23):
            if s.px[x, y][3]:
                s.put(x, y, "green1")
    s.rect(10, 20, 13, 21, "wood3")               # stem base
    groups = {0: PICK[0] + PICK[1] + PICK[2], 1: PICK[1] + PICK[2], 2: PICK[2], 3: []}[state]
    for (x, y) in groups:
        s.rect(x, y, x + 1, y + 1, "ruby3")
        s.put(x, y, "ruby4")
        s.put(x + 1, y + 1, "ruby2")
    return s.done()


# ------------------------------------------------------------------ leaping fish
def fish_body(cx, cy, ang, length, thick):
    """A fish drawn along an angle (radians, 0 = faces right, -pi/2 = faces up)."""
    s = Sprite()
    ca, sa = math.cos(ang), math.sin(ang)
    for y in range(S):
        for x in range(S):
            dx, dy = x + 0.5 - cx, y + 0.5 - cy
            u = dx * ca + dy * sa
            v = -dx * sa + dy * ca
            t = u / (length / 2)
            if -1.0 <= t <= 1.0:
                h = thick * (1 - t * t) ** 0.55
                if t < -0.3:
                    h *= 0.75
                if abs(v) <= h:
                    f = v / max(h, 0.1)
                    # "up" in the world is the dark back: pick the side that points up on screen
                    side = f if (-sa * ca * 0 + ca * 1.0 - 0) is not None else f
                    up_is_neg_v = (ca >= 0)
                    g = f if up_is_neg_v else -f
                    s.put(x, y, "azure2" if g < -0.35 else ("steel4" if g < 0.35 else "steel5"))
            elif -1.7 < t < -1.0:                 # tail fan
                if abs(v) <= 0.7 + (-1.0 - t) * 4.5:
                    s.put(x, y, "fire1")
    hx, hy = cx + ca * length * 0.3, cy + sa * length * 0.3
    s.put(int(hx), int(hy - 1 if ca >= 0 else hy - 1), "wood1")   # eye
    return s


def fish_frame(i):
    cx, cy, ang, ln = [(11.5, 12, -1.15, 12), (12, 9, -0.25, 12), (12.5, 11.5, 1.05, 12), (12, 14, 1.45, 11)][i]
    body = fish_body(cx, cy, ang, ln, 3.6)
    water = Sprite()
    if i in (0, 3):
        water.rect(5, 20, 18, 21, "azure3")
        water.rect(6, 20, 17, 20, "azure4")
        if i == 3:
            for (x, y) in [(6, 17), (9, 15), (14, 15), (17, 17)]:
                water.rect(x, y, x, y + 3, "azure4")
    drops = {0: [(4, 16), (18, 14)], 1: [(8, 14), (15, 16)], 2: [(8, 16), (16, 17), (5, 12)],
             3: [(3, 13), (19, 12)]}[i]
    for (x, y) in drops:
        water.rect(x, y, x + 1, y + 1, "azure4")
        water.put(x + 1, y + 1, "azure3")
    if i == 3:   # the fish is going in: the water crown draws over its lower half
        merged = body.img.copy()
        merged.alpha_composite(water.img)
    else:
        merged = water.img.copy()
        merged.alpha_composite(body.img)
    out = Sprite()
    out.img, out.px = merged, merged.load()
    return out.done()


# ------------------------------------------------------------------ wild honey
def stump():
    s = Sprite()
    s.rect(4, 11, 19, 19, "wood3")
    s.rect(3, 19, 20, 21, "wood3")
    for x in range(3, 21):
        for y in range(11, 22):
            if s.px[x, y][3]:
                s.put(x, y, "wood4" if x < 7 else ("wood2" if x > 15 else "wood3"))
    s.ellipse(11.5, 11.5, 8, 2.6, "gold2")
    s.ellipse(11.5, 11.5, 5.2, 1.5, "parch3")
    s.ellipse(11.5, 11.5, 2.2, 0.8, "gold2")
    s.ellipse(11.5, 16.5, 4.6, 3.8, "wood1")      # the hollow
    s.pts([(2, 21), (21, 21), (22, 21)], "wood2")
    for (x0, y0) in ((9, 13), (11, 13), (13, 13), (8, 15), (10, 15), (12, 15), (14, 15), (9, 17), (11, 17), (13, 17)):
        s.rect(x0, y0, x0 + 1, y0 + 1, "gold4")
        s.put(x0, y0, "gold5")
        s.put(x0 + 1, y0 + 1, "gold3")
    s.rect(11, 19, 12, 20, "gold3")               # a drip
    return s


def honey_frame(i):
    s = stump()
    for k, (bx, by) in enumerate([(4, 6), (17, 4), (18, 12)]):
        ang = 2 * math.pi * (i / 4 + k / 3)
        x = int(round(bx + 2.4 * math.cos(ang)))
        y = int(round(by + 1.6 * math.sin(ang * 2)))
        s.rect(x, y + 1, x + 1, y + 2, "fire2")
        s.put(x, y + 1, "fire3")
        s.put(x + 1, y + 2, "fire1")
        s.put(x, y, "steel5")
        s.put(x + 1, y, "steel5" if i % 2 == 0 else "steel4")
    return s.done()


# ------------------------------------------------------------------ build
def main():
    for d in (OUT, PREVIEW, PISKEL):
        d.mkdir(exist_ok=True)
    assets = {"find_rabbit_idle": ([hare_sit()], None),
              "find_rabbit_run_strip4": ([hare_run(i) for i in range(4)], 10)}
    for i in range(4):
        assets[f"find_berries_{i}"] = ([bush(i)], None)
    assets["find_fish_leap_strip4"] = ([fish_frame(i) for i in range(4)], 6)
    assets["find_honey_strip4"] = ([honey_frame(i) for i in range(4)], 8)
    manifest = []
    for name, (frames, fps) in assets.items():
        errs, warns = [], []
        for fr in frames:
            e, w = pixkit.check(fr, {"size": (S, S), "budget": 16 if "honey" in name else 8})
            errs += e
            warns += w
        im = pixkit.strip(frames) if len(frames) > 1 else frames[0]
        im.save(OUT / f"{name}.png")
        if fps:
            pixkit.write_piskel(frames, fps, PISKEL / f"{name}.piskel", name)
            pixkit.write_gif(frames, fps, PREVIEW / f"{name}.gif", scale=8)
        pixkit.upscale(im, 8).save(PREVIEW / f"{name}_x8.png")
        manifest.append({"name": name, "file": f"{name}.png", "size": [S, S], "frames": len(frames), "fps": fps,
                         "anchor": "bottom centre, feet or base on row 21 (outline on 22)",
                         "errors": errs, "warnings": warns, "warning_count": len(warns)})
        print(name, "ERR" if errs else "ok", errs[:3], len(warns), "warnings")
    (BATCH / "manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
