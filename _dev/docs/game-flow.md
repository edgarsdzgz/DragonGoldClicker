# Dragon Gold - Game Flow & Progression

## Overview

Draconia is under siege. Monsters assault the city walls. The player slays monsters to earn **inspiration**, rallies villagers into fighters, repairs the city, and progressively builds up Draconia's defenses and infrastructure.

---

## Currency

- **Inspiration** (shown as **renown**) -- earned only when a monster dies, whether the player's taps or the fighters' swings killed it
- **Food** -- gathered by foraging (click) and from gatherers (auto)

---

## Starting State

- 25 idle villagers
- 200 food
- 0 inspiration
- 1 click power
- City HP: 100/100

---

## Tabs & Unlock Flow

| Tab | Unlock Condition | Purpose |
|-----|-----------------|---------|
| Warfront | Always unlocked | Slay monsters, rally fighters, direct repairers |
| Foraging | Direct 3 Repairers | Forage food, train gatherers |
| Draconia | Train 3 Gatherers | Build/upgrade city buildings |
| Settings | Always unlocked | Audio, stats, reset |

Locked tabs are always visible with a lock icon. Tapping shows the unlock requirement.

---

## Unit Progression

### Warfront Units
| Unit | Source | Cost | Effect | Food/check |
|------|--------|------|--------|------------|
| Fighter | Rally (Warfront tab) | 1.00 renown (scaling ~n^1.4) | 0.25 damage every 6s to the monster at the gate (1/32 of a held strike) | 2 |
| Repairer | Direct (Warfront tab, unlocks at 3 fighters) | TBD | Heals city HP | 1.5 (75% of fighter) |

### Soldiers (the Garrison, chapter 5): trained fighters
| Rank | Made from | First price | Damage per volley | Eats per meal | Garrison level |
|------|-----------|-------------|-------------------|---------------|----------------|
| Conscript | a fighter | 10 renown (^1.15 after) | 0.5 | 4 | 1 |
| Footman | a conscript | 30 renown | 1 | 6 | 3 |
| Knight | a footman | 80 renown | 2 | 10 | 5 |

Fighters and soldiers are one army: they strike together every 6s and earn renown only from
kills (nothing earns per second). The Garrison (40/100/200/400/800 renown) holds 4/8/12/16/20
soldiers; fighters need no room. Its screen shows how long the army takes to kill the toughest
monster the horde sends now, against that monster's 5s strike on the wall.

### Foraging Units
| Unit | Source | Cost | Effect | Food/check |
|------|--------|------|--------|------------|
| Gatherer | Train (Forage tab, no building needed) | TBD | +0.2 food/sec | 0.5 |
| Trapper | Train (requires Lodge Lv3) | TBD | +0.6 food/sec | 0.3 |
| Ranger | Train (requires Lodge Lv5) | TBD | +1.5 food/sec | 0.1 |

### Explorer Units
| Unit | Source | Effect |
|------|--------|--------|
| Explorer | Trained from a villager at the Outpost (10 renown, ^1.15) | Goes on expeditions (40 food, 5 min) that bring home 0-3 people; eats 2 food a meal |

---

## Siege Mechanics (the wall, core-tap layer 6)

- The wall has 100 HP. The monster at the gate strikes it every 5 seconds while it stands
  (kobold 1, goblin 1.5, shadow crawler 2, orc 4; raiders never strike). A monster killed within
  5 seconds of arriving never touches the wall. While the app is closed the wall follows the army
  readout (`types/timeAway.ts`): it wears only if the army cannot hold, never below 50
- **Repair rate** = 0.5 HP/sec per repairer
- **Horde level** = 1 + one per 25 kills of the horde's advance (`hordeKills`), which drives the
  spawn pool. **The horde grows 5% a level** (`hordeStrength`, `hordeMonster`): monster HP
  (rounded to whole HP), bounty (kept at 0.05 per HP) and wall strike. Level 27 is 2.3x
- Rodain's company holds the wall at 50 HP until the Mend the Walls quest is done
  (`the_wall_is_yours`). The player never loses the game: when the wall falls it is a Breach
  (`types/breach.ts`): 30% of fighters, repairers and idle villagers and 15% of foragers die, 40%
  of the food burns, renown is halved then pays 5 per horde level (can go negative). The horde
  is pushed back by half (at least 2 levels), the wall is patched to 50 and a 90s ward holds.
  Soldiers lose 30% of each rank's unshielded; a shielded soldier never falls (Kael's Forge)

