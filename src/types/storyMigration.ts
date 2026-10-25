import type { GameState } from './state'
import type { BeatId } from './story'
import { STORY_BEATS, isBeatPaused } from './story'

// =============================================================================
// SAVE v1 -> v2: BACKFILL STORY PROGRESS
// =============================================================================
// Existing players keep their progress. Beats are marked seen from what the save
// has already done; backfilled beats show no scene.

/** Proof, from a v1 save, that the player already used what a beat turns on */
const EVIDENCE: Partial<Record<BeatId, (s: GameState) => boolean>> = {
  call_to_arms: (s) => s.fightersRallied > 0,
  the_breach: (s) => s.hpUnlocked,
  mend_the_walls: (s) => s.repairersDirected > 0,
  empty_stores: (s) => s.foodSystemActive || s.foragers.gatherers > 0,
  the_smith: (s) => s.barracksLevel > 0,
  the_keep_stands: (s) => s.armoryBuilt || s.lodgeLevel > 0 || s.foodSystemActive,
  the_keep: (s) => s.draconiaHallBuilt,
  the_scholar: (s) => s.librariumBuilt,
  the_horde_grows: (s) => s.completedResearch.length > 0,
}

/** Side beats that can also be proven by what the save already did */
const SIDE_EVIDENCE: Partial<Record<BeatId, (s: GameState) => boolean>> = {
  word_spreads: (s) => s.milestonesOffered.length > 0,
  beyond_the_walls: (s) => s.postLevel > 0 || s.explorerIntroShown,
}

/** Scripted events of beats the save has already seen are treated as run (no replays for existing players) */
export function backfillScripted(save: GameState): string[] {
  return STORY_BEATS
    .filter((b) => b.scripted && save.beatsSeen.includes(b.id))
    .map((b) => b.scripted as string)
    .filter((id) => id !== 'firstExpedition' || save.nextExpeditionId > 1)
}

/**
 * Walk the main beats in order and mark each seen if its trigger passes or the save
 * already uses something a later beat unlocks. Stop at the first beat failing both.
 * Side beats are marked when their own trigger (or evidence) passes.
 */
export function backfillStory(save: GameState): GameState {
  const main = STORY_BEATS.filter((b) => !b.side && !isBeatPaused(b.id))
  const lastProven = main.reduce((last, b, i) => (EVIDENCE[b.id]?.(save) ? i : last), -1)

  const work: GameState = { ...save, beatsSeen: [] }
  for (let i = 0; i < main.length; i++) {
    const beat = main[i]
    if (i > lastProven && !beat.trigger(work)) break
    work.beatsSeen = [...work.beatsSeen, beat.id]
  }

  for (const beat of STORY_BEATS.filter((b) => b.side && !isBeatPaused(b.id))) {
    if (beat.trigger(work) || SIDE_EVIDENCE[beat.id]?.(save)) {
      work.beatsSeen = [...work.beatsSeen, beat.id]
    }
  }

  return { ...save, beatsSeen: work.beatsSeen, playSeconds: 0, lastBeatAtPlaySec: 0 }
}
