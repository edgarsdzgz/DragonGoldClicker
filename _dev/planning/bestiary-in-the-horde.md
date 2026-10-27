# The bestiary in the horde

Started 2026-10-27. The art session drew the bestiary (batch `44-bestiary`) and imported it in
1e2193e, so every new monster has idle, hit, hurt, walk and death art at all three tiers. They are in
the sprite manifest, but no wave sends them yet. This plan gives each one a place in the horde.

Status: **approved and built 2026-10-27** (the regular twelve; bosses and the rat wait). Every
number below is provisional, like the rest of the roster.

Correction made while building: the table below is what was approved, but "each level from 2 to 13
brings one new monster" in Recommendation 1 does not match it. The Orc (53) and the Goblin Archer
(63) are both in level 3, as the Crawler and the Scout are both in level 2. So levels 2 and 3 bring
two each, and levels 4 to 13 one each. Also, there are twelve new regular monsters, not fifteen as
Recommendation 3 says.

Added the same day (owner: "with their kind"), from the art session's second round and the rat's
lock. Each joins its family's levels as a second debut, on the same 0.05/HP and HP/5 rules:

| Level | Debut (kills) | Monster | HP | Wall strike |
| --- | --- | --- | --- | --- |
| 1 | 20 | Giant Rat | 4 | 0.8 |
| 2 | 45 | War Hound | 9 | 1.5 |
| 7 | 165 | Nomad Scout | 22 | 4 |
| 8 | 190 | Nomad Archer | 26 | 5 |
| 9 | 215 | Skeleton | 28 | 5 |
| 10 | 240 | Spectral Hound | 30 | 6 |
| 11 | 265 | Cult Apprentice | 28 | 5 |

The pool's anchors were reworked for them (`types/spawnPool.ts`); at most six share it at a time.
The seven elites and the bosses wait for their own plan (owner, 2026-10-27).

The save note under "Build notes" no longer applies: the owner wiped the only copy of the game the
same day, so the roster is ordered by debut and the old-save migrations were removed instead.

## What is ready

| Group | Monsters | Art |
| --- | --- | --- |
| Early horde | Goblin Scout, Goblin Archer, Banner-Runner | Locked, imported |
| Early horde | Giant Rat | v2 cracks under review: **waits for its lock** |
| Middle horde | Shield Bearer, Beetle Guard, Chitin Warrior, Nomad Warrior | Locked, imported |
| The Unmaking's own | Wraith, Shadow Phantom, Ashen Convert, Ember Prophet, Ember Wraith | Locked, imported |
| Bosses | Minotaur, Stone Golem, Giant Elemental, Khagan, Forge-Master, Corrupted Wyvern | Locked, imported (Minotaur since earlier) |

## Recommendation 1: one new monster per horde level

A horde level is 25 kills. Today goblins debut at 13 kills, crawlers at 28 and orcs at 53, which is
three kills into levels 2 and 3. I would keep that rhythm: **each level from 2 to 13 brings one new
monster, three kills in.** The debut guarantee already makes the first monster after that point the
new one, so the player meets each newcomer at a dependable moment.

The groups line up with the Unmaking's marks. The middle horde starts at level 5, when the dark cracks
appear. The Unmaking's own start at level 9 and are fully in by level 10, when the cracks glow.

| Level | Debut (kills) | Monster | HP | Bounty | Wall strike |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | Kobold (now) | 5 | 0.25 | 1 |
| 1 | 13 | Goblin (now) | 8 | 0.40 | 1.5 |
| 2 | 28 | Shadow Crawler (now) | 12 | 0.60 | 2 |
| 2 | 38 | **Goblin Scout** | 7 | 0.35 | 1.5 |
| 3 | 53 | Orc (now) | 20 | 1.00 | 4 |
| 3 | 63 | **Goblin Archer** | 10 | 0.50 | 2 |
| 4 | 78 | **Banner-Runner** | 14 | 0.70 | 3 |
| 5 | 103 | **Shield Bearer** | 26 | 1.30 | 4 |
| 6 | 128 | **Beetle Guard** | 22 | 1.10 | 4 |
| 7 | 153 | **Chitin Warrior** | 28 | 1.40 | 5 |
| 8 | 178 | **Nomad Warrior** | 30 | 1.50 | 6 |
| 9 | 203 | **Wraith** | 24 | 1.20 | 5 |
| 10 | 228 | **Shadow Phantom** | 34 | 1.70 | 7 |
| 11 | 253 | **Ashen Convert** | 30 | 1.50 | 6 |
| 12 | 278 | **Ember Prophet** | 36 | 1.80 | 7 |
| 13 | 303 | **Ember Wraith** | 40 | 2.00 | 8 |

