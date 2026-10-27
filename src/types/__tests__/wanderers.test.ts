import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { REFUGEE_FOOD_EACH } from '../foodEvents'
import {
  WANDERER_TABLE, WANDERER_GAP_MIN_SEC, WANDERER_GAP_MAX_SEC, SHORT_HANDED_VILLAGERS,
  rollWandererEncounter, makeLoneWanderer, wandererGap, stepWanderers,
  canWelcome, welcomeWanderer, turnAwayWanderer,
} from '../wanderers'
import type { WandererEncounter } from '../wanderers'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })
const ON = ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'empty_stores', 'the_breach',
  'mend_the_walls', 'the_wall_is_yours', 'sharpen_claws', 'strangers_at_gate']
const fixed = (r: number) => () => r
const seconds = (s: GameState, n: number) => {
  let out = s
  for (let i = 0; i < n; i++) out = stepWanderers({ ...out, playSeconds: out.playSeconds + 1 }, fixed(0))
  return out
}
const family: WandererEncounter = { encounterType: 'small_family', people: 3, veteran: false, flavorText: '', foodOnArrival: 30 }
const veteran: WandererEncounter = { encounterType: 'veteran', people: 1, veteran: true, flavorText: '', foodOnArrival: 10 }

describe('who arrives', () => {
  it('lone 60, couple 25, family 10, veteran 5', () => {
    expect(WANDERER_TABLE.map((w) => [w.type, w.weight, w.people, w.veteran])).toEqual([
      ['lone_wanderer', 60, 1, false],
      ['traveling_couple', 25, 2, false],
      ['small_family', 10, 3, false],
      ['veteran', 5, 1, true],
    ])
  })

  it('the roll follows the weights', () => {
    const at = (r: number) => rollWandererEncounter(make({}), fixed(r)).encounterType
    expect(at(0)).toBe('lone_wanderer')
    expect(at(0.59)).toBe('lone_wanderer')
    expect(at(0.61)).toBe('traveling_couple')
    expect(at(0.86)).toBe('small_family')
    expect(at(0.96)).toBe('veteran')
  })

  it('every newcomer eats 10 food on arrival, the same rule as refugees', () => {
    const couple = rollWandererEncounter(make({}), fixed(0.7))
    expect(couple.foodOnArrival).toBe(2 * REFUGEE_FOOD_EACH)
  })

  it('the scripted first wanderer is free: Mirael feeds them', () => {
    expect(makeLoneWanderer(make({}))).toMatchObject({ encounterType: 'lone_wanderer', people: 1, foodOnArrival: 0 })
  })
})

describe('when they arrive', () => {
  it('one every 4-7 minutes of play; twice as often while the city is short-handed', () => {
    const full = make({ villagers: SHORT_HANDED_VILLAGERS })
    expect(wandererGap(full, fixed(0))).toBe(WANDERER_GAP_MIN_SEC)
    expect(wandererGap(full, fixed(1))).toBe(WANDERER_GAP_MAX_SEC)
    expect(wandererGap(make({ villagers: SHORT_HANDED_VILLAGERS - 1 }), fixed(0))).toBe(WANDERER_GAP_MIN_SEC / 2)
  })

  it('nobody comes before Mirael brings the first', () => {
    expect(seconds(make({ villagers: 10 }), 2000).pendingWanderer).toBeNull()
  })

  it('schedules, then arrives on time, and waits for an answer before scheduling again', () => {
    const s = make({ beatsSeen: ON, villagers: 10, playSeconds: 100 })
    const scheduled = seconds(s, 1)
    expect(scheduled.nextWandererAt).toBe(101 + WANDERER_GAP_MIN_SEC)
    const before = seconds(scheduled, WANDERER_GAP_MIN_SEC - 1)
    expect(before.pendingWanderer).toBeNull()
    const arrived = seconds(before, 1)
    expect(arrived.pendingWanderer).not.toBeNull()
    // Waiting: nothing new is scheduled until the player answers
    const waiting = seconds(arrived, 1000)
    expect(waiting.pendingWanderer).toBe(arrived.pendingWanderer)
    expect(waiting.nextWandererAt).toBe(0)
    expect(seconds(turnAwayWanderer(waiting), 1).nextWandererAt).toBeGreaterThan(0)
  })
})

describe('the answer', () => {
  it('welcoming a family feeds them from the stores and adds three villagers', () => {
    const s = welcomeWanderer(make({ pendingWanderer: family, food: 100, villagers: 4, wanderersWelcomed: 1 }))
    expect(s).toMatchObject({ pendingWanderer: null, food: 70, villagers: 7, wanderersWelcomed: 4 })
  })

  it('a veteran joins the fighters, not the villagers, with no Rally cost', () => {
    const s = welcomeWanderer(make({ pendingWanderer: veteran, food: 50, villagers: 4, fighters: 6, fightersRallied: 6, inspiration: 3 }))
    expect(s).toMatchObject({ fighters: 7, villagers: 4, fightersRallied: 6, inspiration: 3, food: 40 })
  })

  it('cannot be welcomed when the stores cannot feed them', () => {
    const short = make({ pendingWanderer: family, food: 29 })
    expect(canWelcome(short)).toBe(false)
    expect(welcomeWanderer(short)).toBe(short)
  })

  it('turning them away costs nothing', () => {
    const s = turnAwayWanderer(make({ pendingWanderer: family, food: 100, villagers: 4 }))
    expect(s).toMatchObject({ pendingWanderer: null, food: 100, villagers: 4 })
  })
})
