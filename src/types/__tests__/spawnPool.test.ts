import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { MONSTERS, strike } from '../monsters'
import { spawnOdds, spawnWeights, pickNextMonster, SPAWN_ANCHORS } from '../spawnPool'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })
const idx = (id: string) => MONSTERS.findIndex((m) => m.id === id)
/** Every type met at least once, so no debut is pending */
const MET_ALL = Object.fromEntries(MONSTERS.map((m) => [m.id, 1]))
/** The monsters the pool can send (not the raider) */
const POOL = MONSTERS.filter((m) => Number.isFinite(m.fromKills))

describe('the spawn pool odds', () => {
  it('is all kobolds at first', () => {
    for (const k of [0, 5, 12]) expect(spawnOdds(k)).toEqual(MONSTERS.map((m) => (m.id === 'kobold' ? 1 : 0)))
  })

  it('no monster has a chance before its debut', () => {
    for (let k = 0; k < 200; k++) {
      const w = spawnWeights(k)
      MONSTERS.forEach((m, j) => {
        if (k < m.fromKills) expect(w[j]).toBe(0)
      })
    }
  })

  it('goblins arrive as a chance, not a switch: kobold OR goblin after 13 kills', () => {
    const [kobold, goblin] = spawnOdds(13)
    expect(kobold).toBeCloseTo(0.85, 5)
    expect(goblin).toBeCloseTo(0.15, 5)
  })

  it('blends smoothly: the goblin share grows a little with every kill until crawlers arrive', () => {
    let last = 0
    for (let k = 13; k < 28; k++) {
      const goblin = spawnOdds(k)[idx('goblin')]
      expect(goblin).toBeGreaterThan(last)
      expect(goblin - last).toBeLessThan(0.16)
      last = goblin
    }
  })

  it('phases kobolds out once orcs arrive, and holds the last odds after that', () => {
    expect(spawnOdds(53)[idx('kobold')]).toBe(0)
    expect(spawnOdds(53)[idx('orc')]).toBeGreaterThan(0)
    expect(spawnOdds(500)).toEqual(spawnOdds(SPAWN_ANCHORS[SPAWN_ANCHORS.length - 1].kills))
  })

  it('the odds always add up to one', () => {
    for (let k = 0; k < 150; k += 7) {
      expect(spawnOdds(k).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9)
    }
  })
})

describe('picking the next monster', () => {
  it('follows the roll: a low roll is a kobold, a high roll a goblin, at 13 kills', () => {
    const s = { hordeKills: 13, killsByMonster: { kobold: 13, goblin: 1 } }
    expect(pickNextMonster(s, 0)).toBe(idx('kobold'))
    expect(pickNextMonster(s, 0.84)).toBe(idx('kobold'))
    expect(pickNextMonster(s, 0.86)).toBe(idx('goblin'))
    expect(pickNextMonster(s, 0.9999)).toBe(idx('goblin'))
  })

  it('guarantees a debut: the first monster after a threshold is the new type, whatever the roll', () => {
    expect(pickNextMonster({ hordeKills: 13, killsByMonster: { kobold: 13 } }, 0)).toBe(idx('goblin'))
    expect(pickNextMonster({ hordeKills: 28, killsByMonster: { kobold: 20, goblin: 8, giant_rat: 3 } }, 0)).toBe(idx('shadow_crawler'))
    expect(pickNextMonster({ hordeKills: 53, killsByMonster: { kobold: 20, goblin: 20, giant_rat: 5, shadow_crawler: 8, goblin_scout: 5, war_hound: 2 } }, 0)).toBe(idx('orc'))
  })

  it('every pool monster debuts in order: at its kills, with the earlier ones met, it comes next', () => {
    POOL.forEach((m, i) => {
      const met = Object.fromEntries(POOL.slice(0, i).map((e) => [e.id, 1]))
      for (const r of [0, 0.5, 0.9999]) expect(pickNextMonster({ hordeKills: m.fromKills, killsByMonster: met }, r)).toBe(idx(m.id))
    })
  })

  it('every pool monster has a chance at some point, and never more than six share the pool', () => {
    const seen = new Set<string>()
    for (let k = 0; k <= 400; k++) {
      const live = spawnWeights(k).filter((w) => w > 0).length
      expect(live).toBeLessThanOrEqual(6)
      spawnWeights(k).forEach((w, j) => { if (w > 0) seen.add(MONSTERS[j].id) })
    }
    expect([...seen].sort()).toEqual(POOL.map((m) => m.id).sort())
  })

  it('the anchors only name roster monsters', () => {
    const ids = new Set(MONSTERS.map((m) => m.id))
    for (const a of SPAWN_ANCHORS) for (const id of Object.keys(a.weights)) expect(ids.has(id)).toBe(true)
  })

  it('a phased-out monster never gets a debut', () => {
    expect(pickNextMonster({ hordeKills: 60, killsByMonster: { goblin: 30, shadow_crawler: 20, orc: 10 } }, 0)).not.toBe(idx('kobold'))
  })

  it("reads the horde's advance, not lifetime kills: a pushed-back horde sends weaker monsters", () => {
    const met = { kobold: 40, goblin: 30, shadow_crawler: 20, orc: 10 }
    // 100 kills would be 40% orcs; pushed back to 5, it is kobolds only
    const pushedBack = { hordeKills: 5, monstersDefeated: 100, killsByMonster: met }
    for (const r of [0, 0.5, 0.9999]) expect(pickNextMonster(pushedBack, r)).toBe(idx('kobold'))
  })

  it('matches the odds over many rolls', () => {
    const s = { hordeKills: 40, killsByMonster: MET_ALL }
    const counts = MONSTERS.map(() => 0)
    const N = 10000
    for (let i = 0; i < N; i++) counts[pickNextMonster(s, (i + 0.5) / N)]++
    spawnOdds(40).forEach((p, j) => expect(counts[j] / N).toBeCloseTo(p, 2))
  })
})

describe('kills feed the pool', () => {
  it('a kill counts per monster, and the 13th kobold brings the first goblin', () => {
    const r = strike(make({ hordeKills: 12, killsByMonster: { kobold: 12 }, monsterHp: 1 }), 1, 0)
    expect(r.state.killsByMonster).toEqual({ kobold: 13 })
    expect(r.state.monsterIndex).toBe(idx('goblin'))
    expect(r.state.monsterHp).toBe(MONSTERS[idx('goblin')].hp)
  })

  it('after the goblin debut the next monster is a roll again', () => {
    const met = make({ hordeKills: 14, killsByMonster: { kobold: 13, goblin: 1 }, monsterIndex: idx('goblin'), monsterHp: 1 })
    expect(strike(met, 1, 0).state.monsterIndex).toBe(idx('kobold'))
    expect(strike(met, 1, 0.99).state.monsterIndex).toBe(idx('goblin'))
  })
})
