# Batch 5: effects

Combat and repair effects as short strips, drawn in code (`src/make_fx.py`). Effects are light, not
objects: glow colors, no ink outline, hard alpha. The wall impact and the breach use the gate's own
stone and pale steel dust. The hit spark is already official (test run) and is not redrawn.

| File | Frame | Frames, fps | Notes |
| --- | --- | --- | --- |
| fx_slash-plain, -gold, -ember | 24x24 | 4, 12 | three claw marks; plain for claw tiers 1-4, gold from Serrated, ember from Ember |
| fx_crit | 24x24 | 4, 12 | eight-ray star bursting into a ring |
| fx_ally-hit | 16x16 | 3, 12 | steel-blue X, kept apart from the spark's plus |
| fx_ember | 4x4 | 3, 8 | flicker, loops; the game moves it |
| fx_wall-impact | 20x16 | 4, 12 | anchor bottom center on the wall top |
| fx_repair | 12x12 | 4, 8 | warm twinkles, loops |
| fx_breach | 130x60 | 6, 8 | the gate box; frame 0 is the failing gate, the last is `map_gate_breached` exactly |

Dust is drawn as merged clouds (a light top edge, a shaded underside), never scattered pixels.
`build_board.py` writes `preview/scene_*.gif` (each effect over the Warfront, mobs at double size) and
`board.html`.
