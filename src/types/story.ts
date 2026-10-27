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
  | 'the_lodge'
  | 'word_spreads'
  | 'lean_times'
  | 'beyond_the_walls'
  | 'the_keep'
  | 'the_scholar'
  | 'the_horde_grows'

/** One-time scripted first occurrences a beat can run (behavior arrives in later groups) */
export type ScriptedEventId =
  | 'breachHit'
  | 'firstMeal'
  | 'loneWanderer'
  | 'milestoneFollow'
  | 'firstExpedition'
  | 'offlineFraming'

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
    // Chapter 4 (reworked 2026-10-26): a minute of play after Sharpen Your Claws. The scripted
    // first wanderer is free; then one every 4-7 minutes (types/wanderers.ts). Its goal is the
    // Open the Gates quest.
    id: 'strangers_at_gate', chapter: 4, dwellSec: 60,
    trigger: (s) => s.questsDone.includes('sharpen_your_claws'),
    unlocks: ['wanderers'],
    scripted: 'loneWanderer',
  },
  {
    // Chapter 5 (reworked 2026-10-26): a minute of play after Open the Gates. Its goals are the
    // Raise the Garrison and First Soldiers quests (soldiers are trained fighters, types/army.ts).
    id: 'a_city_to_build', chapter: 5, dwellSec: 60,
    trigger: (s) => s.questsDone.includes('open_the_gates'),
    unlocks: ['draconiaTab'],
    spotlight: 'draconiaTab',
  },
  {
    // Chapter 5 phase B: a minute of play after First Soldiers. Kael reveals the Forge; its goals
    // are the Light the Forge and Arm the Ranks quests (swords and shields, types/forge.ts).
    id: 'the_smith', chapter: 5, dwellSec: 60,
    trigger: (s) => s.questsDone.includes('first_soldiers'),
    unlocks: [],
    reveals: ['forge'],
    spotlight: 'draconiaTab',
  },
  {
    // Chapter 5 phase C: a minute of play after Arm the Ranks. The Keep and the Ranger's Lodge come
    // out of the fog; its goal is the Restore the Keep quest, which completes into the_keep.
    id: 'the_keep_stands', chapter: 5, dwellSec: 60,
    trigger: (s) => s.questsDone.includes('arm_the_ranks'),
    unlocks: [],
    reveals: ['keep', 'lodge'],
    silent: true,
    spotlight: 'draconiaTab',
  },
  {
    // Pyreth: the city tends itself while the player rests (time away follows the army readout,
    // types/timeAway.ts), and people can be moved between jobs (types/reassignment.ts)
    id: 'the_keep', chapter: 5, dwellSec: 0,
    trigger: (s) => s.questsDone.includes('restore_the_keep'),
    unlocks: ['offline', 'reassignment'],
    scripted: 'offlineFraming',
  },
  {
    // Mirael, a minute after the Keep. Its goals are the Raise the Lodge and First Trappers quests
    // (foragers are promoted like soldiers, types/lodge.ts).
    id: 'the_lodge', chapter: 5, dwellSec: 60,
    trigger: (s) => seen(s, 'the_keep'),
    unlocks: [],
  },
  {
    // Chapter 6, the Librarium (approved 2026-10-26): Lirae a minute after First Trappers. Her
    // goals are the Raise the Librarium and First Study quests (types/library.ts).
    id: 'the_scholar', chapter: 6, dwellSec: 60,
    trigger: (s) => s.questsDone.includes('first_trappers'),
    unlocks: [],
    reveals: ['librarium'],
    spotlight: 'draconiaTab',
  },
  {
    // Rodain, a minute after the first study: the horde really grows now (5% a level, types/horde.ts)
    id: 'the_horde_grows', chapter: 6, dwellSec: 60,
    trigger: (s) => s.questsDone.includes('first_study'),
    unlocks: [],
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
]

/**
 * Depth before breadth: only beats up to and including this one can fire. Every later beat is
 * paused (never offered by the director, backfill or dev jump). Changing this constant resumes
 * the story; beats a save has already seen are kept, so no progress is deleted.
 */
export const STORY_PAUSED_AFTER: BeatId = 'the_horde_grows'

let pausedAfter: BeatId = STORY_PAUSED_AFTER

/** Tests only: move the pause so full-story behavior can still be exercised. Pass nothing to restore. */
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
