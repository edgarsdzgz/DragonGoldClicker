import type { QueuedScene } from '../context/StoryContext'
import type { GameState } from '../types/state'
import { cityLight } from '../art/city'
import { UNMAKING_DEEPEST_LEVEL, hordeLevel } from '../types/horde'
import { currentMonster } from '../types/monsters'
import { getBeat } from '../types/story'

// What the music reads from the game (hooks/useMusicCues.ts sends it to hooks/musicScene.ts)

/** The boss's war horn (sfx_boss-arrives) lasts 5.2 s; its music comes in as the horn ends */
export const BOSS_MUSIC_DELAY_MS = 5200

/** The Breach's track (1:08) is done by this long after it starts */
export const BREACH_MUSIC_MAX_MS = 90_000

/** The last Breach whose track has started, so one Breach plays it once (a reload replays both) */
let breachHeard: number | null = null

/** For tests: forget the Breach heard */
export function resetMusicCuesForTests(): void {
  breachHeard = null
}

/** A Breach on show whose track has not started yet (null: none, or already heard) */
export function breachToStart(breach: number | null): number | null {
  if (breach === null || breach === breachHeard) return null
  breachHeard = breach
  return breach
}

/** What the music reads from the game and the story scene on show */
export function gameMusic(state: GameState, scene: QueuedScene | undefined) {
  const mood = scene ? getBeat(scene.id)?.music : undefined
  return {
    cityRebuilt: cityLight(state) !== 'night',
    deep: hordeLevel(state.hordeKills) >= UNMAKING_DEEPEST_LEVEL,
    // One fight per boss: the kill count it arrived on
    fight: currentMonster(state).rank === 'boss' ? state.monstersDefeated : null,
    breach: state.pendingBreach?.count ?? null,
    storyUid: scene && mood ? scene.uid : null,
    mood,
  }
}
