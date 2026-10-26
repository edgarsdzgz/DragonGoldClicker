import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import {
  QUESTS, activeQuests, currentQuest, currentGoal, completeQuests, hasQuestToComplete, goalProgress, questCompleteText,
  DEFEND_THE_WALL_KILLS, FILL_THE_STORES_FOOD,
} from '../quests'
import { getFighterCost } from '../fighters'
import { MONSTERS } from '../monsters'
import { SCENES } from '../../data/story/lines'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })
const AFTER_RENOWN = ['prologue', 'elder_approaches', 'first_renown']

describe('the quest line', () => {
  it('runs Defend the Wall, Raise the Guard, Hold the Line, Fill the Stores, Mend the Walls, Sharpen Your Claws, Open the Gates, Raise the Garrison, First Soldiers, Light the Forge, Arm the Ranks, Restore the Keep, Raise the Lodge, First Trappers', () => {
    expect(QUESTS.map((q) => [q.id, q.title, q.goals.map((g) => g.label)])).toEqual([
      ['defend_the_wall', 'Defend the Wall', ['Defeat 4 kobolds']],
      ['raise_the_guard', 'Raise the Guard', ['Rally 2 fighters']],
      ['hold_the_line', 'Hold the Line', ['Rally 5 fighters', 'Defeat a Shadow Crawler']],
      ['fill_the_stores', 'Fill the Stores', ['Gather 200 food by hand']],
      ['mend_the_walls', 'Mend the Walls', ['Direct 3 repairers']],
      ['sharpen_your_claws', 'Sharpen Your Claws', ['Sharpen your claws']],
      ['open_the_gates', 'Open the Gates', ['Welcome 3 newcomers']],
      ['raise_the_garrison', 'Raise the Garrison', ['Build the Garrison']],
      ['first_soldiers', 'First Soldiers', ['Train 2 conscripts']],
      ['light_the_forge', 'Light the Forge', ['Build the Forge']],
      ['arm_the_ranks', 'Arm the Ranks', ['Forge 2 swords']],
      ['restore_the_keep', 'Restore the Keep', ['Restore the Keep']],
      ['raise_the_lodge', 'Raise the Lodge', ["Build the Ranger's Lodge"]],
      ['first_trappers', 'First Trappers', ['Promote 2 gatherers to trappers']],
    ])
  })

  it('offers nothing until the renown scene after the first kill', () => {
    expect(currentQuest(make({ beatsSeen: ['prologue', 'elder_approaches'], monstersDefeated: 1 }))).toBeNull()
    expect(currentQuest(make({ beatsSeen: AFTER_RENOWN, monstersDefeated: 1 }))?.id).toBe('defend_the_wall')
  })

  it('four kobolds are exactly the first Rally, and are all kobolds', () => {
    expect(DEFEND_THE_WALL_KILLS * MONSTERS[0].bounty).toBe(getFighterCost(0))
    expect(MONSTERS[1].fromKills).toBeGreaterThan(DEFEND_THE_WALL_KILLS)
  })

  it('shows progress capped at the target', () => {
    const g = QUESTS[0].goals[0]
    expect(goalProgress(g, make({ killsByMonster: { kobold: 2 } }))).toBe(2)
    expect(goalProgress(g, make({ killsByMonster: { kobold: 9 } }))).toBe(4)
    // Only kobolds count
    expect(goalProgress(g, make({ monstersDefeated: 9, killsByMonster: { kobold: 3, goblin: 6 } }))).toBe(3)
  })
})

describe('completing quests', () => {
  it('completes Defend the Wall at the fourth kill, with no reward of its own (Rally is the reward)', () => {
    const three = make({ beatsSeen: AFTER_RENOWN, monstersDefeated: 3, killsByMonster: { kobold: 3 }, inspiration: 0.75 })
    expect(hasQuestToComplete(three)).toBe(false)
    expect(completeQuests(three).state).toBe(three)

    const four = { ...three, monstersDefeated: 4, killsByMonster: { kobold: 4 }, inspiration: 1 }
    expect(hasQuestToComplete(four)).toBe(true)
    const r = completeQuests(four)
    expect(r.completed.map((q) => q.id)).toEqual(['defend_the_wall'])
    expect(r.state.questsDone).toEqual(['defend_the_wall'])
    expect(r.state.inspiration).toBe(1)
    // Done once: completing again changes nothing
    expect(completeQuests(r.state).state).toBe(r.state)
  })

  it('Raise the Guard pays its renown reward once', () => {
    const s = make({ beatsSeen: [...AFTER_RENOWN, 'call_to_arms'], questsDone: ['defend_the_wall'], fightersRallied: 2, inspiration: 0.5, totalInspirationEarned: 5 })
    const r = completeQuests(s)
    expect(r.completed.map((q) => q.id)).toEqual(['raise_the_guard'])
    expect(r.state.inspiration).toBe(1.5)
    expect(r.state.totalInspirationEarned).toBe(6)
    expect(completeQuests(r.state).state.inspiration).toBe(1.5)
  })

  it('a quest not yet offered never completes, even if its goal is already met', () => {
    const s = make({ beatsSeen: ['prologue', 'elder_approaches'], monstersDefeated: 9 })
    expect(activeQuests(s)).toEqual([])
    expect(hasQuestToComplete(s)).toBe(false)
  })

  it('a quest that hands off to a scene gets no toast text reward; one with a reward says it', () => {
    expect(QUESTS[0].completesInto).toBe('call_to_arms')
    expect(questCompleteText(QUESTS[1])).toBe('Quest complete: Raise the Guard, +1.00 renown')
  })
})

