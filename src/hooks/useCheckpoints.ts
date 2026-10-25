import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { GameState } from '../types/game'

/**
 * Dev tools: named snapshots of the full game state, so a test can return to
 * "just before the breach" as often as needed. Stored apart from the live save.
 */

const STORAGE_KEY = '@dragongold/dev_checkpoints'

export interface Checkpoint {
  id: string
  name: string
  savedAt: number
  state: GameState
}

async function readAll(): Promise<Checkpoint[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Checkpoint[]) : []
  } catch {
    return []
  }
}

async function writeAll(list: Checkpoint[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function useCheckpoints() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])

  useEffect(() => {
    readAll().then(setCheckpoints)
  }, [])

  const saveCheckpoint = useCallback(async (name: string, state: GameState) => {
    const entry: Checkpoint = {
      id: `${Date.now()}`,
      name: name.trim() || `Checkpoint ${new Date().toLocaleTimeString()}`,
      savedAt: Date.now(),
      state,
    }
    const next = [entry, ...(await readAll())]
    await writeAll(next)
    setCheckpoints(next)
  }, [])

  const deleteCheckpoint = useCallback(async (id: string) => {
    const next = (await readAll()).filter((c) => c.id !== id)
    await writeAll(next)
    setCheckpoints(next)
  }, [])

  return { checkpoints, saveCheckpoint, deleteCheckpoint }
}
