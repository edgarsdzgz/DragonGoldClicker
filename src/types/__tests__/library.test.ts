import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { RESEARCH_NODES, RESEARCH_CATEGORIES, LIBRARIUM_COST, getResearchBonuses, getNodesByCategory } from '../research'
import { buildLibrarium, researchBlock, study, studiesDone, canStudyAny } from '../library'
import { RATIONS } from '../rations'
import { tapDamageNow, tapHit, rollsDouble } from '../claws'
import { strike } from '../monsters'
import { swordBonusNow } from '../forge'
import { armyVolleyDamage } from '../army'
import { gatherMultiplier } from '../foodEvents'
import { repairRateNow } from '../siege'
import { resolveBreach } from '../breach'
import { wallWhileAway } from '../timeAway'
import { getBeat } from '../story'
import { activeQuests, QUESTS } from '../quests'
import { getScene } from '../../data/story/lines'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })
const studied = (...ids: string[]) => make({ completedResearch: ids })
const NONE = make({})

describe("the Librarium's tree", () => {
  it('four branches of three or four studies, 50 to 400 renown', () => {
    expect(RESEARCH_CATEGORIES.map((c) => [c.id, getNodesByCategory(c.id).map((n) => [n.id, n.cost])])).toEqual([
      ['dragon', [['dragon_anatomy', 60], ['weak_points', 150], ['wyrms_fury', 400]]],
      ['army', [['drill_tactics', 60], ['tempered_steel', 150], ['battle_drill', 400]]],
      ['stores', [['rationing', 50], ['lean_rations', 80], ['snares_and_nets', 150], ['feast_hall', 300]]],
      ['wall', [['mortar_craft', 60], ['night_ledgers', 150], ['evacuation_drills', 400]]],
    ])
  })

  it('each study after the first needs the one before it', () => {
    for (const c of RESEARCH_CATEGORIES) {
      getNodesByCategory(c.id).forEach((n, i, chain) => {
        if (i > 0) expect(n.prereqs).toContainEqual({ type: 'research', id: chain[i - 1].id })
      })
    }
  })

  it('the ration unlocks still name real studies', () => {
    for (const r of RATIONS) if (r.research) expect(RESEARCH_NODES.map((n) => n.id)).toContain(r.research)
  })

  it('a study of the old tree is ignored', () => {
    expect(getResearchBonuses(['keen_eye', 'golden_harvest'])).toEqual(getResearchBonuses([]))
    expect(studiesDone(studied('keen_eye', 'mortar_craft'))).toBe(1)
  })
})

describe('building the Librarium and studying', () => {
  const library = make({ librariumBuilt: true, inspiration: 1000 })

  it('the Librarium costs 200 renown', () => {
    expect(LIBRARIUM_COST).toBe(200)
    expect(buildLibrarium(make({ inspiration: 199 })).librariumBuilt).toBe(false)
    expect(buildLibrarium(make({ inspiration: 250 }))).toMatchObject({ librariumBuilt: true, inspiration: 50 })
  })

  it('a study takes renown and is done at once', () => {
    const s = study(library, 'mortar_craft')
    expect(s.completedResearch).toEqual(['mortar_craft'])
    expect(s.inspiration).toBe(940)
    expect(researchBlock(s, 'mortar_craft')).toBe('done')
    expect(study(s, 'mortar_craft')).toBe(s)
  })

  it('says why not: no Librarium, the study before, the building, short of renown', () => {
    expect(researchBlock(make({ inspiration: 1000 }), 'mortar_craft')).toBe('noLibrary')
    expect(researchBlock(library, 'weak_points')).toBe('locked')
    expect(researchBlock(library, 'drill_tactics')).toBe('locked')
    expect(researchBlock({ ...library, barracksLevel: 1 }, 'drill_tactics')).toBeNull()
    expect(researchBlock({ ...library, completedResearch: ['mortar_craft'] }, 'night_ledgers')).toBe('locked')
    expect(researchBlock({ ...library, completedResearch: ['mortar_craft'], draconiaHallBuilt: true }, 'night_ledgers')).toBeNull()
    expect(researchBlock({ ...library, inspiration: 59 }, 'dragon_anatomy')).toBe('renown')
    expect(study({ ...library, inspiration: 59 }, 'dragon_anatomy').completedResearch).toEqual([])
  })

  it('the badge lights only when a study can be bought', () => {
    expect(canStudyAny(make({ inspiration: 1000 }))).toBe(false)
    expect(canStudyAny(library)).toBe(true)
    expect(canStudyAny({ ...library, inspiration: 10 })).toBe(false)
  })
})

