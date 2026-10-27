# Monster deaths and the walk-up

Owner, 2026-10-27: "The killing blow plays the death. The last frame holds for a moment, then blinks
out. The next monster walks up the road, instead of popping in at full health in the dead one's place.
I am okay with being able to hit the next enemy as they walk up."

## What the art gives

- 15 death strips, imported in c462e66: `mob_<id>[-strong|-stronger]_death_anim`, 4 frames at 8 fps
  (500 ms): buckles, falls, lands in dust, unmade (dimmed, purple rising).
- The frames are wider than the walk (kobold 22 vs 13, orc 25 vs 14), widened evenly, so they line up
  with the walk by the bottom center.
- The strong and stronger tiers (walk, hit, hurt, death) are all in the manifest, but no game code
  picks them yet. Only the plain tier shows.

## Today

- `Battlefield.showKill`: the dead monster's hurt pose fades out over 700 ms with embers. The next
  monster is there at once, easing in (opacity 0.3 to 1, scale 0.8 to 1, 250 ms).
- Game state does not wait: the next monster is at full HP the moment the last one dies, and taps hit
  it. That stays.

## Recommendations

1. **The death.** The killing blow plays the monster's own death strip where it stood (500 ms). The
   last frame holds 400 ms, then blinks twice and is gone (about 250 ms). The death replaces the faded
   hurt pose and, on pixel monsters, the ember dissolve, because frame 4 already carries the
   Unmaking's purple. The coin flight and the kill nudge stay.
2. **The walk-up.** The next monster appears at the top of the road, where it leaves the camps, and
   walks down to its spot in its walk bob, over about 900 ms, ending as the body blinks out.
   - It stays at its full size, and moves in whole screen pixels, so it never blurs. No shrinking
     for distance: pixel art cannot scale by fractions.
   - It eases out of the dark over its first 150 ms instead of popping in at the horizon.
   - The old 0.8 scale ease-in goes. It blurs pixel art.
3. **Hitting it on the way.** Taps hit the walker, as you allowed. The slash, spark and damage
   number land on the monster where it is on the road, not on the empty spot it is heading for.
4. **Killed on the road.** A monster that dies mid-walk dies where it stands, and the next one walks
   up behind it. Up to 3 bodies can be on the road at once (a small pool, like the strike effects);
   a 4th drops the oldest.
5. **Reduce Motion.** No walk: the next monster is simply there. The death shows its last frame, then
   fades (no fall, no blink).
6. **Paused.** Off screen or in the background, the death and the walk finish at once, so you never
   come back to a half-walked monster.
7. **Dev preview.** A Dev "Monster deaths" screen plays any monster's death and walk-up at any tier,
   so all 15 can be checked on the A16 before the tiers are reachable in play.
8. **Tidy.** `Battlefield.tsx` is 463 lines. The bodies move to a `FallenMonsters` component (the
   pool) and the walk-up into `PixelMonster`, with the timings and the sprite choice as pure, tested
   rules in `src/art/warfront.ts` (`mobSprites` gains `death`).

## Open: the Unmaking tiers

The owner's rule was "weak > strong > stronger, for deeper waves". Nothing decides yet when a
monster is strong. My suggestion: by horde level.

| Horde level | Tier | Kills of advance |
| --- | --- | --- |
| 1-4 | weak (no cracks) | 0-99 |
| 5-9 | strong (dark cracks) | 100-224 |
| 10+ | stronger (glowing cracks) | 225+ |

A Breach pushes the horde back, so the cracks also fade back. That fits the story: the ancient magic
pushes the Unmaking back. It is a look only; the strength is already set by the horde level. This can
ship with the deaths or as its own step.

## Order

1. Rules and tests: `mobSprites(id, tier)` with `death`, the death and walk timings, the walk-up
   path in whole pixels, the body pool.
2. The death, the bodies and the walk-up in the Battlefield; the slash follows the walker.
3. The Dev preview.
4. The tiers, if approved.
5. Tests, a mutation check, /verify, commit, A16 build and check.

## Progress

- 2026-10-27: plan written; awaiting the owner.
- 2026-10-27: owner, after the preview: the bob is the walking speed (a step and a size per bob
  frame, about 2 s on the A16); strikes are drawn at the monster's size; build as recommended,
  tiers by horde level as suggested.
- 2026-10-27: built on the art session's fda8bdf. The walk, the bodies and the tier are in the fight
  (hooks/useWalkUp, hooks/useMonsterRoad, components/FallenBody). Device findings: the walk's offset
  had to leave the native-driven knockback transform (it kept the old place while a hit animated),
  and the walk and the body start in the kill's own render (an effect left the new monster at the
  old place for a quarter second). Under 14 taps a second new pictures draw late; at a human pace
  they are on time. Not done: unit tests for the two hooks (no hook test library here).
