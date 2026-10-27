"""One row per bust: each face, then its talking frame beside it. Writes preview/sheet_x5.png."""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE / "src"))
sys.path.insert(0, str(HERE.parent / "00-foundation"))
import pixkit  # noqa: E402
from make_talking import pairs  # noqa: E402


def rows():
    out = {}
    for bid, face, img, twin, stem in pairs():
        out.setdefault(bid, []).append((face, img, twin))
    return list(out.items())


if __name__ == "__main__":
    sheet = [(bid, [im for _, img, twin in faces for im in (img, twin)]) for bid, faces in rows()]
    pixkit.contact_sheet(sheet, scale=5).save(HERE / "preview" / "sheet_x5.png")
    print("each face, then its talking frame")
