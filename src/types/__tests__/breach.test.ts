import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { MONSTERS } from '../monsters'
import { HORDE_LEVEL_KILLS, hordeLevel, pushedBackHorde } from '../horde'
import { stepWall, WALL_STRIKE_SEC } from '../wall'
import {
  resolveBreach, breachLines, wardLeft,
  BREACH_WALL_PATCH, BREACH_WARD_SEC, BREACH_BLOOD_PRICE,
} from '../breach'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })
const idx = (id: string) => MONSTERS.findIndex((m) => m.id === id)
const MAIN = ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'empty_stores', 'the_breach', 'mend_the_walls']
const FLOORED = MAIN
const UNFLOORED = [...MAIN, 'the_wall_is_yours']
const seconds = (s: GameState, n: number) => Array.from({ length: n }).reduce<GameState>((acc) => stepWall(acc, 0), s)

// A mid-game city at horde level 4 (80 kills): the losses are easy to read
const CITY = make({
  beatsSeen: UNFLOORED,
  fighters: 10, fightersRallied: 12,
  repairers: 4, repairersDirected: 4,
  villagers: 20,
  foragers: { gatherers: 7, trappers: 2, rangers: 0 },
  foragersTrained: { gatherers: 7, trappers: 2, rangers: 0 },
  food: 200,
  inspiration: 30,
  hordeKills: 80,
  monstersDefeated: 120,
  killsByMonster: { kobold: 40, goblin: 40, shadow_crawler: 30, orc: 10 },
  playSeconds: 1000,
  cityHp: 1,
})

describe('the horde pushed back', () => {
  it('by half, or at least two levels, never below 0', () => {
    expect(pushedBackHorde(200)).toBe(100)
    // Half of 80 is 40 (one level and a half back); two levels is 30
    expect(pushedBackHorde(80)).toBe(30)
    expect(hordeLevel(80) - hordeLevel(pushedBackHorde(80))).toBe(2)
    expect(pushedBackHorde(30)).toBe(0)
    expect(pushedBackHorde(0)).toBe(0)
    for (const k of [0, 10, 49, 50, 51, 99, 100, 101, 400]) {
      expect(hordeLevel(k) - hordeLevel(pushedBackHorde(k))).toBeGreaterThanOrEqual(Math.min(2, hordeLevel(k) - 1))
    }
  })
})

describe('resolveBreach', () => {
  const after = resolveBreach(CITY, 0)
  const r = after.pendingBreach!

  it('kills 30% of fighters, repairers and villagers, 15% of foragers, and burns 40% of the stores', () => {
    expect([after.fighters, after.repairers, after.villagers]).toEqual([7, 3, 14])
    expect(after.foragers).toEqual({ gatherers: 6, trappers: 2, rangers: 0 })
    expect(after.food).toBe(120)
    expect(r).toMatchObject({ fightersLost: 3, repairersLost: 1, villagersLost: 6, foodLost: 80 })
  })

  it('always takes at least one fighter, if there are any', () => {
    expect(resolveBreach({ ...CITY, fighters: 2 }, 0).fighters).toBe(1)
    expect(resolveBreach({ ...CITY, fighters: 0 }, 0).fighters).toBe(0)
  })

  it('halves the renown held, then takes the blood price per horde level: it can go negative', () => {
    expect(after.inspiration).toBe(30 / 2 - BREACH_BLOOD_PRICE * 4)
    expect(after.inspiration).toBeLessThan(0)
    // A debt is not halved, only deepened
    expect(resolveBreach({ ...CITY, inspiration: -5 }, 0).inspiration).toBe(-5 - BREACH_BLOOD_PRICE * 4)
  })

  it('steps the price curves back by the people lost, so rebuilding costs what it did', () => {
    expect(after.fightersRallied).toBe(9)
    expect(after.repairersDirected).toBe(3)
    expect(after.foragersTrained.gatherers).toBe(6)
  })

  it('pushes the horde back, patches the wall, raises the ward and brings a fresh monster', () => {
    expect(after.hordeKills).toBe(30)
    expect(r.hordeLevelBefore).toBe(4)
    expect(r.hordeLevelAfter).toBe(2)
    expect(after.cityHp).toBe(BREACH_WALL_PATCH)
    expect(wardLeft(after)).toBe(BREACH_WARD_SEC)
    expect(after.monsterHp).toBe(MONSTERS[after.monsterIndex].hp)
    expect(after.siegeTimer).toBe(0)
    // Lifetime counts never go back
    expect(after.monstersDefeated).toBe(120)
    expect(after.killsByMonster).toEqual(CITY.killsByMonster)
  })

  it('counts the Breaches', () => {
    expect(after.breaches).toBe(1)
    expect(resolveBreach(after, 0).pendingBreach?.count).toBe(2)
  })

  it('reports every loss, then what the magic bought back', () => {
    expect(breachLines(r).map((l) => l.text)).toEqual([
      '3 fighters fell',
      '1 repairer fell',
      '6 villagers fell',
      '1 gatherer fell',
      '80 food burned',
      'Renown 30.00 to -5.00',
      'The horde driven back: level 4 to level 2',
      `The wall patched to ${BREACH_WALL_PATCH}; the ward holds for ${BREACH_WARD_SEC} seconds`,
    ])
  })
})

describe('the wall falls', () => {
  it('a strike that brings the wall to 0 is a Breach, once the floor is lifted', () => {
    const s = { ...CITY, monsterIndex: idx('orc'), siegeTimer: 0 }
    const out = seconds(s, WALL_STRIKE_SEC)
    expect(out.breaches).toBe(1)
    expect(out.cityHp).toBe(BREACH_WALL_PATCH)
    expect(out.pendingBreach).not.toBeNull()
  })

  it("never while Rodain's company holds the floor", () => {
    const s = { ...CITY, beatsSeen: FLOORED, cityHp: 51, monsterIndex: idx('orc') }
    const out = seconds(s, WALL_STRIKE_SEC * 20)
    expect(out.breaches).toBe(0)
    expect(out.cityHp).toBe(50)
  })

  it('nothing strikes while the ward holds; strikes resume when it lapses', () => {
    const warded = { ...resolveBreach(CITY, 0), monsterIndex: idx('orc') }
    expect(seconds(warded, WALL_STRIKE_SEC * 4).cityHp).toBe(BREACH_WALL_PATCH)
    const lapsed = { ...warded, playSeconds: warded.wardUntil }
    expect(seconds(lapsed, WALL_STRIKE_SEC).cityHp).toBe(BREACH_WALL_PATCH - 4)
  })

  it('one level of the horde is HORDE_LEVEL_KILLS kills', () => {
    expect(hordeLevel(HORDE_LEVEL_KILLS * 3)).toBe(4)
  })
})
