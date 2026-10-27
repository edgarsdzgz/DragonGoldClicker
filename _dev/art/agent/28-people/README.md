# Batch 6: People

The game's roles and the wanderer groups, at townsfolk scale and in the fighter's style. The plan is in
`../../agent-brief/batches.md`, Batch 6.

- `src/people.px`: every sprite as a text grid (roles, the repairer's 2 frames, the wanderer figures).
- `build.py`: draws and checks them (palette, color budget, outline) into `out/`, `preview/`, `manifest.json`.
- `src/make_wanderers.py`: stands the figures on a strip of road for `evt_wanderer-lone`, `-couple`,
  `-family`, `-veteran` (34x22, feet on row 19).
- `build_board.py`: the review board, `board.html`.

Each role is a different people: conscript, footman and knight are human; the gatherer is the halfling,
the trapper the orc, the ranger an elf, the explorer horned folk, the repairer the dwarf. Rank reads from
gear: rags and a dull spear, then a helmet and shield, then plate, plume and pennant.

Run: `python build.py && python src/make_wanderers.py && python build_board.py`
