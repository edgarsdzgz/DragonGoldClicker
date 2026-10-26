import { createAudioPlayer } from 'expo-audio'
import type { AudioPlayer, AudioSource } from 'expo-audio'

/**
 * One native audio player per sound, shared by the whole app and kept for its lifetime.
 *
 * Every Button, tab button, modal and sheet used to create its own player for the same few
 * sounds. Opening the Dev tab (about 50 buttons) built about 50 players at once: the app froze for
 * seconds and Android ran out of audio tracks ("Cannot create AudioTrack"). There are only a
 * handful of distinct sounds (data/sfx.ts), so one player each is cheap and enough.
 *
 * Shared means shared settings: useRandomSfx's pitch variation sets the playback rate on its
 * players, and it stays set. Keep pitch-varied pools on sounds no plain useSfx plays.
 */
const players = new Map<AudioSource, AudioPlayer>()

export function sharedSfxPlayer(source: AudioSource): AudioPlayer {
  let player = players.get(source)
  if (!player) {
    player = createAudioPlayer(source)
    players.set(source, player)
  }
  return player
}
