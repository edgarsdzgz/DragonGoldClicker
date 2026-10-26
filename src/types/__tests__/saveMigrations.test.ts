import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { migrateSave, LATEST_SAVE_VERSION } from '../saveMigrations'
import { catchUpBeats } from '../storyMigration'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('migrateSave', () => {
  it('always ends at the latest version', () => {
    for (const from of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      expect(migrateSave(make({ saveMigrationVersion: from }), from).saveMigrationVersion).toBe(LATEST_SAVE_VERSION)
    }
    expect(LATEST_SAVE_VERSION).toBe(DEFAULT_GAME_STATE.saveMigrationVersion)
  })

  it('a v9 save loads as v9 and no numbered migration re-runs', () => {
    const save = make({
      saveMigrationVersion: 9,
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
    const out = migrateSave(save, 9)
    expect(out.saveMigrationVersion).toBe(9)
    // v2 backfill would have rewritten beatsSeen and reset playSeconds; v3 the tutorial; v5/v7 the wave
    expect(out.playSeconds).toBe(500)
    expect(out.tutorialStepsDone).toEqual(['custom_step'])
    expect(out.waveNumber).toBe(4)
    expect(out.waveKills).toBe(2)
    expect(out.monsterHp).toBe(3)
    expect(out.waveActive).toBe(true)
    // Loading twice changes nothing
    expect(migrateSave(out, 9)).toEqual(out)
  })

  it('a v6 save moves to v9 exactly once', () => {
    const out = migrateSave(make({ saveMigrationVersion: 6, waveNumber: 1, monstersDefeated: 0, waveActive: false }), 6)
    expect(out.saveMigrationVersion).toBe(9)
    expect(out.waveNumber).toBe(0)
    expect(migrateSave(out, 9).waveNumber).toBe(0)
  })

  it('v8 (waves put away): a save keeps the monster it faces and its damage, wave fields untouched', () => {
    // Mid-wave 4 (goblins), 22 kills: goblins by kills too
    const mid = migrateSave(make({ saveMigrationVersion: 7, waveNumber: 4, waveKills: 2, waveActive: true, monstersDefeated: 22, monsterIndex: 1, monsterHp: 3 }), 7)
    expect(mid).toMatchObject({ monsterIndex: 1, monsterHp: 3, waveNumber: 4, waveKills: 2, saveMigrationVersion: 9 })
    // In the Wave 3 camp (13 kills): the goblin waiting there stays
    const camp = migrateSave(make({ saveMigrationVersion: 7, waveNumber: 3, waveActive: false, monstersDefeated: 13, monsterIndex: 1, monsterHp: 8 }), 7)
    expect(camp).toMatchObject({ monsterIndex: 1, monsterHp: 8 })
    // A type that disagrees with the kills starts on a fresh monster of the right type
    const odd = migrateSave(make({ saveMigrationVersion: 7, monstersDefeated: 30, monsterIndex: 1, monsterHp: 2 }), 7)
    expect(odd).toMatchObject({ monsterIndex: 2, monsterHp: 12 })
  })

  it('v8 never changes the monster type of a save made by playing waves', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { monsterIndexForWave, waveSize } = require('../../modes/waves/waves')
    let kills = 0
    for (let wave = 0; wave <= 20; wave++) {
      for (let k = 0; k < waveSize(wave); k++) {
        const s = make({ saveMigrationVersion: 7, waveNumber: wave, waveKills: k, waveActive: true, monstersDefeated: kills, monsterIndex: monsterIndexForWave(wave), monsterHp: 1 })
        expect(migrateSave(s, 7).monsterIndex).toBe(monsterIndexForWave(wave))
        kills++
      }
    }
  })
})

describe('catchUpBeats', () => {
  it('marks first_renown seen for a far-along save without playing a scene for it', () => {
    const save = make({ beatsSeen: ['prologue', 'call_to_arms', 'the_breach'], monstersDefeated: 30, fighters: 3 })
    const out = catchUpBeats(save)
    expect(out.beatsSeen).toEqual(['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'the_breach'])
  })

  it('leaves a save alone when the missing beat does not hold yet', () => {
    const save = make({ beatsSeen: ['prologue', 'call_to_arms'], monstersDefeated: 0 })
    // first_renown trigger (a kill) is false and so is its evidence; elder_approaches holds (prologue is seen)
    expect(catchUpBeats(save).beatsSeen).toEqual(['prologue', 'elder_approaches', 'call_to_arms'])
  })

  it('does nothing for a save at the start or fully caught up', () => {
    const fresh = make({})
    expect(catchUpBeats(fresh)).toBe(fresh)
    const done = make({ beatsSeen: ['prologue', 'elder_approaches', 'first_renown'], monstersDefeated: 3 })
    expect(catchUpBeats(done)).toBe(done)
  })

  it('migrateSave applies it to a v6 save that predates first_renown', () => {
    const save = make({
      saveMigrationVersion: 6, beatsSeen: ['prologue', 'call_to_arms'], monstersDefeated: 12,
      fightersRallied: 2, fighters: 2, waveNumber: 3, waveKills: 2, waveActive: true,
    })
    const out = migrateSave(save, 6)
    expect(out.beatsSeen).toEqual(['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'])
  })
})

describe('the opening is never replayed for a save that has played', () => {
  const opening = ['prologue', 'elder_approaches']

  it('a save that has fought gets both opening beats marked, in order, with no scenes', () => {
    const fought = make({ beatsSeen: [], monstersDefeated: 4 })
    expect(catchUpBeats(fought).beatsSeen).toEqual(expect.arrayContaining(opening))
    expect(catchUpBeats(fought).beatsSeen.slice(0, 2)).toEqual(opening)
    const mid = make({ beatsSeen: ['prologue', 'first_renown'], waveActive: true })
    expect(catchUpBeats(mid).beatsSeen).toEqual(['prologue', 'elder_approaches', 'first_renown'])
  })

  it('a save that saw the prologue and anything after it gets elder_approaches silently', () => {
    const out = catchUpBeats(make({ beatsSeen: ['prologue', 'first_renown', 'call_to_arms'] }))
    expect(out.beatsSeen).toEqual(['prologue', 'elder_approaches', 'first_renown', 'call_to_arms'])
  })

  it('a pre-story save that has played skips the opening; an untouched one plays it', () => {
    expect(migrateSave(make({ saveMigrationVersion: 1, totalClicks: 30, monstersDefeated: 6 }), 1).beatsSeen.slice(0, 2)).toEqual(opening)
    expect(migrateSave(make({ saveMigrationVersion: 1 }), 1).beatsSeen).toEqual([])
  })

  it('only a truly fresh save, or a mid-opening one, plays it', () => {
    expect(migrateSave(make({ saveMigrationVersion: 7 }), 7).beatsSeen).toEqual([])
    // Closed between the two scenes: the elder still has her scene to come
    expect(migrateSave(make({ saveMigrationVersion: 7, beatsSeen: ['prologue'] }), 7).beatsSeen).toEqual(['prologue'])
  })

  it('v9 rebuilds kills per monster from the old fixed rule', () => {
    const out = migrateSave(make({ saveMigrationVersion: 8, monstersDefeated: 30 }), 8)
    expect(out.killsByMonster).toEqual({ kobold: 13, goblin: 15, shadow_crawler: 2 })
    expect(migrateSave(make({ saveMigrationVersion: 8, monstersDefeated: 0 }), 8).killsByMonster).toEqual({})
    // A v9 save keeps its own counts
    const kept = migrateSave(make({ saveMigrationVersion: 9, monstersDefeated: 30, killsByMonster: { kobold: 20, goblin: 10 } }), 9)
    expect(kept.killsByMonster).toEqual({ kobold: 20, goblin: 10 })
  })
})
