import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { MONSTERS } from '../monsters'
import { SOLDIER_TIERS, BARRACKS_LEVELS } from '../soldiers'
import { mealCost } from '../foodTick'
import { resolveBreach, breachLines } from '../breach'
import { WALL_STRIKE_SEC } from '../wall'
import {
  armySize, armyVolleyDamage, armyVolleyNow, armyKillSeconds, armyHoldsAgainst, toughestInPool,
  rankCost, rankBlock, makeRank,
} from '../army'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })
const soldiers = (conscripts: number, footmen: number, knights: number) => ({ conscripts, footmen, knights })
const orc = MONSTERS.find((m) => m.id === 'orc')!

describe('the ranks', () => {
  it('conscript, footman, knight: damage, first price, Garrison level', () => {
    expect(SOLDIER_TIERS.map((t) => [t.id, t.damage, t.baseCost, t.unlocksAtBarracksLevel])).toEqual([
      ['conscript', 0.5, 10, 1],
      ['footman', 1, 30, 3],
      ['knight', 2, 80, 5],
    ])
  })

  it('the Garrison costs 40 to 800 and holds 4 to 20 soldiers', () => {
    expect(BARRACKS_LEVELS.map((l) => [l.cost, l.soldierCap])).toEqual([[40, 4], [100, 8], [200, 12], [400, 16], [800, 20]])
  })
})

describe('one army at the Gate', () => {
  it('fighters and every rank strike in the same volley', () => {
    const s = make({ fighters: 4, soldiers: soldiers(2, 1, 1) })
    expect(armySize(s)).toBe(8)
    expect(armyVolleyDamage(s)).toBe(4 * 0.25 + 2 * 0.5 + 1 + 2)
  })

  it('rations scale soldiers as they scale fighters; standing down is 0', () => {
    const s = make({ soldiers: soldiers(0, 0, 1), ration: 'none' })
    expect(armyVolleyNow(s)).toBe(0)
  })

  it('soldiers eat by rank, and rations scale what they eat', () => {
    const full = make({ soldiers: soldiers(1, 1, 1), ration: 'full' })
    expect(mealCost(full)).toBe(4 + 6 + 10)
    expect(mealCost({ ...full, ration: 'none' })).toBe(0)
  })
})

describe('the readout: can the army hold the Gate?', () => {
  it('measures against the toughest monster the horde sends now', () => {
    expect(toughestInPool(make({ hordeKills: 0 })).id).toBe('kobold')
    expect(toughestInPool(make({ hordeKills: 60 })).id).toBe('orc')
  })

  it('kill time is whole volleys, the first landing 3s in on average: 12 fighters take 7 (39s) for an orc', () => {
    const s = make({ fighters: 12 })
    expect(armyKillSeconds(s, orc)).toBe(3 + 6 * 6)
    expect(armyHoldsAgainst(s, orc)).toBe(false)
  })

  it('an army that kills in one volley holds the Gate', () => {
    const s = make({ soldiers: soldiers(0, 0, 10) })
    expect(armyKillSeconds(s, orc)).toBeLessThan(WALL_STRIKE_SEC)
    expect(armyHoldsAgainst(s, orc)).toBe(true)
  })

  it('no army cannot kill anything', () => {
    expect(armyKillSeconds(make({}), orc)).toBe(Infinity)
  })
})

describe('training and promotion', () => {
  const garrison = make({ barracksLevel: 1, fighters: 3, inspiration: 100 })

  it('training turns a fighter into a conscript for its price', () => {
    const s = makeRank(garrison, 'conscript')
    expect(s.fighters).toBe(2)
    expect(s.soldiers.conscripts).toBe(1)
    expect(s.soldiersTrained.conscripts).toBe(1)
    expect(s.inspiration).toBe(90)
    // The next costs more (the ^1.15 curve)
    expect(rankCost(s, 'conscript')).toBeGreaterThan(10)
  })

  it('promotion moves a soldier up a rank and keeps the count', () => {
    const s = makeRank(make({ barracksLevel: 3, soldiers: soldiers(2, 0, 0), inspiration: 100 }), 'footman')
    expect(s.soldiers).toEqual(soldiers(1, 1, 0))
    expect(s.inspiration).toBe(70)
    expect(s.soldiersPromoted).toBe(1)
  })

  it('says why it cannot: no Garrison, locked, full, nobody to train, short of renown', () => {
    expect(rankBlock(make({ fighters: 3, inspiration: 100 }), 'conscript')).toBe('noGarrison')
    expect(rankBlock(garrison, 'footman')).toBe('locked')
    expect(rankBlock({ ...garrison, soldiers: soldiers(4, 0, 0) }, 'conscript')).toBe('full')
    expect(rankBlock({ ...garrison, fighters: 0 }, 'conscript')).toBe('nobody')
    expect(rankBlock({ ...garrison, inspiration: 9 }, 'conscript')).toBe('renown')
    expect(rankBlock(garrison, 'conscript')).toBeNull()
    // A promotion needs no room: the count does not change
    expect(rankBlock(make({ barracksLevel: 3, soldiers: soldiers(12, 0, 0), inspiration: 100 }), 'footman')).toBeNull()
  })

  it('a blocked attempt changes nothing', () => {
    const broke = { ...garrison, inspiration: 1 }
    expect(makeRank(broke, 'conscript')).toBe(broke)
  })
})

describe('a Breach takes soldiers too', () => {
  it('30% of each rank, the training price steps back, and the report names them', () => {
    const s = make({ fighters: 2, soldiers: soldiers(10, 4, 3), soldiersTrained: soldiers(12, 4, 3), inspiration: 10 })
    const after = resolveBreach(s, 0)
    expect(after.soldiers).toEqual(soldiers(7, 3, 3))
    expect(after.soldiersTrained).toEqual(soldiers(9, 3, 3))
    expect(breachLines(after.pendingBreach!).map((l) => l.text)).toEqual(
      expect.arrayContaining(['3 conscripts fell', '1 footman fell']),
    )
  })
})
