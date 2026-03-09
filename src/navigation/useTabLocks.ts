import { useMemo } from 'react'
import { useGame } from '../context/GameContext'
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
 * Unlock conditions (from game-flow.md):
 *   Warfront  -- always unlocked
 *   Forage    -- direct 3 repairers
 *   Draconia  -- train 3 gatherers
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
      locked: state.repairers < 3,
      requirement: 'Direct 3 Repairers to unlock',
    },
    DraconiaTab: {
      locked: state.foragers.gatherers < 3,
      requirement: 'Train 3 Gatherers to unlock',
    },
    SettingsTab: {
      locked: false,
      requirement: '',
    },
  }), [state.repairers, state.foragers.gatherers])
}
