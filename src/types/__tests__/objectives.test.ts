import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { getCurrentObjective, isSpotlightActive } from '../objectives'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('getCurrentObjective', () => {
  it('is hidden while a guided step is active', () => {
    expect(getCurrentObjective(make({ beatsSeen: ['prologue', 'elder_approaches'] }))).toBeNull()
  })

  it('nothing before the renown scene: the first quest is offered after first_renown', () => {
    const s = make({ beatsSeen: ['prologue', 'elder_approaches'], tutorialStepsDone: ['tap_slay'], monstersDefeated: 1 })
    expect(getCurrentObjective(s)).toBeNull()
  })

  it('shows the Defend the Wall quest after the first kill', () => {
    const s = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown'], tutorialStepsDone: ['tap_slay'], monstersDefeated: 1, killsByMonster: { kobold: 1 } })
    expect(getCurrentObjective(s)).toEqual({ label: 'Defeat 4 kobolds', current: 1, target: 4 })
  })

  it('moves on to Raise the Guard once the wall is defended and call_to_arms is seen', () => {
    const s = make({
      beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'],
      tutorialStepsDone: ['tap_slay', 'tap_rally'],
      questsDone: ['defend_the_wall'],
      fightersRallied: 1,
      monstersDefeated: 6,
    })
    expect(getCurrentObjective(s)).toEqual({ label: 'Rally 2 fighters', current: 1, target: 2 })
  })

  it('is null when every offered quest is done and no beat objective is left', () => {
    const s = make({
      beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'],
      tutorialStepsDone: ['tap_slay', 'tap_rally'],
      questsDone: ['defend_the_wall', 'raise_the_guard', 'hold_the_line', 'fill_the_stores'],
    })
    expect(getCurrentObjective(s)).toBeNull()
  })
})

describe('isSpotlightActive', () => {
  it('stays off for controls a guided step already covers', () => {
    const s = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'], tutorialStepsDone: ['begin_wave', 'tap_slay', 'tap_rally'] })
    expect(isSpotlightActive(s, 'rally')).toBe(false)
    expect(isSpotlightActive(s, 'repair')).toBe(false)
  })
})
