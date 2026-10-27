# The RAXDEG seal: the studio's mark

Owner, 2026-10-27: "I am Raxdeg, me Edgar. Raxdeg is an anagram of my name with an X inside it ... I
like to think of programming as using spells. Coding created the magic spells, calling the functions is
casting them. ... Attached is actually my personal wax seal." Then: "Maybe the seal replaces the shield
for RAXDEG STUDIOS since the shield is really supposed to be for the game. But that IMPACT of the slam
and the slash REALLY makes me excited."

The source is the owner's seal, `_dev/art/reference/raxdeg/raxdeg-wax-seal.png` (2400 px line art).

- `src/make_seal.py`: the seal on the pixel grid (box filter and threshold, so every element of the
  owner's drawing stays), at 96 and 128, in three finishes: gold (engraved), arcane (azure spell circle
  with a teal glow) and wax (a ruby wax disc, the design pressed in). Also the runic face drawn from the
  seal: one-pixel angular letters, dots in the A and O, V for U, an interpunct: RAXDEG·STVDIOS.
- `src/make_seal_intro.py`: the studio's startup splash per finish. The seal flies in unlit, slams down
  in a ring of dust, the spell ignites from the center knot outward, then a slash carves the name.
  About 4 seconds. Output: `seal_intro_<finish>_stripN.png`, `_timing.json`, `seal_card_<finish>.png`,
  `preview/seal_intro_<finish>.gif`.

The wax finish uses the ruby ramp. Red in the game is for HP, damage and danger; this is the studio's
mark, shown before the game, so it is offered as an option for the owner to rule on.
