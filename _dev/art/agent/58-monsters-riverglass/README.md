# Batch 58: Riverglass Delta monsters, round 1 (2026-10-29)

Kappa, Kongamato (flier), Nixie, Jenny Greenteeth, Ahuizotl, Berberoka (mini-boss) and the Lernaean Hydra (boss),
drawn as fill grids in `src/riverglass.py` and built by `44-bestiary/src/kit.py` like batches 56 and 57. Research and
sensitivity notes are in `BRIEF.md`. The Kongamato has a two-frame wingbeat and `out/mob_kongamato_shadow.png`.

Build: `python -I src/make_bestiary.py`, then `python -I build_board.py` (board.html). The build stops if a crack
cell is off the body (checked on both frames).

Signature colors: Kappa teal with a brown shell and a bright blue dish; Kongamato rust `clay`; Nixie pale `steel3`
with `sea` hair and a gold harp; Jenny bright `emerald` with dark `green1` hair; Ahuizotl `shadow` purple-black with
a pale `steel4` tail hand; Berberoka `wood2` mud with `sea` flood water; Hydra `green2` with a pale `steel3`
middle head. No red except the hit flash; no magenta except the cracks.

One redraw pass was made after the first contact sheet (Kappa read as a penguin, Nixie as a robot with a shield,
Ahuizotl's tail hand as a cleaver, the Hydra's middle head as a fork).

## Second sources

| Monster | Source | Date read | What it confirms |
|---|---|---|---|
| Kappa | https://www.worldhistory.org/kappa/ | 2026-10-29 | Dish (sara) filled with water, shell, beak, green or yellow, lures and drowns, takes the shirikodama, a spilled dish leaves it helpless. (yokai.jp refused with 403; skipped.) |
| Kongamato | https://abookofcreatures.com/category/jungle-and-rainforest/page/3/ | 2026-10-29 | Wingspan 4 to 7 ft, mostly red, beak with sharp teeth, upends canoes. Weak: a popular site; treat as unverified. |
| Nixie | none needed | | Brief lists two sources (Dash, Gutenberg). |
| Jenny Greenteeth | none needed | | Brief lists three sources. |
| Ahuizotl | https://godsandmonsters.info/ahuizotl/ | 2026-10-29 | Dog-sized, black rubbery fur, monkey-like hands, a hand on the tail tip, baby-cry lure, eyes/nails/teeth taken; cites the Florentine Codex, Hernandez and Molina. Secondary but it names its sources. |
| Berberoka | https://filipiknow.net/top-10-terrifying-philippine-mythical-creatures/ | 2026-10-29 | Drains the water until the fish show, drowns the fishermen with it; Abra, Apayao, Ilocos Norte. No body description: the design is mine. Weak: a popular site; treat as unverified. |
| Lernaean Hydra | https://atlas.perseus.tufts.edu/library/passage/urn:cts:greekLit:tlg0548.tlg001.perseus-eng2:2.5.2-2.5.5 | 2026-10-29 | Apollodorus 2.5.2: nine heads, eight mortal, the middle immortal; two grow for each one smashed; Iolaus burns the stumps. |

Kongamato and Berberoka are marked unverified on the board. The Hydra is an SRD 5.1 monster: it needs the SRD credit.
