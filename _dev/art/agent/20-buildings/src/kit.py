"""The building kit: walls, roofs, windows, doors and ruin pieces shared by every building.

Buildings are drawn front-on, base on the bottom row of the plot, lit from the upper left, in the
lit look (the game darkens them with the night and dusk maps). Lit windows, torches and forge fire
use the glow colors (gold5, gold6, fire1-3), so they stay bright at night.
"""
import math
import pathlib
import random
import sys

from PIL import Image

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "00-foundation"))

import pixkit  # noqa: E402

P = pixkit.PALETTE
STONE = ("steel4", "steel3", "steel2", "steel2")   # light, face, shade, mortar
WARM_STONE = ("parch3", "parch2", "parch1", "wood3")
PLASTER = ("parch3", "parch3", "parch2", "wood2")  # light, face, shade, timber
PLANK = ("wood4", "wood3", "wood2", "wood1")
CLAY_ROOF = ("clay3", "clay2", "clay1")
SLATE_ROOF = ("night3", "night2", "night1")
MOSS_ROOF = ("green3", "green2", "green1")
THATCH_ROOF = ("gold3", "gold2", "gold1")


class Canvas:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.img = Image.new("RGBA", (w, h), (0, 0, 0, 0))

    def put(self, x, y, name):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.img.putpixel((int(x), int(y)), P[name] + (255,))

    def clear(self, x, y):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.img.putpixel((int(x), int(y)), (0, 0, 0, 0))

    def get(self, x, y):
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.img.getpixel((int(x), int(y)))[3] > 0
        return False

    def rect(self, x0, y0, x1, y1, name):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.put(x, y, name)

    # --- walls ---------------------------------------------------------------------------
    def stone_wall(self, x0, y0, x1, y1, pal=STONE, block=6, course=4):
        light, face, shade, mortar = pal
        for y in range(y0, y1 + 1):
            row = (y - y0) % course
            n = (y - y0) // course
            for x in range(x0, x1 + 1):
                joint = row == course - 1 or (x - x0 + (n % 2) * (block // 2 + 1)) % block == 0
                if joint:
                    name = mortar
                elif row == 0:
                    name = light
                else:
                    name = face
                if x == x1 and not joint:
                    name = shade
                self.put(x, y, name)

    def plank_wall(self, x0, y0, x1, y1, pal=PLANK, vertical=True):
        light, face, shade, seam = pal
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                k = (x - x0) if vertical else (y - y0)
                name = seam if k % 3 == 2 else (light if k % 3 == 0 else face)
                if x == x1:
                    name = shade
                self.put(x, y, name)

    def log_wall(self, x0, y0, x1, y1):
        for y in range(y0, y1 + 1):
            k = (y - y0) % 2
            for x in range(x0, x1 + 1):
                self.put(x, y, "wood4" if k == 0 else "wood2")
            self.put(x0, y, "wood3")  # log ends
            self.put(x1, y, "wood3")

    def timber_wall(self, x0, y0, x1, y1, pal=PLASTER):
        light, face, shade, timber = pal
        self.rect(x0, y0, x1, y1, face)
        for x in range(x0, x1 + 1):
            self.put(x, y0, timber)
            self.put(x, y1, timber)
        for x in (x0, x1, (x0 + x1) // 2):
            for y in range(y0, y1 + 1):
                self.put(x, y, timber)
        for y in range(y0 + 1, y1):
            self.put(x1 - 1, y, shade)

    def ink_v(self, x, y0, y1):
        for y in range(y0, y1 + 1):
            self.put(x, y, "ink")

    def ink_h(self, x0, x1, y):
        for x in range(x0, x1 + 1):
            self.put(x, y, "ink")

    # --- roofs ---------------------------------------------------------------------------
    def gable(self, cx, base, half, height, pal=CLAY_ROOF, eave=1):
        """A front-on gable roof: a triangle with shingle rows, the left slope lit."""
        light, face, shade = pal
        for y in range(base - height, base + 1):
            t = (y - (base - height)) / max(1, height)
            hw = half * t + eave * t
            for x in range(int(math.floor(cx - hw)), int(math.ceil(cx + hw)) + 1):
                if abs(x + 0.5 - cx) <= hw + 0.5:
                    row = (base - y) % 3 == 0
                    name = shade if row else (light if x + 0.5 < cx else face)
                    self.put(x, y, name)

    def hip(self, x0, x1, base, height, pal=CLAY_ROOF, inset=None):
        """A front-on hipped roof: a trapezoid, shingle rows, lit on the left."""
        light, face, shade = pal
        inset = height if inset is None else inset
        for y in range(base - height, base + 1):
            k = base - y
            a, b = x0 + k * inset // max(1, height), x1 - k * inset // max(1, height)
            for x in range(a, b + 1):
                name = shade if k % 3 == 0 else (light if x < (x0 + x1) // 2 else face)
                self.put(x, y, name)

    def cone(self, cx, base, half, height, pal=CLAY_ROOF):
        light, face, shade = pal
        for y in range(base - height, base + 1):
            t = (y - (base - height)) / max(1, height)
            hw = half * t
            for x in range(int(cx - hw - 1), int(cx + hw + 2)):
                if abs(x + 0.5 - cx) <= hw + 0.4:
                    self.put(x, y, light if x + 0.5 < cx - hw * 0.2 else (shade if x + 0.5 > cx + hw * 0.5 else face))

    def merlons(self, x0, x1, y, pal=STONE, gap=2, width=2, tall=2):
        light, face, shade, mortar = pal
        x = x0
        while x <= x1:
            for dx in range(width):
                for dy in range(tall):
                    if x + dx <= x1:
                        self.put(x + dx, y - dy, light if dy == tall - 1 else face)
            x += width + gap

    # --- openings ------------------------------------------------------------------------
    def window(self, x, y, w=2, h=2, lit=True, arch=False):
        for dy in range(h):
            for dx in range(w):
                if arch and dy == 0 and w > 2 and dx in (0, w - 1):
                    continue
                self.put(x + dx, y + dy, ("gold5" if dy < h - 1 or h == 1 else "fire2") if lit else "night1")

    def door(self, x, y, w, h, arch=True, pal=("wood3", "wood2")):
        for dy in range(h):
            for dx in range(w):
                if arch and dy == 0 and w > 2 and dx in (0, w - 1):
                    continue
                self.put(x + dx, y + dy, pal[0] if dx < w / 2 else pal[1])
        self.put(x + w - 2, y + h // 2, "gold4")  # the ring

    def banner(self, x, y, h=4, pal=("clay3", "clay1"), charge="gold5"):
        for dy in range(h):
            self.put(x, y + dy, pal[0])
            self.put(x + 1, y + dy, pal[1])
        self.put(x, y + h, pal[0])
        self.put(x + 1, y + 1, charge)

    def flag(self, x, y, pole=4, pal=("gold5", "gold3")):
        for dy in range(pole):
            self.put(x, y + dy, "wood2")
        self.put(x + 1, y, pal[0])
        self.put(x + 2, y, pal[0])
        self.put(x + 1, y + 1, pal[1])
        self.put(x + 3, y + 1, pal[1])
        self.put(x + 2, y + 1, pal[0])

    # --- ruin pieces ---------------------------------------------------------------------
    def break_top(self, x0, x1, top, depth, seed=1):
        """Knock a jagged line out of the top of whatever is drawn between x0 and x1."""
        rng = random.Random(seed)
        level = 0
        for x in range(x0, x1 + 1):
            level = max(0, min(depth, level + rng.choice((-2, -1, 0, 1, 2))))
            for y in range(top, top + level):
                self.clear(x, y)

    def rubble(self, x0, x1, base, seed=2, pal=STONE):
        rng = random.Random(seed)
        for x in range(x0, x1 + 1):
            hgt = rng.choice((0, 1, 1, 2, 2, 3))
            for dy in range(hgt):
                self.put(x, base - dy, pal[1] if dy == hgt - 1 else pal[2])
            if hgt and rng.random() < 0.3:
                self.put(x, base - hgt + 1, pal[0])

    def finish(self):
        """The ink outline around the whole silhouette."""
        return pixkit.outline(self.img)
