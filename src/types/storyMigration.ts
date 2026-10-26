import type { GameState } from './state'
import type { BeatId } from './story'
import { STORY_BEATS } from './story'
import { DEFEND_THE_WALL_KILLS, MEND_THE_WALLS_REPAIRERS, OPEN_THE_GATES_PEOPLE } from './quests'

// =============================================================================
// SAVE v1 -> v2: BACKFILL STORY PROGRESS
// =============================================================================
// Existing players keep their progress. Beats are marked seen from what the save
// has already done; backfilled beats show no scene.

/** Whether the save has played at all (so the opening scenes are not replayed for it) */
export function hasPlayed(s: GameState): boolean {
  // waveActive is only ever set by saves from before waves were put away: one that began a wave has played
  if (s.totalClicks > 0 || s.monstersDefeated > 0 || s.waveActive || s.totalInspirationEarned > 0) return true
  // Anything a later beat turns on counts too
  return Object.values(EVIDENCE).some((proof) => proof?.(s)) || Object.values(SIDE_EVIDENCE).some((proof) => proof?.(s))
}

/** Proof, from a v1 save, that the player already used what a beat turns on */
const EVIDENCE: Partial<Record<BeatId, (s: GameState) => boolean>> = {
  first_renown: (s) => s.monstersDefeated > 0,
  call_to_arms: (s) => s.fightersRallied > 0 || s.monstersDefeated >= DEFEND_THE_WALL_KILLS,
  the_breach: (s) => s.hpUnlocked,
  mend_the_walls: (s) => s.repairersDirected > 0,
  the_wall_is_yours: (s) => s.repairersDirected >= MEND_THE_WALLS_REPAIRERS,
  sharpen_claws: (s) => s.clawLevel >= 1,
  strangers_at_gate: (s) => s.wanderersWelcomed > 0,
  a_city_to_build: (s) => s.wanderersWelcomed >= OPEN_THE_GATES_PEOPLE,
  empty_stores: (s) => s.foodSystemActive || s.foragers.gatherers > 0,
  the_smith: (s) => s.armoryBuilt,
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
  // A save that has not played at all gets the opening, like a fresh install
  if (!hasPlayed(save)) return { ...save, beatsSeen: [], playSeconds: 0, lastBeatAtPlaySec: 0 }
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

/** Add a beat to beatsSeen before the first seen beat that follows it in the table */
function insertInOrder(seen: string[], id: string): string[] {
  const order = (b: string) => STORY_BEATS.findIndex((x) => x.id === b)
  const at = seen.findIndex((other) => order(other) > order(id))
  return at === -1 ? [...seen, id] : [...seen.slice(0, at), id, ...seen.slice(at)]
}

/** The opening scenes, in order */
const OPENING_BEATS: BeatId[] = ['prologue', 'elder_approaches']

/**
 * Beats added to the table before ones a save has already seen (first_renown, say) must not play
 * their scene for that save. On every load, any unseen main beat that sits before the furthest seen
 * main beat, and whose trigger or evidence holds, is marked seen with no scene. It is slotted into
 * beatsSeen before the first seen beat that follows it in the table, so the order stays sensible.
 */
export function catchUpBeats(save: GameState): GameState {
  // A save that has fought (or, from before waves were put away, began one) never gets the
  // opening replayed, whatever its beatsSeen says
  if (save.monstersDefeated > 0 || save.waveActive) {
    let seenNow = save.beatsSeen
    for (const id of OPENING_BEATS) if (!seenNow.includes(id)) seenNow = insertInOrder(seenNow, id)
    if (seenNow !== save.beatsSeen) save = { ...save, beatsSeen: seenNow }
  }
  const main = STORY_BEATS.filter((b) => !b.side)
  const furthest = main.reduce((last, b, i) => (save.beatsSeen.includes(b.id) ? i : last), -1)
  if (furthest < 0) return save

  let seen = save.beatsSeen
  for (let i = 0; i < furthest; i++) {
    const beat = main[i]
    if (seen.includes(beat.id)) continue
    if (!(beat.trigger(save) || EVIDENCE[beat.id]?.(save))) continue
    seen = insertInOrder(seen, beat.id)
  }
  return seen === save.beatsSeen ? save : { ...save, beatsSeen: seen }
}
