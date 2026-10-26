import type { ComponentProps } from 'react'
import type { Ionicons } from '@expo/vector-icons'

// =============================================================================
// THE ROSTER: every monster that can come to the gate (data only)
// =============================================================================

export interface MonsterDef {
  id: string
  name: string
  /** For "4 kobolds left" */
  plural: string
  glyph: ComponentProps<typeof Ionicons>['name']
  hp: number
  /** Inspiration paid when it dies */
  bounty: number
  /** The horde's advance (`hordeKills`) at which this monster debuts in the spawn pool (types/spawnPool.ts) */
  fromKills: number
  /** Wall damage each time it strikes, every WALL_STRIKE_SEC it stands at the gate (types/wall.ts) */
  wallStrike: number
}

/**
 * Provisional numbers; balance comes with the simulator. The debut thresholds are the old wave
 * boundaries (waves 0-2 kobold, 3-5 goblin, 6-10 crawler, 11+ orc) counted in kills.
 * Wall strikes are core-tap layer 6.
 */
export const MONSTERS: MonsterDef[] = [
  { id: 'kobold', name: 'Kobold', plural: 'kobolds', glyph: 'paw', hp: 5, bounty: 0.25, fromKills: 0, wallStrike: 1 },
  { id: 'goblin', name: 'Goblin', plural: 'goblins', glyph: 'skull', hp: 8, bounty: 0.4, fromKills: 13, wallStrike: 1.5 },
  { id: 'shadow_crawler', name: 'Shadow Crawler', plural: 'shadow crawlers', glyph: 'bug', hp: 12, bounty: 0.6, fromKills: 28, wallStrike: 2 },
  { id: 'orc', name: 'Orc', plural: 'orcs', glyph: 'flame', hp: 20, bounty: 1.0, fromKills: 53, wallStrike: 4 },
  // Never from the spawn pool: only a Raid on the Stores brings it (types/foodEvents.ts). It runs
  // for the stores, not the wall, so it never strikes.
  { id: 'raider', name: 'Raider', plural: 'raiders', glyph: 'walk', hp: 10, bounty: 0.5, fromKills: Infinity, wallStrike: 0 },
]
