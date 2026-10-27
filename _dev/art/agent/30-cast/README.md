# Batch 8: Cast extras

The five sigils as real files and the prologue's emblem. The plan is in `../../agent-brief/batches.md`,
Batch 8.

- `src/make_cast.py` draws them into `out/` (and x4 previews into `preview/`):
  - `cast_sigil-pyreth` (the ember), `-rodain` (crossed spears), `-mirael` (the compass star), `-kael`
    (the anvil), `-lirae` (the quill): 10x10, each from the mockup's own glyph in
    `_dev/mockups/v1/Cast.dc.html`, pulled in a pixel so its ink outline fits.
  - `cast_emblem-gate`: 44x46, a bust's slot. The Gate of Draconia narrates the prologue, so its mark is
    the gatehouse itself, its arch glowing behind the portcullis. Not a face.
- `build_board.py`: the review board, each sigil on the mockup's dialogue name tag beside its bust,
  named as the game names its speakers.

Run: `python src/make_cast.py && python build_board.py`
