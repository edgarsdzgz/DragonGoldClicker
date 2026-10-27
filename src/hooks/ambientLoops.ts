import type { AudioSource } from 'expo-audio'
import { sharedSfxPlayer } from './sfxPlayers'

/**
 * The ambient loops, shared app-wide. Two screens can want the same loop (the night wind on the
 * Warfront and over the dark city): each holds a claim, and the loop plays at the loudest claim
 * while any is above zero, and pauses when none is. So one screen letting go never silences
 * another, whatever order their effects run in.
 */
const claims = new Map<AudioSource, Map<symbol, number>>()

function apply(source: AudioSource) {
  const held = claims.get(source)
  const volume = held ? Math.max(0, ...held.values()) : 0
  const player = sharedSfxPlayer(source)
  if (volume > 0) {
    player.loop = true
    player.volume = volume
    if (!player.playing) player.play()
  } else if (player.playing) {
    player.pause()
  }
}

/** Set one claim on a loop: its volume, 0 to let go */
export function claimLoop(source: AudioSource, claim: symbol, volume: number) {
  let held = claims.get(source)
  if (!held) {
    held = new Map()
    claims.set(source, held)
  }
  if (volume > 0) held.set(claim, volume)
  else held.delete(claim)
  apply(source)
}
