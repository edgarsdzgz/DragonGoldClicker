import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { FOOD_CHECK_INTERVAL } from '../food'
import { resolveFoodTick, applyFoodTick } from '../foodTick'

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
