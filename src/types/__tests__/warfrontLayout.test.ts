import {
  chipsFit, chipWidth, battlefieldLayout,
  MAX_MONSTER, MIN_MONSTER, FLOOR_MONSTER, FLAVOR_H, QUEUE_H, NAME_H, HP_H, FIELD_PAD,
} from '../warfrontLayout'

// Free battlefield heights (window - chrome). See the commit message for the sums.
// (the wave row adds 28 to the chrome)
const WORST_360x640 = 640 - 458
const TYPICAL_360x640 = 640 - 394
const WORST_411x891 = 891 - 520

const stack = (h: number, queue = false) => {
  const l = battlefieldLayout(h, { queue })
  return l.monster + NAME_H + HP_H + FIELD_PAD * 2 + (l.showFlavor ? FLAVOR_H : 0) + (l.showQueue ? QUEUE_H : 0)
}

describe('battlefieldLayout', () => {
  it('caps the monster at 200 on a tall screen and keeps the flavour row', () => {
    const l = battlefieldLayout(WORST_411x891)
    expect(l.monster).toBe(MAX_MONSTER)
    expect(l.showFlavor).toBe(true)
  })

  it('keeps the queue and drops the flavour row on the typical 360x640 screen', () => {
    const l = battlefieldLayout(TYPICAL_360x640, { queue: true })
    expect(l).toMatchObject({ showFlavor: false, showQueue: true })
    expect(l.monster).toBeGreaterThanOrEqual(MIN_MONSTER)
  })

  it('shows everything on the A16', () => {
    expect(battlefieldLayout(WORST_411x891, { queue: true })).toMatchObject({ monster: 200, showFlavor: true, showQueue: true })
  })

  it('on the worst 360x640 screen drops both optional rows and still fits', () => {
    const l = battlefieldLayout(WORST_360x640, { queue: true })
    expect(l).toMatchObject({ showFlavor: false, showQueue: false })
    expect(l.monster).toBeGreaterThanOrEqual(FLOOR_MONSTER)
    expect(stack(WORST_360x640, true)).toBeLessThanOrEqual(WORST_360x640)
  })

  it('drops the queue after the flavour row, then shrinks the monster', () => {
    const noFlavor = battlefieldLayout(NAME_H + HP_H + FIELD_PAD * 2 + QUEUE_H + MIN_MONSTER, { queue: true })
    expect(noFlavor).toMatchObject({ showFlavor: false, showQueue: true })
    const tight = battlefieldLayout(NAME_H + HP_H + FIELD_PAD * 2 + MIN_MONSTER + 5, { queue: true })
    expect(tight).toMatchObject({ showFlavor: false, showQueue: false })
  })

  it('never overlaps the gate: the stack always fits the free height (down to the floor)', () => {
    for (let h = NAME_H + HP_H + FIELD_PAD * 2 + FLOOR_MONSTER; h <= 700; h += 7) {
      expect(stack(h)).toBeLessThanOrEqual(h)
      expect(stack(h, true)).toBeLessThanOrEqual(h)
    }
  })

  it('stays within 80 and 200', () => {
    expect(battlefieldLayout(0).monster).toBe(FLOOR_MONSTER)
    expect(battlefieldLayout(5000).monster).toBe(MAX_MONSTER)
  })
})

describe('chipsFit', () => {
  it('shows words for the 2 chips of the paused story on a 360dp phone, and 3 on a 411dp one', () => {
    expect(chipsFit(['24 villagers', '2 fighters'], 360 - 32)).toBe(true)
    expect(chipsFit(['24 villagers', '2 fighters', '1 repairer'], 411 - 32)).toBe(true)
  })

  it('falls back to icon + number when five chips cannot fit', () => {
    expect(chipsFit(['24 villagers', '12 fighters', '3 repairers', '9 soldiers', '4 foragers'], 360 - 32)).toBe(false)
  })

  it('has no chips to fit', () => {
    expect(chipsFit([], 100)).toBe(true)
    expect(chipWidth('1 fighter')).toBeGreaterThan(chipWidth('1'))
  })
})
