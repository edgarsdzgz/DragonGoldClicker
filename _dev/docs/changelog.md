# Dragon Gold - Changelog

## [Unreleased] - Siege Defense Redesign

### Chapter 4: Strangers at the Gate, wanderers reworked (2026-10-26)
- Mirael's scene now follows Sharpen Your Claws; the first wanderer is free (her own rations);
  quest Open the Gates: welcome 3 newcomers. The story pauses after it
- One wanderer every 4-7 minutes of play (twice as often under 5 idle villagers), on the play
  clock, so nobody arrives while the app is closed
- Every newcomer eats 10 food on arrival (the same rule as refugees); Welcome is disabled when
  the stores cannot pay. A rare Veteran (5%) arrives as a fighter with no Rally cost
- The wanderer card shows the stores before and after, and a veteran's meal cost; flavour lines
  rewritten for a dragon at the Gate. The old trained refugee and its overflow refund are gone

### The Dragon's Claws, layer 3 (2026-10-26)
- The player's own upgrade: nine levels of claws bought with renown, Fledgling (1 damage per
  tap) to Ancient (20, one tap kills an orc). Costs 5, 12, 25, 50, 100, 200, 400, 800
- A Claws chip on the Warfront footer opens the Claws sheet (the next level, its cost, Sharpen,
  and the whole track). A dot shows when the next level is affordable
- The claw slash grows with each level and turns gold, then ember, at the top levels
- Fighters do not use the claws; a Breach never takes them; nothing can be bought in debt
- Story: Pyreth's "Young Claws" after "The Wall Is Yours"; quest Sharpen Your Claws; a tutorial
  step points at the chip. The story pauses after it
- Retired: the avatar weapons (the War Hammer) and their Forge section; Settings shows the
  claws instead of weapons owned

### The wall, layer 6 phase B: the Breach (2026-10-26)
- Mend the Walls completes into Rodain's "The Wall Is Yours": his company stands down, the wall
  can now fall, and he says what it costs
- When the wall falls: 30% of fighters (at least 1), repairers and idle villagers die, 15% of
  foragers, 40% of the stores burn, renown is halved and then pays 5 per horde level (it can go
  negative, shown in red). Rally, repair and forager prices step back by the people lost
- The ancient magic pushes the horde back by half (at least 2 levels), the wall is patched to 50
  and a 90s ward stops all strikes (shown as "warded" on the wall bar). A fresh monster comes
- The first Breach plays a full scene (Rodain, then Pyreth); later ones a short one. Then a
  report lists every loss. A strong buzz when the wall falls
- Game over is gone: the player never loses the game. New reusable `ReportModal`; the
  starvation report uses it too
- Dev: Breach now

### The wall, layer 6 phase A: monsters strike the wall (2026-10-26)
- The monster at the gate strikes the wall every 5s while it stands: kobold 1, goblin 1.5,
  shadow crawler 2, orc 4. Its first strike comes 5s after it arrives, so a fast kill never
  touches the wall. Raiders run for the stores and never strike. Nothing strikes while away
- Replaces the old siege tick (threat minus defense every 10s)
- The horde's advance (`hordeKills`, save v10) drives the spawn pool instead of lifetime kills,
  so a Breach can push it back. Shown as a horde level (one per 25 kills) beside the wall's HP
- The wall bar is green, amber at half and red (pulsing) at a quarter, with the word beside it.
  Toasts warn at 50%, 25% (with a buzz) and 10% (Rodain, with a buzz)
- Story: Rodain's scene ("The Wall Shakes") follows Fill the Stores once the first gatherer is
  trained and sends the player to the Gate; then a new quest, Mend the Walls (direct 3
  repairers). Rodain's company still holds the wall at 50 HP; the story pauses after it
- Dev: Horde +1 level

### Performance: taps that seemed ignored (2026-10-26)
- Every Button, tab button, modal and sheet created its own audio player; opening the Dev tab built
  about 50 at once, froze the app for seconds and ran Android out of audio tracks. Sounds now use
  one shared player each (`hooks/sfxPlayers.ts`)
