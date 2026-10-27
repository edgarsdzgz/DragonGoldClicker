# The game's logo and app icon

Owner, 2026-10-27: "We need a logo for the game which should also be the app thumbnail."

The protagonist is commissioned from the artist and never drawn here, so the dragon appears only by its
marks. Three concepts, drawn in code (`src/make_logo.py`):

- **shield:** the city's shield struck by three ember claw marks.
- **gate:** Draconia's gate and towers under a gold moon, the hearth glowing behind the portcullis.
- **monogram:** a gold D with Pyreth's ember in its heart.

Each is a 64x64 icon (`out/logo_<id>_icon.png`, with `preview/logo_<id>_icon_1024.png` at x16 for the
stores) and a lockup with the wordmark (`out/logo_<id>_lockup.png`). The wordmark,
`out/logo_wordmark.png`, sets DRACONIA in a bold seven-pixel face on the gold ramp and CHRONICLES in
small spaced caps.

## Chosen (owner, 2026-10-27)

- **A, the shield, is the logo and the app icon.** `src/export_icons.py` writes `app_icon_1024`
  (x16, opaque), `app_adaptive_1024` (x10 on its own background, inside Android's safe circle) and
  `app_favicon_64`. These are installed as `assets/icon.png`, `assets/adaptive-icon.png` and
  `assets/favicon.png`.
- **B, the gate, is the splash.** `src/make_splash.py` builds it in the owner's order: towers, the moon
  rising, windows, portcullis, the light spilling down into the path, then the wordmark. Fades are
  palette steps (silhouette, dusk, lit), never alpha. Output: `splash_frames_strip28.png` and
  `splash_timing.json` (each frame's hold in ms); the first frame is plain night1 background, so a static
  splash in #281e32 hands over seamlessly.
- **A in motion** (`src/make_shield_anim.py`, optional use): the shield flies in from the foreground and
  slams into place (squash, shake, dust), three claws slash upward, and the three sparks fly off the
  slash as debris. The shield is redrawn from its polygons at every size, so the zoom stays crisp; the
  last frame is `logo_shield_icon.png` exactly. Output: `logo_anim_frames_strip20.png`,
  `logo_anim_timing.json`, `preview/logo_anim.gif`.
- **Splash timing** (owner): 5.5 seconds in all, back to the first cut after trying others, all kept:
  `splash_timing_v1` (5.5 s), `_v2` (8.4 s), `_v3` (6.2 s) and `_v4` (5.8 s).
- **A's slam dust, v2** (owner: "more all around the shield, to make the impact more impactful"): a ring
  of uneven puffs bursts from behind the whole shield, spreads and breaks up over four frames. The first
  cut is kept as `out/logo_anim_frames_strip19_v1.png` and `preview/logo_anim_v1.gif`.
- **The studio intro** (owner: "using the shield as the animation for RAXDEG STUDIOS. I want the letters to
  be part of it. Maybe slash across the top from left to right"; `src/make_studio_intro.py`): logo A's
  slam and claws, then one more slash rips across the top left to right and carves RAXDEG STUDIOS (a
  five-by-seven gold face, lighter than the game's wordmark); the letters burn white-hot behind the slash
  and cool to gold. About 4.1 seconds, then it holds. Output: `studio_intro_frames_strip31.png`,
  `studio_intro_timing.json`, `studio_card.png` (88x83, the last frame), `preview/studio_intro.gif`. The
  first cut, with the name fading in, is kept as `*_v1`.
