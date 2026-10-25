import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { applyCityDamage } from '../cityHp'
import { HP_FLOOR } from '../systems'
import { FOOD_CHECK_INTERVAL } from '../food'
import { STORY_BEATS } from '../story'
import { backfillScripted } from '../storyMigration'
import { runScripted, firstExpeditionReward, BREACH_DAMAGE, FIRST_MEAL_DELAY_SEC } from '../scripted'
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

  it('lets HP reach 0 once the horde grows', () => {
    const s = make({ cityHp: 20, beatsSeen: ['the_horde_grows'] })
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

  it('loneWanderer sets a lone, untrained wanderer pending, with no chance roll', () => {
    const s = runScripted(make({}), 'loneWanderer')
    expect(s.pendingWanderer?.encounterType).toBe('lone_wanderer')
    expect(s.pendingWanderer?.villagerCount).toBe(1)
    expect(s.pendingWanderer?.trained).toBeNull()
  })

  it('records events with no state effect without changing anything else', () => {
    const s = runScripted(make({}), 'trainedRefugee')
    expect(s.scriptedDone).toEqual(['trainedRefugee'])
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

  it('gives lean_times an alternate line for the the_keep fallback', () => {
    expect(SCENES.lean_times?.altLines?.[0]).toMatch(/held so far/)
    const beat = STORY_BEATS.find((b) => b.id === 'lean_times')!
    expect(beat.altScene?.(make({ food: 50 }))).toBe(true)
    expect(beat.altScene?.(make({ food: 0 }))).toBe(false)
  })
})
