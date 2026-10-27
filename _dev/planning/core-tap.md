# Core Tap Rework -- Depth Before Breadth

**Date:** 2026-10-25
**Status:** PLANNED, layers 1-2 approved by owner
**Why:** In the first playtest the owner was "instantly overwhelmed by mashing on everything."
Systems arrived within minutes, the Warfront overflowed (its rows overlap on a Galaxy A16), and
the core action was just a button that made a number go up. Ruling: rebuild the tap first,
and add no new mechanics or screens until the tap is fun.

---

## Layer plan

| Layer | What | Status |
|-------|------|--------|
| 0 | Pause the story after Rally; fix the Warfront layout | this pass |
| 1 | Tap feel: floating numbers, squash, flash, kill haptic | this pass |
| 2 | A monster with an HP bar in the SLAY spot; inspiration paid on kill | this pass |
| 3 | Tap upgrades: one track (the dragon's claws) | approved and built 2026-10-26 |
| 4 | Rhythm: combo multiplier that decays, occasional crits | later |
| 5 | Fighters damage the same monster (visible small hits) instead of a separate insp/s | done in 2e |
| 6 | The wall: monsters not killed in time hit the wall; Repair matters; the Breach | approved 2026-10-26; phases A and B built |

Food, foraging, Draconia, wanderers, milestones and the journal wait until layers 1-5 feel
good. Story beats get re-pointed at these layers later ("your first kill", "Kael forges your
first claws").

---

## Layer 0: pause and layout

**Story pause.**
- Only `prologue` and `call_to_arms` fire. Every later beat is paused by one constant
  (`STORY_PAUSED_AFTER = 'call_to_arms'`).
- The director, backfill and Jump to beat all respect the pause.
- Systems, tabs, guided steps and objectives behind paused beats stay off.
- Changing the constant resumes the story. Nothing is deleted.

**Warfront layout.**
- Size the battle circle to fit the space that is actually left (between about 180 and 260dp)
  instead of a fixed 260dp.
- The command row (Rally, Repair) never overlaps it.
- Hide the top bar's inspiration figure on the Warfront, where the big number already shows it.
- When both the objective line and the HP bar are visible, show them as one compact row.
- Must fit without overlap on a 360x640dp screen and on the Galaxy A16 (about 411x891dp).

## Layer 1: tap feel

- **Floating numbers.** A number rises and fades from the tap point: damage dealt (for example
  "-1"). On a kill, a gold "+0.25" rises from the monster.
- **Squash and flash.** The circle squashes about 5% on press and springs back. The monster
  flashes and shakes on each hit.
- **Haptics.** Light on each hit, medium on a kill. Both respect the Vibration setting.
- **Sound.** Keep today's click; add a short kill sound if one exists in `src/data/sfx.ts`.
  Otherwise reuse the click at a different rate.
- **Reduce Motion.** No shake and no squash. Numbers fade without rising.
- **Performance.** At most 8 floating numbers at once (oldest recycled). Use the native driver
  for animations. Hold-to-repeat (4 taps/s) must stay smooth.

## Layer 2: the monster

- The SLAY circle shows the current monster: an Ionicons glyph, a name, and an HP bar under
  it. The HP is shown as a number too, not only the bar.
- Each tap deals `tapDamage` (starts at 1). At 0 HP the monster dies: the inspiration bounty
  is paid, the kill counter goes up by 1, and the next monster enters after a short beat
  (about 250ms, no input lost).
- **Pacing kept:** about 0.05 inspiration per tap at the start, so the first Rally (1.00)
  still takes about 20 taps.

| Monster | Glyph | HP | Bounty | Appears |
|---------|-------|----|--------|---------|
| Kobold | `paw` | 5 | 0.25 | kills 0-9 |
| Goblin | `skull` | 8 | 0.40 | kills 10-24 |
| Shadow Crawler | `bug` | 12 | 0.60 | kills 25-49 |
| Orc | `flame` | 20 | 1.00 | kills 50+ |

  These numbers are provisional; balance comes with the simulator.
- **Saved state:** `monsterIndex` (kills so far decide the type) and `monsterHp` (remaining)
  in GameState, migration v4. An existing save starts on a fresh monster of its tier.
- **`monstersDefeated` counts kills only.**
  - Auto-income no longer adds 1 per second.
  - Offline earnings no longer add kills.
  - Display it as a whole number.
  - The prologue objective "Slay 20 monsters" now counts real kills. Retarget it to
    "Slay 5 monsters" so it fits the new pace.
- **Fighters (until layer 5):** keep earning inspiration per second as today. They do not
  damage the monster yet.
- **Flavor lines:** show one on some kills (about 1 in 4), instead of every 40-80 taps.
- **Accessibility.**
  - The circle's label includes the monster name and HP ("Kobold, 3 of 5 HP. Tap to strike").
  - Kills are announced politely, at most once every 2 seconds.

---

## Layer 2b: the gate, waves, legible HP (approved 2026-10-25)

The Warfront becomes a scene read top to bottom along the monsters' path: they come from the
top, and the gate sits at the bottom by the player's thumb.

```
| 12.40 insp                [book] |  top bar: inspiration shown again on Warfront
| WAVE 3         4 kobolds left    |  wave row (+ objective / scene hints)
|      .  .  o   (queue, dim)      |  next monsters as dim silhouettes (max 4 shown)
|           [KOBOLD]               |  current monster, the whole battlefield is the tap target
|         [#][#][#][ ][ ]          |  its HP, directly above or below it
|  ============ GATE ============  |  the gate; its HP bar shows only once `siege` is on
|     [ RALLY ]   [ REPAIR ]       |  commands near the thumb
```

- **Remove the big inspiration number.** It replaced the old "hero number" decision. The top
  bar's inspiration figure comes back on the Warfront; kill coins fly to it.
- **Tap target:** the entire battlefield area (between the wave row and the gate). Damage
  numbers rise from the monster.
- **Enemy HP:**
  - Pips when max HP <= 12 (one pip per HP).
  - Above that, a continuous bar with "current/max" text.
  - A trailing chunk: the HP just lost shows white for about 400ms, then drains.
  - HP is always also given as text to screen readers.
- **Kill:** the monster falls (fade and drop). A coin flies from it to the top-bar inspiration
  figure, and the figure pulses on arrival. With Reduce Motion, nothing moves: the coin and
  the pulse just fade.
- **Waves:**
  - Each wave is 5 monsters of one type. The type follows the existing kill thresholds:
    waves 1-2 kobold, 3-5 goblin, 6-10 shadow crawler, 11+ orc.
  - The wave row shows "Wave N" and "K <type plural> left".
  - Clearing a wave shows a "Wave cleared +X" banner for about 1.5s and pays a bonus of
    2x that wave's single bounty (kobold wave: +0.50).
  - Taps during the banner are ignored, and holding continues into the next wave.
  - Save `waveNumber` and `waveKills` (GameState, migration v5). A loaded save resumes
    mid-wave.
- **Pacing check:** the first Rally (1.00) still comes at the 4th kill (20 taps). The first
  wave bonus arrives at kill 5.
- **Not yet:** bosses, timers, monsters advancing, gate damage. Those are layer 6.
- **Hold:** keep hold-to-repeat, but make it visible: a steady pulse on the battlefield while
  holding (no pulse with Reduce Motion).
- **Copy:** neutral ("Tap to strike"). Whether the player is the dragon or a commander is
  undecided.

---

## Layer 2c: the player starts each wave (approved 2026-10-25)

**Owner ruling:** the enemy army is camped outside the walls. The player presses a button to
make it attack in a wave. When the wave is defeated it ends, and no other enemy attacks (for
now) until the player begins the next wave.

- **States:** `camp` (between waves) and `wave` (fighting).
  - Saved as `waveActive` in GameState, save v6.
  - Migration: `waveActive = waveKills > 0`, so a save that was mid-wave resumes mid-wave.
  - A new game starts in `camp`.
- **Camp view** (the battlefield, in place of the monster):
  - The next wave as a row of dim silhouettes of its monster type (5, using `MonsterIcon`),
    with the line "The horde waits beyond the walls."
  - A preview: "Wave N: 5 <plural>" and "+X when cleared" (the wave bonus).
  - A large primary **Begin wave** button, centered where the monster stands. It must be at
    least 48dp tall and is the only tappable thing in the camp view.
  - Taps elsewhere on the battlefield do nothing: no damage, no effects, no sound.
  - The wave row reads "WAVE N" with "Ready" in place of "K left".
- **Begin wave:** the first monster enters (the existing spawn), and from then on it is the wave
  as built in layer 2b.
- **Wave cleared:** the existing banner and bonus. When the banner ends the view returns to
  `camp` for wave N+1. Holding stops at the end of the wave and does not carry into the camp.
- **Fighters** keep earning inspiration per second in both states.
- **Guided tutorial:** a new step `begin_wave` after `prologue` targets the Begin wave button
  (hint: "Begin the first wave."). `tap_slay` follows it once the first monster is on the field.
  Backfill marks `begin_wave` done for any save with `monstersDefeated > 0` or `waveActive`.
- **Accessibility:**
  - The button label reads "Begin wave N, 5 <plural>".
  - The camp line and the preview are text.
  - Starting a wave announces "Wave N begins".
- **Not yet** (layer 6): waves that start on their own, timers, monsters advancing on the gate.

---

## Layer 2d: the opening, and renown (approved 2026-10-25)

Owner rulings, from their direction for a fresh install:

1. **Nothing but the Wave button.** A fresh install shows only a **Begin Wave 0** button, and
   it is the only thing highlighted (the coach mark ring; there is nothing else to dim).
   Hidden: top bar, objective line, wave row, chips, footer, gate, tab bar and every scene.
   Pyreth's `prologue` scene is removed; the beat becomes silent.
2. **Wave 0 is 3 kobolds.** Normal waves of 5 start at Wave 1. Monster type follows the wave:
   waves 0-2 kobold, 3-5 goblin, 6-10 shadow crawler, 11+ orc. Wave 0's clear bonus is 2x the
   kobold bounty (+0.50).
3. **During the wave: only the kobold and the gate.** The monster (silhouette and HP pips) and
   the gate at the bottom. No name label, no wave row, no footer, no top bar until the first
   kill.
4. **Renown replaces inspiration** as the player-facing currency.
   - Kills, wave bonuses, fighters and costs are all shown as renown. Every visible
     "inspiration" and "insp" becomes "renown", including scenes, journal cards, buttons, stats
     and announcements.
   - Its icon is a gold star (Ionicons `star`); the kill reward flies to the counter as a star.
   - **This pass renames only what the player sees.** Internal identifiers (`inspiration`,
     `totalInspirationEarned`, `InspirationIcon` and the rest) stay for now, each with a comment.
     A separate refactor renames them with a save migration.
5. **The first kill explains renown.**
   - The top-bar renown figure appears as the first star arrives.
   - Then a scene: Elder Pyreth, "Renown". Lines:
     "Your victory echoes through Draconia, my lord. Defeating our enemies in battle earns you
     renown." / "The more foes you defeat, the more renown you gain, and the more the people
     and the elders of Draconia will listen to you."
   - After the scene the wave continues.
6. **Skip only for multi-page scenes.** A scene with one page shows only its Continue button. A
   scene with two or more pages (a cutscene) shows Continue and Skip.
7. **Reveal order:**
   - The renown figure arrives at the first kill.
   - After Wave 0 clears: the camp preview for Wave 1, the wave row and the footer.
   - With `call_to_arms`: the objective line, the villager and fighter chips, and the tab bar.
   - **Owner ruling (2026-10-25), replacing "right after Wave 0":** "jumping from clicking on a
     wave to immediately rallying is too fast; have some waves first." So `call_to_arms` fires
     when Wave 2 has been cleared and the player is back in camp, before the first goblin wave:
     - Trigger: `waveNumber >= 3 && !waveActive`, with dwell 0 so it plays at once in that camp.
     - By then: 13 kobold kills, about 4.75 renown. Rally costs 1.00.
     - Until then, Waves 0-2 show only the battlefield, the gate, renown, the wave row and the
       footer.
8. **Testing:** with the UI hidden, playtest builds (`DEV_TOOLS_ENABLED`) keep a small,
   labeled Dev button in a top corner that opens Settings > Dev. Player builds do not have it.

**Guided steps:** `begin_wave` is now the first step (target: the Begin Wave 0 button, hint
"Begin the first wave."). `tap_slay` (hint "Tap the kobold to strike it.") follows once a
monster is on the field.

---

## Layer 1b: the hit you can see (approved 2026-10-25)

**Owner ruling:** the player is the dragon, so strikes are claw slashes. Copy can say "claw"
and "strike".

**Art** (already in the repo, generated by `scripts/art/kobold.py` and `scripts/art/effects.py`;
white on transparency, tinted at render time, same 600px footprint for every pose):
- `assets/monsters/kobold_idle.png`, `kobold_hit.png` (head thrown back, spear knocked back,
  body lifted) and `kobold_hurt.png` (hunched, snout drooping).
- `assets/fx/fx_slash.png` (three curved claw rakes), `fx_spark.png` (four-point star),
  `fx_ember.png` (soft glow).

**Monster poses:**
- `MONSTER_ART` maps each monster id to `{ idle, hit?, hurt? }`. Monsters without art keep
  their glyph. `MonsterIcon` takes a `pose` and falls back to `idle` when that pose is missing.
- **Idle breathing:** a slow scale/translate bob of about 2% over about 1.5s.
- **Hit:** show the hit frame for about 120ms on each strike, then return to idle or hurt.
- **Hurt:** the resting frame once HP <= 1/3 of max; breathing becomes faster and uneven.

**Per strike** (all native-driver, pooled, never more than the caps):
- **Hit-stop:** the monster holds still for about 50ms at impact (delay the knockback), then
  runs the knockback.
- **Knockback:** about 6% of the sprite size upward (away from the gate) and 3-5 degrees of
  tilt, springing back over about 180ms.
- **Claw slash:** the slash sprite at the tap point, rotated to a random angle in a band,
  alternating left and right on successive strikes (so a hold reads as a flurry). It appears
  at full opacity, scales from 0.8 to 1.05 and fades by about 150ms. At most 3 alive.
- **Spark burst:** 6-8 sparks radiate from the impact point over about 300ms, in gold, then fade.
  At most 24 alive.
- **Swing sound:** a random pick from `SFX_WEAPON_POOL` (src/data/sfx.ts) instead of the click,
  with slight pitch variation if expo-audio supports it, and a short cooldown so a hold does
  not stack sounds.
- The existing flash, squash, shake and floating numbers stay. Retune the shake down if it
  doubles up with the knockback.

**Kill:**
- **Ember dissolve:** in place of today's fade-and-drop ghost, the silhouette fades out while
  12-16 embers rise from its area, drifting and fading over about 700ms.
- **Kill punch:** about 80ms hit-stop and a 2-3px nudge of the battlefield.
- The coin flight stays as it is.

**Reduce Motion:**
- Kept: pose swaps, the flash and fading numbers.
- Off: breathing, knockback, slash movement (it shows and fades in place), sparks, embers
  (a plain fade instead) and the nudge.

**Performance:**
- Hold at 4 taps per second must stay smooth.
- Effects live in their own pooled layer components (like `FloatingNumbers`), so a tap does
  not re-render the whole screen.

---

## Layer 2e: one monster at the gate; fighters chip it (approved 2026-10-26)

**Owner rulings:**
- "Put away the wave system for now." Waves come back later as a side mode, so they go into
  cold storage, not the bin.
- Back to one thing to smash: the button is an enemy with a health bar, always there at the gate.
- Fighters slowly damage the same enemy. Renown comes only when an enemy is defeated, never
  from a click.
- No pips: one long health bar where the pips were, losing HP in proportion to the damage. Taps
  take big bites, fighters slivers; more fighters means more small chunks.
- Fighters deal a fraction of a held strike. Chosen: 1/8.
- The player's strike keeps the claw slash, sparks, hit-stop and knockback (layer 1b).

**Combat:**
- A monster is always on the field. No camp, no Begin wave button, no wave-cleared banner, so
  taps are never ignored. After a kill the next monster enters as before (about 250ms).
- `applyDamage` is the one damage path; `strike` (a tap, counted as a click) and `fighterStrike`
  (counted in `allyStrikes`, a kill in `allyKills`) both use it. A kill pays the bounty.
- The monster type follows lifetime kills. The thresholds are the old wave boundaries, so the
  pace is unchanged and no save changes type:

| Monster | HP | Bounty | Kills |
|---------|----|--------|-------|
| Kobold | 5 | 0.25 | 0-12 |
| Goblin | 8 | 0.40 | 13-27 |
| Shadow Crawler | 12 | 0.60 | 28-52 |
| Orc | 20 | 1.00 | 53+ |

- HP is fractional, rounded to 2 decimals. The HP text and the screen-reader label round up,
  so a standing monster never reads 0.

**Fighters:**
- A held strike is 1 damage every 750ms (1.33 DPS). Each fighter swings for 0.25 every 1.5s
  (0.17 DPS, 1/8 of holding). Eight fighters match a held button.
- Superseded 2026-10-26: fighters swing every 6s (1/32 of holding) and all strike together as one
  hit (n fighters: one hit of n x 0.25). Originally: swings were staggered (n fighters land n swings per 1.5s, spread evenly), counted every 250ms
  of game time; swings landing in the same 250ms are grouped into one number.
- Fighters earn nothing per second. One fighter on kobolds earns about 0.008 renown/s through
  kills. They stop while starving. Offline (behind the Keep) they earn their DPS times the
  bounty per HP of the monster they face; no kills are counted offline.
- Feedback: a small blue number at a random spot on the monster and a faint flash. No slash,
  knockback or haptic. A fighter kill plays the coin, star flight and embers but no haptic.
  Away from the Warfront nothing plays and nothing is announced.
- The footer adds "fighters X damage/s" once there are fighters.

**Opening:** a fresh install plays the narration and Pyreth's scene, then the kobold is simply
there. The first guided step is `tap_slay` ("Tap the kobold to strike it."); `begin_wave` is
gone. The flavor line and footer arrive at 3 kills (where Wave 0 cleared). `call_to_arms`
fires at 13 kills (`RALLY_AT_KILLS`, the first goblin), which is where the Wave 2 camp was.
Tapping alone gets there in 65 taps with 3.25 renown (Rally costs 1.00).

**Cold storage:** `src/modes/waves/` holds the wave rules, `waveStrike` (built on `strike`),
`beginWave`/`endWave`, the camp and wave views, and `EnemyCamp`, `WaveBanner`, `MonsterQueue`
and `WaveRow`. Nothing in the main game renders them; they compile and their tests run.
`waveNumber`, `waveKills` and `waveActive` stay in the save, untouched. `Battlefield` keeps its
`camp`, `queue` and `locked` slots for the mode.

**Save v8:** the monster type is set from kills; a save facing the right type keeps its damage.
`allyStrikes` and `allyKills` default to 0.

---

## Layer 2f: quests guide the player (approved 2026-10-26)

**Owner rulings:**
- The game needs a way to guide players through the game and the story; later also daily and
  weekly login incentives (part 2, not built yet).
- First task: defeat four kobolds. Then congratulate the player on defending the wall, and
  explain fighters: the people noticed your bravery, your renown can now convince a villager to
  fight, fighters fight at the gate, and their victories add to your renown.
- Fighters' kills pay the full bounty (no partial share). How fast fighters earn is set by their
  damage (1/8 of a held strike). If the early game rewards generously, monsters growing stronger
  later balances it.

**Quests** (`src/types/quests.ts`): data entries with a goal, progress, an offer condition, an
optional renown reward, and either a story beat they complete into (its scene congratulates) or
a "Quest complete" toast. `questsDone` in the save. One quest at a time on the objective line,
which now shows on the Warfront from the first kill. The Journal has a Quests tab (opens first).

| Quest | Goal | Offered | On completion |
|-------|------|---------|---------------|
| Defend the Wall | Defeat 4 kobolds | after `first_renown` | `call_to_arms` scene ("The Wall Holds"), Rally unlocks |
| Raise the Guard | Rally 2 fighters | after `call_to_arms` | toast, +1.00 renown |

- Four kobolds pay 1.00 renown, exactly the first Rally, so "your renown is now enough" is true.
- `call_to_arms` now fires at 4 kills (the quest), replacing the 13-kill ruling of layer 2e.
- Beat objectives ("Slay 5 monsters", "Rally 2 fighters") were replaced by the quests. Later beats
  keep their beat objectives until they become quests.

---

## Layer 2g: the monster pool; fighters strike as one (approved 2026-10-26)

**Owner rulings:**
- Monsters come from a pool. All kobolds at first; once goblins arrive, each next monster is a
  kobold OR a goblin by chance. The odds change as the game goes on and can phase enemies out.
- Chosen: the odds blend smoothly with lifetime kills; a new type's first appearance is
  guaranteed at its threshold (13 goblin, 28 shadow crawler, 53 orc); kills drive the pool.
- Fighters attack much slower: every 6s (was 1.5s), hit still 0.25, so 1/32 of holding.
- Fighters deal all their damage in one hit: every 6s all fighters strike together (n x 0.25).

**Odds by lifetime kills** (kobold / goblin / shadow crawler / orc, %; `SPAWN_ANCHORS`):

| Kills | Odds |
|-------|------|
| 0-12 | 100 / 0 / 0 / 0 |
| 13 | 85 / 15 / 0 / 0 (first goblin guaranteed) |
| 20 | 67 / 33 / 0 / 0 |
| 28 | 40 / 50 / 10 / 0 (first crawler guaranteed) |
| 40 | 22 / 49 / 29 / 0 |
| 53 | 0 / 40 / 45 / 15 (first orc guaranteed; kobolds gone) |
| 100+ | 0 / 20 / 40 / 40 |

- Kills are counted per monster (`killsByMonster`); Defend the Wall counts kobolds. Save v9
  rebuilds the counts from the old fixed rule.
- The roster moved to `types/monsterRoster.ts` (re-exported by `monsters.ts`) so the pool and the
  damage code do not import each other.
- Renown per monster and tougher monsters come with the balance pass.

---

## Layer 2h: food before the Breach; the valley (approved 2026-10-26)

**Owner rulings:**
- Next goal: rally 5 fighters in total and defeat a Shadow Crawler. Then the player is told
  fighters spend a lot of energy and eat more than villagers, and food reserves and gathering
  are introduced.
- Foraging comes before the Breach and Repair. The Breach waits for monsters that can hurt the
  wall (layer 6); until then it would have nothing to do (threat 1 is below any defense).
- Gathering happens in **the valley**: the horde is camped before the Gate, but Draconia's back
  is to a sheltered valley (forest and river) reached by a small rear gate.
- The trade-off of foraging: while you forage, you are not defending the Gate.
- Then: gather 200 food. The player may do as they like (train gatherers or not), but the game
  advances only when they have personally gathered 200 by tapping FORAGE.

**Quests:** a quest can now have several goals (shown one at a time on the objective line, all
with checkmarks in the Journal).

| Quest | Goals | Offered | On completion |
|-------|-------|---------|---------------|
| Hold the Line | Rally 5 fighters (total); defeat a Shadow Crawler | Raise the Guard done | `empty_stores` scene, hunger and the Forage tab |
| Fill the Stores | Gather 200 food by hand (`foodGatheredByHand`) | `empty_stores` seen | toast; the story pauses here |

- `empty_stores` moved ahead of `the_breach` and now fires on Hold the Line; the story pause
  moved to just after it. Its "Train 2 gatherers" objective became Fill the Stores.
- Guided steps: Open the Forage tab, then tap FORAGE. The Train gatherer step waits until Fill
  the Stores is done, so nothing pushes the player to train before then. Repair's step moved
  after the forage steps.
- Starvation stays off (it arrives with `lean_times`, paused). The first meal comes 10s after
  the scene. One hand forage is 1 food, so 200 is 200 taps or about 50s of holding.
- Next after Fill the Stores: not decided yet.

---

## Shared press (owner rulings, 2026-10-26)

- All main buttons are one shared press (`hooks/useActionPress`): same tap, same hold, same pulse.
- One hold speed: 750ms between repeats, everywhere (`HOLD_REPEAT_MS`).
- Holding repeats only actions that do not spend renown (the strike, FORAGE). Rally, Repair,
  Train and Recruit: one tap, one purchase. `Button`'s `holdToRepeat` uses the same speed and is
  off on purchase buttons.
- Fill the Stores at this speed: 200 taps, or about 150s of holding FORAGE.

---

## Layer 3: food that creates urgency, not exhaustion (approved 2026-10-26; phases A, B and C built)

**Why:** on the A16 the stores emptied while the game sat idle. A meal cost 31 every 30s (about
3,700 food an hour), one gatherer brings 6 per meal, and even the full 6 gatherers barely break even.
About 60% of every meal was idle villagers. At 0 food the fighters stop, and the warning threatened
deaths that cannot happen (starvation is off until `lean_times`). The owner: "I want to create
urgency, but not exhaustion from a sisyphean task."

**Owner rulings:**
- Adopt all nine ideas: army upkeep, a slower meal bell, reachable break-even, a horizon instead
  of a metronome, fed states, rations, pressure in waves, a granary cap, and fairness while away.
- Rations get five levels: none, quarter, half, full (the default) and double. Quarter and double
  are locked behind Librarium research, but the game is built ready for them.
- No rations: fighters stand down. On paper they are villagers again: they eat nothing and deal no
  damage, but still defend passively.

### 3.1 Who eats, and how often

- **The meal bell rings every 120s** (was 30s).
- **Only the army eats from the stores.** Villagers and foragers feed themselves; gatherers' output
  is already net.

| Eats from the stores, per meal | Was (per 30s) | Proposed (per 120s) | Per hour, was / proposed |
|--------------------------------|---------------|---------------------|--------------------------|
| Fighter | 2 | 4 | 240 / 120 |
| Repairer | 1.5 | 3 | 180 / 90 |
| Conscript / footman / knight | 2 / 3 / 5 | 4 / 6 / 10 | halved |
| Explorer | 1 | 2 | halved |
| Villager | 1 | 0 | 120 / 0 |
| Gatherer / trapper / ranger | 0.5 / 0.3 / 0.1 | 0 | 0 |

- **Break-even is reachable:**
  - A gatherer brings in 8 per meal (0.067/s, was 0.2/s), so one gatherer feeds two fighters, and
    6 gatherers (the cap without a Lodge) feed 12.
  - Trappers and rangers scale the same way (0.2/s and 0.5/s).
- **Hand foraging stays at 1 per tap.** Holding gives about 160 per meal. It is the burst that pays
  for growth, not the treadmill that pays for survival.
- **Example:** 5 fighters cost 20 per meal; three gatherers bring 24, so the stores grow by 4 per
  meal.

### 3.2 What the player sees

- **A horizon, not a metronome.** The stores panel reads one of:
  - "Stores last about 14 min" when shrinking.
  - "Stores grow by 4 each meal" when growing.
  - "Stores hold steady".
  - "Granary full".

  The meal bell becomes a small ring, not a full-width bar.
- **A granary cap of 500 food** at the start; buildings raise it later. Foraging into a full
  granary adds nothing, and FORAGE shows "Granary full". Fill the Stores counts food actually
  added.
- **Honest warnings.** Until starvation is on, a warning says what will really happen (fighters
  go hungry, then stand down), never deaths.

### 3.3 Fed states

States are measured in meals held in the stores:

| State | When | Fighters |
|-------|------|----------|
| Well fed | at least 10 meals of upkeep in store | +10% damage |
| Fed | otherwise | normal |
| Hungry | the next meal cannot be paid in full | 50% damage |
| Starving | stores at 0 and a meal went unpaid | stand down (no damage); deaths only once `lean_times` turns starvation on |

### 3.4 Rations (fighters only)

The ration multiplies the fighters' upkeep and their damage. Fed states apply on top.

| Ration | Upkeep | Damage | Available |
|--------|--------|--------|-----------|
| None | 0x | none: fighters stand down (defend passively: still count for the wall's defense) | always |
| Quarter | 0.25x | 0.4x | Librarium research "Lean Rations" |
| Half | 0.5x | 0.7x | always |
| Full | 1x | 1x | default |
| Double | 2x | 1.4x | Librarium research "Feast Hall" |

- Quarter is the most food-efficient (1.6 damage per food) but slow; double is a costly push
  (0.7 damage per food). Full sits between.
- Switching is instant and free; standing down keeps the fighters (no Rally cost to return).
- The selector lives on the Forage tab's stores panel (five segments, locked ones show a lock and
  their research). The Warfront fighter chip shows the current ration.
- Both research nodes are defined now, behind the Librarium (paused story); dev tools can grant
  them for testing.

### 3.5 Fairness while away, and pressure in waves

- **Away:** consumption while the app is closed never takes the stores below one meal's worth, and
  no warning greets the player on return. The Keep's offline system later protects more.
- **Pressure in waves** (phase C, built 2026-10-26; `types/foodEvents.ts`):
  - **Timing:** once Fill the Stores is done, one event every 10-15 minutes of play (play time,
    so events pause while the app is closed). Never the same event twice in a row, and no raid on
    empty stores.
  - **Lean Season:** announced a meal (2 min) ahead; gatherers bring in half for 3 meals.
  - **Bountiful Harvest:** announced a meal ahead; gatherers bring in double for 3 meals.
  - **Raid on the Stores:** announced a meal ahead. Then a raider (HP 10, bounty 0.50, not in the
    spawn pool) stands at the gate. Kill it within 30s and the stores are safe; if it escapes it
    takes 20% of them.
  - **Refugees at the Gate:** 3-5 refugees. Take them in (more villagers, 10 food each from the
    stores on arrival; not possible if the stores cannot pay) or turn them away.
  - **Shown as:** a toast for each step, and a badge with a clock on the Forage tab and the
    Warfront. Dev buttons start each event.

### Phases

| Phase | What |
|-------|------|
| A | Honest warnings; army-only upkeep; meal bell 120s with the new numbers; horizon display; granary cap; the away rule. Story text that says villagers eat is adjusted. |
| B | Fed states; rations (five levels, quarter and double locked, research nodes defined); ration UI. |
| C | Pressure events. |

---

## Layer 3: the Dragon's Claws (approved and built 2026-10-26)

Why now: the wall made fast kills matter (a monster killed within 5s never strikes), but a tap
does 1 damage forever, so as orcs take over the pool the player falls behind however well they
play. The claws are the player's own power curve, and a second use for renown besides people.

### 3c.1 The track

The player is the dragon (visual direction, 2026-10-26), so the upgrade is the dragon's claws:
one track, bought with renown, level by level.

| Level | Name | Damage per tap | Cost (renown) |
|-------|------|----------------|---------------|
| 0 | Fledgling Claws | 1 | -- |
| 1 | Sharpened Claws | 2 | 5 |
| 2 | Hooked Claws | 3 | 12 |
| 3 | Hardened Claws | 4 | 25 |
| 4 | Serrated Claws | 6 | 50 |
| 5 | Obsidian Claws | 8 | 100 |
| 6 | Ember Claws | 11 | 200 |
| 7 | Dragonsteel Claws | 15 | 400 |
| 8 | Ancient Claws | 20 | 800 |

- Every monster pays about 0.05 renown per HP, so renown per tap rises with damage. Level 1 pays
  for itself in about 100 taps; later levels take longer (level 8: about 3,200 taps). Cost
  roughly doubles, damage grows about a third: provisional, tuned in the balance pass.
- At level 8 a tap kills an orc outright.
- **Fighters do not use the claws.** Their hit stays as it is (a fraction of the player's at the
  start); the Forge gives them their own upgrades later.
- **The claws are never lost.** A Breach takes people, food and renown, never the dragon's
  strength, so climbing back after a Breach is faster each time.
- Nothing can be bought while renown is in debt (the existing checks).
- **Seen on the battlefield:** the claw slash grows with the claws (more marks, a brighter edge
  at the top levels), so an upgrade is felt on the next tap.

### 3c.2 Where it lives

The footer's "1 damage per tap" becomes a Claws chip ("Hooked Claws, 3 per tap") that opens a
sheet: the current claws, the next level's damage and cost, and a Sharpen button (the shared
Button; one tap, one purchase). A small dot on the chip when the next level is affordable.
Recommended over a third orb beside RALLY and REPAIR, which would crowd the Warfront.

### 3c.3 The story

A short Pyreth scene after "The Wall Is Yours" (Pyreth is an elder dragon): the fight is yours
now, and your claws are young. Quest: **Sharpen Your Claws** (buy the first level). The story
pauses after it, ready for Strangers at the Gate. Later, Kael's Forge can extend the track
past level 8.

### 3c.4 Retired with it

- The avatar weapons (one entry, the War Hammer) and `clickPower`: they fed the old siege
  defense, which layer 6 removed, so they do nothing now. A dragon does not swing a hammer. The
  save keeps the fields; the Armory stops showing them. Research effects that add click power
  become tap-damage effects when the Librarium returns (balance pass).

### Rulings (2026-10-26)

The owner approved the recommendations: the numbers above as a starting point, the chip and
sheet in the footer, and these names. As built: `types/claws.ts` (`clawLevel` sets `tapDamage`),
`ClawsChip` and `ClawsSheet` on the Warfront (the chip shows on short windows too, where the rest
of the footer is dropped), the slash grows 5% per level and turns gold at Serrated and ember at
Ember. Pyreth's `sharpen_claws` beat (30s after "The Wall Is Yours"), the Sharpen Your Claws
quest, and a tutorial step that points at the chip. The story pauses after `sharpen_claws`.

---

## The Librarium: Lirae's studies (approved and built 2026-10-26)

Research is the last old system behind the story pause. It was built for the idle game before
the siege, and most of it no longer touches anything.

### What no longer fits

- **Half the effects do nothing.** Click power (taps now deal claw damage), fighter auto income
  (renown comes only from kills), gear bonus and village size have no reader. Herbalist Knowledge
  feeds the forage tap, not the gatherers.
- **What still works:** soldier rank discount, food eaten, renown while away, and the two ration
  unlocks (Lean Rations, Feast Hall).
- **Shrink-era prices.** The Librarium costs 37.5; studies 15 to 150. A Garrison level now costs
  40 to 800, the Keep 150.
- **Old prerequisites:** lifetime kills and renown sized for the old game, rescued villagers and
  the outpost (both behind paused side beats).
- **Exploration and mystery branches** depend on expeditions, which are still paused.
- **Story order.** `the_scholar` (chapter 10) sits after three paused side beats and triggers 10
  minutes after the Keep. `the_horde_grows` (chapter 11) repeats words already said. Its
  `trainedRefugee` script has no handler.
- **The screen** (`LibrariumInterior.tsx`) is 617 lines.

### Recommended

**Lirae, the Ink-Wing, a minute after First Trappers.** Her scene stays as written. Quests:
**Raise the Librarium** (200 renown), then **First Study** (finish one study).

**Studies are bought with renown and take effect at once**, as now. No timers. Each branch is a
short chain; each step needs the one before it, and the first needs its building.

| Branch | Study | Cost | Needs | Effect |
|---|---|---|---|---|
| The Dragon | Dragon Anatomy | 60 | - | Taps deal 10% more damage |
| | Weak Points | 150 | Anatomy | 1 tap in 10 strikes for double (a larger gold number) |
| | Wyrm's Fury | 400 | Weak Points | Taps deal 20% more damage |
| The Army | Drill Tactics | 60 | Garrison | Soldier ranks cost 10% less (as now) |
| | Tempered Steel | 150 | Drill, the Forge | A sword adds 0.75 to a volley (was 0.5) |
| | Battle Drill | 400 | Tempered Steel | The army's volleys deal 10% more |
| The Stores | Rationing | 50 | Lodge | Fighters and repairers eat 15% less (as now) |
| | Lean Rations | 80 | Rationing | Unlocks quarter rations (as now) |
| | Snares and Nets | 150 | Lean Rations | Foragers bring 25% more food |
| | Feast Hall | 300 | Snares | Unlocks double rations (as now) |
| The Wall | Mortar Craft | 60 | - | Repairers mend 25% faster |
| | Night Ledgers | 150 | Mortar, the Keep | 25% more renown while away (was Golden Harvest) |
| | Evacuation Drills | 400 | Night Ledgers | A Breach takes a third fewer people |

- **Renown stays honest.** No study raises the bounty; every HP still pays 0.05. Studies make the
  player and the army hit harder, eat less, mend faster or lose less.
- **The growing horde is the reason to study.** Wyrm's Fury and Battle Drill let a city keep up
  at higher horde levels.
- **Exploration and mystery wait** for the outpost chapter. Their nodes are removed, not hidden.
- **Readouts show the result**, not the research: the claws chip, the army readout and the repair
  rate already show the numbers studies change.

**`the_horde_grows`, rewritten.** Now that the horde really grows, Rodain says so a minute after
the first study:
- "They come bigger now, Steward. Every season the horde sends worse than the last."
- "The number beside the wall counts how far they have come. The Ink-Wing's books may be how we
  keep pace."

**Story order.** `the_scholar` and `the_horde_grows` move directly after `the_lodge` (chapter 5
stays 5; these become chapter 6). The pause moves to `the_horde_grows`. The three side beats
(`word_spreads`, `lean_times`, `beyond_the_walls`) stay paused, unreviewed.

**Code**
- `types/research.ts`: the new tree. Prerequisites become a study or a building only. A new
  `types/library.ts` holds the rules as pure updaters: `researchBlock` (`'noLibrary' | 'done' |
  'locked' | 'renown' | null`) and `study`, like `gearBlock` and `forgeGear`. GameContext and the
  badges call them; `checkPrereqs` in GameContext goes.
- The effects are read where they apply: tap damage in the strike, the double-strike roll, the
  sword bonus, the army volley, the gather rate, the repair rate and the Breach losses.
- Remove the dead effects and the `clickPower` reset paths that only fed them; `foragePower`
  stays (the forage tap).
- The screen splits into `LibrariumInterior` (header, branch tabs), `ResearchBranch` (one chain)
  and `ResearchNode` (one card), each under 300 lines, using `ActionRow` and `Button`.
- Saves: unknown study ids are ignored, so no migration. EVIDENCE already covers both beats
  (`librariumBuilt`, a finished study).

### Effect on the owner's save

After First Trappers, Lirae arrives a minute later. At about 2.30 renown an orc, the Librarium is
about 90 kills and the first study about 30 more. Mortar Craft and Dragon Anatomy are the first
real choices.

### Open questions

1. **Placement:** Lirae a minute after First Trappers, Rodain a minute after the first study, the
   pause after `the_horde_grows`, the side beats still paused (recommended)?
2. **The tree:** the 13 studies in four branches above, with exploration and mystery removed for
   now?
3. **Weak Points:** a double strike on 1 tap in 10 (recommended, it makes tapping feel better),
   or a plain +15% to tap damage?
4. **Studies take effect at once** (recommended), or take time to study?
5. **Prices:** the Librarium at 200 and studies from 50 to 400?

### Owner rulings (2026-10-26)

All five as recommended.

### As built

- Effects are read where they apply: `tapDamageNow`, `rollsDouble` and `tapHit` (claws.ts),
  `swordBonusNow` (forge.ts), the volley (army.ts), `gatherMultiplier` (foodEvents.ts),
  `repairRateNow` (siege.ts; the repair loop and time away), the Breach losses (breach.ts).
- The double strike is rolled on the Warfront per tap (GameScreen) and passed to `click`;
  Battlefield shows the hit's number from what `onStrike` returns, larger and gold for a double.
- The sword row's text follows `swordBonusNow`; the claws chip, the tap caption and the stats
  show `tapDamageNow`.
- `clickPower` is removed from the state; the old number-shrink migration reads it from the raw
  save. Expedition speed and find bonuses are gone with their studies (expeditions stay paused).
- The `trainedRefugee` script id (no handler) is removed.

---

## The balance pass (approved and built 2026-10-26)

Chapter 5 is done; this is a short pass over the live game (everything before the story pause),
not new content.

### What the numbers say

- **The horde stops growing after about 53 kills.** The spawn pool tops out at orcs (20 HP, 1.00
  renown, 4 wall damage) and nothing after that gets harder: `HORDE_STRENGTH_PER_LEVEL` is 0. The
  horde level climbs forever (the owner's save is near level 27), but it changes nothing except
  what a Breach pushes back. Meanwhile the claws reach 20 damage a tap, the army grows and gets
  swords, so the Gate gets steadily easier and the army readout only ever turns green.
- **Every monster pays exactly 0.05 renown per HP.** So renown is simply damage dealt. If monsters
  grow tougher and pay more in step, income per tap stays honest and nothing else needs retuning.
- **Food runs short before the Lodge, and the player cannot fix it.** A fighter eats 4 a meal, a
  repairer 3, a gatherer brings 8, and only 6 gatherers are allowed before the Lodge (48 a meal).
  That feeds 12 fighters and no repairers. The owner's save (12 fighters, 7 repairers, 6
  gatherers) loses 21 food a meal, and the Lodge arrives only at the end of chapter 5. The choice
  between fighters and gatherers should be the player's, not a wall.
- **Research has dead effects** (income per second, click power, gear bonuses), but research is
  behind the story pause (the Librarium, chapter 10). Nothing a player can reach today is affected.
- **Small leftovers:** the unused `lastWandererCheck` save field.

### Recommended

1. **The horde grows: +5% per horde level** to a monster's HP, its bounty and its wall strike
   (one multiplier, `hordeStrength`, already wired into the strikes). Level 1 is unchanged; level
   10 is 1.45x; level 27 is 2.3x (an orc with 46 HP, paying 2.30, striking for 9.2).
   - Renown per HP stays 0.05, so tapping pays the same per damage; tougher monsters just take
     more taps, and the claws and swords keep mattering.
   - The army readout measures the scaled monster, so an army that held at level 10 may not hold
     at level 30. Building the army becomes ongoing, not a one-time purchase.
   - A Breach pushes the horde back by half, so it also resets the strength: falling behind costs
     people, but the climb restarts at a fair level.
   - Shown to the player: "Horde level 27" with the strength on the monster's HP readout
     (its max HP already shows).
2. **Food: 10 gatherers without the Lodge** (was 6), so 80 food a meal can feed 12 fighters and 7
   repairers. The Lodge levels move up by the same amount: 14/18/22/26/30.
3. **Remove `lastWandererCheck`.**
4. **Research waits** for the Librarium chapter, where it will be rebuilt around kills, the army,
   food and the wall instead of patched now.

### Effect on the owner's save

At horde level 27 every monster doubles (2.3x): the Gate takes about twice the taps and pays twice
as much per kill. The army readout will likely turn from "holds" to "cannot hold" until the army
grows. With 10 gatherers allowed, four more can be trained to end the food deficit.

### Owner rulings (2026-10-26)

All three as recommended: +5% a level; 10 gatherers without the Lodge, Lodge caps 14 to 30;
research waits for the Librarium chapter.

### As built

- `hordeMonster(def, hordeKills)` (types/monsters.ts) scales HP (rounded to whole HP), bounty
  (from the rounded HP, so 0.05 per HP holds exactly) and wall strike. `currentMonster`,
  `monsterAt` and `toughestInPool` return the grown monster; every fresh spawn (a kill, a Breach,
  a raid and its escape) uses it. The wall strike and time away no longer multiply by
  `hordeStrength` themselves.
- The screen: Battlefield takes `hordeKills` for the max HP and the screen-reader label; the kill
  hook reports the bounty at the strength the monster died at.
- Not scaled: the save migrations (history) and waves mode (cold storage).
- A save loaded mid-fight keeps its monster's current HP; the next one arrives grown.

---

## Chapter 5 phase C: The Keep Stands (approved and built 2026-10-26)

After Arm the Ranks, the Keep and the Ranger's Lodge come out of the fog. Both exist in code
(`DraconiaHallInterior`, `LodgeInterior`, `types/foragers.ts`, `types/reassignment.ts`), built
for rules that have changed.

### What no longer fits

- **Shrink-era prices.** The Keep costs 7.5 renown; the Lodge 2/6/17.5/35/60; a trapper 0.75 and
  a ranger 2. A single sword now costs 15.
- **The Lodge lowers the gatherer cap.** Without it the Forage tab allows 6 gatherers; Lodge Lv1
  allows 4.
- **Time away ignores the army readout.** Offline, the army earns at its damage rate whether it
  holds the Gate or not, and the wall is never touched. The readout's promise ("holds the Gate
  while you are away") means nothing yet.
- **Reassignment predates the army.** It moves soldiers, foragers and explorers with refunds of
  training costs, but knows nothing of fighters or repairers, and a soldier is now a trained
  fighter.
- **Food runs short as the army grows.** The owner's save loses about 21 food a meal; soldiers eat
  4, 6 and 10. Only gatherers (8 a meal) feed the city.
- **Story order.** `the_keep` (offline, reassignment) sits after three old side beats
  (`word_spreads`, `lean_times`, `beyond_the_walls`); moving the pause past it would turn them on
  unreviewed.

### Recommended

**The Keep (Pyreth, 150 renown): the city tends itself while you rest.**
- Offline progress turns on (3 hours, upgradable to 12 as today, 25/100/250/400).
- **Time away follows the army readout.** An army that holds the Gate keeps the wall whole. One
  that does not lets strikes through: the wall wears down while you are away (repairers count),
  but never below 50 HP, so you never come back to a Breach. The return card says which: "Your
  army held the Gate" or "The wall took 120 damage; your army could not hold the Orcs." Renown
  earned is unchanged.
- **Reassignment, redone for one army:** move people between fighters, repairers, gatherers and
  idle villagers. A soldier can stand down to a fighter (their gear stays in the racks). Moving
  is free and refunds nothing; the price curves do not step back. This lets the player rebalance
  after a Breach or when food runs short.

**The Ranger's Lodge (Mirael): better food, the same path as the army.**
- **Promote foragers like soldiers:** a gatherer is promoted to a trapper, a trapper to a ranger.
  One path: train a villager into a gatherer (the Forage tab, as now), then promote at the Lodge.
- **Food per meal:** gatherer 8, trapper 20 (Lodge Lv1, 15 renown), ranger 40 (Lv3, 40 renown),
  each on the ^1.15 curve. One trapper feeds five fighters.
- **The Lodge raises the forager cap, never lowers it:** 6 without it, then 10/14/18/22/26.
  Levels cost 30/75/150/300/600.
- Foragers still eat nothing.

**The story**
- `the_keep_stands` fires a minute after Arm the Ranks (was: the Forge built) and reveals the Keep
  and the Lodge. Quest **Restore the Keep** completes into `the_keep` (Pyreth: the city tends
  itself while you rest, plus reassignment).
- A new beat **`the_lodge`** (Mirael), a minute after the Keep: quests **Raise the Lodge** and
  **First Trappers** (promote 2 gatherers).
- Move `the_keep` (and the new beat) directly after `the_keep_stands`, so the pause can sit after
  `the_lodge` while the old side beats stay paused for their own review.

### Owner ruling (2026-10-26)

All four as recommended. Built in `types/timeAway.ts` (the wall while away, measured against the
toughest monster in the pool, as the readout is), `types/reassignment.ts` (rewritten),
`types/lodge.ts` and `types/foragers.ts`. Explorers can move to a basic job or stand idle, but
not while away on an expedition, and nobody moves into exploring there (it still costs).

---

## Chapter 5 phase B: Kael's Forge (approved and built 2026-10-26)

Kael Ironwright's "The Forge Is Cold" reveals the Forge on the Draconia map. The Forge exists
(`ArmoryInterior`, `buySword`, `buyShield`, `armoryGear`) but its swords and shields only added
renown per second, which phase A removed. They need new jobs.

### What each renown sink is for (the triangle from phase A)

- **The claws:** the player's power at the Gate (only while tapping).
- **The army:** the power while away; strong enough, it kills before a monster strikes.
- **Repairers:** the wall's recovery when the army falls short.

The Forge should strengthen the army's job and add something none of these do, without a fourth
way to raise damage at the Gate that competes with the claws.

### Recommended

- **Swords make soldiers hit harder.** An armed soldier's hit is 50% stronger (a conscript 0.75,
  a footman 1.5, a knight 3). Swords go to the best ranks first. This is the army's job, so the
  readout on the Garrison moves with every sword.
