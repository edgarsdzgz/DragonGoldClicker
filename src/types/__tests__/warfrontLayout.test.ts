import {
  campLayout, CAMP_CORE_H, BEGIN_BUTTON_H, CAMP_MIN_SILHOUETTE, CAMP_MAX_SILHOUETTE,
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

describe('campLayout', () => {
  it('keeps the Begin wave button at least 48dp tall', () => {
    expect(BEGIN_BUTTON_H).toBeGreaterThanOrEqual(48)
  })

  it('shows 48dp silhouettes on a tall screen (A16)', () => {
    const l = campLayout(WORST_411x891)
    expect(l.showSilhouettes).toBe(true)
    expect(l.silhouette).toBe(CAMP_MAX_SILHOUETTE)
  })

  it('drops only the silhouettes on the tightest 360x640 screen; the text and button always fit', () => {
    const l = campLayout(WORST_360x640)
    expect(l.minHeight).toBe(CAMP_CORE_H)
    expect(WORST_360x640).toBeGreaterThanOrEqual(CAMP_CORE_H)
    if (!l.showSilhouettes) expect(WORST_360x640 - CAMP_CORE_H).toBeLessThan(CAMP_MIN_SILHOUETTE + 8)
  })

  it('shrinks the silhouettes between 24 and 48 as height falls', () => {
    const h = CAMP_CORE_H + 8 + 30
    expect(campLayout(h).silhouette).toBe(30)
    expect(campLayout(CAMP_CORE_H + 8 + 10).showSilhouettes).toBe(false)
  })
})
