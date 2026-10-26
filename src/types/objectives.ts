import type { GameState } from './state'
import type { SpotlightTarget } from './story'
import { STORY_BEATS } from './story'
import { getActiveStep, TUTORIAL_STEPS } from './tutorial'
import { currentQuest, questProgress } from './quests'

// =============================================================================
// LIGHTER GUIDANCE: the objective line and the spotlight ring (pure selection)
// =============================================================================

export interface CurrentObjective {
  label: string
  current: number
  target: number
}

/**
 * The current quest's goal; failing that, the objective of the most recently seen beat whose
 * objective is not yet met (beats not yet turned into quests). Null when there is none, or
 * while a guided tutorial step is active (the coach mark already says what to do).
 */
export function getCurrentObjective(s: GameState): CurrentObjective | null {
  if (getActiveStep(s)) return null
  const quest = currentQuest(s)
  if (quest) return { label: quest.goal, current: questProgress(quest, s), target: quest.target }
  for (let i = s.beatsSeen.length - 1; i >= 0; i--) {
    const beat = STORY_BEATS.find((b) => b.id === s.beatsSeen[i])
    if (!beat?.objective) continue
    const current = beat.objective.current(s)
    if (current < beat.objective.target) {
      return { label: beat.objective.label, current, target: beat.objective.target }
    }
  }
  return null
}

/** The coach target id each spotlight target corresponds to */
const SPOTLIGHT_COACH_ID: Record<SpotlightTarget, string> = {
  rally: 'rally',
  repair: 'repair',
  forageTab: 'tab_forage',
  draconiaTab: 'tab_draconia',
}

export const spotlightKey = (target: SpotlightTarget) => `spotlight:${target}`

/**
 * Whether the light spotlight ring should show on a control. It is for beats that point
 * at a control but have no guided step; a guided step already covers the rest. It clears
 * on the control's first press (recorded in tutorialStepsDone).
 */
export function isSpotlightActive(s: GameState, target: SpotlightTarget): boolean {
  if (TUTORIAL_STEPS.some((t) => t.target === SPOTLIGHT_COACH_ID[target])) return false
  if ((s.tutorialStepsDone ?? []).includes(spotlightKey(target))) return false
  if (getActiveStep(s)) return false
  return STORY_BEATS.some((b) => b.spotlight === target && s.beatsSeen.includes(b.id))
}
