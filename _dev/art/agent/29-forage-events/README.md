# Batch 7: Forage and events

The Forage screen's pieces and the art for events and reports. The plan is in
`../../agent-brief/batches.md`, Batch 7.

- `src/make_events.py` draws everything into `out/` (and x4 previews into `preview/`):
  - `evt_granary_25`, `_75`: from the locked granary's own code (`01-test-run/src/granary.py`), so the five
    stages match.
  - `evt_forage-action` (20x20), `evt_food-lean`, `-bountiful`, `-raid`, `-refugees` (24x24),
    `evt_food-warning` (12x12): outlined icons, flat two- and three-tone shading, lit from the upper left.
    Only the warning's mark is red (danger).
  - Banners, 110x34: `evt_exp-light`, `-find`, `-survivors`, `-silent`, `evt_welcome-back`,
    `evt_breach-report`, `evt_refugees`. Flat bands and clusters, no dither. The three wall scenes crop the
    locked gate art (`official/warfront/map_gate_*`); Refugees uses the Batch 6 wanderer figures.
- `build_board.py`: the review board, each piece on a rough mock of where it shows.

Run: `python src/make_events.py && python build_board.py` (after Batch 6's `build.py`).