describe('the scene that follows Defend the Wall', () => {
  const lines = SCENES.call_to_arms!.lines.join(' ')

  it('congratulates the player on defending the wall', () => {
    expect(lines).toMatch(/wall holds/i)
  })

  it('explains fighters: recruited with renown, fight at the gate, their kills add to your renown', () => {
    expect(lines).toMatch(/renown is now enough/i)
    expect(lines).toMatch(/at the gate/i)
    expect(lines).toMatch(/adds to your renown/i)
  })
})

describe('Hold the Line: two goals', () => {
  const offered = make({ beatsSeen: [...AFTER_RENOWN, 'call_to_arms'], questsDone: ['defend_the_wall', 'raise_the_guard'] })

  it('is offered once Raise the Guard is done', () => {
    expect(currentQuest(offered)?.id).toBe('hold_the_line')
    expect(currentQuest({ ...offered, questsDone: ['defend_the_wall'] })?.id).toBe('raise_the_guard')
  })

  it('shows the next unfinished goal, in either order', () => {
    const q = QUESTS[2]
    expect(currentGoal(q, { ...offered, fightersRallied: 3 }).label).toBe('Rally 5 fighters')
    expect(currentGoal(q, { ...offered, fightersRallied: 5 }).label).toBe('Defeat a Shadow Crawler')
  })

  it('completes only when both are met, into the food scene', () => {
    expect(hasQuestToComplete({ ...offered, fightersRallied: 5 })).toBe(false)
    expect(hasQuestToComplete({ ...offered, killsByMonster: { shadow_crawler: 1 } })).toBe(false)
    const r = completeQuests({ ...offered, fightersRallied: 5, killsByMonster: { shadow_crawler: 1 } })
    expect(r.completed.map((q) => q.id)).toEqual(['hold_the_line'])
    expect(QUESTS[2].completesInto).toBe('empty_stores')
  })
})

describe('Fill the Stores: food gathered by hand', () => {
  const offered = make({ beatsSeen: [...AFTER_RENOWN, 'call_to_arms', 'empty_stores'], questsDone: ['defend_the_wall', 'raise_the_guard', 'hold_the_line'] })

  it('is offered with the food scene and counts only the FORAGE button', () => {
    expect(currentQuest(offered)?.id).toBe('fill_the_stores')
    expect(FILL_THE_STORES_FOOD).toBe(200)
    // Food from gatherers (totalFoodForaged) does not count
    expect(hasQuestToComplete({ ...offered, totalFoodForaged: 500, foodGatheredByHand: 199 })).toBe(false)
    expect(completeQuests({ ...offered, foodGatheredByHand: 200 }).completed.map((q) => q.id)).toEqual(['fill_the_stores'])
  })
})

describe('Mend the Walls (layer 6)', () => {
  const BEFORE = [...AFTER_RENOWN, 'call_to_arms', 'empty_stores', 'the_breach']
  const DONE = ['defend_the_wall', 'raise_the_guard', 'hold_the_line', 'fill_the_stores'] as const

  it('is offered once the mend_the_walls beat is seen, and completes at the third repairer directed', () => {
    expect(currentQuest(make({ beatsSeen: BEFORE, questsDone: [...DONE] }))).toBeNull()
    const offered = make({ beatsSeen: [...BEFORE, 'mend_the_walls'], questsDone: [...DONE], repairersDirected: 2 })
    expect(currentQuest(offered)?.id).toBe('mend_the_walls')
    expect(hasQuestToComplete(offered)).toBe(false)
    expect(completeQuests({ ...offered, repairersDirected: 3 }).completed.map((q) => q.id)).toEqual(['mend_the_walls'])
  })
})
