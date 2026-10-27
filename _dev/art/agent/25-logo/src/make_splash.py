"""The splash: logo B (the gate under the ember moon) assembling itself out of the dark.

Owner, 2026-10-27: "fading in from darkness one piece at a time, first the tower, then the moon rises,
then the windows light up. Then the portcullis lights up, and finally the light spills from the
portcullis and moves down to create the path." The wordmark comes last.

Fades are palette steps, not alpha: each piece goes dark silhouette, then dusk, then lit, the way
the city's night and dusk maps work. Writes out/splash_frames_stripN.png (frames of the B lockup),
out/splash_timing.json (each frame's hold in ms) and preview/splash.gif at x3.

Run: python make_splash.py
"""
import json
import pathlib

from PIL import Image

from make_logo import OUT, P, PREVIEW, S, background, canvas, ellipse, mask_of, pixkit, poly, rgba, wordmark

STONE = "night3"
# Owner, 2026-10-27: "can we slow it down, please?", then "meet me in the middle, 6.2 seconds". The
# beats stretch evenly so the whole splash, final hold included, runs TOTAL_MS. Earlier timings are
# kept: out/splash_timing_v1.json (5.5 s) and out/splash_timing_v2.json (8.4 s).
TOTAL_MS = 6200
# Glow colors keep their value in the night map, so a fade steps them down by hand.
GLOW_DIM = {
    1: {"fire1": "wood1", "fire2": "wood1", "fire3": "wood2", "gold5": "wood1", "gold6": "wood2"},
    2: {"fire1": "clay2", "fire2": "fire1", "fire3": "fire1", "gold5": "gold3", "gold6": "gold4"},
}


def dim(img, level):
    """Level 0 is gone, 1 a dark silhouette, 2 dusk, 3 lit."""
    if level >= 3:
        return img
    if level <= 0:
        return canvas(img.width, img.height)
    base = dict(pixkit.NIGHT if level == 1 else pixkit.DUSK)
    base.update(GLOW_DIM[level])
    return pixkit.relight(img, base)


def halo():
    img = canvas()
    ellipse(img, (6, 6, 57, 57), "night2")
    return img


def moon():
    img = canvas()
    ellipse(img, (19, 7, 45, 33), "gold4")
    ellipse(img, (19, 7, 41, 29), "gold5")
    ellipse(img, (22, 9, 34, 21), "gold6")
    for box in ((34, 13, 37, 16), (27, 22, 31, 25)):
        ellipse(img, box, "gold3")
    return img


