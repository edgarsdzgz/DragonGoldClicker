# 52 Chapters 9 to 13 art (v1, 2026-10-28)

The art for the five approved chapters (`_dev/planning/new-cast-scenes/`): a story picture for each, the
newcomers as small figures at the people's scale, and Varn on the Warfront wall, who strikes on his own.

- `src/figures.py`: the figures as grids (Varn perched, rearing, breathing and flying; Sera; Thornwick; the
  Hollow Knight standing and walking) and Ashara, drawn as shapes at her own, much larger scale.
- `src/make_art.py`: writes the sprites and the five 130x96 pictures, built from locked art with the
  helpers of `43-story-scenes`.
- `build_board.py` writes `board.html`: the pictures, Varn on the wall (striking, as a GIF), the figures.

Out: `out/<name>_v1.png`. Not locked yet.
