import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { HORDE_LEVEL_KILLS } from '../horde'
import { MONSTERS, strike, fighterStrike, monsterLabel, currentMonster, shownHp, roundHp, restingPose } from '../monsters'
import { getFighterCost, getFighterDps, stepFighterVolley, FIGHTER_HIT_DAMAGE, FIGHTER_SWING_MS, FIGHTER_TICK_MS } from '../fighters'
import { ANNOUNCE_EVERY_MS } from '../../hooks/useKillEvents'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })

describe('roster', () => {
  it('lists the pool monsters in order of debut, then the raider, which never spawns from the pool', () => {
    expect(MONSTERS.map((m) => [m.id, m.fromKills])).toEqual([
      ['kobold', 0], ['goblin', 13], ['giant_rat', 20], ['shadow_crawler', 28], ['goblin_scout', 38],
      ['war_hound', 45], ['orc', 53], ['goblin_archer', 63], ['banner_runner', 78], ['giant_bat', 90],
      ['shield_bearer', 103], ['goblin_wolf_rider', 115], ['beetle_guard', 128], ['harpy', 140],
      ['chitin_warrior', 153], ['nomad_scout', 165], ['nomad_warrior', 178], ['nomad_archer', 190],
      ['storm_rider', 198], ['wraith', 203], ['skeleton', 215], ['shadow_phantom', 228],
      ['spectral_hound', 240], ['ashen_convert', 253], ['cult_apprentice', 265], ['ember_prophet', 278],
      ['mantair_corsair', 290], ['ember_wraith', 303], ['raider', Infinity],
    ])
  })

  it('every horde level from 2 to 13 brings a new monster three kills in', () => {
    for (let level = 2; level <= 13; level++) {
      const start = (level - 1) * HORDE_LEVEL_KILLS
      const first = Math.min(...MONSTERS.map((m) => m.fromKills).filter((k) => k >= start && k < start + HORDE_LEVEL_KILLS))
      expect(first).toBe(start + 3)
    }
  })

  it('every monster pays 0.05 renown per HP', () => {
    for (const m of MONSTERS) expect(m.bounty).toBeCloseTo(m.hp * 0.05, 9)
  })

  it('has a unique id per monster', () => {
    expect(new Set(MONSTERS.map((m) => m.id)).size).toBe(MONSTERS.length)
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

  it('the 13th kill brings the first goblin; the kill that does it is still paid as a kobold', () => {
    const clear = strike(make({ monstersDefeated: 12, hordeKills: 12, monsterHp: 1 }))
    expect(clear.monster.name).toBe('Kobold')
    expect(clear.state.monsterIndex).toBe(1)
    expect(clear.state.monsterHp).toBe(8)
    const before = strike(make({ monstersDefeated: 11, hordeKills: 11, monsterHp: 1 }))
    expect(before.state.monsterIndex).toBe(0)
  })

  it("a kill moves the horde's advance with the lifetime count, and restarts the wall-strike clock", () => {
    const r = strike(make({ monstersDefeated: 40, hordeKills: 7, monsterHp: 1, siegeTimer: 4 }))
    expect(r.state.monstersDefeated).toBe(41)
    expect(r.state.hordeKills).toBe(8)
    expect(r.state.siegeTimer).toBe(0)
  })

  it('there is always a monster: a fresh game can strike at once, and nothing is ever ignored', () => {
    const r = strike(DEFAULT_GAME_STATE)
    expect(r.state.monsterHp).toBe(4)
    expect(r.state.totalClicks).toBe(1)
  })

  it('keeps the early pace: the first Rally (1.00) takes 20 taps, four kobolds', () => {
    let s = make({})
    let taps = 0
    while (s.inspiration < getFighterCost(0)) {
      s = strike(s).state
      taps++
    }
    expect(taps).toBe(20)
    expect(s.monstersDefeated).toBe(4)
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

describe('the resting pose', () => {
  it('rests wounded at a third of max HP or less', () => {
    expect(restingPose(5, 5)).toBe('idle')
    expect(restingPose(2, 5)).toBe('idle')
    expect(restingPose(1, 5)).toBe('hurt')
    expect(restingPose(4, 12)).toBe('hurt')
    expect(restingPose(5, 12)).toBe('idle')
  })
})

describe('accessibility text', () => {
  it('names the monster and its HP', () => {
    expect(monsterLabel({ monsterIndex: 0, hordeKills: 0, monsterHp: 3 })).toBe('Kobold, 3 of 5 HP. Tap to strike')
    // Fighter chip damage leaves fractions; the text rounds up so a standing monster never reads 0
    expect(monsterLabel({ monsterIndex: 0, hordeKills: 0, monsterHp: 0.25 })).toBe('Kobold, 1 of 5 HP. Tap to strike')
    expect(currentMonster({ monsterIndex: 99, hordeKills: 0 }).name).toBe(MONSTERS[MONSTERS.length - 1].name)
  })

  it('announces kills at most every two seconds', () => {
    expect(ANNOUNCE_EVERY_MS).toBe(2000)
  })
})

describe('fighters', () => {
  it('a fighter swings every 6s for a quarter of a tap: 1/32 of a held strike (1 damage every 750ms)', () => {
    const heldDps = 1 / 0.75
    expect(getFighterDps(1)).toBeCloseTo(heldDps / 32, 5)
    expect(getFighterDps(32)).toBeCloseTo(heldDps, 5)
    expect(FIGHTER_HIT_DAMAGE).toBe(0.25)
    expect(FIGHTER_SWING_MS).toBe(6000)
  })

  it('one fighter lands one swing every 6s; no fighters, no swings', () => {
    let progress = 0
    const landed: number[] = []
    for (let tick = 1; tick <= 48; tick++) {
      const r = stepFighterVolley(progress, 1)
      progress = r.progress
      if (r.swings) landed.push(tick * FIGHTER_TICK_MS)
    }
    expect(landed).toEqual([6000, 12000])
    expect(stepFighterVolley(0.9, 0)).toEqual({ swings: 0, progress: 0 })
  })

  it('all fighters strike together as one hit every 6s, never one by one', () => {
    const swingsPerTick = (fighters: number) => {
      let progress = 0
      const out: number[] = []
      for (let i = 0; i < 48; i++) {
        const r = stepFighterVolley(progress, fighters)
        progress = r.progress
        out.push(r.swings)
      }
      return out
    }
    // Four fighters: nothing for 6s, then all four at once (one hit of 1.00), twice in 12s
    const four = swingsPerTick(4)
    expect(four.filter((n) => n > 0)).toEqual([4, 4])
    expect(four[23]).toBe(4)
    expect(four[47]).toBe(4)
    // More fighters make the one hit bigger, not more frequent
    expect(swingsPerTick(10).filter((n) => n > 0)).toEqual([10, 10])
  })

  it('wears the monster down in slivers and keeps the HP free of float drift', () => {
    let s = make({})
    for (let i = 0; i < 3; i++) s = fighterStrike(s, FIGHTER_HIT_DAMAGE, 1).state
    expect(s.monsterHp).toBe(4.25)
    expect(shownHp(s.monsterHp)).toBe(5)
    expect(s.allyStrikes).toBe(3)
    expect(s.totalClicks).toBe(0)
    expect(roundHp(0.1 + 0.2)).toBe(0.3)
  })

  it('a fighter kill pays the bounty and is counted as theirs; renown comes only from kills', () => {
    const chip = fighterStrike(make({ monsterHp: 4 }), 0.25, 1)
    expect(chip.state.inspiration).toBe(0)
    const kill = fighterStrike(make({ monsterHp: 0.25 }), 0.25, 1)
    expect(kill.killed).toBe(true)
    expect(kill.state.inspiration).toBe(0.25)
    expect(kill.state.monstersDefeated).toBe(1)
    expect(kill.state.allyKills).toBe(1)
    // A tap kill is not the fighters'
    expect(strike(make({ monsterHp: 1 })).state.allyKills).toBe(0)
  })

  it('a tap mixes with fighter damage on the same monster', () => {
    const chipped = fighterStrike(make({}), 0.5, 2).state
    const r = strike(chipped)
    expect(r.state.monsterHp).toBe(3.5)
  })
})