---

## The Dragon's Claws (the player's own strike)

- **The named track** (`types/claws.ts`): Fledgling 1 damage, then Sharpened 2 (5 renown), Hooked
  3 (12), Hardened 4 (25), Serrated 6 (50), Obsidian 8 (100), Ember 11 (200), Dragonsteel 15 (400),
  Ancient 20 (800).
- **Dragonsteel reforges** (chapter 8): after Kael's scene, endless levels past Ancient. Each adds
  5 damage (keeping pace with five horde levels); the first costs 1,000 and each after 40% more.
  Shown as "Ancient Claws +n". Studies multiply the result (Dragon Anatomy, Wyrm's Fury, Weak
  Points).

## People (where the city's villagers come from)

- **Wanderers** (chapter 4): one encounter every 4-7 minutes of play (twice as often while
  short-handed), fed from the stores on arrival.
- **Refugees at the Gate** (a food event): take them in, fed on arrival, or turn them away.
- **Expeditions** (chapter 7, `types/outpost.ts`): 40 food and 5 minutes each; a journey finds
  0-3 people (35/35/20/10%), after 3 empty journeys the next finds someone, and the first ever
  always does. Cartography and Keen Scouts (the Librarium) make them shorter and luckier.
- Milestone newcomers (Word Spreads) and starvation deaths (Lean Times) were retired in chapter 7.
  An unfed army stands down; nobody starves.

---

## Buildings (Draconia Tab)

Buildings are organized in wards, top to bottom:

### THE KEEP
- **Draconia Keep** (150 renown) -- Time away (the wall wears while away if the army cannot hold, never below 50) and moving people between jobs (free, no refund; soldiers stand down to fighters)

### INNER WARD
- **Housing** -- Multiple houses, improves productivity
- **The Librarium** (200) -- Lirae's studies (chapter 6, after First Trappers)
- **Wizard's Tower** -- Enchantments (requires finding a Wizard)

### CRAFT WARD
- **The Forge** (Kael, 75 renown) -- Swords (from 15): an armed soldier hits 50% harder. Shields (from 20): a shielded soldier never falls in a Breach. Best ranks first, one of each per soldier
- **Ranger's Lodge** (30/75/150/300/600; forager cap 14-30, 10 without it) -- Promote gatherers (8 food a meal) to trappers (20, Lv1, from 15 renown) and trappers to rangers (40, Lv3, from 40)

### OUTER WARD
- **The Outpost** (120/250/500; 1/2/3 explorers) -- Send explorers to bring people home (chapter 7)

### CITY EDGE
- **Warfront Tower East** -- Station up to 6 fighters, boost insp/sec + defense, train fighters
- **Warfront Tower West** -- Same as East

### THE WARFRONT (beyond walls)
- Battlefield where fighters engage monsters

---

## Random Events

- **Wanderers** (chapter 4, `types/wanderers.ts`): one every 4-7 minutes of play once Mirael's
  Strangers at the Gate has played; twice as often while idle villagers are under 5
- Lone Wanderer 60% (1 villager), Traveling Couple 25% (2), Small Family 10% (3), Veteran 5%
  (1 fighter, no Rally cost). Each newcomer eats 10 food from the stores on arrival; if the stores
  cannot pay, they move on. The scripted first one is free

---

## Research (Librarium)

Four branches, each a chain bought with renown that takes effect at once (`types/research.ts`
for the tree, `types/library.ts` for the rules). The first of a branch may need its building.
- **The Dragon:** Dragon Anatomy (60, taps +10%), Weak Points (150, 1 tap in 10 strikes for
  double), Wyrm's Fury (400, taps +20%)
- **The Army:** Drill Tactics (60, Garrison; ranks 10% cheaper), Tempered Steel (150, Forge;
  swords 75%), Battle Drill (400, volleys +10%)
- **The Stores:** Rationing (50, Lodge; 15% less eaten), Lean Rations (80, quarter rations),
  Snares and Nets (150, foragers +25%), Feast Hall (300, double rations)
- **The Wall:** Mortar Craft (60, repair +25%), Night Ledgers (150, Keep; +25% renown while
  away), Evacuation Drills (400, a Breach takes a third fewer)

No study raises the bounty: every HP still pays 0.05 renown.
