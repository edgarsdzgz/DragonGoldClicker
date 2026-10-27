import type { GameState } from './state'
import type { BeatId } from './story'
import { STORY_BEATS } from './story'
import { DEFEND_THE_WALL_KILLS, MEND_THE_WALLS_REPAIRERS, OPEN_THE_GATES_PEOPLE } from './quests'
import { MAX_CLAW_LEVEL } from './claws'

// =============================================================================
// STORY CATCH-UP: a beat added to the table behind the player's progress is marked seen, with no
// scene, on load; and the dev panel's story jump marks the scripted events it skips as run
// =============================================================================

/** Proof that the player already used what a beat turns on */
const EVIDENCE: Partial<Record<BeatId, (s: GameState) => boolean>> = {
  first_renown: (s) => s.monstersDefeated > 0,
  call_to_arms: (s) => s.fightersRallied > 0 || s.monstersDefeated >= DEFEND_THE_WALL_KILLS,
  mend_the_walls: (s) => s.repairersDirected > 0,
  the_wall_is_yours: (s) => s.repairersDirected >= MEND_THE_WALLS_REPAIRERS,
  sharpen_claws: (s) => s.clawLevel >= 1,
  strangers_at_gate: (s) => s.wanderersWelcomed > 0,
  a_city_to_build: (s) => s.wanderersWelcomed >= OPEN_THE_GATES_PEOPLE,
  empty_stores: (s) => s.foragers.gatherers > 0,
  the_smith: (s) => s.armoryBuilt,
  the_keep_stands: (s) => s.draconiaHallBuilt || s.lodgeLevel > 0,
  the_lodge: (s) => s.lodgeLevel > 0,
  the_keep: (s) => s.draconiaHallBuilt,
  the_scholar: (s) => s.librariumBuilt,
  the_horde_grows: (s) => s.completedResearch.length > 0,
  beyond_the_walls: (s) => s.postLevel > 0,
  dragonsteel: (s) => s.clawLevel > MAX_CLAW_LEVEL,
}

/** Scripted events of beats the save has already seen are treated as run (no replays) */
export function backfillScripted(save: GameState): string[] {
  return STORY_BEATS
    .filter((b) => b.scripted && save.beatsSeen.includes(b.id))
    .map((b) => b.scripted as string)
    .filter((id) => id !== 'firstExpedition' || save.nextExpeditionId > 1)
}

/** Add a beat to beatsSeen before the first seen beat that follows it in the table */
function insertInOrder(seen: string[], id: string): string[] {
  const order = (b: string) => STORY_BEATS.findIndex((x) => x.id === b)
  const at = seen.findIndex((other) => order(other) > order(id))
  return at === -1 ? [...seen, id] : [...seen.slice(0, at), id, ...seen.slice(at)]
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

  let seen = save.beatsSeen
  for (let i = 0; i < furthest; i++) {
    const beat = main[i]
    if (seen.includes(beat.id)) continue
    if (!(beat.trigger(save) || EVIDENCE[beat.id]?.(save))) continue
    seen = insertInOrder(seen, beat.id)
  }
  return seen === save.beatsSeen ? save : { ...save, beatsSeen: seen }
}
