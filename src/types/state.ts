import type { SoldierCounts } from './soldiers'
import type { RationId } from './rations'
import { DEFAULT_RATION } from './rations'
import type { ForagerCounts } from './foragers'
import { getTotalForagers } from './foragers'
import { getTotalSoldiers } from './soldiers'
import type { ActiveExpedition } from './explorers'
import { STARTING_FOOD, STARTING_VILLAGERS } from './food'
import { STARTING_CITY_HP } from './siege'
import type { StarvationResult } from './food'
import type { WandererEncounter } from './wanderers'
import { STARTING_TAP_DAMAGE, FIRST_MONSTER_HP } from './monsters'

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
  { level: 1, maxSeconds: 5 * 3600, cost: 25, label: '5 hours' },
  { level: 2, maxSeconds: 7 * 3600, cost: 100, label: '7 hours' },
  { level: 3, maxSeconds: 9 * 3600, cost: 250, label: '9 hours' },
  { level: 4, maxSeconds: 12 * 3600, cost: 400, label: '12 hours' },
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

export const DRACONIA_HALL_COST = 7.5

// =============================================================================
// GAME STATE
// =============================================================================

export interface GameState {
  /** Renown (player-facing name). The identifier stays `inspiration` until the save-migrating rename. */
  inspiration: number
  food: number
  villagers: number
  villagersLost: number
  /** Food system activates when triggered by milestone (barracks built) */
  foodSystemActive: boolean
  /** Lifetime renown earned (identifier predates the rename to renown) */
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
  /** Lifetime renown spent (identifier predates the rename to renown) */
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
  /** Food the player gathered with the FORAGE button (not gatherers), lifetime */
  foodGatheredByHand: number
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
  /** Number of active fighters (earn inspiration via auto-combat) */
  fighters: number
  /** Lifetime fighters rallied (for cost curve, never decreases) */
  fightersRallied: number
  /** Number of active repairers (heal city HP during siege) */
  repairers: number
  /** Lifetime repairers directed (for cost curve, never decreases) */
  repairersDirected: number
  /** Current city HP (0 = game over) */
  cityHp: number
  /** Accumulator for siege damage ticks (seconds) */
  siegeTimer: number
  /** Fractional accumulator for repair HP */
  repairProgress: number
  /** Whether the city HP / siege system is unlocked (trigger TBD) */
  hpUnlocked: boolean
  /** Whether the Librarium has been built */
  librariumBuilt: boolean
  /** IDs of completed research nodes */
  completedResearch: string[]
  /** Milestone thresholds already offered (each fires once) */
  milestonesOffered: number[]
  /** Story beat ids already seen, in the order they fired. Systems are derived from this. */
  beatsSeen: string[]
  /** Quests completed (types/quests.ts), in the order they were done */
  questsDone: string[]
  /** Guided tutorial steps already completed (see types/tutorial.ts) */
  tutorialStepsDone: string[]
  /** Scripted first occurrences already run (see types/scripted.ts) */
  scriptedDone: string[]
  /** Active play time in game seconds (ticked by the game loop, follows dev speed) */
  playSeconds: number
  /** playSeconds when the last beat fired (the dwell clock) */
  lastBeatAtPlaySec: number
  /** Wanderer waiting at the gate. Set by the wander tick from the same state it decided on. */
  pendingWanderer: WandererEncounter | null
  /** Who starved in the last food check, until the player dismisses the report. Not saved. */
  pendingStarvationReport: StarvationResult | null
  /** Food warning level waiting to be shown (0 = none). Not saved. */
  pendingFoodWarning: 0 | 3 | 1
  /** Warning level of the last food check, so a warning only pops up when it escalates. Not saved. */
  lastFoodWarning: 0 | 3 | 1
  /** Damage one tap deals to the monster */
  tapDamage: number
  /** Which MONSTERS entry the player is facing */
  monsterIndex: number
  /** Hit points the current monster has left (fractional: fighters chip it a quarter at a time) */
  monsterHp: number
  /** Lifetime kills per monster id (the spawn pool's debuts and per-type quests read it) */
  killsByMonster: Record<string, number>
  /** The fighters' rations (types/rations.ts); full by default */
  ration: RationId
  /** Fighter swings that have landed, lifetime (the Warfront floats a number for each new one) */
  allyStrikes: number
  /** Monsters killed by fighters rather than by a tap, lifetime */
  allyKills: number
  /**
   * Wave fields: in cold storage for a later wave mode (src/modes/waves). The main game no
   * longer reads or writes them; they stay in the save so that mode has them when it returns.
   * Current wave. Wave 0 is the 3-kobold opening; Wave 1 onward have 5 monsters of one type. */
  waveNumber: number
  /** Monsters already killed in the current wave (0-4) */
  waveKills: number
  /** In a wave (monsters on the field) or in camp between waves, waiting for Begin wave */
  waveActive: boolean
  /** Save format version for migrations */
  saveMigrationVersion: number
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
  clickPower: 0.05,
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
  foodGatheredByHand: 0,
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
  fighters: 0,
  fightersRallied: 0,
  repairers: 0,
  repairersDirected: 0,
  cityHp: STARTING_CITY_HP,
  siegeTimer: 0,
  repairProgress: 0,
  hpUnlocked: false,
  librariumBuilt: false,
  completedResearch: [],
  milestonesOffered: [],
  beatsSeen: [],
  questsDone: [],
  tutorialStepsDone: [],
  scriptedDone: [],
  playSeconds: 0,
  lastBeatAtPlaySec: 0,
  pendingWanderer: null,
  pendingStarvationReport: null,
  pendingFoodWarning: 0,
  lastFoodWarning: 0,
  tapDamage: STARTING_TAP_DAMAGE,
  monsterIndex: 0,
  monsterHp: FIRST_MONSTER_HP,
  killsByMonster: {},
  ration: DEFAULT_RATION,
  allyStrikes: 0,
  allyKills: 0,
  waveNumber: 0,
  waveKills: 0,
  waveActive: false,
  saveMigrationVersion: 9,
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
  fighters: number = 0,
  repairers: number = 0,
): number {
  return getTotalSoldiers(soldiers) + getTotalForagers(foragers) + explorers + fighters + repairers
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
  return n.toFixed(2)
}

/** Whole things (food, trips, people): no decimals below 1,000, then the same K/M/B as formatNumber */
export function formatCount(n: number): string {
  if (n >= 1_000) return formatNumber(n)
  return String(Math.floor(n))
}

/** An amount that may have a half (18.5): whole numbers stay whole, others get one decimal */
export function formatAmount(n: number): string {
  const r = Math.round(n * 10) / 10
  return Number.isInteger(r) ? String(r) : r.toFixed(1)
}

export { roundInsp, roundCost } from './utils'
