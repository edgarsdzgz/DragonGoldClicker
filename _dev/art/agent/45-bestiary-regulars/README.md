# Batch 45: the bestiary's regular monsters (2026-10-27)

Batch 1 of 3 from the second bestiary round (`_dev/docs/bestiary.md`): War Hound, Skeleton, Spectral Hound,
Nomad Scout, Nomad Archer and Cult Apprentice. Drawn as fill grids (`src/regulars.py`) and built by
`44-bestiary/src/kit.py`, so they match the locked bestiary exactly.

Build: `python src/make_bestiary.py`, then `python build_board.py` (board.html).

- `out/mob_<id>[-strong|-stronger]_{idle,hit,hurt}.png`, `_walk_strip2.png`, `_death_strip4.png`
- The build stops if a crack cell is off the body.
