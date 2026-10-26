import { DEFAULT_GAME_STATE } from '../state'
import type { GameState } from '../state'
import {
  QUESTS, activeQuests, currentQuest, completeQuests, hasQuestToComplete, questProgress, questCompleteText,
  DEFEND_THE_WALL_KILLS,
} from '../quests'
import { getFighterCost } from '../fighters'
import { MONSTERS } from '../monsters'
import { SCENES } from '../../data/story/lines'

const make = (over: Partial<GameState>): GameState => ({ ...DEFAULT_GAME_STATE, ...over })
const AFTER_RENOWN = ['prologue', 'elder_approaches', 'first_renown']

describe('the quest line', () => {
  it('starts with Defend the Wall, then Raise the Guard', () => {
    expect(QUESTS.map((q) => [q.id, q.title, q.goal])).toEqual([
      ['defend_the_wall', 'Defend the Wall', 'Defeat 4 kobolds'],
      ['raise_the_guard', 'Raise the Guard', 'Rally 2 fighters'],
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
    const q = QUESTS[0]
    expect(questProgress(q, make({ killsByMonster: { kobold: 2 } }))).toBe(2)
    expect(questProgress(q, make({ killsByMonster: { kobold: 9 } }))).toBe(4)
    // Only kobolds count
    expect(questProgress(q, make({ monstersDefeated: 9, killsByMonster: { kobold: 3, goblin: 6 } }))).toBe(3)
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
