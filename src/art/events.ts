import type { SpriteId } from './manifest'
import type { WandererType } from '../types/wanderers'
import type { FoodEventId } from '../types/foodEvents'

// =============================================================================
// THE EVENTS' ART: each card's picture, the food events' badges, the people at work
// =============================================================================

/** Welcome Back (time away): dawn over the wall */
export const WELCOME_BACK_PICTURE: SpriteId = 'evt_welcome-back'
/** The Breach report: the broken gate at dawn */
export const BREACH_REPORT_PICTURE: SpriteId = 'evt_breach-report'
/** Refugees at the Gate: a group on the road to the gate */
export const REFUGEES_PICTURE: SpriteId = 'evt_refugees'
/** The FORAGE orb: basket and sheaf */
export const FORAGE_ORB_ART: SpriteId = 'evt_forage-action'
/** Starvation is near (red: danger) */
export const STARVING_ICON: SpriteId = 'evt_food-warning'

/** An expedition's picture, one per title: The Wasteland Was Silent, A Light in the Dark, Survivors Spotted, A Lucky Find */
export function expeditionPicture(villagersFound: number): SpriteId {
  if (villagersFound <= 0) return 'evt_exp-silent'
  if (villagersFound === 1) return 'evt_exp-light'
  if (villagersFound === 2) return 'evt_exp-survivors'
  return 'evt_exp-find'
}

const WANDERER_PICTURE: Record<WandererType, SpriteId> = {
  lone_wanderer: 'evt_wanderer-lone',
  traveling_couple: 'evt_wanderer-couple',
  small_family: 'evt_wanderer-family',
  veteran: 'evt_wanderer-veteran',
}

/** The wanderers on the road, by who comes */
export function wandererPicture(type: WandererType): SpriteId {
  return WANDERER_PICTURE[type]
}

const FOOD_EVENT_BADGE: Record<FoodEventId, SpriteId> = {
  lean_season: 'evt_food-lean',
  bountiful_harvest: 'evt_food-bountiful',
  raid: 'evt_food-raid',
  refugees: 'evt_food-refugees',
}

/** A food event's badge */
export function foodEventBadge(id: FoodEventId): SpriteId {
  return FOOD_EVENT_BADGE[id]
}

/** The roles drawn as small figures: the soldier ranks, the forager tiers and the explorer */
export type FigureRole = 'conscript' | 'footman' | 'knight' | 'gatherer' | 'trapper' | 'ranger' | 'explorer'

/** A role's small figure */
export function roleFigure(role: FigureRole): SpriteId {
  return `ppl_${role}` as SpriteId
}
