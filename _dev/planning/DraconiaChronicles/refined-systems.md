# Dragon Gold -- Refined Systems Design

**Date:** 2026-03-04
**Status:** Refining core systems before implementation

---

## Core Metrics

Two parallel trackers from every click:

| Metric | Type | Purpose |
|--------|------|---------|
| **Gold** | Spendable currency | Goes up from clicks/idle, goes down from purchases |
| **Monsters Defeated (MD)** | Permanent XP counter | Only goes up. Drives Renown thresholds. Never spent. |

**1 click = +1 gold AND +1 monster defeated** (at base)

With upgrades, a single click can yield more:
- Click power (dm/click) increases both gold AND monsters defeated per click
- Auto-clicks (dm/sec) from recruits also increase both gold AND MD per tick

This means `clickPower` is really "dm/click" -- how many monsters you defeat
(and gold you earn) per tap.

### Already In Code

```typescript
// game.ts -- these already exist and map perfectly
gold: number           // spendable
totalClicks: number    // permanent MD counter (rename to monstersDefeated?)
clickPower: number     // dm/click (currently 1)
```

The `getRenown(totalClicks)` function already derives Renown from MD.

---

## The Smithy -- Kael, Daughter of the Forge

### Character: Kael

**Full Name:** Kael Ironwright
**Species:** Human (one of the refugees in Draconia)
**Role:** Blacksmith -- your equipment provider
**Age:** Early 20s

**Backstory:**
Kael's father was the legendary smith Torvun Ironwright, who forged weapons for
the Dragon Council before the Unmaking took him. Kael inherited his forge, his
tools, and his anvil -- but not his knowledge. She was still an apprentice when
the world fell apart. She has the raw talent and the determination, but she needs
time, resources, and a patron who believes in her.

That patron is you.

**Personality:**
- Practical and blunt. Doesn't sugarcoat.
- Gets genuinely excited when a new technique clicks into place.
- Self-deprecating about her skill level early on, growing confident over time.
- Protective of her father's legacy. The forge is sacred to her.
- Speaks in short, direct sentences. Forge metaphors.

**Sample Lines:**
- (Early) "Look, I can hit metal with a hammer. That's about where we're at."
- (First craft) "It's ugly. It works. Don't look at me like that."
- (Mid-game) "I figured out the folding technique. Dad's notes finally make sense."
- (Late-game) "This... this is better than anything he ever made. Don't tell him I said that."
- (On investment) "Gold buys time. Time buys skill. Skill buys you not dying."

### How the Smithy Works

The Smithy is a **building you construct** in Draconia (unlocked early, maybe
Renown 2). Once built, Kael becomes available.

The Smithy IS the research lab, reskinned:

```
Invest gold -> Kael researches a weapon/armor piece -> IRL time passes
-> Research completes -> Equipment ready to equip -> dm/click increases
```

### Equipment Slots

The dragon has equipment slots. Each slot has a progression of items, researched
one at a time, each better than the last. **You get the difference** when
upgrading, not the full value.

| Slot | Description | Progression Theme |
|------|-------------|-------------------|
| **Weapon** | What you strike with (claws enhanced by smithed weapons) | Damage per hit |
| **Shield** | Defensive gear (lets you fight more aggressively) | Click efficiency |
| **Helm** | Head protection / focus enhancement | Crit or bonus dm |
| **Armor** | Body protection (chest/scales reinforcement) | Survivability -> click speed? |
| **Claws** | Claw augments (gauntlets, sheaths, tips) | Multi-hit chance |
| **Talisman** | Magical accessory | Special effects / multipliers |

For alpha, start with **3 slots: Weapon, Shield, Claws.** Add more later.

### Equipment Tier Progression

Each slot has a linear chain of upgrades. You research them in order.

#### Weapon Slot

