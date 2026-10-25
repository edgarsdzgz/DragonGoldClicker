import type { GameState } from './state'

// =============================================================================
// WAVES (layer 2b): five monsters of one type, then a bonus
// =============================================================================

/** Monsters in a normal wave (Wave 1 onward) */
export const WAVE_SIZE = 5
/** Wave 0, the opening, is shorter */
export const OPENING_WAVE_SIZE = 3

export function waveSize(waveNumber: number): number {
  return waveNumber === 0 ? OPENING_WAVE_SIZE : WAVE_SIZE
}

/** First wave of each monster tier: waves 0-2 kobold, 3-5 goblin, 6-10 shadow crawler, 11+ orc */
export const TIER_FIRST_WAVES = [0, 3, 6, 11]

/** Which MONSTERS entry a wave is made of (a wave is never split across types) */
export function monsterIndexForWave(waveNumber: number): number {
  let index = 0
  TIER_FIRST_WAVES.forEach((first, i) => {
    if (waveNumber >= first) index = i
  })
  return index
}

/** A cleared wave pays this many times the wave's single bounty */
export const WAVE_BONUS_MULTIPLIER = 2

/** How long the "Wave cleared" banner is up, during which taps are ignored */
export const WAVE_BANNER_MS = 1500

export function waveBonus(bounty: number): number {
  return Math.round(bounty * WAVE_BONUS_MULTIPLIER * 100) / 100
}

export interface WaveProgress {
  waveNumber: number
  waveKills: number
  /** The kill finished the wave */
  cleared: boolean
  bonus: number
}

/** Count one kill into the wave. The fifth clears it and starts the next. */
export function progressWave(s: Pick<GameState, 'waveNumber' | 'waveKills'>, bounty: number): WaveProgress {
  const kills = s.waveKills + 1
  if (kills < waveSize(s.waveNumber)) return { waveNumber: s.waveNumber, waveKills: kills, cleared: false, bonus: 0 }
  return { waveNumber: s.waveNumber + 1, waveKills: 0, cleared: true, bonus: waveBonus(bounty) }
}

/**
 * Whether a loaded save is in a wave. A v5 save mid-wave (kills, or a damaged monster) resumes
 * mid-wave. A v6+ save keeps its flag, except one closed during the wave-cleared banner (flag on,
 * kills made, no damage on the new wave's full-HP monster), which waits in camp.
 */
export function waveActiveOnLoad(
  save: { waveActive?: boolean; waveKills: number; monstersDefeated: number; monsterHp: number; monsterMaxHp: number },
  fromVersion: number,
): boolean {
  // A monster that has taken damage means the wave is under way, even before its first kill
  const damaged = save.monsterHp > 0 && save.monsterHp < save.monsterMaxHp
  if (fromVersion < 6) return save.waveKills > 0 || damaged
  if (save.waveActive && save.waveKills === 0 && save.monstersDefeated > 0 && !damaged) return false
  return !!save.waveActive
}
