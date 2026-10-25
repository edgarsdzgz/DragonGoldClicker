import type { GameState } from './state'

// =============================================================================
// WAVES (layer 2b): five monsters of one type, then a bonus
// =============================================================================

export const WAVE_SIZE = 5

/** A cleared wave pays this many times the wave's single bounty */
export const WAVE_BONUS_MULTIPLIER = 2

/** How long the "Wave cleared" banner is up, during which taps are ignored */
export const WAVE_BANNER_MS = 1500

/** Wave number and kills inside it, for a lifetime kill count (used by the save migration) */
export function waveFromKills(kills: number): { waveNumber: number; waveKills: number } {
  const k = Math.max(0, Math.floor(kills))
  return { waveNumber: Math.floor(k / WAVE_SIZE) + 1, waveKills: k % WAVE_SIZE }
}

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
  if (kills < WAVE_SIZE) return { waveNumber: s.waveNumber, waveKills: kills, cleared: false, bonus: 0 }
  return { waveNumber: s.waveNumber + 1, waveKills: 0, cleared: true, bonus: waveBonus(bounty) }
}

/**
 * Whether a loaded save is in a wave. A v5 save mid-wave (waveKills > 0) resumes mid-wave. A v6
 * save keeps its flag, except one closed during the wave-cleared banner (flag on, no kills in
 * the new wave), which waits in camp.
 */
export function waveActiveOnLoad(save: { waveActive?: boolean; waveKills: number; monstersDefeated: number }, fromVersion: number): boolean {
  if (fromVersion < 6) return save.waveKills > 0
  if (save.waveActive && save.waveKills === 0 && save.monstersDefeated > 0) return false
  return !!save.waveActive
}
