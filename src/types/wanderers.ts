import type { SoldierTier } from './soldiers'
import type { ForagerTier } from './foragers'
import { SOLDIER_TIERS } from './soldiers'
import { FORAGER_TIERS } from './foragers'
import { FOOD_CONSUMPTION } from './food'
import { DISMISS_REFUND_RATE } from './reassignment'

// =============================================================================
// WANDERER ENCOUNTERS
// =============================================================================

/** Minimum gold refund for trained overflow (whichever is greater: 30% or this) */
export const WANDERER_MIN_REFUND = 0.25

/** Seconds between wanderer eligibility checks */
export const WANDERER_COOLDOWN = 300

/** Base chance per check (0-1) */
export const WANDERER_BASE_CHANCE = 0.15

/** Chance bonus per active forager */
export const WANDERER_FORAGER_BONUS = 0.02

/** Chance bonus per active soldier */
export const WANDERER_SOLDIER_BONUS = 0.01

// =============================================================================
// TYPES
// =============================================================================

export type WandererType =
  | 'lone_wanderer'
  | 'traveling_couple'
  | 'small_family'
  | 'trained_refugee'

export type TrainedRole =
  | { type: 'soldier'; tier: SoldierTier }
  | { type: 'forager'; tier: ForagerTier }

export interface WandererEncounter {
  encounterType: WandererType
  villagerCount: number
  trained: TrainedRole | null
  flavorText: string
  /** Additional food per check if all accepted as idle villagers */
  foodCostPerCheck: number
}

// =============================================================================
// ENCOUNTER TABLE
// =============================================================================

interface WandererDef {
  type: WandererType
  weight: number
  villagerCount: number
  trained: boolean
}

const WANDERER_TABLE: WandererDef[] = [
  { type: 'lone_wanderer', weight: 60, villagerCount: 1, trained: false },
  { type: 'traveling_couple', weight: 25, villagerCount: 2, trained: false },
  { type: 'small_family', weight: 10, villagerCount: 3, trained: false },
  { type: 'trained_refugee', weight: 5, villagerCount: 1, trained: true },
]

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

const ENCOUNTER_NAMES: Record<WandererType, string> = {
  lone_wanderer: 'Lone Wanderer',
  traveling_couple: 'Traveling Couple',
  small_family: 'Small Family',
  trained_refugee: 'Trained Refugee',
}

export function getEncounterName(type: WandererType): string {
  return ENCOUNTER_NAMES[type]
}

export function getTrainedRoleName(trained: TrainedRole): string {
  if (trained.type === 'soldier') {
    return SOLDIER_TIERS.find((t) => t.id === trained.tier)?.name ?? 'Soldier'
  }
  return FORAGER_TIERS.find((t) => t.id === trained.tier)?.name ?? 'Forager'
}

export function getTrainedBuildingName(trained: TrainedRole): string {
  return trained.type === 'soldier' ? 'Barracks' : "Forager's Lodge"
}

// =============================================================================
// FLAVOR TEXT
// =============================================================================

type FlavorContext = 'fighting' | 'foraging' | 'generic'

const FLAVOR_TEXT: Record<WandererType, Record<FlavorContext, string[]>> = {
  lone_wanderer: {
    fighting: [
      'A lone traveler watched you and your warriors fend off a dragon and begs for shelter in Draconia.',
      'Drawn by the clash of steel, a wanderer saw you leading the charge and approaches your gates seeking refuge.',
      '"I saw you cut down that beast with my own eyes!" A wanderer kneels before you, pleading for shelter.',
    ],
    foraging: [
      'While gathering herbs, your foragers discovered a lost wanderer hiding in the brush.',
      'A starving soul stumbled into your foragers\' camp, pleading for a home.',
    ],
    generic: [
      'A weary traveler has arrived at the gates of Draconia, seeking shelter.',
    ],
  },
  traveling_couple: {
    fighting: [
      'A couple fleeing bandits watched you strike down their pursuers and asks to join Draconia.',
      'Two travelers, awed by the sight of you leading your warriors into battle, seek a new life in your city.',
    ],
    foraging: [
      'Your foragers found a couple sheltering in a hollow tree, barely surviving.',
      'A pair of travelers followed your foragers\' trail back to Draconia.',
    ],
    generic: [
      'A traveling couple has arrived, hoping Draconia will offer them safety.',
    ],
  },
  small_family: {
    fighting: [
      'A small family saw you and your soldiers drive back the monsters threatening their village and begs for sanctuary.',
      '"We heard you slew a dragon with your bare hands!" A desperate family arrives, seeking your protection.',
    ],
    foraging: [
      'Deep in the forest, your foragers stumbled upon a starving family hiding in a cave.',
      'A family of three was discovered near the foraging grounds, weak but alive.',
    ],
    generic: [
      'A small family arrives at your gates, their belongings on their backs, hoping for a fresh start.',
    ],
  },
  trained_refugee: {
    fighting: [
      'A battle-scarred veteran watched you fight alongside your warriors and offers their sword to you personally.',
      '"I\'ve never seen anyone command a battlefield like you." A trained fighter kneels, pledging loyalty.',
    ],
    foraging: [
      'Your foragers encountered a skilled survivor living off the land -- they wish to serve Draconia.',
      'A former ranger from a destroyed settlement was found by your foraging party.',
    ],
    generic: [
      'A skilled refugee arrives, offering their expertise in exchange for a home.',
    ],
  },
}

