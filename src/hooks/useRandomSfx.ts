import { useCallback, useEffect, useRef } from 'react'
import { createAudioPlayer } from 'expo-audio'
import type { AudioSource } from 'expo-audio'
import { useAudioSettings } from '../context/AudioSettingsContext'

interface RandomSfxOptions {
  /** Minimum ms between plays. 0 = no cooldown (default). */
  cooldownMs?: number
  /** Random playback-rate spread around 1 (0.06 = +-6%), which also shifts the pitch */
  pitchVariation?: number
}

/**
 * Creates a pool of audio players and picks one at random on each `play()`.
 * Uses the imperative `createAudioPlayer` so the pool size is dynamic.
 */
export function useRandomSfx(sources: readonly AudioSource[], options?: RandomSfxOptions) {
  const { effectiveSfxVolume } = useAudioSettings()
  const volRef = useRef(effectiveSfxVolume)
  volRef.current = effectiveSfxVolume

  const cooldownMs = options?.cooldownMs ?? 0
  const pitchVariation = options?.pitchVariation ?? 0
  const lastPlayRef = useRef(0)
  const playersRef = useRef<ReturnType<typeof createAudioPlayer>[]>([])

  useEffect(() => {
    const players = sources.map((src) => createAudioPlayer(src))
    playersRef.current = players
    return () => {
      for (const p of players) p.remove()
    }
  }, [sources])

  const play = useCallback(() => {
    const players = playersRef.current
    if (players.length === 0 || volRef.current <= 0) return
    const now = Date.now()
    if (cooldownMs > 0 && now - lastPlayRef.current < cooldownMs) return
    lastPlayRef.current = now
    const player = players[Math.floor(Math.random() * players.length)]
    player.volume = volRef.current
    if (pitchVariation > 0) {
      try {
        // Without pitch correction, the rate change is a pitch change
        player.shouldCorrectPitch = false
        player.setPlaybackRate(1 + (Math.random() * 2 - 1) * pitchVariation)
      } catch {
        // Pitch variation is a nicety; play at normal pitch if the platform refuses
      }
    }
    player.seekTo(0)
    player.play()
  }, [cooldownMs, pitchVariation])

  return play
}
