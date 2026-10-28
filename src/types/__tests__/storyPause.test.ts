import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { STORY_PAUSED_AFTER, isBeatPaused, STORY_BEATS } from '../story'
import { findNextBeat } from '../storyDirector'
import { isSystemOn } from '../systems'
import { getActiveStep } from '../tutorial'
import { getCurrentObjective } from '../objectives'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('story pause', () => {
  it('pauses everything after hollow_knight (chapter 13) and nothing up to it', () => {
    expect(STORY_PAUSED_AFTER).toBe('hollow_knight')
    expect(isBeatPaused('prologue')).toBe(false)
    expect(isBeatPaused('call_to_arms')).toBe(false)
    expect(isBeatPaused('empty_stores')).toBe(false)
    expect(isBeatPaused('the_breach')).toBe(false)
    expect(isBeatPaused('mend_the_walls')).toBe(false)
    expect(isBeatPaused('the_wall_is_yours')).toBe(false)
    expect(isBeatPaused('sharpen_claws')).toBe(false)
    expect(isBeatPaused('strangers_at_gate')).toBe(false)
    expect(isBeatPaused('a_city_to_build')).toBe(false)
    expect(isBeatPaused('the_smith')).toBe(false)
    expect(isBeatPaused('the_keep_stands')).toBe(false)
    expect(isBeatPaused('the_keep')).toBe(false)
    expect(isBeatPaused('the_lodge')).toBe(false)
    expect(isBeatPaused('the_scholar')).toBe(false)
    expect(isBeatPaused('the_horde_grows')).toBe(false)
    expect(isBeatPaused('beyond_the_walls')).toBe(false)
    expect(isBeatPaused('dragonsteel')).toBe(false)
    expect(isBeatPaused('small_wings')).toBe(false)
    expect(isBeatPaused('she_did_not_ask')).toBe(false)
    expect(isBeatPaused('the_exile')).toBe(false)
    expect(isBeatPaused('the_eldest')).toBe(false)
    expect(isBeatPaused('hollow_knight')).toBe(false)
    // Every beat in the story is live: the old side beats were retired (chapter 7)
    expect(STORY_BEATS[STORY_BEATS.length - 1].id).toBe('hollow_knight')
  })

  it('the director never offers a paused beat, main or side', () => {
    const s = make({
      beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'],
      fighters: 5, repairers: 5, totalInspirationEarned: 999, playSeconds: 99999,
    })
    expect(findNextBeat(s, 'live')).toBeNull()
    expect(findNextBeat(s, 'test')).toBeNull()
  })

  it('still fires the live beats', () => {
    expect(findNextBeat(make({}), 'live')?.id).toBe('prologue')
    expect(findNextBeat(make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown'], questsDone: ['defend_the_wall'], playSeconds: 99 }), 'live')?.id).toBe('call_to_arms')
  })

  it('systems, guided steps and objectives behind paused beats stay off', () => {
    const s = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'], tutorialStepsDone: ['begin_wave', 'tap_slay', 'tap_rally'], fighters: 2 })
    expect(isSystemOn(s, 'siege')).toBe(false)
    expect(isSystemOn(s, 'repair')).toBe(false)
    expect(isSystemOn(s, 'hunger')).toBe(false)
    expect(getActiveStep(s)).toBeNull()
    expect(getCurrentObjective(s)?.label).not.toMatch(/repairers|gatherers|Garrison/)
  })

  it('keeps progress a save already has behind the pause', () => {
    const s = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach', 'mend_the_walls'] })
    expect(isSystemOn(s, 'siege')).toBe(true)
    expect(isSystemOn(s, 'repair')).toBe(true)
  })
})
