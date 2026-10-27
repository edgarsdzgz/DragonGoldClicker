# Batch 34: city light levels (2026-10-27)

The city at night, dusk and lit. Lit is the locked art; night and dusk are every locked city piece and building relit with pixkit's light maps (`NIGHT`, `DUSK`), so nothing is redrawn.

Build: `python src/make_light.py, then python build_board.py` (board.html).

- `out/<piece>_night.png`, `out/<piece>_dusk.png`: all 46 pieces in official/city and official/buildings
- `preview/city_<level>_<ruin|built>.png`: the whole city at each level (x2)
