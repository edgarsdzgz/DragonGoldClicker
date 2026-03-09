# Draconia Chronicles -> Dragon Gold Clicker: Discovery & Adaptation Notes

**Date:** 2026-03-04
**Source Project:** `C:\Users\ediaz\Coding_Projects\dragonIdler` (Draconia Chronicles v0.0.1-alpha)
**Target Project:** `r:\Coding_Projects\_dragonGold` (Dragon Gold idle clicker, React Native/Expo)

---

## 1. What Draconia Chronicles Was

A **shooter-idle hybrid** built as a SvelteKit monorepo. The player controlled a dragon
defending the Dragonlands from encroaching evil. It combined real-time combat with idle
progression and had an elaborate design vision documented across 27+ tome chapters, a
lore compendium, economy specs, and tech tree CSVs.

**Key systems designed (many not implemented):**
- Shooter combat loop (journey out from Draconia, fight enemies, return)
- 4-currency economy (Arcana, Soul Power, Gold, Astral Seals)
- Town/Lair/City public works progression
- Gold Mining mini-game (clicker + business sim)
- Automation (convoys, stewards, trade routes)
- Research/tech trees (Flamecraft, Scales, Safety)
- Scroll collection and ability unlocks (Aethervault)
- Synth material production
- Ward/Land progression system

---

## 2. Lore Worth Keeping

The lore is rich and works well for a town-investment clicker. Key elements:

### The Setting: Draconia

- **Draconia** is the last bastion of dragonkind, built upon the Cradle Ley (where the
  First Flame touched the world)
- Protected by the **Barrier of Draconia** -- a reflexive magical shield powered by Arcana
- The city is a mythic birthplace, not an imperial capital
- Refugees have gathered here as the last safe haven

### The Threat: The Unmaking

- An apocalyptic force caused by a failed human ritual that overdrew the world's Arcana
- Reality itself is "correcting" by erasing corrupted areas
- Manifests as distortion -> corruption -> dissolution
- Called "the Quiet Hunger" -- it even erases memory

### The Core Tension

> "If the Barrier falters, all creation exhales for the last time."

The Barrier needs Arcana to survive. The player's role shifts from "dragon warrior" to
**city steward** -- gather resources, invest in the city, strengthen the Barrier.

### Characters

- **Lirae the Ink-Wing**: Apprentice archivist, bookish, enthusiastic, slightly clumsy.
  Great tutorial/guide NPC for a clicker.
- **Elder Saphyrian Quillfire**: Keeper of the Aethervault (could be an advisor/prestige NPC)
- **The Great Dragon Council**: Background authority that gives the player their mandate

### Narrative Reframe for Clicker

Instead of "go fight enemies, return to invest," the story becomes:

> You are the Steward of Draconia. The Barrier holds, but barely. The city needs
> rebuilding, the economy needs reviving, and the Arcana must flow. Click to gather,
> invest to grow, and keep the last light of creation alive.

---

## 3. Economy Systems Worth Adapting

### 3.1 Multi-Currency System

The old game had 4 currencies. For a clicker, we can simplify to 2-3:

| Old Currency   | Role               | Clicker Adaptation                        |
|----------------|--------------------|--------------------------------------------|
| **Arcana**     | Run-bound power    | **Primary click currency** -- replaces current "arcana" but with deeper purpose |
| **Soul Power** | Permanent meta     | **Prestige currency** -- earned on resets, used for permanent upgrades |
| **Gold**       | QoL/town           | **Town investment currency** -- earned from buildings/passive income |
| Astral Seals   | Premium            | Skip for now (maybe late-game rare drops)  |

### 3.2 Gold Mining Mini-Game

This is **directly translatable** to a clicker. The spec describes:

- Click to dig, discover veins, mine gold
- Hire miners (auto-clickers), foremen, engineers, managers
- Manage expenses vs income (payroll, maintenance, infrastructure)
- Mines become unprofitable at depth -- open new ones
- Risk events (cave-ins, equipment failure, strikes)

**Adaptation:** This could become a core tab/mode -- "The Mines" -- where you click to
mine gold that funds city construction.

### 3.3 Town Investment System

The old game had a phased town system:

**Phase 1 - Basic Commerce:**
- Vendor stalls (taxed sales)
- Kiosks (lower tax, throughput-capped)
- Owned shops (no tax, staffing costs)

**Phase 2 - Lair/Comfort:**
- Rooms (nest, workshop, trophy hall, library, treasury)
- Furniture and decorations providing comfort bonuses
- Rested bonuses (time-limited boosts)

