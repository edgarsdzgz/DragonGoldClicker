import { chipsFit, chipWidth, battleLayout, MIN_ORB, MAX_ORB, FLOOR_ORB, ORB_PAD, ORB_GAP, FLAVOR_H } from '../warfrontLayout'

// Heights used for the screens (dp): window - chrome. See the commit message for the sums.
const TYPICAL_360x640 = 640 - 414
const WORST_360x640 = 640 - 450
const WORST_411x891 = 891 - 512

const used = (h: number) => {
  const l = battleLayout(h)
  return l.diameter + ORB_PAD * 2 + ORB_GAP + (l.showFlavor ? FLAVOR_H : 0)
}

describe('battleLayout', () => {
  it('caps the circle at 260 on a tall screen and shows the flavour line', () => {
    const l = battleLayout(WORST_411x891)
    expect(l.diameter).toBe(MAX_ORB)
    expect(l.showFlavor).toBe(true)
  })

  it('fits the typical 360x640 screen at 180 or more', () => {
    expect(battleLayout(TYPICAL_360x640).diameter).toBeGreaterThanOrEqual(MIN_ORB)
  })

  it('drops the flavour line before shrinking the circle below 180', () => {
    const l = battleLayout(MIN_ORB + ORB_PAD * 2 + ORB_GAP + FLAVOR_H - 1)
    expect(l.showFlavor).toBe(false)
    expect(l.diameter).toBeGreaterThanOrEqual(MIN_ORB)
  })

  it('never overlaps what is below: the circle and its padding always fit the free height', () => {
    for (let h = ORB_PAD * 2 + ORB_GAP + FLOOR_ORB; h <= 600; h += 7) {
      expect(used(h)).toBeLessThanOrEqual(h)
    }
  })

  it('the worst-case 360x640 screen still fits without overlap', () => {
    expect(used(WORST_360x640)).toBeLessThanOrEqual(WORST_360x640)
  })

  it('stays within 120 and 260', () => {
    expect(battleLayout(0).diameter).toBe(FLOOR_ORB)
    expect(battleLayout(5000).diameter).toBe(MAX_ORB)
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
