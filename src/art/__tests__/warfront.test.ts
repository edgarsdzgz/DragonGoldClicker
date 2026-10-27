import { SPRITES } from '../manifest'
import {
  mapUnit, mobScale, gateState, gateSprite, mobSprites, mobDeathSprite, slashSprite, stripMs, MAP_W,
  DEATH_HOLD_MS, BLINK_STEP_MS, BLINK_STEPS, WALK_IN_DELAY_MS, WALK_IN_MS,
} from '../warfront'
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

  it('every monster in the roster dies on screen, its feet where its walk has them', () => {
    for (const m of MONSTERS) {
      const death = mobDeathSprite(m.id)
      expect([m.id, death !== null]).toEqual([m.id, true])
      const walk = SPRITES[mobSprites(m.id)!.idle]
      const d = SPRITES[death!]
      expect(d.frames).toBe(4)
      // Same height, standing on the same ground
      expect(d.h).toBe(walk.h)
      // Wider by the same margin on each side, so it is centered where the walk is
      expect([m.id, (d.w - walk.w) % 2]).toEqual([m.id, 0])
    }
    expect(mobDeathSprite('shadow_crawler')).toBe('mob_crawler_death_anim')
    expect(mobDeathSprite('minotaur')).toBeNull()
  })

  it('a kill reads in order: the death, the hold, the blink, while the next one walks up', () => {
    const death = stripMs('mob_kobold_death_anim')
    expect(death).toBe(500)
    // The next monster starts walking before the body is gone and arrives about as it vanishes
    expect(WALK_IN_DELAY_MS).toBeLessThan(death + DEATH_HOLD_MS)
    const gone = death + DEATH_HOLD_MS + BLINK_STEPS * BLINK_STEP_MS
    // It arrives after the death has played and no later than the body vanishing
    const arrives = WALK_IN_DELAY_MS + WALK_IN_MS
    expect(arrives).toBeGreaterThanOrEqual(death)
    expect(arrives).toBeLessThanOrEqual(gone)
    // An odd number of steps ends on "off"
    expect(BLINK_STEPS % 2).toBe(1)
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
