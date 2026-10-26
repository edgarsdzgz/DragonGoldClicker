import type { GameState } from './state'
import type { BeatId } from './story'
import { roundInsp } from './utils'

// =============================================================================
// QUESTS: the guided path through the game and the story
// =============================================================================
// One quest at a time shows on the objective line (its next unfinished goal). A quest is offered
// when its condition holds (usually a story beat seen or the previous quest done), completes when
// all its goals are met, pays its reward, and either hands off to a story beat (whose scene does
// the congratulating) or shows a "Quest complete" toast. Daily and weekly quests will use the same
// shape later.

export type QuestId = 'defend_the_wall' | 'raise_the_guard' | 'hold_the_line' | 'fill_the_stores' | 'mend_the_walls' | 'sharpen_your_claws' | 'open_the_gates' | 'raise_the_garrison' | 'first_soldiers' | 'light_the_forge' | 'arm_the_ranks' | 'restore_the_keep' | 'raise_the_lodge' | 'first_trappers'

export interface QuestGoal {
  /** What to do, shown on the objective line: "Defeat 4 kobolds" */
  label: string
  target: number
  progress: (s: GameState) => number
}

export interface QuestDef {
  id: QuestId
  /** "Defend the Wall" */
  title: string
  /** Every goal must be met; they can be done in any order */
  goals: QuestGoal[]
  /** The quest is offered once this holds */
  offeredWhen: (s: GameState) => boolean
  /** Paid once, on completion. Provisional: tougher monsters later balance a generous start. */
  reward?: { renown: number }
  /** The story beat that follows; its scene congratulates the player, so no toast is shown */
  completesInto?: BeatId
}

/** Kills that complete the first quest: four kobolds pay 1.00 renown, the first Rally's cost */
export const DEFEND_THE_WALL_KILLS = 4

/** Food the player must gather by hand to fill the stores */
export const FILL_THE_STORES_FOOD = 200

/** Repairers the player directs to the wall (core-tap layer 6) */
export const MEND_THE_WALLS_REPAIRERS = 3

/** Newcomers the player takes in from the road (chapter 4) */
export const OPEN_THE_GATES_PEOPLE = 3

/** Conscripts the player trains from fighters at the new Garrison (chapter 5) */
export const FIRST_SOLDIERS_CONSCRIPTS = 2

/** Swords the player has Kael forge for the soldiers (chapter 5 phase B) */
export const ARM_THE_RANKS_SWORDS = 2

/** Gatherers the player promotes to trappers at the new Lodge (chapter 5 phase C) */
export const FIRST_TRAPPERS = 2

const done = (s: GameState, id: QuestId) => s.questsDone.includes(id)

