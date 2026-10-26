# Mockup v2: every screen in the game today

Made 2026-10-26. Published at https://claude.ai/artifact/L3NXZPXKZ1amR8yg3UgZxS.

One page: a screen list, a 390 × 844 phone, and notes on what the code has for each screen.
It covers the four tabs, the six building interiors, the sheets and events, and the first launch.
The wording comes from the code (inventory taken from `src/` on 2026-10-26); the notes mark the
few lines that are placeholders.

- `mockup.src.html` is the source. It opens in a browser as is, with images from `images/`.
- `build.py` inlines the images and writes `mockup.html`, the self-contained file that gets
  published. Run `python build.py` after editing the source, then republish.
- `images/` holds the art from mockup v1, plus the stand-in protagonist:
  `dragon-standin.png` (body study V2, 128 × 128, shown at 2×) and `dragon-portrait-standin.png`
  (head study V7, 48 × 48). Both are replaced when the commissioned art arrives.
