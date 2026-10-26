import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { MONSTERS } from '../monsters'
import { resolveBreach, breachLines } from '../breach'
import { armyVolleyDamage, armyKillSeconds } from '../army'
import { getBeat } from '../story'
import { activeQuests } from '../quests'
import {
  ARMORY_COST, SWORD_BASE_COST, SHIELD_BASE_COST,
  gearCost, gearByRank, nextGearRank, gearBlock, forgeGear, swordVolleyBonus,
} from '../forge'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })
const soldiers = (conscripts: number, footmen: number, knights: number) => ({ conscripts, footmen, knights })
const gear = (swords: number, shields: number) => ({ swords, shields })
const orc = MONSTERS.find((m) => m.id === 'orc')!

describe('the prices', () => {
  it('the Forge 75; a sword from 15 and a shield from 20, each rising on the ^1.15 curve', () => {
    expect([ARMORY_COST, SWORD_BASE_COST, SHIELD_BASE_COST]).toEqual([75, 15, 20])
    expect(gearCost(make({}), 'sword')).toBe(15)
    expect(gearCost(make({}), 'shield')).toBe(20)
    expect(gearCost(make({ armoryGear: gear(1, 0) }), 'sword')).toBeGreaterThan(15)
    // The shield's price follows shields, not swords
    expect(gearCost(make({ armoryGear: gear(5, 0) }), 'shield')).toBe(20)
  })
})

describe('gear goes to the best ranks first', () => {
  it('knights, then footmen, then conscripts', () => {
    expect(gearByRank(soldiers(3, 2, 1), 2)).toEqual(soldiers(0, 1, 1))
    expect(gearByRank(soldiers(3, 2, 1), 5)).toEqual(soldiers(2, 2, 1))
  })

  it('gear beyond the soldiers waits in the racks', () => {
    expect(gearByRank(soldiers(1, 0, 0), 4)).toEqual(soldiers(1, 0, 0))
  })

  it('names the rank the next piece goes to', () => {
    const s = make({ soldiers: soldiers(2, 1, 0), armoryGear: gear(1, 0) })
    expect(nextGearRank(s, 'sword')).toBe('conscript')
    expect(nextGearRank(s, 'shield')).toBe('footman')
    expect(nextGearRank({ ...s, armoryGear: gear(3, 3) }, 'sword')).toBeNull()
  })
})

describe('swords: an armed soldier hits 50% harder', () => {
  it('a sword on a knight adds 1 to the volley, on a conscript 0.25', () => {
    expect(swordVolleyBonus(make({ soldiers: soldiers(1, 0, 1), armoryGear: gear(1, 0) }))).toBe(1)
    expect(swordVolleyBonus(make({ soldiers: soldiers(1, 0, 1), armoryGear: gear(2, 0) }))).toBe(1.25)
  })

  it('fighters carry none, and the army readout moves with every sword', () => {
    const bare = make({ fighters: 4, soldiers: soldiers(0, 0, 4) })
    const armed = { ...bare, armoryGear: gear(4, 0) }
    expect(armyVolleyDamage(armed)).toBe(armyVolleyDamage(bare) + 4)
    expect(armyKillSeconds(armed, orc)).toBeLessThan(armyKillSeconds(bare, orc))
  })
})

describe('forging', () => {
  const forge = make({ armoryBuilt: true, soldiers: soldiers(2, 0, 0), inspiration: 100 })

  it('a sword costs its price and goes to the racks', () => {
    const s = forgeGear(forge, 'sword')
    expect(s.armoryGear).toEqual(gear(1, 0))
    expect(s.inspiration).toBe(85)
    expect(s.totalInspirationSpent).toBe(15)
  })

  it('says why it cannot: no Forge, no soldiers, all equipped, short of renown', () => {
    expect(gearBlock({ ...forge, armoryBuilt: false }, 'sword')).toBe('noForge')
    expect(gearBlock({ ...forge, soldiers: soldiers(0, 0, 0) }, 'sword')).toBe('nobody')
    expect(gearBlock({ ...forge, armoryGear: gear(2, 0) }, 'sword')).toBe('full')
    expect(gearBlock({ ...forge, armoryGear: gear(2, 0) }, 'shield')).toBeNull()
    expect(gearBlock({ ...forge, inspiration: 19 }, 'shield')).toBe('renown')
    expect(gearBlock(forge, 'shield')).toBeNull()
  })

  it('a blocked attempt changes nothing', () => {
    const broke = { ...forge, inspiration: 1 }
    expect(forgeGear(broke, 'sword')).toBe(broke)
  })
})

