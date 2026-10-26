import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { FORAGER_TIERS, LODGE_LEVELS, getForagerCap, getAutoFoodRate } from '../foragers'
import { FOOD_CHECK_INTERVAL } from '../food'
import { foragerCost, foragerBlock, makeForager } from '../lodge'
import { wallWhileAway, wallAwayLine, AWAY_WALL_FLOOR } from '../timeAway'
import { moveTargets, moveBlock, movePerson, getReassignOptions } from '../reassignment'
import type { RoleId } from '../reassignment'
import { DRACONIA_HALL_COST } from '../state'
import { getBeat } from '../story'
import { activeQuests, QUESTS } from '../quests'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })
const foragers = (gatherers: number, trappers: number, rangers: number) => ({ gatherers, trappers, rangers })
const SIEGE = ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'empty_stores', 'the_breach']
const HOUR = 3600

describe("the Ranger's Lodge", () => {
  it('gatherer 8, trapper 20, ranger 40 food a meal; trapper 15 at Lv1, ranger 40 at Lv3', () => {
    expect(FORAGER_TIERS.map((t) => [t.id, Math.round(t.baseRate * FOOD_CHECK_INTERVAL), t.baseCost, t.unlocksAtLodgeLevel])).toEqual([
      ['gatherer', 8, 0.25, 0],
      ['trapper', 20, 15, 1],
      ['ranger', 40, 40, 3],
    ])
  })

  it('costs 30 to 600 and raises the cap from 6 to 26, never lowering it', () => {
    expect(LODGE_LEVELS.map((l) => [l.cost, l.foragerCap])).toEqual([[30, 10], [75, 14], [150, 18], [300, 22], [600, 26]])
    expect(getForagerCap(0)).toBe(6)
    for (const l of LODGE_LEVELS) expect(l.foragerCap).toBeGreaterThan(getForagerCap(0))
  })

  it('promotes a gatherer to a trapper: the count holds, the food grows', () => {
    const s = make({ lodgeLevel: 1, foragers: foragers(3, 0, 0), inspiration: 100 })
    const after = makeForager(s, 'trapper')
    expect(after.foragers).toEqual(foragers(2, 1, 0))
    expect(after.villagers).toBe(s.villagers)
    expect(after.inspiration).toBe(85)
    expect(after.foragersTrained.trappers).toBe(1)
    expect(foragerCost(after, 'trapper')).toBeGreaterThan(15)
    expect(getAutoFoodRate(after.foragers)).toBeGreaterThan(getAutoFoodRate(s.foragers))
  })

  it('training a gatherer takes a villager and needs room; a promotion needs none', () => {
    const full = make({ lodgeLevel: 1, villagers: 5, foragers: foragers(10, 0, 0), inspiration: 100 })
    expect(foragerBlock(full, 'gatherer')).toBe('full')
    expect(foragerBlock(full, 'trapper')).toBeNull()
    const trained = makeForager(make({ villagers: 5, inspiration: 100 }), 'gatherer')
    expect(trained).toMatchObject({ villagers: 4, foragers: foragers(1, 0, 0) })
  })

  it('says why it cannot: locked, nobody to promote, no villagers, short of renown', () => {
    const lodge = make({ lodgeLevel: 1, foragers: foragers(2, 0, 0), villagers: 3, inspiration: 100 })
    expect(foragerBlock(make({ foragers: foragers(2, 0, 0), inspiration: 100 }), 'trapper')).toBe('locked')
    expect(foragerBlock(lodge, 'ranger')).toBe('locked')
    expect(foragerBlock({ ...lodge, foragers: foragers(0, 0, 0) }, 'trapper')).toBe('nobody')
    expect(foragerBlock({ ...lodge, villagers: 0 }, 'gatherer')).toBe('nobody')
    expect(foragerBlock({ ...lodge, inspiration: 14 }, 'trapper')).toBe('renown')
    expect(makeForager({ ...lodge, inspiration: 14 }, 'trapper').foragers).toEqual(lodge.foragers)
  })
})

describe('time away follows the army readout', () => {
  const siege = (over: Partial<GameState>) => make({ beatsSeen: SIEGE, hordeKills: 60, cityHp: 100, ...over })

  it('before the siege the wall is not part of it', () => {
    expect(wallWhileAway(make({}), HOUR)).toBeNull()
  })

  it('an army that holds keeps the wall whole', () => {
    const w = wallWhileAway(siege({ soldiers: { conscripts: 0, footmen: 0, knights: 10 } }), HOUR)!
    expect(w.held).toBe(true)
    expect(w.hpAfter).toBe(100)
    expect(wallAwayLine(w)).toBe('Your army held the Gate.')
  })

  it('an army that cannot hold lets the wall wear, but never below 50', () => {
    const w = wallWhileAway(siege({ fighters: 4 }), HOUR)!
    expect(w.held).toBe(false)
    expect(w.hpAfter).toBe(AWAY_WALL_FLOOR)
    expect(wallAwayLine(w)).toBe('Your army could not stop the orcs in time: the wall wore from 100 to 50.')
  })

  it('a short time away wears it less than a long one', () => {
    const short = wallWhileAway(siege({ fighters: 4 }), 60)!
    expect(short.hpAfter).toBeLessThan(100)
    expect(short.hpAfter).toBeGreaterThan(AWAY_WALL_FLOOR)
  })

  it('a wall left below 50 is not worn further, and repairers mend it', () => {
    expect(wallWhileAway(siege({ cityHp: 30 }), HOUR)!.hpAfter).toBe(30)
    const mended = wallWhileAway(siege({ cityHp: 30, repairers: 20 }), HOUR)!
    expect(mended.hpAfter).toBe(100)
    expect(wallAwayLine(mended)).toBe('Your army could not stop the orcs in time, but the repairers kept the wall standing.')
  })
})

