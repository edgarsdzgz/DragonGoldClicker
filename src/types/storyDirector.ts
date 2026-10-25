import type { GameState } from './state'
import type { BeatDef } from './story'
import { STORY_BEATS } from './story'

// =============================================================================
// BEAT SELECTION (pure; hooks/useStoryDirector.ts only calls this)
// =============================================================================

/** 'test' caps every dwell at a few seconds; 'live' uses the real pacing */
export type StoryPacing = 'test' | 'live'

export const TEST_DWELL_CAP_SEC = 5

export function effectiveDwell(beat: BeatDef, pacing: StoryPacing): number {
  return pacing === 'test' ? Math.min(beat.dwellSec, TEST_DWELL_CAP_SEC) : beat.dwellSec
}

/**
 * The beat that should fire now, or null.
 * Main beats fire strictly in table order: only the first unseen one is considered.
 * Side beats may fire out of order whenever their own trigger passes.
 */
export function findNextBeat(state: GameState, pacing: StoryPacing): BeatDef | null {
  const seen = state.beatsSeen
  const ready = (b: BeatDef) =>
    state.playSeconds - state.lastBeatAtPlaySec >= effectiveDwell(b, pacing) && b.trigger(state)

  const nextMain = STORY_BEATS.find((b) => !b.side && !seen.includes(b.id))
  if (nextMain && ready(nextMain)) return nextMain

  return STORY_BEATS.find((b) => b.side && !seen.includes(b.id) && ready(b)) ?? null
}
