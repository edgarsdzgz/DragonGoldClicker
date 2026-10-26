import { DEFAULT_GAME_STATE } from '../../../types/state'
import type { GameState } from '../../../types/state'
import { MONSTERS } from '../../../types/monsters'
import { waveStrike as strike, waveView, beginWave, endWave, campView } from '../waveStrike'
import {
  progressWave, waveActiveOnLoad, waveBonus, waveSize, monsterIndexForWave,
  WAVE_SIZE, OPENING_WAVE_SIZE, WAVE_BANNER_MS,
} from '../waves'
import { migrateToV4, migrateToV5, migrateToV7 } from '../../../types/waveMigration'
import { getFighterCost } from '../../../types/fighters'

// Cold storage (2026-10-26): the wave mode's rules, kept tested until the mode returns.
// Most tests fight, so they start with the wave already begun
const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, waveActive: true, ...over })

/** Tap until `n` monsters are dead; returns the state and the strikes that killed */
function killN(s: GameState, n: number) {
  let state = s
  const kills: ReturnType<typeof strike>[] = []
  while (kills.length < n) {
    const r = strike(state)
    state = r.state
    if (r.killed) kills.push(r)
  }
  return { state, kills }
}

describe('wave sizes and tiers', () => {
  it('wave 0 is 3 kobolds and waves 1+ have 5', () => {
    expect(OPENING_WAVE_SIZE).toBe(3)
    expect(WAVE_SIZE).toBe(5)
    expect(waveSize(0)).toBe(3)
    expect(waveSize(1)).toBe(5)
    expect(waveSize(40)).toBe(5)
    expect(DEFAULT_GAME_STATE.waveNumber).toBe(0)
  })

  it('the type follows the wave number: 0-2 kobold, 3-5 goblin, 6-10 crawler, 11+ orc', () => {
    const names = (w: number) => MONSTERS[monsterIndexForWave(w)].name
    expect([0, 1, 2].map(names)).toEqual(['Kobold', 'Kobold', 'Kobold'])
    expect([3, 4, 5].map(names)).toEqual(['Goblin', 'Goblin', 'Goblin'])
    expect([6, 8, 10].map(names)).toEqual(Array(3).fill('Shadow Crawler'))
    expect([11, 12, 99].map(names)).toEqual(Array(3).fill('Orc'))
  })

  it('no wave mixes types, from wave 0 through 15', () => {
    let s = beginWave(make({ waveActive: false }))
    for (let wave = 0; wave <= 15; wave++) {
      const type = s.monsterIndex
      expect(type).toBe(monsterIndexForWave(wave))
      for (let k = 0; k < waveSize(wave); k++) {
        expect(s.monsterIndex).toBe(type)
        // Kill one monster
        for (;;) {
          const r = strike(s)
          s = r.state
          if (r.killed) break
        }
      }
      s = endWave(s)
      s = beginWave(s)
    }
  })
})

describe('wave progress', () => {
  it('counts kills into the wave and clears it on the last one (3 in wave 0, 5 after)', () => {
    expect(progressWave({ waveNumber: 0, waveKills: 1 }, 0.25)).toMatchObject({ waveKills: 2, cleared: false, bonus: 0 })
    expect(progressWave({ waveNumber: 0, waveKills: 2 }, 0.25)).toEqual({ waveNumber: 1, waveKills: 0, cleared: true, bonus: 0.5 })
    expect(progressWave({ waveNumber: 1, waveKills: 3 }, 0.25)).toMatchObject({ cleared: false })
    expect(progressWave({ waveNumber: 1, waveKills: 4 }, 0.25)).toMatchObject({ waveNumber: 2, cleared: true })
  })

  it('pays twice the wave bounty', () => {
    expect(waveBonus(0.25)).toBe(0.5)
    expect(waveBonus(0.4)).toBe(0.8)
    expect(waveBonus(1)).toBe(2)
  })

  it('has a 1.5 second banner', () => {
    expect(WAVE_BANNER_MS).toBe(1500)
  })
})

