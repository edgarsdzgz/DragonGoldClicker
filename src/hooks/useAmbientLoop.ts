import { useEffect, useRef } from 'react'
import { AMBIENT, AMBIENT_MIX } from '../data/sounds'
import type { AmbientId } from '../data/sounds'
import { useAudioSettings } from '../context/AudioSettingsContext'
import { useAppActive } from './useAppActive'
import { claimLoop } from './ambientLoops'

/**
 * Plays an ambient loop while `active` (say, while its screen is focused), at its share of the
 * sound-effects volume (AMBIENT_MIX). It pauses while the app is in the background, and when the
 * sound effects are muted.
 */
export function useAmbientLoop(id: AmbientId, active: boolean) {
  const { effectiveSfxVolume } = useAudioSettings()
  const foreground = useAppActive()
  const claim = useRef(Symbol(id)).current
  const volume = active && foreground ? effectiveSfxVolume * AMBIENT_MIX[id] : 0

  useEffect(() => {
    claimLoop(AMBIENT[id], claim, volume)
  }, [id, claim, volume])

  // Unmounted: let go
  useEffect(() => () => claimLoop(AMBIENT[id], claim, 0), [id, claim])
}
