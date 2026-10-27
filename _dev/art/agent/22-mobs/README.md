# Simple mobs (2026-10-27)

The owner found the first monsters no good and asked for simple mobs closer to the villagers. The
five monsters the game uses (`src/types/monsterRoster.ts`: kobold, goblin, shadow crawler, orc,
and the raider of the food raid) redrawn in the townsfolk's language: front-on, flat, one color
per part, dot eyes, an ink outline. They replace Batch 4's monster hit and hurt poses.

What marks them as enemies, and no townsperson shares: glowing gold eyes (a glow color, so they
shine at night), their signature colors (new palette ramps `kobold`, `goblin`, `ash`, `shadow`,
taken from the first monster art), and a weapon or a menacing shape. Hit and hurt reuse Batch 4's
poses (`21-warfront/src/make_warfront.py`): the idle's own pixels moved.

Build: `python src/make_mobs.py`, then `python build_board.py`. Sprites: `out/mob_<id>_<state>.png`.
Open question for the owner: display size on the Warfront (the backdrop's scale, or double).

Round 2 (owner): the hit pose flashes red, every ink pixel (outline, shut eyes, mouth) turned
red3, red being the damage color; and a walk: two frames, standing and the whole mob one pixel up,
played at 4 fps as a gentle bob (`out/mob_<id>_walk_strip2.png`). Every mob canvas has one extra
clear row on top so all its poses share one size.