| Tier | Item | dm/click | Actual Gain | Research Time | Research Cost |
|------|------|----------|-------------|---------------|---------------|
| 1 | Rusty Sword | +0.25 | +0.25 | 2 min | 25 gold |
| 2 | Bent Sword | +0.43 | +0.18 | 5 min | 80 gold |
| 3 | Iron Sword | +0.70 | +0.27 | 15 min | 250 gold |
| 4 | Steel Sword | +1.10 | +0.40 | 45 min | 800 gold |
| 5 | Forged Blade | +1.75 | +0.65 | 2 hr | 2,500 gold |
| 6 | Dragonedge | +2.80 | +1.05 | 6 hr | 8,000 gold |
| 7 | Flamebrand | +4.50 | +1.70 | 12 hr | 25,000 gold |

#### Shield Slot

| Tier | Item | dm/click | Actual Gain | Research Time | Research Cost |
|------|------|----------|-------------|---------------|---------------|
| 1 | Splintered Shield | +0.12 | +0.12 | 2 min | 20 gold |
| 2 | Wooden Buckler | +0.22 | +0.10 | 5 min | 60 gold |
| 3 | Iron Buckler | +0.38 | +0.16 | 15 min | 200 gold |
| 4 | Steel Shield | +0.60 | +0.22 | 45 min | 650 gold |
| 5 | Tower Shield | +0.95 | +0.35 | 2 hr | 2,000 gold |
| 6 | Warden's Aegis | +1.50 | +0.55 | 6 hr | 6,500 gold |
| 7 | Dragonscale Wall | +2.40 | +0.90 | 12 hr | 20,000 gold |

#### Claws Slot

| Tier | Item | dm/click | Actual Gain | Research Time | Research Cost |
|------|------|----------|-------------|---------------|---------------|
| 1 | Filed Claws | +0.15 | +0.15 | 3 min | 30 gold |
| 2 | Sharpened Claws | +0.28 | +0.13 | 7 min | 90 gold |
| 3 | Iron Tips | +0.48 | +0.20 | 20 min | 300 gold |
| 4 | Steel Razors | +0.78 | +0.30 | 1 hr | 1,000 gold |
| 5 | Serrated Gauntlets | +1.25 | +0.47 | 3 hr | 3,000 gold |
| 6 | Venom Sheaths | +2.00 | +0.75 | 8 hr | 10,000 gold |
| 7 | Dragonfire Talons | +3.20 | +1.20 | 16 hr | 30,000 gold |

### Total Click Power Progression (All 3 Slots)

| All Tier 1 | All Tier 3 | All Tier 5 | All Tier 7 |
|------------|------------|------------|------------|
| Base 1.0 + 0.52 = **1.52 dm/click** | Base 1.0 + 1.56 = **2.56 dm/click** | Base 1.0 + 3.95 = **4.95 dm/click** | Base 1.0 + 10.50 = **11.50 dm/click** |

This means at max gear, each click defeats ~11 monsters. Combined with auto-clicks
from recruits, the numbers scale nicely without exploding.

### Smithy Upgrade (Lab Levels)

Kael's forge can be upgraded to unlock higher-tier research:

| Forge Level | Unlocks | Upgrade Cost | Renown Req |
|-------------|---------|-------------|------------|
| 1 | Tier 1-2 equipment | Free (building cost) | 2 |
| 2 | Tier 3 equipment | 500 gold | 4 |
| 3 | Tier 4 equipment, +1 research slot | 2,000 gold | 7 |
| 4 | Tier 5 equipment | 8,000 gold | 11 |
| 5 | Tier 6 equipment, +1 research slot | 30,000 gold | 16 |
| 6 | Tier 7 equipment | 100,000 gold | 22 |

**Research slots** = how many items Kael can work on simultaneously.
- Forge Level 1-2: 1 slot (one item at a time)
- Forge Level 3-4: 2 slots (two items in parallel)
- Forge Level 5-6: 3 slots

### Smithy Mechanic Summary

