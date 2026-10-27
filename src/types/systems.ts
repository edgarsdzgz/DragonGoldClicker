import type { GameState } from './state'
import { STORY_BEATS } from './story'

// =============================================================================
// STORY-DRIVEN SYSTEM SWITCHES
// =============================================================================
// Nothing here is stored. A system is "on" when a seen beat unlocks it, so
// beatsSeen is the single source of truth for what the player has discovered.

/** Every gameplay system a beat can switch on */
export type SystemId =
  | 'slay'
  | 'rally'
  | 'siege'
  | 'repair'
  | 'hunger'
  | 'forageTab'
  | 'wanderers'
  | 'draconiaTab'
  | 'expeditions'
  | 'offline'
  | 'reassignment'
  | 'threatUnfloored'

/** Buildings that start fogged on the Draconia map and are revealed by a beat */
export type BuildingRevealId = 'forge' | 'keep' | 'lodge' | 'outpost' | 'librarium'

/** City HP cannot drop below this until `threatUnfloored` (enforced in a later group) */
export const HP_FLOOR = 50

function seenBeats(state: Pick<GameState, 'beatsSeen'>) {
  const seen = state.beatsSeen ?? []
  return STORY_BEATS.filter((b) => seen.includes(b.id))
}

/** Whether a system has been unlocked by a beat the player has seen. `slay` is always on. */
export function isSystemOn(state: Pick<GameState, 'beatsSeen'>, id: SystemId): boolean {
  if (id === 'slay') return true
  return seenBeats(state).some((b) => b.unlocks.includes(id))
}

/** Whether a fogged building has been revealed by a beat the player has seen */
export function isBuildingRevealed(state: Pick<GameState, 'beatsSeen'>, id: BuildingRevealId): boolean {
  return seenBeats(state).some((b) => b.reveals?.includes(id) ?? false)
}
