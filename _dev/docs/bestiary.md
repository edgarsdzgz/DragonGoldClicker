# Bestiary

Every monster that marches on Draconia, the ones in the game and the ones I may add. This is about
variety: who they are and how they look. Numbers live in `src/types/monsterRoster.ts`. The old
Draconia Chronicles game had abilities, elements and factions; none of that carries over here.

Started 2026-10-27. The candidates come from the old game's bestiary
(`C:\Users\ediaz\Coding_Projects\dragonIdler\docs\archive\v2.3-extended\26_Content_Packs_Clans_Bestiary.md`),
its enemy families (`docs/archive/v2.3/tome/05_Combat_Systems_Enemies_Bosses.md`) and its large enemies
(`docs/v2.4/tome/05_Combat_System.md`).

## How every monster is drawn

- **The simple style:** front-on, flat colors, an ink outline, one shape per part. Batch `22-mobs`
  set the look.
- **Marked as enemies:** glowing gold eyes, a signature color no townsperson wears, and a weapon or a
  menacing shape. A human enemy must never read as a villager.
- **The full set for each:** idle, hit (the red flash), hurt (hunched, weapon broken), walk, and death.
  Each also comes in the Unmaking's three tiers: weak, strong (dark cracks) and stronger (glowing
  cracks).
- **Colors:** red is only for damage, and magenta is only for the Unmaking's cracks.
- **The battlefield is a road:** everything walks up it to the gate. Fliers and riders need a new
  kind of battlefield, so they wait.

## In the game

| Monster | Looks | Status |
| --- | --- | --- |
| Kobold | Small and scaly, swept-back horns, a short spear | In the game |
| Goblin | Wide head, long ears, a toothy grin, a dagger | In the game |
| Shadow Crawler | A round shadow-purple spider, four glowing eyes | In the game |
| Orc | Big and ash-gray, tusks, steel shoulders, a heavy axe | In the game |
| Raider | A hooded human bandit with a stolen sack (food raids only) | In the game |
| Minotaur | A bull's head with sweeping horns, a nose ring, a double axe | Drawn and locked; no wave sends it yet |

## Candidates: the early horde

Small things and beasts, so the first waves are not only kobolds and goblins.

| Monster | Looks | From the old bestiary |
| --- | --- | --- |
| Giant Rat | A hunched rat as big as a kobold, bald tail, yellow teeth | Rat Swarms |
| Goblin Scout | A goblin in a ragged hood, lighter and leaner, a sling | Goblin Scouts |
| Goblin Archer | A goblin with a short bow taller than it is | Archer Goblins |
| Banner-Runner | A thin raider carrying a tattered war banner on a pole | The Wind-Taken Nomads' first enemy |

## Candidates: the middle horde

Bigger and armored, so the horde visibly hardens.

| Monster | Looks | From the old bestiary |
| --- | --- | --- |
| Shield Bearer | An orc behind a tall, scarred tower shield | Shield Bearers |
| Beetle Guard | An upright beetle in a shell of dark plates, pincer arms | Beetle Guards |
| Chitin Warrior | A taller insect soldier with a spear, a pale belly | Chitin Warriors |
| Nomad Warrior | A wind-burned raider in layered furs, a curved blade, a face wrap | Wind-Taken Nomads |

## Candidates: the Unmaking's own

The late horde. These are what the Unmaking makes of the living, so they show the story getting
worse.

| Monster | Looks | From the old bestiary |
| --- | --- | --- |
| Wraith | A ragged gray shroud with no body inside, two gold eyes, trailing wisps | Wraiths |
| Shadow Phantom | A tall flickering silhouette, darker than night, long arms | Shadow Phantoms |
| Ashen Convert | A human gone ash-gray, burned but alive, in a cultist's robe and mask | Flame-Touched Cultists |
| Ember Prophet | A robed cultist holding a burning censer, cinders in its hood | Flame-Touched Cultists |
| Ember Wraith | A small drake made of embers and smoke, what the Unmaking left of one | Flame-Touched Cultists (corrupted lesser drakes) |

The cultists tie into the story directly: the Unmaking began with a failed human ritual, and these are
humans who embraced it. Their masks and ash-gray skin keep them from reading as villagers.

## Candidates: bosses

One big monster at a time, at the head of a wave.

| Boss | Looks | From the old bestiary |
| --- | --- | --- |
| Minotaur | (in the game, locked) | |
| Stone Golem | A hulking figure of stacked rubble, moss in the cracks, glowing seams | Large enemies |
| Giant Elemental | A towering column of flame or storm with a rough body shape | Large enemies |
| Khagan of the Sirocco | A warlord in furs and a horned helm, banners on his back, a great blade | The Wind-Taken Nomads' boss |
| Forge-Master of the Inferno | A cult leader in a melted forge-apron, a hammer that glows | The Flame-Touched Cultists' leader |
| Corrupted Wyvern | A wyvern cracked and darkened by the Unmaking | Large enemies |

The Corrupted Wyvern and the Ember Wraith are dragon-kin. Settled 2026-10-27: the Unmaking can take
dragons. They are drawn clearly monstrous and cracked, so they never read like the player or the friendly
dragons.

## Waiting on a new battlefield

| Monster | Why it waits |
| --- | --- |
| Mantair Corsair | A flying manta-ray raider (the old game built it); needs fliers |
| Storm Rider | Mounted on the wind; needs riders or fliers |
| Windcaller | A wind mage; casts from a distance |

## Drawn

All eighteen candidates above were drawn in batch `44-bestiary` (2026-10-27), with every monster shaded
like the busts (the six in the game redone as v2).

## The second round, in three batches

Started 2026-10-27. Most come from the game's own flavor text, which already names them in battle; the
rest are the old bestiary's leftovers. Split by size, since each size shares its frame and shading.

| Batch | Monsters | Status |
| --- | --- | --- |
| 1. Regulars | War Hound, Skeleton, Spectral Hound, Nomad Scout, Nomad Archer, Cult Apprentice | Locked and in the app (`45-bestiary-regulars`) |
| 2. Elites | Kobold Shaman, Goblin Chieftain, Orc Warchief, Troll, Ogre, Iron Golem, Windcaller | Drawn, on the board (`46-bestiary-elites`) |
| 3. Bosses | Basilisk, Spider Queen, Corrupted Drake, Lich | Next |

Elites sit between a monster and a boss in size (about 16x21) and march with their own kind. Whether the
game gets an elite rank is still my call; they are drawn either way.

Not in any batch yet: the final boss, whose failed ritual began the Unmaking (a story decision first),
and the fliers and riders, which wait on a new battlefield.