- **Shields keep soldiers alive in a Breach.** A shielded soldier never falls when the wall does.
  Shields go to the best ranks first, so the knights you paid most for are the first protected.
  This is new: insurance against the Breach, which the claws, the army and repairers do not give.
  It makes the Breach less frightening as the city grows, without making the wall matter less
  (people, food and renown are still lost).
- **Gear is for soldiers only**, at most one sword and one shield each (as today: capped at the
  number of soldiers). Fighters have none. A soldier killed in a Breach loses their sword with them.
- **Prices:** the Forge 75 renown. A sword 15, a shield 20, each rising with how many were made
  (the same ^1.15 curve as soldiers).
- **Later, not now:** Kael taking the claws past Ancient. That is a late-game sink; it waits
  until a player can reach Ancient (800 renown for the last level alone).

### The story

- **The Smith** (Kael) fires a minute after First Soldiers is done and reveals the Forge. His line
  changes to "your soldiers will have something better than sticks".
- Quest **Light the Forge**: build it. Quest **Arm the Ranks**: forge 2 swords.
- The story pauses after it, before The Keep Stands.

### Owner ruling (2026-10-26)

All three as recommended: swords +50% best ranks first; shields mean a shielded soldier never
falls in a Breach; Forge 75, sword 15, shield 20. Built in `types/forge.ts`. The fallen in a
Breach are those without a sword first, so a sword is lost only when the bare ones run out.