```
1. Build Smithy (Renown 2, costs gold)
2. Choose equipment slot to research
3. Pay gold cost, Kael starts working
4. Wait IRL time
5. Research completes -> item appears
6. Equip item -> dm/click increases by the DIFFERENCE from previous tier
7. Upgrade forge to unlock higher tiers and more parallel slots
```

---

## Recruit System -- Mixed Unique & Generic

### How Recruits Work

Recruits provide **dm/sec** (defeated monsters per second = auto-gold per second).
They are unlocked by Renown thresholds. Some are unique named characters, others
are generic types you can hire multiples of.

### Generic Recruits (Hire Multiples)

These unlock at Renown thresholds. You can hire as many as you can afford.
Cost scales per purchase (base * 1.15^owned).

| Renown Req | Type | dm/sec each | Base Hire Cost | Flavor |
|------------|------|-------------|----------------|--------|
| 1 | Peasant Volunteer | 0.1 | 10 | "They can barely hold a pitchfork, but they showed up." |
| 3 | Town Guard | 0.5 | 75 | "Trained to patrol, now trained to fight." |
| 7 | Sellsword | 2.0 | 500 | "Coin talks. Monsters walk." |
| 12 | Battle Mage | 8.0 | 3,500 | "Fire from the hands. Classic." |
| 18 | Gryphon Rider | 30.0 | 20,000 | "Death from above, on a budget." |
| 25 | War Drake | 100.0 | 125,000 | "Not quite a dragon, but close enough." |

### Unique Recruits (One-Time Named Characters)

These are special named NPCs that join at specific Renown milestones. Each is
a one-time unlock -- you don't hire them, they come to you. They provide a
fixed dm/sec bonus and may have a special ability or passive effect.

| Renown | Name | dm/sec | Special Effect | Introduction |
|--------|------|--------|----------------|--------------|
| 5 | **Varn, Dragon Recruit** | 0.5 | First auto-click. Tutorial moment. | "A young dragon, barely fledged, lands at your gates. 'I want to fight like you.'" |
| 10 | **Sera the Shieldmaiden** | 3.0 | +5% all recruit efficiency | "A warrior of the old guard. She doesn't ask permission -- she just starts fighting." |
| 15 | **Thornwick, the Exiled Mage** | 12.0 | Unlocks Talisman equipment slot at Smithy | "Banished from the eastern towers for 'reckless experimentation.' Your kind of people." |
| 22 | **Captain Rodain** | 50.0 | +10% all recruit efficiency, unlocks Barracks building | "He arrives with a company of fifty. 'Where do you want us?'" |
| 30 | **Ashara, Elder Wyrm** | 200.0 | +25% click power | "She is ancient. She is tired. She is angry. The monsters will learn why." |
| 40 | **The Hollow Knight** | 800.0 | +15% all gold earned | "No one knows what's inside the armor. No one asks twice." |
| 50 | **Lirae the Ink-Wing** | 0.0 | Unlocks Codex lore entries, +1 Smithy research slot | "She doesn't fight. She remembers. And remembering, in this world, is its own kind of power." |

### Unique Recruit Arrival

When a unique recruit's Renown threshold is crossed:
- A notification/banner appears: "[Name] has arrived in Draconia!"
- Their intro text displays
- They automatically join (no gold cost)
- Their dm/sec and special effect activate immediately

This creates milestone moments that feel significant -- you're not just buying
another upgrade, a character has chosen to stand with you.

### Combined Income Example

At Renown 15, a player might have:
- 20x Peasant Volunteers (0.1 * 20 = 2.0 dm/sec)
- 8x Town Guards (0.5 * 8 = 4.0 dm/sec)
- 3x Sellswords (2.0 * 3 = 6.0 dm/sec)
- Varn (unique, 0.5 dm/sec)
- Sera (unique, 3.0 dm/sec, +5% efficiency)
- Thornwick (unique, 12.0 dm/sec)
- **Total: 27.5 dm/sec * 1.05 (Sera) = ~28.9 dm/sec**
- Plus click power of maybe ~2.5 dm/click from Tier 3 equipment

