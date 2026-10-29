# Batch 59: Elderbough Crown, round 1 (2026-10-29)

Seven monsters drawn as fill grids in `src/elderbough.py` and built by `44-bestiary/src/kit.py` like batch 57:
Amomongo, Nogitsune, Swarm of Spiders, Kalanoro (regulars), Leshy, Sasabonsam (elites), Humbaba (boss, level 50).
No fliers, so no shadows.

Build: `python -I src/make_bestiary.py`, then `python -I build_board.py` (board.html). The build stops if a crack
cell is off the body (checked on both frames).

Files: `out/mob_<id>[-strong|-stronger]_{idle,hit,hurt}.png`, `_walk_strip2.png`, `_death_strip4.png`.

## Signature colors
Amomongo white `steel4` fur, dark `ash2` face; Nogitsune `clay3` fox with `parch3` white and `teal4` fox-fire;
Swarm `wood4` bodies; Kalanoro `emerald2` moss fur; Leshy `wood3` bark with `green2` leaf hair; Sasabonsam `azure1`
body, `steel4` hair, `steel5` iron teeth; Humbaba `sea2` skin, `wood2` mane, `gold3` bronze, `gold4` rays.
Gold eyes everywhere (the brief's red-eyed Kalanoro and bloodshot Sasabonsam eyes are gold: red is the hit flash).

## Second sources (read 2026-10-29)
| Monster | Source | Confirms |
|---|---|---|
| Amomongo | https://www.sunstar.com.ph/cebu/feature/is-amomongo-the-bigfoot-version-of-the-philippines | Hairy white ape, long sharp nails, attacked two men and livestock in La Castellana; the mayor called it a wild animal, not an aswang. Does not mention caves. |
| Nogitsune | (brief already lists two: Wikipedia Kitsune and https://sites.pitt.edu/~dash/japan.html) | Wild fox trickster. Only the wild form is drawn; no Inari or shrine imagery. |
| Swarm of Spiders | D&D SRD 5.1 (CC BY 4.0, https://api.open5e.com/v1/monsters/swarm-of-spiders/) | SRD monster, no folklore source needed. The game's credits need the SRD credit. |
| Kalanoro | https://www.pbs.org/wgbh/nova/madagascar/surviving/legends2.html | Hairy, small, backward-pointing feet, eyes glowing like coals, deep forest. |
| Leshy | (brief already lists three) | Forest warden, shape-shifter. |
| Sasabonsam | https://www.vampires.com/asanbosam-and-sasabonsam/ | WEAK (a 2010 blog post, no cited source): Ashanti tree dweller, iron teeth in some accounts, winged and bat-like in this telling. The dangling legs and hooked feet are from the brief's Wikipedia source only. Treat as lightly verified. |
| Humbaba | https://worldhistory.org/article/2132/gilgamesh-and-huwawa (Britannica gave a 403 and was skipped) | Appointed guardian of the Cedar Forest, dragon's maw, lion's grimace, seven terrors, looks of death. |

## Notes
- Sensitivity binding: Nogitsune is the wild fox only; Kalanoro the small forest imp only; Sasabonsam a generic forest
  ambusher; Humbaba the creature, never a god.
- The Nogitsune is the least sure read (cat-like at 1x); the Kalanoro's backward feet are hard to see at 20 px.
- The Swarm is brown, 6 small bodies, so it cannot be mistaken for the purple crowned Spider Queen.

## v2 (coordinator review)
The Nogitsune (tails stood up like arms) and the Swarm of Spiders (read as crumbs) were redrawn; the other five are
unchanged. v1 files are in `out_v1/`, the v1 board in `board_v1.html`, the v1 functions in `src/elderbough.py` as
`nogitsune_v1` and `swarm_v1`. v2 Nogitsune: four wide tails fanned behind and above the body from the rump, tipped
with teal fire; v2 Swarm: five gray-brown round-bodied spiders with pale bent legs and gold eyes, spread out, shifting
position in the walk. The Nogitsune fan still reads somewhat like wings at 1x.
