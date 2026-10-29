# Batch 60: Gloamfen Mire, round 1 (2026-10-29)

Jiangshi, Adze (swarm flier), Will-o'-Wisp (flier), Kikimora, Draugr (elite), Empousa (elite) and the Dullahan
(mini-boss, a rider), drawn as fill grids in `src/gloamfen.py` and built by `44-bestiary/src/kit.py` like batch 57.
The Adze and the Will-o'-Wisp have a two-frame wingbeat/flicker walk and `out/mob_<id>_shadow.png`; the rest walk
with the kit's bob. The Lich is this Land's boss and is not redrawn.

Build: `python -I src/make_bestiary.py`, then `python -I build_board.py` (board.html). The build stops if a crack
cell is off the body (checked on every frame).

- `out/mob_<id>[-strong|-stronger]_{idle,hit,hurt}.png`, `_walk_strip2.png`, `_death_strip4.png`

Signature colors: Jiangshi dark jade `emerald1`/`emerald2` robe, mint `emerald4` face; Adze `fire2` glow on `night1`
bodies; Will-o'-Wisp `teal2`-`teal4`; Kikimora `green2` moss hair, `steel3` skin; Draugr `night3` death-blue with
rust `gold1` helm; Empousa `fire1`/`fire2` flame hair, bronze `gold3` and gray `ash2` legs; Dullahan `night1` black
horse, `steel1` cloak, `parch3` head.

## Second sources

| Monster | Source | Date read | What it confirms |
|---|---|---|---|
| Jiangshi | https://www.theworldofchinese.com/2014/05/the-real-walking-dead-one | 2026-10-29 | Stiff hopping corpse, arms out, yellow fu paper on the forehead, tall hat; it does not confirm peach wood |
| Adze | https://godsandmonsters.info/adze/ | 2026-10-29 | Ewe, Volta Region Ghana and south Togo; enters sleeping houses through small gaps. It says the firefly form comes from Bunson's 1993 encyclopedia, not Ewe testimony, so the firefly is **unverified** as folklore. |
| Will-o'-Wisp | SRD 5.2 (api.open5e.com) | 2026-10-29 | SRD monster, no folklore source needed; credit required (CC BY 4.0) |
| Kikimora | Wikipedia + sacred-texts srp06/srp07 (already in the brief) | 2026-10-29 | Two independent reads in the brief |
| Draugr | Grettir's Saga, Gutenberg 347 (in the brief) | 2026-10-29 | Glam episode |
| Empousa | https://historycooperative.org/the-empusa/ | 2026-10-29 | Bronze and donkey (or dung) legs, flame around the head, Hekate, shapeshifting, flees insults (Aristophanes' Frogs, Philostratus) |
| Dullahan | https://sites.nd.edu/rbsc/?p=5678 | 2026-10-29 | Headless rider, head under the arm, from Croker's Fairy Legends; no black horse stated there. The Irish Folklore Commission archive has no record, so the popular form is literary. |

Sensitivity: the Adze is the firefly swarm only, never the possessed human.
