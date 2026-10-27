import { SPRITES } from '../manifest'
import { BLINK_STEPS, BLINK_STEP_MS, DEATH_HOLD_MS } from '../warfront'
import { bodyState, growScales, growStep, tierSprite } from '../walkUp'

const A16 = 2.625

describe('the growing walk-up', () => {
  it('passes through every whole screen pixel per art pixel, from the map scale to full size', () => {
    // The A16: the map at 8 screen px per art px, the monster at 16
    const steps = growScales(8 / A16, 16 / A16, A16)
    expect(steps.map((s) => Math.round(s * A16))).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16])
    // Each size is a whole number of screen pixels, so nothing blurs
    for (const s of steps) expect(Math.abs(s * A16 - Math.round(s * A16))).toBeLessThan(1e-9)
  })

  it('a monster already at its size has one step', () => {
    expect(growScales(4, 4, 1)).toEqual([4])
    expect(growScales(5, 3, 1)).toEqual([3])
  })

  it('spends equal time at each size, starting small and ending full', () => {
    expect(growStep(0, 9)).toBe(0)
    expect(growStep(0.11, 9)).toBe(0)
    expect(growStep(0.12, 9)).toBe(1)
    expect(growStep(0.99, 9)).toBe(8)
    expect(growStep(1, 9)).toBe(8)
    expect(growStep(-1, 9)).toBe(0)
    expect(growStep(2, 9)).toBe(8)
  })
})

describe('a body on the road', () => {
  const death = 500
  const held = death + DEATH_HOLD_MS

  it('shows while it dies and holds, then blinks off, on, off... and is gone', () => {
    expect(bodyState(0, death, true)).toBe('shown')
    expect(bodyState(held - 1, death, true)).toBe('shown')
    expect(bodyState(held, death, true)).toBe('hidden')
    expect(bodyState(held + BLINK_STEP_MS, death, true)).toBe('shown')
    expect(bodyState(held + 2 * BLINK_STEP_MS, death, true)).toBe('hidden')
    expect(bodyState(held + BLINK_STEPS * BLINK_STEP_MS - 1, death, true)).toBe('hidden')
    expect(bodyState(held + BLINK_STEPS * BLINK_STEP_MS, death, true)).toBe('gone')
  })

  it('with Reduce Motion it does not blink: it is simply gone after the hold', () => {
    expect(bodyState(held - 1, death, false)).toBe('shown')
    expect(bodyState(held, death, false)).toBe('gone')
  })
})

describe('the Unmaking tiers', () => {
  it('every monster walks and dies at every tier', () => {
    for (const name of ['kobold', 'goblin', 'crawler', 'orc', 'raider']) {
      for (const tier of ['weak', 'strong', 'stronger'] as const) {
        expect(tierSprite(name, tier, 'walk_anim')).not.toBeNull()
        expect(tierSprite(name, tier, 'death_anim')).not.toBeNull()
      }
    }
    expect(tierSprite('kobold', 'weak', 'death_anim')).toBe('mob_kobold_death_anim')
    expect(tierSprite('orc', 'stronger', 'walk_anim')).toBe('mob_orc-stronger_walk_anim')
    expect(Object.keys(SPRITES)).toContain(tierSprite('crawler', 'strong', 'death_anim'))
    expect(tierSprite('dragon', 'weak', 'death_anim')).toBeNull()
  })
})
