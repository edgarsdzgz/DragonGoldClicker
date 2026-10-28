/** What a crossfade needs of a player (expo-audio's AudioPlayer has these) */
export interface FadingPlayer {
  volume: number
  play(): void
  pause(): void
}

/** A track change fades over this long */
export const CROSSFADE_MS = 1200
/** The volume steps that often during a fade */
export const FADE_STEP_MS = 50

/**
 * Fade `incoming` up from silence while `outgoing` fades down, then pause `outgoing` (it keeps its
 * place, so returning to its screen picks the music up where it left off). `volume` is read at each
 * step, so a slider moved mid-fade is followed. Returns a cancel that ends the fade at once: the
 * incoming track at full volume, the outgoing one paused.
 */
export function crossfade(incoming: FadingPlayer, outgoing: FadingPlayer | null, volume: () => number): () => void {
  incoming.volume = outgoing ? 0 : volume()
  incoming.play()
  if (!outgoing) return () => {}
  const steps = Math.max(1, Math.round(CROSSFADE_MS / FADE_STEP_MS))
  let step = 0
  let done = false
  const finish = () => {
    done = true
    clearInterval(timer)
    incoming.volume = volume()
    outgoing.pause()
  }
  const timer = setInterval(() => {
    step += 1
    const k = step / steps
    if (k >= 1) return finish()
    incoming.volume = volume() * k
    outgoing.volume = volume() * (1 - k)
  }, FADE_STEP_MS)
  return () => {
    if (!done) finish()
  }
}
