import { useSyncExternalStore } from 'react'

/**
 * The screen on show, for the music. The navigator sets it as the player changes tabs; the music
 * player (which sits outside the navigator, from the title on) reads it. Kept apart from React state
 * so a tab change re-renders the music player only, not the game.
 */
let screen: string | null = null
const listeners = new Set<() => void>()

export function setMusicScreen(next: string | null): void {
  if (next === screen) return
  screen = next
  listeners.forEach((l) => l())
}

export function getMusicScreen(): string | null {
  return screen
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useMusicScreen(): string | null {
  return useSyncExternalStore(subscribe, getMusicScreen, getMusicScreen)
}
