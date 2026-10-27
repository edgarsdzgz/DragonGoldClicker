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
| Goblin Chieftain | goblin, goblin scout, goblin archer, goblin wolf rider | 45 |
| Orc Warchief | orc, shield bearer | 70 |
| Troll | war hound, beetle guard | 115 |
| Ogre | chitin warrior | 160 |
| Windcaller | the nomads, storm rider | 185 |
| Iron Golem | skeleton, ashen convert | 240 |

The other choice is elites as plain pool members at a low weight. That needs no new rule, but they
would not feel special.

## Stage 3: bosses (a new encounter)

**Recommendation: a boss closes every other level.** It is the last kill of levels 2, 4, 6 and on to
20, which is kill 50, 100, 150 and so on.
- It walks up like any monster but stays until it falls. The horde cannot advance past it, and
  fighters, taps and the wall all work as now.
- It has 8 times the HP of its level's average regular. The pay follows (0.05/HP), and it strikes the
  wall for twice what a regular does.
- A Breach pushes the horde back as now, so a boss that breaks the wall is met again later.
- Its name is shown with "Boss" in gold. A story line for each boss can come later.
- Order, rising in menace: Minotaur (2), Basilisk (4), Spider Queen (6), Stone Golem (8), Khagan (10),
  Forge-Master (12), Giant Elemental (14), Corrupted Drake (16), Corrupted Wyvern (18), Lich (20).

Levels 14-20 have no new regulars yet, so the pool's last mix holds there.

## Build order

Stage 1 now, since it needs no new rules. Stages 2 and 3 follow once approved. Each stage gets tests
(placement, the window of at most six, debuts, the elite chance, the boss blocking the advance), a
/verify, a commit, and a look on the A16 before the next.
