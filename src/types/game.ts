// Barrel re-export -- all game types, constants, and helpers.
// Domain modules: soldiers, foragers, explorers, fighters, food, state, reassignment.

export type {
  SoldierTier,
  SoldierTierDef,
  SoldierCounts,
  BarracksLevelDef,
} from './soldiers'
export {
  SOLDIER_TIERS,
  BARRACKS_LEVELS,
  MAX_BARRACKS_LEVEL,
  getTotalSoldiers,
  getSoldierCap,
  getBarracksUpgradeCost,
  getSoldierCost,
  getSoldierCount,
  getTierIndex,
} from './soldiers'

export type { Gear, GearBlock } from './forge'
export {
  ARMORY_COST,
  SWORD_BASE_COST,
  SHIELD_BASE_COST,
  SWORD_DAMAGE_BONUS,
  gearCost,
  gearBlock,
  nextGearRank,
} from './forge'

export type {
  ForagerTier,
  ForagerTierDef,
  ForagerCounts,
  LodgeLevelDef,
} from './foragers'
export {
  FORAGER_TIERS,
  BASE_GATHERER_CAP,
  LODGE_LEVELS,
  MAX_LODGE_LEVEL,
  getTotalForagers,
  getForagerCap,
  getLodgeUpgradeCost,
  getForagerCost,
  getForagerCount,
  getAutoFoodRate,
  getForageYield,
} from './foragers'

export type {
  PostLevelDef,
  ActiveExpedition,
} from './explorers'
export {
  POST_LEVELS,
  MAX_POST_LEVEL,
  EXPLORER_BASE_COST,
  EXPEDITION_FOOD_COST,
  EXPEDITION_DURATION,
  EXPEDITION_PITY_THRESHOLD,
  rollExpeditionReward,
  getPostUpgradeCost,
  getExplorerCap,
} from './explorers'

export {
  FIGHTER_BASE_COST,
  FIGHTER_COST_EXPONENT,
  FIGHTER_HIT_DAMAGE,
  FIGHTER_SWING_MS,
  FIGHTER_TICK_MS,
  FIGHTER_FOOD_COST,
  REPAIR_UNLOCK_FIGHTERS,
  REPAIRER_BASE_COST,
  REPAIRER_COST_EXPONENT,
  REPAIRER_FOOD_COST,
  getFighterCost,
  getRepairerCost,
  getFighterDps,
  stepFighterVolley,
} from './fighters'

export {
  STARTING_FOOD,
  STARTING_VILLAGERS,
  FOOD_ACTIVATE_CONSCRIPTS,
  FOOD_ACTIVATE_BUILDINGS,
  FOOD_CHECK_INTERVAL,
  GRANARY_CAP,
  granaryRoom,
  FOOD_CONSUMPTION,
  getFoodConsumption,
  getFoodEventsRemaining,
} from './food'

export type {
  GameState,
  OfflineLevelDef,
} from './state'
export {
  OFFLINE_LEVELS,
  MAX_OFFLINE_LEVEL,
  getOfflineMaxSeconds,
  getOfflineUpgradeCost,
  DRACONIA_HALL_COST,
  DEFAULT_GAME_STATE,
  getTotalAssigned,
  formatNumber,
  formatCount,
  formatAmount,
  countOf,
} from './state'

export {
  roundInsp,
  roundCost,
} from './utils'

export type {
  RoleId,
  ReassignOption,
} from './reassignment'
export {
  BASIC_ROLES,
  sameRole,
  roleCount,
  roleName,
  peopleAtWork,
  moveTargets,
  moveBlock,
  movePerson,
  getReassignOptions,
} from './reassignment'

export type {
  WandererType,
  WandererEncounter,
} from './wanderers'
export {
  WANDERER_GAP_MIN_SEC,
  WANDERER_GAP_MAX_SEC,
  SHORT_HANDED_VILLAGERS,
  getEncounterName,
  rollWandererEncounter,
  stepWanderers,
  canWelcome,
  welcomeWanderer,
  turnAwayWanderer,
} from './wanderers'

export type {
  ResearchCategory,
  ResearchEffect,
  ResearchPrereq,
  ResearchNodeDef,
  ResearchBonuses,
} from './research'
export {
  LIBRARIUM_COST,
  RESEARCH_CATEGORIES,
  RESEARCH_NODES,
  getResearchNode,
  getNodesByCategory,
  getResearchBonuses,
} from './research'

export {
  STARTING_CITY_HP,
  MAX_CITY_HP,
  REPAIR_RATE_PER_REPAIRER,
  getRepairRate,
} from './siege'
export {
  WALL_STRIKE_SEC,
  HORDE_LEVEL_KILLS,
  hordeLevel,
  wallStrikeDamage,
  wallWarningCrossed,
  wallTone,
} from './wall'
export type { WallWarning } from './wall'


export type { SystemId, BuildingRevealId } from './systems'
export { HP_FLOOR, isSystemOn, isBuildingRevealed } from './systems'

export type {
  BeatId,
  BeatDef,
  ScriptedEventId,
  SpotlightTarget,
  ObjectiveDef,
} from './story'
export { STORY_BEATS, getBeat } from './story'

export type { StoryPacing } from './storyDirector'
export { findNextBeat, effectiveDwell, TEST_DWELL_CAP_SEC } from './storyDirector'

export type { TutorialStep, TutorialStepId, TutorialUi, TutorialSheet } from './tutorial'
export { TUTORIAL_STEPS, EMPTY_TUTORIAL_UI, getActiveStep, isStepComplete } from './tutorial'

export type { FindKind, FindDef, FindSpot } from './valleyFinds'
export {
  FIND_KINDS,
  FIRST_FIND_TAP,
  FIND_ART_PX,
  findSize,
  applyFind,
  findGap,
  findSpots,
  pickFind,
  pickSpot,
} from './valleyFinds'
