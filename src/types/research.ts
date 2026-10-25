import type { Ionicons } from '@expo/vector-icons'

// =============================================================================
// LIBRARIUM BUILDING
// =============================================================================

export const LIBRARIUM_COST = 37.5

// =============================================================================
// RESEARCH CATEGORIES
// =============================================================================

export type ResearchCategory = 'economy' | 'military' | 'survival' | 'exploration' | 'mystery'

export const RESEARCH_CATEGORIES: {
  id: ResearchCategory
  name: string
  icon: keyof typeof Ionicons.glyphMap
  description: string
}[] = [
  { id: 'economy', name: 'Economy', icon: 'wallet', description: 'Inspiration generation and click power' },
  { id: 'military', name: 'Military', icon: 'shield', description: 'Soldier training and combat' },
  { id: 'survival', name: 'Survival', icon: 'leaf', description: 'Food and village growth' },
  { id: 'exploration', name: 'Exploration', icon: 'compass', description: 'Expedition improvements' },
  { id: 'mystery', name: '???', icon: 'help-circle', description: 'Unknown knowledge awaits' },
]

// =============================================================================
// RESEARCH EFFECT TYPES
// =============================================================================

export type ResearchEffect =
  | { type: 'clickPowerBonus'; value: number }
  | { type: 'autoRateMultiplier'; value: number }
  | { type: 'soldierCostDiscount'; value: number }
  | { type: 'gearBonusMultiplier'; value: number }
  | { type: 'foodConsumptionReduction'; value: number }
  | { type: 'foragePowerBonus'; value: number }
  | { type: 'offlineMultiplier'; value: number }
  | { type: 'expeditionSpeedBonus'; value: number }
  | { type: 'expeditionFindBonus'; value: number }
  | { type: 'villagerCapBonus'; value: number }

// =============================================================================
// RESEARCH NODE DEFINITION
// =============================================================================

export type ResearchPrereq =
  | { type: 'research'; id: string }
  | { type: 'barracksLevel'; level: number }
  | { type: 'lodgeLevel'; level: number }
  | { type: 'postLevel'; level: number }
  | { type: 'totalInspirationEarned'; amount: number }
  | { type: 'monstersDefeated'; amount: number }
  | { type: 'villagersRescued'; amount: number }

export interface ResearchNodeDef {
  id: string
  name: string
  description: string
  category: ResearchCategory
  icon: keyof typeof Ionicons.glyphMap
  cost: number
  prereqs: ResearchPrereq[]
  effects: ResearchEffect[]
  /** Mystery nodes are hidden until all prereqs are met */
  mystery?: boolean
}

// =============================================================================
// TECH TREE
// =============================================================================

