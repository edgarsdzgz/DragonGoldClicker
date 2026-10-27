# Mobs marked by the Unmaking: three wave tiers

Owner, 2026-10-27: "our monsters are affected by the unmaking, so they all need the purple cracks
throughout their body. Regardless of the color of their skin." Then: "All monsters, even humans need
to have cracks", and "weak > strong > stronger, for deeper waves. We can reuse a lot of monsters
that way."

| Tier | Files | Look |
| --- | --- | --- |
| weak | `22-mobs/out/mob_<id>_<state>` (already official) | no cracks |
| strong | `out/strong/mob_<id>-strong_<state>` | dark cracks: magenta2 lines, a magenta3 heart |
| stronger | `out/stronger/mob_<id>-stronger_<state>` | glowing cracks: magenta3 lines, a magenta4 heart |

`src/make_unmade.py` lays the cracks on each 22-mobs idle (head, body and limbs, over clothes on the
raider) and rebuilds hit, hurt and the walk strip from it, so the cracks move with the body.
