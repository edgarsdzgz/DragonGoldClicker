import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { warfrontReveal, OPENING_KILLS } from '../opening'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('warfrontReveal', () => {
  it('a fresh install shows only the monster and the gate', () => {
    expect(warfrontReveal(make({}))).toEqual({ topBar: false, monsterName: false, details: false, chrome: false })
  })

  it('the renown figure arrives at the first kill; nothing else yet', () => {
    const r = warfrontReveal(make({ monstersDefeated: 1 }))
    expect(r).toEqual({ topBar: true, monsterName: true, details: false, chrome: false })
  })

  it('flavour line and footer arrive at the third kill (where Wave 0 used to clear)', () => {
    expect(OPENING_KILLS).toBe(3)
    expect(warfrontReveal(make({ monstersDefeated: 2 })).details).toBe(false)
    const r = warfrontReveal(make({ monstersDefeated: 3, beatsSeen: ['prologue', 'elder_approaches', 'first_renown'] }))
    expect(r).toMatchObject({ details: true, chrome: false })
  })

  it('objective, chips and the tab bar arrive with call_to_arms', () => {
    const r = warfrontReveal(make({ monstersDefeated: 13, beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'] }))
    expect(r.chrome).toBe(true)
  })

  it('a save already past the opening shows everything', () => {
    const r = warfrontReveal(make({ monstersDefeated: 40, beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach'] }))
    expect(r).toEqual({ topBar: true, monsterName: true, details: true, chrome: true })
  })

  it('the old wave fields no longer change what is shown', () => {
    const plain = warfrontReveal(make({ monstersDefeated: 5 }))
    expect(warfrontReveal(make({ monstersDefeated: 5, waveNumber: 9, waveActive: true }))).toEqual(plain)
  })
})

describe('the first kills stay plain', () => {
  it('until call_to_arms there is no objective, chips or tab bar', () => {
    for (const monstersDefeated of [3, 8, 12]) {
      const r = warfrontReveal(make({ monstersDefeated, beatsSeen: ['prologue', 'elder_approaches', 'first_renown'] }))
      expect(r).toMatchObject({ details: true, topBar: true, chrome: false })
    }
  })
})