---

## Chapter 5: A City to Build (approved 2026-10-26; phase A built)

Pyreth's "A City, Not a Wall" opens the Draconia tab (the map, buildings in fog) with the
Garrison first; then Kael's Forge; then the Keep and the Ranger's Lodge come out of the fog. All
of it exists in code from before the redesign (`types/soldiers.ts`, `ShopScreen`, the
`shop/*Interior` screens), built for rules that have changed.

### What no longer fits

- **Soldiers earn renown every second** just by existing (conscript 0.0125/s, footman 0.0375/s,
  knight 0.1/s, plus swords and shields from the Forge). That breaks the ruling that renown
  comes only from kills (layer 2e).
- **Soldiers and fighters are two armies.** Fighters stand at the Gate and strike; soldiers sit in
  the Garrison and earn. The player has no reason to want both.
- **The prices are from the shrink era** (Garrison 1.25 renown; a conscript 0.25), tiny next to
  renown today.
- **The triggers** (`foragers.gatherers >= 3`, and so on) passed long ago for most saves.

### Recommended: soldiers are trained fighters

The Garrison trains the fighters you have rallied into soldiers who hit harder. One army, one
path: **Rally** a villager into a fighter, **train** a fighter into a conscript, **promote** a
conscript to a footman, then a knight. Every soldier stands at the Gate and strikes in the same
volley (every 6 seconds); their kills pay renown like any other.

