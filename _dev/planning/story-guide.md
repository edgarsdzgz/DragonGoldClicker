# Story Guide -- Plan A (Narrated Progressive Reveal)

**Date:** 2026-10-25
**Status:** PLANNED -- design confirmed by owner, not yet built
**Depends on:** number-shrink.md (values below use the /20 scale)

---

## Goal

A first-time player sees one button. Every other system is **off** and arrives as a
**story beat**: a short scene from a character, a pulse on the new control, and a one-line
objective. Systems that are random or timed (siege damage, hunger, starvation, wanderers,
expeditions, offline earnings) happen **once, scripted**, as part of their beat. Only after
that first scripted occurrence do they switch to their normal random behavior.

The arc runs roughly 3-4 hours of play to the end of current content.

### Owner rulings (2026-10-25)

1. **No early loss.** City HP has a floor of 50% until Chapter 12. The floor is diegetic:
   Captain Rodain's company holds the wall.
2. **New siege character:** Captain Rodain (from the Draconia Chronicles lore, see
   `DraconiaChronicles/refined-systems.md` line 214).
3. **Existing saves are preserved.** Story progress is backfilled from what the save has
   already done; nobody is reset.
4. **Scenes are skippable**, and every scene is re-readable in the Journal.

---

## Cast

| Character | Source | Voice | Role in the guide |
|-----------|--------|-------|-------------------|
| **Elder Pyreth** | In game already (`GameScreen.tsx` food intro) | Formal, warm, calls the player "my lord" | Narrator: city, food, rebuilding |
| **Captain Rodain** | Lore: "He arrives with a company of fifty. 'Where do you want us?'" | Clipped, practical, soldier's courtesy | Siege, fighters, repair; his company is the HP floor |
| **Scout Mirael** | In game already (explorer intro) | Alert, outward-looking | Strangers, wanderers, expeditions |
| **Kael Ironwright** | Lore: `refined-systems.md` lines 39-67 | Blunt, short sentences, forge metaphors | The Forge (Armory). Doc requirement: "requires training a Forger" |
| **Lirae the Ink-Wing** | Lore: "She doesn't fight. She remembers." | Bookish, enthusiastic, slightly clumsy | Arrives as the first Trained Refugee; unlocks the Librarium; keeper of the Journal's lore pages |
| **Thornwick, the Exiled Mage** | Lore: `refined-systems.md` line 213 | Wry, reckless | Later: found on an expedition, unlocks the Wizard's Tower |

`NpcDialog` takes an Ionicons name for `icon`: Pyreth `person`, Rodain `shield`,
Mirael `compass`, Kael `hammer`, Lirae `book`, Thornwick `sparkles`.

---

## The Beats

**Dwell** = minimum seconds of *active play* since the previous beat before this one may fire,
so a fast tapper cannot outrun the story. Target times assume a normal player.
**Silent** beats have no scene: they only reveal, spotlight, and set the objective.

