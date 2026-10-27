"""The studio intro: logo A's slam-and-slash animation with the supertitle RAXDEG STUDIOS above it
(owner, 2026-10-27: "For the shield and the slash can we create a supertitle RAXDEG STUDIOS").

The shield plays exactly as in make_shield_anim.py; once it is put together, the supertitle fades in
out of the dark in palette steps (silhouette, dusk, lit), like the splash, then holds. The lettering
is a five-by-seven face on the gold ramp, lighter than the game's bold wordmark, so the studio and
the game never read as one name. Writes out/studio_intro_frames_stripN.png,
out/studio_intro_timing.json, out/studio_card.png (the last frame) and preview/studio_intro.gif at x3.

Run: python make_studio_intro.py (after make_logo.py)
"""
import json

from PIL import Image

from make_logo import OUT, PREVIEW, S, canvas, pixkit, rgba
from make_shield_anim import frame, timeline
from make_splash import dim

FACE = {
    "R": ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
    "A": [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "X": ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
    "D": ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
    "E": ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
    "G": [".####", "#....", "#....", "#.###", "#...#", "#...#", ".###."],
    "S": [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
    "T": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
    "U": ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    "I": ["###", ".#.", ".#.", ".#.", ".#.", ".#.", "###"],
    "O": [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
}
RAMP = ["gold6", "gold5", "gold5", "gold4", "gold4", "gold3", "gold3"]
WIDTH = 88


def supertitle(text="RAXDEG STUDIOS"):
    w = sum(4 if c == " " else len(FACE[c][0]) + 1 for c in text) - 1
    img = canvas(w + 2, 9)
    x = 1
    for c in text:
        if c == " ":
            x += 4
            continue
        for y, row in enumerate(FACE[c]):
            for i, ch in enumerate(row):
                if ch == "#":
                    img.putpixel((x + i, y + 1), rgba(RAMP[y]))
        x += len(FACE[c][0]) + 1
    return pixkit.outline(img)


def card(icon, title, level):
    img = Image.new("RGBA", (WIDTH, S + title.height + 10), rgba("night1"))
    img.alpha_composite(dim(title, level), ((WIDTH - title.width) // 2, 4))
    img.alpha_composite(icon, ((WIDTH - S) // 2, title.height + 8))
    return img


def main():
    title = supertitle()
    beats = timeline()
    frames = [card(frame(**kw), title, 0) for kw, _ in beats]
    ms = [m for _, m in beats]
    built = frame(claws=(1, 1, 1), debris=1.0)
    ms[-1] = 300                                       # a breath once the logo is whole
    for level in (1, 2, 3):
        frames.append(card(built, title, level))
        ms.append(140)
    ms[-1] = 1800
    pixkit.strip(frames).save(OUT / f"studio_intro_frames_strip{len(frames)}.png")
    frames[-1].save(OUT / "studio_card.png")
    (OUT / "studio_intro_timing.json").write_text(json.dumps({
        "frame_width": frames[0].width, "frame_height": frames[0].height, "frames": len(frames),
        "background": "#281e32", "ms": ms, "loop": False,
        "note": "Hold the last frame (studio_card.png). Plays before the game's splash.",
    }, indent=2), encoding="utf-8")
    big = [f.resize((f.width * 3, f.height * 3), Image.NEAREST).convert("RGB") for f in frames]
    big[0].save(PREVIEW / "studio_intro.gif", save_all=True, append_images=big[1:], duration=ms, loop=0)
    print(f"{len(frames)} frames, {sum(ms)} ms, {frames[0].size}")


if __name__ == "__main__":
    main()
