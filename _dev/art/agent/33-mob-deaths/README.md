# Monster deaths

A 4-frame death for every monster at every Unmaking tier (weak, strong, stronger), so a kill reads as a
kill instead of the next monster looking like the last one healed. Built from each monster's own hurt pose:
the knees buckle, it falls (the crawler flips onto its back), it lands in dust, and it is unmade, dimmed
through the dusk palette map with the Unmaking's purple rising off it. The canvas is widened evenly so the
feet stay where the idle pose has them. The game holds the last frame, blinks it out, and the next monster
walks up.

- `src/make_deaths.py` writes `out/mob_<id>[-<tier>]_death_strip4.png` (8 fps) and GIFs in `preview/`.
- `build_board.py`: the review board.

Run: `python src/make_deaths.py && python build_board.py`
