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
    # Townsfolk orcs: Rodain's gray-green, kept apart from the goblin's yellow-green.
    "orc": ["4e6046", "708662", "869c74"],
    # Fishfolk: sea teal, kept apart from the kobold's olive and any lizard green.
    "sea": ["24505a", "3e8a96", "78c0c0"],
    # Gems (2026-10-26): saturated jewel ramps, dark to highlight, so a magic stone stands out
    # among the gold and brown. Owner asked for green, electric blue, pink, magenta and teal.
    "emerald": ["0f4a36", "1c8256", "34c47a", "a6f2c4"],
    "azure": ["1a3480", "2a68dc", "54b0ff", "c4ecff"],
    "rose": ["8a2a58", "d24e8a", "f48cb8", "ffd6e8"],
    "magenta": ["561866", "9c2a9e", "d458d6", "f6b2f2"],
    "teal": ["145656", "1fa09c", "52dccc", "bef8ee"],
    # Ruby: a crimson jewel ramp, kept apart from the HP red. Owner exception to "red is for HP
    # and danger" (2026-10-26), for the Wyrm's Fury gem only, like the red Close plate.
    "ruby": ["5c0f24", "a8183c", "e8405c", "ffc4cc"],
}

# Colors that keep their value at night (README section 4).
GLOW = {"fire1", "fire2", "fire3", "gold5", "gold6"}

# The cool, dark colors the night map falls back to.
COOL = ["ink", "night1", "night2", "night3", "night4", "steel1", "steel2"]


def _names():
    """Ordered {name: (r, g, b)}; a one-color ramp drops the number ("ink")."""
    out = {}
    for ramp, hexes in RAMPS.items():
        for i, h in enumerate(hexes, 1):
            key = ramp if len(hexes) == 1 else f"{ramp}{i}"
            out[key] = tuple(int(h[j:j + 2], 16) for j in (0, 2, 4))
    return out


PALETTE = _names()


def _lum(rgb):
    r, g, b = rgb
    return 0.299 * r + 0.587 * g + 0.114 * b


def _nearest(target, names):
    return min(names, key=lambda n: abs(_lum(PALETTE[n]) - target))


def _light_maps():
    """The night and dusk maps (README section 4): every master color to a darker master color.

    Night: the nearest cool color at about 42% of the brightness. Dusk: one step down the color's
    own ramp (the darkest step falls to the nearest cool color at 75%). Glow colors keep their
    value in both, so windows, torches and fire stay lit.
    """
    night, dusk = {}, {}
    for ramp, hexes in RAMPS.items():
        names = [ramp] if len(hexes) == 1 else [f"{ramp}{i}" for i in range(1, len(hexes) + 1)]
        for i, n in enumerate(names):
            if n in GLOW:
                night[n] = dusk[n] = n
                continue
            night[n] = _nearest(_lum(PALETTE[n]) * 0.42, COOL)
            dusk[n] = names[i - 1] if i > 0 else _nearest(_lum(PALETTE[n]) * 0.75, COOL)
    return night, dusk


NIGHT, DUSK = _light_maps()


def relight(img, mapping):
    """Return a copy of an RGBA image with every master color swapped through a light map."""
    by_rgb = {PALETTE[k]: PALETTE[v] for k, v in mapping.items()}
    out = img.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if a and (r, g, b) in by_rgb:
                px[x, y] = by_rgb[(r, g, b)] + (a,)
    return out


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
