"""
Hit-effect sprites for Dragon Gold: claw slash, spark, ember.
White on transparency, tinted at render time.

Usage: python -I scripts/art/effects.py <out_dir>
"""
import math
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

SS = 4


def crescent(d, cx, cy, length, thick, bend, ang, s):
    """A tapered curved streak (pointed ends, thickest in the middle) along a bent line."""
    a = math.radians(ang)
    ux, uy = math.cos(a), math.sin(a)
    nx, ny = -uy, ux
    top, bot = [], []
    steps = 40
    for i in range(steps + 1):
        t = i / steps - 0.5
        along = t * length
        off = bend * (1 - (2 * t) ** 2)            # parabola: the streak bows sideways
        w = thick * math.sin(math.pi * (t + 0.5)) ** 0.8 / 2
        px, py = cx + ux * along + nx * off, cy + uy * along + ny * off
        top.append(((px + nx * w) * s, (py + ny * w) * s))
        bot.append(((px - nx * w) * s, (py - ny * w) * s))
    d.polygon(top + bot[::-1], fill=255)


def white(mask, path):
    img = Image.new("RGBA", mask.size, (255, 255, 255, 255))
    img.putalpha(mask)
    img.save(path)


def slash(out):
    n = 400
    m = Image.new("L", (n * SS, n * SS), 0)
    d = ImageDraw.Draw(m)
    # Three parallel claw rakes, diagonal, the middle one longest
    for off, length, thick in [(-62, 300, 26), (0, 340, 32), (62, 290, 24)]:
        cx = 200 + off * math.cos(math.radians(-45 + 90))
        cy = 200 + off * math.sin(math.radians(-45 + 90))
        crescent(d, cx, cy, length, thick, 22, -45, SS)
    white(m.resize((n, n), Image.LANCZOS), out / "fx_slash.png")


def spark(out):
    n = 64
    m = Image.new("L", (n * SS, n * SS), 0)
    d = ImageDraw.Draw(m)
    c = n * SS / 2
    long_r, short_r = c * 0.95, c * 0.16
    pts = []
    for i in range(8):
        r = long_r if i % 2 == 0 else short_r
        a = math.pi / 4 * i - math.pi / 2
        pts.append((c + r * math.cos(a), c + r * math.sin(a)))
    d.polygon(pts, fill=255)
    white(m.resize((n, n), Image.LANCZOS), out / "fx_spark.png")


def ember(out):
    n = 48
    m = Image.new("L", (n * SS, n * SS), 0)
    d = ImageDraw.Draw(m)
    c = n * SS / 2
    d.ellipse([c - c * 0.42, c - c * 0.42, c + c * 0.42, c + c * 0.42], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(c * 0.22))
    white(m.resize((n, n), Image.LANCZOS), out / "fx_ember.png")


def preview(out):
    bg = Image.new("RGBA", (400 + 64 + 48 + 40, 400), (10, 10, 15, 255))
    x = 0
    for name, col in [("fx_slash", (255, 240, 200)), ("fx_spark", (240, 190, 80)), ("fx_ember", (255, 140, 60))]:
        im = Image.open(out / f"{name}.png")
        tint = Image.new("RGBA", im.size, col + (255,))
        tint.putalpha(im.getchannel("A"))
        bg.alpha_composite(tint, (x, (400 - im.size[1]) // 2))
        x += im.size[0] + 20
    bg.save(out / "fx_preview.png")


if __name__ == "__main__":
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    slash(out); spark(out); ember(out); preview(out)