**Phase 3 - City Public Works:**
- Construction pipeline (gather -> transport -> refine -> build -> commission)
- Housing & Market Districts with Bastion Tiers
- City investments (housing, infrastructure, commerce, defense)

**Phase 4 - Automation:**
- Transport routes with guards and safety systems
- Steward contracts for delegation
- Task board for automated missions

**Adaptation:** Strip the combat dependency. Buildings produce resources passively.
Upgrades unlock new buildings. The "construction pipeline" feeling works great for
a clicker's progression sense.

### 3.4 Balance Philosophy: "Small Numbers, Big Feelings"

This is excellent and directly applicable:

> "Every 10x increase should feel like a major achievement."

- 0.10 = "I did it!" (first achievement)
- 1.0 = "I'm getting powerful!" (major milestone)
- 10.0 = "I'm unstoppable!" (amazing achievement)
- 100.0 = "I'm a legend!" (late game)
- 1000.0 = "I've mastered this!" (endgame)

Anti-pattern: Avoid explosive number inflation where "1,234,567 damage" makes numbers
meaningless. Use decimals freely. Consider this for the clicker's economy.

**However:** The current clicker already uses large-number formatting (K, M, B, T),
which is the standard clicker convention. We should decide which approach fits better.
The "small numbers" philosophy is more elegant but less conventional for clickers.

---

## 4. Tech Trees Worth Adapting

The CSV defines 3 trees with tiered upgrades:

### Flamecraft (Offense/Production)
- Damage, Fire Rate, Range, Splash, Critical, Multishot, etc.
- **Adaptation:** Production upgrades -- "furnace output," "mining speed," "click power"

### Scales (Defense/Durability)
- Max HP, Armor, Regeneration, Thorns, Lifesteal, Damage Reduction
- **Adaptation:** Barrier upgrades -- "barrier strength," "barrier regeneration,"
  "corruption resistance"

### Safety (Utility/Economy)
- Flight Speed, Cooldown Reduction, Gold Gain, Arcana Gain, XP Gain, Drop Chance,
  Offline/Idle Boost
- **Adaptation:** Economy/idle upgrades -- this maps almost directly!
  - Gold Gain -> income multipliers
  - Idle Boost -> offline earnings
  - Drop Chance -> rare resource discovery
  - XP Gain -> progression speed

---

## 5. City Buildings Concept (New for Clicker)

Based on the town/city systems, here's a building framework:

### Tier 1 - Foundations (Early Game)
| Building          | Function                    | Unlocks                |
|-------------------|-----------------------------|------------------------|
| **Mine Shaft**    | Click to gather gold        | Core gameplay          |
| **Market Stall**  | Passive gold income         | First idle income      |
| **Barrier Pylon** | Arcana -> Barrier strength  | Main "prestige" sink   |
| **Workshop**      | Upgrade tools               | Click power upgrades   |

### Tier 2 - Growth (Mid Game)
| Building           | Function                           | Unlocks                |
|--------------------|------------------------------------|------------------------|
| **Vendor Hall**    | Better sell prices                 | Multipliers            |
| **Synth Foundry**  | Material production (timed)        | Crafting               |
| **Guard Barracks** | Route safety / risk reduction      | Automation quality     |
| **Library**        | Research speed                     | Tech tree acceleration |

### Tier 3 - Prosperity (Late Game)
| Building             | Function                          | Unlocks                |
|----------------------|-----------------------------------|------------------------|
| **Aethervault**      | Scroll/ability unlocks            | Special powers         |
| **Trade Hub**        | Caravan automation                | Passive resources      |
| **District Housing** | Population -> more workers        | Labor pool             |
| **Council Spire**    | Prestige/reset mechanic           | Meta-progression       |

### Tier 4 - Mastery (Endgame)
| Building                 | Function                     | Unlocks             |
|--------------------------|------------------------------|----------------------|
| **Great Barrier Nexus**  | Ultimate Barrier upgrade     | Final boss/goal      |
| **Astral Observatory**   | Rare resource generation     | Premium tier         |
| **Dragon Academy**       | Steward training             | Full automation      |

---

## 6. Progression Loop (Adapted for Clicker)

### Core Loop
```
Click to Mine -> Earn Gold -> Build/Upgrade Town -> Earn Passive Income
     ^                                                        |
     |                                                        v
     +------------- Barrier Strengthens (Progress) <----------+
```

### Meta Loop (Prestige)
```
Barrier reaches threshold -> "The Barrier Pulses" (prestige reset)
-> Earn Soul Power -> Permanent upgrades -> Start again stronger
```

