# Batch 50: the standard set of faces (2026-10-27)

Every bust gets the standard set: neutral, happy, grieving, angry, alarmed, worried, determined. 51 new
faces, drawn on the locked busts (brows, eyes and mouth only; each redrawn neutral face must equal the locked
file). The faces 42-expressions locked fill their slots. Ashara, Lirae and the Hollow Knight are drawn by hand
(the Knight's feeling is a light inside its visor slit); the rest come from one engine driven by each face's
anatomy.

Build: `python src/make_expressions.py`, `python sheet.py`, then `python build_board.py` (board.html).
`src/dump_faces.py` prints a bust's cells by name, for designing edits.

- `out/bust_<id>_<face>_v1.png`
