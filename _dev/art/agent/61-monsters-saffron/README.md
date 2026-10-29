# Batch 61: Saffron Dunes monsters, round 1 (2026-10-29)

Serpopard, Nasnas, Mummy, Bungisngis (regulars), Girtablilu, Poludnitsa (elites), Manticore (mini-boss), drawn as
fill grids in `src/saffron.py` and built by `44-bestiary/src/kit.py` like batch 57. The Corrupted Drake is this
Land's boss already. No fliers. Cracks are walked over cells filled in both frames, and the build stops if one is off the body.

Build: `python -I src/make_bestiary.py`, then `python -I build_board.py` (board.html).
Output: `out/mob_<id>[-strong|-stronger]_{idle,hit,hurt}.png`, `_walk_strip2.png`, `_death_strip4.png`.

Signature colors: Serpopard teal (`sea`); Nasnas gray (`ash3`) with a shadow-violet hollow; Mummy pale gray (`steel4`)
with an azure collar; Bungisngis blue (`azure`); Girtablilu green chitin (`emerald`) with gray skin; Poludnitsa white gown,
`green2` grass hair, `night4` skin, mismatched eyes (gold, pale blue); Manticore violet (`shadow`) with a `fire1` mane.

## Second sources

| Monster | Source | Date read | Confirms |
|---|---|---|---|
| Serpopard | https://talesfromthetwolands.org/2025/07/04/two-dog-palette/ | 2026-10-29 | A mythical animal with a very long serpentine neck (Two Dog Palette). Narmer and "chaos beyond the borders" stay single-source (Wikipedia). |
| Nasnas | https://mythicalencyclopedia.com/nasnas/ (mythlok.com refused: 403) | 2026-10-29 | Half a head, half a body, one arm, one leg, hops; quotes Edward Lane. A secondary page, not Lane's text itself. |
| Mummy | SRD 5.1/5.2 (open5e) | n/a | D&D SRD, no folklore source needed. Credit required (CC BY 4.0). |
| Bungisngis | https://pantheon.org/articles/b/bungisngis.html | 2026-10-29 | One eye in the forehead, always laughing, throws a carabao, easily outwitted. It does not mention tusks: tusks are Wikipedia-only. |
| Girtablilu | https://godsandmonsters.info/girtablilu/ | 2026-10-29 | Made by Tiamat in Enuma Elish; scorpion-men guard the gate of Mashu with a deadly gaze. This page gives bird hindquarters; the brief's scorpion body was kept. |
| Poludnitsa | (two in the brief) | 2026-10-29 | Already has Wikipedia (Polevik) and the sacred-texts Serbian chapter. |
| Manticore | https://theoi.com/Thaumasios/Mantikhoras.html | 2026-10-29 | Human face, lion body, three rows of teeth per jaw, scorpion tail with a sting, man-eater. SRD status not checked. |

No monster ended "unverified" outright. Sensitivity notes kept: the Nasnas has no sectarian dress; the Girtablilu is only the creature.
