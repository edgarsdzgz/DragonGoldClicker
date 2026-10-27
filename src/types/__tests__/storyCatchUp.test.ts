import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { migrateSave, LATEST_SAVE_VERSION } from '../saveMigrations'
import { catchUpBeats } from '../storyCatchUp'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('migrateSave', () => {
  it('ends at the latest version, which a new game already has', () => {
    expect(migrateSave(make({})).saveMigrationVersion).toBe(LATEST_SAVE_VERSION)
    expect(LATEST_SAVE_VERSION).toBe(DEFAULT_GAME_STATE.saveMigrationVersion)
  })

  it('applies the story catch-up on load', () => {
    const save = make({ beatsSeen: ['prologue', 'call_to_arms'], monstersDefeated: 12, fightersRallied: 2, fighters: 2 })
    expect(migrateSave(save).beatsSeen).toEqual(['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'])
  })
})

describe('catchUpBeats', () => {
  it('marks a beat added behind the save seen, without playing a scene for it', () => {
    const save = make({ beatsSeen: ['prologue', 'call_to_arms', 'the_breach'], monstersDefeated: 30, fighters: 3 })
    const out = catchUpBeats(save)
    expect(out.beatsSeen).toEqual(['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach'])
  })

  it('leaves a beat alone when it does not hold yet', () => {
    const save = make({ beatsSeen: ['prologue', 'call_to_arms'], monstersDefeated: 0 })
    // first_renown's trigger (a kill) is false and so is its evidence; elder_approaches holds (prologue is seen)
    expect(catchUpBeats(save).beatsSeen).toEqual(['prologue', 'elder_approaches', 'call_to_arms'])
  })

  it('does nothing for a save at the start or fully caught up', () => {
    const fresh = make({})
    expect(catchUpBeats(fresh)).toBe(fresh)
    const done = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown'], monstersDefeated: 3 })
    expect(catchUpBeats(done)).toBe(done)
  })
})
