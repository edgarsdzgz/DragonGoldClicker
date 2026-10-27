import { useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { GameState } from '../types/game'
import { applyTimeAway, freshGame, parseSave } from '../types/saveLoad'
import type { LoadedGame } from '../types/saveLoad'

export type { OfflineEarnings, LoadedGame } from '../types/saveLoad'

const STORAGE_KEY = '@dragongold/gamestate'

/**
 * The stored save, parsed and upgraded, or null when there is none (a new game). Throws when the
 * save cannot be read or parsed, so a broken save is never mistaken for no save and overwritten.
 */
export async function readSave(): Promise<GameState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  return raw ? parseSave(raw) : null
}

/** Keep a save that could not be read under its own key, then clear the slot for a new game */
export async function setAsideBrokenSave(now: number): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  if (raw) await AsyncStorage.setItem(`${STORAGE_KEY}_unreadable_${now}`, raw)
  await AsyncStorage.removeItem(STORAGE_KEY)
}

export function useStorage() {
  const save = useCallback(async (state: GameState) => {
    try {
      // Transient pop-up state is not worth restoring after a restart
      const { pendingFoodWarning, lastFoodWarning, ...persisted } = state
      const toSave = { ...persisted, lastSavedAt: Date.now() }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch {
      // Storage write failed silently
    }
  }, [])

  // Without the title screen's loader: read the save, or start fresh if it cannot be read
  const load = useCallback(async (): Promise<LoadedGame> => {
    const now = Date.now()
    try {
      const saved = await readSave()
      if (saved) return applyTimeAway(saved, now)
    } catch {
      // Storage read failed, return defaults
    }
    return { state: freshGame(now), offlineEarnings: null }
  }, [])

  const clear = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage clear failed silently
    }
  }, [])

  return { save, load, clear }
}
