import { DEFAULT_GAME_STATE } from '../state'
import { setStoryPauseForTests } from '../story'
import type { GameState } from '../state'
import { backfillStory } from '../storyMigration'
import { isSystemOn, isBuildingRevealed } from '../systems'

const v1 = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, saveMigrationVersion: 1, ...over })

// These suites exercise the whole story, so lift the pause for them
beforeAll(() => setStoryPauseForTests('the_horde_grows'))
afterAll(() => setStoryPauseForTests())

describe('backfillStory', () => {
  it('marks nothing for an untouched save, so it plays the opening like a fresh install', () => {
    const out = backfillStory(v1({}))
    expect(out.beatsSeen).toEqual([])
    expect(out.playSeconds).toBe(0)
    expect(out.lastBeatAtPlaySec).toBe(0)
  })

  it('backfills through a_city_to_build for 3 fighters, 3 repairers, 3 gatherers, 3 newcomers taken in and no buildings', () => {
    const out = backfillStory(v1({
      fighters: 3, fightersRallied: 3,
      repairers: 3, repairersDirected: 3,
      foragers: { gatherers: 3, trappers: 0, rangers: 0 },
      foragersTrained: { gatherers: 3, trappers: 0, rangers: 0 },
      inspiration: 0.2,
      totalInspirationEarned: 10,
      wanderersWelcomed: 3,
    }))
    expect(out.beatsSeen).toEqual([
      'prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'empty_stores', 'the_breach', 'mend_the_walls', 'the_wall_is_yours', 'sharpen_claws', 'strangers_at_gate', 'a_city_to_build',
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
      'prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach', 'mend_the_walls', 'empty_stores', 'strangers_at_gate',
      'a_city_to_build', 'the_smith', 'the_keep_stands', 'word_spreads', 'beyond_the_walls', 'the_keep',
      'the_scholar', 'the_horde_grows', 'lean_times',
    ]) {
      expect(out.beatsSeen).toContain(id)
    }
    expect(isSystemOn(out, 'offline')).toBe(true)
    expect(isBuildingRevealed(out, 'librarium')).toBe(true)
    expect(isSystemOn(out, 'threatUnfloored')).toBe(true)
  })

  it('keeps the Lodge revealed for a save that built it without a Forge', () => {
    const out = backfillStory(v1({ barracksLevel: 1, lodgeLevel: 1, foodSystemActive: true, fighters: 2, fightersRallied: 2, repairers: 3, repairersDirected: 3 }))
    expect(isBuildingRevealed(out, 'lodge')).toBe(true)
  })

  it('reveals the Lodge for a save with the food system active but no Forge', () => {
    const out = backfillStory(v1({ barracksLevel: 1, foodSystemActive: true, fighters: 2, fightersRallied: 2, repairers: 3, repairersDirected: 3 }))
    expect(isBuildingRevealed(out, 'lodge')).toBe(true)
    expect(isBuildingRevealed(out, 'keep')).toBe(true)
  })

  it('backfills beyond_the_walls on its own evidence', () => {
    expect(backfillStory(v1({ postLevel: 1 })).beatsSeen).toContain('beyond_the_walls')
    expect(backfillStory(v1({})).beatsSeen).not.toContain('beyond_the_walls')
  })

  it('does not mutate the input or leave duplicate beats', () => {
    const input = v1({ fighters: 2, fightersRallied: 2 })
    const out = backfillStory(input)
    expect(input.beatsSeen).toEqual([])
    expect(new Set(out.beatsSeen).size).toBe(out.beatsSeen.length)
  })
})

describe('first_renown backfill', () => {
  it('is marked seen for any save that has slain a monster', () => {
    expect(backfillStory(v1({ monstersDefeated: 3 })).beatsSeen).toEqual(['prologue', 'elder_approaches', 'first_renown'])
    expect(backfillStory(v1({})).beatsSeen).toEqual([])
  })

  it('is marked seen for a save further along, before call_to_arms', () => {
    const seen = backfillStory(v1({ fightersRallied: 1, fighters: 1 })).beatsSeen
    expect(seen.slice(0, 4)).toEqual(['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'])
  })
})

describe('call_to_arms backfill', () => {
  it('is seen for a save that has rallied', () => {
    expect(backfillStory(v1({ fightersRallied: 1, fighters: 1 })).beatsSeen).toContain('call_to_arms')
  })

  it('is seen for a save with 4 kills or more (Defend the Wall), whatever its old wave fields say', () => {
    const seen = (over: Partial<GameState>) => backfillStory(v1(over)).beatsSeen
    expect(seen({ monstersDefeated: 4 })).toContain('call_to_arms')
    expect(seen({ monstersDefeated: 13, waveNumber: 3, waveActive: true })).toContain('call_to_arms')
    expect(seen({ monstersDefeated: 3 })).not.toContain('call_to_arms')
  })
})
