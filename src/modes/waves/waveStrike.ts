import type { GameState } from '../../types/state'
import { MONSTERS, strike } from '../../types/monsters'
import type { MonsterDef, StrikeResult } from '../../types/monsters'
import { roundInsp } from '../../types/utils'
import { progressWave, waveBonus, waveSize, monsterIndexForWave } from './waves'

// =============================================================================
// THE WAVE STRIKE (cold storage): a tap inside a wave, built on the main game's strike
// =============================================================================

export interface WaveStrikeResult extends StrikeResult {
  /** The kill finished a wave */
  waveCleared: boolean
  /** Wave bonus paid on top of the bounty (0 unless the wave was cleared) */
  waveBonus: number
  /** The tap was ignored (the horde is still in camp) */
  ignored: boolean
}

/**
 * One tap in wave mode. In camp it does nothing. Otherwise the main strike deals the damage and
 * pays the bounty; a kill also counts into the wave, the clearing kill pays the wave bonus, and
 * the next monster follows the wave number rather than the kill count.
 */
export function waveStrike(s: GameState, damage: number = s.tapDamage): WaveStrikeResult {
  if (!s.waveActive) {
    const monster = MONSTERS[Math.max(0, Math.min(MONSTERS.length - 1, s.monsterIndex))]
    return { state: s, monster, dealt: 0, killed: false, bounty: 0, waveCleared: false, waveBonus: 0, ignored: true }
  }
  const hit = strike(s, damage)
  if (!hit.killed) return { ...hit, waveCleared: false, waveBonus: 0, ignored: false }

  const wave = progressWave(s, hit.monster.bounty)
  // The next monster is the same type until the wave is cleared, then the next wave's type
  const monsterIndex = wave.cleared ? monsterIndexForWave(wave.waveNumber) : s.monsterIndex
  return {
    ...hit,
    state: {
      ...hit.state,
      inspiration: roundInsp(hit.state.inspiration + wave.bonus),
      totalInspirationEarned: roundInsp(hit.state.totalInspirationEarned + wave.bonus),
      monsterIndex,
      monsterHp: MONSTERS[monsterIndex].hp,
      waveNumber: wave.waveNumber,
      waveKills: wave.waveKills,
    },
    waveCleared: wave.cleared,
    waveBonus: wave.bonus,
    ignored: false,
  }
}

/** Send the next wave in: the first monster enters. Does nothing if a wave is already on. */
export function beginWave(s: GameState): GameState {
  if (s.waveActive) return s
  const monsterIndex = monsterIndexForWave(s.waveNumber)
  return { ...s, waveActive: true, monsterIndex, monsterHp: MONSTERS[monsterIndex].hp }
}

/**
 * The wave is over and its banner is done: back to camp. The bonus was already paid at the
 * kill, so this only flips the view. Only a cleared wave (waveKills back at 0) can end.
 */
export function endWave(s: GameState): GameState {
  if (!s.waveActive || s.waveKills !== 0 || s.monstersDefeated === 0) return s
  return { ...s, waveActive: false }
}

export interface CampView {
  waveNumber: number
  monster: MonsterDef
  count: number
  /** "Wave 3: 5 goblins" */
  previewText: string
  /** "+0.80 when cleared" */
  bonusText: string
  /** Screen-reader label of the Begin wave button */
  buttonLabel: string
}

/** What the camp shows about the next wave */
export function campView(s: Pick<GameState, 'waveNumber' | 'monsterIndex'>): CampView {
  const monster = MONSTERS[monsterIndexForWave(s.waveNumber)]
  const bonus = waveBonus(monster.bounty)
  return {
    waveNumber: s.waveNumber,
    monster,
    count: waveSize(s.waveNumber),
    previewText: `Wave ${s.waveNumber}: ${waveSize(s.waveNumber)} ${monster.plural}`,
    bonusText: `+${bonus.toFixed(2)} when cleared`,
    buttonLabel: `Begin wave ${s.waveNumber}, ${waveSize(s.waveNumber)} ${monster.plural}`,
  }
}

export interface WaveView {
  waveNumber: number
  /** "4 kobolds left" */
  leftText: string
  left: number
  /** The monsters still to come after the current one, at most 4 (the dim queue) */
  queue: MonsterDef[]
}

export const MAX_QUEUE = 4

/** What the wave row and the queue show */
export function waveView(s: Pick<GameState, 'waveNumber' | 'waveKills' | 'monsterIndex'>): WaveView {
  const monster = MONSTERS[Math.max(0, Math.min(MONSTERS.length - 1, s.monsterIndex))]
  const left = Math.max(1, waveSize(s.waveNumber) - s.waveKills)
  const noun = left === 1 ? monster.name.toLowerCase() : monster.plural
  return {
    waveNumber: s.waveNumber,
    left,
    leftText: `${left} ${noun} left`,
    queue: Array.from({ length: Math.min(MAX_QUEUE, left - 1) }, () => monster),
  }
}
