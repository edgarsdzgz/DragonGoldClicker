import { useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { SOUND } from '../data/sounds'
import { stateSoundCue } from './soundCues'
import { usePlaySound } from './useSfx'

/**
 * The game's event sounds that follow its state, on every screen: a Breach, the Unmaking rising, the
 * gate cracking, a quest done, a building raised, a study finished, an expedition out and back, a
 * raid, a full granary, Rally and Repair, and the city brightening. One sound per change
 * (hooks/soundCues.ts).
 */
export function useGameSounds() {
  const { state } = useGame()
  const play = usePlaySound()
  const prev = useRef(state)

  useEffect(() => {
    const cue = stateSoundCue(prev.current, state)
    prev.current = state
    if (cue) play(SOUND[cue])
  }, [state, play])
}
