# Dragon Gold - Changelog

## [Unreleased] - Siege Defense Redesign

### Pixel art in the game, step 4: Draconia (2026-10-27)
- Draconia is the city map: the Keep at the top, buildings along the road, the city wall at the
  bottom. Undiscovered plots are fog; revealed buildings stand in ruins until built, then show
  their level (the Garrison at levels 1, 3 and 5, the Lodge at 1 and 3, the Outpost upgraded)
- The Keep is restored at its last offline tier; the Forge's fire burns once it has made gear
- A marker shows a building you can afford to build, or one with something to do inside; screen
  readers hear both. Names and costs sit under the plots; tap a plot to open it as before
- Dev: a City Preview in Settings shows the map at the start, middle and end of the game

### Pixel art in the game, step 3: the Warfront (2026-10-27)
- The Warfront is the night map: blood moon, the horde's camp, the road, and the wall at the
  bottom with flickering torches. The gate shows the wall's HP: sound, cracking, failing, breached
- Monsters stand on the road in their own pixel art (kobold, goblin, shadow crawler, orc, raider):
  a walking bob, a red flash when struck, and a wounded pose at a third of their HP. The gold
  circle is gone for monsters with art
- Strikes are pixel effects: the slash in the claws' tier (steel, gold, ember), a spark, a crit
  burst on a double strike, and a flash for the army's hits
- The gate row keeps the wall's HP meter; the GATE bar is replaced by the drawn gate

### Pixel art in the game, step 2: icons (2026-10-27)
- Pixel icons replace the stock icons across the game: the tab bar, resource bar, objective,
  buttons, badges, sheets, cards and stats. Icons with no pixel art yet keep the old glyph
- Each building, study and claw tier shows its own icon; soldiers show the helm
- Disabled buttons, locked or unfocused tabs and unaffordable cards fade their icon

### Pixel art in the game, step 1: import and gallery (2026-10-27)
- The official pixel art is imported by `scripts/import-art.py` into `assets/art/` with a typed
  manifest (`src/art/manifest.ts`); rerun it after an approved art change
- Skia (2.2.12) draws the art sharp: whole screen pixels per art pixel, nearest-neighbor
- `PixelSprite` shows any sprite at a whole-number scale and plays strips at their own speed
  (held still with Reduce Motion); a dev-only Art Gallery in Settings shows every sprite
- Fix: the claws tutorial step no longer traps the player under the open claws sheet; it is now
  two steps, open the claws, then Sharpen

### Chapter 8: Dragonsteel, the claws past Ancient (2026-10-26)
- Kael's "Dragonsteel" scene comes a minute after the claws reach Ancient (once Mirael's chapter
  has played), with the quest Reforge the Claws. The story pauses after it
- Endless reforges past Ancient: each adds 5 damage; 1,000 renown for the first, 40% more for each
  after. Shown as "Ancient Claws +n"; the claws sheet shows the named track, the current reforge
  and the next, with a Reforge button. Saves need no change (claw level 9 is Ancient +1)

### Chapter 7: Beyond the Walls (2026-10-26)
- Mirael's "Beyond the Walls" is now the chapter's main beat, three minutes after Rodain's "They
  Come Bigger", in new words: the horde grows, so the city must too. Quests Raise the Outpost
  and First Expedition. The story pauses after it; every beat in the story is now live
- The Outpost on today's scale: 120/250/500 for 1/2/3 explorers; an explorer is trained from a
  villager for 10 renown (rising); an expedition costs 40 food (no renown) and takes 5 minutes.
  Finds are unchanged (0-3, sure after 3 empty, the first always finds someone). The report of
  who came home now always shows (it is kept in the save until read)
- The Librarium's fifth branch, The Wilds: Cartography (100, journeys 25% shorter) and Keen
  Scouts (250, empty journeys 35% down to 15%)
- Retired: Word Spreads (milestone newcomers; wanderers do that job) and Lean Times (starvation
  deaths; an unfed army stands down instead). Their dialogs and save fields are gone

### Fix: "Reassign all" moves everyone (2026-10-26)
- The Keep's "all" moved one person and stopped; it now moves everyone in one step (stopping at
  the forager cap or when nobody is left). Sharpening the claws and studying decide their sound
  and buzz from the rule checked first, so they never miss. Game actions no longer return a
  success flag (it was unreliable after the first update in a tap)

### Chapter 6: The Librarium, Lirae's studies (2026-10-26)
- Research rebuilt around the siege: 13 studies in four branches, bought with renown and in
  effect at once. The Dragon: taps +10%, a double strike on 1 tap in 10 (a larger gold number),
  taps +20% more. The Army: ranks 10% cheaper, swords 75% (was 50%), volleys +10%. The Stores:
  15% less eaten, quarter rations, foragers +25%, double rations. The Wall: repairers 25% faster,
  25% more renown while away, a Breach takes a third fewer people. No study raises the bounty
- The Librarium costs 200 (was 37.5). Exploration and mystery studies are removed until the
  outpost chapter; studies of the old tree in a save are ignored. The unused `clickPower` field
  is gone
