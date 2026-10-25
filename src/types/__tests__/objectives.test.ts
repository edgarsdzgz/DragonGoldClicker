import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { getCurrentObjective, isSpotlightActive } from '../objectives'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('getCurrentObjective', () => {
  it('is hidden while a guided step is active', () => {
    expect(getCurrentObjective(make({ beatsSeen: ['prologue'] }))).toBeNull()
  })

  it('shows the latest unmet objective once the guided steps are done', () => {
    const s = make({ beatsSeen: ['prologue'], tutorialStepsDone: ['tap_slay'], monstersDefeated: 7 })
    expect(getCurrentObjective(s)).toEqual({ label: 'Slay 20 monsters', current: 7, target: 20 })
  })

  it('prefers the most recently seen beat with an objective', () => {
    const s = make({
      beatsSeen: ['prologue', 'call_to_arms'],
      tutorialStepsDone: ['tap_slay', 'tap_rally'],
      fighters: 1,
      monstersDefeated: 5,
    })
    expect(getCurrentObjective(s)?.label).toBe('Rally 2 fighters')
  })

  it('falls back to an earlier unmet objective when the latest is met', () => {
    const s = make({
      beatsSeen: ['prologue', 'call_to_arms'],
      tutorialStepsDone: ['tap_slay', 'tap_rally'],
      fighters: 2,
      monstersDefeated: 5,
    })
    expect(getCurrentObjective(s)?.label).toBe('Slay 20 monsters')
  })

  it('is null when every objective is met', () => {
    const s = make({ beatsSeen: ['prologue'], tutorialStepsDone: ['tap_slay'], monstersDefeated: 20 })
    expect(getCurrentObjective(s)).toBeNull()
  })
})

describe('isSpotlightActive', () => {
  it('stays off for controls a guided step already covers', () => {
    const s = make({ beatsSeen: ['prologue', 'call_to_arms'], tutorialStepsDone: ['tap_slay', 'tap_rally'] })
    expect(isSpotlightActive(s, 'rally')).toBe(false)
    expect(isSpotlightActive(s, 'repair')).toBe(false)
  })
})
