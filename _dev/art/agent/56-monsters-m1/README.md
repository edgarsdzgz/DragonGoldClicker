# Batch 56: monsters M1, the pilot (2026-10-29)

The Kamaitachi (Japanese sickle weasel), regular monster of Mistral Peaks. Drawn as fill grids (`src/m1.py`)
and built by `44-bestiary/src/kit.py`, so it matches the locked bestiary. Its walk is its own two frames
(swirl and tail alternate), as in `48-bestiary-fliers`.

Build: `python -I src/make_bestiary.py`, then `python -I build_board.py` (board.html).

- `out/mob_kamaitachi[-strong|-stronger]_{idle,hit,hurt}.png`, `_walk_strip2.png`, `_death_strip4.png`
- The build stops if a crack cell is off the body (checked on both walk frames).

## The rest of M1 (2026-10-29)

Aitvaras (flier), Gargoyle (flier) and Wild Hunt Rider (ground rider), all in `src/m1.py`. Fliers get
`out/mob_<id>_shadow.png` and a two-frame wingbeat walk; the rider walks with the kit's bob and has no shadow.
Board: `python -I build_board_m1_rest.py` -> `board_m1_rest.html`.

Signature colors: Kamaitachi teal; Aitvaras night-black with orange and gold flame; Gargoyle ash gray stone with
bone horns; Wild Hunt Rider shadow-purple cloak, bone antlers, night-black horse.

**Credit:** the Gargoyle is a monster from the D&D System Reference Document 5.1/5.2 (CC BY 4.0). The game's
credits need the SRD attribution.
