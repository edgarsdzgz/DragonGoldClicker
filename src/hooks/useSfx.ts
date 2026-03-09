import { useCallback, useRef } from 'react'
import { useAudioPlayer } from 'expo-audio'
import type { AudioSource } from 'expo-audio'
import { useAudioSettings } from '../context/AudioSettingsContext'

/**
 * Lightweight SFX player. Returns a `play()` function that fires-and-forgets
 * the provided sound at the current effective SFX volume.
 */
export function useSfx(source: AudioSource) {
  const player = useAudioPlayer(source)
  const { effectiveSfxVolume } = useAudioSettings()
  const volRef = useRef(effectiveSfxVolume)
  volRef.current = effectiveSfxVolume

  const play = useCallback(() => {
    if (volRef.current <= 0) return
    player.volume = volRef.current
    player.seekTo(0)
    player.play()
  }, [player])

  return play
}