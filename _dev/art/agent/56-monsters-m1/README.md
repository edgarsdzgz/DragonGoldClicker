# Batch 56: monsters M1, the pilot (2026-10-29)

The Kamaitachi (Japanese sickle weasel), regular monster of Mistral Peaks. Drawn as fill grids (`src/m1.py`)
and built by `44-bestiary/src/kit.py`, so it matches the locked bestiary. Its walk is its own two frames
(swirl and tail alternate), as in `48-bestiary-fliers`.

Build: `python -I src/make_bestiary.py`, then `python -I build_board.py` (board.html).

- `out/mob_kamaitachi[-strong|-stronger]_{idle,hit,hurt}.png`, `_walk_strip2.png`, `_death_strip4.png`
- The build stops if a crack cell is off the body (checked on both walk frames).
