"""Monster deaths, 2026-10-27 (owner: "when they are hurt and then die, the death is not read. It reads as
though they healed completely to full. So, we need them to die, we will have the code blink them out of
existence and have the next one walk up").

A 4-frame death for every monster at every Unmaking tier, built from its own hurt pose so the cracks and
colors match:
  1. the knees buckle: the body sinks two rows;
  2. it falls: tipped over sideways and still off the ground (the crawler flips onto its back instead);
  3. it lands: lying on the ground, a puff of dust at each end;
  4. it is unmade: the body dims (the dusk palette map) and the Unmaking's purple rises off it.
The code holds the last frame, blinks it out and sends the next monster up the road.

Each frame keeps the feet (bottom center) where the idle pose has them: the canvas is widened evenly on both
sides so the lying body fits. Run: python src/make_deaths.py
"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parents[1]
AGENT = HERE.parent
sys.path.insert(0, str(AGENT / "00-foundation"))
import pixkit  # noqa: E402
from pixkit import DUSK, PALETTE, relight, upscale  # noqa: E402

OUT, PREVIEW = HERE / "out", HERE / "preview"
MOBS = ("kobold", "goblin", "crawler", "orc", "raider")
TIERS = {"": AGENT / "22-mobs" / "out", "strong": AGENT / "24-mobs-unmaking" / "out" / "strong",
         "stronger": AGENT / "24-mobs-unmaking" / "out" / "stronger"}
FPS = 8
INK = PALETTE["ink"]


def rgba(name):
    return PALETTE[name] + (255,)


def squash(img, rows=2):
    """Drop `rows` rows from the middle of the body: it sinks, feet still on the ground."""
    keep = [y for y in range(img.height) if not (img.height // 2 - rows // 2 <= y < img.height // 2 - rows // 2 + rows)]
    out = Image.new("RGBA", (img.width, len(keep)), (0, 0, 0, 0))
    for ny, y in enumerate(keep):
        out.paste(img.crop((0, y, img.width, y + 1)), (0, ny))
    return out


def body_bbox(img):
    return img.getbbox()


def place(canvas, img, lift=0):
    """img centered on the canvas, its lowest pixel `lift` rows above the ground."""
    x0, y0, x1, y1 = body_bbox(img)
    cut = img.crop((x0, y0, x1, y1))
    x = (canvas.width - cut.width) // 2
    y = canvas.height - cut.height - lift
    canvas.alpha_composite(cut, (x, y))
    return x, y, cut.width, cut.height


def dust(canvas, x, w):
    px = canvas.load()
    g = canvas.height - 1
    for dx, dy, c in ((-2, 0, "steel2"), (-1, -1, "steel3"), (-3, -1, "steel2"),
                      (w + 1, 0, "steel2"), (w, -1, "steel3"), (w + 2, -1, "steel2")):
        xx, yy = x + dx, g + dy
        if 0 <= xx < canvas.width and 0 <= yy < canvas.height and not px[xx, yy][3]:
            px[xx, yy] = rgba(c)


def unmade(canvas, lying_box):
    """The body darkens; the Unmaking's purple rises off it in a few motes."""
    dark = relight(canvas, DUSK)
    px = dark.load()
    x, y, w, h = lying_box
    for i, (fx, up, c) in enumerate(((0.25, 2, "magenta3"), (0.5, 4, "magenta4"), (0.75, 1, "magenta3"),
                                     (0.4, 6, "magenta2"))):
        xx, yy = x + int(w * fx), y - up
        if 0 <= xx < dark.width and 0 <= yy < dark.height:
            px[xx, yy] = rgba(c)
    return dark


def death(hurt, flip):
    # v2: the same margin on each side of the walk's own frame, so the death is centered exactly where the
    # walk is, and the first frame sits at that margin (v1 centered the body's outline, half a pixel off)
    margin = (max(hurt.width, hurt.height) + 6 - hurt.width + 1) // 2
    size = (hurt.width + 2 * margin, hurt.height)
    fell = hurt.rotate(180) if flip else hurt.rotate(90, expand=True)
    frames = []
    f = Image.new("RGBA", size, (0, 0, 0, 0))
    sunk = squash(hurt)
    f.alpha_composite(sunk, (margin, size[1] - sunk.height))
    frames.append(f)
    f = Image.new("RGBA", size, (0, 0, 0, 0))
    place(f, fell, lift=3)
    frames.append(f)
    f = Image.new("RGBA", size, (0, 0, 0, 0))
    box = place(f, fell)
    dust(f, box[0], box[2])
    frames.append(f)
    f = Image.new("RGBA", size, (0, 0, 0, 0))
    place(f, fell)
    frames.append(unmade(f, box))
    return frames


def main():
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    n = 0
    for tier, folder in TIERS.items():
        for mob in MOBS:
            name = f"mob_{mob}-{tier}" if tier else f"mob_{mob}"
            hurt = Image.open(folder / f"{name}_hurt.png").convert("RGBA")
            frames = death(hurt, flip=mob == "crawler")
            pixkit.strip(frames).save(OUT / f"{name}_death_strip4.png")
            pixkit.write_gif(frames + [frames[-1]] * 3, FPS, PREVIEW / f"{name}_death.gif")
            upscale(pixkit.strip(frames), 4).save(PREVIEW / f"{name}_death_x4.png")
            n += 1
    print(n, "death strips")


if __name__ == "__main__":
    main()
