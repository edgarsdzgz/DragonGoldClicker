# Batch 46: the bestiary's elites (2026-10-27)

Batch 2 of 3 from the second bestiary round (`_dev/docs/bestiary.md`): Kobold Shaman, Goblin Chieftain,
Orc Warchief, Troll, Ogre, Iron Golem and Windcaller. Elites sit between a regular and a boss, about 16x20.
Drawn as fill grids (`src/elites.py`) and built by `44-bestiary/src/kit.py`.

Build: `python src/make_bestiary.py`, then `python build_board.py` (board.html).

- `out/mob_<id>[-strong|-stronger]_{idle,hit,hurt}.png`, `_walk_strip2.png`, `_death_strip4.png`
- The build stops if a crack cell is off the body.
