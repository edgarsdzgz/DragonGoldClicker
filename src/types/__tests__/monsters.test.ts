import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { MONSTERS, monsterIndexForKills, spawnMonster, strike, monsterLabel, currentMonster } from '../monsters'
import { getFighterCost } from '../fighters'
import { ANNOUNCE_EVERY_MS } from '../../hooks/useKillEvents'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('roster', () => {
  it('has the four monsters from the plan, in order of appearance', () => {
    expect(MONSTERS.map((m) => [m.name, m.hp, m.bounty, m.fromKills])).toEqual([
      ['Kobold', 5, 0.25, 0],
      ['Goblin', 8, 0.4, 10],
      ['Shadow Crawler', 12, 0.6, 25],
      ['Orc', 20, 1, 50],
    ])
  })

  it('uses real Ionicons glyph names', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const glyphs = require('@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json')
    for (const m of MONSTERS) expect(m.glyph in glyphs).toBe(true)
  })

  it('picks the tier from the kill count', () => {
    expect(monsterIndexForKills(0)).toBe(0)
    expect(monsterIndexForKills(9)).toBe(0)
    expect(monsterIndexForKills(10)).toBe(1)
    expect(monsterIndexForKills(24)).toBe(1)
    expect(monsterIndexForKills(25)).toBe(2)
    expect(monsterIndexForKills(49)).toBe(2)
    expect(monsterIndexForKills(50)).toBe(3)
    expect(monsterIndexForKills(5000)).toBe(3)
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

  it('moves to the next tier on the tenth kill', () => {
    const r = strike(make({ monstersDefeated: 9, monsterHp: 1 }))
    expect(r.state.monstersDefeated).toBe(10)
    expect(r.state.monsterIndex).toBe(1)
    expect(r.state.monsterHp).toBe(8)
    expect(r.monster.name).toBe('Kobold')
  })

  it('keeps the early pace: about 20 taps to afford the first Rally', () => {
    let s = make({})
    let taps = 0
    while (s.inspiration < getFighterCost(0)) {
      s = strike(s).state
      taps++
    }
    expect(taps).toBe(20)
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
    const s = spawnMonster(make({ monstersDefeated: 300, monsterIndex: 0, monsterHp: 1 }))
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
