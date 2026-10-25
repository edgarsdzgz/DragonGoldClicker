import { useMemo } from 'react'
import { useGame } from '../context/GameContext'
import { isSystemOn } from '../types/game'
import type { TabParamList } from './types'

// =============================================================================
// TAB LOCK DEFINITIONS
// =============================================================================

export interface TabLockInfo {
  locked: boolean
  /** Human-readable unlock requirement shown in the toast */
  requirement: string
}

export type TabLockMap = Record<keyof TabParamList, TabLockInfo>

// =============================================================================
// HOOK
// =============================================================================

/**
 * Returns lock state for each tab based on game progression.
 *
 * Unlocked by story beats, not by counts:
 *   Warfront  -- always unlocked
 *   Forage    -- `forageTab` (empty_stores)
 *   Draconia  -- `draconiaTab` (a_city_to_build)
 *   Settings  -- always unlocked
 */
export function useTabLocks(): TabLockMap {
  const { state } = useGame()

  return useMemo<TabLockMap>(() => ({
    GameTab: {
      locked: false,
      requirement: '',
    },
    ForageTab: {
      locked: !isSystemOn(state, 'forageTab'),
      requirement: 'Not yet discovered',
    },
    DraconiaTab: {
      locked: !isSystemOn(state, 'draconiaTab'),
      requirement: 'Not yet discovered',
    },
    SettingsTab: {
      locked: false,
      requirement: '',
    },
  }), [state.beatsSeen])
}
