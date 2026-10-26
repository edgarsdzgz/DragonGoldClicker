import { useCallback, useMemo, useRef } from 'react'
import type { AudioSource } from 'expo-audio'
import { useAudioSettings } from '../context/AudioSettingsContext'
import { sharedSfxPlayer } from './sfxPlayers'

/**
 * Lightweight SFX player. Returns a `play()` function that fires-and-forgets
 * the provided sound at the current effective SFX volume. The player is shared app-wide
 * (one per sound, see sfxPlayers.ts), so a screen full of buttons costs nothing extra.
 */
export function useSfx(source: AudioSource) {
  const player = useMemo(() => sharedSfxPlayer(source), [source])
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