That's ~29 monsters auto-defeated per second, plus manual clicks on top.
Each monster = 1 gold earned AND 1 added to the permanent MD counter.

---

## Building System (Revised)

Buildings no longer generate idle income (recruits do that). Buildings provide
multipliers, unlocks, and infrastructure.

| Building | Effect | Base Cost | Renown Req | Notes |
|----------|--------|-----------|------------|-------|
| **Smithy** | Equipment research (Kael) | 50 | 2 | Core building. See Smithy section. |
| **Watchtower** | +10% recruit dm/sec per level | 200 | 3 | Makes your followers more effective |
| **Market** | +5% all gold earned per level | 500 | 5 | Economic multiplier |
| **Training Grounds** | -5% generic recruit hire cost per level | 1,500 | 8 | Makes hiring cheaper |
| **Barracks** | +15% recruit dm/sec per level | 10,000 | 22 | Unlocked by Captain Rodain |
| **Dragon Roost** | +20% click power per level | 25,000 | 15 | Makes your clicks stronger |
| **Barrier Spire** | Future prestige hook | 500,000 | 30 | Placeholder for Phase 4 |

Each building has multiple levels. Cost per level scales at roughly x1.8 per level.

### Building Level Cost Example (Watchtower, base 200, x1.8)

| Level | Cost | Cumulative Effect |
|-------|------|-------------------|
| 1 | 200 | +10% recruit dm/sec |
| 2 | 360 | +20% recruit dm/sec |
| 3 | 648 | +30% recruit dm/sec |
| 4 | 1,166 | +40% recruit dm/sec |
| 5 | 2,099 | +50% recruit dm/sec |

---

## Data Model (Revised)

```typescript
// === Types ===

type EquipmentSlot = 'weapon' | 'shield' | 'claws' // + 'talisman' later
type GenericRecruitId = 'peasant' | 'townGuard' | 'sellsword'
                      | 'battleMage' | 'gryphonRider' | 'warDrake'
type UniqueRecruitId = 'varn' | 'sera' | 'thornwick' | 'rodain'
                     | 'ashara' | 'hollowKnight' | 'lirae'
type BuildingId = 'smithy' | 'watchtower' | 'market' | 'trainingGrounds'
                | 'barracks' | 'dragonRoost' | 'barrierSpire'
type ResearchId = string // equipment tier IDs like 'weapon_t1', 'shield_t2'

// === Game State ===

interface GameState {
  // Currency
  gold: number

  // Permanent counter (XP / Renown driver)
  monstersDefeated: number     // was totalClicks -- only goes up
  // Renown is derived: getRenown(monstersDefeated)

  // Click power
  clickPower: number           // dm/click, starts at 1.0

  // Equipment (from Smithy)
  equipment: Record<EquipmentSlot, number>  // tier level per slot (0 = none)

  // Recruits
  genericRecruits: Record<GenericRecruitId, number>  // count owned
  uniqueRecruits: UniqueRecruitId[]                  // which uniques have joined

  // Buildings
  buildings: Record<BuildingId, number>  // level per building

  // Smithy / Research
  forgeLevel: number                     // Kael's forge upgrade level
  activeResearch: SmithyResearch[]       // items being researched
  // completedResearch is implicit from equipment tier levels

  // Meta
  startedAt: number
  lastSavedAt: number          // for offline earnings
}

interface SmithyResearch {
  slot: EquipmentSlot
  targetTier: number           // which tier is being researched
  startedAt: number            // timestamp
  duration: number             // ms to complete
}

// === Derived Values ===

// Total dm/sec from all recruits (before building multipliers)
function getBaseRecruitDmSec(state: GameState): number { ... }

// Building multipliers applied to recruit dm/sec
function getEffectiveRecruitDmSec(state: GameState): number { ... }

// Click power including equipment and building bonuses
function getEffectiveClickPower(state: GameState): number { ... }

// Gold earned per second = effective recruit dm/sec (1 gold per dm)
function getGoldPerSecond(state: GameState): number { ... }
```

