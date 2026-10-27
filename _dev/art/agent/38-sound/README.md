# Batch 38: sound effects (2026-10-27)

Synthesized in Python from oscillators and noise (numpy; ffmpeg for AAC). The studio splash's beats are placed from official/studio/seal_build_timing.json; the monster death follows its strip's frames.

Build: `python src/make_sound.py, then python build_board.py` (board.html).

- `out/<name>.wav` (44.1 kHz mono 16-bit) and `out/<name>.m4a` (AAC 96k, as assets/music/out uses)
- `out/splash_beats.json`: each splash beat's start in seconds
