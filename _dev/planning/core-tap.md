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
| 3 | Tap upgrades: one track (the dragon's claws), reusing `AVATAR_WEAPONS` | later |
| 4 | Rhythm: combo multiplier that decays, occasional crits | later |
| 5 | Fighters damage the same monster (visible small hits) instead of a separate insp/s | done in 2e |
| 6 | The wall: monsters not killed in time hit the wall; Repair matters | later |

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
- **Flavour lines:** show one on some kills (about 1 in 4), instead of every 40-80 taps.
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
  - A large primary **Begin wave** button, centred where the monster stands. It must be at
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
   labelled Dev button in a top corner that opens Settings > Dev. Player builds do not have it.

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
gone. The flavour line and footer arrive at 3 kills (where Wave 0 cleared). `call_to_arms`
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

## Known side effects to handle later

- Research prerequisites that use `monstersDefeated` (Librarium) were sized for the old
  counter. They are behind paused beats; retune them in the balance pass.
