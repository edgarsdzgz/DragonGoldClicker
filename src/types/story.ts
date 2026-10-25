import type { GameState } from './state'
import { shouldRevealExplorerPost } from './state'
import { FIGHTER_BASE_COST } from './fighters'
// Type-only: systems.ts imports STORY_BEATS from this file at runtime
import type { SystemId, BuildingRevealId } from './systems'

// =============================================================================
// STORY BEATS (data only: triggers, dwell, unlocks, objectives; prose lives in data/story/lines.ts)
// =============================================================================

export type BeatId =
  | 'prologue'
  | 'call_to_arms'
  | 'the_breach'
  | 'mend_the_walls'
  | 'empty_stores'
  | 'strangers_at_gate'
  | 'a_city_to_build'
  | 'the_smith'
  | 'the_keep_stands'
  | 'word_spreads'
  | 'lean_times'
  | 'beyond_the_walls'
  | 'the_keep'
  | 'the_scholar'
  | 'the_horde_grows'

/** One-time scripted first occurrences a beat can run (behaviour arrives in later groups) */
export type ScriptedEventId =
  | 'breachHit'
  | 'firstMeal'
  | 'loneWanderer'
  | 'milestoneFollow'
  | 'firstExpedition'
  | 'offlineFraming'
  | 'trainedRefugee'

/** Controls a beat can pulse (Spotlight arrives in a later group) */
export type SpotlightTarget = 'rally' | 'repair' | 'forageTab' | 'draconiaTab'

export interface ObjectiveDef {
  label: string
  current: (s: GameState) => number
  target: number
}

export interface BeatDef {
  id: BeatId
  chapter: number
  trigger: (s: GameState) => boolean
  /** Active play seconds since the previous beat before this one may fire */
  dwellSec: number
  unlocks: SystemId[]
  reveals?: BuildingRevealId[]
  scripted?: ScriptedEventId
  spotlight?: SpotlightTarget
  objective?: ObjectiveDef
  /** The scene reads differently in this state (e.g. lean_times fired without the stores running dry) */
  altScene?: (s: GameState) => boolean
  /** No scene: only reveals, spotlights and sets the objective */
  silent?: boolean
  /** May fire out of order whenever its own trigger passes; never blocks later beats */
  side?: boolean
}

const seen = (s: GameState, id: BeatId) => s.beatsSeen.includes(id)

