"""Sera, alarmed, v2, 2026-10-28: a gap of snout between her nose and her gasp.

Owner: "Sera alarmed talking is mixing with her nose and it just looks like a giant bouncing nose, we need to have
a gap between the two to read well." In v1 the gasp (rows 12-13) sits right under the nostrils (rows 10-11). It
moves down a row: row 12 is snout again, as in her neutral face, and the gasp is rows 13-14.

Output: out/bust_sera_alarmed_v2.png (v1 stays). preview/: x8. Run: python src/sera_alarmed_v2.py
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from pixkit import PALETTE, upscale  # noqa: E402

INK, SNOUT = PALETTE["ink"] + (255,), PALETTE["ash3"] + (255,)
GASP = [10, 11]

img = Image.open(HERE / "out" / "bust_sera_alarmed_v1.png").convert("RGBA")
for x in GASP:
    assert [img.getpixel((x, y)) for y in (12, 13, 14)] == [INK, INK, SNOUT], f"column {x} is not the v1 gasp"
    img.putpixel((x, 12), SNOUT)
    img.putpixel((x, 14), INK)
img.save(HERE / "out" / "bust_sera_alarmed_v2.png")
upscale(img, 8).save(HERE / "preview" / "bust_sera_alarmed_v2_x8.png")
print("bust_sera_alarmed_v2.png")
