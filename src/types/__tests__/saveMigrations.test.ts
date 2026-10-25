import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { migrateSave, LATEST_SAVE_VERSION } from '../saveMigrations'
import { catchUpBeats } from '../storyMigration'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('migrateSave', () => {
  it('always ends at the latest version', () => {
    for (const from of [0, 1, 2, 3, 4, 5, 6, 7]) {
      expect(migrateSave(make({ saveMigrationVersion: from }), from).saveMigrationVersion).toBe(LATEST_SAVE_VERSION)
    }
    expect(LATEST_SAVE_VERSION).toBe(DEFAULT_GAME_STATE.saveMigrationVersion)
  })

  it('a v7 save loads as v7 and no numbered migration re-runs', () => {
    const save = make({
      saveMigrationVersion: 7,
      beatsSeen: ['prologue'],
      tutorialStepsDone: ['custom_step'],
      scriptedDone: [],
      waveNumber: 4,
      waveKills: 2,
      waveActive: true,
      monstersDefeated: 22,
      monsterIndex: 1,
      monsterHp: 3,
      playSeconds: 500,
    })
    const out = migrateSave(save, 7)
    expect(out.saveMigrationVersion).toBe(7)
    // v2 backfill would have rewritten beatsSeen and reset playSeconds; v3 the tutorial; v5/v7 the wave
    expect(out.playSeconds).toBe(500)
    expect(out.tutorialStepsDone).toEqual(['custom_step'])
    expect(out.waveNumber).toBe(4)
    expect(out.waveKills).toBe(2)
    expect(out.monsterHp).toBe(3)
    expect(out.waveActive).toBe(true)
    // Loading twice changes nothing
    expect(migrateSave(out, 7)).toEqual(out)
  })

  it('a v6 save moves to v7 exactly once', () => {
    const out = migrateSave(make({ saveMigrationVersion: 6, waveNumber: 1, monstersDefeated: 0, waveActive: false }), 6)
    expect(out.saveMigrationVersion).toBe(7)
    expect(out.waveNumber).toBe(0)
    expect(migrateSave(out, 7).waveNumber).toBe(0)
  })
})

describe('catchUpBeats', () => {
  it('marks first_renown seen for a far-along save without playing a scene for it', () => {
    const save = make({ beatsSeen: ['prologue', 'call_to_arms', 'the_breach'], monstersDefeated: 30, fighters: 3 })
    const out = catchUpBeats(save)
    expect(out.beatsSeen).toEqual(['prologue', 'first_renown', 'call_to_arms', 'the_breach'])
  })

  it('leaves a save alone when the missing beat does not hold yet', () => {
    const save = make({ beatsSeen: ['prologue', 'call_to_arms'], monstersDefeated: 0 })
    // first_renown trigger (a kill) is false and so is its evidence
    expect(catchUpBeats(save).beatsSeen).toEqual(['prologue', 'call_to_arms'])
  })

  it('does nothing for a save at the start or fully caught up', () => {
    const fresh = make({})
    expect(catchUpBeats(fresh)).toBe(fresh)
    const done = make({ beatsSeen: ['prologue', 'first_renown'], monstersDefeated: 3 })
    expect(catchUpBeats(done)).toBe(done)
  })

  it('migrateSave applies it to a v6 save that predates first_renown', () => {
    const save = make({
      saveMigrationVersion: 6, beatsSeen: ['prologue', 'call_to_arms'], monstersDefeated: 12,
      fightersRallied: 2, fighters: 2, waveNumber: 3, waveKills: 2, waveActive: true,
    })
    const out = migrateSave(save, 6)
    expect(out.beatsSeen).toEqual(['prologue', 'first_renown', 'call_to_arms'])
  })
})
