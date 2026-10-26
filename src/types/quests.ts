import type { GameState } from './state'
import type { BeatId } from './story'
import { roundInsp } from './utils'

// =============================================================================
// QUESTS: the guided path through the game and the story
// =============================================================================
// One quest at a time shows on the objective line. A quest is offered when its condition holds
// (usually a story beat seen), completes when its goal is met, pays its reward, and either hands
// off to a story beat (whose scene does the congratulating) or shows a "Quest complete" toast.
// Daily and weekly quests will use the same shape later.

export type QuestId = 'defend_the_wall' | 'raise_the_guard'

export interface QuestDef {
  id: QuestId
  /** "Defend the Wall" */
  title: string
  /** What to do, shown on the objective line: "Defeat 4 kobolds" */
  goal: string
  target: number
  progress: (s: GameState) => number
  /** The quest is offered once this holds */
  offeredWhen: (s: GameState) => boolean
  /** Paid once, on completion. Provisional: tougher monsters later balance a generous start. */
  reward?: { renown: number }
  /** The story beat that follows; its scene congratulates the player, so no toast is shown */
  completesInto?: BeatId
}

/** Kills that complete the first quest: four kobolds pay 1.00 renown, the first Rally's cost */
export const DEFEND_THE_WALL_KILLS = 4

export const QUESTS: QuestDef[] = [
  {
    id: 'defend_the_wall', title: 'Defend the Wall', goal: 'Defeat 4 kobolds',
    target: DEFEND_THE_WALL_KILLS,
    progress: (s) => s.monstersDefeated,
    // Offered once the renown scene after the first kill has been seen
    offeredWhen: (s) => s.beatsSeen.includes('first_renown'),
    completesInto: 'call_to_arms',
  },
  {
    id: 'raise_the_guard', title: 'Raise the Guard', goal: 'Rally 2 fighters',
    target: 2,
    progress: (s) => s.fightersRallied,
    offeredWhen: (s) => s.beatsSeen.includes('call_to_arms'),
    reward: { renown: 1 },
  },
]

export function isQuestDone(s: Pick<GameState, 'questsDone'>, id: QuestId): boolean {
  return s.questsDone.includes(id)
}

/** Quests offered and not yet done, in order */
export function activeQuests(s: GameState): QuestDef[] {
  return QUESTS.filter((q) => !isQuestDone(s, q.id) && q.offeredWhen(s))
}

/** The quest the objective line shows */
export function currentQuest(s: GameState): QuestDef | null {
  return activeQuests(s)[0] ?? null
}

/** Progress for display, capped at the target */
export function questProgress(q: QuestDef, s: GameState): number {
  return Math.min(q.target, Math.max(0, Math.floor(q.progress(s))))
}

/** Whether any active quest has met its goal (cheap check before completing) */
export function hasQuestToComplete(s: GameState): boolean {
  return activeQuests(s).some((q) => q.progress(s) >= q.target)
}

/** Mark every active quest whose goal is met as done and pay its reward */
export function completeQuests(s: GameState): { state: GameState; completed: QuestDef[] } {
  const completed = activeQuests(s).filter((q) => q.progress(s) >= q.target)
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
