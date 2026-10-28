import { useEffect, useMemo, useRef } from 'react'
import { setAudioModeAsync } from 'expo-audio'
import type { AudioSource } from 'expo-audio'
import { useAudioSettings } from '../context/AudioSettingsContext'
import { sharedSfxPlayer } from './sfxPlayers'
import { crossfade } from './crossfade'

/**
 * Plays one music track on a loop, and crossfades when the track changes (the screen's music, see
 * data/music.ts). A track left behind pauses where it was, so coming back picks it up there. Every
 * track in `preload` gets its player now, so it has loaded by its first play; the theme's player is
 * the one the title's loader warmed up, so the music starts the moment the title shows.
 */
export function useBgMusic(source: AudioSource, preload: readonly AudioSource[] = []) {
  const { effectiveMusicVolume, musicMuted } = useAudioSettings()
  const volume = useRef(effectiveMusicVolume)
  volume.current = effectiveMusicVolume
  const muted = useRef(musicMuted)
  muted.current = musicMuted
  const playing = useRef<AudioSource | null>(null)

  useMemo(() => preload.forEach((s) => { sharedSfxPlayer(s).loop = true }), [preload])

  // Configure audio mode once
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true })
  }, [])

  // A new track: fade it in over the last
  useEffect(() => {
    const from = playing.current
    if (from === source) return
    playing.current = source
    const incoming = sharedSfxPlayer(source)
    incoming.loop = true
    incoming.muted = muted.current
    return crossfade(incoming, from ? sharedSfxPlayer(from) : null, () => volume.current)
  }, [source])

  // The volume slider (a fade in progress reads it as it goes)
  useEffect(() => {
    if (playing.current) sharedSfxPlayer(playing.current).volume = effectiveMusicVolume
  }, [effectiveMusicVolume])

  // Mute: every track, so one faded back in stays muted too
  useEffect(() => {
    for (const s of [...preload, ...(playing.current ? [playing.current] : [])]) sharedSfxPlayer(s).muted = musicMuted
  }, [musicMuted, preload])
}
