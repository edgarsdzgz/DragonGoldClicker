export type UpgradeId = 'strongerClick' | 'goldMine' | 'dragonEgg' | 'treasureHoard'

export interface UpgradeDefinition {
  id: UpgradeId
  name: string
  description: string
  baseCost: number
  costMultiplier: number
  /** For click upgrades: bonus click power per level */
  clickPower?: number
  /** For idle upgrades: gold per second per level */
  goldPerSecond?: number
}

export interface GameState {
  gold: number
  totalGoldEarned: number
  totalClicks: number
  clickPower: number
  upgrades: Record<UpgradeId, number>
  startedAt: number
}

export const UPGRADES: UpgradeDefinition[] = [
  {
    id: 'strongerClick',
    name: 'Stronger Click',
    description: '+1 gold per click',
    baseCost: 10,
    costMultiplier: 1.5,
    clickPower: 1,
  },
  {
    id: 'goldMine',
    name: 'Gold Mine',
    description: '+1 gold per second',
    baseCost: 50,
    costMultiplier: 1.4,
    goldPerSecond: 1,
  },
  {
    id: 'dragonEgg',
    name: 'Dragon Egg',
    description: '+10 gold per second',
    baseCost: 500,
    costMultiplier: 1.6,
    goldPerSecond: 10,
  },
  {
    id: 'treasureHoard',
    name: 'Treasure Hoard',
    description: '+100 gold per second',
    baseCost: 5000,
    costMultiplier: 1.8,
    goldPerSecond: 100,
  },
]

export const DEFAULT_GAME_STATE: GameState = {
  gold: 0,
  totalGoldEarned: 0,
  totalClicks: 0,
  clickPower: 1,
  upgrades: {
    strongerClick: 0,
    goldMine: 0,
    dragonEgg: 0,
    treasureHoard: 0,
  },
  startedAt: Date.now(),
}

export function getUpgradeCost(upgrade: UpgradeDefinition, level: number): number {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level))
}

export function getIdleIncome(upgrades: Record<UpgradeId, number>): number {
  return UPGRADES.reduce((total, def) => {
    if (def.goldPerSecond) {
      return total + def.goldPerSecond * upgrades[def.id]
    }
    return total
  }, 0)
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(1)}T`
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return Math.floor(n).toString()
}
