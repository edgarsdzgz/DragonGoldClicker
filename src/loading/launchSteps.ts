import type { AudioPlayer } from 'expo-audio'
import { preloadSprites } from '../art'
import { readSave } from '../hooks/useStorage'
import { sharedSfxPlayer } from '../hooks/sfxPlayers'
import { THEME } from '../data/music'
import type { GameState } from '../types/game'
import type { LoadStep } from './steps'

/** The theme gets this long to load; music never holds the game back past it */
const MUSIC_WAIT_MS = 5000

/** What the steps hand to the game: the save as stored (null for a new game) */
export interface LaunchHold {
  saved: GameState | null
}

/** Resolves once the player has loaded its sound, or after `timeoutMs`, whichever is first */
function whenLoaded(player: AudioPlayer, timeoutMs: number): Promise<void> {
  if (player.isLoaded) return Promise.resolve()
  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timer)
      sub.remove()
      resolve()
    }
    const sub = player.addListener('playbackStatusUpdate', (s) => {
      if (s.isLoaded) finish()
    })
    const timer = setTimeout(finish, timeoutMs)
  })
}

/**
 * The launch's steps, in order: the save (a broken one fails the load, so it is never
 * overwritten), every sprite, then the theme. The time away is counted later, when the player
 * taps Start, so time spent on the title still counts as away.
 */
export function launchSteps(hold: LaunchHold): LoadStep[] {
  return [
    {
      id: 'save',
      label: 'Opening your save',
      weight: 1,
      run: async () => {
        hold.saved = await readSave()
      },
    },
    {
      id: 'art',
      label: 'Readying the art',
      weight: 3,
      run: (report) => preloadSprites((done, total) => report(done / total, `${done} of ${total}`)),
    },
    {
      id: 'music',
      label: 'Tuning the music',
      weight: 1,
      run: () => whenLoaded(sharedSfxPlayer(THEME), MUSIC_WAIT_MS),
    },
  ]
}
