# Dragon Gold - Changelog

## [Unreleased] - Siege Defense Redesign

### Monster pool and slower fighters (2026-10-26)
- Monsters come from a spawn pool: odds blend with kills, each new type's first appearance is
  guaranteed at its threshold, kobolds phase out when orcs arrive (`types/spawnPool.ts`)
- Kills are counted per monster; Defend the Wall counts kobolds. Save v9 rebuilds the counts
- Fighters attack every 6s instead of 1.5s, and all of them strike together as one hit

### Quests (2026-10-26)
- Quest system: one quest at a time on the objective line, rewards, completion into a story scene or a toast
- Defend the Wall (defeat 4 kobolds) completes into "The Wall Holds", which explains fighters; Rally now at 4 kills
- Raise the Guard (rally 2 fighters) pays +1.00 renown
- Journal Quests tab; the objective line shows on the Warfront from the first kill

### Reset and the renown scene (2026-10-26)
- Resetting the game (Settings or Game Over) returns to the Warfront tab
- While Elder Pyreth explains renown, the renown figure shows through the dim with a pulsing gold box
  (`HighlightBackdrop`; any scene can point at a coach target with `highlight`)

### Core tap layer 2e: one monster at the gate (2026-10-26)
- Waves put away into cold storage (`src/modes/waves/`) for a later side mode; still compiled and tested
- A monster is always at the gate; its type follows lifetime kills (13 / 28 / 53)
- Fighters deal damage (0.25 every 1.5s each, staggered) instead of earning renown per second
- Renown only from kills, by the player or by fighters; no wave bonus
- Pips replaced by one long health bar that drains in proportion to damage
- Fighter hits show as small blue numbers; the player's slash and knockback are unchanged
- `begin_wave` guided step removed; `call_to_arms` fires at 13 kills
- Save v8: monster type from kills; new `allyStrikes` and `allyKills` counters

### Phase 0: Currency Rename (COMPLETE)
- Renamed "gold" to "inspiration" across the entire codebase
- Renamed `CoinIcon` component to `InspirationIcon`
- Updated all type interfaces: `gold` -> `inspiration`, `totalGoldEarned` -> `totalInspirationEarned`, `totalGoldSpent` -> `totalInspirationSpent`
- Updated `EXPEDITION_GOLD_COST` -> `EXPEDITION_INSPIRATION_COST`
- Updated `ResourceBar` props: `gold` -> `inspiration`, `autoGoldPerSec` -> `autoInspPerSec`
- Updated `OfflineModal` props: `goldEarned` -> `inspirationEarned`
- Updated research prereq type: `totalGoldEarned` -> `totalInspirationEarned`
- Updated research descriptions to reference "inspiration" instead of "gold"
- Added save migration in `useStorage.ts` for old `gold`/`totalGoldEarned`/`totalGoldSpent` fields
- Changed starting food from 150 to 200
- Changed starting villagers from 10 to 25
- Updated `ResourceKey` type from `'gold'` to `'inspiration'`

### Phase 1: Tab Locking System (COMPLETE)
- All 4 bottom tabs always visible (removed conditional Forage tab rendering)
- Locked tabs show lock-closed icon + "Locked" label in muted color
- Floating pill toast on locked tab tap with unlock requirement text
- Created `useTabLocks` hook (`src/navigation/useTabLocks.ts`) with per-tab lock conditions
- Created `UnlockToast` component (`src/components/UnlockToast.tsx`) with fade animation
- Unlock conditions wired to final game-flow values:
  - Forage: 3 repairers directed (Phase 2 will add repairers)
  - Draconia: 3 gatherers trained (Phase 5 will add training path)
- Added `repairers: number` field to `GameState` (default 0, ready for Phase 2)
- Badges suppressed on locked tabs (build dot, food warning)

