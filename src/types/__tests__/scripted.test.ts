import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { applyCityDamage } from '../cityHp'
import { HP_FLOOR } from '../systems'
import { FOOD_CHECK_INTERVAL } from '../food'
import { STORY_BEATS } from '../story'
import { backfillScripted } from '../storyCatchUp'
import { runScripted, firstExpeditionReward, catchUpScripted, hasRun, BREACH_DAMAGE, FIRST_MEAL_DELAY_SEC } from '../scripted'
import { makeLoneWanderer } from '../wanderers'
import { SCENES } from '../../data/story/lines'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('applyCityDamage (HP floor)', () => {
  it('takes damage above the floor', () => {
    expect(applyCityDamage(make({ cityHp: 100 }), 15).cityHp).toBe(85)
  })

  it('never drops below the floor while threatUnfloored is off', () => {
    expect(applyCityDamage(make({ cityHp: 60 }), 40).cityHp).toBe(HP_FLOOR)
    expect(applyCityDamage(make({ cityHp: 50 }), 999).cityHp).toBe(HP_FLOOR)
  })

  it('does not raise a city that is already below the floor', () => {
    expect(applyCityDamage(make({ cityHp: 30 }), 10).cityHp).toBe(30)
  })

  it("lets HP reach 0 once Rodain hands the wall over (the_wall_is_yours)", () => {
    const s = make({ cityHp: 20, beatsSeen: ['the_wall_is_yours'] })
    expect(applyCityDamage(s, 50).cityHp).toBe(0)
  })

  it('ignores zero or negative damage', () => {
    const s = make({ cityHp: 70 })
    expect(applyCityDamage(s, 0)).toBe(s)
  })
})

describe('runScripted', () => {
  it('breachHit takes 15 HP once', () => {
    const once = runScripted(make({ cityHp: 100 }), 'breachHit')
    expect(once.cityHp).toBe(100 - BREACH_DAMAGE)
    expect(runScripted(once, 'breachHit').cityHp).toBe(100 - BREACH_DAMAGE)
    expect(once.scriptedDone).toContain('breachHit')
  })

  it('firstMeal brings the next food check ten seconds away', () => {
    const s = runScripted(make({ foodTimer: 3 }), 'firstMeal')
    expect(FOOD_CHECK_INTERVAL - s.foodTimer).toBe(FIRST_MEAL_DELAY_SEC)
  })

  it('loneWanderer sets one wanderer pending, free (Mirael feeds them), with no chance roll', () => {
    const s = runScripted(make({}), 'loneWanderer')
    expect(s.pendingWanderer?.encounterType).toBe('lone_wanderer')
    expect(s.pendingWanderer?.people).toBe(1)
    expect(s.pendingWanderer?.veteran).toBe(false)
    expect(s.pendingWanderer?.foodOnArrival).toBe(0)
  })

  it('does not record events that have no immediate effect', () => {
    for (const id of ['firstExpedition', 'offlineFraming'] as const) {
      const s = runScripted(make({}), id)
      expect(hasRun(s, id)).toBe(false)
    }
  })

  it('closing every scene in the story leaves the first-expedition guarantee and offline framing intact', () => {
    let s = make({})
    for (const beat of STORY_BEATS) if (beat.scripted) s = runScripted(s, beat.scripted)
    expect(hasRun(s, 'firstExpedition')).toBe(false)
    expect(hasRun(s, 'offlineFraming')).toBe(false)
    const claim = firstExpeditionReward(s, 0)
    expect(claim.found).toBe(1)
    expect(hasRun(claim.state, 'firstExpedition')).toBe(true)
  })

  it('does not record loneWanderer while another wanderer is pending, and runs it once that clears', () => {
    const pending = make({ pendingWanderer: makeLoneWanderer(make({})) })
    const blocked = runScripted(pending, 'loneWanderer')
    expect(hasRun(blocked, 'loneWanderer')).toBe(false)
    const cleared = runScripted({ ...blocked, pendingWanderer: null }, 'loneWanderer')
    expect(cleared.pendingWanderer?.encounterType).toBe('lone_wanderer')
    expect(hasRun(cleared, 'loneWanderer')).toBe(true)
  })
})

describe('catchUpScripted', () => {
  it('runs immediate events of seen beats that were never recorded', () => {
    const s = catchUpScripted(make({ cityHp: 100, beatsSeen: ['prologue', 'the_breach', 'empty_stores', 'strangers_at_gate'] }))
    expect(s.cityHp).toBe(100 - BREACH_DAMAGE)
    expect(FOOD_CHECK_INTERVAL - s.foodTimer).toBe(FIRST_MEAL_DELAY_SEC)
    expect(s.pendingWanderer?.encounterType).toBe('lone_wanderer')
    expect(s.scriptedDone).toEqual(expect.arrayContaining(['breachHit', 'firstMeal', 'loneWanderer']))
  })

  it('leaves unseen beats, recorded events and effect-less events alone', () => {
    const base = make({ cityHp: 85, beatsSeen: ['the_breach', 'beyond_the_walls', 'the_keep'], scriptedDone: ['breachHit'] })
    const s = catchUpScripted(base)
    expect(s.cityHp).toBe(85)
    expect(s.pendingWanderer).toBeNull()
    expect(hasRun(s, 'firstExpedition')).toBe(false)
    expect(hasRun(s, 'offlineFraming')).toBe(false)
  })

  it('is idempotent', () => {
    const once = catchUpScripted(make({ cityHp: 100, beatsSeen: ['the_breach'] }))
    expect(catchUpScripted(once).cityHp).toBe(once.cityHp)
  })
})

describe('firstExpeditionReward', () => {
  it('guarantees at least 1 villager the first time only', () => {
    const first = firstExpeditionReward(make({}), 0)
    expect(first.found).toBe(1)
    expect(first.state.scriptedDone).toContain('firstExpedition')
    expect(firstExpeditionReward(first.state, 0).found).toBe(0)
  })

  it('keeps a better roll', () => {
    expect(firstExpeditionReward(make({}), 3).found).toBe(3)
  })
})

describe('backfillScripted', () => {
  it('treats scripted events of seen beats as run, except an unsent first expedition', () => {
    const done = backfillScripted(make({ beatsSeen: ['prologue', 'the_breach', 'beyond_the_walls', 'the_keep'], nextExpeditionId: 1 }))
    expect(done).toEqual(expect.arrayContaining(['breachHit', 'offlineFraming']))
    expect(done).not.toContain('firstExpedition')
    expect(backfillScripted(make({ beatsSeen: ['beyond_the_walls'], nextExpeditionId: 3 }))).toContain('firstExpedition')
  })
})

describe('scene text', () => {
  it('has real lines for every non-silent beat and no placeholders', () => {
    for (const beat of STORY_BEATS.filter((b) => !b.silent)) {
      const scene = SCENES[beat.id]
      expect(scene).toBeDefined()
      expect(scene!.lines.length).toBeGreaterThan(0)
      for (const line of [...scene!.lines, ...(scene!.altLines ?? [])]) expect(line).not.toMatch(/placeholder/i)
    }
  })
})
