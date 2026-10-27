"""The studio intro: logo A's slam-and-slash animation as the RAXDEG STUDIOS logo (owner, 2026-10-27:
"using the shield as the animation for RAXDEG STUDIOS. I want the letters to be part of it. Maybe
slash across the top from left to right").

The shield plays exactly as in make_shield_anim.py. Then one more claw stroke rips across the top
from left to right and carves the name out of the dark: the letters appear in its wake white-hot and
cool through the fire ramp to their gold. The first cut (the name fading in) is kept as *_v1. The lettering
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

HOT = ["fire3", "fire3", "fire2", "fire2", "fire1"]   # by distance behind the slash head, in steps of 5 px

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


def carved(icon, title, head):
    """The name carved by a slash whose head is at x = head (card coordinates). Letters left of the
    head show; the nearer the head, the hotter they burn. The slash itself is a streak through the
    middle of the row, white at the head and cooling down its tail."""
    img = card(icon, title, 0)
    x0, y0 = (WIDTH - title.width) // 2, 4
    t = title.load()
    px = img.load()
    for y in range(title.height):
        for x in range(title.width):
            r, g, b, a = t[x, y]
            cx = x0 + x
            if not a or cx >= head:
                continue
            behind = (head - cx) // 5
            hot = (r, g, b) != pixkit.PALETTE["ink"] and behind < len(HOT)
            px[cx, y0 + y] = rgba(HOT[behind]) if hot else (r, g, b, 255)
    mid = y0 + title.height // 2
    for i in range(22):                                  # the streak, head first
        x = head - i
        if 0 <= x < WIDTH:
            c = "fire3" if i < 4 else "fire2" if i < 10 else "fire1"
            px[x, mid] = rgba(c)
            if i < 8:
                for dy in (-1, 1):
                    if px[x, mid + dy][:3] == pixkit.PALETTE["night1"]:
                        px[x, mid + dy] = rgba("fire1")
    return img


def main():
    title = supertitle()
    beats = timeline()
    frames = [card(frame(**kw), title, 0) for kw, _ in beats]
    ms = [m for _, m in beats]
    built = frame(claws=(1, 1, 1), debris=1.0)
    ms[-1] = 260                                       # a breath once the shield is whole
    x0 = (WIDTH - title.width) // 2
    for head in range(x0 - 2, x0 + title.width + 34, 11):  # the slash rips left to right
        frames.append(carved(built, title, head))
        ms.append(45)
    frames.append(card(built, title, 3))
    ms.append(1800)
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
