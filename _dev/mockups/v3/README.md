# Mockup v3: every screen, the flow, and the interface kit

Made 2026-10-28. Published as a Design canvas: https://claude.ai/artifact/Bsw8cbkmoPVZDjmjYVw72P

- Rows: how the screens connect (a flow board), first launch, the four tabs, the seven building interiors,
  sheets and the story, events, and the interface kit on its own.
- Each screen uses the game's own art and wording (from `src/` on 2026-10-28) and a sample late-game state
  (chapter 11: the Wizard's Tower revealed, not yet built in the quest line). Numbers are that sample's.
- Every screen is dressed in the interface kit v1 (`_dev/art/agent/53-interface-kit`), a proposal. The kit's
  look lives in one file, `project/kit.css`, which every screen links.
- The tabs, building plots and buttons link to each other in the canvas's Play mode.

Files:
- `project/`: the canvas's own files as published (`canvas.json`, one `.dc.html` per board, `kit.css`).
  Images are the canvas's uploads (`/_blob/...` addresses); they live in the artifact, not here.
- `make_assets.py`: builds the two map backdrops (the Warfront with its fighters and Varn, the lit city)
  from the locked art and copies the sprites the boards show, into `assets/`.

Not drawn: the protagonist dragon (commissioned). The Forage tab has no scene of its own yet.
