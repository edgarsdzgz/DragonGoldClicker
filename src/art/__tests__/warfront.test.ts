import { SPRITES } from '../manifest'
import {
  mapUnit, mobScale, gateState, gateSprite, mobSprites, mobDeathSprite, slashSprite, stripMs, MAP_W, mobLift, mobFitPx, FLIER_LIFT,
  DEATH_HOLD_MS, BLINK_STEP_MS, BLINK_STEPS, STRONG_FROM_LEVEL, STRONGER_FROM_LEVEL, mobTier,
} from '../warfront'
import { bodyMs, growScales, walkDelayMs, walkStepMs, walkUpMs } from '../walkUp'
import { HORDE_LEVEL_KILLS, pushedBackHorde } from '../../types/horde'
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
    expect(mobSprites('no_such_monster')).toBeNull()
  })

  it('the Minotaur boss has its whole set ready, though no wave sends it yet', () => {
    expect(mobSprites('minotaur')).toEqual({
      idle: 'mob_minotaur_walk_anim', hit: 'mob_minotaur_hit', hurt: 'mob_minotaur_hurt',
    })
    const walk = SPRITES.mob_minotaur_walk_anim
    const death = SPRITES[mobDeathSprite('minotaur')!]
    expect(death.frames).toBe(4)
    expect(death.h).toBe(walk.h)
    expect((death.w - walk.w) % 2).toBe(0)
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
    expect(mobDeathSprite('no_such_monster')).toBeNull()
  })

  it('a kill reads in order: the death, the hold, the blink, while the next one walks up', () => {
    const death = stripMs('mob_kobold_death_anim')
    expect(death).toBe(500)
    // The last frame holds a moment before the blink (the monster-deaths plan, approved 2026-10-27)
    expect(DEATH_HOLD_MS).toBe(400)
    const gone = bodyMs(death)
    expect(gone).toBe(death + DEATH_HOLD_MS + BLINK_STEPS * BLINK_STEP_MS)
    // The A16: the walk (8 steps of the bob) takes longer than the body lasts, so it starts at once
    // and the body is gone before the next monster reaches its place
    const walk = walkUpMs(growScales(8 / 2.625, 16 / 2.625, 2.625), walkStepMs('mob_kobold_walk_anim'))
    expect(walk).toBeGreaterThan(gone)
    expect(walkDelayMs(walk, gone)).toBe(0)
    // A screen where it barely grows waits at the camps, arriving just as the body vanishes
    expect(walkDelayMs(250, gone)).toBe(gone - 250)
    expect(250 + walkDelayMs(250, gone)).toBe(gone)
    // An odd number of steps ends on "off"
    expect(BLINK_STEPS % 2).toBe(1)
  })

  it('the Unmaking marks the horde deeper as it advances, and a Breach pushes it back', () => {
    const atLevel = (level: number) => (level - 1) * HORDE_LEVEL_KILLS
    expect(mobTier(0)).toBe('weak')
    expect(mobTier(atLevel(STRONG_FROM_LEVEL) - 1)).toBe('weak')
    expect(mobTier(atLevel(STRONG_FROM_LEVEL))).toBe('strong')
    expect(mobTier(atLevel(STRONGER_FROM_LEVEL) - 1)).toBe('strong')
    expect(mobTier(atLevel(STRONGER_FROM_LEVEL))).toBe('stronger')
    // The owner's levels: 1-4 none, 5-9 dark cracks, 10 and up glowing
    expect([STRONG_FROM_LEVEL, STRONGER_FROM_LEVEL]).toEqual([5, 10])
    // A Breach at level 10 pushes it back to dark cracks
    expect(mobTier(pushedBackHorde(atLevel(10)))).toBe('strong')
  })

  it('every monster in the roster walks, is struck and dies at every tier', () => {
    for (const m of MONSTERS) {
      for (const tier of ['weak', 'strong', 'stronger'] as const) {
        expect([m.id, tier, mobSprites(m.id, tier) !== null, mobDeathSprite(m.id, tier) !== null]).toEqual([m.id, tier, true, true])
      }
    }
    expect(mobSprites('shadow_crawler', 'stronger')?.idle).toBe('mob_crawler-stronger_walk_anim')
    expect(mobDeathSprite('orc', 'strong')).toBe('mob_orc-strong_death_anim')
  })

  it('the four fliers hang above a shadow of their own at every tier; nothing else does', () => {
    const fliers = MONSTERS.filter((m) => mobSprites(m.id)?.shadow).map((m) => m.id)
    expect(fliers.sort()).toEqual(['giant_bat', 'harpy', 'mantair_corsair', 'storm_rider'])
    expect(mobSprites('harpy', 'stronger')?.shadow).toBe('mob_harpy_shadow')
    expect(mobSprites('goblin_wolf_rider')?.idle).toBe('mob_wolf-rider_walk_anim')
  })

  it("a flier's lift is its shadow plus 8 pixels of air, and its box fits it", () => {
    const bat = mobSprites('giant_bat')!
    expect(FLIER_LIFT).toBe(8)
    expect(mobLift(bat)).toBe(SPRITES['mob_giant-bat_shadow'].h + 8)
    expect(mobLift(mobSprites('orc')!)).toBe(0)
    // 21 wide, 14 tall + 3 + 8 = 25: the lift decides the fit
    expect(mobFitPx(bat)).toBe(25)
    expect(mobFitPx(mobSprites('orc')!)).toBe(19)
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
