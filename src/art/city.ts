import { MAP_PLOTS, SPRITES } from './manifest'
import type { SpriteId } from './manifest'
import type { GameState } from '../types/state'

// =============================================================================
// THE CITY'S ART: which sprite each plot shows, and its marker
// =============================================================================

export type CityBuildingId =
  | 'keep' | 'garrison' | 'forge' | 'lodge' | 'outpost' | 'librarium' | 'housing' | 'wizard' | 'tower_east' | 'tower_west'

export type Plot = (typeof MAP_PLOTS.plots)[number]

/**
 * Points per map pixel for the city: the map's full width fits the screen, at whole screen pixels
 * (rounded down, so nothing is cropped: the plots run to the map's edges).
 */
export function cityUnit(widthPts: number, pixelRatio: number): number {
  return Math.max(1, Math.floor((widthPts * pixelRatio) / MAP_PLOTS.size[0])) / pixelRatio
}

/** Building ids whose plot (and art) is named differently */
const PLOT_NAMES: Partial<Record<CityBuildingId, string>> = {
  wizard: 'wizard-tower',
  tower_east: 'tower-east',
  tower_west: 'tower-west',
}

/** The plot's name in the layout and in the art */
export function plotName(id: CityBuildingId): string {
  return PLOT_NAMES[id] ?? id
}

/** Where a building stands on the city map */
export function plotFor(id: CityBuildingId): Plot {
  const name = plotName(id)
  const plot = MAP_PLOTS.plots.find((p) => p.id === name)
  if (!plot) throw new Error(`no plot for ${id}`)
  return plot
}

/** What the map needs to know about a building to draw it */
export interface PlotLook {
  /** Its story beat has revealed it (or it is built); otherwise it is fog */
  visible: boolean
  built: boolean
  /** Its level: the Garrison's and the Lodge's levels, the Outpost's, the Keep's offline tier */
  level: number
  /** The Keep's last offline tier: the Keep is restored */
  maxed?: boolean
  /** The Forge has made gear: its fire is lit */
  lit?: boolean
  /** It can be built (or upgraded) now */
  canAfford?: boolean
  /** Something can be done inside */
  hasAction?: boolean
  /** Not in the game yet: drawn, but never built */
  comingSoon?: boolean
}

const has = (id: string): id is SpriteId => Object.prototype.hasOwnProperty.call(SPRITES, id)

/** The building's own sprite for its level once built: the highest drawn tier at or below it */
function builtSprite(id: CityBuildingId, look: PlotLook): SpriteId | null {
  const name = plotName(id)
  switch (id) {
    case 'keep':
      return look.maxed ? 'bld_keep_restored' : 'bld_keep_built'
    case 'forge':
      return look.lit ? 'bld_forge_lit_anim' : 'bld_forge_built'
    case 'outpost':
      return look.level >= 2 ? 'bld_outpost_upgraded' : 'bld_outpost_built'
    case 'garrison':
    case 'lodge': {
      for (let l = look.level; l >= 1; l--) {
        const sprite = `bld_${name}_lv${l}`
        if (has(sprite)) return sprite
      }
      return null
    }
    default: {
      const sprite = `bld_${name}_built`
      return has(sprite) ? sprite : null
    }
  }
}

/** The sprite a plot shows: fog until revealed, then the ruin (or cleared ground), then the building */
export function plotSprite(id: CityBuildingId, look: PlotLook): SpriteId {
  const plot = plotFor(id)
  const size = `${plot.width}x${plot.height}`
  const fog = `map_fog_${size}` as SpriteId
  if (!look.visible) return fog
  if (look.built) {
    const built = builtSprite(id, look)
    if (built) return built
  }
  const ruin = `bld_${plotName(id)}_ruin`
  if (has(ruin)) return ruin
  const empty = `map_plot-empty_${size}`
  return has(empty) ? empty : fog
}

/** The marker over a plot: build or upgrade now, or something to do inside */
export function plotMarker(look: PlotLook): SpriteId | null {
  if (!look.visible || look.comingSoon) return null
  if (look.canAfford) return 'map_marker-upgrade'
  if (look.built && look.hasAction) return 'map_marker-todo'
  return null
}

/** The city's light: every map piece is drawn lit (day), at dusk and at night */
export type CityLight = 'day' | 'dusk' | 'night'

/** Brighter is higher: the city only ever brightens (the story moves one way) */
export const LIGHT_RANK: Record<CityLight, number> = { night: 0, dusk: 1, day: 2 }

/**
 * The city's light follows its story (owner, 2026-10-27): night while it is a ruin, dusk once the
 * Keep is restored, lit once Lirae has come to the Librarium. The Warfront stays night.
 */
export function cityLight(s: Pick<GameState, 'beatsSeen'>): CityLight {
  if (s.beatsSeen.includes('the_scholar')) return 'day'
  if (s.beatsSeen.includes('the_keep')) return 'dusk'
  return 'night'
}

/**
 * A city sprite in a light: the level goes before a strip's suffix (`bld_forge_lit_anim` at night
 * is `bld_forge_lit_night_anim`). The lit art is the plain id; a piece with no copy stays lit.
 */
export function litSprite(id: SpriteId, light: CityLight): SpriteId {
  if (light === 'day') return id
  const lit = id.endsWith('_anim') ? `${id.slice(0, -'_anim'.length)}_${light}_anim` : `${id}_${light}`
  return has(lit) ? lit : id
}

/** The header across the top of a building's interior (110x34) */
export function interiorHeader(id: CityBuildingId): SpriteId {
  switch (id) {
    case 'wizard': return 'int_wizard-tower'
    case 'tower_east':
    case 'tower_west': return 'int_tower'
    default: return `int_${id}`
  }
}

/** What a marker means, for screen readers */
const MARKER_WORDS: Record<string, string> = {
  'map_marker-upgrade': 'ready to build',
  'map_marker-todo': 'something to do inside',
}

/** A plot's spoken label: open it (or its cost while unbuilt), and what its marker shows */
export function plotLabel(name: string, detail: string | undefined, look: PlotLook): string {
  const marker = plotMarker(look)
  return [detail ? name : `Open ${name}`, detail, marker ? MARKER_WORDS[marker] : undefined].filter(Boolean).join(', ')
}
