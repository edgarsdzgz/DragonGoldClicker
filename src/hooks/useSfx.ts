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
  // Made now, so it has loaded by the first play
  useMemo(() => sharedSfxPlayer(source), [source])
  const playAny = usePlaySound()
  return useCallback(() => playAny(source), [playAny, source])
}

/**
 * Like useSfx, but the sound is chosen when it plays: `play(source)` fires any sound at the
 * current effective SFX volume (for a place that plays one of several, such as a story scene).
 */
export function usePlaySound() {
  const { effectiveSfxVolume } = useAudioSettings()
  const volRef = useRef(effectiveSfxVolume)
  volRef.current = effectiveSfxVolume

  return useCallback((source: AudioSource) => {
    if (volRef.current <= 0) return
    const player = sharedSfxPlayer(source)
    player.volume = volRef.current
    player.seekTo(0)
    player.play()
  }, [])
}