### Idle Loop
```
Buildings produce resources offline -> Return to accumulated wealth
-> Invest in upgrades -> Increase offline production -> Repeat
```

---

## 7. What to Skip / Not Adapt

These elements from Draconia Chronicles don't fit a clicker:

- [x] **Combat system** -- No shooter mechanics, no projectiles, no enemies on screen
- [x] **Journey/distance system** -- No traveling out from city
- [x] **Ward/Land exploration** -- No map progression
- [x] **Dragon player character stats** -- No HP, damage, attack speed
- [x] **Fire Tier system** -- Too combat-specific
- [x] **Rune Gachapon** -- Too complex for a clicker
- [x] **Enemy AI and formations** -- No enemies
- [x] **Multi-phase boss encounters** -- No bosses
- [x] **Synth material tiers** (in full complexity) -- Simplify heavily
- [x] **60fps rendering concerns** -- Not a real-time game

---

## 8. Current Dragon Gold State (What Exists)

The current clicker has a solid foundation:

- **Framework:** React Native + Expo (mobile-first)
- **3 tabs:** Game (click), Shop (upgrades), Stats
- **Currency:** "Arcana" (single currency)
- **4 upgrades:** Arcane Strike (click power), Warding Circle (+1/s), Dragon Egg (+10/s),
  Barrier Nexus (+100/s)
- **Theme:** "Defeat Demons to protect Draconia" -- clicking a button
- **Persistence:** AsyncStorage with 2-second debounced saves
- **Design system:** Dark theme, gold accents, good typography and spacing
- **Hooks:** useGameLoop (1s tick), useStorage, useHaptics

### What Needs to Change

1. **Narrative reframe** -- From "defeat demons" to "steward the city"
2. **Building system** -- Replace flat upgrade list with building-based progression
3. **Multiple currency support** -- Add Gold alongside Arcana (or replace)
4. **Town screen** -- Visual representation of buildings/city
5. **Prestige system** -- "Barrier Pulse" reset mechanic
6. **Offline progress** -- Calculate earnings while app was closed
7. **Deeper upgrade trees** -- Per-building upgrades, not just 4 flat items

---

## 9. Open Questions

1. **Number scale:** Use Draconia's "small numbers, big feelings" (0.01 - 1000) or
   conventional clicker scale (1 - 1T)?
2. **Visual style:** Keep current dark+gold theme or shift toward the cyan/obsidian
   Draconia aesthetic?
3. **Mining mini-game:** Include as a separate tab/mode or fold into the main click loop?
4. **Barrier as win condition:** Should there be a "goal" (fully restore the Barrier) or
   is it endless progression?
5. **Character presence:** Should Lirae appear as a guide/narrator? Tutorial NPC?
6. **Prestige system timing:** How many hours of play before first prestige is available?
7. **Building visuals:** ASCII/text-based, icon grid, or illustrated?

---

## 10. Recommended Next Steps

1. **Define the core loop** -- What does a click do? What does idle income look like?
   What buildings exist at launch?
2. **Design the building system** -- Types, costs, effects, upgrade paths
3. **Choose the number scale** -- Small numbers vs conventional clicker
4. **Plan the prestige mechanic** -- "Barrier Pulse" with Soul Power
5. **Prototype the town screen** -- Even rough, to feel the progression
6. **Write the narrative beats** -- Opening text, milestone messages, prestige flavor

---

## Source Files Referenced

From `C:\Users\ediaz\Coding_Projects\dragonIdler`:

- `docs/archive/v2.3/tome/01_Vision_Lore_World.md` -- Core vision, lore canon
- `docs/archive/v2.3/tome/04_Progression_Maps_Wards_Lands.md` -- World structure
- `docs/archive/v2.3/tome/07_Economy_Currencies_Items_Market.md` -- Currency system
- `docs/archive/v2.3/tome/08_Town_Lair_City_PublicWorks.md` -- Town/city systems
- `docs/archive/v2.3/tome/09_Automation_Convoys_Stewards.md` -- Automation
- `docs/Draconia_Lore_Compendium.md` -- Deep lore (Arcana Pendants, Unmaking, Barrier)
- `docs/GOLD_MINING_ECONOMY_SPEC_v1_0.md` -- Mining mini-game design
- `docs/Aethervault_and_Scroll_System_Spec.md` -- Aethervault, Lirae, scrolls
- `docs/project/game-balance-philosophy.md` -- "Small Numbers, Big Feelings"
- `Draconia_TechTrees_Main3.csv` -- Tech tree data (Flamecraft, Scales, Safety)
