import { SPRITES } from '../manifest'
import { ICON_ART, iconArt, buildingIcon, studyIcon, clawIcon } from '../icons'
import { RESEARCH_NODES } from '../../types/research'
import type { BuildingId } from '../../screens/shop/types'

const BUILDINGS: BuildingId[] = ['keep', 'garrison', 'forge', 'lodge', 'outpost', 'librarium', 'housing', 'wizard', 'tower_east', 'tower_west']

describe('icons', () => {
  it('every mapped glyph names a real pixel icon', () => {
    for (const id of Object.values(ICON_ART)) expect(Object.keys(SPRITES)).toContain(id)
  })

  it('a glyph with art draws it; a sprite id draws itself; anything else keeps its glyph', () => {
    expect(iconArt('hammer')).toBe('icon_hammer')
    expect(iconArt('icon_swords')).toBe('icon_swords')
    expect(iconArt('chevron-down')).toBeNull()
  })

  it('every building has its own icon', () => {
    for (const b of BUILDINGS) expect(buildingIcon(b, 'business')).toMatch(/^icon_bld-/)
    expect(buildingIcon('wizard', 'business')).toBe('icon_bld-wizard-tower')
    expect(buildingIcon('tower_east', 'business')).toBe('icon_bld-tower-east')
    expect(buildingIcon('no_such_building', 'business')).toBe('business')
  })

  it('studies use their own icon where one is drawn, and keep the glyph where not', () => {
    expect(studyIcon('mortar_craft', 'construct')).toBe('icon_res_mortar_craft')
    expect(studyIcon('cartography', 'map')).toBe('icon_res_cartography')
    expect(studyIcon('no_such_study', 'map')).toBe('map')
    const drawn = RESEARCH_NODES.filter((n) => studyIcon(n.id, n.icon) !== n.icon)
    expect(drawn.length).toBe(RESEARCH_NODES.length)
  })

  it('the claws chip shows the tier icon; reforges keep Ancient', () => {
    expect(clawIcon(0)).toBe('icon_claw-1')
    expect(clawIcon(8)).toBe('icon_claw-9')
    expect(clawIcon(12)).toBe('icon_claw-9')
  })
})
