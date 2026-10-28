# 51 Talking frames (v2, 2026-10-28)

A second frame for every face, swapped while a line types in the dialogue box. 70 frames: ten busts, seven
faces each (neutral and the standard six, with Varn's fierce, Sera's roaring and Thornwick's startled in their
slots).

- `src/make_talking.py` draws them on the locked images in `official/cast`; only the mouth changes. It asserts
  each frame differs from its face and changes nothing outside the face.
- `sheet.py` writes `preview/sheet_x5.png` (each face, then its frame).
- `build_board.py` writes `board.html`, with each pair playing as a GIF at the box's swap (112 ms).

Out: `out/bust_<id>[_<face>]_talk_v2.png`. Not locked yet.

v2 (2026-10-28): I saw mustaches on Rodain, Mirael, Kael, Thornwick and Sera. A pale row over a dark one reads
as a mustache at this size, so bared teeth now go dark as the face speaks, and an open mouth opens a row taller
instead of closing to a flat line. 21 frames changed; `board_v2.html` shows them first, v1 beside v2. v1 stays in
`out/*_talk_v1.png` and `board.html`.
