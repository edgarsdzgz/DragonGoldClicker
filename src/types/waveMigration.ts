import type { GameState } from './state'
import { MONSTERS, monsterIndexForKills } from './monsters'
// Old saves were made with waves, so their migrations still read the wave rules in cold storage
import { monsterIndexForWave } from '../modes/waves/waves'

// =============================================================================
// SAVE MIGRATIONS FOR WAVES (v4 -> v8)
// =============================================================================
// Waves were numbered from 1 in groups of five, and a monster's type followed the kill count.
// Wave 0 (3 kobolds) now opens the game and the type follows the wave number.

/** v4-v5 rule: the monster tier by lifetime kills (0-9 kobold, 10-24 goblin, 25-49 crawler, 50+ orc) */
const LEGACY_TIER_FROM_KILLS = [0, 10, 25, 50]

function legacyIndexForKills(kills: number): number {
  let index = 0
  LEGACY_TIER_FROM_KILLS.forEach((from, i) => {
    if (kills >= from) index = i
  })
  return index
}

/** v4: the SLAY circle shows a monster. Start on a fresh monster of the tier the kills call for. */
export function migrateToV4(s: GameState): GameState {
  const monsterIndex = legacyIndexForKills(Math.floor(s.monstersDefeated))
  return { ...s, monsterIndex, monsterHp: MONSTERS[monsterIndex].hp }
}

/** v5: waves of five, numbered from 1. A save resumes mid-wave from its kill count. */
export function migrateToV5(s: GameState): GameState {
  const k = Math.max(0, Math.floor(s.monstersDefeated))
  return { ...s, waveNumber: Math.floor(k / 5) + 1, waveKills: k % 5 }
}

/**
 * v7: wave 0 and wave-based tiers.
 *
 * Mapping chosen: a save that has played keeps its wave number. The old thresholds (kills 10,
 * 25, 50) fell exactly on wave boundaries of five (old waves 3, 6, 11), which are the same
 * numbers the new tier table uses (waves 3, 6, 11), so every old wave maps to a new wave of the
 * same monster type and the player is never dropped to an easier tier mid-wave. The one change
 * is a save that has never fought (no kills, no wave on): it becomes Wave 0, the opening.
 * The monster on the field is left as it is unless its type would disagree with the wave.
 */
export function migrateToV7(s: GameState): GameState {
  const pristine = s.monstersDefeated === 0 && !s.waveActive && s.waveKills === 0
  const waveNumber = pristine ? 0 : s.waveNumber
  const monsterIndex = monsterIndexForWave(waveNumber)
  const sameType = monsterIndex === s.monsterIndex
  return {
    ...s,
    waveNumber,
    monsterIndex,
    monsterHp: sameType && s.monsterHp > 0 ? s.monsterHp : MONSTERS[monsterIndex].hp,
  }
}

/**
 * v8: waves put away (layer 2e). The monster type follows lifetime kills. The kill thresholds are
 * the old wave boundaries, so a save keeps the monster it is facing, damage and all; only one whose
 * type disagrees starts on a fresh monster. The wave fields are left as they are (cold storage).
 */
export function migrateToV8(s: GameState): GameState {
  const monsterIndex = monsterIndexForKills(Math.floor(s.monstersDefeated))
  if (monsterIndex === s.monsterIndex && s.monsterHp > 0) return s
  return { ...s, monsterIndex, monsterHp: MONSTERS[monsterIndex].hp }
}
