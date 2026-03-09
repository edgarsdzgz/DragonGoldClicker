# Dragon Gold - Changelog

## [Unreleased] - Siege Defense Redesign

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

### Phase 6: Draconia City Map (PENDING)
- Ward-based building layout
- New buildings: Housing, Wizard's Tower, Warfront Towers East/West

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
