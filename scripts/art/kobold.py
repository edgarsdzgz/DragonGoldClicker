# Kobold silhouette v2: organic shapes from rotated blobs and tapered, smoothed limbs.
import math, sys
from PIL import Image, ImageDraw

SS, OUT = 4, 600
S = OUT * SS / 1000.0
img = Image.new("L", (OUT * SS, OUT * SS), 0)
d = ImageDraw.Draw(img)
ON, OFF = 255, 0

def sc(p): return (p[0] * S, p[1] * S)

def blob(cx, cy, rx, ry, deg=0, v=ON):
    a = math.radians(deg)
    pts = []
    for i in range(64):
        t = 2 * math.pi * i / 64
        x, y = rx * math.cos(t), ry * math.sin(t)
        pts.append(sc((cx + x * math.cos(a) - y * math.sin(a), cy + x * math.sin(a) + y * math.cos(a))))
    d.polygon(pts, fill=v)

def catmull(pts, n=10):
    if len(pts) < 3: return pts
    out = []
    p = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(p) - 2):
        for k in range(n):
            t = k / n
            out.append(tuple(0.5 * ((2 * p[i][j]) + (-p[i-1][j] + p[i+1][j]) * t +
                (2*p[i-1][j] - 5*p[i][j] + 4*p[i+1][j] - p[i+2][j]) * t*t +
                (-p[i-1][j] + 3*p[i][j] - 3*p[i+1][j] + p[i+2][j]) * t*t*t) for j in range(2)))
    out.append(pts[-1])
    return out

def limb(pts, w0, w1, v=ON):
    path = catmull(pts)
    n = len(path)
    for i in range(n - 1):
        a, b = path[i], path[i + 1]
        wa = w0 + (w1 - w0) * i / (n - 1)
        wb = w0 + (w1 - w0) * (i + 1) / (n - 1)
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        d.polygon([sc((a[0] + nx*wa/2, a[1] + ny*wa/2)), sc((b[0] + nx*wb/2, b[1] + ny*wb/2)),
                   sc((b[0] - nx*wb/2, b[1] - ny*wb/2)), sc((a[0] - nx*wa/2, a[1] - ny*wa/2))], fill=v)
        r = wa / 2
        d.ellipse([sc((a[0]-r, a[1]-r)), sc((a[0]+r, a[1]+r))], fill=v)

# Tail: thick at the base, curling down and back
limb([(600, 610), (700, 650), (790, 730), (800, 820), (740, 860)], 86, 10)
# Back leg (crouched, digitigrade)
limb([(575, 640), (505, 735), (565, 830), (505, 880)], 74, 26)
# Torso, leaning forward
blob(525, 520, 118, 150, -28)
blob(490, 595, 84, 74)
# Front leg
limb([(470, 650), (390, 745), (445, 835), (365, 880)], 70, 26)
# Toes / claws on both feet
for x, y in [(505, 880), (365, 880)]:
    limb([(x + 10, y), (x - 45, y + 14)], 22, 6)
# Spear: shaft through the hand, leaf blade on top
limb([(255, 900), (410, 75)], 15, 13)
d.polygon([sc((392, 115)), sc((422, 18)), sc((440, 118)), sc((415, 150))], fill=ON)
# Neck
limb([(470, 420), (420, 360)], 120, 100)
# Head: cranium plus long reptile snout and lower jaw
blob(395, 318, 110, 88, -8)
limb([(335, 315), (270, 325), (205, 342)], 108, 58)
limb([(335, 372), (270, 382), (222, 388)], 50, 26)
# Horns: two, swept back and curving up
limb([(440, 262), (520, 200), (585, 180), (620, 150)], 44, 4)
limb([(400, 250), (440, 175), (495, 135), (520, 100)], 34, 4)
# Spines down the neck and back
for (x, y, ang) in [(500, 300, -25), (530, 360, -15), (565, 420, -5), (600, 480, 5)]:
    a = math.radians(ang)
    d.polygon([sc((x - 18, y)), sc((x + 18, y + 10)), sc((x + 60 * math.cos(a), y - 40 + 60 * math.sin(a)))], fill=ON)
# Arm: shoulder to elbow to a clawed hand gripping the spear
limb([(455, 440), (420, 530), (340, 500)], 46, 28)
blob(338, 492, 30, 26)
# Cutouts: menacing eye slit and the mouth line
blob(372, 300, 22, 10, -15, v=OFF)
limb([(325, 356), (262, 362), (212, 366)], 9, 4, v=OFF)
# Two fangs over the lower jaw
d.polygon([sc((236, 362)), sc((248, 362)), sc((241, 384))], fill=ON)
d.polygon([sc((268, 360)), sc((280, 360)), sc((273, 380))], fill=ON)
# Nostril
blob(222, 322, 7, 5, v=OFF)

mask = img.resize((OUT, OUT), Image.LANCZOS)
white = Image.new("RGBA", (OUT, OUT), (255, 255, 255, 255)); white.putalpha(mask); white.save(sys.argv[1])
prev = Image.new("RGBA", (OUT, OUT), (10, 10, 15, 255))
tint = Image.new("RGBA", (OUT, OUT), (200, 120, 90, 255)); tint.putalpha(mask); prev.alpha_composite(tint); prev.save(sys.argv[2])
small = prev.resize((120, 120), Image.LANCZOS); small.save(sys.argv[3])
