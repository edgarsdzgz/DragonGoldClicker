# Batch 3: the buildings (2026-10-26)

Every building in every state, each its own sprite the size of its plot (Batch 2,
`19-city/out/map_plots.json`), its base on the plot's bottom row. Drawn front-on in the lit look,
lit from the upper left; windows, braziers and the forge use glow colors so they stay lit at night.

Build: `python src/preview.py` (all sprites, the forge strip, previews), `python src/icons.py`
(building icons), `python build_board.py` (board.html).

- `src/kit.py`: the shared parts: stone, plank, log and timber walls; gable, hip and cone roofs;
  battlements; windows; doors; banners and flags; broken tops and rubble for ruins.
- `src/buildings.py`: one function per building state; `out/bld_<id>_<state>.png`.
- `out/bld_forge_lit_strip3.png`: the forge fire, 3 frames (6 fps in the preview GIF).
- `out/icon_bld-<id>.png`: the ten 16 x 16 building icons.

| Building | Plot | States |
| --- | --- | --- |
| Draconia Keep | 50 x 82 | ruin, built, restored |
| The Garrison | 32 x 32 | ruin, lv1, lv3, lv5 |
| The Forge | 32 x 32 | ruin, built (cold), lit |
| Ranger's Lodge | 32 x 32 | ruin, lv1, lv3 |
| Wayfinder's Outpost | 32 x 32 | ruin, built, upgraded |
| The Librarium | 32 x 32 | ruin, built |
| Housing | 32 x 32 | house, row |
| Wizard's Tower | 24 x 40 | ruin, built |
| Tower West, Tower East | 20 x 32 | ruin, built |

The brief's route was Blender for layout, then a code redraw. The front-on view and the shared
plot table made Blender unnecessary: everything is drawn in code from the kit.
