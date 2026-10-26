"""Write native-size copies of the mockup art to _dev/art/reference/.

The mockup images are saved enlarged by a whole number. This finds the largest
factor n for which every n x n block is one color, and shrinks by it.
Run: python make_reference.py
"""
import pathlib
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[5]
SRC = ROOT / "_dev/mockups/v2/images"
OUT = ROOT / "_dev/art/reference"
OUT.mkdir(parents=True, exist_ok=True)


def scale_of(a):
    h, w = a.shape[:2]
    for n in range(12, 1, -1):
        if h % n or w % n:
            continue
        blocks = a.reshape(h // n, n, w // n, n, -1)
        if (blocks == blocks[:, :1, :, :1]).all():
            return n
    return 1


for p in sorted(SRC.glob("*.png")):
    a = np.array(Image.open(p).convert("RGBA"))
    n = scale_of(a)
    Image.fromarray(a[::n, ::n]).save(OUT / p.name)
    print(f"{p.name:28} x{n:<2} -> {a.shape[1] // n}x{a.shape[0] // n}")
