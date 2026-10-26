"""Image helpers and checks. Images are RGBA with alpha 0 or 255 only."""
import base64
import io
import json

from PIL import Image, ImageDraw

from .palette import PALETTE

INK = PALETTE["ink"]
CLEAR = (0, 0, 0, 0)
RGB_SET = set(PALETTE.values())
N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))


def from_grid(rows, key):
    """rows: equal-length strings; key: {char: palette name}; '.' is clear."""
    h, w = len(rows), len(rows[0])
    img = Image.new("RGBA", (w, h), CLEAR)
    px = img.load()
    for y, row in enumerate(rows):
        if len(row) != w:
            raise ValueError(f"row {y} is {len(row)} wide, expected {w}: {row!r}")
        for x, ch in enumerate(row):
            if ch != ".":
                px[x, y] = PALETTE[key[ch]] + (255,)
    return img


def outline(img, color=INK):
    """Grow a 1px ink outline around every opaque region (4-neighbor)."""
    w, h = img.size
    src, out = img.load(), img.copy()
    dst = out.load()
    for y in range(h):
        for x in range(w):
            if src[x, y][3]:
                continue
            for dx, dy in N4:
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and src[nx, ny][3]:
                    dst[x, y] = color + (255,)
                    break
    return out


def quantize(img):
    """Snap every pixel to the nearest palette color, alpha to 0 or 255. No dithering."""
    img = img.convert("RGBA")
    px = img.load()
    cols = list(RGB_SET)
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if a < 128:
                px[x, y] = CLEAR
            else:
                px[x, y] = min(cols, key=lambda c: (c[0] - r) ** 2 + (c[1] - g) ** 2
                               + (c[2] - b) ** 2) + (255,)
    return img


def upscale(img, n):
    return img.resize((img.width * n, img.height * n), Image.NEAREST)


def strip(frames):
    w, h = frames[0].size
    out = Image.new("RGBA", (w * len(frames), h), CLEAR)
    for i, f in enumerate(frames):
        out.paste(f, (i * w, 0))
    return out


def write_piskel(frames, fps, path, name):
    """Write a .piskel file: one layer, frames side by side (brief section 6.2)."""
    buf = io.BytesIO()
    strip(frames).save(buf, "PNG")
    layer = {
        "name": "Layer 1", "opacity": 1, "frameCount": len(frames),
        "chunks": [{"layout": [[i] for i in range(len(frames))],
                    "base64PNG": "data:image/png;base64,"
                    + base64.b64encode(buf.getvalue()).decode()}],
    }
    doc = {"modelVersion": 2, "piskel": {
        "name": name, "description": "", "fps": fps,
        "height": frames[0].height, "width": frames[0].width,
        "layers": [json.dumps(layer)]}}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(doc, f)


def write_gif(frames, fps, path, scale=6, bg=PALETTE["night1"]):
    """An animated preview on a solid background (GIF alpha is unreliable)."""
    out = []
    for f in frames:
        base = Image.new("RGBA", f.size, bg + (255,))
        base.alpha_composite(f)
        out.append(upscale(base, scale).convert("RGB"))
    out[0].save(path, save_all=True, append_images=out[1:], duration=int(1000 / fps), loop=0)


def contact_sheet(rows, scale=4, gap=8, bg=PALETTE["night1"], label=PALETTE["steel4"]):
    """rows: [(label, [img, ...]), ...] -> one image, each row labeled on the left."""
    lab_w = 170
    width = lab_w + max(sum(i.width * scale + gap for i in imgs) for _, imgs in rows) + gap
    height = sum(max(i.height for i in imgs) * scale + gap * 2 for _, imgs in rows) + gap
    sheet = Image.new("RGBA", (width, height), bg + (255,))
    d = ImageDraw.Draw(sheet)
    y = gap
    for text, imgs in rows:
        rh = max(i.height for i in imgs) * scale
        d.text((gap, y + rh // 2 - 6), text, fill=label + (255,))
        x = lab_w
        for i in imgs:
            sheet.alpha_composite(upscale(i, scale), (x, y + rh - i.height * scale))
            x += i.width * scale + gap
        y += rh + gap * 2
    return sheet


def check(img, spec):
    """Brief section 7. Returns (errors, warnings).

    spec: size (w, h); budget (max colors, ink not counted, default 16);
    outline (default True); ground (True: the bottom edge may touch the ground uninked).
    """
    errors, warnings = [], []
    w, h = img.size
    if "size" in spec and tuple(spec["size"]) != (w, h):
        errors.append(f"size {w}x{h}, expected {spec['size'][0]}x{spec['size'][1]}")
    px = img.load()
    used = set()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a not in (0, 255):
                return errors + [f"partial alpha {a} at {x},{y}"], warnings
            if a and (r, g, b) not in RGB_SET:
                return errors + [f"off-palette #{r:02x}{g:02x}{b:02x} at {x},{y}"], warnings
            if a:
                used.add((r, g, b))
    n = len(used - {INK})
    if n > spec.get("budget", 16):
        errors.append(f"{n} colors, budget {spec.get('budget', 16)}")
    if spec.get("outline", True):
        for y in range(h):
            for x in range(w):
                if not px[x, y][3] or px[x, y][:3] == INK:
                    continue
                for dx, dy in N4:
                    nx, ny = x + dx, y + dy
                    if ny >= h and spec.get("ground"):
                        continue
                    if not (0 <= nx < w and 0 <= ny < h) or not px[nx, ny][3]:
                        errors.append(f"unoutlined edge at {x},{y}")
                        break
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            c = px[x, y]
            if not c[3] or c[:3] == INK:
                continue
            ns = {px[x + dx, y + dy] for dx, dy in N4}
            if c not in ns and len(ns) == 1 and next(iter(ns))[3]:
                warnings.append(f"single-pixel island at {x},{y}")
    return errors, warnings
