"""pixkit: the shared pixel-art toolkit (brief section 6.1).

Assets are text grids in .px files (see px.py) or drawn with Pillow and snapped
to the palette. Everything stays inside the master palette.
"""
from .palette import GLOW, PALETTE, RAMPS, write_files
from .core import (check, contact_sheet, from_grid, outline, quantize, strip, upscale,
                   write_gif, write_piskel)
from .px import build, parse, write_manifest
