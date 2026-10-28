# Batch 54: sound effects, batch 3 (2026-10-28)

The moments the art audit found silent: bosses and mini-boss reaching the gate and falling, Varn's breath,
sharpening and reforging the claws. Synthesized in Python with batches 1 and 2's building blocks
(`38-sound/src/make_sound.py`, `39-sound-2/src/make_sound.py`). No monster voices (owner ruling): the horde
speaks through its war horn and drums.

Build: `python src/make_sound.py [names...]`, then `python build_board.py` (board.html).

- `out/sfx_<name>.wav`, `out/sfx_<name>.m4a`: the effects. Not locked yet.
- Timings: the boss's fall lands at 250 ms and is unmade at 375 ms, as every death strip does (8 fps);
  Varn's breath draws air for the 167 ms he rears, then breathes (his strike strip, 6 fps).
