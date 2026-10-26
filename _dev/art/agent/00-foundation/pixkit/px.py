"""The .px text format: many assets per file, one grid per frame.

    # a comment
    @asset icon_hourglass
    size 12 12          expected size (checked)
    budget 8            max colors, ink not counted (default 16)
    outline no          skip the outline check (effects); default yes
    ground yes          the bottom edge stands on the ground; default no
    fps 8               frame rate, for animations
    anchor 5 19         pivot pixel, recorded in the manifest
    key a=ink b=gold4   one character per palette name; '.' is clear
    frame
    aaaa...
    frame
    ....

One frame writes out/<name>.png; several write out/<name>_strip<N>.png plus
piskel/<name>.piskel and preview/<name>.gif. Every asset gets preview/<name>_x4.png.
"""
import json
import pathlib

from .core import check, from_grid, strip, upscale, write_gif, write_piskel


def parse(text):
    assets, cur = [], None
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        word, _, rest = line.partition(" ")
        if word == "@asset":
            cur = {"name": rest.strip(), "frames": [], "key": {}, "spec": {}}
            assets.append(cur)
        elif word == "frame":
            cur["frames"].append([])
        elif word == "key":
            cur["key"] = dict(p.split("=", 1) for p in rest.split())
        elif word == "size":
            cur["spec"]["size"] = tuple(int(v) for v in rest.split())
        elif word == "anchor":
            cur["anchor"] = tuple(int(v) for v in rest.split())
        elif word == "budget":
            cur["spec"]["budget"] = int(rest)
        elif word in ("outline", "ground"):
            cur["spec"][word] = rest.strip() == "yes"
        elif word == "fps":
            cur["fps"] = int(rest)
        else:
            cur["frames"][-1].append(line)
    return assets


def build(px_path, out_root):
    """Render every asset in px_path under out_root; return manifest entries."""
    out_root = pathlib.Path(out_root)
    for sub in ("out", "piskel", "preview"):
        (out_root / sub).mkdir(parents=True, exist_ok=True)
    entries = []
    for a in parse(pathlib.Path(px_path).read_text(encoding="utf-8")):
        frames = [from_grid(rows, a["key"]) for rows in a["frames"]]
        spec = a["spec"]
        errors, warnings = [], []
        for i, f in enumerate(frames):
            e, w = check(f, spec)
            tag = f"frame {i + 1}: " if len(frames) > 1 else ""
            errors += [tag + m for m in e]
            warnings += [tag + m for m in w]
        name, fps = a["name"], a.get("fps", 8)
        if len(frames) == 1:
            file = f"{name}.png"
            frames[0].save(out_root / "out" / file)
        else:
            file = f"{name}_strip{len(frames)}.png"
            strip(frames).save(out_root / "out" / file)
            write_piskel(frames, fps, out_root / "piskel" / f"{name}.piskel", name)
            write_gif(frames, fps, out_root / "preview" / f"{name}.gif")
        upscale(strip(frames), 4).save(out_root / "preview" / f"{name}_x4.png")
        entries.append({"name": name, "file": file, "size": list(frames[0].size),
                        "frames": len(frames), "fps": fps if len(frames) > 1 else None,
                        "anchor": list(a.get("anchor", ())) or None,
                        "errors": errors, "warnings": warnings})
    return entries


def write_manifest(entries, out_root):
    path = pathlib.Path(out_root) / "manifest.json"
    path.write_text(json.dumps(entries, indent=1), encoding="utf-8")
    return path
