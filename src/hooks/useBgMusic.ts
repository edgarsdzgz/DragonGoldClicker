import { useEffect, useRef } from 'react'
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio'
import type { AudioSource } from 'expo-audio'
import { useAudioSettings } from '../context/AudioSettingsContext'

/**
 * Plays a playlist of BGM tracks sequentially, looping back to the first
 * track after the last one finishes. Accepts a single source or an array.
 */
export function useBgMusic(sources: AudioSource | AudioSource[]) {
  const playlist = Array.isArray(sources) ? sources : [sources]
  const { effectiveMusicVolume, musicMuted } = useAudioSettings()
  const player = useAudioPlayer(playlist[0])
  const status = useAudioPlayerStatus(player)
  const didInit = useRef(false)
  const trackIndex = useRef(0)

  // Configure audio mode once
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true })
  }, [])

  // Start playback on first load
  useEffect(() => {
    if (!status.isLoaded || didInit.current) return
    didInit.current = true
    player.volume = effectiveMusicVolume
    player.loop = playlist.length === 1
    player.play()
  }, [status.isLoaded])

  // Advance to next track when current one finishes
  useEffect(() => {
    if (!didInit.current || playlist.length <= 1) return
    if (!status.didJustFinish) return

    trackIndex.current = (trackIndex.current + 1) % playlist.length
    player.replace(playlist[trackIndex.current])
    player.loop = false
    player.play()
  }, [status.didJustFinish])

  // Sync volume
  useEffect(() => {
    if (!status.isLoaded || !didInit.current) return
    player.volume = effectiveMusicVolume
  }, [effectiveMusicVolume])

  // Sync mute
  useEffect(() => {
    if (!status.isLoaded || !didInit.current) return
    player.muted = musicMuted
  }, [musicMuted])
}
