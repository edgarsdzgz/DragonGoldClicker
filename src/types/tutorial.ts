import type { GameState } from './state'
import type { BeatId } from './story'
import { getFighterCost, getRepairerCost } from './fighters'
import { FORAGER_TIERS, getForagerCost, getForagerCount } from './foragers'
import { BARRACKS_LEVELS } from './soldiers'

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
  /** The step is held back (nothing dims) until this holds, e.g. a monster is on the field */
  requires?: (s: GameState) => boolean
  /** The save already shows this step was done (also used to backfill old saves) */
  isDone: (s: GameState) => boolean
  /** Done when the UI reaches this state */
  doneUi?: (ui: TutorialUi) => boolean
  /** Inspiration this step's target spends (spend steps only) */
  cost?: (s: GameState) => number
}

/** Shown when a spend step is unaffordable and SLAY is on screen */
export const HINT_SLAY_TO_AFFORD = 'Slay monsters until you can afford this.'
/** Shown when a spend step is unaffordable and SLAY is not on screen */
export const HINT_RETURN_TO_SLAY = 'Return to the Warfront and slay monsters to afford this.'

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    // The monster is at the gate from the start (waves are in cold storage, so no Begin wave step)
    id: 'tap_slay', afterBeat: 'elder_approaches', target: 'slay',
    hint: 'Tap the kobold to strike it.',
    isDone: (s) => s.totalClicks >= 1,
  },
  {
    id: 'tap_rally', afterBeat: 'call_to_arms', target: 'rally',
    hint: 'Rally a villager to fight beside you.',
    isDone: (s) => s.fighters >= 1 || s.fightersRallied >= 1,
    cost: (s) => getFighterCost(s.fightersRallied),
  },
  {
    id: 'tap_repair', afterBeat: 'mend_the_walls', target: 'repair',
    hint: 'Send a villager to mend the wall.',
    isDone: (s) => s.repairers >= 1 || s.repairersDirected >= 1,
    cost: (s) => getRepairerCost(s.repairersDirected),
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
    cost: (s) => getForagerCost(FORAGER_TIERS[0], getForagerCount(s.foragersTrained, 'gatherer')),
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
    cost: () => BARRACKS_LEVELS[0].cost,
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
  if (step.requires && !step.requires(s)) return null
  return step
}

/** A spend step whose target costs more inspiration than the player has */
export function needsMoreInspiration(step: TutorialStep, s: GameState): boolean {
  return step.cost !== undefined && s.inspiration < step.cost(s)
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