export const RESEARCH_NODES: ResearchNodeDef[] = [
  // -- ECONOMY --
  {
    id: 'keen_eye',
    name: 'Keen Eye',
    description: 'Sharper instincts reveal more inspiration per strike. +0.05 click power.',
    category: 'economy',
    icon: 'eye',
    cost: 15,
    prereqs: [],
    effects: [{ type: 'clickPowerBonus', value: 0.05 }],
  },
  {
    id: 'efficient_patrols',
    name: 'Efficient Patrols',
    description: 'Optimized patrol routes increase fighter inspiration income by 15%.',
    category: 'economy',
    icon: 'trending-up',
    cost: 25,
    prereqs: [{ type: 'barracksLevel', level: 2 }],
    effects: [{ type: 'autoRateMultiplier', value: 0.15 }],
  },
  {
    id: 'golden_harvest',
    name: 'Golden Harvest',
    description: 'Recovered inspiration is meticulously sorted. +25% offline earnings.',
    category: 'economy',
    icon: 'moon',
    cost: 50,
    prereqs: [{ type: 'research', id: 'efficient_patrols' }, { type: 'totalInspirationEarned', amount: 250 }],
    effects: [{ type: 'offlineMultiplier', value: 0.25 }],
  },

  // -- MILITARY --
  {
    id: 'drill_tactics',
    name: 'Drill Tactics',
    description: 'Streamlined training reduces soldier recruitment cost by 10%.',
    category: 'military',
    icon: 'fitness',
    cost: 20,
    prereqs: [{ type: 'barracksLevel', level: 1 }],
    effects: [{ type: 'soldierCostDiscount', value: 0.10 }],
  },
  {
    id: 'tempered_steel',
    name: 'Tempered Steel',
    description: 'Better forging techniques. Swords and shields are 25% more effective.',
    category: 'military',
    icon: 'hammer',
    cost: 30,
    prereqs: [{ type: 'research', id: 'drill_tactics' }],
    effects: [{ type: 'gearBonusMultiplier', value: 0.25 }],
  },
  {
    id: 'veteran_training',
    name: 'Veteran Training',
    description: 'Experienced soldiers pass on wisdom. Recruitment cost reduced by another 15%.',
    category: 'military',
    icon: 'ribbon',
    cost: 60,
    prereqs: [{ type: 'research', id: 'tempered_steel' }, { type: 'monstersDefeated', amount: 250 }],
    effects: [{ type: 'soldierCostDiscount', value: 0.15 }],
  },

  // -- SURVIVAL --
  {
    id: 'rationing',
    name: 'Rationing',
    description: 'Careful meal planning reduces food consumption by 15%.',
    category: 'survival',
    icon: 'restaurant',
    cost: 17.5,
    prereqs: [{ type: 'lodgeLevel', level: 1 }],
    effects: [{ type: 'foodConsumptionReduction', value: 0.15 }],
  },
  {
    id: 'herbalist_knowledge',
    name: 'Herbalist Knowledge',
    description: 'Rangers learn to find more edible plants. +0.10 forage power.',
    category: 'survival',
    icon: 'flower',
    cost: 25,
    prereqs: [{ type: 'research', id: 'rationing' }],
    effects: [{ type: 'foragePowerBonus', value: 0.1 }],
  },
  {
    id: 'frontier_settlement',
    name: 'Frontier Settlement',
    description: 'Expanded housing attracts more wanderers. Village capacity +5.',
    category: 'survival',
    icon: 'home',
    cost: 75,
    prereqs: [{ type: 'research', id: 'herbalist_knowledge' }, { type: 'villagersRescued', amount: 5 }],
    effects: [{ type: 'villagerCapBonus', value: 5 }],
  },

  // -- EXPLORATION --
  {
    id: 'cartography',
    name: 'Cartography',
    description: 'Detailed maps speed up expeditions by 15%.',
    category: 'exploration',
    icon: 'map',
    cost: 20,
    prereqs: [{ type: 'postLevel', level: 1 }],
    effects: [{ type: 'expeditionSpeedBonus', value: 0.15 }],
  },
  {
    id: 'keen_scouts',
    name: 'Keen Scouts',
    description: 'Scouts learn to spot survivors more easily. +20% find chance.',
    category: 'exploration',
    icon: 'search',
    cost: 40,
    prereqs: [{ type: 'research', id: 'cartography' }],
    effects: [{ type: 'expeditionFindBonus', value: 0.20 }],
  },

  // -- MYSTERY --
  {
    id: 'mystery_ancient_texts',
    name: '???',
    description: 'Ancient knowledge hidden in the ruins...',
    category: 'mystery',
    icon: 'help-circle',
    cost: 100,
    prereqs: [{ type: 'totalInspirationEarned', amount: 500 }, { type: 'monstersDefeated', amount: 500 }],
    effects: [{ type: 'clickPowerBonus', value: 0.1 }, { type: 'autoRateMultiplier', value: 0.10 }],
    mystery: true,
  },
  {
    id: 'mystery_dragon_lore',
    name: '???',
    description: 'The dragons left secrets in the land itself...',
    category: 'mystery',
    icon: 'help-circle',
    cost: 150,
    prereqs: [{ type: 'research', id: 'mystery_ancient_texts' }, { type: 'villagersRescued', amount: 15 }],
    effects: [{ type: 'offlineMultiplier', value: 0.50 }, { type: 'villagerCapBonus', value: 10 }],
    mystery: true,
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

/** Aggregate all active research bonuses from completed research IDs */
export interface ResearchBonuses {
  autoRateMultiplier: number
  soldierCostDiscount: number
  gearBonusMultiplier: number
  foodConsumptionReduction: number
  offlineMultiplier: number
  expeditionSpeedBonus: number
  expeditionFindBonus: number
  villagerCapBonus: number
}

export function getResearchBonuses(completedIds: string[]): ResearchBonuses {
  const bonuses: ResearchBonuses = {
    autoRateMultiplier: 0,
    soldierCostDiscount: 0,
    gearBonusMultiplier: 0,
    foodConsumptionReduction: 0,
    offlineMultiplier: 0,
    expeditionSpeedBonus: 0,
    expeditionFindBonus: 0,
    villagerCapBonus: 0,
  }

  for (const id of completedIds) {
    const node = RESEARCH_NODES.find((n) => n.id === id)
    if (!node) continue
    for (const effect of node.effects) {
      switch (effect.type) {
        case 'autoRateMultiplier':
          bonuses.autoRateMultiplier += effect.value
          break
        case 'soldierCostDiscount':
          bonuses.soldierCostDiscount += effect.value
          break
        case 'gearBonusMultiplier':
          bonuses.gearBonusMultiplier += effect.value
          break
        case 'foodConsumptionReduction':
          bonuses.foodConsumptionReduction += effect.value
          break
        case 'offlineMultiplier':
          bonuses.offlineMultiplier += effect.value
          break
        case 'expeditionSpeedBonus':
          bonuses.expeditionSpeedBonus += effect.value
          break
        case 'expeditionFindBonus':
          bonuses.expeditionFindBonus += effect.value
          break
        case 'villagerCapBonus':
          bonuses.villagerCapBonus += effect.value
          break
        // clickPowerBonus and foragePowerBonus are applied immediately on purchase
      }
    }
  }

  return bonuses
}
