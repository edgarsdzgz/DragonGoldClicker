import type { Ionicons } from '@expo/vector-icons'

// =============================================================================
// THE LIBRARIUM: LIRAE'S STUDIES (approved 2026-10-26)
// =============================================================================
// Four short chains, one per part of the siege. Each study is bought with renown and takes effect
// at once; each needs the one before it, and the first of a branch may need its building. No
// study raises the bounty: every HP still pays the same renown. The rules live in types/library.ts.

export const LIBRARIUM_COST = 200

export type ResearchCategory = 'dragon' | 'army' | 'stores' | 'wall' | 'wilds'

export const RESEARCH_CATEGORIES: {
  id: ResearchCategory
  name: string
  icon: keyof typeof Ionicons.glyphMap
  description: string
}[] = [
  { id: 'dragon', name: 'The Dragon', icon: 'flame', description: 'Your own strike' },
  { id: 'army', name: 'The Army', icon: 'shield', description: 'Soldiers, swords and the volley' },
  { id: 'stores', name: 'The Stores', icon: 'leaf', description: 'Food eaten and food brought in' },
  { id: 'wall', name: 'The Wall', icon: 'construct', description: 'Repairs, time away and the Breach' },
  { id: 'wilds', name: 'The Wilds', icon: 'compass', description: 'Expeditions beyond the walls' },
]

// =============================================================================
// EFFECTS
// =============================================================================

export type ResearchEffect =
  /** Taps deal this much more damage (0.1 = 10%) */
  | { type: 'tapDamageBonus'; value: number }
  /** The chance a tap strikes for double */
  | { type: 'doubleStrikeChance'; value: number }
  /** Soldier ranks cost this much less */
  | { type: 'soldierCostDiscount'; value: number }
  /** Added to how much harder an armed soldier hits (the Forge's 0.5) */
  | { type: 'swordBonus'; value: number }
  /** The army's volleys deal this much more */
  | { type: 'volleyBonus'; value: number }
  /** Fighters and repairers eat this much less */
  | { type: 'foodConsumptionReduction'; value: number }
  /** Foragers bring this much more food */
  | { type: 'gatherBonus'; value: number }
  /** Repairers mend this much faster */
  | { type: 'repairBonus'; value: number }
  /** Renown earned while away grows by this much */
  | { type: 'offlineMultiplier'; value: number }
  /** A Breach takes this share fewer people */
  | { type: 'breachLossReduction'; value: number }
  /** Expeditions take this much less time */
  | { type: 'expeditionSpeedBonus'; value: number }
  /** Taken off an expedition's chance to find nobody (0.35) */
  | { type: 'expeditionFindBonus'; value: number }

/** A building a study can need: the Garrison, the Forge, the Ranger's Lodge, the Keep or the Outpost */
export type ResearchBuilding = 'garrison' | 'forge' | 'lodge' | 'keep' | 'outpost'

export type ResearchPrereq =
  | { type: 'research'; id: string }
  | { type: 'building'; building: ResearchBuilding }

export interface ResearchNodeDef {
  id: string
  name: string
  description: string
  category: ResearchCategory
  icon: keyof typeof Ionicons.glyphMap
  cost: number
  prereqs: ResearchPrereq[]
  /** Empty for the ration unlocks: RationDef.research (types/rations.ts) names those nodes */
  effects: ResearchEffect[]
}

const after = (id: string): ResearchPrereq => ({ type: 'research', id })
const needs = (building: ResearchBuilding): ResearchPrereq => ({ type: 'building', building })

