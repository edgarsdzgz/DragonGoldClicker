# Cast and Peoples of Draconia

Canon for who lives in Draconia and how they are drawn. Decided by the owner on 2026-10-26.
Story text lives in `src/data/story/lines.ts`; older lore lives in
`_dev/planning/DraconiaChronicles/` and the original compendium
(`C:\Users\ediaz\Coding_Projects\dragonIdler\docs\Draconia_Lore_Compendium.md`).

## The world

- **Every fantasy people exists.** Humans, elves, dwarves, halflings, orcs, beastfolk and any
  others can appear, and any of them may have lived in Draconia before the siege.
- **Draconia is the birthplace of dragonkind**, built on the Cradle Ley where the First Flame
  touched the world. It is a mythic home, not an imperial capital.
- **It is the last safe haven.** Refugees from across the realm have gathered behind its walls,
  and more keep arriving ("People are coming").
- **The Unmaking began with a failed human ritual.** Human refugees sheltering in the dragons'
  city is a tension the story can use.

## Why dragons are few

- The Dragon Council sealed itself inside the Barrier Spire.
- When the Rift opened at the Academy of Draconia, only the apprentices survived.
- So the dragons left are the very old and the very young. **The player is the one dragon of
  fighting age**: "the lone dragon standing upon its gate."

## The cast

Status: **canon** = already in the game or settled by the owner; **proposed** = suggested and
awaiting a decision; **open** = not decided yet.

| Character | People | Role | Status |
|---|---|---|---|
| The player | Dragon, young adult | Steward of Draconia, defender of the gate ("my lord") | canon |
| Elder Pyreth | Elder dragon, too old to fight | Advisor, narrator, keeper of the ledgers | canon |
| Kael Ironwright | Human refugee | Smith; her father forged for the Dragon Council | canon |
| Lirae the Ink-Wing | Small apprentice dragon, an Academy survivor | Archivist, keeper of the Journal's lore | canon |
| Varn, Dragon Recruit | Young dragon, barely fledged; a first-year at the Academy who knew Lirae | Chapter 9: a small dragon on the wall who strikes on his own | canon |
| Ashara, Elder Wyrm | Ancient dragon, the eldest; slept beneath the mountain | Chapter 12: her strength behind yours (strikes hit harder) | canon |
| Captain Rodain | Orc veteran: gray-green skin, tusks, a scar, steel pauldrons, red captain's sash | Leads the company of fifty | canon |
| Scout Mirael | Wood elf: long ears, copper braid, teal ranger's cloak, brass compass | Scouts, wanderers, expeditions | canon |
| Thornwick, the Exiled Mage | Human with gnomish ears and dark skin (owner, 2026-10-27; a full gnome was too light and too happy); sent away from the eastern towers after the third fire | Chapter 11: an expedition brings him home; unlocks the Wizard's Tower | canon |
| Sera the Shieldmaiden | Bearfolk (owner asked for a people no bust uses yet, 2026-10-27); her clan held the high pass in the north | Chapter 10: a shield wall (monsters strike the wall for less) | canon |
| The Hollow Knight | Unknown, by design; it has no name | Chapter 13: holds the gate while you are away; no one asks what is inside the armor | canon |

**Chapters 9 to 13** (approved 2026-10-27, "Lock them in"): when each new character arrives, what they
bring and every line, with its face, are in `_dev/planning/new-cast-scenes/build_board.py` (its board is
`board.html` beside it). Their pictures and small figures are batch `_dev/art/agent/52-new-cast-art`. None of
it is in the game yet.

## How each is drawn

**Small sprites** (villagers, fighters, gatherers, wayfinders, wanderers):
- Human or humanoid silhouettes, around 11x16 pixels before scaling.
- Show different peoples with cheap details: skin and hair palettes, a beard, pointed ears, small
  horns, a tail.
- **Never let a townsperson read as an enemy.** The kobold is a small reptile, so small
  townsfolk avoid lizard-like silhouettes and the enemies' colors.

**Busts and named characters:**
- Full race traits and a defined personality.
- Each named character gets its own silhouette (horns, frills, ears, armor), a color family,
  and a heraldic sigil used on their dialogue name tag.
- Dragons provide the most shape and color variety. Example: Pyreth in ember-red and
  bone-white with long white whisker-barbels.

| Character | Color family | Sigil |
|---|---|---|
| Elder Pyreth | Ember red, bone white, plum mantle | The ember (gold diamond) |
| Lirae | Ink blue, pale blue, spectacle gold | The quill |
| Kael | Bandana red, leather brown, steel | The anvil |
| Rodain | Orc green, captain's red, steel | Crossed spears |
| Mirael | Ranger teal, copper, brass | The compass star |

Mockups of all five busts and the townsfolk variants live on the Draconia UI Mockups design
canvas (the "Cast" artboard).

**Scale is part of the drama:** tiny townsfolk beside huge dragons. Keep that contrast in
scenes such as the Warfront, where little fighters stand on the wall below the player's wings.
