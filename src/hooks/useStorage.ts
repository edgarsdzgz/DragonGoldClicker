import { useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { GameState } from '../types/game'
import { DEFAULT_GAME_STATE } from '../types/game'

const STORAGE_KEY = '@dragongold/gamestate'

export function useStorage() {
  const save = useCallback(async (state: GameState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage write failed silently
    }
  }, [])

  const load = useCallback(async (): Promise<GameState> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<GameState>
        return { ...DEFAULT_GAME_STATE, ...parsed }
      }
    } catch {
      // Storage read failed, return defaults
    }
    return { ...DEFAULT_GAME_STATE, startedAt: Date.now() }
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
