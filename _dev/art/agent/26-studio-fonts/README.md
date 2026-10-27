# RAXDEG STUDIOS lettering

Owner, 2026-10-27: the shield is Draconia Chronicles' logo and app icon, and, animated, the startup
splash for RAXDEG STUDIOS. "Give me a few brainstorm with differing fonts on RAXDEG STUDIOS on or around
the shield logo", and "a bottom section below everything where we can play around with RAXDEG STUDIOS".

- `src/make_options.py`: five static cards in `out/studio_<id>.png`: light (five-by-seven gold, above),
  steel (bold block silver above, small caps below), ember (bold italic in ember tones), ribbon (a
  parchment ribbon across the shield's foot) and side (horizontal lockup).
- `src/export_playground.py` and `playground.js`: the playground on the logo board's bottom section
  (`25-logo/board.html`). Four faces, seven color ramps, five layouts, letter spacing and zoom, drawn
  in real pixels on a canvas. `out/playground_data.json` carries the glyphs, ramps and shield icon.
