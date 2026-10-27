# Batch 47: the bestiary's bosses (2026-10-27)

Batch 3 of 3 from the second bestiary round (`_dev/docs/bestiary.md`): Basilisk, Spider Queen, Corrupted
Drake and Lich. Sized like the locked bosses. Drawn as fill grids (`src/bosses.py`) and built by
`44-bestiary/src/kit.py`.

Build: `python src/make_bestiary.py`, then `python build_board.py` (board.html).

- `out/mob_<id>[-strong|-stronger]_{idle,hit,hurt}.png`, `_walk_strip2.png`, `_death_strip4.png`
- The build stops if a crack cell is off the body.
