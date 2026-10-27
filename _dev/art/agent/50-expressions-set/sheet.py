"""One row per bust: neutral, then the six faces (the locked ones from 42-expressions in their slots).
Writes preview/sheet_x5.png and returns the rows for the board."""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE / "src"))
sys.path.insert(0, str(HERE.parent / "00-foundation"))
import pixkit  # noqa: E402
from make_expressions import DRAWS, FACES, LOCKED  # noqa: E402

OFFICIAL = HERE.parents[1] / "official" / "cast"


def face_img(bid, face):
    """(image, is it already locked)"""
    if face == "neutral":
        return Image.open(OFFICIAL / f"bust_{bid}.png").convert("RGBA"), True
    if (bid, face) in LOCKED:
        return Image.open(OFFICIAL / f"bust_{bid}_{LOCKED[(bid, face)]}.png").convert("RGBA"), True
    return Image.open(HERE / "out" / f"bust_{bid}_{face}_v1.png").convert("RGBA"), False


def rows():
    return [(bid, [face_img(bid, f) for f in ["neutral"] + FACES]) for bid in DRAWS]


if __name__ == "__main__":
    sheet = [(bid, [im for im, _ in imgs]) for bid, imgs in rows()]
    pixkit.contact_sheet(sheet, scale=5).save(HERE / "preview" / "sheet_x5.png")
    print("neutral, " + ", ".join(FACES))