function pickFlavorText(type: WandererType, context: FlavorContext): string {
  const pool = FLAVOR_TEXT[type][context]
  return pool[Math.floor(Math.random() * pool.length)]
}

function getFlavorContext(totalSoldiers: number, totalForagers: number): FlavorContext {
  if (totalForagers > 0 && totalForagers >= totalSoldiers) return 'foraging'
  if (totalSoldiers > 0) return 'fighting'
  return 'generic'
}

// =============================================================================
// ROLL LOGIC
// =============================================================================

function pickTrainedRole(): TrainedRole {
  if (Math.random() < 0.5) {
    return { type: 'soldier', tier: 'conscript' }
  }
  return { type: 'forager', tier: 'gatherer' }
}

/**
 * Roll for a wanderer encounter. Returns null if no encounter triggered.
 */
export function rollWandererCheck(
  totalSoldiers: number,
  totalForagers: number,
  villagers: number,
  hasActiveExpeditions: boolean,
  postLevel: number,
): WandererEncounter | null {
  let chance = WANDERER_BASE_CHANCE
  chance += totalForagers * WANDERER_FORAGER_BONUS
  chance += totalSoldiers * WANDERER_SOLDIER_BONUS

  // Stuck pity: double chance when truly stuck
  if (villagers === 0 && !hasActiveExpeditions && postLevel === 0) {
    chance *= 2
  }

  if (Math.random() >= chance) return null

  // Weighted random pick
  const totalWeight = WANDERER_TABLE.reduce((sum, w) => sum + w.weight, 0)
  let roll = Math.random() * totalWeight
  let picked = WANDERER_TABLE[0]
  for (const def of WANDERER_TABLE) {
    roll -= def.weight
    if (roll <= 0) {
      picked = def
      break
    }
  }

  const context = getFlavorContext(totalSoldiers, totalForagers)
  const trained = picked.trained ? pickTrainedRole() : null

  // Calculate food cost per check
  let foodCostPerCheck = 0
  if (trained) {
    foodCostPerCheck = FOOD_CONSUMPTION[trained.tier] ?? FOOD_CONSUMPTION.villager
  } else {
    foodCostPerCheck = picked.villagerCount * FOOD_CONSUMPTION.villager
  }

  return {
    encounterType: picked.type,
    villagerCount: picked.villagerCount,
    trained,
    flavorText: pickFlavorText(picked.type, context),
    foodCostPerCheck,
  }
}

/**
 * Calculate refund gold when a trained refugee overflows building capacity.
 * Returns max(floor(baseCost * DISMISS_REFUND_RATE), WANDERER_MIN_REFUND).
 */
export function getTrainedOverflowRefund(trained: TrainedRole): number {
  let baseCost = 0
  if (trained.type === 'soldier') {
    baseCost = SOLDIER_TIERS.find((t) => t.id === trained.tier)?.baseCost ?? 0.25
  } else {
    baseCost = FORAGER_TIERS.find((t) => t.id === trained.tier)?.baseCost ?? 0.25
  }
  return Math.max(parseFloat((baseCost * DISMISS_REFUND_RATE).toFixed(2)), WANDERER_MIN_REFUND)
}