def towers(windows, portcullis):
    """The gate and towers, outlined. windows and portcullis: 0 dark, 1 dim, 2 lit."""
    layer = canvas()
    for x0, x1 in ((11, 22), (41, 52)):
        poly(layer, [(x0, 25), (x1, 25), (x1, 55), (x0, 55)], STONE)
        for mx in range(x0, x1, 4):
            poly(layer, [(mx, 21), (mx + 1, 21), (mx + 1, 24), (mx, 24)], STONE)
        poly(layer, [(x0, 25), (x0 + 1, 25), (x0 + 1, 55), (x0, 55)], "night4")
        wx = (x0 + x1) // 2
        poly(layer, [(wx, 31), (wx + 1, 31), (wx + 1, 35), (wx, 35)], ("night1", "fire1", "fire2")[windows])
    poly(layer, [(23, 35), (40, 35), (40, 55), (23, 55)], STONE)
    for mx in range(24, 40, 4):
        poly(layer, [(mx, 32), (mx + 1, 32), (mx + 1, 34), (mx, 34)], STONE)
    px = layer.load()
    for y in range(26, 56, 5):
        for x in range(11, 53):
            if px[x, y][3] and px[x, y][:3] == P[STONE] and (x + (y // 5) * 3) % 6 == 0:
                for yy in range(y, y + 5):
                    if px[x, yy][3] and px[x, yy][:3] == P[STONE]:
                        px[x, yy] = rgba("night2")
    arch = canvas()
    ellipse(arch, (26, 38, 37, 49), "fire1")
    poly(arch, [(26, 44), (37, 44), (37, 55), (26, 55)], "fire1")
    ramps = (("night1", "night1", "night1"), ("clay2", "fire1", "fire1"), ("fire1", "fire2", "fire3"))[portcullis]
    for x, y in mask_of(arch):
        c = ramps[2] if y >= 51 else ramps[1] if y >= 46 else ramps[0]
        if x in (28, 31, 34) or y in (44, 49):
            c = "ink"
        px[x, y] = rgba(c)
    if windows:
        for x, y in ((24, 43), (39, 43)):
            px[x, y] = rgba("fire3" if windows == 2 else "fire1")
            px[x, y - 1] = rgba("fire2" if windows == 2 else "wood2")
            px[x, y + 1] = rgba("wood2")
    return pixkit.outline(layer)


def path(rows):
    """The light spilling out of the gate, row by row: hot at the gate, cooling as it runs down."""
    img = canvas()
    colors = ["fire3", "fire2", "fire2", "fire1", "fire1", "gold3", "gold3", "gold2"]
    for i in range(rows):
        y = 56 + i
        half = 4.5 + i * 4 / 7
        for x in range(int(31.5 - half + 0.5), int(31.5 + half + 0.5) + 1):
            img.putpixel((x, y), rgba(colors[i]))
    return img


def frame(t, mark):
    """t: the state of every piece. Returns the B lockup frame."""
    icon = Image.new("RGBA", (S, S), rgba("night1"))
    icon.alpha_composite(dim(halo(), t["tower"]))
    if t["moon"] is not None:
        level, rise = t["moon"]
        icon.alpha_composite(dim(moon(), level), (0, rise))
    icon.alpha_composite(dim(towers(t["windows"], t["portcullis"]), t["tower"]))
    icon.alpha_composite(path(t["path"]))
    w = max(icon.width, mark.width) + 8
    img = Image.new("RGBA", (w, icon.height + mark.height + 12), rgba("night1"))
    img.alpha_composite(icon, ((w - icon.width) // 2, 4))
    img.alpha_composite(dim(mark, t["mark"]), ((w - mark.width) // 2, icon.height + 8))
    return img


def timeline():
    """[(state, ms)] in the owner's order: tower, moon, windows, portcullis, path, then the wordmark."""
    s = dict(tower=0, moon=None, windows=0, portcullis=0, path=0, mark=0)
    beats = [(dict(s), 500)]
    for lv in (1, 2, 3):
        s["tower"] = lv
        beats.append((dict(s), 160))
    for i, rise in enumerate((22, 18, 14, 10, 7, 4, 2, 1, 0)):
        s["moon"] = (1 if i < 2 else 2 if i < 5 else 3, rise)
        beats.append((dict(s), 90))
    beats[-1] = (beats[-1][0], 300)
    for lv in (1, 2):
        s["windows"] = lv
        beats.append((dict(s), 160))
    beats[-1] = (beats[-1][0], 260)
    for lv in (1, 2):
        s["portcullis"] = lv
        beats.append((dict(s), 180))
    for r in range(1, 9):
        s["path"] = r
        beats.append((dict(s), 80))
    beats[-1] = (beats[-1][0], 240)
    for lv in (1, 2, 3):
        s["mark"] = lv
        beats.append((dict(s), 160))
    beats[-1] = (beats[-1][0], 1600)
    return beats


def main():
    mark = wordmark()
    beats = timeline()
    frames = [frame(t, mark) for t, _ in beats]
    hold = beats[-1][1]
    slow = (TOTAL_MS - hold) / sum(m for _, m in beats[:-1])
    ms = [round(m * slow) for _, m in beats[:-1]]
    ms.append(TOTAL_MS - sum(ms))
    pixkit.strip(frames).save(OUT / f"splash_frames_strip{len(frames)}.png")
    (OUT / "splash_timing.json").write_text(json.dumps({
        "frame_width": frames[0].width, "frame_height": frames[0].height, "frames": len(frames),
        "background": "#%02x%02x%02x" % P["night1"], "ms": ms, "loop": False,
        "note": "Hold the last frame; the first frame is plain background, so a static splash in "
                "the background color hands over seamlessly.",
    }, indent=2), encoding="utf-8")
    big = [f.resize((f.width * 3, f.height * 3), Image.NEAREST).convert("RGB") for f in frames]
    big[0].save(PREVIEW / "splash.gif", save_all=True, append_images=big[1:], duration=ms, loop=0)
    print(f"{len(frames)} frames, {sum(ms)} ms")


if __name__ == "__main__":
    main()
