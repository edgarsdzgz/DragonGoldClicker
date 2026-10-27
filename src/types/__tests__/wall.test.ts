import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { MONSTERS, strike } from '../monsters'
import { HP_FLOOR } from '../systems'
import {
  WALL_STRIKE_SEC, HORDE_LEVEL_KILLS, hordeLevel, hordeStrength, wallStrikeDamage, stepWall,
  wallWarningCrossed, wallTone,
} from '../wall'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })
const idx = (id: string) => MONSTERS.findIndex((m) => m.id === id)
const SIEGE = ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'empty_stores', 'the_breach']
const UNFLOORED = [...SIEGE, 'the_horde_grows']
const seconds = (s: GameState, n: number) => Array.from({ length: n }).reduce<GameState>((acc) => stepWall(acc), s)

describe('monsters strike the wall', () => {
  it('every pool monster strikes the wall for about a fifth of its HP; the raider never strikes', () => {
    for (const m of MONSTERS.filter((m) => m.id !== 'raider')) {
      expect(m.wallStrike / m.hp).toBeGreaterThanOrEqual(0.15)
      expect(m.wallStrike / m.hp).toBeLessThanOrEqual(0.22)
    }
    expect(MONSTERS.find((m) => m.id === 'raider')?.wallStrike).toBe(0)
  })

  it('nothing strikes before the siege begins', () => {
    const s = make({ cityHp: 100 })
    expect(seconds(s, WALL_STRIKE_SEC * 3)).toBe(s)
  })

  it('the first strike lands one interval after the monster arrives, then every interval', () => {
    const s = make({ beatsSeen: UNFLOORED, cityHp: 100, monsterIndex: idx('orc'), siegeTimer: 0 })
    expect(seconds(s, WALL_STRIKE_SEC - 1).cityHp).toBe(100)
    expect(seconds(s, WALL_STRIKE_SEC).cityHp).toBe(96)
    expect(seconds(s, WALL_STRIKE_SEC * 3).cityHp).toBe(88)
  })

  it('a monster killed before its first strike never touches the wall', () => {
    let s = make({ beatsSeen: UNFLOORED, cityHp: 100, monsterIndex: idx('kobold'), monsterHp: 5 })
    for (let i = 0; i < 10; i++) {
      s = seconds(s, WALL_STRIKE_SEC - 1)
      s = strike(s, 99, 0).state
    }
    expect(s.cityHp).toBe(100)
  })

  it("Rodain's company holds the wall at the floor until the floor is lifted", () => {
    const s = make({ beatsSeen: SIEGE, cityHp: HP_FLOOR + 2, monsterIndex: idx('orc') })
    expect(seconds(s, WALL_STRIKE_SEC * 10).cityHp).toBe(HP_FLOOR)
  })

  it('a raider at the gate does not strike', () => {
    const s = make({ beatsSeen: UNFLOORED, cityHp: 100, monsterIndex: idx('raider') })
    expect(seconds(s, WALL_STRIKE_SEC * 4).cityHp).toBe(100)
  })
})

describe("the horde's level", () => {
  it('starts at 1 and rises one level per HORDE_LEVEL_KILLS', () => {
    expect(hordeLevel(0)).toBe(1)
    expect(hordeLevel(HORDE_LEVEL_KILLS - 1)).toBe(1)
    expect(hordeLevel(HORDE_LEVEL_KILLS)).toBe(2)
    expect(hordeLevel(HORDE_LEVEL_KILLS * 4 + 3)).toBe(5)
  })

  it('grows 5% a level: strikes are the roster numbers at level 1 and harder after', () => {
    expect(hordeStrength(HORDE_LEVEL_KILLS - 1)).toBe(1)
    expect(hordeStrength(HORDE_LEVEL_KILLS * 9)).toBeCloseTo(1.45)
    expect(wallStrikeDamage(make({ monsterIndex: idx('orc'), hordeKills: 0 }))).toBe(4)
    expect(wallStrikeDamage(make({ monsterIndex: idx('orc'), hordeKills: 1000 }))).toBe(12)
  })
})

describe('warnings', () => {
  it('fire once as the wall falls across each line, most severe first', () => {
    expect(wallWarningCrossed(51, 50)?.id).toBe('cracking')
    expect(wallWarningCrossed(26, 25)?.id).toBe('failing')
    expect(wallWarningCrossed(11, 10)?.id).toBe('last')
    // One strike across two lines gives the worse warning
    expect(wallWarningCrossed(52, 24)?.id).toBe('failing')
  })

  it('do not fire while the wall holds below a line, or climbs back over it', () => {
    expect(wallWarningCrossed(40, 38)).toBeNull()
    expect(wallWarningCrossed(48, 52)).toBeNull()
    expect(wallWarningCrossed(50, 50)).toBeNull()
  })

  it('the bar is sound above half, cracking to a quarter, failing below', () => {
    expect(wallTone(51)).toBe('sound')
    expect(wallTone(50)).toBe('cracking')
    expect(wallTone(26)).toBe('cracking')
    expect(wallTone(25)).toBe('failing')
  })
})
