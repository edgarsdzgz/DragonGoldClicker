import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { getActiveStep, isStepComplete, backfillTutorial, needsMoreInspiration, TUTORIAL_STEPS, EMPTY_TUTORIAL_UI } from '../tutorial'
import { BARRACKS_LEVELS } from '../soldiers'
import { blockerCells, holeRadius, padRect } from '../../context/coachGeometry'
import { CoachRegistry, isRectVisible, hintSide } from '../../context/coachRegistry'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('getActiveStep', () => {
  it('shows nothing until the first beat is seen', () => {
    expect(getActiveStep(make({}))).toBeNull()
  })

  it('starts with tap_slay: the monster is at the gate from the start', () => {
    const s = make({ beatsSeen: ['prologue', 'elder_approaches'] })
    expect(getActiveStep(s)?.id).toBe('tap_slay')
    expect(getActiveStep(s)?.hint).toBe('Tap the kobold to strike it.')
  })

  it('a save from the wave days with begin_wave marked done still moves on to tap_slay', () => {
    const s = make({ beatsSeen: ['prologue', 'elder_approaches'], tutorialStepsDone: ['begin_wave'] })
    expect(getActiveStep(s)?.id).toBe('tap_slay')
  })

  it('advances as steps complete', () => {
    let s = make({ beatsSeen: ['prologue', 'elder_approaches'] })
    s = { ...s, tutorialStepsDone: ['tap_slay'] }
    // next step belongs to call_to_arms, which is unseen: the tutorial holds back
    expect(getActiveStep(s)).toBeNull()
    s = { ...s, beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'] }
    expect(getActiveStep(s)?.id).toBe('tap_rally')
  })

  it('is strictly sequential even if a later beat is already seen', () => {
    const s = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach', 'mend_the_walls'] })
    expect(getActiveStep(s)?.id).toBe('tap_slay')
  })

  it('has the eleven steps in order: foraging before Repair, then the claws', () => {
    expect(TUTORIAL_STEPS.map((t) => t.id)).toEqual([
      'tap_slay', 'tap_rally', 'open_forage', 'tap_forage', 'train_gatherer',
      'tap_repair', 'open_claws', 'sharpen_claws', 'open_draconia', 'tap_garrison', 'build_garrison',
    ])
  })

  it('training a gatherer waits until the stores are filled by hand (the player forages freely)', () => {
    const s = make({
      beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'empty_stores'],
      tutorialStepsDone: ['tap_slay', 'tap_rally', 'open_forage', 'tap_forage'],
      questsDone: ['defend_the_wall', 'raise_the_guard', 'hold_the_line'],
    })
    expect(getActiveStep(s)).toBeNull()
    expect(getActiveStep({ ...s, questsDone: [...s.questsDone, 'fill_the_stores'] })?.id).toBe('train_gatherer')
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
    expect(isStepComplete(step('tap_garrison'), make({}), { ...EMPTY_TUTORIAL_UI, openSheet: 'garrison' })).toBe(true)
  })

  it('the claws are two steps: open the sheet, then a hole on its Sharpen button', () => {
    expect(isStepComplete(step('open_claws'), make({}), { ...EMPTY_TUTORIAL_UI, openSheet: 'garrison' })).toBe(false)
    expect(isStepComplete(step('open_claws'), make({}), { ...EMPTY_TUTORIAL_UI, openSheet: 'claws' })).toBe(true)
    expect(isStepComplete(step('sharpen_claws'), make({}), { ...EMPTY_TUTORIAL_UI, openSheet: 'claws' })).toBe(false)
    expect(step('sharpen_claws').target).toBe('claws_sharpen')
    // A save that already sharpened clears the new step at once
    expect(isStepComplete(step('open_claws'), make({ clawLevel: 1 }), EMPTY_TUTORIAL_UI)).toBe(true)
  })
})

