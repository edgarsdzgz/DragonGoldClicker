"""The heartstone, v3, 2026-10-27 (owner: "Can we try the flame with Teardrop shape, and make the flame
flicker?"). The teardrop from make_heartstone.py with v1's flame back, in four flickering shapes: at rest,
leaning left, ducked low and wide, leaning right. The glass beside the flame takes its light. Held for
uneven times so the flicker never settles into a beat. Orange, gold and white-gold, not red.

Run: python src/make_flicker.py
"""
import pathlib
import sys

from make_heartstone import OUT, PALETTE, PREVIEW, pixkit, teardrop12, teardrop16, upscale

GLASS = {PALETTE[c] for c in ("teal1", "teal2", "teal3")}

# Each frame: (x, y, color) cells. 1 = fire1, 2 = fire2, 3 = fire3.
FLAMES = {
    12: [
        [(6, 4, 1), (5, 5, 1), (6, 5, 2), (5, 6, 2), (6, 6, 3), (5, 7, 2), (6, 7, 2)],               # at rest
        [(5, 4, 1), (5, 5, 2), (6, 5, 1), (5, 6, 3), (6, 6, 2), (5, 7, 2), (6, 7, 2)],               # left
        [(5, 5, 1), (6, 5, 1), (4, 6, 1), (5, 6, 3), (6, 6, 3), (7, 6, 1), (5, 7, 2), (6, 7, 2)],    # low, wide
        [(6, 3, 1), (6, 4, 2), (5, 5, 1), (6, 5, 2), (5, 6, 2), (6, 6, 3), (5, 7, 2), (6, 7, 2)],    # right, tall
    ],
    16: [
        [(8, 5, 1), (7, 6, 1), (8, 6, 2), (7, 7, 2), (8, 7, 2), (6, 8, 1), (7, 8, 3), (8, 8, 3), (9, 8, 1),
         (7, 9, 2), (8, 9, 2), (7, 10, 1), (8, 10, 1)],
        [(7, 4, 1), (7, 5, 1), (7, 6, 2), (8, 6, 1), (6, 7, 1), (7, 7, 3), (8, 7, 2), (6, 8, 2), (7, 8, 3),
         (8, 8, 2), (9, 8, 1), (7, 9, 2), (8, 9, 2), (7, 10, 1), (8, 10, 1)],
        [(7, 6, 1), (8, 6, 1), (6, 7, 1), (7, 7, 2), (8, 7, 2), (9, 7, 1), (5, 8, 1), (6, 8, 2), (7, 8, 3),
         (8, 8, 3), (9, 8, 2), (10, 8, 1), (6, 9, 1), (7, 9, 2), (8, 9, 2), (9, 9, 1), (7, 10, 1), (8, 10, 1)],
        [(8, 4, 1), (8, 5, 2), (7, 6, 1), (8, 6, 2), (7, 7, 2), (8, 7, 3), (9, 7, 1), (6, 8, 1), (7, 8, 3),
         (8, 8, 3), (9, 8, 2), (7, 9, 2), (8, 9, 2), (7, 10, 1), (8, 10, 1)],
    ],
}
FLICKER_MS = (140, 90, 160, 110)


def burn(base, flame):
    img = base.copy()
    px = img.load()
    lit = {(x, y) for x, y, _ in flame}
    for x, y in lit:                                                       # the glass catches the light
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            q = (x + dx, y + dy)
            if q not in lit and 0 <= q[0] < img.width and 0 <= q[1] < img.height and px[q][:3] in GLASS:
                px[q] = PALETTE["teal3"] + (255,)
    for x, y, level in flame:
        px[x, y] = PALETTE[f"fire{level}"] + (255,)
    return img


def main():
    for size, f in ((12, teardrop12), (16, teardrop16)):
        base = f()
        frames = [burn(base, fl) for fl in FLAMES[size]]
        frames[0].save(OUT / f"icon_heartstone-teardrop-flame_{size}.png")
        pixkit.strip(frames).save(OUT / f"icon_heartstone-teardrop-flame_{size}_flicker_strip4.png")
        big = [upscale(fr, 8).convert("RGB") for fr in frames]
        big[0].save(PREVIEW / f"icon_heartstone-teardrop-flame_{size}_flicker.gif", save_all=True,
                    append_images=big[1:], duration=list(FLICKER_MS), loop=0)
        upscale(frames[0], 8).save(PREVIEW / f"icon_heartstone-teardrop-flame_{size}_x8.png")
    print("teardrop flame: 12 and 16, 4 flicker frames each")


if __name__ == "__main__":
    sys.path.insert(0, str(pathlib.Path(__file__).parent))
    main()
