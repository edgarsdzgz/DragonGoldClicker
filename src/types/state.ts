import type { SoldierCounts } from './soldiers'
import type { ForagerCounts } from './foragers'
import { getTotalForagers } from './foragers'
import { getTotalSoldiers } from './soldiers'
import type { ActiveExpedition } from './explorers'
import { STARTING_FOOD, STARTING_VILLAGERS } from './food'

// =============================================================================
// OFFLINE PROGRESS
// =============================================================================

export interface OfflineLevelDef {
  level: number
  maxSeconds: number
  cost: number
  label: string
}

export const OFFLINE_LEVELS: OfflineLevelDef[] = [
  { level: 0, maxSeconds: 3 * 3600, cost: 0, label: '3 hours' },
  { level: 1, maxSeconds: 5 * 3600, cost: 500, label: '5 hours' },
  { level: 2, maxSeconds: 7 * 3600, cost: 2000, label: '7 hours' },
  { level: 3, maxSeconds: 9 * 3600, cost: 5000, label: '9 hours' },
  { level: 4, maxSeconds: 12 * 3600, cost: 8000, label: '12 hours' },
]

export const MAX_OFFLINE_LEVEL = OFFLINE_LEVELS.length - 1

export function getOfflineMaxSeconds(level: number): number {
  const def = OFFLINE_LEVELS[level] ?? OFFLINE_LEVELS[0]
  return def.maxSeconds
}

export function getOfflineUpgradeCost(currentLevel: number): number | null {
  const next = OFFLINE_LEVELS[currentLevel + 1]
  return next?.cost ?? null
}

// =============================================================================
// DRACONIA HALL
// =============================================================================

export const DRACONIA_HALL_COST = 150

// =============================================================================
// GAME STATE
// =============================================================================

export interface GameState {
  inspiration: number
  food: number
  villagers: number
  villagersLost: number
  /** Food system activates when triggered by milestone (barracks built) */
  foodSystemActive: boolean
  totalInspirationEarned: number
  monstersDefeated: number
  barracksLevel: number
  armoryBuilt: boolean
  soldiers: SoldierCounts
  /** Lifetime count of soldiers trained per tier (never decreases). Used for cost curve. */
  soldiersTrained: SoldierCounts
  armoryGear: {
    swords: number
    shields: number
  }
  clickPower: number
  ownedWeapons: string[]
  autoProgress: number
  /** Accumulator for food consumption (fractional seconds between checks) */
  foodTimer: number
  totalInspirationSpent: number
  totalClicks: number
  soldiersPromoted: number
  startedAt: number
  lastSavedAt: number
  offlineLevel: number
  /** Food gained per forage click (base amount before bonus) */
  foragePower: number
  /** Bonus multiplier for foraging (0.10 = 10% bonus). Applied as Math.ceil(foragePower * (1 + forageBonus)) */
  forageBonus: number
  /** Lifetime total food gathered by foraging */
  totalFoodForaged: number
  /** Lifetime forage click count */
  forageClicks: number
  /** Forager's Lodge level (0 = not built) */
  lodgeLevel: number
  /** Current forager counts by tier */
  foragers: ForagerCounts
  /** Lifetime foragers trained per tier (for cost curve) */
  foragersTrained: ForagerCounts
  /** Fractional accumulator for auto food income */
  autoFoodProgress: number
  /** Whether the Draconia Hall has been built */
  draconiaHallBuilt: boolean
  /** Explorer's Post level (0 = not built) */
  postLevel: number
  /** Current number of trained explorers */
  explorers: number
  /** Lifetime explorers trained (for cost curve) */
  explorersTrained: number
  /** Active expeditions in progress */
  activeExpeditions: ActiveExpedition[]
  /** Counter for unique expedition IDs */
  nextExpeditionId: number
  /** Lifetime villagers rescued via expeditions */
  villagersRescued: number
  /** Consecutive expeditions that found 0 villagers (resets on find) */
  expeditionDryStreak: number
  /** Whether the explorer intro dialog has been shown */
  explorerIntroShown: boolean
  /** Timestamp of last wanderer eligibility check */
  lastWandererCheck: number
  /** Lifetime wanderers welcomed into Draconia */
  wanderersWelcomed: number
  /** Number of active repairers (heal city HP during siege) */
  repairers: number
  /** Whether the Librarium has been built */
  librariumBuilt: boolean
  /** IDs of completed research nodes */
  completedResearch: string[]
}

export const DEFAULT_GAME_STATE: GameState = {
  inspiration: 0,
  food: STARTING_FOOD,
  villagers: STARTING_VILLAGERS,
  villagersLost: 0,
  foodSystemActive: false,
  totalInspirationEarned: 0,
  monstersDefeated: 0,
  barracksLevel: 0,
  armoryBuilt: false,
  soldiers: { conscripts: 0, footmen: 0, knights: 0 },
  soldiersTrained: { conscripts: 0, footmen: 0, knights: 0 },
  armoryGear: { swords: 0, shields: 0 },
  clickPower: 1,
  ownedWeapons: [],
  autoProgress: 0,
  foodTimer: 0,
  totalInspirationSpent: 0,
  totalClicks: 0,
  soldiersPromoted: 0,
  startedAt: Date.now(),
  lastSavedAt: Date.now(),
  offlineLevel: 0,
  foragePower: 1,
  forageBonus: 0,
  totalFoodForaged: 0,
  forageClicks: 0,
  lodgeLevel: 0,
  foragers: { gatherers: 0, trappers: 0, rangers: 0 },
  foragersTrained: { gatherers: 0, trappers: 0, rangers: 0 },
  autoFoodProgress: 0,
  draconiaHallBuilt: false,
  postLevel: 0,
  explorers: 0,
  explorersTrained: 0,
  activeExpeditions: [],
  nextExpeditionId: 1,
  villagersRescued: 0,
  expeditionDryStreak: 0,
  explorerIntroShown: false,
  lastWandererCheck: 0,
  wanderersWelcomed: 0,
  repairers: 0,
  librariumBuilt: false,
  completedResearch: [],
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Total villagers currently assigned to any role (soldiers + foragers + explorers).
 */
export function getTotalAssigned(
  soldiers: SoldierCounts,
  foragers: ForagerCounts,
  explorers: number,
): number {
  return getTotalSoldiers(soldiers) + getTotalForagers(foragers) + explorers
}

/**
 * Whether the Explorer's Post should be revealed in the shop.
 * Two paths:
 *  - Forager path: Lodge Lv1 + 2 foragers trained
 *  - Soldier path: Barracks Lv2 + 4 or fewer idle villagers
 */
export function shouldRevealExplorerPost(s: GameState): boolean {
  if (s.postLevel > 0) return true
  if (s.lodgeLevel >= 1 && getTotalForagers(s.foragers) >= 2) return true
  if (s.barracksLevel >= 2 && s.villagers <= 4) return true
  return false
}

// =============================================================================
// FORMATTING
// =============================================================================

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(1)}T`
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return Math.floor(n).toString()
}
