// Barrel re-export -- all game types, constants, and helpers.
// Domain modules: soldiers, foragers, explorers, food, state, reassignment.

export type {
  SoldierTier,
  SoldierTierDef,
  SoldierCounts,
  BarracksLevelDef,
  AvatarWeaponDef,
} from './soldiers'
export {
  SOLDIER_TIERS,
  BARRACKS_LEVELS,
  MAX_BARRACKS_LEVEL,
  ARMORY_COST,
  SWORD_COST,
  SHIELD_COST,
  SWORD_BONUS,
  SHIELD_BONUS,
  AVATAR_WEAPONS,
  getTotalSoldiers,
  getSoldierCap,
  getBarracksUpgradeCost,
  getSoldierCost,
  getSoldierCount,
  getEffectiveAutoRate,
  getTierIndex,
  getPromotionCost,
  getPromotionTargets,
} from './soldiers'

export type {
  ForagerTier,
  ForagerTierDef,
  ForagerCounts,
  LodgeLevelDef,
} from './foragers'
export {
  FORAGER_TIERS,
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
  EXPLORER_COST,
  EXPEDITION_INSPIRATION_COST,
  EXPEDITION_FOOD_COST,
  EXPEDITION_DURATION,
  EXPEDITION_PITY_THRESHOLD,
  rollExpeditionReward,
  getPostUpgradeCost,
  getExplorerCap,
} from './explorers'

export type { StarvationResult } from './food'
export {
  STARTING_FOOD,
  STARTING_VILLAGERS,
  FOOD_CHECK_INTERVAL,
  FOOD_CONSUMPTION,
  STARVATION_DEATH_CHANCE,
  PROFESSIONAL_STARVATION_CHANCE,
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
  shouldRevealExplorerPost,
  formatNumber,
} from './state'

export type {
  RoleId,
  ReassignOption,
} from './reassignment'
export {
  REASSIGN_REFUND_RATE,
  DISMISS_REFUND_RATE,
  getRoleTierIndex,
  getTrainingCost,
  getRecruitCost,
  getReassignOptions,
} from './reassignment'

export type {
  WandererType,
  TrainedRole,
  WandererEncounter,
} from './wanderers'
export {
  WANDERER_COOLDOWN,
  getEncounterName,
  getTrainedRoleName,
  getTrainedBuildingName,
  rollWandererCheck,
  getTrainedOverflowRefund,
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
