import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { BeatId } from '../types/story'

/**
 * FIFO queue of story scenes waiting to be shown. Owned by the director and
 * consumed by EventHost. It is session state, not part of the save: a scene
 * lost to an app kill is still recorded as seen and stays re-readable.
 */

interface StoryContextType {
  /** Beat ids whose scenes are waiting; the first one is on screen */
  scenes: BeatId[]
  enqueueScene: (id: BeatId) => void
  /** Close the scene on screen (read or skipped) */
  dismissScene: () => void
}

const StoryContext = createContext<StoryContextType | null>(null)

export function StoryProvider({ children }: { children: React.ReactNode }) {
  const [scenes, setScenes] = useState<BeatId[]>([])

  const enqueueScene = useCallback((id: BeatId) => {
    setScenes((prev) => [...prev, id])
  }, [])

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
