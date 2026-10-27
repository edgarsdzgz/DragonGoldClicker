import { SPRITES } from '../manifest'
import { plotSprite, plotMarker, cityLight, litSprite, interiorHeader, LIGHT_RANK } from '../city'
import type { CityBuildingId, PlotLook } from '../city'

const ALL: CityBuildingId[] = ['keep', 'garrison', 'forge', 'lodge', 'outpost', 'librarium', 'housing', 'wizard', 'tower_east', 'tower_west']
const look = (over: Partial<PlotLook>): PlotLook => ({ visible: true, built: false, level: 0, ...over })

describe("the city's light", () => {
  const looks = [
    look({ visible: false }), look({}), look({ canAfford: true }), look({ built: true, level: 1, hasAction: true }),
    look({ built: true, level: 3 }), look({ built: true, level: 5, maxed: true, lit: true }),
  ]

  it('night while a ruin, dusk once the Keep is restored, lit once Lirae comes (owner, 2026-10-27)', () => {
    expect(cityLight({ beatsSeen: [] })).toBe('night')
    expect(cityLight({ beatsSeen: ['prologue', 'the_smith'] })).toBe('night')
    expect(cityLight({ beatsSeen: ['the_keep'] })).toBe('dusk')
    expect(cityLight({ beatsSeen: ['the_keep', 'the_lodge', 'the_horde_grows'] })).toBe('dusk')
    expect(cityLight({ beatsSeen: ['the_keep', 'the_lodge', 'the_scholar'] })).toBe('day')
  })

  it('every piece the map can show has a dusk and a night copy', () => {
    expect(litSprite('map_city_base', 'night')).toBe('map_city_base_night')
    for (const id of ALL) {
      for (const l of looks) {
        const pieces = [plotSprite(id, l), plotMarker(l)].filter((p): p is NonNullable<typeof p> => p !== null)
        for (const piece of pieces) {
          for (const light of ['night', 'dusk'] as const) {
            const lit = litSprite(piece, light)
            expect([piece, light, lit !== piece, Object.keys(SPRITES).includes(lit)]).toEqual([piece, light, true, true])
          }
        }
      }
    }
  })

  it("a strip's light goes before its suffix; lit is the plain art", () => {
    expect(litSprite('bld_forge_lit_anim', 'night')).toBe('bld_forge_lit_night_anim')
    expect(litSprite('bld_forge_lit_anim', 'dusk')).toBe('bld_forge_lit_dusk_anim')
    expect(litSprite('bld_forge_lit_anim', 'day')).toBe('bld_forge_lit_anim')
    expect(litSprite('bld_keep_ruin', 'day')).toBe('bld_keep_ruin')
    expect(SPRITES[litSprite('bld_forge_lit_anim', 'night')].frames).toBeGreaterThan(1)
  })

  it('a piece with no copy stays as it is', () => {
    expect(litSprite('map_torch_anim', 'night')).toBe('map_torch_anim')
    expect(litSprite('map_gate_sound', 'dusk')).toBe('map_gate_sound')
  })

  it('the light only ever rises', () => {
    expect(LIGHT_RANK.night).toBeLessThan(LIGHT_RANK.dusk)
    expect(LIGHT_RANK.dusk).toBeLessThan(LIGHT_RANK.day)
  })
})

describe('interior headers', () => {
  it('every building has its header, 110x34', () => {
    for (const id of ALL) {
      const header = interiorHeader(id)
      expect([id, Object.keys(SPRITES).includes(header)]).toEqual([id, true])
      expect([SPRITES[header].w, SPRITES[header].h]).toEqual([110, 34])
    }
    expect(interiorHeader('wizard')).toBe('int_wizard-tower')
    expect(interiorHeader('tower_east')).toBe('int_tower')
    expect(interiorHeader('tower_west')).toBe('int_tower')
    expect(interiorHeader('keep')).toBe('int_keep')
  })

  it('all nine headers are used', () => {
    const used = new Set(ALL.map(interiorHeader))
    const drawn = Object.keys(SPRITES).filter((k) => k.startsWith('int_'))
    expect([...used].sort()).toEqual(drawn.sort())
    expect(drawn).toHaveLength(9)
  })
})
