import type { GameState } from './state'
import type { BeatId } from './story'
import { STORY_BEATS } from './story'

// =============================================================================
// SAVE v1 -> v2: BACKFILL STORY PROGRESS
// =============================================================================
// Existing players keep their progress. Beats are marked seen from what the save
// has already done; backfilled beats show no scene.

/** Proof, from a v1 save, that the player already used what a beat turns on */
const EVIDENCE: Partial<Record<BeatId, (s: GameState) => boolean>> = {
  first_renown: (s) => s.monstersDefeated > 0,
  call_to_arms: (s) => s.fightersRallied > 0 || (s.waveNumber >= 3 && !s.waveActive),
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
  // The whole table: the pause only stops the director from offering new beats
  const main = STORY_BEATS.filter((b) => !b.side)
  const lastProven = main.reduce((last, b, i) => (EVIDENCE[b.id]?.(save) ? i : last), -1)

  const work: GameState = { ...save, beatsSeen: [] }
  for (let i = 0; i < main.length; i++) {
    const beat = main[i]
    if (i > lastProven && !beat.trigger(work)) break
    work.beatsSeen = [...work.beatsSeen, beat.id]
  }

  for (const beat of STORY_BEATS.filter((b) => b.side)) {
    if (beat.trigger(work) || SIDE_EVIDENCE[beat.id]?.(save)) {
      work.beatsSeen = [...work.beatsSeen, beat.id]
    }
  }

  return { ...save, beatsSeen: work.beatsSeen, playSeconds: 0, lastBeatAtPlaySec: 0 }
}

/**
 * Beats added to the table before ones a save has already seen (first_renown, say) must not play
 * their scene for that save. On every load, any unseen main beat that sits before the furthest seen
 * main beat, and whose trigger or evidence holds, is marked seen with no scene. It is slotted into
 * beatsSeen before the first seen beat that follows it in the table, so the order stays sensible.
 */
export function catchUpBeats(save: GameState): GameState {
  const main = STORY_BEATS.filter((b) => !b.side)
  const furthest = main.reduce((last, b, i) => (save.beatsSeen.includes(b.id) ? i : last), -1)
  if (furthest < 0) return save

  const order = (id: string) => STORY_BEATS.findIndex((b) => b.id === id)
  let seen = save.beatsSeen
  for (let i = 0; i < furthest; i++) {
    const beat = main[i]
    if (seen.includes(beat.id)) continue
    if (!(beat.trigger(save) || EVIDENCE[beat.id]?.(save))) continue
    const at = seen.findIndex((id) => order(id) > order(beat.id))
    seen = at === -1 ? [...seen, beat.id] : [...seen.slice(0, at), beat.id, ...seen.slice(at)]
  }
  return seen === save.beatsSeen ? save : { ...save, beatsSeen: seen }
}
