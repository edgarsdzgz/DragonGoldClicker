import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { strike, waveView, spawnMonster } from '../monsters'
import { progressWave, waveFromKills, waveBonus, WAVE_SIZE, WAVE_BANNER_MS } from '../waves'
import { getFighterCost } from '../fighters'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

/** Tap until `kills` monsters are dead; returns the state and the list of strikes that killed */
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

describe('wave progress', () => {
  it('counts kills into the wave and clears it on the fifth', () => {
    expect(progressWave({ waveNumber: 1, waveKills: 3 }, 0.25)).toMatchObject({ waveKills: 4, cleared: false, bonus: 0 })
    expect(progressWave({ waveNumber: 1, waveKills: 4 }, 0.25)).toEqual({ waveNumber: 2, waveKills: 0, cleared: true, bonus: 0.5 })
  })

  it('pays twice the wave bounty', () => {
    expect(waveBonus(0.25)).toBe(0.5)
    expect(waveBonus(0.4)).toBe(0.8)
    expect(waveBonus(1)).toBe(2)
  })

  it('resumes mid-wave from a kill count', () => {
    expect(waveFromKills(0)).toEqual({ waveNumber: 1, waveKills: 0 })
    expect(waveFromKills(7)).toEqual({ waveNumber: 2, waveKills: 2 })
    expect(waveFromKills(50)).toEqual({ waveNumber: 11, waveKills: 0 })
  })

  it('has a 1.5 second banner', () => {
    expect(WAVE_BANNER_MS).toBe(1500)
    expect(WAVE_SIZE).toBe(5)
  })
})

describe('waves in play', () => {
  it('the first Rally is affordable at kill 4, still 20 taps', () => {
    const { state, kills } = killN(make({}), 4)
    expect(state.inspiration).toBeGreaterThanOrEqual(getFighterCost(0))
    expect(kills.every((k) => !k.waveCleared)).toBe(true)
    const taps = state.totalClicks
    expect(taps).toBe(20)
  })

  it('the wave bonus arrives at kill 5, on top of the bounty', () => {
    const { state, kills } = killN(make({}), 5)
    const fifth = kills[4]
    expect(fifth.waveCleared).toBe(true)
    expect(fifth.waveBonus).toBe(0.5)
    expect(state.inspiration).toBe(1.25 + 0.5)
    expect(state.waveNumber).toBe(2)
    expect(state.waveKills).toBe(0)
  })

  it('wave types follow the kill thresholds: 1-2 kobold, 3-5 goblin, 6-10 crawler, 11+ orc', () => {
    const nameAtWave = (wave: number) => {
      const kills = (wave - 1) * WAVE_SIZE
      return waveView({ ...spawnMonster(make({ monstersDefeated: kills })) }).leftText
    }
    expect(nameAtWave(1)).toBe('5 kobolds left')
    expect(nameAtWave(2)).toBe('5 kobolds left')
    expect(nameAtWave(3)).toBe('5 goblins left')
    expect(nameAtWave(5)).toBe('5 goblins left')
    expect(nameAtWave(6)).toBe('5 shadow crawlers left')
    expect(nameAtWave(10)).toBe('5 shadow crawlers left')
    expect(nameAtWave(11)).toBe('5 orcs left')
  })

  it('a wave is never split across two monster types', () => {
    let s = make({})
    for (let i = 0; i < 60; i++) {
      const before = s.monsterIndex
      const { state, kills } = killN(s, 1)
      if (!kills[0].waveCleared) expect(state.monsterIndex).toBe(before)
      s = state
    }
  })

  it('the wave row reads "K <plural> left" and the queue is at most four dim silhouettes', () => {
    const fresh = waveView(make({}))
    expect(fresh).toMatchObject({ waveNumber: 1, left: 5, leftText: '5 kobolds left' })
    expect(fresh.queue).toHaveLength(4)
    const last = waveView(make({ waveKills: 4 }))
    expect(last.leftText).toBe('1 kobold left')
    expect(last.queue).toHaveLength(0)
    expect(waveView(make({ waveKills: 3 })).queue).toHaveLength(1)
  })

  it('a save resumes mid-wave', () => {
    const s = spawnMonster(make({ monstersDefeated: 12 }))
    expect(s.waveNumber).toBe(3)
    expect(s.waveKills).toBe(2)
    expect(waveView(s).leftText).toBe('3 goblins left')
  })
})
