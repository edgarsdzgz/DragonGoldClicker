import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type { BeatId } from '../types/story'
import { useGame } from './GameContext'

/**
 * FIFO queue of story scenes waiting to be shown. Owned by the director and
 * consumed by EventHost. It is session state, not part of the save: a scene
 * lost to an app kill is still recorded as seen and stays re-readable.
 */

export interface QueuedScene {
  /** Unique per queue entry, so replaying the same scene remounts its dialog */
  uid: number
  id: BeatId
}

interface StoryContextType {
  /** Scenes waiting; the first one is on screen */
  scenes: QueuedScene[]
  enqueueScene: (id: BeatId) => void
  /** Close the scene on screen (read or skipped) */
  dismissScene: () => void
}

const StoryContext = createContext<StoryContextType | null>(null)

export function StoryProvider({ children }: { children: React.ReactNode }) {
  const { state } = useGame()
  const [scenes, setScenes] = useState<QueuedScene[]>([])
  const nextUid = useRef(1)

  const enqueueScene = useCallback((id: BeatId) => {
    setScenes((prev) => [...prev, { uid: nextUid.current++, id }])
  }, [])

  // A new game (resetGame stamps a new startedAt) must not inherit the old queue
  const startedAt = useRef(state.startedAt)
  useEffect(() => {
    if (state.startedAt === startedAt.current) return
    startedAt.current = state.startedAt
    setScenes([])
  }, [state.startedAt])

  const dismissScene = useCallback(() => {
    setScenes((prev) => prev.slice(1))
  }, [])

  const value = useMemo(() => ({ scenes, enqueueScene, dismissScene }), [scenes, enqueueScene, dismissScene])

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>
}

export function useStory(): StoryContextType {
  const ctx = useContext(StoryContext)
  if (!ctx) throw new Error('useStory must be used within StoryProvider')
  return ctx
}
