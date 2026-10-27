"""The bestiary kit: draw a monster from a fill grid with the busts' shading, then build its whole set.

The shading (owner, 2026-10-27: "Light on details, still shading"): like the busts, light from the upper
left. A pixel on the silhouette's left or top edge takes its color's next lighter step; one on the right
edge takes the next darker step. One-pixel-wide parts (spears, tails) and glow colors (eyes, fire, the
brightest golds) stay flat. No blending: every pixel stays a palette color.

Everything after the idle is the locked monsters' own code: hit and hurt (21-warfront via 22-mobs), the
walk (22-mobs), the Unmaking's cracks (24-mobs-unmaking), the death (33-mob-deaths v2).
"""
import pathlib
import sys

from PIL import Image

AGENT = pathlib.Path(__file__).resolve().parents[2]
for sub in ("00-foundation", "22-mobs/src", "24-mobs-unmaking/src", "33-mob-deaths/src"):
    sys.path.insert(0, str(AGENT / sub))
import pixkit  # noqa: E402
from pixkit.palette import GLOW, RAMPS  # noqa: E402
from make_mobs import hit_pose, hurt_pose, hx, red_flash, walk  # noqa: E402
from make_unmade import LOOKS, crack  # noqa: E402
from make_deaths import FPS, death  # noqa: E402

P = pixkit.PALETTE
NAME = {rgb: name for name, rgb in P.items()}
FLAT = GLOW | {"ink", "gold4", "magenta1", "magenta2", "magenta3", "magenta4"}


def _steps():
    """Each palette color's next lighter and next darker step on its own ramp."""
    light, dark = {}, {}
    for ramp, hexes in RAMPS.items():
        names = [ramp] if len(hexes) == 1 else [f"{ramp}{i}" for i in range(1, len(hexes) + 1)]
        for i, n in enumerate(names):
            light[n] = names[min(i + 1, len(names) - 1)]
            dark[n] = names[max(i - 1, 0)]
    return light, dark


LIGHT, DARK = _steps()


class Canvas:
    """A fill grid drawn with rectangles and points; '.' is clear."""

    def __init__(self, w, h):
        self.w, self.h = w, h
        self.g = [["."] * w for _ in range(h)]

    def rect(self, x0, y0, x1, y1, ch, sym=False):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.px(x, y, ch, sym)

    def px(self, x, y, ch, sym=False):
        self.g[y][x] = ch
        if sym:
            self.g[y][self.w - 1 - x] = ch

    def pts(self, cells, ch, sym=False):
        for x, y in cells:
            self.px(x, y, ch, sym)

    def clear(self, cells, sym=False):
        self.pts(cells, ".", sym)

    def rows(self):
        return ["".join(r) for r in self.g]


def shade(img):
    """Light on the upper-left edges of the silhouette, dark on the right; thin parts and glows stay flat."""
    src, out = img.load(), img.copy()
    o = out.load()
    w, h = img.size

    def empty(x, y):
        return not (0 <= x < w and 0 <= y < h) or src[x, y][3] == 0

    for y in range(h):
        for x in range(w):
            if src[x, y][3] == 0:
                continue
            name = NAME.get(src[x, y][:3])
            if name is None or name in FLAT or (empty(x - 1, y) and empty(x + 1, y)):
                continue
            if empty(x + 1, y):
                o[x, y] = P[DARK[name]] + (255,)
            elif empty(x - 1, y) or empty(x, y - 1):
                o[x, y] = P[LIGHT[name]] + (255,)
    return out


def draw(fill, key, shaded=True):
    """A fill grid with 22-mobs' margins (a column each side, two rows on top, one below), shaded, outlined."""
    w = len(fill[0])
    rows = ["." * (w + 2)] * 2 + ["." + r + "." for r in fill] + ["." * (w + 2)]
    img = pixkit.from_grid(rows, key)
    return pixkit.outline(shade(img) if shaded else img)


def build(name, fill, key, pose, cracks, flip, out, preview):
    """Every file a monster needs, at each Unmaking tier. Returns the base tier's frames for the board."""
    base = draw(fill, key)
    sheet = None
    for tier in ("", "strong", "stronger"):
        n = f"mob_{name}-{tier}" if tier else f"mob_{name}"
        idle = crack(base, cracks, *LOOKS[tier]) if tier else base
        hit, hurt = red_flash(hit_pose(idle, pose)), hurt_pose(idle, pose)
        for st, im in (("idle", idle), ("hit", hit), ("hurt", hurt)):
            im.save(out / f"{n}_{st}.png")
        frames = walk(idle)
        pixkit.strip(frames).save(out / f"{n}_walk_strip2.png")
        dies = death(hurt, flip)
        pixkit.strip(dies).save(out / f"{n}_death_strip4.png")
        if not tier:
            pixkit.write_gif(frames, 4, preview / f"{n}_walk.gif", scale=5)
            pixkit.write_gif(dies + [dies[-1]] * 3, FPS, preview / f"{n}_death.gif", scale=5)
            sheet = [idle, hit, hurt]
        else:
            sheet.append(idle)
    return sheet