describe('the opening', () => {
  const camp = (over: Partial<GameState> = {}) => ({ ...DEFAULT_GAME_STATE, ...over })

  it('a new game starts in camp at wave 0 and strikes do nothing there', () => {
    const s = camp()
    expect(s.waveActive).toBe(false)
    const r = strike(s)
    expect(r.ignored).toBe(true)
    expect(r.state).toBe(s)
    expect(r.state.totalClicks).toBe(0)
  })

  it('wave 0 is 3 kobolds, pays 0.75 + 0.50, and call_to_arms is affordable right after', () => {
    const { state, kills } = killN(beginWave(camp()), 3)
    expect(kills[2].waveCleared).toBe(true)
    expect(kills[2].waveBonus).toBe(0.5)
    expect(kills.slice(0, 2).every((k) => !k.waveCleared)).toBe(true)
    expect(state.inspiration).toBe(1.25)
    expect(state.inspiration).toBeGreaterThanOrEqual(getFighterCost(0))
    expect(state.waveNumber).toBe(1)
    expect(state.totalClicks).toBe(15)
  })

  it('the first Rally is not affordable before wave 0 clears', () => {
    const { state } = killN(beginWave(camp()), 2)
    expect(state.inspiration).toBe(0.5)
  })

  it('back in camp after the banner, with the bonus paid once and no farming', () => {
    let { state } = killN(beginWave(camp()), 3)
    expect(state.waveActive).toBe(true)
    state = endWave(state)
    expect(state.waveActive).toBe(false)
    expect(strike(state).state.inspiration).toBe(1.25)
    expect(endWave(state)).toBe(state)
  })

  it('endWave leaves a wave that is still being fought alone', () => {
    const mid = beginWave(camp())
    expect(endWave(mid)).toBe(mid)
    expect(endWave(strike(mid).state).waveActive).toBe(true)
  })

  it('beginWave brings a full-HP monster of the wave type and is idempotent', () => {
    const s = beginWave(camp({ waveNumber: 3 }))
    expect(s.monsterIndex).toBe(1)
    expect(s.monsterHp).toBe(8)
    expect(beginWave(s)).toBe(s)
  })

  it('describes the camp for the next wave', () => {
    expect(campView({ waveNumber: 0, monsterIndex: 0 }).previewText).toBe('Wave 0: 3 kobolds')
    const v = campView({ waveNumber: 3, monsterIndex: 1 })
    expect(v.previewText).toBe('Wave 3: 5 goblins')
    expect(v.bonusText).toBe('+0.80 when cleared')
    expect(v.buttonLabel).toBe('Begin wave 3, 5 goblins')
    expect(campView({ waveNumber: 1, monsterIndex: 0 }).bonusText).toBe('+0.50 when cleared')
  })

  it('the wave row counts down 3 in wave 0 and shows a queue of at most four', () => {
    const fresh = waveView(make({}))
    expect(fresh).toMatchObject({ waveNumber: 0, left: 3, leftText: '3 kobolds left' })
    expect(fresh.queue).toHaveLength(2)
    expect(waveView(make({ waveNumber: 1 })).queue).toHaveLength(4)
    expect(waveView(make({ waveNumber: 1, waveKills: 4 })).leftText).toBe('1 kobold left')
  })
})

describe('save migrations', () => {
  const v6 = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, waveNumber: 1, ...over })

  it('v5 numbers waves from 1 in fives', () => {
    expect(migrateToV5(v6({ monstersDefeated: 7 }))).toMatchObject({ waveNumber: 2, waveKills: 2 })
    expect(migrateToV5(v6({ monstersDefeated: 0 }))).toMatchObject({ waveNumber: 1, waveKills: 0 })
    expect(migrateToV4(v6({ monstersDefeated: 300 })).monsterIndex).toBe(3)
  })

  it('v7 turns a save that never fought into wave 0', () => {
    const s = migrateToV7(v6({ waveActive: false, monstersDefeated: 0 }))
    expect(s.waveNumber).toBe(0)
    expect(s.monsterIndex).toBe(0)
  })

  it('v7 never drops a played save to an easier tier: every old wave keeps its monster type', () => {
    for (let kills = 1; kills < 400; kills++) {
      const old = migrateToV5(migrateToV4(v6({ monstersDefeated: kills })))
      const oldIndex = migrateToV4(v6({ monstersDefeated: kills })).monsterIndex
      const after = migrateToV7({ ...old, monsterIndex: oldIndex, waveActive: old.waveKills > 0 })
      expect(after.waveNumber).toBe(old.waveNumber)
      expect(after.monsterIndex).toBe(oldIndex)
    }
  })

  it('v7 keeps the HP of the monster on the field mid-wave', () => {
    const s = migrateToV7(v6({ waveActive: true, waveNumber: 4, waveKills: 2, monstersDefeated: 22, monsterIndex: 1, monsterHp: 3 }))
    expect(s.waveNumber).toBe(4)
    expect(s.monsterHp).toBe(3)
  })

  it('a save that was mid-wave resumes mid-wave (waveActive = waveKills > 0)', () => {
    const save = (kills: number) => ({ waveKills: kills % 5, monstersDefeated: kills, monsterHp: 5, monsterMaxHp: 5 })
    expect(waveActiveOnLoad(save(7), 5)).toBe(true)
    expect(waveActiveOnLoad(save(10), 5)).toBe(false)
    expect(waveActiveOnLoad({ ...save(7), waveActive: true }, 6)).toBe(true)
    expect(waveActiveOnLoad({ ...save(10), waveActive: true }, 6)).toBe(false)
    expect(waveActiveOnLoad({ ...save(0), waveActive: true }, 6)).toBe(true)
  })

  it('a wave that has begun keeps its first monster damage; the cleared-banner case still loads to camp', () => {
    const base = { waveKills: 0, monstersDefeated: 8, waveActive: true, monsterMaxHp: 5 }
    // Wave 2 begun, nothing killed yet in it, first monster hurt: mid-wave
    expect(waveActiveOnLoad({ ...base, monsterHp: 3 }, 7)).toBe(true)
    // Closed during the clear banner: kills made, new full-HP monster untouched: camp
    expect(waveActiveOnLoad({ ...base, monsterHp: 5 }, 7)).toBe(false)
    // An older save with a hurt monster and no kills in the wave also resumes mid-wave
    expect(waveActiveOnLoad({ ...base, waveActive: undefined, monsterHp: 2 }, 5)).toBe(true)
  })
})