export const STORY_BEATS: BeatDef[] = [
  {
    id: 'prologue', chapter: 0, dwellSec: 0,
    trigger: (s) => !seen(s, 'prologue'),
    unlocks: ['slay'],
    objective: { label: 'Slay 5 monsters', current: (s) => s.monstersDefeated, target: 5 },
  },
  {
    id: 'call_to_arms', chapter: 1, dwellSec: 20,
    trigger: (s) => s.inspiration >= FIGHTER_BASE_COST,
    unlocks: ['rally'],
    spotlight: 'rally',
    objective: { label: 'Rally 2 fighters', current: (s) => s.fighters, target: 2 },
  },
  {
    id: 'the_breach', chapter: 2, dwellSec: 120,
    trigger: (s) => s.fighters >= 2,
    unlocks: ['siege'],
    scripted: 'breachHit',
  },
  {
    id: 'mend_the_walls', chapter: 2, dwellSec: 0,
    trigger: (s) => seen(s, 'the_breach'),
    unlocks: ['repair'],
    silent: true,
    spotlight: 'repair',
    objective: { label: 'Direct 3 repairers', current: (s) => s.repairers, target: 3 },
  },
  {
    id: 'empty_stores', chapter: 3, dwellSec: 180,
    trigger: (s) => s.repairers >= 3,
    unlocks: ['hunger', 'forageTab'],
    scripted: 'firstMeal',
    spotlight: 'forageTab',
    objective: { label: 'Train 2 gatherers', current: (s) => s.foragers.gatherers, target: 2 },
  },
  {
    id: 'strangers_at_gate', chapter: 4, dwellSec: 240,
    trigger: (s) => s.foragers.gatherers >= 2,
    unlocks: ['wanderers'],
    scripted: 'loneWanderer',
  },
  {
    id: 'a_city_to_build', chapter: 5, dwellSec: 120,
    trigger: (s) => s.foragers.gatherers >= 3,
    unlocks: ['draconiaTab'],
    spotlight: 'draconiaTab',
    objective: { label: 'Build the Garrison', current: (s) => s.barracksLevel, target: 1 },
  },
  {
    id: 'the_smith', chapter: 5, dwellSec: 60,
    trigger: (s) => s.barracksLevel >= 1,
    unlocks: [],
    reveals: ['forge'],
    objective: { label: 'Build the Forge', current: (s) => (s.armoryBuilt ? 1 : 0), target: 1 },
  },
  {
    id: 'the_keep_stands', chapter: 5, dwellSec: 60,
    trigger: (s) => s.armoryBuilt,
    unlocks: [],
    reveals: ['keep', 'lodge'],
    silent: true,
    objective: { label: 'Restore the Keep', current: (s) => (s.draconiaHallBuilt ? 1 : 0), target: 1 },
  },
  {
    id: 'word_spreads', chapter: 6, dwellSec: 0, side: true,
    trigger: (s) => s.totalInspirationEarned >= 25,
    unlocks: ['milestones'],
    scripted: 'milestoneFollow',
  },
  {
    id: 'lean_times', chapter: 7, dwellSec: 0, side: true,
    // Fallback: if the stores never ran dry, it fires once the Keep stands
    trigger: (s) => (seen(s, 'empty_stores') && s.food <= 0) || seen(s, 'the_keep'),
    unlocks: ['starvation'],
    altScene: (s) => s.food > 0,
    objective: { label: 'Get food above 0', current: (s) => (s.food > 0 ? 1 : 0), target: 1 },
  },
  {
    id: 'beyond_the_walls', chapter: 8, dwellSec: 300, side: true,
    trigger: (s) => shouldRevealExplorerPost(s),
    unlocks: ['expeditions'],
    reveals: ['outpost'],
    scripted: 'firstExpedition',
    objective: { label: 'Send an expedition', current: (s) => s.nextExpeditionId - 1, target: 1 },
  },
  {
    id: 'the_keep', chapter: 9, dwellSec: 0,
    trigger: (s) => s.draconiaHallBuilt,
    unlocks: ['offline', 'reassignment'],
    scripted: 'offlineFraming',
  },
  {
    id: 'the_scholar', chapter: 10, dwellSec: 600,
    trigger: (s) => seen(s, 'the_keep'),
    unlocks: [],
    reveals: ['librarium'],
    scripted: 'trainedRefugee',
    objective: { label: 'Build the Librarium', current: (s) => (s.librariumBuilt ? 1 : 0), target: 1 },
  },
  {
    id: 'the_horde_grows', chapter: 11, dwellSec: 300,
    trigger: (s) => s.completedResearch.length >= 1,
    unlocks: ['threatUnfloored'],
  },
]

/**
 * Depth before breadth: only beats up to and including this one can fire. Every later beat is
 * paused (never offered by the director, backfill or dev jump). Changing this constant resumes
 * the story; beats a save has already seen are kept, so no progress is deleted.
 */
export const STORY_PAUSED_AFTER: BeatId = 'call_to_arms'

let pausedAfter: BeatId = STORY_PAUSED_AFTER

/** Tests only: move the pause so full-story behaviour can still be exercised. Pass nothing to restore. */
export function setStoryPauseForTests(id: BeatId = STORY_PAUSED_AFTER) {
  pausedAfter = id
}

/** Whether a beat is behind the pause */
export function isBeatPaused(id: string): boolean {
  const limit = STORY_BEATS.findIndex((b) => b.id === pausedAfter)
  const at = STORY_BEATS.findIndex((b) => b.id === id)
  return at > limit
}

export function getBeat(id: string): BeatDef | undefined {
  return STORY_BEATS.find((b) => b.id === id)
}
