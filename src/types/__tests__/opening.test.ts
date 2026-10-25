import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { warfrontReveal } from '../opening'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('warfrontReveal', () => {
  it('a fresh install shows only the button', () => {
    expect(warfrontReveal(make({}))).toEqual({
      buttonOnly: true, topBar: false, monsterName: false, gate: false, waveRow: false, chrome: false,
    })
  })

  it('during wave 0 before the first kill: only the monster and the gate', () => {
    expect(warfrontReveal(make({ waveActive: true }))).toEqual({
      buttonOnly: false, topBar: false, monsterName: false, gate: true, waveRow: false, chrome: false,
    })
  })

  it('the renown figure arrives at the first kill; nothing else yet', () => {
    const r = warfrontReveal(make({ waveActive: true, monstersDefeated: 1, waveKills: 1 }))
    expect(r).toMatchObject({ topBar: true, monsterName: true, waveRow: false, chrome: false })
  })

  it('wave row and footer arrive when wave 0 clears', () => {
    const r = warfrontReveal(make({ waveNumber: 1, monstersDefeated: 3, beatsSeen: ['prologue', 'elder_approaches', 'first_renown'] }))
    expect(r).toMatchObject({ waveRow: true, chrome: false })
  })

  it('objective, chips and the tab bar arrive with call_to_arms', () => {
    const r = warfrontReveal(make({ waveNumber: 1, monstersDefeated: 3, beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'] }))
    expect(r.chrome).toBe(true)
  })

  it('a save already past the opening shows everything', () => {
    const r = warfrontReveal(make({ waveNumber: 7, monstersDefeated: 40, beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach'] }))
    expect(r).toEqual({ buttonOnly: false, topBar: true, monsterName: true, gate: true, waveRow: true, chrome: true })
  })
})

describe('Waves 0-2 stay plain', () => {
  it('after Wave 0, 1 and 2 clear there is still no objective, chips or tab bar', () => {
    for (const waveNumber of [1, 2, 3]) {
      const r = warfrontReveal(make({ waveNumber, monstersDefeated: 3, beatsSeen: ['prologue', 'elder_approaches', 'first_renown'] }))
      expect(r).toMatchObject({ waveRow: true, gate: true, topBar: true, chrome: false })
    }
  })
})
