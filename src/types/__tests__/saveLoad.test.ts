import { applyTimeAway, freshGame, parseSave } from '../saveLoad'
import { DEFAULT_GAME_STATE } from '../game'

const HOUR = 3600 * 1000

describe('reading a save', () => {
  it('a save that is not JSON throws, so it is never taken for a new game', () => {
    expect(() => parseSave('{not json')).toThrow()
  })

  it('a save missing newer fields gets them from the defaults', () => {
    const s = parseSave(JSON.stringify({ inspiration: 3, saveMigrationVersion: 1, lastSavedAt: 5 }))
    expect(s.inspiration).toBe(3)
    expect(s.lastSavedAt).toBe(5)
    expect(s.food).toBe(DEFAULT_GAME_STATE.food)
    expect(Array.isArray(s.beatsSeen)).toBe(true)
  })

  it('a new game starts now', () => {
    const s = freshGame(1234)
    expect(s.startedAt).toBe(1234)
    expect(s.lastSavedAt).toBe(1234)
  })
})

describe('counting the time away when the player starts', () => {
  const saved = { ...freshGame(0), lastSavedAt: 0 }

  it('stamps the save with the start time and leaves the stored copy alone', () => {
    const { state } = applyTimeAway(saved, 2 * HOUR)
    expect(state.lastSavedAt).toBe(2 * HOUR)
    expect(saved.lastSavedAt).toBe(0)
  })

  it('reports nothing for under a minute away, or before the Keep turns time away on', () => {
    expect(applyTimeAway(saved, 59 * 1000).offlineEarnings).toBeNull()
    expect(applyTimeAway(saved, 2 * HOUR).offlineEarnings).toBeNull()
  })

  it('once the Keep stands, the army earns renown for the time away (a minute or more)', () => {
    const keep = { ...saved, beatsSeen: ['call_to_arms', 'the_keep'], fighters: 5 }
    expect(applyTimeAway(keep, 59 * 1000).offlineEarnings).toBeNull()
    const { state, offlineEarnings } = applyTimeAway(keep, 2 * HOUR)
    expect(offlineEarnings?.inspiration).toBeGreaterThan(0)
    expect(state.inspiration).toBeCloseTo(keep.inspiration + (offlineEarnings?.inspiration ?? 0))
  })
})
