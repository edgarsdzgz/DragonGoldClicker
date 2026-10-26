"""The starter master palette (not locked; see the brief, section 10).

Ramps run dark to light. The colors come from the existing icons and townsfolk,
plus a fire ramp for glow. Every new asset uses only these names.
"""
RAMPS = {
    "ink": ["120a10"],
    "night": ["281e32", "463a5a", "5a6082", "9678a8"],
    "steel": ["606878", "78808c", "aaaaba", "d2dae6", "e2e6f0"],
    "gold": ["966032", "b07828", "d69648", "f0c060", "ffdc78", "ffecb4"],
    "wood": ["463228", "603c24", "6e4628", "965a28"],
    "clay": ["96402c", "aa5028", "b46432"],
    "red": ["5a1a22", "963022", "c8402c"],
    "fire": ["f08a1e", "ffd63c", "fff4c8"],
    "skin": ["d6a078", "e8b88c", "f0d6b8"],
    "parch": ["b49664", "c8a05a", "ecd6aa"],
    "green": ["24402e", "3c785a", "6aa070"],
}

# Colors that keep their value at night (README section 4).
GLOW = {"fire1", "fire2", "fire3", "gold5", "gold6"}


def _names():
    """Ordered {name: (r, g, b)}; a one-color ramp drops the number ("ink")."""
    out = {}
    for ramp, hexes in RAMPS.items():
        for i, h in enumerate(hexes, 1):
            key = ramp if len(hexes) == 1 else f"{ramp}{i}"
            out[key] = tuple(int(h[j:j + 2], 16) for j in (0, 2, 4))
    return out


PALETTE = _names()


def write_files(folder):
    """Write draconia.gpl, draconia.hex and palette.png into folder."""
    import pathlib
    from PIL import Image

    folder = pathlib.Path(folder)
    folder.mkdir(parents=True, exist_ok=True)
    lines = ["GIMP Palette", "Name: Draconia (starter)", "Columns: 8", "#"]
    lines += [f"{r:3} {g:3} {b:3}\t{n}" for n, (r, g, b) in PALETTE.items()]
    (folder / "draconia.gpl").write_text("\n".join(lines) + "\n", encoding="utf-8")
    (folder / "draconia.hex").write_text(
        "\n".join(f"{r:02x}{g:02x}{b:02x}" for r, g, b in PALETTE.values()) + "\n", encoding="utf-8")
    img = Image.new("RGB", (len(PALETTE), 1))
    img.putdata(list(PALETTE.values()))
    img.save(folder / "palette.png")
