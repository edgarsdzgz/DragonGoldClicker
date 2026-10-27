# To do

What I still want made for Draconia Chronicles, as of 2026-10-27. The art library is
`_dev/art/official/` (`OFFICIAL.md` lists everything locked).

## Art

Locked 2026-10-27 and imported, not yet shown in the game: the city light levels (night, dusk), the
story pictures (prologue, the Breach), the building interior headers, and the busts of Varn, Ashara,
Thornwick, Sera and the Hollow Knight.

- [ ] **Sigils for the five new busts.** Every named character has a heraldic sigil on their dialog name
      tag (`official/cast/cast_sigil-*`); Varn, Ashara, Thornwick, Sera and the Hollow Knight have none.
- [ ] **Two study icons:** Cartography and Keen Scouts (Wilds) still fall back to glyphs; the other 13
      studies have `icon_res_*`.
- [ ] **Six interface icons still drawn as glyphs:** warning (confirm dialog), wallet (Shop, Settings),
      business (Shop), hand-left (Settings, wanderer dialog), speedometer and phone-portrait (Settings).
- [ ] **The Minotaur boss** (when a boss exists in the code): only its idle is drawn; it needs walk, hit,
      hurt, death and the Unmaking tiers like the other monsters.
- [ ] **Second expressions for the busts** (optional, when scenes call for them): angry, grieving.
- [ ] **More story illustrations** (optional): the other 17 scenes use busts today.
- [ ] **The dragon, last**, from the commissioned artist: portrait, perch, victory pose, head token, idle
      loop, fireball attack, the fireball and critical fireball, upgrade looks (claws, fangs, armor, horns).

## Not art

- [x] **Sound effects, batch 1** (locked 2026-10-27, `official/sound/`, imported to `assets/sound/`): the
      studio splash beats, a monster's death, the wall struck, the Breach, a building finished, the
      heartstone. Not wired to anything yet.
- [ ] **Sound effects, batch 2** (list locked by the owner 2026-10-27; no monster yips, grunts or roars):
      - Warfront: critical hit, ember-claw whoosh, the next monster's footfalls, the gate cracking,
        the Unmaking rising, the rally horn, mending the wall.
      - City: construction starting, the city brightening, research done, an expedition leaving, an
        expedition returning, a find (chest), a knock at the gate (wanderers, refugees).
      - Forage: food running low, a food raid, the granary full.
      - Story: a scene opening (parchment), a fanfare (quest done, Renown), welcome back, a sting for
        Sera (shield bash), Thornwick (spark) and the Hollow Knight (armor, hollow echo).
      - Ambient loops: Warfront torches, the forge fire, night wind, far-off horde drums.
- [x] **App name.** `app.json` now reads "Draconia Chronicles" (46a806e). The phone shows it after the next
      build and install.
