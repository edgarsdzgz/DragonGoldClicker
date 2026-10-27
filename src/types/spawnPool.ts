import type { GameState } from './state'
import { MONSTERS } from './monsterRoster'

// =============================================================================
// THE SPAWN POOL: which monster comes next
// =============================================================================
// Owner ruling (2026-10-26): monsters come from a pool. All are kobolds at first; when goblins
// arrive, each next monster is a kobold OR a goblin by chance, not kobold, kobold, goblin,
// goblin. The odds move with progress and can phase a monster out.
//
// - Driven by the horde's advance (`hordeKills`: every kill, pushed back by a Breach). The odds
//   blend smoothly between the anchors below.
// - A monster has no chance before its debut (MonsterDef.fromKills).
// - Debut: the first monster after a type's fromKills is guaranteed to be that type, so a new
//   enemy always arrives at a dependable moment (a scene or a quest can introduce it later).
// Weights are provisional; renown per monster and tougher monsters come with the balance pass.

/** At `kills` the pool has exactly these weights, by monster id; a monster not named weighs 0 */
interface SpawnAnchor {
  kills: number
  weights: Record<string, number>
}

/**
 * A moving window (the bestiary plan, 2026-10-27): each monster debuts small, peaks, and thins out
 * as newer ones arrive, so about four to six are in the pool at a time. The last row holds from
 * there on.
 */
export const SPAWN_ANCHORS: SpawnAnchor[] = [
  { kills: 0, weights: { kobold: 100 } },
  { kills: 12, weights: { kobold: 100 } },
  // Goblins arrive: a few at first, more as the kills go on
  { kills: 13, weights: { kobold: 85, goblin: 15 } },
  { kills: 20, weights: { kobold: 62, goblin: 30, giant_rat: 8 } },
  { kills: 28, weights: { kobold: 40, goblin: 40, giant_rat: 10, shadow_crawler: 10 } },
  { kills: 38, weights: { kobold: 25, goblin: 35, giant_rat: 10, shadow_crawler: 20, goblin_scout: 10 } },
  { kills: 45, weights: { kobold: 15, goblin: 30, giant_rat: 10, shadow_crawler: 20, goblin_scout: 15, war_hound: 10 } },
  // Orcs arrive; kobolds and rats are gone
  { kills: 53, weights: { goblin: 30, shadow_crawler: 30, goblin_scout: 15, war_hound: 10, orc: 15 } },
  { kills: 63, weights: { goblin: 20, shadow_crawler: 25, goblin_scout: 15, war_hound: 10, orc: 20, goblin_archer: 10 } },
  { kills: 78, weights: { goblin: 10, shadow_crawler: 20, war_hound: 15, orc: 25, goblin_archer: 15, banner_runner: 15 } },
  // Level 5, the dark cracks: the armored middle horde; the goblins and hounds are gone
  { kills: 103, weights: { shadow_crawler: 10, orc: 30, goblin_archer: 20, banner_runner: 25, shield_bearer: 15 } },
  { kills: 128, weights: { orc: 25, goblin_archer: 10, banner_runner: 20, shield_bearer: 25, beetle_guard: 20 } },
  { kills: 153, weights: { orc: 20, banner_runner: 10, shield_bearer: 25, beetle_guard: 25, chitin_warrior: 20 } },
  // The nomads, three of a kind
  { kills: 165, weights: { orc: 15, shield_bearer: 25, beetle_guard: 25, chitin_warrior: 25, nomad_scout: 10 } },
  { kills: 178, weights: { orc: 10, shield_bearer: 20, beetle_guard: 20, chitin_warrior: 25, nomad_scout: 15, nomad_warrior: 10 } },
  { kills: 190, weights: { shield_bearer: 15, beetle_guard: 15, chitin_warrior: 25, nomad_scout: 15, nomad_warrior: 20, nomad_archer: 10 } },
  // Level 9: the Unmaking's own
  { kills: 203, weights: { beetle_guard: 10, chitin_warrior: 20, nomad_scout: 15, nomad_warrior: 25, nomad_archer: 15, wraith: 15 } },
  { kills: 215, weights: { chitin_warrior: 15, nomad_scout: 10, nomad_warrior: 25, nomad_archer: 15, wraith: 20, skeleton: 15 } },
  // Level 10, the glowing cracks
  { kills: 228, weights: { nomad_warrior: 20, nomad_archer: 15, wraith: 25, skeleton: 20, shadow_phantom: 20 } },
  { kills: 240, weights: { nomad_warrior: 15, nomad_archer: 10, wraith: 25, skeleton: 20, shadow_phantom: 20, spectral_hound: 10 } },
  // The cult
  { kills: 253, weights: { nomad_warrior: 10, wraith: 25, skeleton: 20, shadow_phantom: 20, spectral_hound: 15, ashen_convert: 10 } },
  { kills: 265, weights: { wraith: 20, skeleton: 15, shadow_phantom: 20, spectral_hound: 15, ashen_convert: 20, cult_apprentice: 10 } },
  { kills: 278, weights: { wraith: 15, shadow_phantom: 20, spectral_hound: 15, ashen_convert: 20, cult_apprentice: 15, ember_prophet: 15 } },
  { kills: 303, weights: { shadow_phantom: 20, spectral_hound: 10, ashen_convert: 20, cult_apprentice: 15, ember_prophet: 20, ember_wraith: 15 } },
]

/** The pool's weights after this many kills (one per MONSTERS entry, in order): blended between anchors, zero before a debut */
export function spawnWeights(kills: number): number[] {
  let a = SPAWN_ANCHORS[SPAWN_ANCHORS.length - 1]
  let b = a
  let t = 0
  for (let i = 0; i < SPAWN_ANCHORS.length - 1; i++) {
    if (kills >= SPAWN_ANCHORS[i].kills && kills < SPAWN_ANCHORS[i + 1].kills) {
      a = SPAWN_ANCHORS[i]
      b = SPAWN_ANCHORS[i + 1]
      t = (kills - a.kills) / (b.kills - a.kills)
      break
    }
  }
  // Monsters outside the anchors (the raider) are never rolled
  return MONSTERS.map((m) => {
    if (kills < m.fromKills) return 0
    const from = a.weights[m.id] ?? 0
    return from + ((b.weights[m.id] ?? 0) - from) * t
  })
}

/** Each monster's chance of being next, as a share of 1 (for tests and tuning) */
export function spawnOdds(kills: number): number[] {
  const weights = spawnWeights(kills)
  const total = weights.reduce((a, b) => a + b, 0)
  return weights.map((w) => (total > 0 ? w / total : 0))
}

/**
 * The next monster after a kill. `rand` is a number in [0, 1) (Math.random in the game, fixed in
 * tests). A type that has reached its debut but never been fought comes first, guaranteed.
 */
export function pickNextMonster(s: Pick<GameState, 'hordeKills' | 'killsByMonster'>, rand: number): number {
  // The horde's advance, not lifetime kills: a Breach pushes it back (core-tap layer 6)
  const kills = Math.floor(s.hordeKills)
  const weights = spawnWeights(kills)
  const debut = MONSTERS.findIndex((m, j) => weights[j] > 0 && !((s.killsByMonster[m.id] ?? 0) > 0))
  if (debut >= 0) return debut

  const total = weights.reduce((a, b) => a + b, 0)
  if (total <= 0) return 0
  let roll = Math.min(Math.max(rand, 0), 0.999999) * total
  for (let j = 0; j < weights.length; j++) {
    if (roll < weights[j]) return j
    roll -= weights[j]
  }
  return weights.length - 1
}
