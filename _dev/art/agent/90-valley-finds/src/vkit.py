"""Drawing helpers for Valley Finds (batch 90). 24x24 sprites, palette names only, hard alpha."""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
BATCH = HERE.parent
sys.path.insert(0, str(BATCH.parent / "00-foundation"))
import pixkit  # noqa: E402

P = pixkit.PALETTE
S = 24  # canvas size, art pixels; the last body row is 21, the ink outline lands on row 22


class Sprite:
    def __init__(self):
        self.img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        self.px = self.img.load()

    def put(self, x, y, name):
        if 0 <= x < S and 0 <= y < S:
            self.px[x, y] = P[name] + (255,)

    def rect(self, x0, y0, x1, y1, name):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.put(x, y, name)

    def ellipse(self, cx, cy, rx, ry, name):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1:
                    self.put(x, y, name)

    def pts(self, cells, name):
        for x, y in cells:
            self.put(x, y, name)

    def done(self):
        return pixkit.outline(self.img)
