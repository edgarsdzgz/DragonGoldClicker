import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { warfrontReveal, OPENING_KILLS } from '../opening'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('warfrontReveal', () => {
  it('a fresh install shows only the monster and the gate', () => {
    expect(warfrontReveal(make({}))).toEqual({ topBar: false, monsterName: false, details: false, chrome: false, claws: false })
  })

  it('the renown figure arrives at the first kill; nothing else yet', () => {
    const r = warfrontReveal(make({ monstersDefeated: 1 }))
    expect(r).toEqual({ topBar: true, monsterName: true, details: false, chrome: false, claws: false })
  })

  it('flavor line and footer arrive at the third kill (where Wave 0 used to clear)', () => {
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
    expect(r).toEqual({ topBar: true, monsterName: true, details: true, chrome: true, claws: false })
  })

  it("the Claws chip arrives with Pyreth's sharpen_claws scene, or with claws already sharpened", () => {
    expect(warfrontReveal(make({ beatsSeen: ['the_wall_is_yours'] })).claws).toBe(false)
    expect(warfrontReveal(make({ beatsSeen: ['the_wall_is_yours', 'sharpen_claws'] })).claws).toBe(true)
    expect(warfrontReveal(make({ clawLevel: 2 })).claws).toBe(true)
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

describe('the renown scene points at the renown figure', () => {
  it('first_renown boxes the top-bar figure registered as the renown coach target', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SCENES } = require('../../data/story/lines')
    expect(SCENES.first_renown.highlight).toBe('renown')
  })
})

describe('the Forage tab shows only gathering at first', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { forageReveal } = require('../opening')

  it('hides training and explorers while the player learns to forage', () => {
    expect(forageReveal(make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'empty_stores'] }))).toEqual({ training: false, explorers: false })
  })

  it('shows training once the stores are filled by hand, or for a save that has trained a gatherer', () => {
    expect(forageReveal(make({ questsDone: ['fill_the_stores'] })).training).toBe(true)
    expect(forageReveal(make({ foragersTrained: { gatherers: 1, trappers: 0, rangers: 0 } })).training).toBe(true)
  })

  it('shows explorers only once the Outpost is built', () => {
    expect(forageReveal(make({ questsDone: ['fill_the_stores'] })).explorers).toBe(false)
    expect(forageReveal(make({ postLevel: 1 })).explorers).toBe(true)
  })
})
