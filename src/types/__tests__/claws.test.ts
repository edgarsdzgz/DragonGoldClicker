import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { MONSTERS, strike } from '../monsters'
import { resolveBreach } from '../breach'
import { CLAWS, MAX_CLAW_LEVEL, clawDef, nextClaw, canSharpen, sharpenClaws, clawLook } from '../claws'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('the claw track', () => {
  it('runs Fledgling to Ancient: damage and cost by level', () => {
    expect(CLAWS.map((c) => [c.name, c.damage, c.cost])).toEqual([
      ['Fledgling Claws', 1, 0],
      ['Sharpened Claws', 2, 5],
      ['Hooked Claws', 3, 12],
      ['Hardened Claws', 4, 25],
      ['Serrated Claws', 6, 50],
      ['Obsidian Claws', 8, 100],
      ['Ember Claws', 11, 200],
      ['Dragonsteel Claws', 15, 400],
      ['Ancient Claws', 20, 800],
    ])
    CLAWS.forEach((c, i) => expect(c.level).toBe(i))
  })

  it('a fresh dragon has Fledgling claws, and its tap matches them', () => {
    expect(DEFAULT_GAME_STATE.clawLevel).toBe(0)
    expect(DEFAULT_GAME_STATE.tapDamage).toBe(clawDef(0).damage)
  })

  it('Ancient claws kill an orc in one tap', () => {
    const orc = MONSTERS.find((m) => m.id === 'orc')!
    expect(clawDef(MAX_CLAW_LEVEL).damage).toBeGreaterThanOrEqual(orc.hp)
  })

  it('has no level past Ancient', () => {
    expect(nextClaw(MAX_CLAW_LEVEL)).toBeNull()
    expect(clawDef(99).level).toBe(MAX_CLAW_LEVEL)
  })
})

describe('sharpening', () => {
  it('pays the next level and sets the tap damage', () => {
    const s = sharpenClaws(make({ inspiration: 13, totalInspirationSpent: 0 }))
    expect(s.clawLevel).toBe(1)
    expect(s.tapDamage).toBe(2)
    expect(s.inspiration).toBe(8)
    expect(s.totalInspirationSpent).toBe(5)
    // Taps hit harder at once
    expect(strike({ ...s, monsterHp: 5 }, s.tapDamage, 0).state.monsterHp).toBe(3)
  })

  it('one purchase is one level, even with renown for more', () => {
    expect(sharpenClaws(make({ inspiration: 10000 })).clawLevel).toBe(1)
  })

  it('cannot be bought short of the cost, in debt, or past Ancient', () => {
    const short = make({ inspiration: 4.99 })
    expect(canSharpen(short)).toBe(false)
    expect(sharpenClaws(short)).toBe(short)
    expect(canSharpen(make({ inspiration: -3 }))).toBe(false)
    const ancient = make({ clawLevel: MAX_CLAW_LEVEL, tapDamage: 20, inspiration: 10000 })
    expect(canSharpen(ancient)).toBe(false)
    expect(sharpenClaws(ancient)).toBe(ancient)
  })

  it('a Breach never takes the claws', () => {
    const s = make({ clawLevel: 4, tapDamage: 6, inspiration: 20, fighters: 5, villagers: 10, food: 100 })
    const after = resolveBreach(s, 0)
    expect(after.clawLevel).toBe(4)
    expect(after.tapDamage).toBe(6)
  })
})

describe('the slash grows with the claws', () => {
  it('bigger with each level, gold at Serrated, ember at Ember', () => {
    expect(clawLook(0)).toEqual({ scale: 1, tier: 'plain' })
    expect(clawLook(8).scale).toBeGreaterThan(clawLook(4).scale)
    expect([3, 4, 5, 6].map((l) => clawLook(l).tier)).toEqual(['plain', 'gold', 'gold', 'ember'])
  })
})
