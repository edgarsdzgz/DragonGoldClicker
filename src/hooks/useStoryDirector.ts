import { useCallback, useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { useDevSettings } from '../context/DevSettingsContext'
import { useStory } from '../context/StoryContext'
import { useGameLoop } from './useGameLoop'
import { findNextBeat } from '../types/storyDirector'
import { getScene } from '../data/story/lines'

/**
 * Thin hook around the pure findNextBeat: once per game second it picks the next
 * beat, records it as seen, and queues its scene. Mount once at navigation level.
 */
export function useStoryDirector() {
  const { state, markBeatSeen } = useGame()
  const { pacing } = useDevSettings()
  const { enqueueScene } = useStory()

  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // At high dev speeds several ticks run before React re-renders; remember what
  // already fired so one beat is never fired twice from a stale state.
  const firedRef = useRef<{ ids: string[]; at: number }>({ ids: [], at: 0 })
  useEffect(() => {
    // State now reflects every beat fired so far (also covers dev reset and jump)
    firedRef.current = { ids: [], at: 0 }
  }, [state.beatsSeen])

  // Runs since the last render. State is stale by that many game seconds, so add it back
  // to know the game second a beat really fired in.
  const runsRef = useRef(0)
  useEffect(() => {
    runsRef.current = 0
  }, [state.playSeconds])

  useGameLoop(
    useCallback(() => {
      const s = stateRef.current
      const now = s.playSeconds + runsRef.current
      runsRef.current += 1

      const pending = firedRef.current.ids.filter((id) => !s.beatsSeen.includes(id))
      const view = {
        ...s,
        playSeconds: now,
        beatsSeen: pending.length > 0 ? [...s.beatsSeen, ...pending] : s.beatsSeen,
        lastBeatAtPlaySec: pending.length > 0 ? firedRef.current.at : s.lastBeatAtPlaySec,
      }

      const beat = findNextBeat(view, pacing)
      if (!beat) return

      firedRef.current = { ids: [...pending, beat.id], at: now }
      markBeatSeen(beat.id, now)
      const scene = beat.silent ? undefined : getScene(beat.id)
      if (scene) enqueueScene(beat.id, { alt: beat.altScene?.(s) ?? false })
    }, [pacing, markBeatSeen, enqueueScene])
  )
}
