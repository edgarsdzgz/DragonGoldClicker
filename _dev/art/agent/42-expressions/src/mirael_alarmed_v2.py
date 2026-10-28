"""Mirael, alarmed, v2, 2026-10-28: the lip corners beside her gasp go.

Owner: "Scout Mirael needs to lose the freckles around her mouth in alarmed, please." The two clay lip corners
either side of the open mouth (row 12) read as freckles; they become skin. Nothing else changes.

Output: out/bust_mirael_alarmed_v2.png (v1 stays). preview/: x8. Run: python src/mirael_alarmed_v2.py
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE.parent / "00-foundation"))
from pixkit import PALETTE, upscale  # noqa: E402

CORNERS = [(9, 12), (12, 12)]

img = Image.open(HERE / "out" / "bust_mirael_alarmed_v1.png").convert("RGBA")
for c in CORNERS:
    assert img.getpixel(c)[:3] == PALETTE["clay3"], f"{c} is not a lip corner"
    img.putpixel(c, PALETTE["skin3"] + (255,))
img.save(HERE / "out" / "bust_mirael_alarmed_v2.png")
upscale(img, 8).save(HERE / "preview" / "bust_mirael_alarmed_v2_x8.png")
print("bust_mirael_alarmed_v2.png")