| Rank | Damage per volley | Eats per meal | Train or promote from | Needs Garrison level |
|------|-------------------|---------------|-----------------------|----------------------|
| Fighter | 0.25 | 4 | Rally (a villager) | -- |
| Conscript | 0.5 | 4 | 10 renown (a fighter) | 1 |
| Footman | 1 | 6 | 30 renown (a conscript) | 3 |
| Knight | 2 | 10 | 80 renown (a footman) | 5 |

- Prices rise with how many of that rank were trained (the existing ^1.15 curve).
- Food per rank is already in the game (conscript 4, footman 6, knight 10): better soldiers eat
  more, so rations and the stores matter more as the army grows.
- Rations and fed states scale soldiers' hits like fighters'. A Breach kills 30% of each rank,
  and the training price curves step back the same way.
- The old per-second income from soldiers, swords and shields is removed.

### The Garrison

| Level | Cost (renown) | Soldiers it holds |
|-------|---------------|-------------------|
| 1 | 40 | 4 |
| 2 | 100 | 8 |
| 3 | 200 | 12 (footmen) |
| 4 | 400 | 16 |
| 5 | 800 | 20 (knights) |

Untrained fighters need no room; only soldiers count against the Garrison.

### The story

- **A City to Build** (Pyreth) fires a minute after Open the Gates is done and opens the Draconia
  tab. Quest **Raise the Garrison**: build it. Quest **First Soldiers**: train 2 conscripts.
