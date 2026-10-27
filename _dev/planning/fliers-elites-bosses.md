# Fliers, elites and bosses

Started 2026-10-27, after the regular bestiary went into the horde (97231b0).

Status (owner, 2026-10-27): Stage 1 and Stage 2 approved as written. For Stage 3 the owner said to
borrow the old game's boss cadence ("every so many levels... it's all planned"); see Stage 3. Everything below is
drawn, locked and imported, with all three Unmaking tiers and a death.

| Group | Monsters | Art size (w x h) |
| --- | --- | --- |
| Fliers | Giant Bat, Harpy, Mantair Corsair, Storm Rider (each with a shadow) | 21-25 x 14-25 |
| Ground rider | Goblin Wolf Rider | 20 x 21 |
| Elites | Kobold Shaman, Goblin Chieftain, Orc Warchief, Troll, Ogre, Iron Golem, Windcaller | 17-20 x 21-24 |
| Bosses | Minotaur, Stone Golem, Giant Elemental, Khagan, Forge-Master, Corrupted Wyvern, Basilisk, Spider Queen, Corrupted Drake, Lich | 20-28 x 23-31 |

A regular is 13-17 x 11-25. At the battlefield's scale (two screen pixels per map pixel, eight on
the A16) the tallest boss is about 190dp, inside the 200dp box. So bosses read bigger with no new
scale, and every size still lands on whole screen pixels.

## Stage 1: fliers and the wolf rider (no new rules)

Owner, 2026-10-27: fliers use the road. They are drawn higher, over their own shadow, and their walk
is a wingbeat.

- **The lift.** A flier's shadow lies on the road where its feet would be, and its body hangs 8 art
  pixels of air above the shadow, at its scale of the moment. That matches the art session's own
  preview (`48-bestiary-fliers/build_board.py`, `LIFT = 8`). Built as `FLIER_LIFT` and `mobLift`.
- **The shadow.** It is drawn at half strength, centered under the flier. While the flier walks down
  the road, the shadow grows with it, and it stays still through a strike's knockback.
- **Strikes** land on the flier's body, not on its shadow.
- **The body.** A flier's death falls to the road, so the body lies on the road like any other
  (the art's death strip ends on the ground).
- **Placement**, as a second debut with its kind, on the same 0.05/HP and HP/5 rules:

| Monster | Level | Debut (kills) | HP | Why there |
| --- | --- | --- | --- | --- |
| Giant Bat | 4 | 90 | 12 | Beast fodder, like the rat and the hound |
| Goblin Wolf Rider | 5 | 115 | 20 | The goblins' last push, as their foot soldiers fade |
| Harpy | 6 | 140 | 24 | Joins the middle horde |
| Storm Rider | 8 | 198 | 30 | Wind-Taken, beside the nomads |
| Mantair Corsair | 12 | 290 | 34 | A late raider, beside the cult |

## Stage 2: elites (a new rank)

**Recommendation: a rare elite in place of one of its own kind.** When the pool rolls a monster that
has an elite, there is a 1 in 12 chance its elite comes instead. An elite has:
- 2.5 times the HP, and so 2.5 times the pay
- twice the wall strike
- its name shown in gold
- a guaranteed first appearance, like a debut: the first roll of its kind after it unlocks

| Elite | Comes for | Unlocks at |
| --- | --- | --- |
| Kobold Shaman | kobold | 20 |
| Goblin Chieftain | goblin, goblin scout, goblin archer | 45 |
| Orc Warchief | orc, shield bearer | 70 |
| Troll | beetle guard | 115 |
| Ogre | chitin warrior | 160 |
| Windcaller | the nomads, storm rider | 185 |
| Iron Golem | skeleton, ashen convert | 240 |

The other choice is elites as plain pool members at a low weight. That needs no new rule, but they
would not feel special.

## Stage 3: bosses (built from the old game's plan)

My first recommendation (a boss every other level at 8x HP) was set aside. The owner: "I think the
level stuff is in the bestiary or in the other game's thing... Borrow from that, it's all planned."

**What the old game planned** (`C:\Users\ediaz\Coding_Projects\dragonIdler\docs`):
- v2.3.2 GDD: "each with ~10 Wards; miniboss every 5, boss every 10"
- tome 05 and 20: an elite has 3.2x HP and 2x damage, a mini-boss 15x HP and 3x damage, a boss 40x
  HP and 5x damage
- v2.4 GDD: a boss stays defeated if the player rewinds. v2.4 also moved to a boss *wave* (several
  enemies at once) at every ward's end. That does not fit a road that sends one monster at a time,
  so the 5/10 cadence is the one borrowed.

**Built.** A ward is a horde level:
- A mini-boss closes every fifth level and a boss every tenth. Each is the last kill of its level
  (kills = level x 25 - 1), and nothing advances past it until it falls.
- HP is 15x (mini-boss) or 40x (boss) the pool's average monster at that point. Wall strike is 3x or
  5x the pool's average strike, to the nearest half. Pay is 0.05 per HP. The horde's +5% per level
  then applies on top, as for every monster.
- Once killed it stays killed, even when a Breach pushes the horde back below it.
- A raid's raider killed while a boss holds the gate moves the count one past the boss; the boss is
  still sent then, so it cannot slip by (found by /verify).
- While a boss holds the gate, time away wears the wall with the boss, not with the pool's toughest
  regular (found by /verify). The Garrison and Forge readouts still measure the pool.
- The rank shows before the name: MINI-BOSS in gold, BOSS in red.
- Order: the minis are the large beasts and the bosses the named foes. Khagan of the Sirocco was the
  old game's first boss gate, and the Forge-Master leads the Flame-Touched cult.

| Level | Rank | Monster | HP | Wall strike |
| --- | --- | --- | --- | --- |
| 5 | mini-boss | Minotaur | 286 | 10.5 |
| 10 | boss | Khagan of the Sirocco | 1153 | 28.5 |
| 15 | mini-boss | Basilisk | 504 | 20 |
| 20 | boss | Forge-Master of the Inferno | 1344 | 33.5 |
| 25 | mini-boss | Spider Queen | 504 | 20 |
| 30 | boss | Corrupted Drake | 1344 | 33.5 |
| 35 | mini-boss | Stone Golem | 504 | 20 |
| 40 | boss | Corrupted Wyvern | 1344 | 33.5 |
| 45 | mini-boss | Giant Elemental | 504 | 20 |
| 50 | boss | Lich | 1344 | 33.5 |

**Balance warning, for the owner.** These are the old game's multipliers taken as written, and the old
game's damage hit a dragon, not a 100-HP wall:
- Khagan at level 10 is 1153 x 1.45, about 1,670 HP. It strikes for about 41 every 5 seconds, so a full
  wall falls in about 12 seconds unless the army kills it first (about 140 damage a second).
- That makes level 10 a hard gate: Breach, pushed back, grow stronger, come back.
- The Minotaur at level 5 (about 343 HP, about 12.6 a strike) is far gentler.
- If the gate is too hard, the knob is `BOSS_SCALE` and the strike values in
  `types/monsterRoster.ts`; the balance pass with the simulator should settle it.

## Build order

All three stages built on 2026-10-27 (46e2257, 2500717, then the bosses). Each stage gets tests
(placement, the window of at most six, debuts, the elite chance, the boss blocking the advance), a
/verify, a commit, and a look on the A16 before the next.