describe('what each study does', () => {
  it('Dragon Anatomy and Wyrm\'s Fury: taps deal 10%, then 30% more', () => {
    const claws = { tapDamage: 20 }
    expect(tapDamageNow({ ...NONE, ...claws })).toBe(20)
    expect(tapDamageNow({ ...studied('dragon_anatomy'), ...claws })).toBe(22)
    expect(tapDamageNow({ ...studied('dragon_anatomy', 'weak_points', 'wyrms_fury'), ...claws })).toBe(26)
    // A plain tap uses it too
    expect(strike({ ...studied('dragon_anatomy'), ...claws, monsterHp: 100 }).dealt).toBe(22)
  })

  it('Weak Points: one tap in ten strikes for double', () => {
    expect(rollsDouble(NONE, 0)).toBe(false)
    const s = { ...studied('dragon_anatomy', 'weak_points'), tapDamage: 10 }
    expect(rollsDouble(s, 0.09)).toBe(true)
    expect(rollsDouble(s, 0.1)).toBe(false)
    expect(tapHit(s, true)).toBe(22)
    expect(tapHit(s, false)).toBe(11)
  })

  it('Tempered Steel: an armed soldier hits 75% harder', () => {
    expect(swordBonusNow(NONE)).toBe(0.5)
    expect(swordBonusNow(studied('tempered_steel'))).toBe(0.75)
    const army = { fighters: 0, soldiers: { conscripts: 0, footmen: 0, knights: 2 }, armoryGear: { swords: 2, shields: 0 } }
    expect(armyVolleyDamage({ ...army, completedResearch: [] })).toBe(6)
    expect(armyVolleyDamage({ ...army, completedResearch: ['tempered_steel'] })).toBe(7)
  })

  it('Battle Drill: the volley deals 10% more', () => {
    const army = { fighters: 10, soldiers: { conscripts: 0, footmen: 0, knights: 0 }, armoryGear: { swords: 0, shields: 0 } }
    const plain = armyVolleyDamage({ ...army, completedResearch: [] })
    expect(armyVolleyDamage({ ...army, completedResearch: ['battle_drill'] })).toBeCloseTo(plain * 1.1)
  })

  it('Snares and Nets: foragers bring 25% more food, on top of the season', () => {
    expect(gatherMultiplier(NONE)).toBe(1)
    expect(gatherMultiplier(studied('snares_and_nets'))).toBe(1.25)
  })

  it('Mortar Craft: repairers mend 25% faster, at the Gate and while away', () => {
    expect(repairRateNow(make({ repairers: 4 }))).toBe(2)
    expect(repairRateNow(make({ repairers: 4, completedResearch: ['mortar_craft'] }))).toBe(2.5)
    const away = { beatsSeen: ['prologue', 'elder_approaches', 'first_renown', 'call_to_arms', 'empty_stores', 'the_breach'], hordeKills: 60, cityHp: 60, repairers: 1 }
    const plain = wallWhileAway(make(away), 10)!.hpAfter
    expect(wallWhileAway(make({ ...away, completedResearch: ['mortar_craft'] }), 10)!.hpAfter).toBeGreaterThan(plain)
  })

  it('Evacuation Drills: a Breach takes a third fewer people', () => {
    const city = { fighters: 10, repairers: 10, villagers: 20, foragers: { gatherers: 20, trappers: 0, rangers: 0 }, hordeKills: 100 }
    const plain = resolveBreach(make(city), 0)
    const drilled = resolveBreach(make({ ...city, completedResearch: ['evacuation_drills'] }), 0)
    expect([plain.fighters, plain.repairers, plain.villagers, plain.foragers.gatherers]).toEqual([7, 7, 14, 17])
    expect([drilled.fighters, drilled.repairers, drilled.villagers, drilled.foragers.gatherers]).toEqual([8, 8, 16, 18])
  })
})

describe('the story', () => {
  it('Lirae arrives a minute after First Trappers: Raise the Librarium, then First Study', () => {
    const b = getBeat('the_scholar')!
    expect(b.trigger(make({ beatsSeen: ['the_lodge'] }))).toBe(false)
    expect(b.trigger(make({ questsDone: ['first_trappers'] }))).toBe(true)
    expect(b.dwellSec).toBe(60)
    expect(b.reveals).toEqual(['librarium'])
    const seen = make({ beatsSeen: ['the_scholar'] })
    expect(activeQuests(seen).map((q) => q.id)).toContain('raise_the_librarium')
    const built = { ...seen, librariumBuilt: true, questsDone: ['raise_the_librarium' as const], completedResearch: ['keen_eye'] }
    const first = QUESTS.find((q) => q.id === 'first_study')!
    expect(first.goals[0].progress(built)).toBe(0)
    expect(first.goals[0].progress({ ...built, completedResearch: ['mortar_craft'] })).toBe(1)
  })

  it('Rodain says the horde grows a minute after the first study, in new words', () => {
    const b = getBeat('the_horde_grows')!
    expect(b.trigger(make({ completedResearch: ['mortar_craft'] }))).toBe(false)
    expect(b.trigger(make({ questsDone: ['first_study'] }))).toBe(true)
    expect(b.dwellSec).toBe(60)
    expect(getScene('the_horde_grows')?.lines.join(' ')).toMatch(/bigger/)
  })
})