- **The Smith** (Kael) follows; the Forge gets its own short plan when we reach it (likely:
  swords raise soldiers' damage, and Kael can take the claws past Ancient).
- **The Keep Stands** reveals the Keep and the Ranger's Lodge; they come after the Forge.
- The story pauses after First Soldiers until the Forge is planned.

### Rulings (2026-10-26)

The owner approved the recommendations: soldiers are trained fighters at the Gate, the numbers
above, and the order (Garrison first, then the Forge, then the Keep and the Lodge). Added on
review: each renown sink has its own job. The claws are the player's power at the Gate, the army
is the power while away (it lets the player forage), repairers are the wall's recovery. So the
Garrison shows **the army readout**: how long the army takes to kill the toughest monster the
horde sends now, against that monster's 5-second strike, and whether the army holds the Gate.

### As built (phase A)

- `types/army.ts`: one army (fighters plus soldiers) in one volley; `makeRank` trains a fighter
  into a conscript or promotes one rank up; `rankBlock` says why it cannot; the readout
  (`toughestInPool`, `armyKillSeconds`). The volley clock runs on its own, so a new monster's
  first volley lands 3s in on average: kill time is 3s plus 6s per further volley. One volley
  holds the Gate; two do not.
- Removed: all renown per second (soldiers, swords and shields, the auto-income loop and its
  "+x/s" display, the Settings stat). Offline earnings and the Keep's text use the army's kill
  rate (`armyRenownPerSec`).
- Rations scale soldiers' food too. A Breach takes 30% of each rank and steps back
  `soldiersTrained`.
- The Garrison screen: soldiers and fighters, the `ArmyReadout`, then a row per rank (Train a
  fighter / Promote a conscript / Promote a footman).
- Story: Pyreth's scene follows Open the Gates; quests Raise the Garrison and First Soldiers. The
  story pauses after `a_city_to_build`.
- Left for the Forge: swords and shields still exist (their Forge screen still says renown/s) but
  the Forge is behind `the_smith`, which is paused. Research effects for auto income
  (`autoRateMultiplier`, `gearBonusMultiplier`) do nothing now; the Librarium pass reworks them.

---

## Chapter 4: Strangers at the Gate, wanderers (approved and built 2026-10-26)

Why now: people are the scarcest thing in Draconia. Every fighter, repairer and gatherer comes
out of the villagers, there is no other way to get more, and a Breach kills 30% of them. The
wanderer system (`types/wanderers.ts`, `WandererModal`) exists but was built for rules that have
changed, so it needs the same treatment the food and the wall got.

### What no longer fits

- **The choice is empty.** The modal weighs "another mouth to feed", but villagers eat nothing now
  (only the army eats, layer 3). Nothing is lost by saying yes.
- **Veterans have nowhere to go.** A "trained refugee" joins the Barracks or the Forager's Lodge,
  both still behind paused beats, so every one overflows into an idle villager and a refund.
- **The timing is loose.** A 15% roll every 5 minutes on a clock that restarts with the app:
  about one wanderer every 18 minutes, unevenly.
- **The beat's trigger** (`foragers.gatherers >= 2`) passed long ago for most saves.

### The rework

- **Newcomers are fed on arrival:** 10 food each, the same rule as Refugees at the Gate. Taking
  them in is food now for hands later, and turning them away is a real choice. If the stores
  cannot pay, they move on.
- **When:** one wanderer every 4-7 minutes of play time (`nextWandererAt` on `playSeconds`, like
  food events), never while one is waiting. **Faster when the city is short of people:** while
  idle villagers are under 5 (after a Breach, say), the gap is halved.
- **Who:**

| Arrival | Chance | People | Food on arrival |
|---------|--------|--------|-----------------|
| Lone Wanderer | 60% | 1 villager | 10 |
| Traveling Couple | 25% | 2 villagers | 20 |
| Small Family | 10% | 3 villagers | 30 |
| Veteran | 5% | 1 fighter, ready to fight (no Rally cost) | 10 |

  The veteran replaces the old trained refugee: a fighter at the Gate rather than a Barracks or
  Lodge place. When those buildings return, veterans can be soldiers or foragers again.
- **No cap yet.** Housing (later) will cap the population.
- **Away:** no wanderers while the app is closed (as today).
- **The modal** shows who they are, the food they eat on arrival against the stores, and what
  they become.

### The story

- `strangers_at_gate` (Mirael) fires once the Sharpen Your Claws quest is done, after 60s of play.
  Her lines change: "Every soul we take in must be fed the day they arrive, and every one is
  another pair of hands."
- The scripted Lone Wanderer still follows the scene, and this first one is free (Mirael shares
  her own rations), so the first choice is easy to say yes to.
- Quest: **Open the Gates**, welcome 3 newcomers (`wanderersWelcomed`).
- The story pauses after it, before A City to Build (the Draconia tab).

### Rulings (2026-10-26)

The owner approved all three recommendations: fed on arrival at 10 food each
(`NEWCOMER_FOOD_EACH`, shared with refugees), one every 4-7 minutes and twice as often under 5
idle villagers, veterans arrive as fighters. As built: `types/wanderers.ts` is pure
(`stepWanderers` on the play clock, `welcomeWanderer`, `turnAwayWanderer`); the modal shows the
stores before and after (and a veteran's meal cost) and disables Welcome when the stores cannot
pay; a wanderer saved in the old shape is dropped on load. The Forage tab's "Foragers attract
wandering survivors" badge is gone (it is no longer true). The story pauses after
`strangers_at_gate`, before A City to Build.

---

## Layer 6: the wall, and the Breach (approved 2026-10-26; phases A and B built)

Owner rulings (2026-10-26):
- The player never dies or starts over. When the wall falls, that is the Breach: villagers fight
  and die, renown takes a huge hit and can go negative, and every resource takes a huge hit.
- The NPCs call on the ancient magic of Draconia to push the horde back, which gives the people
  time to patch the wall. That is why everything costs so much.
- The horde is pushed back several (or many) levels, so starting up again is easy.
- The open questions below were settled on the recommendations (2026-10-26): the wall can fall
  right after Mend the Walls; the loss sizes stand (tune on the A16); push back by half, at least
  2 levels; the strength hook is built and left off.

### 6.1 Monsters strike the wall

- The monster at the gate strikes the wall on a timer while it lives. Its first strike comes one
  interval after it arrives, so a monster killed fast never touches the wall.
- Proposed strikes (every 5s): kobold 1, goblin 1.5, shadow crawler 2, orc 4. A raider does not
  strike: it runs for the stores (the raid already punishes it).
- The wall has 100 HP (existing `cityHp`). Repairers heal 0.5 HP/s each (existing).
- **What this means:** a player who is tapping never takes damage. Idle, 5 fighters lose about
  0.2 HP/s against kobolds and about 0.5 HP/s against the mid pool (anchor 53), so one repairer
  per five fighters about holds the wall. Orcs alone outpace that: the player has to come back.
- Replaces the old siege tick (`threat - defense` every 10s); `getThreatLevel` is retired.

### 6.2 The horde's advance

- New `hordeKills`: every kill adds one, and the spawn pool reads it instead of
  `monstersDefeated`. Lifetime counters (`monstersDefeated`, `killsByMonster`) never go back, so
  quests and debuts are untouched.
- Shown as a **horde level**: 1 + one level per 25 kills, beside the wall's HP above the Gate.
- **Strength hook:** `HORDE_STRENGTH_PER_LEVEL` (types/wall.ts) scales wall strikes per level and
  is 0 (off). Scaling monster HP as well needs the max HP stored per monster (today the roster's
  `hp` is the max everywhere); that is for the balance pass.
- Save migration v10: `hordeKills = monstersDefeated`.

### 6.3 Warnings, so the Breach is never a surprise

- The wall bar turns amber at 50% and red at 25%, and pulses red below 25%.
- Toasts: at 50% "The wall is cracking", at 25% "The wall is failing!" with a haptic, and at 10%
  Rodain: "It won't hold, Steward!"

### 6.4 The Breach (wall reaches 0)

| What | Lost |
|------|------|
| Fighters, repairers, idle villagers | 30% each, rounded down (at least 1 fighter if any) |
| Foragers (out in the valley, they run back to help) | 15% |
| Explorers (away) | none |
| Food | 40% of the stores |
| Renown | half of what you hold, then a blood price of 5 x horde level. It can go negative. |

- **Negative renown:** shown in red with a minus sign. Nothing can be bought until it is back
  above the price (the existing `inspiration < cost` checks already stop it), and kills pay it
  down as normal. Example: 12 renown at horde level 3 becomes 6 - 15 = -9.
- **Rebuilding costs what it did:** the rally and repairer price curves step back by the number
  lost, so the player is not charged the higher price of a bigger army they no longer have.
- **The ancient magic:** the horde's advance is pushed back by half (at least 2 levels, never
  below 0). The wall is patched to 50%, and a ward holds for 90s with no wall strikes. The
  monster at the gate is replaced from the pushed-back pool.
- **Scene:** the first Breach is a full scene. Rodain calls it, people fight in the streets,
  Pyreth calls on the old magic, and the horde is thrown back. Later Breaches play a short scene
  (two lines). Both end on a summary card listing every loss and the new horde level. The Journal
  counts Breaches.
- **Away:** as built in phase A, nothing strikes the wall while the app is closed (offline
  progress does not simulate monsters), so the wall never falls while away. A Breach only happens
  while playing.

### 6.5 The story

- `the_breach` (Rodain, "The Wall Shakes") is re-pointed: it fires once Fill the Stores is done
  and the first gatherer is trained, so the Forage lesson (the train-gatherer step) finishes
  first. Its scene sends the player back to the Gate. The scripted opening blow (15 HP) stays;
  from then on monsters strike the wall and the wall bar shows.
- Mend the Walls becomes a quest: direct 3 repairers (lifetime directed). It completes into a
  new beat, `the_wall_is_yours` (Rodain): his company stands down, the floor is lifted
  (`threatUnfloored`), and he says plainly what a Breach costs. The story pauses after it.
- `the_horde_grows` no longer unlocks anything; its scene needs new words before the story
  reaches it ("from here, the wall is yours" has been said).
- Rodain's company is the HP floor (50) until the wall is allowed to fall. **Open:** when that is
  (see below). `threatUnfloored` keeps its name; "game over" wording in the journal and story
  guide becomes "the wall can fall, and a Breach follows".

### Phases

| Phase | What |
|-------|------|
| A | Wall strikes, horde level and migration, warnings, re-pointed `the_breach`, Mend the Walls quest. The floor holds, so nothing can be lost yet. Built 2026-10-26. |
| B | The Breach: losses, negative renown, ward and push-back, scenes and summary card, away rule. Built 2026-10-26: `types/breach.ts`, `types/horde.ts`, `BreachEvent` (scenes, then a `ReportModal`). Game over is removed. |

### Open questions (settled 2026-10-26 on the recommendations)

1. **When can the wall first fall?** (a) Right after Mend the Walls: Rodain's company is spent
   holding the line while you learned to repair. (b) Chapter 11 (`the_horde_grows`), as the story
   guide has it now. Recommended: (a), or chapters 4-10 have no danger at all.
2. Are the loss sizes right (30% of people, 40% of food, half of renown plus the blood price)?
3. Push back by half the horde's advance (at least 2 levels)?
4. Should monsters also grow stronger with horde level (HP and strike x1.05 per level)? Without
   it, the push-back only changes which monsters come. Recommended: build the hook now with the
   multiplier at 1, and turn it on in the balance pass.

---

## Known side effects to handle later

- Research prerequisites that use `monstersDefeated` (Librarium) were sized for the old
  counter. They are behind paused beats; retune them in the balance pass.