---

## Tab Structure (Revised)

| Tab | Icon | Content |
|-----|------|---------|
| **Battle** | `flame` | Click button, gold display, dm/click, dm/sec, Renown bar, recent unique recruit notification |
| **Draconia** | `business` | Scrollable town view: Buildings section + Recruit hiring section. Smithy has its own sub-view for equipment research. |
| **Codex** | `book` | Stats, Renown milestones, unique recruit bios, Kael's story progression, lore entries |

---

## Session Flow Example

**New Player (0-5 minutes):**
1. Tap "DEFEAT MONSTER" -- earn 1 gold, 1 MD
2. Keep tapping. Gold goes up. MD counter goes up.
3. At 10 MD -> Renown 1. Peasant Volunteers become available.
4. Switch to Draconia tab. Hire first Peasant (10 gold).
5. See "+0.1 dm/sec" appear. Monsters now auto-defeated slowly.
6. Keep tapping + passive income. Gold accumulates.

**Early Game (5-15 minutes):**
7. At 28 MD -> Renown 2. Smithy becomes available to build (50 gold).
8. Build Smithy. Meet Kael. She introduces herself.
9. Start researching Rusty Sword (25 gold, 2 minutes).
10. While waiting, hire more Peasants, maybe a Town Guard at Renown 3.
11. Rusty Sword completes. Click power: 1.0 -> 1.25 dm/click.
12. Start Splintered Shield research.

**Mid Session (15-30 minutes):**
13. At 112 MD -> Renown 5. **Varn arrives!** First unique recruit.
14. "+0.5 dm/sec" -- a named dragon fighting alongside you.
15. Research continues. Upgrading through equipment tiers.
16. Buildings start mattering: Watchtower boosts all recruit output.
17. Each Renown milestone brings new options: more recruit types, forge upgrades.

**Later Sessions:**
18. Research takes longer (30 min, 2 hrs). Reason to close app and come back.
19. Return to find offline gold accumulated from recruits.
20. Invest in higher-tier research, unlock new recruit types.
21. Unique recruits arrive with fanfare and story moments.
22. Kael's dialogue evolves as she masters her craft.

---

## Kael's Story Progression

Kael's dialogue and demeanor change as her forge level increases:

**Forge Level 1 (Tier 1-2 equipment):**
"I know the basics. Hammer, heat, hope. Let's see what happens."

**Forge Level 2 (Tier 3):**
"I found Dad's journal behind the bellows. His handwriting is terrible,
but... I think I understand the tempering process now."

**Forge Level 3 (Tier 4):**
"I made something today that didn't break when I tested it. First time.
Don't make a big deal out of it."

**Forge Level 4 (Tier 5):**
"The metal sings when it's right. I used to think Dad was being dramatic.
He wasn't."

**Forge Level 5 (Tier 6):**
"I dreamed about a technique last night. Woke up and tried it. It worked.
I think he's guiding me somehow."

**Forge Level 6 (Tier 7):**
"This blade... this is master work. I finally understand what he was trying
to teach me. I just wish I could show him."

---

## Open Questions (Remaining)

1. How exactly does offline dm/sec work? Cap at 8 hours like Draconia spec?
2. Should equipment have a visual representation or just stat text?
3. Should Kael have a visual sprite/portrait?
4. Do we want sound effects for research completion?
5. When should we introduce the Helm/Armor/Talisman slots? Research milestones?
6. What is the Barrier Spire's actual prestige mechanic? (Phase 4 question)
7. Monster variety -- should different "types" appear as flavor text, or is it
   always just "monster"?