export const QUESTS: QuestDef[] = [
  {
    id: 'defend_the_wall', title: 'Defend the Wall',
    goals: [{ label: 'Defeat 4 kobolds', target: DEFEND_THE_WALL_KILLS, progress: (s) => s.killsByMonster.kobold ?? 0 }],
    // Offered once the renown scene after the first kill has been seen
    offeredWhen: (s) => s.beatsSeen.includes('first_renown'),
    completesInto: 'call_to_arms',
  },
  {
    id: 'raise_the_guard', title: 'Raise the Guard',
    goals: [{ label: 'Rally 2 fighters', target: 2, progress: (s) => s.fightersRallied }],
    offeredWhen: (s) => s.beatsSeen.includes('call_to_arms'),
    reward: { renown: 1 },
  },
  {
    id: 'hold_the_line', title: 'Hold the Line',
    goals: [
      { label: 'Rally 5 fighters', target: 5, progress: (s) => s.fightersRallied },
      { label: 'Defeat a Shadow Crawler', target: 1, progress: (s) => s.killsByMonster.shadow_crawler ?? 0 },
    ],
    offeredWhen: (s) => done(s, 'raise_the_guard'),
    completesInto: 'empty_stores',
  },
  {
    // Counts only the FORAGE button: gatherers may be trained, but the stores are filled by hand
    id: 'fill_the_stores', title: 'Fill the Stores',
    goals: [{ label: 'Gather 200 food by hand', target: FILL_THE_STORES_FOOD, progress: (s) => s.foodGatheredByHand }],
    offeredWhen: (s) => s.beatsSeen.includes('empty_stores'),
  },
  {
    id: 'mend_the_walls', title: 'Mend the Walls',
    goals: [{ label: 'Direct 3 repairers', target: MEND_THE_WALLS_REPAIRERS, progress: (s) => s.repairersDirected }],
    offeredWhen: (s) => s.beatsSeen.includes('mend_the_walls'),
    completesInto: 'the_wall_is_yours',
  },
  {
    id: 'sharpen_your_claws', title: 'Sharpen Your Claws',
    goals: [{ label: 'Sharpen your claws', target: 1, progress: (s) => s.clawLevel }],
    offeredWhen: (s) => s.beatsSeen.includes('sharpen_claws'),
  },
  {
    id: 'open_the_gates', title: 'Open the Gates',
    goals: [{ label: 'Welcome 3 newcomers', target: OPEN_THE_GATES_PEOPLE, progress: (s) => s.wanderersWelcomed }],
    offeredWhen: (s) => s.beatsSeen.includes('strangers_at_gate'),
  },
  {
    id: 'raise_the_garrison', title: 'Raise the Garrison',
    goals: [{ label: 'Build the Garrison', target: 1, progress: (s) => s.barracksLevel }],
    offeredWhen: (s) => s.beatsSeen.includes('a_city_to_build'),
  },
  {
    id: 'first_soldiers', title: 'First Soldiers',
    goals: [{ label: 'Train 2 conscripts', target: FIRST_SOLDIERS_CONSCRIPTS, progress: (s) => s.soldiersTrained.conscripts }],
    offeredWhen: (s) => done(s, 'raise_the_garrison'),
  },
  {
    id: 'light_the_forge', title: 'Light the Forge',
    goals: [{ label: 'Build the Forge', target: 1, progress: (s) => (s.armoryBuilt ? 1 : 0) }],
    offeredWhen: (s) => s.beatsSeen.includes('the_smith'),
  },
  {
    id: 'arm_the_ranks', title: 'Arm the Ranks',
    goals: [{ label: 'Forge 2 swords', target: ARM_THE_RANKS_SWORDS, progress: (s) => s.armoryGear.swords }],
    offeredWhen: (s) => done(s, 'light_the_forge'),
  },
  {
    id: 'restore_the_keep', title: 'Restore the Keep',
    goals: [{ label: 'Restore the Keep', target: 1, progress: (s) => (s.draconiaHallBuilt ? 1 : 0) }],
    offeredWhen: (s) => s.beatsSeen.includes('the_keep_stands'),
    completesInto: 'the_keep',
  },
  {
    id: 'raise_the_lodge', title: 'Raise the Lodge',
    goals: [{ label: "Build the Ranger's Lodge", target: 1, progress: (s) => s.lodgeLevel }],
    offeredWhen: (s) => s.beatsSeen.includes('the_lodge'),
  },
  {
    id: 'first_trappers', title: 'First Trappers',
    goals: [{ label: 'Promote 2 gatherers to trappers', target: FIRST_TRAPPERS, progress: (s) => s.foragersTrained.trappers }],
    offeredWhen: (s) => done(s, 'raise_the_lodge'),
  },
]

export function isQuestDone(s: Pick<GameState, 'questsDone'>, id: QuestId): boolean {
  return s.questsDone.includes(id)
}

/** Progress for display, capped at the target */
export function goalProgress(g: QuestGoal, s: GameState): number {
  return Math.min(g.target, Math.max(0, Math.floor(g.progress(s))))
}

export function isGoalMet(g: QuestGoal, s: GameState): boolean {
  return g.progress(s) >= g.target
}

/** All of the quest's goals are met */
export function isQuestMet(q: QuestDef, s: GameState): boolean {
  return q.goals.every((g) => isGoalMet(g, s))
}

/** The goal the objective line shows: the first one not yet met (the last one if all are) */
export function currentGoal(q: QuestDef, s: GameState): QuestGoal {
  return q.goals.find((g) => !isGoalMet(g, s)) ?? q.goals[q.goals.length - 1]
}

/** Quests offered and not yet done, in order */
export function activeQuests(s: GameState): QuestDef[] {
  return QUESTS.filter((q) => !isQuestDone(s, q.id) && q.offeredWhen(s))
}

/** The quest the objective line shows */
export function currentQuest(s: GameState): QuestDef | null {
  return activeQuests(s)[0] ?? null
}

/** Whether any active quest has met all its goals (cheap check before completing) */
export function hasQuestToComplete(s: GameState): boolean {
  return activeQuests(s).some((q) => isQuestMet(q, s))
}

/** Mark every active quest whose goals are all met as done and pay its reward */
export function completeQuests(s: GameState): { state: GameState; completed: QuestDef[] } {
  const completed = activeQuests(s).filter((q) => isQuestMet(q, s))
  if (completed.length === 0) return { state: s, completed }
  const renown = completed.reduce((sum, q) => sum + (q.reward?.renown ?? 0), 0)
  return {
    state: {
      ...s,
      questsDone: [...s.questsDone, ...completed.map((q) => q.id)],
      inspiration: roundInsp(s.inspiration + renown),
      totalInspirationEarned: roundInsp(s.totalInspirationEarned + renown),
    },
    completed,
  }
}

/** "Quest complete: Raise the Guard, +1.00 renown" */
export function questCompleteText(q: QuestDef): string {
  return q.reward ? `Quest complete: ${q.title}, +${q.reward.renown.toFixed(2)} renown` : `Quest complete: ${q.title}`
}
