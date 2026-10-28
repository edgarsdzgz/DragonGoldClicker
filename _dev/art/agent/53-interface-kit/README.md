# 53: the interface kit, v1 (proposal, 2026-10-28)

The pieces every screen is framed with, drawn as pixel art with stepped corners (owner, 2026-10-26: "UI frames
should match: stepped pixel corners, as in Dicero"). They are shown on every screen of mockup v3
(https://claude.ai/artifact/Bsw8cbkmoPVZDjmjYVw72P, source in `_dev/mockups/v3`). Nothing here is locked.

- Panels: `plate` (a card, stone rim) and `plate_gold` (a sheet, a modal, the dialogue box).
- Buttons, each with a pressed look (`_down`): `btn_key` (gold, the key action), `btn_steel` (steel blue,
  everyday), `btn_quiet` (stone), `btn_danger` (red, destructive only), `btn_off`.
- `bar` (the frame of every bar; fills are flat colors with a lit top row), `chip` and `chip_gold` (counts),
  `tabbar` (its gold top edge), `ribbon` (the quest line, notched ends), `socket` (the heraldic shape an icon
  sits in), `divider` (diamond ends).
- Action orbs: `orb_rally`, `orb_repair`, `orb_forage`, `orb_off`.

Every 9-slice piece is drawn at 3x on screen, one art pixel to 3 points, as the maps are. The fills use the
app's own warm charcoal (theme `bg.surface1-3`), not the purple night of the scenes.

Fonts with the kit (Google Fonts, SIL Open Font License): Cinzel for titles, Pixelify Sans for numbers,
Nunito for body text. Not yet in the app.

Output: `out/kit_<name>_v1.png`. Run: `python src/make_kit.py`.
