import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { GRANARY_CAP } from '../food'
import {
  FIND_KINDS, FIND_GAP_MIN, FIND_GAP_MAX, FIRST_FIND_TAP, FIND_SIZE, applyFind, advanceGap, findDef, findGap, findLabel,
  findPay, findShowMs, findSpots, isFirstFind, pickFind, pickSpot, driftDirection, FIND_DRIFT,
} from '../valleyFinds'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })
const JUST_BELOW_ONE = 0.999999

describe('the first find', () => {
  it('comes on the 5th lifetime tap, and only then', () => {
    expect(FIRST_FIND_TAP).toBe(5)
    expect(isFirstFind(3, 4)).toBe(false)
    expect(isFirstFind(4, 5)).toBe(true)
    expect(isFirstFind(5, 6)).toBe(false)
    expect(isFirstFind(500, 501)).toBe(false)
  })
  it('still comes when a held orb jumps past the 5th tap between renders', () => {
    expect(isFirstFind(3, 7)).toBe(true)
  })
})

describe('the gap between finds', () => {
  it('is 8 to 12 taps, at both ends of the roll', () => {
    expect(findGap(0)).toBe(FIND_GAP_MIN)
    expect(findGap(JUST_BELOW_ONE)).toBe(FIND_GAP_MAX)
    expect(findGap(1)).toBe(FIND_GAP_MAX)
    expect([FIND_GAP_MIN, FIND_GAP_MAX]).toEqual([8, 12])
  })
  it('reaches every number from 8 to 12', () => {
    const seen = new Set<number>()
    for (let i = 0; i < 100; i++) seen.add(findGap(i / 100))
    expect([...seen].sort((a, b) => a - b)).toEqual([8, 9, 10, 11, 12])
  })
  it('counts down by the taps made and stops at 0', () => {
    expect(advanceGap(8, 1)).toBe(7)
    expect(advanceGap(2, 5)).toBe(0)
  })
})

describe('the weighted pick', () => {
  it('lands on each kind at its edges (40 / 35 / 15 / 10)', () => {
    expect(pickFind(0).kind).toBe('rabbit')
    expect(pickFind(0.3999).kind).toBe('rabbit')
    expect(pickFind(0.4).kind).toBe('berries')
    expect(pickFind(0.7499).kind).toBe('berries')
    expect(pickFind(0.75).kind).toBe('fish')
    expect(pickFind(0.8999).kind).toBe('fish')
    expect(pickFind(0.9).kind).toBe('honey')
    expect(pickFind(JUST_BELOW_ONE).kind).toBe('honey')
    expect(pickFind(1).kind).toBe('honey')
  })
  it('has the table the owner chose', () => {
    expect(FIND_KINDS.map((f) => [f.kind, f.taps, f.foodPerTap, f.showMs, f.weight])).toEqual([
      ['rabbit', 1, 10, 2000, 40],
      ['berries', 3, 5, 2500, 35],
      ['fish', 1, 15, 1200, 15],
      ['honey', 5, 5, 3000, 10],
    ])
  })
})

describe('pay and timing', () => {
  it('scales food per tap by the forage yield', () => {
    expect(findPay(findDef('rabbit'), 1)).toBe(10)
    expect(findPay(findDef('rabbit'), 3)).toBe(30)
    expect(findPay(findDef('fish'), 2)).toBe(30)
    expect(findPay(findDef('honey'), 4)).toBe(20)
  })
  it('stays 1.5 times longer with Reduce Motion and 3 times with a screen reader', () => {
    const rabbit = findDef('rabbit')
    expect(findShowMs(rabbit, false, false)).toBe(2000)
    expect(findShowMs(rabbit, true, false)).toBe(3000)
    expect(findShowMs(rabbit, false, true)).toBe(6000)
    expect(findShowMs(rabbit, true, true)).toBe(6000)
  })
  it('labels a find for a screen reader', () => {
    expect(findLabel(findDef('rabbit'), 1, 10)).toBe('A rabbit in the grass. Tap to catch, 10 food')
    expect(findLabel(findDef('honey'), 5, 5)).toContain('Tap 5 times')
  })
})

describe('applyFind', () => {
  it('adds the food and counts it toward the by-hand quest', () => {
    const next = applyFind(make({ food: 20, totalFoodForaged: 30, foodGatheredByHand: 10 }), 10)
    expect(next.food).toBe(30)
    expect(next.totalFoodForaged).toBe(40)
    expect(next.foodGatheredByHand).toBe(20)
  })
  it('does not count as a forage trip', () => {
    expect(applyFind(make({ forageClicks: 7 }), 10).forageClicks).toBe(7)
  })
  it('keeps to the granary cap', () => {
    const next = applyFind(make({ food: GRANARY_CAP - 4, foodGatheredByHand: 0 }), 10)
    expect(next.food).toBe(GRANARY_CAP)
    expect(next.foodGatheredByHand).toBe(4)
  })
  it('takes nothing into a full granary', () => {
    const full = make({ food: GRANARY_CAP })
    expect(applyFind(full, 10)).toBe(full)
  })
})

describe('where a find sits', () => {
  const W = 360
  const H = 300
  const ORB = 160
  const FLAVOR = 36
  const stackTop = (H - (FLAVOR + ORB)) / 2
  const orb = { x: (W - ORB) / 2, y: stackTop + FLAVOR, w: ORB, h: ORB }
  const hits = (s: { x: number; y: number }) =>
    s.x < orb.x + orb.w && orb.x < s.x + FIND_SIZE && s.y < orb.y + orb.h && orb.y < s.y + FIND_SIZE

  it('never overlaps the orb or the flavor line, and stays inside the area', () => {
    const spots = findSpots(W, H, ORB, FLAVOR)
    expect(spots.length).toBeGreaterThan(0)
    for (const s of spots) {
      expect(hits(s)).toBe(false)
      expect(s.x).toBeGreaterThanOrEqual(0)
      expect(s.y).toBeGreaterThanOrEqual(0)
      expect(s.x + FIND_SIZE).toBeLessThanOrEqual(W)
      expect(s.y + FIND_SIZE).toBeLessThanOrEqual(H)
      expect(s.y + FIND_SIZE <= stackTop || s.y >= stackTop + FLAVOR).toBe(true)
    }
  })
  it("the rabbit's drift never carries it onto the orb or out of the area", () => {
    for (const s of findSpots(W, H, ORB, FLAVOR)) {
      const drifted = { x: s.x + driftDirection(s, W) * FIND_DRIFT, y: s.y }
      expect(hits(drifted)).toBe(false)
      // Away from the middle, where the orb is
      const fromMiddle = (x: number) => Math.abs(x + FIND_SIZE / 2 - W / 2)
      expect(fromMiddle(drifted.x)).toBeGreaterThan(fromMiddle(s.x))
      expect(drifted.x).toBeGreaterThanOrEqual(0)
      expect(drifted.x + FIND_SIZE).toBeLessThanOrEqual(W)
    }
  })
  it('has no spot when the orb fills the area', () => {
    expect(findSpots(200, 200, 190, FLAVOR)).toEqual([])
    expect(pickSpot([], 0.5)).toBeNull()
  })
  it('picks the first and last spot at the ends of the roll', () => {
    const spots = [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }]
    expect(pickSpot(spots, 0)).toBe(spots[0])
    expect(pickSpot(spots, JUST_BELOW_ONE)).toBe(spots[2])
    expect(pickSpot(spots, 1)).toBe(spots[2])
  })
})
