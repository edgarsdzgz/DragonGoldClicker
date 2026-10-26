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

/** At `kills` the pool has exactly these weights (one per MONSTERS entry, in order) */
interface SpawnAnchor {
  kills: number
  weights: number[]
}

/** Kobold, Goblin, Shadow Crawler, Orc */
export const SPAWN_ANCHORS: SpawnAnchor[] = [
  { kills: 0, weights: [100, 0, 0, 0] },
  { kills: 12, weights: [100, 0, 0, 0] },
  // Goblins arrive: a few at first, more as the kills go on
  { kills: 13, weights: [85, 15, 0, 0] },
  // Shadow crawlers arrive; kobolds are thinning out
  { kills: 28, weights: [40, 50, 10, 0] },
  // Orcs arrive; kobolds are gone
  { kills: 53, weights: [0, 40, 45, 15] },
  { kills: 100, weights: [0, 20, 40, 40] },
]

/** The pool's weights after this many kills: blended between anchors, zero before a debut */
export function spawnWeights(kills: number): number[] {
  const last = SPAWN_ANCHORS[SPAWN_ANCHORS.length - 1]
  let weights = last.weights
  for (let i = 0; i < SPAWN_ANCHORS.length - 1; i++) {
    const a = SPAWN_ANCHORS[i]
    const b = SPAWN_ANCHORS[i + 1]
    if (kills >= a.kills && kills < b.kills) {
      const t = (kills - a.kills) / (b.kills - a.kills)
      weights = a.weights.map((w, j) => w + (b.weights[j] - w) * t)
      break
    }
  }
  // One weight per roster entry; monsters outside the anchors (the raider) are never rolled
  return MONSTERS.map((m, j) => (kills < m.fromKills ? 0 : (weights[j] ?? 0)))
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

/**
 * Kills per monster for a save from before the pool (v9), rebuilt from the old fixed rule:
 * kills 0-12 kobolds, 13-27 goblins, 28-52 shadow crawlers, 53+ orcs.
 */
export function backfillKillsByMonster(monstersDefeated: number): Record<string, number> {
  const k = Math.max(0, Math.floor(monstersDefeated))
  const out: Record<string, number> = {}
  MONSTERS.forEach((m, j) => {
    const until = j + 1 < MONSTERS.length ? MONSTERS[j + 1].fromKills : Infinity
    const n = Math.max(0, Math.min(k, until) - m.fromKills)
    if (n > 0) out[m.id] = n
  })
  return out
}
