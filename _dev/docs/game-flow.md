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
| Fighter | Rally (Warfront tab) | 1.00 renown (scaling ~n^1.4) | 0.25 damage every 1.5s to the monster at the gate (1/8 of a held strike) | 2 |
| Repairer | Direct (Warfront tab, unlocks at 3 fighters) | TBD | Heals city HP | 1.5 (75% of fighter) |

### Foraging Units
| Unit | Source | Cost | Effect | Food/check |
|------|--------|------|--------|------------|
| Gatherer | Train (Forage tab, no building needed) | TBD | +0.2 food/sec | 0.5 |
| Trapper | Train (requires Lodge Lv3) | TBD | +0.6 food/sec | 0.3 |
| Ranger | Train (requires Lodge Lv5) | TBD | +1.5 food/sec | 0.1 |

### Explorer Units
| Unit | Source | Effect |
|------|--------|--------|
| Explorer | Train (Explorer's Outpost) | Can go on expeditions, gathers food faster but stashes for self |

---

## Siege Mechanics

- **Threat Level** increases at inspiration milestones (0->1, 200->3, 750->6, 1500->10, 3000->15, 5000->22)
- **Defense Level** = click power + fighters + tower bonuses
- When threat > defense, city takes damage every 10 seconds
- **Damage** = max(0, threat - defense) * 0.5
- **Repair rate** = 0.5 HP/sec per repairer
- If city HP reaches 0, game over

---

## Milestone Villager Recruitment

| Total Inspiration | Villagers Offered |
|------------------|-------------------|
| 500 | 3 |
| 1,000 | 3 |
| 2,500 | 2 |
| 3,500 | 7 |

Player can accept or reject each group.

---

## Buildings (Draconia Tab)

Buildings are organized in wards, top to bottom:

### THE KEEP
- **Draconia Keep** (250 insp + 200 food) -- Enables reassignment + offline rewards

### INNER WARD
- **Housing** -- Multiple houses, improves productivity
- **The Librarium** -- Research tech tree (requires teaching a Librarian)
- **Wizard's Tower** -- Enchantments (requires finding a Wizard)

### CRAFT WARD
- **The Armory** -- Forge weapons (requires training a Forger)
- **Ranger's Lodge** -- Upgrade gatherers to trappers/rangers

### OUTER WARD
- **Explorer's Outpost** -- Send explorers on expeditions

### CITY EDGE
- **Warfront Tower East** -- Station up to 6 fighters, boost insp/sec + defense, train fighters
- **Warfront Tower West** -- Same as East

### THE WARFRONT (beyond walls)
- Battlefield where fighters engage monsters

---

## Random Events

- **Wanderer encounters** every 300 seconds during active play (requires food system active)
- 4 types: Lone Wanderer (1), Traveling Couple (2), Small Family (3), Trained Refugee (1 + skill)

---

## Research (Librarium)

5 categories: Economy, Military, Survival, Exploration, Mystery
See `src/types/research.ts` for the full tech tree.