### Phase 2: Fighters & Repairers (COMPLETE)
- Created `ActionOrb` component (`src/components/ActionOrb.tsx`) -- 25% size HarvestOrb variant
- Rally button (garrison red) flanks Slay orb on left, shows cost, disabled when unaffordable
- Repair button (steel blue #94a3b8) flanks Slay orb on right, unlocks at 3 fighters
- Locked repair slot shows "N more fighter(s)" placeholder with dashed border
- Created `src/types/fighters.ts` -- Fighter/Repairer constants and cost helpers
- Fighter: 20 insp base cost (n^1.4 scaling), +0.25 insp/sec, 2 food/check
- Repairer: 15 insp base cost (n^1.4 scaling), 1.5 food/check
- Added `fighters`, `fightersRallied`, `repairersDirected` to GameState
- Added `rallyFighter` and `directRepairer` actions to GameContext
- Fighter auto-income integrated into game loop and offline earnings
- Food consumption updated to include fighters and repairers
- Starvation system updated to include fighters and repairers
- Population badges on Warfront show fighter/repairer counts

### Phase 3: City HP / Siege (COMPLETE)
- Created `src/types/siege.ts` -- threat milestones, defense calc, damage formula, repair rate
- Added `cityHp`, `siegeTimer`, `repairProgress` to GameState (100 HP starting)
- Threat level milestones: 0->1, 200->3, 750->6, 1500->10, 3000->15, 5000->22 (based on totalInspirationEarned)
- Defense level = clickPower + fighters (tower bonuses in Phase 6)
- Siege damage tick every 10s: max(0, threat - defense) * 0.5
- Repair loop: 0.5 HP/sec per repairer (integer accumulator pattern)
- City HP bar on Warfront with color shift (green > 30 HP, red <= 30 HP)
- Threat/Defense indicator: shows "Threat X / Def Y" when under siege, "Defended" when safe
- `GameOverModal` component -- shown when city HP reaches 0, offers restart or continue watching
- `threatLevel` and `defenseLevel` exposed on GameContext

### Phase 4: Milestone Recruitment (COMPLETE)
- Created `src/types/milestones.ts` -- milestone definitions and `getNextMilestone` helper
- Milestones at 500/1000/2500/3500 total inspiration offering 3/3/2/7 villagers
- Created `MilestoneModal` component (`src/components/MilestoneModal.tsx`) with accept/reject
- Added `milestonesOffered: number[]` to GameState (tracks which thresholds have fired)
- Milestone check via `useEffect` on `totalInspirationEarned` changes
- `acceptMilestone` / `rejectMilestone` callbacks on GameContext
- Both accept and reject mark the milestone as offered (no repeat triggers)
- Save migration for `milestonesOffered` field in useStorage.ts

### Phase 5: Forage Train Button (COMPLETE)
- Added `BASE_GATHERER_CAP = 6` in foragers.ts -- gatherers trainable without Lodge
- Changed gatherer `unlocksAtLodgeLevel` from 1 to 0
- `getForagerCap(0)` now returns BASE_GATHERER_CAP instead of 0
- Removed hard `lodgeLevel <= 0` gate from `trainForager` (tier check handles it)
- Added Train ActionOrb on ForageScreen flanking the FORAGE orb (left side)
- Shows gatherer cost and current/cap count below the Train button
- Lodge still required for trappers (Lv3) and rangers (Lv5) and higher caps

### Phase 6: Draconia City Map (COMPLETE)
- Restructured Draconia tab from 3 zones to 5 wards:
  - THE KEEP: Draconia Keep (centered, top)
  - INNER WARD: Housing, Librarium, Wizard's Tower
  - CRAFT WARD: The Forge, Ranger's Lodge
  - OUTER WARD: The Garrison, Wayfinder's Outpost
  - CITY EDGE: Tower East, Tower West
- Added new BuildingId values: `housing`, `wizard`, `tower_east`, `tower_west`
- Added building colors to theme: housing (#c084fc), wizard (#e879f9), tower (#fb923c)
- New buildings show as "Coming soon" placeholders with `ComingSoonInterior` component
- Coming soon buildings open interior sheet directly (no purchase modal)
- Lodge and Outpost nodes conditionally rendered in their new wards

### Phase 7: Number Shrink (COMPLETE)
- Divided all inspiration-economy values by 20 (ratio: 1 insp/click -> 0.05 insp/click)
- Click power default: 1 -> 0.05
- Fighter insp rate: 0.25/s -> 0.05/s per fighter
- All costs, thresholds, research prices, and bonuses scaled by 1/20
- Food system values unchanged (separate economy)
- Fixed hardcoded gear bonus rates (0.1/0.05) in GameContext and useStorage -- now use SWORD_BONUS/SHIELD_BONUS constants
- Extracted food activation thresholds into named constants (FOOD_ACTIVATE_CONSCRIPTS, FOOD_ACTIVATE_BUILDINGS)
- Changed cost curve functions from Math.floor to 2-decimal precision (parseFloat/toFixed)
- Changed inspiration accumulator from integer-only to fractional awards
- Updated formatNumber() to show 2 decimal places for values under 1000
- Added roundInsp() utility for consistent 2-decimal rounding
- Added saveMigrationVersion field to GameState for save format tracking
- Save migration: divides pre-shrink values by 20, remaps milestone thresholds

---

## 2026-03-06 - Initial Release

- Core idle clicker mechanics
- Slay monsters for gold (now inspiration)
- Soldier system (Conscript/Footman/Knight tiers)
- Barracks, Armory, Forager's Lodge, Explorer's Post, Draconia Hall, Librarium
- Food system with foraging and consumption
- Wanderer encounters
- Research tech tree
- Offline earnings
- Dark theme with gold accents
