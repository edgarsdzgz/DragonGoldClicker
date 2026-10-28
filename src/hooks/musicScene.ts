import { useEffect, useSyncExternalStore } from 'react'
import { NO_SCENE } from '../data/music'
import type { MusicScene, MusicSheet } from '../data/music'

/**
 * What is on show, for the music (data/music.ts, musicPlan). The navigator sets the screen, the
 * game sets the rest (hooks/useMusicCues.ts), and the music player, which sits outside the game
 * from the title on, reads it. Kept apart from React state so a change re-renders the music player
 * only, not the game.
 */
let scene: MusicScene = NO_SCENE
const listeners = new Set<() => void>()

export function setMusicScene(patch: Partial<MusicScene>): void {
  const next = { ...scene, ...patch }
  if ((Object.keys(next) as (keyof MusicScene)[]).every((k) => next[k] === scene[k])) return
  scene = next
  listeners.forEach((l) => l())
}

/** The navigator's report of the tab on show */
export function setMusicScreen(screen: string | null): void {
  setMusicScene({ screen })
}

export function getMusicScene(): MusicScene {
  return scene
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useMusicScene(): MusicScene {
  return useSyncExternalStore(subscribe, getMusicScene, getMusicScene)
}

/** A sheet with music of its own: it plays while the sheet is open (the Librarium, the Tower) */
export function useMusicSheet(sheet: MusicSheet): void {
  useEffect(() => {
    setMusicScene({ sheet })
    return () => setMusicScene({ sheet: null })
  }, [sheet])
}
