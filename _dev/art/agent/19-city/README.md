# Batch 2: the Draconia city base map (2026-10-26)

The city with no buildings on it, so each building can appear, disappear and change state on its
own plot. Native 130 x 282, the size of the old painted backdrop (`reference/city-bg.png`), shown
at x3. Drawn in the lit look; the game darkens it with the night and dusk palette maps, which this
batch added to the toolkit (`pixkit.NIGHT`, `pixkit.DUSK`, `pixkit.relight`; brief section 4).

Build: `python src/make_city.py`, then `python build_board.py` (board.html).

| File | What it is |
| --- | --- |
| `out/map_city_base.png` | grass, the forest edge, the road from the Keep's door to the gate, the city wall and gate |
| `out/map_plots.json` | the ten plots: id, x, y, width, height, anchor (bottom center) |
| `out/map_fog_<size>.png` | rolling fog over an undiscovered plot |
| `out/map_plot-empty_<size>.png` | cleared ground, the unbuilt look |
| `out/map_foundation_<size>.png` | cut stones laid around the plot |
| `out/map_scaffold_<size>.png` | poles, plank decks, braces and a ladder |
| `out/map_marker-upgrade.png`, `map_marker-todo.png` | the 8 x 8 map markers |
| `preview/` | light levels, plots outlined, pieces on their plots (lit and night) |

Plots follow the old backdrop where it had a building (the Keep at the top, the Lodge where the
green-roofed house stood, the Librarium at the ruin, Housing at the cottages, the two towers at
the torches on the wall); the Outpost, Wizard's Tower, Forge and Garrison were placed in open
ground. Four plot sizes: Keep 50 x 82, Wizard's Tower 24 x 40, wall towers 20 x 32, the rest 32 x 32.

Light maps: night sends each color to the nearest cool color at about 42% brightness; dusk moves
it one step down its own ramp. Glow colors (fire, the brightest golds) keep their value.
