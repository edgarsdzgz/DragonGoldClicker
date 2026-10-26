import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { MONSTERS, hordeMonster, monsterAt, strike, monsterLabel } from '../monsters'
import { HORDE_LEVEL_KILLS, hordeLevel } from '../horde'
import { toughestInPool, armyHoldsAgainst } from '../army'
import { resolveBreach } from '../breach'
import { startFoodEvent, stepFoodEvents, RAIDER_INDEX, EVENT_WARNING_SEC, RAID_SEC } from '../foodEvents'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })
const idx = (id: string) => MONSTERS.findIndex((m) => m.id === id)
/** The kills that put the horde at this level */
const atLevel = (level: number) => (level - 1) * HORDE_LEVEL_KILLS
const ORC = MONSTERS[idx('orc')]

describe('the horde grows 5% a level', () => {
  it('level 1 is the roster as written', () => {
    for (const m of MONSTERS) expect(hordeMonster(m, atLevel(1) + HORDE_LEVEL_KILLS - 1)).toBe(m)
  })

  it('at level 27 an orc has 46 HP, pays 2.30 and strikes the wall for 9.2', () => {
    expect(hordeLevel(atLevel(27))).toBe(27)
    expect(hordeMonster(ORC, atLevel(27))).toMatchObject({ hp: 46, bounty: 2.3, wallStrike: 9.2 })
  })

  it('every monster still pays 0.05 renown per HP at every level', () => {
    for (let level = 1; level <= 41; level++) {
      for (const m of MONSTERS) {
        const grown = hordeMonster(m, atLevel(level))
        expect(Number.isInteger(grown.hp)).toBe(true)
        expect(grown.bounty).toBeCloseTo(grown.hp * 0.05, 2)
      }
    }
  })

  it('a kill pays the grown bounty', () => {
    const s = make({ monsterIndex: idx('orc'), monsterHp: 1, hordeKills: atLevel(27), inspiration: 0 })
    const r = strike(s, 1, 0)
    expect(r.bounty).toBe(2.3)
    expect(r.state.inspiration).toBe(2.3)
  })

  it('the next monster arrives at the strength of the level the kill reached', () => {
    const s = make({ monsterIndex: idx('orc'), monsterHp: 1, hordeKills: atLevel(27) - 1 })
    const after = strike(s, 1, 0).state
    expect(after.hordeKills).toBe(atLevel(27))
    expect(after.monsterHp).toBe(monsterAt(after.monsterIndex, atLevel(27)).hp)
    expect(after.monsterHp).toBeGreaterThan(MONSTERS[after.monsterIndex].hp)
  })

  it('the screen reader hears the grown HP', () => {
    expect(monsterLabel({ monsterIndex: idx('orc'), monsterHp: 46, hordeKills: atLevel(27) })).toBe('Orc, 46 of 46 HP. Tap to strike')
  })

  it('a raider grows with the horde too', () => {
    const fed = make({
      beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'empty_stores'],
      questsDone: ['defend_the_wall', 'raise_the_guard', 'hold_the_line', 'fill_the_stores'],
      food: 200, fighters: 4, playSeconds: 1000, hordeKills: atLevel(27),
    })
    let s = startFoodEvent(fed, 'raid', () => 0)
    for (let i = 0; i < EVENT_WARNING_SEC; i++) s = stepFoodEvents({ ...s, playSeconds: s.playSeconds + 1 }, () => 0)
    expect(s.monsterIndex).toBe(RAIDER_INDEX)
    expect(s.monsterHp).toBe(monsterAt(RAIDER_INDEX, atLevel(27)).hp)
    expect(s.monsterHp).toBeGreaterThan(MONSTERS[RAIDER_INDEX].hp)
    // If it escapes, the pool monster that takes its place comes at the horde's strength
    for (let i = 0; i < RAID_SEC; i++) s = stepFoodEvents({ ...s, playSeconds: s.playSeconds + 1 }, () => 0)
    expect(s.monsterIndex).not.toBe(RAIDER_INDEX)
    expect(s.monsterHp).toBe(monsterAt(s.monsterIndex, atLevel(27)).hp)
    expect(s.monsterHp).toBeGreaterThan(MONSTERS[s.monsterIndex].hp)
  })
})

describe('the army must keep up', () => {
  it('the readout measures the grown monster', () => {
    expect(toughestInPool({ hordeKills: atLevel(27) })).toMatchObject({ id: 'orc', hp: 46 })
  })

  it('an army that holds at level 3 may not hold at level 27', () => {
    const army = (level: number) => make({ hordeKills: atLevel(level), soldiers: { conscripts: 0, footmen: 0, knights: 15 } })
    const low = army(3)
    const high = army(27)
    expect(armyHoldsAgainst(low, toughestInPool(low))).toBe(true)
    expect(armyHoldsAgainst(high, toughestInPool(high))).toBe(false)
  })
})

describe('a Breach pushes the strength back with the horde', () => {
  it('the next monster comes at the pushed-back strength', () => {
    const s = make({ beatsSeen: ['the_breach'], hordeKills: atLevel(27), cityHp: 0, fighters: 10, villagers: 20 })
    const after = resolveBreach(s, 0)
    expect(after.hordeKills).toBeLessThan(s.hordeKills)
    expect(after.monsterHp).toBe(monsterAt(after.monsterIndex, after.hordeKills).hp)
  })
})
