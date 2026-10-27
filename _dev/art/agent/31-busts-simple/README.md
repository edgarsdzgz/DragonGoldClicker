# Simpler busts (option)

The owner kept the v1 busts (`_dev/art/reference/bust-*.png`) and asked what they would look like
simplified, leaning into pixel-art simplicity. These are that option; nothing here is locked.

- `src/make_busts.py`: each bust drawn at 22x23 (half the v1's resolution) and shown at double. One flat
  color per part, two tones at most, small solid eyes, the game palette only. The v1 reds become rust.
- `src/explore.py`: the automatic passes tried first (palette snap and despeckle; a half-size downsample).
  They kept too much or lost the faces, so the busts are drawn by hand instead.
- `build_board.py`: the review board, v1 beside the simpler drawing at the same size.

Run: `python src/make_busts.py && python build_board.py`
