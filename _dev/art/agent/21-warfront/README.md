# Batch 4: the Warfront (2026-10-26)

Build: `python src/make_warfront.py`, then `python build_board.py` (board.html).

| File | What it is |
| --- | --- |
| `out/map_warfront_base.png` | the painted backdrop with the gate and wall taken out; the road and ground carried down to the bottom (the last two painted rows, alternated so the dither stays unbroken, stretched about the road's center so it keeps widening; fresh pebbles scattered) |
| `out/map_gate_{sound,cracking,failing,breached}.png` | the wall and gatehouse, 130 x 60, placed at y 222 (`out/map_gate.json`) |
| `out/map_torch_strip3.png` | the gate torch, 3 frames, 6 fps, glow colors; two of them (positions in `map_gate.json`) |
| `out/mon_<monster>_hit.png`, `_hurt.png` | goblin, kobold, crawler, ashen-orc, minotaur (future), raider |
| `out/mon_raider_idle.png` | the food raid's bandit: dark hood and cloak, a cloth mask, a stolen sack, a short blade |

The Warfront is always night, so the gate is drawn in the backdrop's night values (the muted
purple stone: night1-3) rather than the lit look; the backdrop keeps its own painted colors.

Hit and hurt move the idle's own pixels (the silhouette, size and palette stay the idle's):
- Hit: the upper body snaps back a pixel (the waist row stretches to follow), the eyes shut.
- Hurt: the upper body sags two rows into a hunch, the eyes half-lidded, a few bruises in the
  monster's own darker tone, and the weapon broken (goblin dagger, kobold spear, orc axe chipped,
  raider blade). No gore. A last pass inks any gap the move opened.
