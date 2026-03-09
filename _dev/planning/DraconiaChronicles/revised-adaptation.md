# Dragon Gold Clicker -- Revised Adaptation Plan

**Date:** 2026-03-04
**Status:** Design direction confirmed by user
**Supersedes:** Initial interpretation in discovery-and-adaptation.md

---

## The Vision (In One Sentence)

You are a dragon who defeats monsters to protect Draconia and the world, earning gold
to invest in your beloved city, attracting followers through your growing renown.

---

## Core Identity -- What This Game IS

- You ARE a dragon. You fight monsters. That is the click.
- Clicking = defeating a monster = earning gold. Simple. Direct.
- Gold is the ONE resource (for alpha). No Arcana, no Soul Power, no multi-currency.
- Your city, Draconia, is what you're protecting. You love it. You invest in it.
- As you defeat more monsters, your **Renown** grows, attracting allies who automate
  the monster-fighting for you.
- The town expands through research, buildings, and real-time waiting.

## Core Identity -- What This Game IS NOT

- NOT a city-steward/resource-management sim (you are a dragon, not a mayor)
- NOT using Arcana as a currency (Arcana was a temporary run-bound power-up system)
- NOT journeying out and returning (no "runs," no prestige resets yet)
- NOT using temporary upgrades (those were the old game's core loop)

---

## What We Keep From Draconia Chronicles

### [KEEP] The Lore & Setting

Draconia is the last bastion of dragonkind, built on the Cradle Ley. The Barrier
protects it from the Unmaking. The player is a dragon -- not a steward, not an
overseer -- a dragon who fights to protect their home and invests in making it
stronger.

Key lore elements that still work:
- The Barrier of Draconia (could become a long-term goal or prestige hook later)
- The Unmaking as existential threat (narrative stakes for why you fight)
- The city of Draconia itself (the thing you're building up)
- Characters like Lirae (potential guide/narrator for unlocks)
- The Guild of Deep Flame, the Council, the Aethervault (flavor for buildings)

### [KEEP] The Renown System (Already Built)

From game.ts:64-81, we already have:

```
Renown 1:   10 monsters defeated
Renown 2:   28 monsters defeated
Renown 3:   52 monsters defeated
Renown 5:  112 monsters defeated
Renown 10: 316 monsters defeated
```

Formula: `dd = floor(10 * level^1.5)`

**Renown is the gate for automation.** As Renown increases:
- People, dragons, warriors, and heroes flock to Draconia
- These followers become auto-clickers (gold per second generators)
- Higher Renown = more powerful/expensive followers available

This replaces the old game's flat idle upgrades (Warding Circle, Dragon Egg, etc.)
with a **narrative-driven automation system.**

### [KEEP] The Research System (Adapted)

The old game had a Research Lab with:
- Lab Levels (1-8) that unlock research topics
- Research takes real time to complete
- Completed research reveals hidden upgrades you can then purchase
- Materials may be required (simplified for clicker)

**Adaptation for clicker:**

```
Research Lab (building in town)
  -> Queue research topics (costs gold)
  -> Research takes IRL time (minutes/hours, not seconds)
  -> Completed research unlocks new purchaseable upgrades
  -> Lab upgrades increase parallel research slots and available topics
```

This is the "discovery before power" philosophy from Draconia -- upgrades are hidden
until you research them. It adds anticipation and a reason to come back.

### [KEEP] Town Expansion (Adapted)

Buildings from the old game, re-themed for a dragon protecting their city:

**What buildings do in the clicker:**
- Produce passive gold (idle income)
- Unlock new upgrade categories
- Provide multipliers to click power or idle income
- Gate access to higher-tier content
- Each has its own upgrade path (levels)

### [KEEP] The Balance Philosophy

"Small Numbers, Big Feelings" -- but adapted for clicker conventions.

We already have `formatNumber()` with K/M/B/T formatting, which is standard for
clickers. The philosophy still applies in spirit: every 10x increase should feel
earned. But we use whole numbers (1 gold per click, not 0.03).

### [KEEP] Offline Progression

The old game specified: 8h linear, then diminishing. Cap at 24h.
Perfect for a mobile clicker -- you come back to accumulated gold.

---

## What We Skip From Draconia Chronicles

| System | Why Skip |
|--------|----------|
| **Arcana currency** | Was run-bound/temporary. We use gold only. |
| **Soul Power** | Was prestige currency. Not needed for alpha. |
| **Temporary upgrades** | Was the core of the old game's run loop. |
| **Journey/distance** | No traveling. You defend from Draconia. |
| **Shooter combat** | No projectiles, no enemy AI. Click = kill. |
| **Fire Tiers** | Too combat-specific. |
| **Ward/Land system** | No map progression. |
| **Synth Materials** (complex form) | Maybe simplified later as research requirements. |
| **Rune Gachapon** | Too complex. |
| **Astral Seals** | Premium currency, not needed. |
| **Dragon stats** (HP, damage, etc.) | You're not fighting in real-time. |

---

## The Game Loop

### Primary Loop: Click to Defeat

```
Click button -> Defeat monster -> Earn gold -> Total defeats increase
                                                    |
                                                    v
                                          Renown thresholds checked
                                                    |
                                                    v
                                          New followers unlocked
                                          (auto-gold generators)
```

### Secondary Loop: Invest in Draconia

```
Spend gold -> Build/upgrade buildings -> Buildings provide:
                                           - Passive income multipliers
                                           - Click power bonuses
                                           - New building unlocks
                                           - Research access
```

### Tertiary Loop: Research & Discovery

```
Build Research Lab -> Queue research (costs gold + IRL time)
                          |
                          v
                    Research completes -> New upgrade revealed
                          |
                          v
                    Purchase upgrade (costs gold) -> Permanent bonus
```

### Idle Loop: Followers + Buildings

```
Followers auto-defeat monsters -> Gold accumulates
Buildings generate passive bonuses -> Gold multiplied
Offline time -> Catch-up earnings on return
```

---

## Renown-Based Follower System (Replacing Flat Idle Upgrades)

Instead of buying "Warding Circle (+1 gold/s)" from a shop, followers are
**unlocked by Renown** and **hired with gold.**

### Follower Tiers (Unlocked by Renown)

| Renown | Follower Type | Gold/sec | Hire Cost | Flavor |
|--------|---------------|----------|-----------|--------|
| 1 | Peasant Volunteer | 1 | 15 | "Inspired by your bravery" |
| 3 | Town Militia | 5 | 100 | "Trained defenders join the cause" |
| 5 | Wandering Warrior | 25 | 750 | "Word of your deeds spreads" |
| 8 | Dragon Whelp | 100 | 5,000 | "Young dragons seek your guidance" |
| 12 | Knight Errant | 500 | 40,000 | "Noble warriors pledge their swords" |
| 16 | War Mage | 2,500 | 300,000 | "The academies send their finest" |
| 20 | Elder Dragon | 10,000 | 2,000,000 | "Ancient ones rise from slumber" |
| 25 | Legendary Hero | 50,000 | 15,000,000 | "Heroes of myth answer the call" |

**Mechanic:** Each follower type can be hired multiple times. Cost scales per
purchase (e.g., x1.15 per additional hire). Each hire adds their gold/sec to
your passive income.

**Why this works:**
- Renown gates prevent buying everything immediately
- Clicking matters because it drives Renown
- Gold matters because hiring is expensive
- Narrative cohesion -- your fame attracts allies
- Same exponential cost curves as a standard clicker, but with story

### How Followers Replace the Old Upgrade System

| Old System (UPGRADES array) | New System (Followers) |
|-----------------------------|----------------------|
| Arcane Strike (+1 click power) | Click power comes from buildings/research |
| Warding Circle (+1 gold/s) | Peasant Volunteer (Renown 1) |
| Dragon Egg (+10 gold/s) | Dragon Whelp (Renown 8) |
| Barrier Nexus (+100 gold/s) | Elder Dragon (Renown 20) |

The follower system IS the idle income system. Buildings and research handle
click power and multipliers.

---

## Building System (Town of Draconia)

Buildings are the gold sink and progression spine. They don't generate idle income
directly (followers do that) -- instead they provide **multipliers, click power,
unlocks, and research access.**

### Alpha Buildings

| Building | Effect | Base Cost | Unlock Condition |
|----------|--------|-----------|------------------|
| **Smithy** | +1 click power per level | 50 | Start |
| **Watchtower** | +10% idle income per level | 200 | Renown 2 |
| **Market** | +5% all gold per level | 1,000 | Renown 4 |
| **Research Lab** | Unlocks research system | 5,000 | Renown 6 |
| **Barracks** | +20% follower efficiency per level | 10,000 | Renown 10 |
| **Dragon Roost** | +25% click power per level | 50,000 | Renown 14 |
| **Barrier Spire** | ??? (future prestige hook) | 500,000 | Renown 20 |

Each building has multiple levels. Costs scale exponentially per level (x1.5 or
similar, tuned per building).

---

## Research System (Adapted from Draconia's Lab)

### How Research Works in the Clicker

1. **Build the Research Lab** (building, costs gold, requires Renown 6)
2. **Choose a research topic** from available list
3. **Pay the gold cost** to start research
4. **Wait IRL time** for it to complete (e.g., 5 minutes, 30 minutes, 2 hours)
5. **Research completes** -> new upgrade appears in a "Discoveries" panel
6. **Buy the discovered upgrade** with gold for a permanent bonus

### Research Topics (Examples)

Adapted from Draconia's tech trees. Instead of dragon biology (Fuel, Air, Mix),
we re-theme to city/combat improvements:

| Research Topic | Time | Gold Cost | Unlocked Upgrade |
|---------------|------|-----------|------------------|
| Sharpened Claws | 5 min | 500 | +50% base click power |
| Fortified Walls | 15 min | 2,000 | -10% building costs |
| Dragon's Hoard | 30 min | 8,000 | +1 gold per click per Renown level |
| Battle Tactics | 1 hr | 20,000 | Followers +25% efficiency |
| Ancient Runes | 2 hr | 50,000 | Unlock Tier 2 research topics |
| Barrier Science | 4 hr | 200,000 | Unlock Barrier Spire building |

### Lab Levels (from Draconia's Lab Level Progression)

| Lab Level | Parallel Slots | Queue Size | New Topics |
|-----------|---------------|------------|------------|
| 1 | 1 | 1 | Basic topics (3-4) |
| 2 | 1 | 2 | Intermediate topics |
| 3 | 2 | 3 | Advanced topics |
| 4 | 2 | 4 | Expert topics |
| 5 | 3 | 5 | Master topics |

Lab upgrades cost gold. Higher levels unlock more research topics AND let you
run more research in parallel.

### Why IRL Time Matters

- Creates a reason to come back ("my research finishes in 30 minutes")
- Prevents rushing through all content in one session
- Matches mobile idle game conventions
- The old Draconia design used this exact pattern with Synth Materials
- Combined with offline progression, this is the "daily rhythm" from the
  Player Experience doc (tome/02)

---

## Data Model Changes

### Current GameState (game.ts)

```typescript
interface GameState {
  gold: number
  totalGoldEarned: number
  totalClicks: number
  clickPower: number
  upgrades: Record<UpgradeId, number>
  startedAt: number
}
```

### Revised GameState

```typescript
interface GameState {
  // Currency
  gold: number
  totalGoldEarned: number

  // Combat
  totalClicks: number           // monsters defeated
  clickPower: number            // gold per click

  // Renown (already exists conceptually via getRenown())
  // Derived from totalClicks, no need to store

  // Followers (idle income generators, gated by Renown)
  followers: Record<FollowerTypeId, number>  // count of each type hired

  // Buildings (multipliers, unlocks, click power)
  buildings: Record<BuildingId, number>      // level of each building

  // Research
  activeResearch: ResearchSlot[]             // currently researching
  completedResearch: ResearchId[]            // finished research IDs
  labLevel: number                           // Research Lab upgrade level

  // Meta
  startedAt: number
  lastSavedAt: number                        // for offline earnings calc
}

interface ResearchSlot {
  researchId: ResearchId
  startedAt: number           // timestamp when research began
  duration: number            // milliseconds to complete
}
```

### New Type Definitions Needed

```typescript
type FollowerTypeId = 'peasant' | 'militia' | 'warrior' | 'whelp'
                    | 'knight' | 'warMage' | 'elderDragon' | 'legendaryHero'

type BuildingId = 'smithy' | 'watchtower' | 'market' | 'researchLab'
                | 'barracks' | 'dragonRoost' | 'barrierSpire'

type ResearchId = 'sharpenedClaws' | 'fortifiedWalls' | 'dragonsHoard'
                | 'battleTactics' | 'ancientRunes' | 'barrierScience'
                // ... more as designed
```

---

## Tab Structure

### Current: Game | Shop | Stats

### Revised: Battle | Draconia | Codex

| Tab | Icon | Content |
|-----|------|---------|
| **Battle** | `flame` | Click to defeat monsters. Shows gold, click power, Renown, follower summary. The core loop. |
| **Draconia** | `business` | Town management. Two sub-sections: **Followers** (hire auto-clickers) and **Buildings** (upgrade the city). Research Lab lives here too. |
| **Codex** | `book` | Stats, achievements, lore entries, research progress. The old Stats tab with more depth. |

The Draconia tab is the big new screen. It might need internal scrolling or
sub-tabs (Followers / Buildings / Research) as content grows.

---

## Implementation Phases

### Phase 1: Core Clicker (MVP)
- [x] Click button earns gold (exists)
- [x] Renown system (exists)
- [ ] Populate follower definitions (replace empty UPGRADES array)
- [ ] Gate followers behind Renown thresholds
- [ ] Build Draconia tab (follower hiring + building purchasing)
- [ ] Re-theme: "Defeat Monster" not "Defeat Demon", gold not arcana
- [ ] 3-5 follower types, 3-4 buildings

### Phase 2: Research & Discovery
- [ ] Research Lab building
- [ ] Research queue with IRL timers
- [ ] Discovered upgrades panel
- [ ] 6-10 research topics
- [ ] Lab level upgrades

### Phase 3: Depth & Polish
- [ ] Offline earnings calculation
- [ ] More follower types (8+)
- [ ] More buildings (7+)
- [ ] More research topics (15+)
- [ ] Lore entries in Codex (from Draconia Lore Compendium)
- [ ] Achievement system tied to Renown milestones
- [ ] Narrative flavor text for milestones

### Phase 4: Prestige (Future)
- [ ] Barrier Spire building as prestige gateway
- [ ] "Barrier Pulse" reset mechanic
- [ ] Prestige currency (Soul Power or similar)
- [ ] Permanent bonuses across resets
- [ ] This is where the old meta-progression design gets used

---

## Source Material Reference

### Directly Applicable from Draconia Chronicles

| Source Doc | What We Use |
|-----------|-------------|
| Lore Compendium | World setting, Barrier, Unmaking, characters |
| 08_Town_Lair_City_PublicWorks | Building system structure, construction pipeline |
| 07_Economy_Currencies_Items_Market | Market/vendor concepts, cost curves |
| 16_Firecraft_Safety_Scales_Tech_Trees | Research Lab levels, discovery-before-power |
| game-balance-philosophy | Number scaling approach, milestone psychology |
| 02_Player_Experience_Overview | Session pacing, daily rhythm, offline design |
| GOLD_MINING_ECONOMY_SPEC | Upgrade tiers, worker hierarchy (maps to followers) |
| 09_Automation_Convoys_Stewards | Steward/delegation concepts (maps to late-game followers) |
| Aethervault_and_Scroll_System_Spec | Lirae character, Aethervault building concept |
| Draconia_TechTrees_Main3.csv | Research topic categories and tier structure |

### Not Applicable

| Source Doc | Why |
|-----------|-----|
| 03_ShooterIdle_Core_Loop | Shooter mechanics, irrelevant |
| 04_Progression_Maps_Wards_Lands | Distance/ward system, not used |
| 05_Combat_Systems_Enemies_Bosses | Real-time combat, not used |
| 06_Abilities_Skills_Rituals | Active abilities, not used |
| 10_Endgame_Rift_NGPlus | Rift combat, not used (prestige concept kept) |

---

## Key Decisions Made

1. **Currency:** Gold only (no Arcana, no Soul Power for alpha)
2. **Click action:** Defeat monster (not channel Arcana, not mine)
3. **Idle income:** Followers attracted by Renown (not flat upgrades)
4. **Town investment:** Buildings provide multipliers/unlocks (not idle income)
5. **Research:** IRL-time-gated discovery system (from Draconia's Lab)
6. **Rebranding:** "Monsters" not "Demons" for the enemies
7. **Renown:** Already built, becomes the unlock gate for followers