export const RESEARCH_NODES: ResearchNodeDef[] = [
  // -- THE DRAGON --
  {
    id: 'dragon_anatomy', name: 'Dragon Anatomy', category: 'dragon', icon: 'body', cost: 60,
    description: 'Lirae has drawn where a claw does the most harm. Taps deal 10% more damage.',
    prereqs: [],
    effects: [{ type: 'tapDamageBonus', value: 0.1 }],
  },
  {
    id: 'weak_points', name: 'Weak Points', category: 'dragon', icon: 'locate', cost: 150,
    description: 'Every beast has a seam in its hide. One tap in ten strikes for double.',
    prereqs: [after('dragon_anatomy')],
    effects: [{ type: 'doubleStrikeChance', value: 0.1 }],
  },
  {
    id: 'wyrms_fury', name: "Wyrm's Fury", category: 'dragon', icon: 'flame', cost: 400,
    description: 'The old wyrms fought with their whole weight. Taps deal 20% more damage.',
    prereqs: [after('weak_points')],
    effects: [{ type: 'tapDamageBonus', value: 0.2 }],
  },

  // -- THE ARMY --
  {
    id: 'drill_tactics', name: 'Drill Tactics', category: 'army', icon: 'fitness', cost: 60,
    description: 'Streamlined training. Soldier ranks cost 10% less.',
    prereqs: [needs('garrison')],
    effects: [{ type: 'soldierCostDiscount', value: 0.1 }],
  },
  {
    id: 'tempered_steel', name: 'Tempered Steel', category: 'army', icon: 'hammer', cost: 150,
    description: 'Kael learns the old quench. An armed soldier hits 75% harder (was 50%).',
    prereqs: [after('drill_tactics'), needs('forge')],
    effects: [{ type: 'swordBonus', value: 0.25 }],
  },
  {
    id: 'battle_drill', name: 'Battle Drill', category: 'army', icon: 'people', cost: 400,
    description: 'The ranks strike as one. The army\'s volleys deal 10% more.',
    prereqs: [after('tempered_steel')],
    effects: [{ type: 'volleyBonus', value: 0.1 }],
  },

  // -- THE STORES --
  {
    id: 'rationing', name: 'Rationing', category: 'stores', icon: 'restaurant', cost: 50,
    description: 'Careful meal planning. Fighters and repairers eat 15% less.',
    prereqs: [needs('lodge')],
    effects: [{ type: 'foodConsumptionReduction', value: 0.15 }],
  },
  {
    id: 'lean_rations', name: 'Lean Rations', category: 'stores', icon: 'remove-circle', cost: 80,
    description: 'Fighters learn to march on little. Unlocks quarter rations: a quarter of the food, 40% of the damage.',
    prereqs: [after('rationing')],
    effects: [],
  },
  {
    id: 'snares_and_nets', name: 'Snares and Nets', category: 'stores', icon: 'git-network', cost: 150,
    description: 'Old ways of taking game. Foragers bring 25% more food.',
    prereqs: [after('lean_rations')],
    effects: [{ type: 'gatherBonus', value: 0.25 }],
  },
  {
    id: 'feast_hall', name: 'Feast Hall', category: 'stores', icon: 'restaurant', cost: 300,
    description: 'A hall where fighters eat their fill before battle. Unlocks double rations: twice the food, 140% of the damage.',
    prereqs: [after('snares_and_nets')],
    effects: [],
  },

  // -- THE WALL --
  {
    id: 'mortar_craft', name: 'Mortar Craft', category: 'wall', icon: 'construct', cost: 60,
    description: 'A better mix sets faster. Repairers mend 25% faster.',
    prereqs: [],
    effects: [{ type: 'repairBonus', value: 0.25 }],
  },
  {
    id: 'night_ledgers', name: 'Night Ledgers', category: 'wall', icon: 'moon', cost: 150,
    description: 'Pyreth keeps a better count while you rest. 25% more renown while away.',
    prereqs: [after('mortar_craft'), needs('keep')],
    effects: [{ type: 'offlineMultiplier', value: 0.25 }],
  },
  {
    id: 'evacuation_drills', name: 'Evacuation Drills', category: 'wall', icon: 'walk', cost: 400,
    description: 'Everyone knows where to run when the wall falls. A Breach takes a third fewer people.',
    prereqs: [after('night_ledgers')],
    effects: [{ type: 'breachLossReduction', value: 1 / 3 }],
  },

  // -- THE WILDS (chapter 7) --
  {
    id: 'cartography', name: 'Cartography', category: 'wilds', icon: 'map', cost: 100,
    description: "Mirael's maps of the valley. Expeditions take 25% less time.",
    prereqs: [needs('outpost')],
    effects: [{ type: 'expeditionSpeedBonus', value: 0.25 }],
  },
  {
    id: 'keen_scouts', name: 'Keen Scouts', category: 'wilds', icon: 'search', cost: 250,
    description: 'Scouts who know where people hide. Fewer expeditions come back empty (35% down to 15%).',
    prereqs: [after('cartography')],
    effects: [{ type: 'expeditionFindBonus', value: 0.2 }],
  },
]

// =============================================================================
// HELPERS
// =============================================================================

export function getResearchNode(id: string): ResearchNodeDef | undefined {
  return RESEARCH_NODES.find((n) => n.id === id)
}

export function getNodesByCategory(category: ResearchCategory): ResearchNodeDef[] {
  return RESEARCH_NODES.filter((n) => n.category === category)
}

/** Every effect of the finished studies, summed (0 for none) */
export type ResearchBonuses = Record<ResearchEffect['type'], number>

const NO_BONUSES: ResearchBonuses = {
  tapDamageBonus: 0,
  doubleStrikeChance: 0,
  soldierCostDiscount: 0,
  swordBonus: 0,
  volleyBonus: 0,
  foodConsumptionReduction: 0,
  gatherBonus: 0,
  repairBonus: 0,
  offlineMultiplier: 0,
  breachLossReduction: 0,
  expeditionSpeedBonus: 0,
  expeditionFindBonus: 0,
}

/** Sum the effects of the finished studies. Unknown ids (studies of the old tree) are ignored. */
export function getResearchBonuses(completedIds: string[]): ResearchBonuses {
  const bonuses = { ...NO_BONUSES }
  for (const id of completedIds) {
    for (const effect of getResearchNode(id)?.effects ?? []) bonuses[effect.type] += effect.value
  }
  return bonuses
}
