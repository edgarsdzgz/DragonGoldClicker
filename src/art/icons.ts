import type { Ionicons } from '@expo/vector-icons'
import { SPRITES } from './manifest'
import type { SpriteId } from './manifest'

// =============================================================================
// ICONS: the pixel icon for each interface icon, with the old glyph as fallback
// =============================================================================

export type IoniconName = keyof typeof Ionicons.glyphMap

/** An interface icon: an Ionicons name (drawn in pixel art when it has a match) or a sprite id */
export type GameIconName = IoniconName | SpriteId

/**
 * The pixel icon drawn for an Ionicons name. A name with no entry keeps its glyph until its art is
 * drawn. Where one name means different things (a sword, a claw, damage), the screen names the
 * sprite itself instead.
 */
export const ICON_ART: Partial<Record<IoniconName, SpriteId>> = {
  flame: 'icon_flame',
  leaf: 'icon_wheat',
  'settings-outline': 'icon_cog',
  star: 'icon_star',
  nutrition: 'icon_food',
  restaurant: 'icon_rations',
  hammer: 'icon_hammer',
  construct: 'icon_hammer',
  'construct-outline': 'icon_hammer',
  shield: 'icon_shield',
  'shield-checkmark': 'icon_shield_gear',
  home: 'icon_villager',
  person: 'icon_villager',
  people: 'icon_villager',
  'people-outline': 'icon_villager',
  'person-add': 'icon_train',
  flash: 'icon_damage',
  book: 'icon_book',
  'book-outline': 'icon_book',
  compass: 'icon_compass',
  'lock-closed': 'icon_padlock',
  skull: 'icon_skull',
  flag: 'icon_flag',
  'flag-outline': 'icon_flag',
  moon: 'icon_moon',
  time: 'icon_hourglass',
  'time-outline': 'icon_hourglass',
  'timer-outline': 'icon_hourglass',
  'hourglass-outline': 'icon_hourglass',
  checkmark: 'icon_check',
  'checkmark-circle': 'icon_check',
  close: 'icon_close',
  'close-circle': 'icon_close',
  'trending-up': 'icon_rising',
  'trending-down': 'icon_falling',
  'arrow-up-circle': 'icon_upgrade',
  'arrow-up': 'icon_upgrade',
  'swap-horizontal': 'icon_reassign',
  'information-circle': 'icon_info',
  'arrow-forward': 'icon_next',
  'notifications-outline': 'icon_bell',
  ribbon: 'icon_rank',
  map: 'icon_map',
  'stats-chart': 'icon_stats',
  sparkles: 'icon_sparkles',
  'help-circle-outline': 'icon_unknown',
  warning: 'icon_warning',
  'hand-left': 'icon_hand',
  'phone-portrait-outline': 'icon_phone',
  // Only the Stats screen's food Consumption row uses it: a leaking grain sack, not a gauge
  speedometer: 'icon_consumption',
  // Fighters on short rations: the leaking grain sack again
  'remove-circle': 'icon_consumption',
  // The urgent food warning
  'alert-circle': 'icon_warning',
  // A veteran wanderer
  'shield-half': 'icon_shield',
  // The Keep, where its own building icon is not looked up
  business: 'icon_bld-keep',
  // An unmet requirement in a checklist (claws, the journal, research): the check mark's counterpart
  'ellipse-outline': 'icon_todo',
}

export function isSpriteId(name: string): name is SpriteId {
  return Object.prototype.hasOwnProperty.call(SPRITES, name)
}

/** The sprite an icon draws, or null to keep its glyph */
export function iconArt(name: GameIconName): SpriteId | null {
  if (isSpriteId(name)) return name
  return ICON_ART[name] ?? null
}

/** A sprite id if that art exists, else the fallback (for art named by pattern, e.g. per building) */
export function artOr(id: string, fallback: GameIconName): GameIconName {
  return isSpriteId(id) ? id : fallback
}

/** A building's own icon (`icon_bld-<id>`), or its old glyph if none is drawn */
export function buildingIcon(id: string, fallback: GameIconName): GameIconName {
  const name = id === 'wizard' ? 'wizard-tower' : id.replace(/_/g, '-')
  return artOr(`icon_bld-${name}`, fallback)
}

/** A study's own icon (`icon_res_<id>`), or its old glyph if none is drawn */
export function studyIcon(id: string, fallback: GameIconName): GameIconName {
  return artOr(`icon_res_${id}`, fallback)
}

/** The claw tier icon for a claw level: Fledgling (level 0) is tier 1; reforges keep Ancient's */
export function clawIcon(level: number): GameIconName {
  return artOr(`icon_claw-${Math.min(Math.max(level, 0) + 1, 9)}`, 'icon_claws')
}
