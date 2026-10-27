# Roadmap after Chapter 6 (approved 2026-10-26)

**Where the game stands:** the story runs through Chapter 6 (the Librarium) and pauses after
Rodain's "They Come Bigger". Everything before the pause has been rebuilt for the siege. What
remains is one bug, three paused side stories from the old idle game, and a few parked tracks.

This file sets the order and how each step is run. Each step still gets its own plan (in
`core-tap.md`) and the owner's approval before anything is built.

---

## How every step runs

1. **Plan first.** I research the code, write a proposal with numbers and open questions, and
   commit it. Nothing is built until the owner approves.
2. **Build one step at a time.** Rules go into pure functions in `src/types/`; screens only call
   them. Tests for every rule, and a mutation check to prove the tests catch breakage.
3. **Check, commit, install.** `/verify`, a commit, then the APK on the A16.
4. **Playtest before the next step.** The owner plays the build; findings feed the next plan.
   The story pause moves only when a chapter is built.

---

## Step 1: Fix "Reassign all" and the success reports (small; built 2026-10-26)

**The bug.** Each GameContext action reports whether it worked by setting a flag inside a React
state update. React runs the first update in a tap at once, but later ones in the same tap only
when it renders. So "Reassign all" moves one person, sees "failed" on the second, and stops.

**The same pattern elsewhere.** Several screens use that report for a sound or a buzz (studying,
forging, training). The single call is usually right, but not guaranteed.

**Proposed fix.**
- A pure `moveMany(s, from, to, n)` in `types/reassignment.ts` moves everyone in one update,
  with tests. "Reassign all" calls it once.
- Screens decide their sound and buzz from the block functions, checked before the action
  (`researchBlock(state, id) === null`, `gearBlock`, `rankBlock`, `foragerBlock`), not from the
  returned flag.
- A sweep of every caller that uses the returned flag, listed in the commit.

No story or balance change. Small enough to build straight after this roadmap is approved.

**As built.** `moveMany` moves everyone in one update; "all" passes the count. Only three
screens read a returned flag (sharpen the claws, Reassign all, a study); the first and last now
check `canSharpen` / `researchBlock` before acting. Every GameContext action now returns nothing,
so a screen that tests the result no longer compiles. Left for Chapter 7: `claimExpedition`
returns its report the same unreliable way (expeditions are paused).

---

## Step 2: Chapter 7, Beyond the Walls (plan, then build; built 2026-10-26)

Three side stories are paused, all written for the old idle game:

| Beat | What it turns on | Why it does not fit today |
|---|---|---|
| `word_spreads` | Milestone newcomers at 25/50/125/175 renown earned | Fires at once (any save is past 25). Chapter 4's wanderers already bring newcomers. |
| `lean_times` | Starvation: people die when a meal goes unpaid | The food rework (layer 3) chose fed states, where the army stands down. Deaths were left for this beat to decide. |
| `beyond_the_walls` | The Explorer's Outpost and expeditions that rescue villagers | Old prices (Outpost 10/30/60, explorer 1.5, expedition 2.5 renown + 30 food). Its trigger reads the old Garrison levels. |

**What the Chapter 7 plan will cover:**
- **The Outpost as the chapter's heart.** Villagers are the city's only source of new fighters,
  repairers and gatherers, and a Breach takes them. Expeditions that bring people home give the
  player a way to grow the city other than waiting for wanderers. Prices and timings on today's
  scale; Mirael as its voice; quests in the usual pattern.
- **The exploration studies come back** with it (faster expeditions, better finds).
- **`claimExpedition`'s report** (how many were found) comes from inside a state update, the
  flaw Step 1 fixed elsewhere; the rebuild computes the reward before the update.
- **A ruling on the other two.** My starting point: retire `word_spreads` (the wanderers already
  do its job), and either fold `lean_times` into Chapter 7 or retire it. The plan will lay out
  both with numbers.

---

## Step 3: Claws past Ancient (plan when it is needed)

The owner ruled this "later, not now": it waits until a player can reach Ancient Claws (800
renown for the last level). With the horde now growing 5% a level, the claws will fall behind
first. When the owner's save nears Ancient, or the Gate starts to feel slow, I propose Kael's
higher levels with the growing horde in mind.

---

## Step 4: Bigger tracks (each its own plan)

- **The visual redesign.** The art direction is set (the player is the dragon; pixel art with
  flat color clusters), and mockups v1/v2 and the asset list are in `_dev`. Its own plan:
  screen by screen, with the A16 as the target.
- **A performance pass on the A16.** Measure first (frame time on the Warfront with a large army,
  startup time), then fix what the numbers show.
- **Daily login rewards.** Parked; needs a design that fits the siege before a plan.
- **Waves mode.** In cold storage since layer 2e. The pass decides whether to bring it back as a
  side mode or delete it; it does not follow the horde's strength or the studies today.

---

## Owner rulings (2026-10-26)

All three as recommended: the fix now, then the Chapter 7 plan, then claws and the bigger tracks;
the fix built without a separate plan; the owner plays each build before the next plan.

## Open questions

1. **Order:** Step 1 (the fix) now, then the Chapter 7 plan, with claws and the bigger tracks
   after (recommended)?
2. **Step 1:** build it straight after this roadmap is approved, without a separate plan
   (recommended, it changes no rules)?
3. **Playtest gate:** play each build before I start the next plan (recommended), or keep
   going and review in batches?
