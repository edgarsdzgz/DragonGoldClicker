import type { GameState } from './state'
import type { BeatId } from './story'

// =============================================================================
// GUIDED TUTORIAL (coach marks): data and pure progression
// =============================================================================

export type TutorialStepId =
  | 'tap_slay'
  | 'tap_rally'
  | 'tap_repair'
  | 'open_forage'
  | 'tap_forage'
  | 'train_gatherer'
  | 'open_draconia'
  | 'tap_garrison'
  | 'build_garrison'

/** Things only the UI knows (not saved): which tab is showing, whether a sheet is open */
export interface TutorialUi {
  focusedTab: string | null
  garrisonSheetOpen: boolean
}

export const EMPTY_TUTORIAL_UI: TutorialUi = { focusedTab: null, garrisonSheetOpen: false }

export interface TutorialStep {
  id: TutorialStepId
  /** The step may start once this beat has been seen (its scene is dismissed first) */
  afterBeat: BeatId
  /** Coach target id the control registers with */
  target: string
  hint: string
  /** The target lives inside a Modal, so the overlay renders inside that modal */
  inModal?: boolean
  /** The save already shows this step was done (also used to backfill old saves) */
  isDone: (s: GameState) => boolean
  /** Done when the UI reaches this state */
  doneUi?: (ui: TutorialUi) => boolean
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'tap_slay', afterBeat: 'prologue', target: 'slay',
    hint: 'Tap SLAY to strike the monsters.',
    isDone: (s) => s.totalClicks >= 1,
  },
  {
    id: 'tap_rally', afterBeat: 'call_to_arms', target: 'rally',
    hint: 'Rally a villager to fight beside you.',
    isDone: (s) => s.fighters >= 1 || s.fightersRallied >= 1,
  },
  {
    id: 'tap_repair', afterBeat: 'mend_the_walls', target: 'repair',
    hint: 'Send a villager to mend the wall.',
    isDone: (s) => s.repairers >= 1 || s.repairersDirected >= 1,
  },
  {
    id: 'open_forage', afterBeat: 'empty_stores', target: 'tab_forage',
    hint: 'Open the Forage tab.',
    isDone: (s) => s.forageClicks >= 1 || s.foragersTrained.gatherers >= 1,
    doneUi: (ui) => ui.focusedTab === 'ForageTab',
  },
  {
    id: 'tap_forage', afterBeat: 'empty_stores', target: 'forage',
    hint: 'Gather food for the city.',
    isDone: (s) => s.forageClicks >= 1 || s.foragersTrained.gatherers >= 1,
  },
  {
    id: 'train_gatherer', afterBeat: 'empty_stores', target: 'train',
    hint: 'Train a gatherer to forage for you.',
    isDone: (s) => s.foragers.gatherers >= 1 || s.foragersTrained.gatherers >= 1,
  },
  {
    id: 'open_draconia', afterBeat: 'a_city_to_build', target: 'tab_draconia',
    hint: 'Open the Draconia tab.',
    isDone: (s) => s.barracksLevel >= 1,
    doneUi: (ui) => ui.focusedTab === 'DraconiaTab',
  },
  {
    id: 'tap_garrison', afterBeat: 'a_city_to_build', target: 'garrison',
    hint: 'Tap the Garrison.',
    isDone: (s) => s.barracksLevel >= 1,
    doneUi: (ui) => ui.garrisonSheetOpen,
  },
  {
    id: 'build_garrison', afterBeat: 'a_city_to_build', target: 'garrison_build', inModal: true,
    hint: 'Build the Garrison.',
    isDone: (s) => s.barracksLevel >= 1,
  },
]

/**
 * The step to show now: the first one not yet done, provided its beat has been seen.
 * Steps are strictly sequential, so an unseen beat holds the tutorial back (nothing dims).
 */
export function getActiveStep(s: GameState): TutorialStep | null {
  const done = s.tutorialStepsDone ?? []
  const step = TUTORIAL_STEPS.find((t) => !done.includes(t.id))
  if (!step || !s.beatsSeen.includes(step.afterBeat)) return null
  return step
}

export function isStepComplete(step: TutorialStep, s: GameState, ui: TutorialUi): boolean {
  return step.isDone(s) || (step.doneUi?.(ui) ?? false)
}

/**
 * Backfill for saves from before the tutorial: a step is done if the save shows it (or
 * anything after it) was done. A step whose beat is unseen stays pending.
 */
export function backfillTutorial(s: GameState): string[] {
  let lastProven = -1
  TUTORIAL_STEPS.forEach((t, i) => {
    if (s.beatsSeen.includes(t.afterBeat) && t.isDone(s)) lastProven = i
  })
  return TUTORIAL_STEPS.slice(0, lastProven + 1)
    .filter((t) => s.beatsSeen.includes(t.afterBeat))
    .map((t) => t.id)
}
