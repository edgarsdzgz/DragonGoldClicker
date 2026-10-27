import { SPRITES } from '../manifest'
import { mapUnit, mobScale, gateState, gateSprite, mobSprites, slashSprite, stripMs, MAP_W } from '../warfront'
import { MONSTERS } from '../../types/monsterRoster'

describe('the Warfront map', () => {
  it('spans the screen at whole screen pixels per map pixel', () => {
    // The A16: 411.4pt at 2.625 is 1080 px; 1080 / 130 = 8.3 -> 8
    expect(mapUnit(1080 / 2.625, 2.625) * 2.625).toBe(8)
    expect(mapUnit(390, 3) * MAP_W).toBe(390)
    // Rounds to the nearest: 1260 px / 130 = 9.7 -> 10, cropping 20 px a side rather than leaving 65 px margins
    expect(mapUnit(420, 3) * 3).toBe(10)
    expect(mapUnit(10, 1)).toBe(1)
  })

  it('the gate shows the wall: sound, cracking, failing, breached', () => {
    expect(gateState(100, 100)).toBe('sound')
    expect(gateState(67, 100)).toBe('sound')
    expect(gateState(66, 99)).toBe('cracking')
    expect(gateState(34, 100)).toBe('cracking')
    expect(gateState(33, 99)).toBe('failing')
    expect(gateState(1, 100)).toBe('failing')
    expect(gateState(0, 100)).toBe('breached')
    for (const s of ['sound', 'cracking', 'failing', 'breached'] as const) expect(Object.keys(SPRITES)).toContain(gateSprite(s))
  })
})

describe('the monsters', () => {
  it('every monster in the roster has its walk, hit and hurt', () => {
    for (const m of MONSTERS) {
      const art = mobSprites(m.id)
      expect([m.id, art !== null]).toEqual([m.id, true])
    }
    expect(mobSprites('shadow_crawler')?.hurt).toBe('mob_crawler_hurt')
    expect(mobSprites('minotaur')).toBeNull()
  })

  it('the slash follows the claws tier, and strips report how long they play', () => {
    for (const t of ['plain', 'gold', 'ember'] as const) expect(Object.keys(SPRITES)).toContain(slashSprite(t))
    // 4 frames at 12 fps
    expect(stripMs('fx_slash-plain_anim')).toBe(333)
    expect(stripMs('icon_star')).toBe(0)
  })
})

describe('the monster on a short window', () => {
  it('stands at double the map scale, shrinking to fit its box', () => {
    // The A16 (8 px map pixels): a 19-pixel orc at 16 px is 304 px, about 116pt
    expect(mobScale(8 / 2.625, 200, 19, 2.625) * 2.625).toBe(16)
    // An 80pt box: floor(80 / 19 * 2.625) = 11 px per art pixel
    expect(mobScale(8 / 2.625, 80, 19, 2.625) * 2.625).toBe(11)
    // 84pt: 11.6 rounds down, since 12 px per art pixel would stand 87pt tall in an 84pt box
    expect(mobScale(8 / 2.625, 84, 19, 2.625) * 2.625).toBe(11)
    expect(mobScale(1, 2, 19, 1)).toBe(1)
  })
})