- The music player's 500ms status updates re-rendered the whole app (and re-applied the status
  bar) twice a second; the music now lives in its own component
- On the A16: the Dev tab opens within 0.5s (was 4s+), 0 audio errors (was 160), worst frames 89ms
  (was 450ms)

### Food, layer 3 phase C: food events (2026-10-26)
- Once the stores have been filled by hand, a food event comes every 10-15 minutes of play,
  timed ones announced a meal ahead (toast and a badge with a clock on the Forage tab and Warfront)
- Lean Season: gatherers bring in half for 3 meals. Bountiful Harvest: double for 3 meals
- Raid on the Stores: a raider (new, never from the spawn pool) comes to the gate; kill it within
  30s or it escapes with 20% of the stores
- Refugees at the Gate: take 3-5 in (more villagers, 10 food each on arrival) or turn them away
- Never the same event twice in a row; no raid on empty stores; events run on play time
- Dev buttons start each event

### Food, layer 3 phase B: fed states and rations (2026-10-26)
- Five rations for the fighters: none, quarter, half, full (default), double. They scale upkeep
  (0, 0.25, 0.5, 1, 2) and damage (0, 0.4, 0.7, 1, 1.4); none stands the fighters down
- Quarter and double are unlocked by new Librarium research (Lean Rations, Feast Hall); Dev can
  grant them
- Fed states: well fed (10 meals in store) +10%, hungry 50%, starving stands down
- The ration selector and the fighters' status sit on the Forage tab; the status also shows on the
  Warfront, replacing the old "Villagers are starving!" warning

### Food, layer 3 phase A (2026-10-26)
- Only the army eats from the stores (fighter 4, repairer 3, soldiers 4/6/10, explorer 2 per meal);
  villagers and foragers feed themselves, and only an unfed army can starve
- The meal bell rings every 2 minutes (was 30s); a gatherer brings 8 per meal and feeds two fighters
- The Forage tab shows a horizon ("Stores last about 14 min", "Stores grow by 4 each meal",
  "Granary full") and a small meal bell instead of a bar that empties every meal
- A granary of 500: food that does not fit is lost; FORAGE rests when the granary is full
- Food warnings no longer threaten deaths while starvation is off
- Time away never drains the stores below one meal

### Forage tab fixes (2026-10-26)
- The FORAGE orb sizes itself to its space; its glow no longer covers the TRAIN row
- Food, trips and counts show as whole numbers; one meal's cost keeps a half when there is one
- The meal line shows the real cost (fighters and repairers were left out) and the net per meal:
  "Stores shrink by 23 each meal". Settings stats and the wanderer pop-up had the same omission
- The top bar hides its food figure on the Forage tab; "+1 per tap"; "1/6 gatherers"
- "Foragers attract wandering survivors" shows only once wanderers can arrive

### The Forage tab starts with gathering only (2026-10-26)
- TRAIN gatherer appears once Fill the Stores is done (or the save has trained a gatherer)
- RECRUIT explorer appears once the Outpost is built; the locked "Build Outpost" slot is gone
- The Foraging journal card no longer mentions gatherers

### One press for every main button (2026-10-26)
- `useActionPress`: the battlefield and every orb (FORAGE, RALLY, REPAIR, TRAIN, RECRUIT) tap,
  hold, pulse and answer screen readers the same way
- One hold speed everywhere: a repeat every 750ms (the orbs were 250ms)
- Holding repeats only actions that do not spend (the strike, FORAGE); purchases are one per tap
- The orbs now work with a screen reader's activation (they only listened to finger-down)

### Food before the Breach (2026-10-26)
- Quests can have several goals; Hold the Line: rally 5 fighters and defeat a Shadow Crawler
- It completes into the rewritten "Our Stores Run Low": fighters eat twice what villagers do,
  the valley behind Draconia, and foraging means not defending the Gate
- Fill the Stores: gather 200 food by hand (gatherers do not count)
- Food now comes before the Breach and Repair; the story pause moved to after the food scene

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
