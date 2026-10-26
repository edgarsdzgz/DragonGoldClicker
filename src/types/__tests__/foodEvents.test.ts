import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import {
  stepFoodEvents, startFoodEvent, answerRefugees, pickFoodEvent, gatherMultiplier, foodEventStatus, foodEventsOn,
  EVENT_GAP_MIN, EVENT_GAP_MAX, EVENT_WARNING_SEC, SEASON_SEC, RAID_SEC, RAIDER_INDEX, REFUGEE_FOOD_EACH,
} from '../foodEvents'
import { mealBalance } from '../foodTick'
import { strike, MONSTERS } from '../monsters'

const fixed = (v: number) => () => v
// After the food chapter: hunger on, stores filled by hand
const make = (over: Partial<GameState>): GameState => ({
  ...DEFAULT_GAME_STATE,
  beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'empty_stores'],
  questsDone: ['defend_the_wall', 'raise_the_guard', 'hold_the_line', 'fill_the_stores'],
  food: 200,
  fighters: 4,
  foragers: { gatherers: 2, trappers: 0, rangers: 0 },
  playSeconds: 1000,
  ...over,
})
/** Run the clock forward n seconds */
const run = (s: GameState, n: number, rand = fixed(0)) => {
  for (let i = 0; i < n; i++) s = stepFoodEvents({ ...s, playSeconds: s.playSeconds + 1 }, rand)
  return s
}

describe('scheduling', () => {
  it('waits for the food chapter to end (the stores filled by hand)', () => {
    expect(foodEventsOn(make({}))).toBe(true)
    expect(foodEventsOn(make({ questsDone: ['defend_the_wall'] }))).toBe(false)
    expect(stepFoodEvents(make({ questsDone: [] }), fixed(0))).toEqual(make({ questsDone: [] }))
  })

  it('schedules the first event 10-15 minutes ahead, then starts it on time', () => {
    const scheduled = stepFoodEvents(make({}), fixed(0))
    expect(scheduled.nextFoodEventAt).toBe(1000 + EVENT_GAP_MIN)
    expect(stepFoodEvents(make({}), fixed(0.999)).nextFoodEventAt).toBeLessThanOrEqual(1000 + EVENT_GAP_MAX)
    const due = make({ nextFoodEventAt: 1000 })
    expect(stepFoodEvents(due, fixed(0)).foodEvent).not.toBeNull()
  })

  it('never picks the same event twice in a row, and never raids empty stores', () => {
    for (let r = 0; r < 1; r += 0.05) {
      expect(pickFoodEvent(make({ lastFoodEventId: 'raid' }), fixed(r))).not.toBe('raid')
      expect(pickFoodEvent(make({ food: 0 }), fixed(r))).not.toBe('raid')
    }
  })
})

describe('Lean Season and Bountiful Harvest', () => {
  it('is announced a meal ahead, then halves the gatherers for 3 meals, then ends and reschedules', () => {
    let s = startFoodEvent(make({}), 'lean_season', fixed(0))
    expect(s.foodEvent).toMatchObject({ id: 'lean_season', phase: 'warned', until: 1000 + EVENT_WARNING_SEC })
    expect(gatherMultiplier(s)).toBe(1)
    expect(s.foodEventNote?.text).toMatch(/lean season is coming/i)
    s = run(s, EVENT_WARNING_SEC)
    expect(s.foodEvent?.phase).toBe('active')
    expect(gatherMultiplier(s)).toBe(0.5)
    expect(mealBalance(s).gathered).toBeCloseTo(8, 5)
    s = run(s, SEASON_SEC)
    expect(s.foodEvent).toBeNull()
    expect(s.lastFoodEventId).toBe('lean_season')
    expect(s.nextFoodEventAt).toBeGreaterThan(s.playSeconds)
  })

  it('the harvest doubles them', () => {
    const s = run(startFoodEvent(make({}), 'bountiful_harvest', fixed(0)), EVENT_WARNING_SEC)
    expect(gatherMultiplier(s)).toBe(2)
    expect(foodEventStatus(s)).toMatchObject({ tone: 'good' })
  })
})

describe('Raid on the Stores', () => {
  it('brings a raider to the gate when the warning runs out', () => {
    const s = run(startFoodEvent(make({}), 'raid', fixed(0)), EVENT_WARNING_SEC)
    expect(s.foodEvent).toMatchObject({ id: 'raid', phase: 'active' })
    expect(s.monsterIndex).toBe(RAIDER_INDEX)
    expect(s.monsterHp).toBe(MONSTERS[RAIDER_INDEX].hp)
    expect(foodEventStatus(s)?.text).toBe(`Raider at the gate: ${RAID_SEC}s`)
  })

  it('killing it in time saves the stores', () => {
    let s = run(startFoodEvent(make({}), 'raid', fixed(0)), EVENT_WARNING_SEC)
    s = strike(s, MONSTERS[RAIDER_INDEX].hp, 0).state
    expect(s.monsterIndex).not.toBe(RAIDER_INDEX)
    s = run(s, 1)
    expect(s.foodEvent).toBeNull()
    expect(s.food).toBe(200)
    expect(s.foodEventNote?.text).toMatch(/repelled/i)
  })

  it('if it escapes it takes 20% of the stores, and a pool monster takes its place', () => {
    const s = run(startFoodEvent(make({}), 'raid', fixed(0)), EVENT_WARNING_SEC + RAID_SEC)
    expect(s.foodEvent).toBeNull()
    expect(s.food).toBe(160)
    expect(s.monsterIndex).not.toBe(RAIDER_INDEX)
    expect(s.foodEventNote?.text).toBe('The raider escaped with 40 food.')
  })
})

describe('Refugees at the Gate', () => {
  it('waits for the player, then takes them in (fed from the stores) or turns them away', () => {
    const s = startFoodEvent(make({}), 'refugees', fixed(0))
    expect(s.foodEvent).toMatchObject({ id: 'refugees', phase: 'choice', refugees: 3 })
    // The clock does not end a choice
    expect(run(s, 5000).foodEvent?.phase).toBe('choice')
    const taken = answerRefugees(s, true, fixed(0))
    expect(taken.villagers).toBe(s.villagers + 3)
    expect(taken.food).toBe(200 - 3 * REFUGEE_FOOD_EACH)
    expect(taken.foodEvent).toBeNull()
    const turned = answerRefugees(s, false, fixed(0))
    expect(turned.villagers).toBe(s.villagers)
    expect(turned.food).toBe(200)
  })

  it('cannot take them in when the stores cannot feed them', () => {
    const s = startFoodEvent(make({ food: 5 }), 'refugees', fixed(0))
    expect(answerRefugees(s, true, fixed(0))).toBe(s)
  })
})
