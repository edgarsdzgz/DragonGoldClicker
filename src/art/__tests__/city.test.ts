import { SPRITES } from '../manifest'
import { cityUnit, plotFor, plotSprite, plotMarker, plotLabel } from '../city'
import type { CityBuildingId, PlotLook } from '../city'

const ALL: CityBuildingId[] = ['keep', 'garrison', 'forge', 'lodge', 'outpost', 'librarium', 'housing', 'wizard', 'tower_east', 'tower_west']
const look = (over: Partial<PlotLook>): PlotLook => ({ visible: true, built: false, level: 0, ...over })

describe('the city map', () => {
  it('fits the screen at whole screen pixels, rounding down', () => {
    // The A16: 1080 px / 130 = 8.3 -> 8; 1260 px / 130 = 9.7 -> 9, never 10 (it would crop)
    expect(cityUnit(1080 / 2.625, 2.625) * 2.625).toBe(8)
    expect(cityUnit(420, 3) * 3).toBe(9)
    expect(cityUnit(10, 1)).toBe(1)
  })

  it('every building has a plot, and every look it can take is drawn', () => {
    for (const id of ALL) {
      expect(plotFor(id)).toBeDefined()
      for (const l of [look({ visible: false }), look({}), look({ built: true, level: 1 }), look({ built: true, level: 5, maxed: true, lit: true })]) {
        expect([id, Object.keys(SPRITES).includes(plotSprite(id, l))]).toEqual([id, true])
      }
    }
  })

  it('a plot is fog until revealed, a ruin until built, then the building', () => {
    expect(plotSprite('forge', look({ visible: false }))).toBe('map_fog_32x32')
    expect(plotSprite('keep', look({ visible: false }))).toBe('map_fog_50x82')
    expect(plotSprite('forge', look({}))).toBe('bld_forge_ruin')
    expect(plotSprite('forge', look({ built: true }))).toBe('bld_forge_built')
    expect(plotSprite('forge', look({ built: true, lit: true }))).toBe('bld_forge_lit_anim')
    // Housing has no ruin: cleared ground
    expect(plotSprite('housing', look({}))).toBe('map_plot-empty_32x32')
  })

  it('levels show the highest drawn tier at or below them', () => {
    expect(plotSprite('garrison', look({ built: true, level: 1 }))).toBe('bld_garrison_lv1')
    expect(plotSprite('garrison', look({ built: true, level: 2 }))).toBe('bld_garrison_lv1')
    expect(plotSprite('garrison', look({ built: true, level: 4 }))).toBe('bld_garrison_lv3')
    expect(plotSprite('garrison', look({ built: true, level: 5 }))).toBe('bld_garrison_lv5')
    expect(plotSprite('lodge', look({ built: true, level: 5 }))).toBe('bld_lodge_lv3')
    expect(plotSprite('outpost', look({ built: true, level: 1 }))).toBe('bld_outpost_built')
    expect(plotSprite('outpost', look({ built: true, level: 2 }))).toBe('bld_outpost_upgraded')
    expect(plotSprite('keep', look({ built: true }))).toBe('bld_keep_built')
    expect(plotSprite('keep', look({ built: true, maxed: true }))).toBe('bld_keep_restored')
    expect(plotSprite('wizard', look({}))).toBe('bld_wizard-tower_ruin')
  })

  it('markers: build or upgrade now, else something to do; none in fog or for buildings to come', () => {
    expect(plotMarker(look({ canAfford: true }))).toBe('map_marker-upgrade')
    expect(plotMarker(look({ built: true, hasAction: true }))).toBe('map_marker-todo')
    expect(plotMarker(look({ hasAction: true }))).toBeNull()
    expect(plotMarker(look({ visible: false, canAfford: true }))).toBeNull()
    expect(plotMarker(look({ comingSoon: true, canAfford: true }))).toBeNull()
  })
})

describe('what a screen reader hears', () => {
  it('the plot, its cost while unbuilt, and what its marker shows', () => {
    expect(plotLabel('The Forge', '50 renown', look({ canAfford: true }))).toBe('The Forge, 50 renown, ready to build')
    expect(plotLabel('The Forge', '50 renown', look({}))).toBe('The Forge, 50 renown')
    expect(plotLabel('The Garrison', undefined, look({ built: true, hasAction: true }))).toBe('Open The Garrison, something to do inside')
    expect(plotLabel('The Garrison', undefined, look({ built: true }))).toBe('Open The Garrison')
  })
})
