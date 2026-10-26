import type { GameState } from './state'
import { shouldRevealExplorerPost } from './state'
// Type-only: systems.ts imports STORY_BEATS from this file at runtime
import type { SystemId, BuildingRevealId } from './systems'

// =============================================================================
// STORY BEATS (data only: triggers, dwell, unlocks, objectives; prose lives in data/story/lines.ts)
// =============================================================================

export type BeatId =
  | 'prologue'
  | 'elder_approaches'
  | 'first_renown'
  | 'call_to_arms'
  | 'the_breach'
  | 'mend_the_walls'
  | 'the_wall_is_yours'
  | 'sharpen_claws'
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
    // Owner's opening (2026-10-25): narration sets the scene at the gate, then the elder speaks.
    // The first goal is the Defend the Wall quest (types/quests.ts), offered after first_renown.
  },
  {
    // Elder Pyreth approaches right after the narration; the first strike step follows her scene
    id: 'elder_approaches', chapter: 0, dwellSec: 0,
    trigger: (s) => seen(s, 'prologue'),
    unlocks: [],
  },
  {
    // The first kill explains renown; the fight continues after the scene
    id: 'first_renown', chapter: 0, dwellSec: 0,
    trigger: (s) => s.monstersDefeated >= 1,
    unlocks: [],
  },
  {
    // Owner ruling (2026-10-26): the Defend the Wall quest (4 kobolds) completes into this scene,
    // which congratulates the player and explains fighters. Four kobolds pay the first Rally.
    id: 'call_to_arms', chapter: 1, dwellSec: 0,
    trigger: (s) => s.questsDone.includes('defend_the_wall'),
    unlocks: ['rally'],
    spotlight: 'rally',
    // Its goal is the Raise the Guard quest (types/quests.ts)
  },
  {
    // Owner ruling (2026-10-26): food before the Breach. The Hold the Line quest (5 fighters
    // rallied, a shadow crawler defeated) completes into this scene: fighters eat twice what a
    // villager does, the stores, the valley behind Draconia, and the cost of foraging (you are
    // not defending). Its goal is the Fill the Stores quest.
    id: 'empty_stores', chapter: 2, dwellSec: 0,
    trigger: (s) => s.questsDone.includes('hold_the_line'),
    unlocks: ['hunger', 'forageTab'],
    scripted: 'firstMeal',
    spotlight: 'forageTab',
  },
  {
    // Core-tap layer 6: from here the monster at the gate strikes the wall. It waits for the
    // stores to be filled and the first gatherer trained, so the Forage lesson finishes first.
    // The id predates the rename: the Breach proper is the wall falling (types/wall.ts).
    id: 'the_breach', chapter: 3, dwellSec: 0,
    trigger: (s) => s.questsDone.includes('fill_the_stores') && s.foragersTrained.gatherers >= 1,
    unlocks: ['siege'],
    scripted: 'breachHit',
  },
  {
    // Its goal is the Mend the Walls quest (types/quests.ts)
    id: 'mend_the_walls', chapter: 3, dwellSec: 0,
    trigger: (s) => seen(s, 'the_breach'),
    unlocks: ['repair'],
    silent: true,
    spotlight: 'repair',
  },
  {
    // Layer 6 phase B: the Mend the Walls quest completes into this scene. Rodain's company stands
    // down, the HP floor is lifted, and he says plainly what a Breach costs (types/breach.ts).
    id: 'the_wall_is_yours', chapter: 3, dwellSec: 0,
    trigger: (s) => s.questsDone.includes('mend_the_walls'),
    unlocks: ['threatUnfloored'],
  },
  {
    // Layer 3: Pyreth (an elder dragon) tells the young dragon its claws can be sharpened. Its
    // goal is the Sharpen Your Claws quest; the Claws chip shows from here (types/opening.ts).
    id: 'sharpen_claws', chapter: 3, dwellSec: 30,
    trigger: (s) => seen(s, 'the_wall_is_yours'),
    unlocks: [],
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
    // The floor is lifted by the_wall_is_yours now (layer 6); this scene needs new words before
    // the story reaches it ("from here, the wall is yours" has already been said)
    unlocks: [],
  },
]

/**
 * Depth before breadth: only beats up to and including this one can fire. Every later beat is
 * paused (never offered by the director, backfill or dev jump). Changing this constant resumes
 * the story; beats a save has already seen are kept, so no progress is deleted.
 */
export const STORY_PAUSED_AFTER: BeatId = 'sharpen_claws'

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
