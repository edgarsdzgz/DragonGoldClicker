# Batch 62: monsters, Tideglass Coast (2026-10-29)

Blue Man of the Minch, Funayurei, Archelon, Stymphalian Birds, Fomorian Raider, Sirens, Nuckelavee and the Kraken,
drawn as fill grids in `src/tideglass.py` and built by `44-bestiary/src/kit.py` like batch 57. The Stymphalian Bird and
the Siren are fliers (two-frame wingbeat, `out/mob_<id>_shadow.png`); the others' walks are their own two frames. The
Kraken rises up a flooded road (owner ruling), tentacles reaching left toward the gate.

Build: `python -I src/make_bestiary.py`, then `python -I build_board.py` (board.html). The build stops if a crack cell
is off the body in either frame.

Signature colors: Blue Man azure; Funayurei cream robe with teal wisps; Archelon green shell with sandy leather;
Stymphalian bronze (`gold1`/`gold2`/`clay3`) with steel; Fomorian slate `steel2` with kelp `green1` and a rusted
anchor; Siren emerald with a pale face; Nuckelavee raw `clay2` with `parch3` sinew; Kraken `sea1`/`sea2` with a `gold5`
eye over `azure1` water.

Credits: the Archelon is a D&D SRD 5.2 monster (CC BY 4.0); the game's credits need the SRD credit.

## Second sources

| Monster | Source URL | Date read | What it confirms |
|---|---|---|---|
| Blue Men | (brief) Wikipedia and https://www.gutenberg.org/cache/epub/61730/pg61730.txt | 2026-10-29 | two sources already |
| Funayurei | none: https://yokai.jp/en/yokai/funayurei returned 403; https://thejapanbox.com/blogs/japanese-mythology/funayurei returned 429 | 2026-10-29 | unverified (search snippets only: ghosts of the drowned ask for a ladle, a bottomless one defeats them) |
| Archelon | SRD 5.2 itself | 2026-10-29 | none needed |
| Stymphalian Birds | https://cts.perseids.org/read/greekLit/tlg0525/tlg001/perseus-eng2/8.22.1-8.22.9 (Pausanias 8.22) | 2026-10-29 | crane-sized birds that breed by the Stymphalian water, beaks that pierce bronze, driven off with rattles or shot; the bronze-feather detail is later (Hyginus) |
| Fomorian Raider | https://encyclopedia.com/environment/encyclopedias-almanacs-transcripts-and-maps/fomhoire | 2026-10-29 | misshapen or half-animal, or one leg, one arm, one eye; "undersea people"; tribute; later sea raiders and giants |
| Sirens | https://www.audubon.org/magazine/sirens-of-greek-myth-were-bird-women-not-mermaids (Britannica refused, 403) | 2026-10-29 | bird-women with human faces, wings and talons; the song lured sailors to die on the island |
| Nuckelavee | https://folklorescotland.com/?p=3192 | 2026-10-29 | skinless, horse body with a rider growing from it, huge head, one fiery eye, long arms; blights crops and stock; avoids rain and fresh water |
| Kraken | https://snl.no/kraken | 2026-10-29 | island-like back, whirlpool when it sinks, drags ships down, fish drawn to it; earliest account 13th century |

Funayurei is drawn anyway and marked unverified on the board.

## Notes
- The Stymphalian "bronze feathers shot like arrows" is Hyginus, not Pausanias; the arrowhead feathers are that tradition.
- First pass misread two: the Fomorian as a cow and the Nuckelavee as a front-on bear. Both were redrawn once (upright
  goat-headed giant with an anchor; a side-on centaur shape).