describe('backfillTutorial', () => {
  it('marks nothing for a save that has only seen the prologue', () => {
    expect(backfillTutorial(make({ beatsSeen: ['prologue', 'elder_approaches'] }))).toEqual([])
  })

  it('marks every step up to the proven one for the 3/3/3 example save', () => {
    const done = backfillTutorial(make({
      beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach', 'mend_the_walls', 'empty_stores', 'strangers_at_gate', 'a_city_to_build'],
      totalClicks: 50, fighters: 3, fightersRallied: 3, repairers: 3, repairersDirected: 3,
      foragers: { gatherers: 3, trappers: 0, rangers: 0 },
      foragersTrained: { gatherers: 3, trappers: 0, rangers: 0 },
      forageClicks: 4,
    }))
    expect(done).toEqual(['tap_slay', 'tap_rally', 'open_forage', 'tap_forage', 'train_gatherer', 'tap_repair'])
  })

  it('leaves steps pending when their beat is unseen', () => {
    const done = backfillTutorial(make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'], totalClicks: 5, fighters: 2 }))
    expect(done).toEqual(['tap_slay', 'tap_rally'])
  })

  it('marks everything for a save with the Garrison built', () => {
    const done = backfillTutorial(make({
      beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach', 'mend_the_walls', 'the_wall_is_yours', 'sharpen_claws', 'empty_stores', 'a_city_to_build'],
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

describe('needsMoreInspiration (spend steps)', () => {
  const step = (id: string) => TUTORIAL_STEPS.find((t) => t.id === id)!

  it('flags a spend step the player cannot afford', () => {
    expect(needsMoreInspiration(step('tap_rally'), make({ inspiration: 0.2 }))).toBe(true)
    expect(needsMoreInspiration(step('tap_repair'), make({ inspiration: 0.1 }))).toBe(true)
    expect(needsMoreInspiration(step('train_gatherer'), make({ inspiration: 0 }))).toBe(true)
    expect(needsMoreInspiration(step('build_garrison'), make({ inspiration: 1 }))).toBe(true)
  })

  it('clears once the player can afford it', () => {
    expect(needsMoreInspiration(step('tap_rally'), make({ inspiration: 5 }))).toBe(false)
    expect(needsMoreInspiration(step('build_garrison'), make({ inspiration: BARRACKS_LEVELS[0].cost }))).toBe(false)
  })

  it('never flags non-spend steps', () => {
    for (const id of ['tap_slay', 'open_forage', 'tap_forage', 'open_draconia', 'tap_garrison']) {
      expect(needsMoreInspiration(step(id), make({ inspiration: 0 }))).toBe(false)
    }
  })

  it('uses the price after earlier purchases', () => {
    const cheap = needsMoreInspiration(step('tap_repair'), make({ inspiration: 1, repairersDirected: 0 }))
    const dear = needsMoreInspiration(step('tap_repair'), make({ inspiration: 1, repairersDirected: 6 }))
    expect(cheap).toBe(false)
    expect(dear).toBe(true)
  })
})

describe('coach geometry', () => {
  const area = (cells: Array<{ w: number; h: number }>) => cells.reduce((sum, c) => sum + c.w * c.h, 0)

  it('blockers cover the whole window except the target rectangle, exactly', () => {
    const hole = { x: 100, y: 200, w: 80, h: 80 }
    const cells = blockerCells(400, 800, [hole])
    expect(area(cells)).toBe(400 * 800 - 80 * 80)
    const inside = cells.some((c) => 120 > c.x && 120 < c.x + c.w && 220 > c.y && 220 < c.y + c.h)
    expect(inside).toBe(false)
  })

  it('handles two holes and a hole against the window edge', () => {
    const holes = [{ x: 0, y: 700, w: 100, h: 100 }, { x: 150, y: 300, w: 60, h: 60 }]
    expect(area(blockerCells(400, 800, holes))).toBe(400 * 800 - 100 * 100 - 60 * 60)
  })

  it('makes a circular hole for round targets and a rounded one otherwise', () => {
    expect(holeRadius({ x: 0, y: 0, w: 100, h: 100 }, 12)).toBe(50)
    expect(holeRadius({ x: 0, y: 0, w: 100, h: 140 }, 12)).toBe(12)
  })

  it('pads visually without changing the exact rectangle', () => {
    const r = { x: 10, y: 10, w: 50, h: 50 }
    expect(padRect(r, 6)).toEqual({ x: 4, y: 4, w: 62, h: 62 })
    expect(r.w).toBe(50)
  })
})

describe('the opening and the first strike step', () => {
  it('tap_slay is not active until elder_approaches has closed', () => {
    expect(getActiveStep(make({}))).toBeNull()
    expect(getActiveStep(make({ beatsSeen: ['prologue'] }))).toBeNull()
    expect(getActiveStep(make({ beatsSeen: ['prologue', 'elder_approaches'] }))?.id).toBe('tap_slay')
  })

  it('backfill marks it done for a save that has struck, and leaves a fresh one pending', () => {
    expect(backfillTutorial(make({ beatsSeen: ['prologue', 'elder_approaches'], monstersDefeated: 3, totalClicks: 10 }))).toEqual(['tap_slay'])
    expect(backfillTutorial(make({ beatsSeen: ['prologue', 'elder_approaches'] }))).toEqual([])
  })
})