- Story: Lirae arrives a minute after First Trappers (quests Raise the Librarium, First Study);
  Rodain's "They Come Bigger" follows a minute after the first study, in new words now that the
  horde really grows. The story pauses after it; the three old side beats stay paused
- The Librarium screen is split into tabs, a branch chain and a study card

### The balance pass (2026-10-26)
- The horde grows 5% a level: every monster's HP (whole numbers), bounty and wall strike rise
  together, so each HP still pays 0.05 renown. An orc at horde level 27 has 46 HP, pays 2.30 and
  strikes for 9.2. The army readout and time away measure the grown monster, so an army that held
  early may not hold later. A Breach pushes the horde back by half, and its strength with it
- 10 gatherers allowed without the Lodge (was 6), so 80 food a meal can feed an early army; the
  Lodge levels raise the cap to 14/18/22/26/30
- Removed the unused `lastWandererCheck` save field. Research is left as is until the Librarium
  chapter rebuilds it

### Chapter 5 phase C: The Keep Stands (2026-10-26)
- The Keep costs 150 renown (was 7.5). Time away now follows the army readout: an army that holds
  the Gate keeps the wall whole; one that does not lets the wall wear while you are away
  (repairers count), never below 50 HP, so you never return to a Breach. The Welcome Back card
  says which. Renown earned while away is unchanged
- Moving people between jobs, redone for one army: fighters, repairers, gatherers and explorers
  move freely or stand idle; a soldier stands down to a fighter (gear stays in the Forge); a
  trapper or ranger goes back to gathering. Free, no refund, no price steps back. Nobody moves
  out of idle there: rallying and training still cost
- The Ranger's Lodge promotes foragers like the Garrison promotes soldiers: gatherer (8 food a
  meal) to trapper (20, Lv1, from 15 renown) to ranger (40, Lv3, from 40). Levels cost
  30/75/150/300/600 and raise the forager cap to 10/14/18/22/26 (it used to drop to 4)
- Story: the Keep and the Lodge come out of the fog a minute after Arm the Ranks; quest Restore
  the Keep completes into Pyreth's "The Keep Restored"; Mirael's new "The Ranger's Lodge" follows
  with quests Raise the Lodge and First Trappers. The story pauses after it

### Chapter 5 phase B: Kael's Forge (2026-10-26)
- Swords: an armed soldier hits 50% harder (a knight 3 instead of 2). Shields: a shielded soldier
  never falls in a Breach. Gear is for soldiers only, one of each, and goes to the best ranks
  first; fighters carry none
- Prices: the Forge 75 renown (was 5); a sword from 15 and a shield from 20, each rising on the
  ^1.15 curve by how many the soldiers hold. The old renown-per-second gear values are gone
- In a Breach only the unshielded are counted for losses; the fallen are those without a sword
  first, and any swords they carried are lost. The report says how many shielded soldiers stood
- The Forge screen: armed and shielded counts, the army readout, and which rank the next piece
  goes to. The Draconia tab badge now follows the Garrison's real train and promote rules
- Story: Kael's "The Forge Is Cold" plays a minute after First Soldiers and reveals the Forge;
  quests Light the Forge and Arm the Ranks (forge 2 swords). The story pauses after it

### Chapter 5 phase A: A City to Build, the Garrison (2026-10-26)
- Soldiers are trained fighters: the Garrison trains a fighter into a conscript (10 renown) and
  promotes conscripts to footmen (30, Garrison Lv3) and footmen to knights (80, Lv5). They strike
  in the army's volley at the Gate for 0.5, 1 and 2, and eat 4, 6 and 10 a meal
- Nothing earns renown per second any more: soldier and gear income, the "+x/s" display and its
  stat are gone. Offline earnings come from the army's kill rate
- The Garrison costs 40/100/200/400/800 and holds 4/8/12/16/20 soldiers
- The army readout on the Garrison: "Your army kills an Orc in about 39 seconds. An Orc strikes
  the wall every 5", and whether the army holds the Gate while you are away
- Rations scale soldiers' food; a Breach takes 30% of each rank. The Warfront footer shows the
  army's damage per second
- Story: Pyreth's "A City, Not a Wall" follows Open the Gates and opens the Draconia tab; quests
  Raise the Garrison and First Soldiers. The story pauses after it

### Chapter 4: Strangers at the Gate, wanderers reworked (2026-10-26)
- Mirael's scene now follows Sharpen Your Claws; the first wanderer is free (her own rations);
  quest Open the Gates: welcome 3 newcomers. The story pauses after it
- One wanderer every 4-7 minutes of play (twice as often under 5 idle villagers), on the play
  clock, so nobody arrives while the app is closed
- Every newcomer eats 10 food on arrival (the same rule as refugees); Welcome is disabled when
  the stores cannot pay. A rare Veteran (5%) arrives as a fighter with no Rally cost
- The wanderer card shows the stores before and after, and a veteran's meal cost; flavor lines
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