| ID | Ch | Target | Trigger | Dwell | Speaker | Scripted first occurrence | Turns on | Objective |
|----|----|--------|---------|-------|---------|---------------------------|----------|-----------|
| `prologue` | 0 | 0:00 | `beatsSeen` empty | 0 | Pyreth | -- | `slay` | Slay 20 monsters |
| `call_to_arms` | 1 | ~0:30 | `inspiration >= FIGHTER_BASE_COST` | 20 | Pyreth | Spotlight Rally | `rally` | Rally 2 fighters |
| `the_breach` | 3 | after Fill the Stores | `fill_the_stores` done and a gatherer trained | 0 | Rodain | Screen shake; one fixed hit of 15 HP; the wall bar appears; monsters strike the wall from now (core-tap layer 6) | `siege` (floored at 50) | -- |
| `mend_the_walls` | 3 | right after | `the_breach` seen | 0 | *silent* | Spotlight Repair | `repair` | Mend the Walls quest: direct 3 repairers |
| `the_wall_is_yours` | 3 | Mend the Walls done | quest completes into it | 0 | Rodain | Says what a Breach costs | `threatUnfloored` (the wall can fall; a Breach follows) | -- |
| `sharpen_claws` | 3 | right after | `the_wall_is_yours` seen | 30 | Pyreth | The Claws chip appears (core-tap layer 3) | -- | Sharpen Your Claws quest: buy the first level |
| `empty_stores` | 3 | ~15:00 | `repairers >= 3` | 180 | Pyreth | First meal check fires 10 s after dismiss and shows the food drop | `hunger`, `forageTab`, food in ResourceBar, food warnings | Train 2 gatherers |
| `strangers_at_gate` | 4 | after the claws | Sharpen Your Claws done | 60 | Mirael | A free **Lone Wanderer** (Mirael's rations) arrives right after the scene | `wanderers` | Open the Gates quest: welcome 3 newcomers |
| `a_city_to_build` | 5 | after Open the Gates | Open the Gates done | 60 | Pyreth | Draconia shows **only the Garrison**; everything else is fog | `draconiaTab` | Quests Raise the Garrison, then First Soldiers (train 2 conscripts) |
| `the_smith` | 5 | after First Soldiers | First Soldiers done | 60 | Kael | Forge revealed; spotlight the Draconia tab | reveal `forge` | Quests Light the Forge, then Arm the Ranks (forge 2 swords). The story pauses after it |
| `the_keep_stands` | 5 | ~55:00 | `armoryBuilt` | 60 | *silent* | Keep and Ranger's Lodge revealed | reveal `keep`, `lodge` | Restore the Keep |
| `word_spreads` | 6 | varies | `totalInspirationEarned >= 25` | 0 | Pyreth | The existing MilestoneModal follows the scene | `milestones` | -- |
| `lean_times` | 7 | ~1:00 | first time `food <= 0` while `hunger` is on | 0 | Pyreth | **No deaths.** The scene replaces the StarvationModal | `starvation` | Get food above 0 |
| `beyond_the_walls` | 8 | ~1:30 | `shouldRevealExplorerPost(state)` | 300 | Mirael | **First expedition always succeeds** (at least 1 villager) | `expeditions`, reveal `outpost` | Send an expedition |
| `the_keep` | 9 | ~2:00 | `draconiaHallBuilt` | 0 | Pyreth | The first return after 60 s or more away shows a framed OfflineModal | `offline`, `reassignment` | -- |
| `the_scholar` | 10 | ~2:30 | `the_keep` seen | 600 | Lirae | Arrives as a scripted **Trained Refugee** | reveal `librarium`; Journal gains the Lore tab | Build the Librarium |
| `the_horde_grows` | 11 | ~3:00 | `completedResearch.length >= 1` | 300 | Rodain | -- | none (the floor is lifted by `the_wall_is_yours`; this scene needs new words) | -- |
| *later* | 12+ | 3:00+ | expedition finds / refugees | -- | Thornwick and others | Same pattern | Wizard's Tower, Housing, Towers | -- |

**Side beats** fire whenever their own trigger passes and never block later beats:
`word_spreads`, `lean_times`, and `beyond_the_walls` (ruled 2026-10-25 after review: as a main
beat it stalled `the_keep` and everything after it for players who never revealed the
Explorer's Outpost). All other beats fire strictly in table order.

**Fallback:** if `lean_times` has not fired by the time `the_keep` fires, it fires then,
with an alternate line ("Our stores have held so far, but it will not always be so"), so starvation
cannot stay off forever.

### Draft lines

One to three lines per scene. These are drafts for the owner to edit.

**prologue** (Pyreth, "The Walls of Draconia")
1. My lord, the monsters have reached the walls.
2. Strike them down. Every one you slay gives our people the courage to stand.

**call_to_arms** (Pyreth, "A Spark of Courage")
1. You have given them hope. Some of our villagers are ready to take up arms.
2. Rally them, and they will fight beside you, even while you rest.

**the_breach** (Rodain, "The Wall Shakes"; superseded 2026-10-26 by layer 6, live text in
`data/story/lines.ts`)
1. The stores are full, Steward, and none too soon. The horde has stopped waiting at the Gate.
2. Captain Rodain, and fifty swords behind me. Where do you want us?
3. Every monster left standing at the Gate strikes the wall. Kill them fast and they never touch the stone.
4. Its strength shows above the Gate. My company will hold it for now, but the wall must be mended.

**empty_stores** (Pyreth, "Our Stores Run Low"): a shortened version of the existing food speech
at `GameScreen.tsx:103-109`; keep its last line.

**strangers_at_gate** (Mirael, "A Stranger on the Road")
1. A traveler on the east road, alone and half-starved.
2. Every soul we take in is another mouth to feed, and another pair of hands. The choice is yours.

**a_city_to_build** (Pyreth, "A City, Not a Wall")
1. Draconia was a city once, my lord, not only a wall. Let us begin to rebuild it.
2. Captain Rodain's soldiers need a garrison. Start there.

**the_smith** (Kael, "The Forge Is Cold")
1. Kael Ironwright. My father kept the forge here.
2. Look, I can hit metal with a hammer. That's about where we're at.
3. Give me a roof and some coal, and your soldiers will have something better than sticks.
4. A sword makes a soldier hit harder. A shield keeps one standing when the wall comes down.

**word_spreads** (Pyreth, "Word Spreads")
1. Word of Draconia's stand has reached the villages beyond the hills. People are coming.

**lean_times** (Pyreth, "Lean Times")
1. The stores ran dry last night. We buried no one, but only by luck.
2. If it happens again, people will die. Keep the foragers working.

**beyond_the_walls** (Mirael): the existing explorer intro at `GameScreen.tsx:133-138`.

**the_keep** (Pyreth, "The Keep Restored")
1. With the Keep restored, the city can tend itself while you rest. I will keep the ledgers.

**the_scholar** (Lirae, "The Ink-Wing")
1. Oh! Sorry, I didn't mean to... is this Draconia? I'm Lirae. I keep records. Kept. Keep.
2. I don't fight. I remember. And there is so much here worth remembering.
3. If you give me a library, I can give you everything the old world knew.

**the_horde_grows** (Rodain, "Fifty Became Thirty")
1. My company is spent, Steward. Fifty became thirty.
2. From here, the wall is yours to keep. Do not let it fall.

---

## How the Systems Change

Each system gets one guard (`isSystemOn(state, id)`) at the top of its tick. When the guard is
on, the system behaves exactly as it does today.

| System | Today's gate | New gate | File |
|--------|--------------|----------|------|
| Siege tick | `prev.hpUnlocked` (never set) | `siege`; HP is clamped to the floor (50) until `threatUnfloored` | `GameContext.tsx:356-370` |
| Threat level | fixed at 1 (early return) | remove the early return when `siege` is on; balance in the pacing pass | `siege.ts:45` |
| Repair | `fighters >= REPAIR_UNLOCK_FIGHTERS` | `repair` | `GameContext.tsx:506`, `GameScreen.tsx:76` |
| Food consumption | `foodSystemActive` | `hunger` | `GameContext.tsx:254` |
| Starvation deaths | food <= 0 | `starvation`; before that, the `lean_times` beat fires instead | `GameContext.tsx:280-330` |
| Food activation | Garrison + Forge, or 4 conscripts | **removed**; `empty_stores` turns hunger on | `GameContext.tsx:80-89, 443-449` |
| Wanderers | `foodSystemActive` | `wanderers` | `GameContext.tsx:412` |
| Milestones | always | `milestones` | `GameContext.tsx:434-439` |
| Explorer intro | `explorerIntroShown` | becomes the `beyond_the_walls` beat | `GameContext.tsx:452-458` |
| First expedition | random, pity after 3 | forced success on the first expedition | `GameContext.tsx:793` |
| Offline earnings | always | `offline` (the Keep), matching game-flow.md | `useStorage.ts:118` |
| Tab locks | 3 repairers / 3 gatherers | `forageTab` / `draconiaTab` | `useTabLocks.ts` |
| Building visibility | per-building `visible` expressions | `isBuildingRevealed(state, id)` | `ShopScreen.tsx:342-489` |

`hpUnlocked`, `foodSystemActive` and `explorerIntroShown` stay in the save for one version
(the migration reads them) and are then removed in a later cleanup.

---

## Architecture

### Files

| File | Contents | Target size |
|------|----------|-------------|
| `src/types/systems.ts` | `SystemId` and `BuildingRevealId` unions, `isSystemOn`, `isBuildingRevealed`, `HP_FLOOR` | ~80 lines |
| `src/types/story.ts` | `BeatDef` type, `STORY_BEATS` (triggers, dwell, unlocks, objective; no prose) | ~150 lines |
| `src/data/story/lines.ts` | Scene text keyed by beat id (speaker, icon, title, lines, journal entry) | prose only |
| `src/types/storyMigration.ts` | v1 -> v2 backfill (see below) | ~80 lines |
| `src/hooks/useStoryDirector.ts` | Once per second: find the next beat whose trigger passes and whose dwell has elapsed, and queue it. Runs scripted first occurrences. | ~120 lines |
| `src/components/EventHost.tsx` | The only place pop-ups are shown; replaces the `activeModal` chain at `GameScreen.tsx:79-88` and is mounted in `navigation/index.tsx` so it works on every tab | ~150 lines |
| `src/components/ObjectiveStrip.tsx` | One line below the ResourceBar: icon, label, `current/target` | reusable |
| `src/components/Spotlight.tsx` | Wraps any control; pulsing ring while `active`; clears on first press | reusable |
| `src/components/JournalSheet.tsx` | `BottomSheet` with Story / How It Works / Lore (after Lirae) tabs; only revealed content | reusable |
| `src/hooks/useScreenShake.ts` | Shake used by `the_breach` | small |

All new components are exported from `src/components/index.ts`. The director lives
**outside** `GameContext.tsx`: that file is already 1290 lines (target ~150, split at 300),
and this feature must not grow it. GameContext exposes only the guards and the scripted-event
actions the director calls.

### BeatDef

```ts
interface BeatDef {
  id: BeatId
  chapter: number
  trigger: (s: GameState) => boolean
  dwellSec: number            // active play seconds since the previous beat
  unlocks: SystemId[]
  reveals?: BuildingRevealId[]
  scripted?: ScriptedEventId  // 'breachHit' | 'firstMeal' | 'loneWanderer' | ...
  spotlight?: SpotlightTarget // 'rally' | 'repair' | 'forageTab' | ...
  objective?: ObjectiveDef    // { label, current: (s) => number, target }
  silent?: boolean            // no scene
}
```

### Save changes (`saveMigrationVersion` 1 -> 2)

- **Add** `beatsSeen: string[]`, `playSeconds: number` (active play only, ticked by the game
  loop), and `lastBeatAtPlaySec: number`.
- **Derive** every system flag from `beatsSeen`. Do not store separate booleans; there is then
  only one source of truth.
- **Backfill (ruling 3):** walk `STORY_BEATS` in order and mark a beat seen if its trigger
  is already satisfied **or** the save already uses something a later beat turns on
  (for example, `foodSystemActive`, `postLevel > 0`, `draconiaHallBuilt`). Backfilled beats show
  no scene but do add their Journal entries. Stop at the first beat that fails both tests.
  - Example, the owner's current save (3 fighters, 3 repairers, 3 gatherers, no buildings):
    it backfills through `a_city_to_build`; the next live beat is `the_smith` (Kael) when
    the Garrison is built.

### Event queue

One FIFO queue with priorities, consumed by `EventHost`:
`gameOver` > `offline` > story scene > `starvation` > `foodWarning` > `milestone` > `wanderer`.
A story beat whose scripted event shows a pop-up (wanderer, milestone, offline) enqueues the
scene first, then the pop-up, so they never stack.

**Ruling after group 1 review (2026-10-25):** event payloads (pending starvation report, food
warning, wanderer encounter) live in the state the pure updater returns, so each decision and
its result are computed from `prev` together. Game over is derived
(`siege` on and `cityHp <= 0`), not stored as a separate flag. Deciding from a post-commit
`stateRef` was rejected: it misses updates queued earlier in the same frame by other loops.

**Fix while moving this:** several events are currently set from inside `setState` updaters
(for example, `setPendingWanderer` at `GameContext.tsx:425`, `setPendingFoodIntro` at `:446`).
React may run updaters twice in development, which can fire an event twice. The director and the
ticks must decide on events outside the updater and enqueue after the state change.

### Guided tutorial: coach marks (owner rulings 2026-10-25)

For the first minutes of play the game **dims the whole screen except the one control the
player should press**, blocks taps everywhere else, and shows a one-line hint next to the
target. This replaces the spec's original "pulsing ring" for these steps; the ring remains for
later, lighter guidance.

- **No skip.** Every player installs fresh, so everyone goes through the guided steps. (Scene
  text stays skippable per ruling 4; the guided step that follows still runs.)
- **Dialogue** uses the draft lines in this spec as written.

**Guided steps** (in order; each starts after its beat's scene is dismissed):

| Step | After beat | Target | Hint | Done when |
|------|------------|--------|------|-----------|
| `tap_slay` | `prologue` | SLAY orb | Tap SLAY to strike the monsters. | first slay |
| `tap_rally` | `call_to_arms` | Rally orb | Rally a villager to fight beside you. | `fighters >= 1` |
| `tap_repair` | `mend_the_walls` | Repair orb | Send a villager to mend the wall. | `repairers >= 1` |
| `open_forage` | `empty_stores` | Forage tab button | Open the Forage tab. | Forage tab focused |
| `tap_forage` | `open_forage` | FORAGE orb | Gather food for the city. | first forage |
| `train_gatherer` | `tap_forage` | Train orb | Train a gatherer to forage for you. | `gatherers >= 1` |
| `open_draconia` | `a_city_to_build` | Draconia tab button | Open the Draconia tab. | Draconia tab focused |
| `tap_garrison` | `open_draconia` | Garrison node | Tap the Garrison. | its purchase sheet opens |
| `build_garrison` | `tap_garrison` | Build button in the sheet | Build the Garrison. | `barracksLevel >= 1` |

**Behavior:**
- **Targets register themselves.** A control opts in with a `useCoachTarget(id)` hook that
  reports its on-screen rectangle (`measureInWindow`, re-measured on layout and scroll). A step
  shows only once its target is registered and visible; until then nothing dims.
- **The overlay:** four dim rectangles around a cutout, plus a highlight ring on the cutout. The
  cutout passes taps through to the real control; the dim area swallows taps.
- **Pop-ups win.** While any EventHost pop-up or scene is showing, the overlay hides, and it
  returns afterwards.
- **Saved progress:** `tutorialStepsDone: string[]` in GameState. Backfill marks a step done if
  its "done when" already holds, so existing saves are never trapped in a step.
- **Accessibility:**
  - The overlay is modal to screen readers (`accessibilityViewIsModal`), and the hint is
    announced when a step starts.
  - With Reduce Motion on, the ring does not pulse.
  - The hint text meets contrast on the dim background.
- **Dev tab:** a "Reset tutorial" control, plus each step's state shown in the Story list.

### Skipping (ruling 4)

`NpcDialog` gains a **Skip** action that closes the scene at any line. The beat still counts
as seen and its Journal entry is still written.

### Dev tools (`__DEV__` only, Settings > Dev)

**Owner ruling (2026-10-25):** the hours-long pacing stays off until balance is proven. Dev
builds default to **test pacing**; live pacing is opt-in from the Dev tab.

Built in group 0 (2026-10-25):
- **Story pacing switch** (`DevSettingsContext`: `pacing: 'test' | 'live'`). Group 1's director
  reads it: test pacing caps every `dwellSec` at a few seconds. Release builds always report live.
- **Game speed** 1x / 5x / 20x / 100x. `useGameLoop` runs `speed` game seconds per real second,
  so all tick-based timers keep their ratios. Expeditions use wall-clock time and are not scaled.
- **Grants:** +10 / +100 inspiration, +100 food, +5 villagers, repair wall.
- **System toggles:** today's `hpUnlocked` and `foodSystemActive` flags (replaced by beat-derived
  switches in group 1).
- **Force events:** wanderer now (`rollWandererEncounter`, no chance roll), next milestone, food
  check now, empty food stores, damage wall 15, finish expeditions.
- **Checkpoints:** named snapshots of the full state in `@dragongold/dev_checkpoints`, loaded
  through a confirm dialog.

Added in group 1, when the story exists:
- **Jump to beat:** applies every beat up to the chosen one as if backfilled.
- **Reset story:** clears `beatsSeen` without touching the economy.
- **Replay scene:** shows one beat's scene again without changing state.
- **Pacing log:** records `playSeconds` when each beat fires and shows it next to the target
  time, so every playtest produces balance data.
- **Simulate time away:** for testing offline earnings and the `the_keep` framing.

### Balance simulator (before group 4)

A Node script (`scripts/balance-sim.ts`) that plays the economy without the phone, using the
pure functions in `src/types/` (costs, rates, threat, food) and a simple strategy ("buy the
cheapest useful thing; slay at N taps per second"). It prints when each beat would fire next to
its target time. Balance changes are checked in seconds; the phone confirms feel. Requires the
beat triggers to stay pure functions of `GameState`.

---

## Build Order

Five groups, one builder per group, in order. Each group ends with a playable build on the
phone.

0. **Test tools.** [COMPLETE 2026-10-25, uncommitted] The Dev tab described above, plus the
   Vibration setting (player-facing, in Sound & Vibration) and the save fix (saves were
   debounced and never fired while auto-income ticked; now throttled to every 2 s and saved on
   background).
1. **Foundation.** `systems.ts`, `story.ts` (triggers only), migration v2 + backfill,
   `playSeconds`, `useStoryDirector`, `EventHost`, and every gate change in the table above.
   Scenes use the existing `NpcDialog` with placeholder lines. The updater side-effect fix
   goes here.
2. **Guide UI** (built together with group 3 in one pass, ruled 2026-10-25). The coach-mark
   guided tutorial (above), `ObjectiveStrip`, `Spotlight` ring for later beats, `JournalSheet`,
   `useScreenShake`, fogged building nodes on the Draconia map, and the dev controls.
   (`NpcDialog` skip was done in group 1.)
3. **Content and scripted events.** All scene lines, the HP floor, breach hit, first meal, lone
   wanderer, lean times, first-expedition success, Kael, Lirae as Trained Refugee, and the
   offline framing.
4. **Pacing pass.** Build the balance simulator first. Turn threat scaling back on and tune
   costs and dwell against the target timeline in the simulator, then confirm on the phone
   with live pacing. Only then is live pacing the default.

No test framework is installed (`package.json` has only `typescript` and `@types/react`).
Group 1 should add Jest for the pure functions (`isSystemOn`, triggers, backfill), since a
backfill bug would silently skip or replay story for existing players.

---

## Known Bugs to Fix Along the Way

- `ShopScreen.tsx:330`: the Librarium reveal uses `totalInspirationEarned >= 2000`, which was
  not divided by 20 in the number shrink (should be 100). Superseded by `the_scholar`, but fix
  it if group 1 ships first.
- "N.00 monsters slain": a whole-number count is formatted with two decimals.
- `game-flow.md` still shows the pre-shrink numbers.

## Open Questions

1. Does Rodain's company give any bonus beyond the HP floor (for example, +defense) while it holds?
2. Should characters get portraits, or stay Ionicons for now?
3. After `the_horde_grows`, should game over really wipe the save, or roll back to the last
   chapter?
