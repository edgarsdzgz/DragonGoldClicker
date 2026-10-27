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

## The seal builds itself (owner: "break the seal into small parts ... the main circles (plates) land with a
slam. Then, the details get etched on bits at a time ... the blue arcana while it's being built and the gold
as a final SMASH finish")

`src/make_seal_build.py` cuts the source seal into its parts at full size by its own geometry (outer ring,
inner circle, the three medallion rings and their letters, the triangle's lines with their dots and ticks,
the runes, the center knot, the small symbols); each pixel at 128 goes to the part covering most of it, so
the finished frame is exactly the gold seal. The body slams in, the medallions land one by one, the details
etch in arcane blue (new cuts flash white), the seal smashes to gold with a shockwave, and the slash carves
the name. About 6.7 seconds. Output: `seal_build_stripN.png`, `seal_build_timing.json`,
`seal_build_card.png`, `preview/seal_build.gif`.

The name, v2 (owner: "I want RAXDEG STUDIOS to be bigger, please. Maybe even across the top of the seal,
over it"): `src/runic_big.py` draws a big runic face (eleven rows, two-pixel strokes, drawn at size, never
scaled) and sets RAXDEG·STVDIOS upright on an arc over the seal's top; the slash follows the arc. Kept as
`*_v2`, with `out/seal_card_straight_v2.png` (the big name straight across above the seal).

The name, v3 (owner: "I want the text to appear straight through the seal. Like a strikethrough. The text
will probably need a black outline"): the big name runs straight through the middle of the seal with a
two-pixel ink outline (all eight neighbors; one pixel got lost in the seal's lines), and the slash strikes
through the seal at the letters' middle, carving the name behind it. The frame is the seal plus its margin,
172 x 172. Kept as `*_v3`. The first build, with the small name below the seal, is kept as `*_v1`.

The name, v4 (owner: "Can we make the letters larger ... move the effect of turning the blue to gold
until after the letters slice over the top ... seal, populate seal, letters slice in (in gold), seal slams
into gold", and "let's not lose all the small details of the letters, like the T's wings pointing down"):
the seal builds and etches in blue, the slash carves the name in gold across the blue seal, then the SMASH
turns the seal gold under it. The name is in a larger face (`HUGE_RUNIC` in `src/runic_big.py`: fifteen
rows, two-pixel strokes, letter gap 3), drawn from the five-by-seven face's own shapes, and runs past the
ring on both sides. Frame 180 x 172, 69 frames, about 7 seconds.
