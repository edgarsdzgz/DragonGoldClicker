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
| 5 | Fighters damage the same monster (visible small hits) instead of a separate insp/s | later |
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

## Known side effects to handle later

- Research prerequisites that use `monstersDefeated` (Librarium) were sized for the old
  counter. They are behind paused beats; retune them in the balance pass.
