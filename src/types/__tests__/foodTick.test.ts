import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { FOOD_CHECK_INTERVAL } from '../food'
import { resolveFoodTick, applyFoodTick, stepFood, outlookText, STORES_ALARM_MINUTES } from '../foodTick'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('resolveFoodTick', () => {
  it('only advances the timer before the interval is reached', () => {
    const r = resolveFoodTick(make({ foodTimer: 3 }))
    expect(r.tick.timer).toBe(4)
    expect(r.warning).toBeNull()
  })

  it('consumes food when the check fires and resets the timer: only the army eats', () => {
    const s = make({ foodTimer: FOOD_CHECK_INTERVAL - 1, food: 200, villagers: 10, fighters: 5 })
    const r = resolveFoodTick(s)
    expect(r.tick.timer).toBe(0)
    // 5 fighters x 4; the 10 villagers feed themselves
    expect(applyFoodTick(s, r.tick).food).toBe(180)
  })

  it('an unpaid meal kills nobody (starvation was retired with Lean Times, chapter 7)', () => {
    const s = make({ foodTimer: FOOD_CHECK_INTERVAL - 1, food: 0, villagers: 50, fighters: 2, repairers: 2, soldiers: { conscripts: 2, footmen: 0, knights: 0 } })
    const r = resolveFoodTick(s)
    const next = applyFoodTick(s, r.tick)
    expect([next.villagers, next.fighters, next.repairers, next.soldiers.conscripts]).toEqual([50, 2, 2, 2])
    expect(r.warning).toBe(1)
  })
})

describe('applyFoodTick', () => {
  it('never leaves the stores below 0 when applied to a newer state', () => {
    expect(applyFoodTick(make({ food: 5 }), { timer: 0, consumed: 20 }).food).toBe(0)
  })
})

describe('stepFood (decides from prev)', () => {
  const due = { foodTimer: FOOD_CHECK_INTERVAL - 1, villagers: 5, fighters: 1 }

  it('puts the warning in the returned state and only when it escalates', () => {
    const first = stepFood(make({ ...due, food: 0 }))
    expect(first.pendingFoodWarning).toBe(1)
    expect(first.lastFoodWarning).toBe(1)
    const again = stepFood(make({ ...due, food: 0, lastFoodWarning: 1 }))
    expect(again.pendingFoodWarning).toBe(0)
  })

  it('leaves the warning alone on seconds where no check fires', () => {
    const next = stepFood(make({ foodTimer: 3, pendingFoodWarning: 3 }))
    expect(next.pendingFoodWarning).toBe(3)
    expect(next.foodTimer).toBe(4)
  })
})

describe('one meal, as the screen shows it (layer 3)', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { mealCost, mealBalance, foodPerCheck, storesOutlook } = require('../foodTick')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { granaryRoom, GRANARY_CAP } = require('../food')
  const gatherers = (n: number) => ({ gatherers: n, trappers: 0, rangers: 0 })

  it('rings every 2 minutes, and only the army eats: fighter 4, repairer 3', () => {
    expect(FOOD_CHECK_INTERVAL).toBe(120)
    const s = make({ villagers: 18, fighters: 5, repairers: 2, foragers: gatherers(3), food: 500 })
    expect(mealCost(s)).toBe(26)
    expect(foodPerCheck(s)).toBe(26)
    expect(mealCost(make({ villagers: 25, foragers: gatherers(6) }))).toBe(0)
  })

  it('one gatherer feeds two fighters; 5 fighters and 3 gatherers grow the stores by 4 a meal', () => {
    expect(mealBalance(make({ fighters: 2, foragers: gatherers(1) })).net).toBeCloseTo(0, 5)
    const b = mealBalance(make({ fighters: 5, foragers: gatherers(3) }))
    expect(b.eaten).toBe(20)
    expect(b.gathered).toBeCloseTo(24, 5)
    expect(b.net).toBeCloseTo(4, 5)
  })

  it('the tick never takes more than the stores hold, but the cost shown is the full cost', () => {
    const s = make({ fighters: 5, food: 10 })
    expect(foodPerCheck(s)).toBe(10)
    expect(mealCost(s)).toBe(20)
  })

  it('gives a horizon: how long the stores last, or that they grow, hold or are full', () => {
    expect(storesOutlook(make({ fighters: 5, food: 200 }))).toEqual({ kind: 'shrinking', minutes: 20 })
    expect(storesOutlook(make({ fighters: 5, food: 10 }))).toEqual({ kind: 'emptyNextMeal' })
    // Foragers bring food in before the bell: 10 in store + 8 gathered still feeds 4 fighters (16)
    expect(storesOutlook(make({ fighters: 4, foragers: gatherers(1), food: 10 })).kind).not.toBe('emptyNextMeal')
    expect(storesOutlook(make({ fighters: 5, foragers: gatherers(3), food: 100 })).kind).toBe('growing')
    expect(storesOutlook(make({ fighters: 2, foragers: gatherers(1), food: 100 }))).toEqual({ kind: 'steady' })
    expect(storesOutlook(make({ fighters: 1, foragers: gatherers(3), food: GRANARY_CAP }))).toEqual({ kind: 'full' })
  })

  it('the granary holds 500: food that does not fit is lost', () => {
    expect(GRANARY_CAP).toBe(500)
    expect(granaryRoom(490, 25)).toBe(10)
    expect(granaryRoom(500, 5)).toBe(0)
    expect(granaryRoom(600, 5)).toBe(0)
    expect(granaryRoom(100, 1)).toBe(1)
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

describe('outlookText: how worried the stores line looks', () => {
  it('stores that last a long while are a heads-up, not an alarm', () => {
    expect(outlookText({ kind: 'shrinking', minutes: 20 }).tone).toBe('warn')
    expect(outlookText({ kind: 'shrinking', minutes: STORES_ALARM_MINUTES }).tone).toBe('warn')
  })

  it('stores about to run out are an alarm', () => {
    expect(outlookText({ kind: 'shrinking', minutes: STORES_ALARM_MINUTES - 1 }).tone).toBe('bad')
    expect(outlookText({ kind: 'emptyNextMeal' }).tone).toBe('bad')
  })

  it('full or growing stores are good news', () => {
    expect(outlookText({ kind: 'full' }).tone).toBe('good')
  })
})
