import { useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { SOUND } from '../data/sounds'
import { stateSoundCue } from './soundCues'
import { usePlaySound } from './useSfx'

/**
 * The game's event sounds that follow its state, on every screen: a Breach, the Unmaking rising, the
 * gate cracking, a quest done, a building raised, a study finished, an expedition out, home and
 * with a find, a raid, a full granary, Rally and Repair, and the city brightening. One sound per change
 * (hooks/soundCues.ts).
 */
export function useGameSounds() {
  const { state } = useGame()
  const play = usePlaySound()
  const prev = useRef(state)
  const lookedAt = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()
    const cue = stateSoundCue(prev.current, state, { since: lookedAt.current, now })
    prev.current = state
    lookedAt.current = now
    if (cue) play(SOUND[cue])
  }, [state, play])
}
