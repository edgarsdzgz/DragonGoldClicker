import { SPRITES } from '../manifest'
import { BLINK_STEPS, BLINK_STEP_MS, DEATH_HOLD_MS } from '../warfront'
import { bodyState, growScales, walkStepMs, walkUpAt, walkUpMs } from '../walkUp'
import { tierSprite } from '../warfront'

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

  it('a step is one frame of the walk bob', () => {
    // The walks bob at 4 fps
    expect(walkStepMs('mob_kobold_walk_anim')).toBe(250)
    expect(walkStepMs('mob_orc-stronger_walk_anim')).toBe(250)
  })

  it('moves and grows only on a step: still between steps, one size up at each', () => {
    const scales = [1, 2, 3]
    expect(walkUpAt(0, scales, 250)).toEqual({ step: 0, along: 0, done: false })
    expect(walkUpAt(249, scales, 250)).toEqual({ step: 0, along: 0, done: false })
    expect(walkUpAt(250, scales, 250).step).toBe(1)
    // One step short of its place it is still walking
    expect(walkUpAt(250, scales, 250).done).toBe(false)
    expect(walkUpAt(499, scales, 250).step).toBe(1)
    expect(walkUpAt(500, scales, 250)).toEqual({ step: 2, along: 1, done: true })
    expect(walkUpAt(9999, scales, 250)).toEqual({ step: 2, along: 1, done: true })
    expect(walkUpAt(-5, scales, 250).step).toBe(0)
    expect(walkUpMs(scales, 250)).toBe(500)
  })

  it('every stride is the same in its own pixels: short while small and far, longer up close', () => {
    // Sizes 1 then 3: the first stride covers a quarter of the road, the second three quarters
    expect(walkUpAt(250, [1, 3, 5], 250).along).toBeCloseTo(0.25)
    // The A16: 9 sizes, 8 steps at the bob's 4 fps, 2 s from the camps to its place
    const a16 = growScales(8 / A16, 16 / A16, A16)
    expect(walkUpMs(a16, 250)).toBe(2000)
    const strides = a16.slice(1).map((_, i) => walkUpAt((i + 1) * 250, a16, 250).along - walkUpAt(i * 250, a16, 250).along)
    for (let i = 1; i < strides.length; i++) expect(strides[i]).toBeGreaterThan(strides[i - 1])
  })

  it('a monster already at its size has arrived', () => {
    expect(walkUpAt(0, [4], 250)).toEqual({ step: 0, along: 1, done: true })
    expect(walkUpMs([4], 250)).toBe(0)
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
