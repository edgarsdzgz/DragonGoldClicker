import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { STORY_PAUSED_AFTER, isBeatPaused, STORY_BEATS } from '../story'
import { findNextBeat } from '../storyDirector'
import { backfillStory } from '../storyMigration'
import { isSystemOn } from '../systems'
import { getActiveStep } from '../tutorial'
import { getCurrentObjective } from '../objectives'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('story pause', () => {
  it('pauses everything after the_wall_is_yours (the wall, layer 6) and nothing up to it', () => {
    expect(STORY_PAUSED_AFTER).toBe('the_wall_is_yours')
    expect(isBeatPaused('prologue')).toBe(false)
    expect(isBeatPaused('call_to_arms')).toBe(false)
    expect(isBeatPaused('empty_stores')).toBe(false)
    expect(isBeatPaused('the_breach')).toBe(false)
    expect(isBeatPaused('mend_the_walls')).toBe(false)
    expect(isBeatPaused('the_wall_is_yours')).toBe(false)
    for (const b of STORY_BEATS.slice(8)) expect(isBeatPaused(b.id)).toBe(true)
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

  it('backfill still covers the whole table: the pause only limits the director', () => {
    const out = backfillStory(make({
      saveMigrationVersion: 1, fighters: 5, fightersRallied: 5, repairers: 3, repairersDirected: 3,
      barracksLevel: 2, armoryBuilt: true, draconiaHallBuilt: true, totalInspirationEarned: 500,
      milestonesOffered: [25], foodSystemActive: true,
    }))
    expect(out.beatsSeen).toEqual(expect.arrayContaining(['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach', 'empty_stores', 'the_keep']))
    expect(findNextBeat({ ...out, playSeconds: 99999 }, 'live')).toBeNull()
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
