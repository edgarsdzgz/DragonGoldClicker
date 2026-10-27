import { useCallback, useEffect, useRef, useState } from 'react'
import { setAsideBrokenSave } from '../hooks/useStorage'
import { applyTimeAway, freshGame } from '../types/saveLoad'
import type { LoadedGame } from '../types/saveLoad'
import { runSteps } from './steps'
import type { LoadProgress } from './steps'
import { launchSteps } from './launchSteps'
import type { LaunchHold } from './launchSteps'

const STARTING: LoadProgress = { status: 'loading', stepId: null, label: 'Starting', fraction: 0 }

export interface Launch {
  progress: LoadProgress
  /** Run the load again (after a failure) */
  retry: () => void
  /** Keep the unreadable save aside under its own key, then load a new game */
  startFresh: () => void
  /** The game to play, its time away counted now. Call once loading is ready. */
  begin: () => LoadedGame
}

/** The launch's loading, from the moment the app opens: it runs behind the splashes */
export function useLaunch(): Launch {
  const [progress, setProgress] = useState<LoadProgress>(STARTING)
  const [attempt, setAttempt] = useState(0)
  const hold = useRef<LaunchHold>({ saved: null })

  useEffect(() => {
    let live = true
    setProgress(STARTING)
    runSteps(launchSteps(hold.current), (p) => {
      if (live) setProgress(p)
    })
    return () => {
      live = false
    }
  }, [attempt])

  const retry = useCallback(() => setAttempt((a) => a + 1), [])

  const startFresh = useCallback(() => {
    setAsideBrokenSave(Date.now())
      .catch(() => {})
      .finally(() => setAttempt((a) => a + 1))
  }, [])

  const begin = useCallback((): LoadedGame => {
    const now = Date.now()
    const saved = hold.current.saved
    return saved ? applyTimeAway(saved, now) : { state: freshGame(now), offlineEarnings: null }
  }, [])

  return { progress, retry, startFresh, begin }
}