Level 2 gets two debuts (crawler at 28, scout at 38), because the early horde is the thinnest.

- **Bounty** stays at 0.05 inspiration per HP, like every monster now, so each HP pays the same.
  Longer fights pay more, not better.
- **Wall strike** is about HP / 5, like now.
- The horde's +5% per level still applies on top of these numbers.

## Recommendation 2: a moving window, about four or five at a time

Twenty types in one pool would turn every kill into noise. Instead each monster has a run of about
four or five levels: it debuts small, peaks, and thins out as newer ones arrive.

| Kills | The pool's weights |
| --- | --- |
| 0-12 | kobold 100 |
| 13 | kobold 85, goblin 15 |
| 28 | kobold 40, goblin 50, crawler 10 |
| 38 | kobold 30, goblin 40, crawler 20, scout 10 |
| 53 | goblin 35, crawler 35, scout 15, orc 15 (kobolds gone, as now) |
| 63 | goblin 25, crawler 30, scout 15, orc 20, archer 10 |
| 78 | goblin 15, crawler 25, scout 10, orc 25, archer 15, runner 10 |
| 103 | crawler 15, orc 30, archer 20, runner 20, shield 15 (goblins and scouts gone) |
| 128 | orc 25, archer 10, runner 20, shield 25, beetle 20 |
| 153 | orc 20, runner 10, shield 25, beetle 25, chitin 20 |
| 178 | orc 10, shield 20, beetle 20, chitin 25, nomad 25 |
| 203 | shield 15, beetle 15, chitin 20, nomad 30, wraith 20 |
| 228 | chitin 15, nomad 25, wraith 30, phantom 30 |
| 253 | nomad 15, wraith 25, phantom 30, ashen 30 |
| 278 | wraith 15, phantom 25, ashen 30, prophet 30 |
| 303+ | phantom 20, ashen 25, prophet 30, ember wraith 25 (holds from here on) |

The odds still blend smoothly between rows, and a Breach still pushes the horde back to older mixes.
The anchors change from one long list of numbers per row into named weights (`{ orc: 30, ... }`), so
a row stays readable with twenty monsters.

**What changes for current play:** past 53 kills the mix leans a little less on orcs than today, and
past 100 it keeps changing instead of settling at goblin 20, crawler 40, orc 40.

## Recommendation 3: bosses get their own plan

The six bosses are a new kind of encounter, not more of the pool:
- They are drawn bigger (22-26 art pixels wide, 27-31 tall, against 13-17 by 16-25), so the
  battlefield needs a boss scale and box.
- They need a rule for when one comes. For example: at the end of every fifth level, one boss at the
  head of the wave, which has to fall before the horde advances.
- They need their own numbers, and maybe a story beat each.

I would build the regular fifteen first and then bring you a short boss plan.

## Recommendation 4: the Giant Rat waits

Its v2 cracks are still under review. Once you lock it, it slots in as early fodder beside the
kobolds: a debut around 20 kills, HP 4, phased out with the kobolds at 53. That is one roster line
and one pool column.

## Build notes (not decisions)

- **Saves keep their monster.** The game saves the monster at the gate by its roster position. New
  monsters are added after the raider, never in between, so position 0-4 still means kobold to
  raider.
- **Old-save migrations are pinned to the original four.** Two migrations rebuild an old save's
  monster from its lifetime kills: `backfillKillsByMonster` (v9) and `monsterIndexForKills` (v8).
  With new debut points they would hand a 200-kill old save a Wraith. They will read a fixed list of
  the original four instead.
- **The art names already match.** The ids become `goblin_scout` and so on, with the art name in
  `MOB_NAMES` (as `shadow_crawler` maps to `crawler`). A test already checks that every roster monster
  has sprites and a death at every tier, so it covers the new ones automatically.
- **Dev tools.** The Walk-up preview lists the whole roster, not five hardcoded names. Dev's
  "Horde +1 level" already reaches every debut.
- **Tests.**
  - Every debut lands three kills into its level.
  - Each debut is guaranteed in order.
  - The window never holds more than six types.
  - The odds add up to one.
  - Old saves migrate to the same monster as before.
- **On the phone.** Step through the levels with Dev and watch each newcomer walk up, die, and wear
  its cracks at levels 5 and 10.

## Open questions for the owner

1. One new monster per level (levels 2-13), as above?
2. The numbers and the window: go as written, or should the late horde be gentler or harsher?
3. Bosses as a separate plan after this?
