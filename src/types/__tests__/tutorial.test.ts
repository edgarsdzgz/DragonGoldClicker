import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { getActiveStep, isStepComplete, backfillTutorial, TUTORIAL_STEPS, EMPTY_TUTORIAL_UI } from '../tutorial'
import { CoachRegistry, isRectVisible, hintSide } from '../../context/coachRegistry'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('getActiveStep', () => {
  it('shows nothing until the first beat is seen', () => {
    expect(getActiveStep(make({}))).toBeNull()
  })

  it('starts tap_slay after the prologue and advances as steps complete', () => {
    let s = make({ beatsSeen: ['prologue'] })
    expect(getActiveStep(s)?.id).toBe('tap_slay')
    s = { ...s, tutorialStepsDone: ['tap_slay'] }
    // next step belongs to call_to_arms, which is unseen: the tutorial holds back
    expect(getActiveStep(s)).toBeNull()
    s = { ...s, beatsSeen: ['prologue', 'call_to_arms'] }
    expect(getActiveStep(s)?.id).toBe('tap_rally')
  })

  it('is strictly sequential even if a later beat is already seen', () => {
    const s = make({ beatsSeen: ['prologue', 'call_to_arms', 'the_breach', 'mend_the_walls'] })
    expect(getActiveStep(s)?.id).toBe('tap_slay')
  })

  it('has the nine steps in order', () => {
    expect(TUTORIAL_STEPS.map((t) => t.id)).toEqual([
      'tap_slay', 'tap_rally', 'tap_repair', 'open_forage', 'tap_forage',
      'train_gatherer', 'open_draconia', 'tap_garrison', 'build_garrison',
    ])
  })
})

describe('isStepComplete', () => {
  const step = (id: string) => TUTORIAL_STEPS.find((t) => t.id === id)!

  it('completes state-based steps from the save', () => {
    expect(isStepComplete(step('tap_slay'), make({ totalClicks: 0 }), EMPTY_TUTORIAL_UI)).toBe(false)
    expect(isStepComplete(step('tap_slay'), make({ totalClicks: 1 }), EMPTY_TUTORIAL_UI)).toBe(true)
    expect(isStepComplete(step('tap_rally'), make({ fighters: 1 }), EMPTY_TUTORIAL_UI)).toBe(true)
  })

  it('completes tab and sheet steps from the UI', () => {
    expect(isStepComplete(step('open_forage'), make({}), EMPTY_TUTORIAL_UI)).toBe(false)
    expect(isStepComplete(step('open_forage'), make({}), { ...EMPTY_TUTORIAL_UI, focusedTab: 'ForageTab' })).toBe(true)
    expect(isStepComplete(step('tap_garrison'), make({}), { ...EMPTY_TUTORIAL_UI, garrisonSheetOpen: true })).toBe(true)
  })
})

describe('backfillTutorial', () => {
  it('marks nothing for a save that has only seen the prologue', () => {
    expect(backfillTutorial(make({ beatsSeen: ['prologue'] }))).toEqual([])
  })

  it('marks every step up to the proven one for the 3/3/3 example save', () => {
    const done = backfillTutorial(make({
      beatsSeen: ['prologue', 'call_to_arms', 'the_breach', 'mend_the_walls', 'empty_stores', 'strangers_at_gate', 'a_city_to_build'],
      totalClicks: 50, fighters: 3, fightersRallied: 3, repairers: 3, repairersDirected: 3,
      foragers: { gatherers: 3, trappers: 0, rangers: 0 },
      foragersTrained: { gatherers: 3, trappers: 0, rangers: 0 },
      forageClicks: 4,
    }))
    expect(done).toEqual(['tap_slay', 'tap_rally', 'tap_repair', 'open_forage', 'tap_forage', 'train_gatherer'])
  })

  it('leaves steps pending when their beat is unseen', () => {
    const done = backfillTutorial(make({ beatsSeen: ['prologue', 'call_to_arms'], totalClicks: 5, fighters: 2 }))
    expect(done).toEqual(['tap_slay', 'tap_rally'])
  })

  it('marks everything for a save with the Garrison built', () => {
    const done = backfillTutorial(make({
      beatsSeen: ['prologue', 'call_to_arms', 'the_breach', 'mend_the_walls', 'empty_stores', 'a_city_to_build'],
      barracksLevel: 1,
    }))
    expect(done).toHaveLength(TUTORIAL_STEPS.length)
  })
})

describe('coach target registry', () => {
  const rect = { x: 10, y: 20, w: 100, h: 100 }

  it('reports no rectangle until the target registers, then the measured one', () => {
    const reg = new CoachRegistry()
    const seen: Array<unknown> = []
    reg.measure('slay', (r) => seen.push(r))
    expect(seen).toEqual([null])

    reg.register('slay', { measure: (cb) => cb(rect) })
    reg.measure('slay', (r) => seen.push(r))
    expect(seen[1]).toEqual(rect)
  })

  it('notifies subscribers on register and unregister', () => {
    const reg = new CoachRegistry()
    const fn = jest.fn()
    reg.subscribe(fn)
    const off = reg.register('a', { measure: (cb) => cb(rect) })
    off()
    expect(fn).toHaveBeenCalledTimes(2)
    expect(reg.get('a')).toBeUndefined()
  })

  it('treats off-screen or empty rectangles as not visible', () => {
    const win = { width: 400, height: 800 }
    expect(isRectVisible(rect, win)).toBe(true)
    expect(isRectVisible(null, win)).toBe(false)
    expect(isRectVisible({ x: 10, y: 900, w: 50, h: 50 }, win)).toBe(false)
    expect(isRectVisible({ x: 10, y: 10, w: 0, h: 50 }, win)).toBe(false)
  })

  it('puts the hint below a high target and above a low one', () => {
    expect(hintSide({ x: 0, y: 100, w: 50, h: 50 }, 800)).toBe('below')
    expect(hintSide({ x: 0, y: 650, w: 50, h: 50 }, 800)).toBe('above')
  })
})
