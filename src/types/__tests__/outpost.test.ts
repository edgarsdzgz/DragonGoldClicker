import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import { POST_LEVELS, EXPEDITION_FOOD_COST, EXPEDITION_DURATION, EXPLORER_BASE_COST } from '../explorers'
import {
  postBlock, upgradePost, explorerCost, explorerBlock, trainExplorer, expeditionBlock, sendExpedition,
  expeditionSeconds, isExpeditionBack, claimExpedition, outpostHasAction,
} from '../outpost'
import { getBeat, STORY_BEATS } from '../story'
import { activeQuests, QUESTS } from '../quests'
import { getScene } from '../../data/story/lines'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })
const MIN = 60 * 1000
const T0 = 1_000_000
/** A save whose first expedition has already been claimed, so rolls count as rolled */
const VETERAN = { scriptedDone: ['firstExpedition'] }

describe('the Outpost', () => {
  it('costs 120, 250 and 500 for 1, 2 and 3 explorers', () => {
    expect(POST_LEVELS.map((l) => [l.cost, l.explorerCap])).toEqual([[120, 1], [250, 2], [500, 3]])
  })

  it('is raised and upgraded with renown, up to level 3', () => {
    const s = upgradePost(make({ inspiration: 130 }))
    expect(s).toMatchObject({ postLevel: 1, inspiration: 10 })
    expect(postBlock(s)).toBe('renown')
    expect(upgradePost(make({ postLevel: 1, inspiration: 300 }))).toMatchObject({ postLevel: 2, inspiration: 50 })
    expect(postBlock(make({ postLevel: 3, inspiration: 9999 }))).toBe('max')
    expect(upgradePost(make({ postLevel: 3, inspiration: 9999 })).postLevel).toBe(3)
  })
})

describe('explorers', () => {
  const post = make({ postLevel: 1, villagers: 3, inspiration: 100 })

  it('are trained from a villager: 10 renown, then more on the ^1.15 curve', () => {
    expect(EXPLORER_BASE_COST).toBe(10)
    expect(explorerCost(make({}))).toBe(10)
    expect(explorerCost(make({ explorersTrained: 1 }))).toBeGreaterThan(20)
    const s = trainExplorer(post)
    expect(s).toMatchObject({ explorers: 1, villagers: 2, inspiration: 90, explorersTrained: 1 })
  })

  it('say why not: no Outpost, no room, no villagers, short of renown', () => {
    expect(explorerBlock(make({ villagers: 3, inspiration: 100 }))).toBe('noOutpost')
    expect(explorerBlock({ ...post, explorers: 1 })).toBe('full')
    expect(explorerBlock({ ...post, villagers: 0 })).toBe('nobody')
    expect(explorerBlock({ ...post, inspiration: 9 })).toBe('renown')
    expect(trainExplorer({ ...post, inspiration: 9 })).toEqual({ ...post, inspiration: 9 })
  })
})

describe('expeditions', () => {
  const ready = make({ postLevel: 2, explorers: 2, food: 100, inspiration: 0 })

  it('cost 40 food and no renown, and take 5 minutes', () => {
    expect([EXPEDITION_FOOD_COST, EXPEDITION_DURATION]).toEqual([40, 300])
    const s = sendExpedition(ready, T0)
    expect(s.food).toBe(60)
    expect(s.inspiration).toBe(0)
    expect(s.activeExpeditions).toEqual([{ id: 1, startedAt: T0, duration: 300 }])
    expect(s.nextExpeditionId).toBe(2)
  })

  it('need a free explorer and the food', () => {
    expect(expeditionBlock(make({ food: 100 }))).toBe('noOutpost')
    const out = sendExpedition(sendExpedition(ready, T0), T0)
    expect(expeditionBlock(out)).toBe('nobody')
    expect(expeditionBlock({ ...ready, food: 39 })).toBe('food')
    expect(sendExpedition({ ...ready, food: 39 }, T0).activeExpeditions).toEqual([])
  })

  it('Cartography makes them 25% shorter', () => {
    expect(expeditionSeconds(make({ completedResearch: ['cartography'] }))).toBe(225)
    expect(sendExpedition({ ...ready, completedResearch: ['cartography'] }, T0).activeExpeditions[0].duration).toBe(225)
  })

  it('come home when their time is up, run on the clock even while away', () => {
    const e = { startedAt: T0, duration: 300 }
    expect(isExpeditionBack(e, T0 + 5 * MIN - 1)).toBe(false)
    expect(isExpeditionBack(e, T0 + 5 * MIN)).toBe(true)
  })
})

