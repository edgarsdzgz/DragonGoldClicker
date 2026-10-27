# Batch 48: the bestiary's fliers and riders (2026-10-27)

Giant Bat, Harpy, Mantair Corsair and Storm Rider (fliers), and the Goblin Wolf Rider (a ground rider).
Owner: fliers need no new battlefield; they use the road, drawn higher over a shadow of their own. A flier's
two walk frames are a wingbeat (the Storm Rider's a gallop on the wind), so the game plays them in the walk
slot. Drawn as fill grids (`src/fliers.py`), built by `44-bestiary/src/kit.py` plus a flier builder.

Build: `python src/make_bestiary.py`, then `python build_board.py` (board.html, and the on-the-road GIFs).

- `out/mob_<id>[-strong|-stronger]_{idle,hit,hurt}.png`, `_walk_strip2.png`, `_death_strip4.png`
- `out/mob_<id>_shadow.png` for each flier: a flat ink oval; the game draws it on the road at half strength.
