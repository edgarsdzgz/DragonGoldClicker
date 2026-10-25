import type { GameState } from './state'

// =============================================================================
// THE OPENING: what the Warfront shows, revealed in order
// =============================================================================
// Everything here is derived from beats, kills and wave state, never from a stored flag, so a
// save that is already past the opening shows everything it has reached.

export interface WarfrontReveal {
  /** A fresh install: only the Begin Wave 0 button is shown */
  buttonOnly: boolean
  /** The top bar with the renown figure (arrives at the first kill) */
  topBar: boolean
  /** The monster's name under it */
  monsterName: boolean
  /** The gate at the bottom (from the first wave) */
  gate: boolean
  /** Wave row, footer and the camp preview (after Wave 0 clears) */
  waveRow: boolean
  /** Objective line, chips and the tab bar (with call_to_arms) */
  chrome: boolean
}

export function warfrontReveal(s: Pick<GameState, 'waveNumber' | 'waveActive' | 'monstersDefeated' | 'beatsSeen'>): WarfrontReveal {
  const buttonOnly = s.waveNumber === 0 && s.monstersDefeated === 0 && !s.waveActive
  const killed = s.monstersDefeated > 0 || s.waveNumber >= 1 || s.beatsSeen.includes('first_renown')
  return {
    buttonOnly,
    topBar: killed,
    monsterName: killed,
    gate: !buttonOnly,
    waveRow: s.waveNumber >= 1,
    chrome: s.beatsSeen.includes('call_to_arms'),
  }
}
