import { useEffect, useRef } from 'react'
import { setAudioModeAsync } from 'expo-audio'
import { useAudioSettings } from '../context/AudioSettingsContext'
import { BOSS_TRACKS, TRACKS } from '../data/music'
import type { MusicPlan, TrackId } from '../data/music'
import { sharedSfxPlayer } from './sfxPlayers'
import { MusicDeck } from './musicDeck'

/**
 * Plays the music plan (data/music.ts, musicPlan) through a MusicDeck: a new plan crossfades in,
 * a track left behind pauses where it was, two tracks take turns, and a track played once calls
 * `onceDone`. A track's player is made the first time it plays (the cued ones, ahead); the theme's
 * is the one the title's loader warmed up, so the music starts the moment the title shows.
 */
export function useBgMusic(plan: MusicPlan, onceDone: (plan: MusicPlan) => void) {
  const { effectiveMusicVolume, musicMuted } = useAudioSettings()
  const volume = useRef(effectiveMusicVolume)
  volume.current = effectiveMusicVolume
  const muted = useRef(musicMuted)
  muted.current = musicMuted
  const done = useRef(onceDone)
  done.current = onceDone
  const known = useRef(new Set<TrackId>())
  const deck = useRef<MusicDeck | null>(null)
  if (!deck.current) {
    const d = new MusicDeck(
      (id) => {
        const p = sharedSfxPlayer(TRACKS[id])
        if (!known.current.has(id)) {
          known.current.add(id)
          p.muted = muted.current
          p.addListener('playbackStatusUpdate', (s) => { if (s.didJustFinish) d.ended(id) })
        }
        return p
      },
      () => volume.current,
      (p) => done.current(p),
    )
    deck.current = d
  }

  // Configure audio mode once
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true })
  }, [])

  // The boss tracks and the Breach's come in on a cue, so their players are made ahead
  useEffect(() => {
    deck.current?.warm([...BOSS_TRACKS, 'breach'])
    return () => deck.current?.stop()
  }, [])

  // A new plan: fade it in over the last (the deck keeps what plays when the key is the same)
  useEffect(() => {
    deck.current?.show(plan)
  }, [plan])

  // The volume slider (a fade in progress reads it as it goes)
  useEffect(() => {
    const id = deck.current?.track
    if (id) sharedSfxPlayer(TRACKS[id]).volume = effectiveMusicVolume
  }, [effectiveMusicVolume])

  // Mute: every track, so one faded back in stays muted too
  useEffect(() => {
    for (const id of known.current) sharedSfxPlayer(TRACKS[id]).muted = musicMuted
  }, [musicMuted])
}