describe('the Keep: moving people between jobs', () => {
  const FIGHTER: RoleId = { type: 'fighter' }
  const REPAIRER: RoleId = { type: 'repairer' }
  const GATHERER: RoleId = { type: 'forager', tier: 'gatherer' }
  const IDLE: RoleId = { type: 'idle' }
  const city = make({ fighters: 5, repairers: 2, villagers: 3, inspiration: 10, fightersRallied: 5, soldiers: { conscripts: 0, footmen: 0, knights: 2 } })

  it('the Keep costs 150 renown', () => {
    expect(DRACONIA_HALL_COST).toBe(150)
  })

  it('a fighter becomes a repairer for free; nothing is refunded and no price steps back', () => {
    const s = movePerson(city, FIGHTER, REPAIRER)
    expect(s).toMatchObject({ fighters: 4, repairers: 3, inspiration: 10, fightersRallied: 5 })
  })

  it('a soldier only stands down to a fighter, and their gear stays in the racks', () => {
    expect(moveTargets({ type: 'soldier', tier: 'knight' })).toEqual([FIGHTER])
    const armed = { ...city, armoryGear: { swords: 2, shields: 1 } }
    const s = movePerson(armed, { type: 'soldier', tier: 'knight' }, FIGHTER)
    expect(s.soldiers.knights).toBe(1)
    expect(s.fighters).toBe(6)
    expect(s.armoryGear).toEqual({ swords: 2, shields: 1 })
  })

  it('a trapper or ranger goes back to gathering', () => {
    expect(moveTargets({ type: 'forager', tier: 'trapper' })).toEqual([GATHERER])
    const s = movePerson(make({ foragers: foragers(0, 1, 0) }), { type: 'forager', tier: 'trapper' }, GATHERER)
    expect(s.foragers).toEqual(foragers(1, 0, 0))
  })

  it('nobody moves out of idle: rallying and training still cost', () => {
    expect(moveTargets(IDLE)).toEqual([])
    expect(movePerson(city, IDLE, FIGHTER)).toBe(city)
  })

  it('anyone can stand idle; a gatherer needs room under the cap', () => {
    expect(movePerson(city, REPAIRER, IDLE)).toMatchObject({ repairers: 1, villagers: 4 })
    const crowded = { ...city, foragers: foragers(6, 0, 0) }
    expect(moveBlock(crowded, FIGHTER, GATHERER)).toBe('full')
    expect(getReassignOptions(FIGHTER, crowded).find((o) => o.target.type === 'forager')?.atCap).toBe(true)
    expect(getReassignOptions(FIGHTER, crowded).every((o) => o.netCost === 0)).toBe(true)
  })

  it('explorers away on an expedition cannot be moved', () => {
    const out = make({ explorers: 1, activeExpeditions: [{ id: 1 } as GameState['activeExpeditions'][number]] })
    expect(moveBlock(out, { type: 'explorer' }, FIGHTER)).toBe('nobody')
  })
})

describe('the story', () => {
  it('the Keep and the Lodge come out of the fog a minute after Arm the Ranks', () => {
    const b = getBeat('the_keep_stands')!
    expect(b.trigger(make({ armoryBuilt: true }))).toBe(false)
    expect(b.trigger(make({ questsDone: ['arm_the_ranks'] }))).toBe(true)
    expect(b.dwellSec).toBe(60)
    expect(b.reveals).toEqual(['keep', 'lodge'])
  })

  it('Restore the Keep completes into the Keep scene, which turns on time away and moving people', () => {
    expect(QUESTS.find((q) => q.id === 'restore_the_keep')?.completesInto).toBe('the_keep')
    const keep = getBeat('the_keep')!
    expect(keep.trigger(make({ draconiaHallBuilt: true }))).toBe(false)
    expect(keep.trigger(make({ questsDone: ['restore_the_keep'] }))).toBe(true)
    expect(keep.unlocks).toEqual(['offline', 'reassignment'])
  })

  it('Mirael follows a minute after the Keep: Raise the Lodge, then First Trappers', () => {
    const lodge = getBeat('the_lodge')!
    expect(lodge.trigger(make({ beatsSeen: ['the_keep'] }))).toBe(true)
    expect(lodge.dwellSec).toBe(60)
    const seen = make({ beatsSeen: ['the_lodge'] })
    expect(activeQuests(seen).map((q) => q.id)).toContain('raise_the_lodge')
    expect(activeQuests(seen).map((q) => q.id)).not.toContain('first_trappers')
    const built = { ...seen, questsDone: ['raise_the_lodge' as const], foragersTrained: foragers(3, 2, 0) }
    expect(activeQuests(built).find((q) => q.id === 'first_trappers')!.goals[0].progress(built)).toBe(2)
  })
})