describe('bringing an expedition home', () => {
  const out = { ...sendExpedition(make({ postLevel: 1, explorers: 1, food: 100, villagers: 4 }), T0), ...VETERAN }
  const back = T0 + 5 * MIN

  it('does nothing before it is back', () => {
    expect(claimExpedition(out, 1, back - 1, 0.9)).toBe(out)
  })

  it('whoever it found joins the villagers, and the report waits in the state', () => {
    const s = claimExpedition(out, 1, back, 0.99)
    expect(s.villagers).toBe(7)
    expect(s.villagersRescued).toBe(3)
    expect(s.activeExpeditions).toEqual([])
    expect(s.expeditionReport).toEqual({ expeditionId: 1, villagersFound: 3 })
  })

  it('an empty journey counts toward the sure find; after three, the next finds someone', () => {
    const empty = claimExpedition(out, 1, back, 0)
    expect(empty.expeditionReport?.villagersFound).toBe(0)
    expect(empty.expeditionDryStreak).toBe(1)
    const unlucky = claimExpedition({ ...out, expeditionDryStreak: 3 }, 1, back, 0)
    expect(unlucky.expeditionReport?.villagersFound).toBeGreaterThan(0)
    expect(unlucky.expeditionDryStreak).toBe(0)
  })

  it('the very first journey always finds someone', () => {
    const first = claimExpedition({ ...out, scriptedDone: [] }, 1, back, 0)
    expect(first.expeditionReport?.villagersFound).toBe(1)
    expect(first.scriptedDone).toContain('firstExpedition')
  })

  it('Keen Scouts: fewer journeys come back empty (35% down to 15%)', () => {
    expect(claimExpedition(out, 1, back, 0.2).expeditionReport?.villagersFound).toBe(0)
    expect(claimExpedition({ ...out, completedResearch: ['keen_scouts'] }, 1, back, 0.2).expeditionReport?.villagersFound).toBe(1)
  })

  it('the badge lights for a journey that is back', () => {
    const idle = { ...out, inspiration: 0, food: 0 }
    expect(outpostHasAction(idle, back - 1)).toBe(false)
    expect(outpostHasAction(idle, back)).toBe(true)
    expect(outpostHasAction(make({ inspiration: 9999 }), back)).toBe(false)
  })
})

describe('the story: Beyond the Walls', () => {
  it('Mirael comes three minutes after Rodain and reveals the Outpost', () => {
    const b = getBeat('beyond_the_walls')!
    expect(b.trigger(make({ postLevel: 1 }))).toBe(false)
    expect(b.trigger(make({ beatsSeen: ['the_horde_grows'] }))).toBe(true)
    expect(b.dwellSec).toBe(180)
    expect(b.reveals).toEqual(['outpost'])
    expect(getScene('beyond_the_walls')?.lines.join(' ')).toMatch(/bring them home/)
  })

  it('Raise the Outpost, then First Expedition', () => {
    const seen = make({ beatsSeen: ['beyond_the_walls'] })
    expect(activeQuests(seen).map((q) => q.id)).toContain('raise_the_outpost')
    const built = { ...seen, postLevel: 1, questsDone: ['raise_the_outpost' as const] }
    const first = QUESTS.find((q) => q.id === 'first_expedition')!
    expect(first.goals[0].progress(built)).toBe(0)
    expect(first.goals[0].progress({ ...built, villagersRescued: 2 })).toBe(1)
  })

  it('Word Spreads and Lean Times are retired', () => {
    const ids = STORY_BEATS.map((b) => b.id as string)
    expect(ids).not.toContain('word_spreads')
    expect(ids).not.toContain('lean_times')
    expect(STORY_BEATS.some((b) => b.side)).toBe(false)
  })
})
