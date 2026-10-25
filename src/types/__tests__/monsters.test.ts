import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { monsterIndexForWave } from '../waves'
import { MONSTERS, spawnMonster, strike, monsterLabel, currentMonster } from '../monsters'
import { getFighterCost } from '../fighters'
import { ANNOUNCE_EVERY_MS } from '../../hooks/useKillEvents'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, waveActive: true, ...over })

describe('roster', () => {
  it('has the four monsters from the plan, in order of appearance', () => {
    expect(MONSTERS.map((m) => [m.name, m.hp, m.bounty, m.fromWave])).toEqual([
      ['Kobold', 5, 0.25, 0],
      ['Goblin', 8, 0.4, 3],
      ['Shadow Crawler', 12, 0.6, 6],
      ['Orc', 20, 1, 11],
    ])
  })

  it('uses real Ionicons glyph names', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const glyphs = require('@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json')
    for (const m of MONSTERS) expect(m.glyph in glyphs).toBe(true)
  })

  it('picks the tier from the wave number: 0-2 kobold, 3-5 goblin, 6-10 crawler, 11+ orc', () => {
    const tiers = [0, 1, 2, 3, 5, 6, 10, 11, 500].map(monsterIndexForWave)
    expect(tiers).toEqual([0, 0, 0, 1, 1, 2, 2, 3, 3])
  })
})

describe('strike', () => {
  it('deals tapDamage and counts the click without paying anything', () => {
    const r = strike(make({}))
    expect(r.killed).toBe(false)
    expect(r.state.monsterHp).toBe(4)
    expect(r.state.totalClicks).toBe(1)
    expect(r.state.inspiration).toBe(0)
    expect(r.state.monstersDefeated).toBe(0)
  })

  it('kills on the last hit: bounty paid, kill counted, next monster at full HP', () => {
    const r = strike(make({ monsterHp: 1, inspiration: 0.5 }))
    expect(r.killed).toBe(true)
    expect(r.bounty).toBe(0.25)
    expect(r.state.inspiration).toBe(0.75)
    expect(r.state.totalInspirationEarned).toBe(0.25)
    expect(r.state.monstersDefeated).toBe(1)
    expect(r.state.monsterHp).toBe(5)
  })

  it('moves to the next tier only when a wave is cleared', () => {
    // Last kobold of wave 2: the next wave (3) is goblins
    const clear = strike(make({ waveNumber: 2, waveKills: 4, monsterHp: 1 }))
    expect(clear.state.waveNumber).toBe(3)
    expect(clear.state.monsterIndex).toBe(1)
    expect(clear.state.monsterHp).toBe(8)
    expect(clear.monster.name).toBe('Kobold')
    // Mid-wave kills keep the type
    const mid = strike(make({ waveNumber: 3, waveKills: 1, monsterIndex: 1, monsterHp: 1 }))
    expect(mid.state.monsterIndex).toBe(1)
  })

  it('keeps the early pace: wave 0 is 15 taps and pays enough for the first Rally', () => {
    let s = make({})
    let taps = 0
    while (s.inspiration < getFighterCost(0)) {
      s = strike(s).state
      taps++
    }
    expect(taps).toBe(15)
  })

  it('a tap right after a kill hits the new monster (taps are queued, none lost)', () => {
    const first = strike(make({ monsterHp: 1 }))
    const second = strike(first.state)
    expect(second.state.monsterHp).toBe(4)
    expect(second.state.totalClicks).toBe(2)
  })

  it('does not overpay on overkill and counts one kill', () => {
    const r = strike(make({ monsterHp: 2 }), 9)
    expect(r.dealt).toBe(2)
    expect(r.state.monstersDefeated).toBe(1)
  })

  it('recovers from a missing or zero HP', () => {
    const r = strike(make({ monsterHp: 0 }))
    expect(r.state.monsterHp).toBe(4)
  })
})

describe('spawnMonster (save migration)', () => {
  it('starts an old save on a fresh monster of its tier', () => {
    const s = spawnMonster(make({ waveNumber: 12, monsterIndex: 0, monsterHp: 1 }))
    expect(s.monsterIndex).toBe(3)
    expect(s.monsterHp).toBe(20)
  })
})

describe('accessibility text', () => {
  it('names the monster and its HP', () => {
    expect(monsterLabel({ monsterIndex: 0, monsterHp: 3 })).toBe('Kobold, 3 of 5 HP. Tap to strike')
    expect(currentMonster({ monsterIndex: 99 }).name).toBe('Orc')
  })

  it('announces kills at most every two seconds', () => {
    expect(ANNOUNCE_EVERY_MS).toBe(2000)
  })
})
