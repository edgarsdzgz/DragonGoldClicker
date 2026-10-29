"""Drawing helpers for the Forage backdrop (batch 55). Everything is placed by code, palette names only."""
import math
import random
import sys
import pathlib

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
BATCH = HERE.parent
sys.path.insert(0, str(BATCH.parent / "00-foundation"))
import pixkit  # noqa: E402

P = pixkit.PALETTE
W, H = 130, 282

BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


class Canvas:
    def __init__(self):
        self.img = Image.new("RGBA", (W, H), P["azure3"] + (255,))
        self.px = self.img.load()

    def put(self, x, y, name):
        if 0 <= x < W and 0 <= y < H:
            self.px[x, y] = P[name] + (255,)

    def get(self, x, y):
        return self.px[x, y][:3]

    def rect(self, x0, y0, x1, y1, name):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.put(x, y, name)

    def disc(self, cx, cy, r, name):
        for y in range(int(cy - r) - 1, int(cy + r) + 2):
            for x in range(int(cx - r) - 1, int(cx + r) + 2):
                if math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r:
                    self.put(x, y, name)

    def ellipse(self, cx, cy, rx, ry, name):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1:
                    self.put(x, y, name)

    def outline_mask(self, cells, name="ink"):
        """Ink every empty-neighbor pixel around a set of cells (for distinct objects)."""
        s = set(cells)
        for (x, y) in s:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                if (x + dx, y + dy) not in s:
                    self.put(x + dx, y + dy, name)

    def dither_band(self, y0, y1, a, b):
        """Fill rows y0..y1 with an ordered-dither ramp from color a (top) to b (bottom). Sky only."""
        n = max(1, y1 - y0)
        for y in range(y0, y1 + 1):
            t = (y - y0) / n
            for x in range(W):
                self.put(x, y, b if t * 16 > BAYER[y % 4][x % 4] else a)


def ridge(c, base, parts, fill, rim=None, shade=None, y_to=None, x0=0, x1=W - 1):
    """Fill below a profile y = base + sum(amp*sin(x*f+p)). Rim = lit top pixel; shade = right-facing steps."""
    prev = None
    tops = {}
    for x in range(x0, x1 + 1):
        top = int(round(base + sum(a * math.sin(x * f + p) for a, f, p in parts)))
        tops[x] = top
        for y in range(top, (y_to if y_to else H - 1) + 1):
            c.put(x, y, fill)
        if rim:
            c.put(x, top, rim)
        if shade and prev is not None and top > prev:  # the lee side (falling to the right) goes cool
            for y in range(prev + 1, top + 1):
                c.put(x, y, shade)
        prev = top
    return tops


def pine(c, cx, by, h, tones=("green3", "green2", "green1"), trunk="wood2"):
    """A pine of three tiers. Light from the upper left: left side lit, right side shaded."""
    lit, mid, dark = tones
    hw_max = max(2, int(h * 0.4))
    tiers = 3 if h >= 12 else 2
    top = by - h
    tier_h = h / tiers
    for y in range(top, by + 1):
        r = y - top
        ti = min(tiers - 1, int(r / tier_h))
        local = (r - ti * tier_h) / tier_h
        hw = int(round(hw_max * (0.35 + 0.65 * (ti + local) / tiers) * (0.55 + 0.45 * local)))
        hw = max(0, hw)
        for x in range(cx - hw, cx + hw + 1):
            d = x - cx
            if d < -hw * 0.25 and local < 0.85:
                col = lit if d < -hw * 0.55 else mid
            elif d > hw * 0.35 or local >= 0.85:
                col = dark
            else:
                col = mid
            c.put(x, y, col)
    for y in range(by + 1, by + 1 + max(1, h // 8)):
        c.put(cx, y, trunk)
        if h > 14:
            c.put(cx + 1, y, trunk)


def round_tree(c, cx, by, r, tones=("green3", "green2", "green1"), trunk="wood2"):
    lit, mid, dark = tones
    cy = by - r
    c.disc(cx, cy, r, dark)
    c.disc(cx - r * 0.2, cy - r * 0.2, r * 0.82, mid)
    c.disc(cx - r * 0.42, cy - r * 0.45, r * 0.42, lit)
    for y in range(by - 1, by + max(2, r // 3)):
        c.put(cx, y, trunk)
        if r > 5:
            c.put(cx + 1, y, trunk)


def bush(c, cx, by, r, tones=("green3", "green2", "green1")):
    lit, mid, dark = tones
    c.ellipse(cx, by - r * 0.6, r * 1.2, r * 0.7, dark)
    c.ellipse(cx - 1, by - r * 0.75, r * 1.05, r * 0.58, mid)
    c.ellipse(cx - r * 0.5, by - r * 0.95, r * 0.5, r * 0.3, lit)


class River:
    """A winding river: centerline by control points (y, cx), half-width growing toward the viewer."""

    def __init__(self, pts, w0, w1, power=1.2):
        self.pts, self.w0, self.w1, self.power = pts, w0, w1, power
        self.y0, self.y1 = pts[0][0], pts[-1][0]

    def cx(self, y):
        pts = self.pts
        for (ya, xa), (yb, xb) in zip(pts, pts[1:]):
            if ya <= y <= yb:
                t = (y - ya) / max(1, yb - ya)
                t = (1 - math.cos(t * math.pi)) / 2
                return xa + (xb - xa) * t
        return pts[-1][1]

    def hw(self, y):
        t = (y - self.y0) / max(1, self.y1 - self.y0)
        return self.w0 + (self.w1 - self.w0) * (max(0, t) ** self.power)

    def draw(self, c, seed=3):
        rng = random.Random(seed)
        for y in range(self.y0, self.y1 + 1):
            cx, hw = self.cx(y), self.hw(y)
            for x in range(int(cx - hw) - 2, int(cx + hw) + 3):
                d = x + 0.5 - cx
                if abs(d) <= hw:
                    # lit left part, deeper right part; the sky shows in the water
                    col = "azure3" if d < -hw * 0.45 else "azure2"
                    c.put(x, y, col)
                elif abs(d) <= hw + 1.2:
                    c.put(x, y, "parch2" if d < 0 else "parch1")
        # flat glint dashes
        for y in range(self.y0 + 4, self.y1, 3):
            hw, cx = self.hw(y), self.cx(y)
            if hw < 3:
                continue
            for _ in range(1 + int(hw // 8)):
                gx = int(cx + rng.uniform(-hw + 2, hw - 4))
                ln = 2 + int(hw // 7)
                for k in range(ln):
                    if abs(gx + k + 0.5 - cx) < hw - 1:
                        c.put(gx + k, y, "azure4")


def pixel_wall(c, x0, y0, x1, y1, block=9, course=5):
    """Lit stone wall: steel faces, steel1 mortar, a bright top course, light from the upper left."""
    for y in range(y0, y1 + 1):
        row, n = (y - y0) % course, (y - y0) // course
        for x in range(x0, x1 + 1):
            joint = row == course - 1 or (x - x0 + (n % 2) * (block // 2)) % block == 0
            if joint:
                col = "steel1"
            elif row == 0:
                col = "steel4"
            else:
                col = "steel3" if ((x - x0 + (n % 2) * (block // 2)) % block) < block // 2 else "steel2"
            c.put(x, y, col)


def stamp(c, x, y, rows, key):
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch != "." and ch in key:
                c.put(x + i, y + j, key[ch])