describe('shields: a shielded soldier never falls in a Breach', () => {
  it('only the unshielded are counted for losses, and the report says who stood', () => {
    // 10 knights, 4 shielded: 30% of the 6 unshielded fall (1), not 30% of 10 (3)
    const s = make({ soldiers: soldiers(0, 0, 10), soldiersTrained: soldiers(0, 0, 10), armoryGear: gear(0, 4), inspiration: 10 })
    const after = resolveBreach(s, 0)
    expect(after.soldiers.knights).toBe(9)
    expect(after.armoryGear.shields).toBe(4)
    expect(breachLines(after.pendingBreach!).map((l) => l.text)).toEqual(
      expect.arrayContaining(['1 knight fell', '4 shielded soldiers stood their ground']),
    )
  })

  it('every soldier shielded: no soldier falls', () => {
    const s = make({ soldiers: soldiers(5, 3, 2), armoryGear: gear(0, 10), inspiration: 10 })
    expect(resolveBreach(s, 0).soldiers).toEqual(soldiers(5, 3, 2))
  })

  it('the fallen take their swords with them, the least equipped falling first', () => {
    // 10 conscripts, all armed, none shielded: 3 fall, each with a sword
    const all = make({ soldiers: soldiers(10, 0, 0), armoryGear: gear(10, 0), inspiration: 10 })
    expect(resolveBreach(all, 0).armoryGear.swords).toBe(7)
    expect(breachLines(resolveBreach(all, 0).pendingBreach!).map((l) => l.text)).toContain('3 swords lost with them')
    // 10 conscripts, 4 armed: the 3 who fall are among the 6 with no sword
    const few = { ...all, armoryGear: gear(4, 0) }
    expect(resolveBreach(few, 0).armoryGear.swords).toBe(4)
    // 10 conscripts, 9 armed: only 1 is bare, so 2 of the 3 fallen were armed
    const most = { ...all, armoryGear: gear(9, 0) }
    expect(resolveBreach(most, 0).armoryGear.swords).toBe(7)
    // 10 conscripts, all armed, 4 shielded: 1 of the 6 unshielded falls (30%, rounded down), armed
    const guarded = { ...all, armoryGear: gear(10, 4) }
    expect(resolveBreach(guarded, 0).armoryGear).toEqual(gear(9, 4))
  })
})

describe('the story', () => {
  it('Kael comes a minute after First Soldiers and reveals the Forge', () => {
    const smith = getBeat('the_smith')!
    expect(smith.trigger(make({ barracksLevel: 1 }))).toBe(false)
    expect(smith.trigger(make({ questsDone: ['first_soldiers'] }))).toBe(true)
    expect(smith.dwellSec).toBe(60)
    expect(smith.reveals).toEqual(['forge'])
  })

  it('Light the Forge, then Arm the Ranks (2 swords)', () => {
    const seen = make({ beatsSeen: ['the_smith'], questsDone: [] })
    expect(activeQuests(seen).map((q) => q.id)).toContain('light_the_forge')
    expect(activeQuests(seen).map((q) => q.id)).not.toContain('arm_the_ranks')
    const lit = { ...seen, questsDone: ['light_the_forge' as const], armoryGear: gear(2, 0) }
    const arm = activeQuests(lit).find((q) => q.id === 'arm_the_ranks')!
    expect(arm.goals[0].progress(lit)).toBe(2)
  })
})
