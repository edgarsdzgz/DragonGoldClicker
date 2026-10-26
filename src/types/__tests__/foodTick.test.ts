import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { FOOD_CHECK_INTERVAL } from '../food'
import { resolveFoodTick, applyFoodTick, stepFood } from '../foodTick'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('resolveFoodTick', () => {
  it('only advances the timer before the interval is reached', () => {
    const r = resolveFoodTick(make({ foodTimer: 3 }), true)
    expect(r.tick.timer).toBe(4)
    expect(r.warning).toBeNull()
    expect(r.report).toBeNull()
  })

  it('consumes food when the check fires and resets the timer', () => {
    const s = make({ foodTimer: FOOD_CHECK_INTERVAL - 1, food: 200, villagers: 10 })
    const r = resolveFoodTick(s, true)
    expect(r.tick.timer).toBe(0)
    expect(applyFoodTick(s, r.tick).food).toBe(190)
  })

  it('kills nobody and reports nothing on empty stores while starvation is off', () => {
    const s = make({ foodTimer: FOOD_CHECK_INTERVAL - 1, food: 0, villagers: 50 })
    const r = resolveFoodTick(s, false)
    expect(r.report).toBeNull()
    const next = applyFoodTick(s, r.tick)
    expect(next.villagers).toBe(50)
    expect(r.warning).toBe(1)
  })

  it('can kill and report on empty stores while starvation is on', () => {
    const roll = jest.spyOn(Math, 'random').mockReturnValue(0)
    const s = make({ foodTimer: FOOD_CHECK_INTERVAL - 1, food: 0, villagers: 5 })
    const r = resolveFoodTick(s, true)
    roll.mockRestore()
    expect(r.report?.villagersLost).toBe(5)
    expect(applyFoodTick(s, r.tick).villagers).toBe(0)
  })
})

describe('stepFood (decides from prev)', () => {
  const due = { foodTimer: FOOD_CHECK_INTERVAL - 1, villagers: 5 }

  it('rolls starvation only against the stores in prev, so refilled stores are safe', () => {
    const roll = jest.spyOn(Math, 'random').mockReturnValue(0)
    const empty = stepFood(make({ ...due, food: 0 }), true)
    const refilled = stepFood(make({ ...due, food: 500 }), true)
    roll.mockRestore()
    expect(empty.pendingStarvationReport?.villagersLost).toBe(5)
    expect(refilled.pendingStarvationReport).toBeNull()
    expect(refilled.villagers).toBe(5)
  })

  it('puts the warning in the returned state and only when it escalates', () => {
    const first = stepFood(make({ ...due, food: 0 }), false)
    expect(first.pendingFoodWarning).toBe(1)
    expect(first.lastFoodWarning).toBe(1)
    const again = stepFood(make({ ...due, food: 0, lastFoodWarning: 1 }), false)
    expect(again.pendingFoodWarning).toBe(0)
  })

  it('leaves pending payloads alone on seconds where no check fires', () => {
    const report = { villagersLost: 1, soldiersLost: { conscripts: 0, footmen: 0, knights: 0 }, foragersLost: { gatherers: 0, trappers: 0, rangers: 0 }, explorersLost: 0, fightersLost: 0, repairersLost: 0 }
    const next = stepFood(make({ foodTimer: 3, pendingStarvationReport: report }), true)
    expect(next.pendingStarvationReport).toBe(report)
    expect(next.foodTimer).toBe(4)
  })
})

describe('one meal, as the screen shows it', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { mealCost, mealBalance, foodPerCheck } = require('../foodTick')

  it('charges every mouth: villagers 1, fighters 2, gatherers 0.5, rounded up', () => {
    const s = make({ villagers: 18, fighters: 5, foragers: { gatherers: 1, trappers: 0, rangers: 0 }, food: 500 })
    // 18 + 10 + 0.5 = 28.5, rounded up to 29
    expect(mealCost(s)).toBe(29)
    expect(foodPerCheck(s)).toBe(29)
  })

  it('the tick never takes more than the stores hold, but the cost shown is the full cost', () => {
    const s = make({ villagers: 18, fighters: 5, food: 10 })
    expect(foodPerCheck(s)).toBe(10)
    expect(mealCost(s)).toBe(28)
  })

  it('nets what foragers bring in between meals against what is eaten', () => {
    const s = make({ villagers: 18, fighters: 5, foragers: { gatherers: 1, trappers: 0, rangers: 0 } })
    const b = mealBalance(s)
    expect(b.eaten).toBe(29)
    expect(b.gathered).toBeCloseTo(0.2 * FOOD_CHECK_INTERVAL, 5)
    expect(b.net).toBeCloseTo(6 - 29, 5)
  })
})

describe('number formats for food', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { formatCount, formatAmount } = require('../state')

  it('counts are whole numbers', () => {
    expect(formatCount(288)).toBe('288')
    expect(formatCount(212.5)).toBe('212')
    expect(formatCount(0)).toBe('0')
    expect(formatCount(1500)).toBe('1.5K')
  })

  it('amounts keep a half when there is one', () => {
    expect(formatAmount(18.5)).toBe('18.5')
    expect(formatAmount(29)).toBe('29')
    expect(formatAmount(6.0000001)).toBe('6')
  })
})
