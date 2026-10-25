import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { getStoryEntries, getHowItWorks, isLoreUnlocked, getLoreLines } from '../../data/story/journal'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('journal', () => {
  it('lists only seen scenes, in story order, skipping silent beats', () => {
    const s = make({ beatsSeen: ['prologue', 'first_renown', 'call_to_arms', 'the_breach', 'mend_the_walls'] })
    expect(getStoryEntries(s).map((e) => e.id)).toEqual(['first_renown', 'call_to_arms', 'the_breach'])
  })

  it('is empty on a fresh game', () => {
    expect(getStoryEntries(make({}))).toEqual([])
  })

  it('has a card for each system that is on, and none for systems that are off', () => {
    const cards = getHowItWorks(make({ beatsSeen: ['prologue', 'first_renown', 'call_to_arms'] })).map((c) => c.system)
    expect(cards).toEqual(['slay', 'rally'])
  })

  it('keeps each card to one or two short sentences', () => {
    const all = getHowItWorks(make({ beatsSeen: [
      'prologue', 'first_renown', 'call_to_arms', 'the_breach', 'mend_the_walls', 'empty_stores', 'strangers_at_gate',
      'a_city_to_build', 'word_spreads', 'lean_times', 'beyond_the_walls', 'the_keep', 'the_horde_grows',
    ] }))
    expect(all.length).toBe(14)
    for (const c of all) expect((c.text.match(/\./g) ?? []).length).toBeLessThanOrEqual(2)
  })

  it('unlocks the Lore tab only after Lirae arrives', () => {
    expect(isLoreUnlocked(make({ beatsSeen: ['the_keep'] }))).toBe(false)
    expect(isLoreUnlocked(make({ beatsSeen: ['the_keep', 'the_scholar'] }))).toBe(true)
    expect(getLoreLines().length).toBeGreaterThan(0)
  })
})
