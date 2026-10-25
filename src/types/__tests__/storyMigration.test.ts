import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { backfillStory } from '../storyMigration'
import { isSystemOn, isBuildingRevealed } from '../systems'

const v1 = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, saveMigrationVersion: 1, ...over })

describe('backfillStory', () => {
  it('marks only the prologue for an untouched save', () => {
    const out = backfillStory(v1({}))
    expect(out.beatsSeen).toEqual(['prologue'])
    expect(out.playSeconds).toBe(0)
    expect(out.lastBeatAtPlaySec).toBe(0)
  })

  it('backfills through a_city_to_build for 3 fighters, 3 repairers, 3 gatherers and no buildings', () => {
    const out = backfillStory(v1({
      fighters: 3, fightersRallied: 3,
      repairers: 3, repairersDirected: 3,
      foragers: { gatherers: 3, trappers: 0, rangers: 0 },
      foragersTrained: { gatherers: 3, trappers: 0, rangers: 0 },
      inspiration: 0.2,
      totalInspirationEarned: 10,
    }))
    expect(out.beatsSeen).toEqual([
      'prologue', 'call_to_arms', 'the_breach', 'mend_the_walls', 'empty_stores', 'strangers_at_gate', 'a_city_to_build',
    ])
    expect(isSystemOn(out, 'draconiaTab')).toBe(true)
    expect(isSystemOn(out, 'hunger')).toBe(true)
    expect(isSystemOn(out, 'milestones')).toBe(false)
    expect(isBuildingRevealed(out, 'forge')).toBe(false)
  })

  it('adds word_spreads when lifetime inspiration is at least 25', () => {
    const out = backfillStory(v1({
      fighters: 3, fightersRallied: 3, repairers: 3, repairersDirected: 3,
      foragers: { gatherers: 3, trappers: 0, rangers: 0 },
      totalInspirationEarned: 25,
    }))
    expect(out.beatsSeen).toContain('word_spreads')
    expect(isSystemOn(out, 'milestones')).toBe(true)
  })

  it('adds word_spreads when a milestone was already offered', () => {
    const out = backfillStory(v1({ milestonesOffered: [25] }))
    expect(out.beatsSeen).toContain('word_spreads')
  })

  it('stops at the first beat that fails both tests', () => {
    // Gatherers without any fighters: call_to_arms trigger fails (no inspiration), and later evidence proves it
    const out = backfillStory(v1({ foragers: { gatherers: 3, trappers: 0, rangers: 0 } }))
    expect(out.beatsSeen).toContain('empty_stores')
    // The Forge was never built, so the walk stops before the_keep_stands
    expect(out.beatsSeen).not.toContain('the_smith')
  })

  it('backfills everything up to the Librarium for a late save', () => {
    const out = backfillStory(v1({
      fightersRallied: 5, fighters: 5, repairersDirected: 4, repairers: 4,
      barracksLevel: 2, armoryBuilt: true, draconiaHallBuilt: true, postLevel: 1,
      librariumBuilt: true, completedResearch: ['click_1'], milestonesOffered: [25, 50],
      foragers: { gatherers: 3, trappers: 0, rangers: 0 },
      foodSystemActive: true, hpUnlocked: true, explorerIntroShown: true,
      totalInspirationEarned: 500,
    }))
    for (const id of [
      'prologue', 'call_to_arms', 'the_breach', 'mend_the_walls', 'empty_stores', 'strangers_at_gate',
      'a_city_to_build', 'the_smith', 'the_keep_stands', 'word_spreads', 'beyond_the_walls', 'the_keep',
      'the_scholar', 'the_horde_grows', 'lean_times',
    ]) {
      expect(out.beatsSeen).toContain(id)
    }
    expect(isSystemOn(out, 'offline')).toBe(true)
    expect(isBuildingRevealed(out, 'librarium')).toBe(true)
    expect(isSystemOn(out, 'threatUnfloored')).toBe(true)
  })

  it('does not mutate the input or leave duplicate beats', () => {
    const input = v1({ fighters: 2, fightersRallied: 2 })
    const out = backfillStory(input)
    expect(input.beatsSeen).toEqual([])
    expect(new Set(out.beatsSeen).size).toBe(out.beatsSeen.length)
  })
})
