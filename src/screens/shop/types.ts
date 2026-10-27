import type { GameIconName } from '../../art'

export type BuildingId = 'keep' | 'garrison' | 'forge' | 'lodge' | 'outpost' | 'librarium' | 'housing' | 'wizard' | 'tower_east' | 'tower_west'

/** Resource types a building can declare it uses */
// 'inspiration' is the renown resource (identifier kept until the rename)
export type ResourceKey = 'inspiration' | 'food' | 'villagers'

export type BuildingInfo = {
  id: BuildingId
  name: string
  icon: GameIconName
  description: string
  accentColor: string
  isBuilt: boolean
  visible: boolean
  cost: number | null
  canAfford: boolean
  statusLabel?: string
  hasAction?: boolean
  onBuild: () => void
  /** Which resources are relevant when this building is open */
  resourceKeys: ResourceKey[]
}
