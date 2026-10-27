# Simpler busts (option)

The owner kept the v1 busts (`_dev/art/reference/bust-*.png`) and asked what they would look like
simplified, leaning into pixel-art simplicity. These are that option; nothing here is locked.

- `src/make_busts.py`: each bust drawn at 22x23 (half the v1's resolution) and shown at double. One flat
  color per part, two tones at most, small solid eyes, the game palette only. The v1 reds become rust.
- `src/explore.py`: the automatic passes tried first (palette snap and despeckle; a half-size downsample).
  They kept too much or lost the faces, so the busts are drawn by hand instead.
- `build_board.py`: the review board, v1 beside the simpler drawing at the same size.

Run: `python src/make_busts.py && python build_board.py`

## Versions

- **v2** (the first simpler pass): `out/bust_*_v2.png`, `src/make_busts_v2.py`, `board.html` and
  `board_v2.html` (published at https://claude.ai/artifact/Wfd4e78pefW4Y3rSUvDQKn).
- **v3** (the owner's notes on v2): `out/bust_*_v3.png` from `src/make_busts.py`, board `board_v3.html`.
  More shading (light from the upper left), Pyreth's pupils, Rodain's vertical scar and a thicker sash
  moved right, Mirael's freckles, Lirae's wing and tome detail, and for Kael a second take,
  `bust_kael-full_v3.png`: v1 at 44x46 snapped to the palette and cleaned, between v1 and v2.
  `out/bust_*_simple.png` are the last v2 run's files under their old name.
- **v4** (the owner's picks from v3): `out/bust_*_v4.png`, board `board_v4.html` (`build_board_v4.py`).
  Pyreth without pupils, Lirae's paler chest back above the tome, Kael's 22x23 take; Rodain and Mirael
  unchanged from v3.
