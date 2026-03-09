import type { Ionicons } from '@expo/vector-icons'

export type BuildingId = 'keep' | 'garrison' | 'forge' | 'lodge' | 'outpost' | 'librarium'

/** Resource types a building can declare it uses */
export type ResourceKey = 'inspiration' | 'food' | 'villagers'

export type BuildingInfo = {
  id: BuildingId
  name: string
  icon: keyof typeof Ionicons.glyphMap
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
