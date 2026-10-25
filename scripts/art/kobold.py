"""
Kobold silhouette poses for Dragon Gold.

Draws the kobold on a 1000-unit grid at 4x supersampling, in layers (legs+tail,
torso, spear arm, head) so each pose can rotate or shift a layer. Output is a
white silhouette on transparency, tinted at render time in the app.

Usage: python -I scripts/art/kobold.py <out_dir>
Writes kobold_idle.png, kobold_hit.png, kobold_hurt.png and preview.png.
"""
import math
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

SS, OUT = 4, 600
S = OUT * SS / 1000.0
SIZE = OUT * SS
ON, OFF = 255, 0

# Pivots (grid units): the neck for the head, the gripping hand for the spear arm
NECK = (440, 380)
GRIP = (338, 492)

POSES = {
    # dy: torso, head and arm shift (grid units, + is down); rotations in degrees (+ is counterclockwise)
    "idle": {"dy": 0, "head": 0, "arm": 0, "tail": 0},
    # Recoil: head snaps back with the snout up, the spear rocks back, the body lifts, the tail flicks
    "hit": {"dy": -14, "head": -22, "arm": -16, "tail": 12},
    # Nearly dead: hunched lower, snout drooping, spear sagging
    "hurt": {"dy": 26, "head": 12, "arm": -14, "tail": -6},
}


def sc(p):
    return (p[0] * S, p[1] * S)


class Layer:
    def __init__(self):
        self.img = Image.new("L", (SIZE, SIZE), 0)
        self.d = ImageDraw.Draw(self.img)

    def blob(self, cx, cy, rx, ry, deg=0, v=ON):
        a = math.radians(deg)
        pts = []
        for i in range(64):
            t = 2 * math.pi * i / 64
            x, y = rx * math.cos(t), ry * math.sin(t)
            pts.append(sc((cx + x * math.cos(a) - y * math.sin(a), cy + x * math.sin(a) + y * math.cos(a))))
        self.d.polygon(pts, fill=v)

    def limb(self, pts, w0, w1, v=ON):
        path = catmull(pts)
        n = len(path)
        for i in range(n - 1):
            a, b = path[i], path[i + 1]
            wa = w0 + (w1 - w0) * i / (n - 1)
            wb = w0 + (w1 - w0) * (i + 1) / (n - 1)
            dx, dy = b[0] - a[0], b[1] - a[1]
            length = math.hypot(dx, dy) or 1
            nx, ny = -dy / length, dx / length
            self.d.polygon([sc((a[0] + nx * wa / 2, a[1] + ny * wa / 2)), sc((b[0] + nx * wb / 2, b[1] + ny * wb / 2)),
                            sc((b[0] - nx * wb / 2, b[1] - ny * wb / 2)), sc((a[0] - nx * wa / 2, a[1] - ny * wa / 2))], fill=v)
            r = wa / 2
            self.d.ellipse([sc((a[0] - r, a[1] - r)), sc((a[0] + r, a[1] + r))], fill=v)

    def poly(self, pts, v=ON):
        self.d.polygon([sc(p) for p in pts], fill=v)


def catmull(pts, n=10):
    if len(pts) < 3:
        return pts
    out = []
    p = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(p) - 2):
        for k in range(n):
            t = k / n
            out.append(tuple(0.5 * ((2 * p[i][j]) + (-p[i - 1][j] + p[i + 1][j]) * t +
                (2 * p[i - 1][j] - 5 * p[i][j] + 4 * p[i + 1][j] - p[i + 2][j]) * t * t +
                (-p[i - 1][j] + 3 * p[i][j] - 3 * p[i + 1][j] + p[i + 2][j]) * t * t * t) for j in range(2)))
    out.append(pts[-1])
    return out


def transform(img, deg, pivot, dy):
    """Rotate about a pivot (grid units), then shift vertically."""
    out = img.rotate(deg, resample=Image.BICUBIC, center=sc(pivot)) if deg else img
    return ImageChops.offset(out, 0, int(dy * S)) if dy else out


def draw(pose):
    legs, tail, torso, arm, head, cut = Layer(), Layer(), Layer(), Layer(), Layer(), Layer()

    tail.limb([(600, 610), (700, 650), (790, 730), (800, 820), (740, 860)], 86, 10)
    legs.limb([(575, 640), (505, 735), (565, 830), (505, 880)], 74, 26)
    legs.limb([(470, 650), (390, 745), (445, 835), (365, 880)], 70, 26)
    for x, y in [(505, 880), (365, 880)]:
        legs.limb([(x + 10, y), (x - 45, y + 14)], 22, 6)

    torso.blob(525, 520, 118, 150, -28)
    torso.blob(490, 595, 84, 74)
    torso.limb([(470, 420), (420, 360)], 120, 100)
    for (x, y, ang) in [(530, 360, -15), (565, 420, -5), (600, 480, 5)]:
        a = math.radians(ang)
        torso.poly([(x - 18, y), (x + 18, y + 10), (x + 60 * math.cos(a), y - 40 + 60 * math.sin(a))])

    arm.limb([(255, 900), (410, 75)], 15, 13)
    arm.poly([(392, 115), (422, 18), (440, 118), (415, 150)])
    arm.limb([(455, 440), (420, 530), (340, 500)], 46, 28)
    arm.blob(338, 492, 30, 26)

    head.blob(395, 318, 110, 88, -8)
    head.limb([(335, 315), (270, 325), (205, 342)], 108, 58)
    head.limb([(335, 372), (270, 382), (222, 388)], 50, 26)
    head.limb([(440, 262), (520, 200), (585, 180), (620, 150)], 44, 4)
    head.limb([(400, 250), (440, 175), (495, 135), (520, 100)], 34, 4)
    a = math.radians(-25)
    head.poly([(482, 300), (518, 310), (500 + 60 * math.cos(a), 260 + 60 * math.sin(a))])
    head.poly([(236, 362), (248, 362), (241, 384)])
    head.poly([(268, 360), (280, 360), (273, 380)])
    # Cutouts travel with the head: eye slit, mouth line, nostril
    cut.blob(372, 300, 22, 10, -15)
    cut.limb([(325, 356), (262, 362), (212, 366)], 9, 4)
    cut.blob(222, 322, 7, 5)

    dy = pose["dy"]
    parts = [
        legs.img,
        transform(tail.img, pose["tail"], (600, 610), 0),
        transform(torso.img, 0, NECK, dy),
        transform(arm.img, pose["arm"], GRIP, dy),
        transform(head.img, pose["head"], NECK, dy),
    ]
    mask = parts[0]
    for p in parts[1:]:
        mask = ImageChops.lighter(mask, p)
    holes = transform(cut.img, pose["head"], NECK, dy)
    mask = ImageChops.subtract(mask, holes)
    return mask.resize((OUT, OUT), Image.LANCZOS)


def save_white(mask, path):
    img = Image.new("RGBA", (OUT, OUT), (255, 255, 255, 255))
    img.putalpha(mask)
    img.save(path)


def main(out_dir):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    masks = {}
    for name, pose in POSES.items():
        masks[name] = draw(pose)
        save_white(masks[name], out / f"kobold_{name}.png")
    # Preview: the three poses side by side on the game's dark background, gold tint
    prev = Image.new("RGBA", (OUT * 3, OUT), (10, 10, 15, 255))
    for i, name in enumerate(POSES):
        tint = Image.new("RGBA", (OUT, OUT), (224, 168, 64, 255))
        tint.putalpha(masks[name])
        prev.alpha_composite(tint, (OUT * i, 0))
    prev.save(out / "preview.png")


if __name__ == "__main__":
    main(sys.argv[1])
