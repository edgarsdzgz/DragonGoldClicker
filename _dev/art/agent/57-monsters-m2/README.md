# Batch 57: monsters M2, Mistral Peaks' elites and boss (2026-10-29)

Impundulu (flier elite), Omukade (elite) and the Tempest Lord of the Peaks (boss, level 30), drawn as fill grids
in `src/m2.py` and built by `44-bestiary/src/kit.py` like batch 56. The Impundulu has a two-frame wingbeat and
`out/mob_impundulu_shadow.png`; the Omukade's walk ripples its legs; the Tempest Lord's walk churns the cloud
and whips the robes (no shadow).

Build: `python -I src/make_bestiary.py`, then `python -I build_board.py` (board.html).

Signature colors (ramps): Impundulu black `night1`/`night3` wings with a white `steel5` breast and pale yellow
`gold6` lightning; Omukade dark bronze `gold1` shell with `wood2` bands; Tempest Lord `night1`/`night2` robes over a
`steel1`/`steel3` storm funnel, `gold6` lightning crown.

- `out/mob_<id>[-strong|-stronger]_{idle,hit,hurt}.png`, `_walk_strip2.png`, `_death_strip4.png`
- The build stops if a crack cell is off the body (checked on both frames).
