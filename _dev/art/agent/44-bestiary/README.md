# Batch 44: the bestiary (2026-10-27)

Eighteen new monsters from the old Draconia bestiary (`_dev/docs/bestiary.md`), and the six existing ones
shaded as v2. Drawn as fill grids (`src/creatures.py`), shaded and built by `src/kit.py` with the locked
monsters' own code (hit, hurt, walk, cracks, death).

Build: `python src/make_bestiary.py`, then `python build_board.py` (board.html).

- `out/mob_<id>[-strong|-stronger]_{idle,hit,hurt}.png`, `_walk_strip2.png`, `_death_strip4.png`
- `out/v2/`: kobold, goblin, crawler, orc, raider and the Minotaur, shaded
