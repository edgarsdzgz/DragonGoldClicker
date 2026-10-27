# Batch 39: sound effects, batch 2 (2026-10-27)

The list locked in `_dev/docs/todo.md`: 23 effects and 4 ambient loops, synthesized in Python with batch 1's
building blocks (`38-sound/src/make_sound.py`). No monster voices (owner ruling).

Build: `python src/make_sound.py [names...]`, then `python build_board.py` (board.html).

- `out/sfx_<name>.wav`, `out/sfx_<name>.m4a`: the effects
- `out/amb_<name>.wav`, `out/amb_<name>.m4a`: 8-second seamless loops (torches, forge, night wind, horde drums)
