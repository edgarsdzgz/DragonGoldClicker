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

### Phase 1: Tab Locking System (PENDING)
- All 4 bottom tabs always visible
- Locked tabs show lock icon + "Locked" text
- Floating toast on locked tab tap with unlock requirement

### Phase 2: Fighters & Repairers (PENDING)
- Rally button on Warfront tab (garrison red, 25% size of Slay)
- Repair button (steel blue, unlocks at 3 fighters)
- Flat Fighter unit (0.25 insp/sec)
- Repairer unit (heals city HP, 75% food of fighter)
- ActionOrb component (25% HarvestOrb variant)

### Phase 3: City HP / Siege (PENDING)
- Draconia HP system (100 starting)
- Threat level milestones
- Damage when threat > defense
- Repair loop
- Game over at 0 HP

### Phase 4: Milestone Recruitment (PENDING)
- Villager groups at 500/1000/2500/3500 total inspiration

### Phase 5: Forage Train Button (PENDING)
- Train gatherers directly from Forage tab (no Lodge required)

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
