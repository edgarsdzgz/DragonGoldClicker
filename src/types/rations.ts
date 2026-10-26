import type { GameState } from './state'

// =============================================================================
// RATIONS (core-tap layer 3.4): how well the fighters are fed (data only)
// =============================================================================
// Owner ruling (2026-10-26): five rations. Full is the default; half and none are always there;
// quarter and double are unlocked by Librarium research. A ration multiplies the fighters' upkeep
// and their damage. No rations: the fighters stand down. They eat nothing and deal no damage, but
// still guard the wall (they count for its defence) and come back at once, with no new Rally.

export type RationId = 'none' | 'quarter' | 'half' | 'full' | 'double'

export interface RationDef {
  id: RationId
  label: string
  /** Multiplies what each fighter eats per meal */
  upkeep: number
  /** Multiplies the fighters' damage (0: they stand down) */
  damage: number
  /** Librarium research that unlocks it; none means always available */
  research?: string
}

/** In order from leanest to richest, as the selector shows them */
export const RATIONS: RationDef[] = [
  { id: 'none', label: 'None', upkeep: 0, damage: 0 },
  { id: 'quarter', label: 'Quarter', upkeep: 0.25, damage: 0.4, research: 'lean_rations' },
  { id: 'half', label: 'Half', upkeep: 0.5, damage: 0.7 },
  { id: 'full', label: 'Full', upkeep: 1, damage: 1 },
  { id: 'double', label: 'Double', upkeep: 2, damage: 1.4, research: 'feast_hall' },
]

export const DEFAULT_RATION: RationId = 'full'

export function rationDef(id: RationId | undefined): RationDef {
  return RATIONS.find((r) => r.id === id) ?? RATIONS.find((r) => r.id === DEFAULT_RATION)!
}

export function isRationAvailable(s: Pick<GameState, 'completedResearch'>, id: RationId): boolean {
  const def = rationDef(id)
  return !def.research || s.completedResearch.includes(def.research)
}
