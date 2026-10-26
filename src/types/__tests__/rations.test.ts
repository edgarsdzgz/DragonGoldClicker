import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { RATIONS, DEFAULT_RATION, rationDef, isRationAvailable } from '../rations'
import { fedState, fighterDamageMultiplier, fighterStatus, WELL_FED_MEALS } from '../fedState'
import { mealCost } from '../foodTick'
import { RESEARCH_NODES } from '../research'

// Hunger on (empty_stores seen), 5 fighters
const make = (over: Partial<GameState>): GameState => ({
  ...DEFAULT_GAME_STATE,
  beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'empty_stores'],
  fighters: 5,
  food: 100,
  ...over,
})

describe('the five rations', () => {
  it('run none, quarter, half, full, double with the agreed upkeep and damage', () => {
    expect(RATIONS.map((r) => [r.id, r.upkeep, r.damage])).toEqual([
      ['none', 0, 0],
      ['quarter', 0.25, 0.4],
      ['half', 0.5, 0.7],
      ['full', 1, 1],
      ['double', 2, 1.4],
    ])
    expect(DEFAULT_RATION).toBe('full')
    expect(DEFAULT_GAME_STATE.ration).toBe('full')
  })

  it('locks quarter and double behind Librarium research that exists', () => {
    const fresh = make({})
    expect(RATIONS.filter((r) => isRationAvailable(fresh, r.id)).map((r) => r.id)).toEqual(['none', 'half', 'full'])
    expect(isRationAvailable(make({ completedResearch: ['lean_rations'] }), 'quarter')).toBe(true)
    expect(isRationAvailable(make({ completedResearch: ['feast_hall'] }), 'double')).toBe(true)
    for (const id of ['lean_rations', 'feast_hall']) expect(RESEARCH_NODES.some((n) => n.id === id)).toBe(true)
  })

  it('scale what the fighters eat each meal', () => {
    expect(mealCost(make({ ration: 'full' }))).toBe(20)
    expect(mealCost(make({ ration: 'half' }))).toBe(10)
    expect(mealCost(make({ ration: 'quarter' }))).toBe(5)
    expect(mealCost(make({ ration: 'double' }))).toBe(40)
    expect(mealCost(make({ ration: 'none' }))).toBe(0)
  })

  it('an unknown ration falls back to full', () => {
    expect(rationDef(undefined).id).toBe('full')
  })
})

describe('fed states', () => {
  it('well fed with 10 meals in store, fed below that', () => {
    expect(fedState(make({ food: 20 * WELL_FED_MEALS }))).toBe('well_fed')
    expect(fedState(make({ food: 20 * WELL_FED_MEALS - 1 }))).toBe('fed')
  })

  it('hungry when the next meal cannot be paid, starving at 0', () => {
    expect(fedState(make({ food: 19 }))).toBe('hungry')
    expect(fedState(make({ food: 0 }))).toBe('starving')
  })

  it('foragers bringing food in before the bell count against hunger', () => {
    expect(fedState(make({ food: 19, foragers: { gatherers: 1, trappers: 0, rangers: 0 } }))).toBe('fed')
  })

  it('without hunger, or with nothing eaten from the stores, the army is simply fed', () => {
    expect(fedState(make({ beatsSeen: ['prologue'], food: 0 }))).toBe('fed')
    expect(fedState(make({ ration: 'none', food: 0 }))).toBe('fed')
  })
})

describe('the fighters damage', () => {
  it('is the ration times the fed state', () => {
    expect(fighterDamageMultiplier(make({}))).toBe(1)
    expect(fighterDamageMultiplier(make({ ration: 'half', food: 50 }))).toBeCloseTo(0.7, 5)
    // Half rations stretch the stores: 100 food is 10 half-meals, so they are well fed too
    expect(fighterDamageMultiplier(make({ ration: 'half', food: 100 }))).toBeCloseTo(0.77, 5)
    expect(fighterDamageMultiplier(make({ food: 0 }))).toBe(0)
    expect(fighterDamageMultiplier(make({ food: 19 }))).toBe(0.5)
    expect(fighterDamageMultiplier(make({ food: 400, ration: 'full' }))).toBeCloseTo(1.1, 5)
    expect(fighterDamageMultiplier(make({ food: 800, ration: 'double' }))).toBeCloseTo(1.54, 5)
  })

  it('no rations: they stand down, whatever the stores hold', () => {
    expect(fighterDamageMultiplier(make({ ration: 'none', food: 500 }))).toBe(0)
  })
})

describe('the fighter status line', () => {
  it('says nothing when all is normal', () => {
    expect(fighterStatus(make({}))).toBeNull()
    expect(fighterStatus(make({ fighters: 0 }))).toBeNull()
  })

  it('names standing down, starving, hungry, well fed and lean rations', () => {
    expect(fighterStatus(make({ ration: 'none' }))?.text).toMatch(/stand down/)
    expect(fighterStatus(make({ food: 0 }))).toEqual({ text: 'Starving: fighters stand down', tone: 'bad' })
    expect(fighterStatus(make({ food: 19 }))?.text).toBe('Hungry: fighters at 50%')
    expect(fighterStatus(make({ food: 9, ration: 'half' }))?.text).toBe('Hungry: fighters at 35%')
    expect(fighterStatus(make({ food: 400 }))).toEqual({ text: 'Well fed: fighters at 110%', tone: 'good' })
    expect(fighterStatus(make({ ration: 'half', food: 50 }))).toEqual({ text: 'Half rations: fighters at 70%', tone: 'warn' })
  })
})
