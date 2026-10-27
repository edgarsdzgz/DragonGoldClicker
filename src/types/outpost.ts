import type { GameState } from './state'
import {
  POST_LEVELS,
  EXPLORER_BASE_COST,
  EXPEDITION_FOOD_COST,
  EXPEDITION_DURATION,
  EXPEDITION_PITY_THRESHOLD,
  getExplorerCap,
  getPostUpgradeCost,
  rollExpeditionReward,
} from './explorers'
import { getResearchBonuses } from './research'
import { firstExpeditionReward } from './scripted'
import { roundCost, roundInsp } from './utils'

// =============================================================================
// THE OUTPOST'S RULES (chapter 7, Beyond the Walls; approved 2026-10-26)
// =============================================================================
// Raise the Outpost, train explorers from villagers, send them for food, and bring home whoever
// they find. Every rule is a pure updater; GameContext only rolls the dice and applies them.

/** What an expedition brought home, until the player has read it */
export interface ExpeditionReport {
  expeditionId: number
  villagersFound: number
}

// -- The Outpost --------------------------------------------------------------

export type PostBlock = 'max' | 'renown' | null

/** Why the Outpost cannot be raised or upgraded now, or null if it can */
export function postBlock(s: GameState): PostBlock {
  const cost = getPostUpgradeCost(s.postLevel)
  if (cost === null) return 'max'
  return s.inspiration < cost ? 'renown' : null
}

/** Raise the Outpost, or upgrade it a level (more room for explorers). Unchanged if blocked. */
export function upgradePost(s: GameState): GameState {
  if (postBlock(s) !== null) return s
  const cost = POST_LEVELS[s.postLevel].cost
  return {
    ...s,
    postLevel: s.postLevel + 1,
    inspiration: roundInsp(s.inspiration - cost),
    totalInspirationSpent: roundInsp(s.totalInspirationSpent + cost),
  }
}

// -- Explorers ----------------------------------------------------------------

/** What the next explorer costs: EXPLORER_BASE_COST on the ^1.15 curve of explorers trained */
export function explorerCost(s: Pick<GameState, 'explorersTrained'>): number {
  return roundCost(EXPLORER_BASE_COST * Math.pow(s.explorersTrained + 1, 1.15))
}

export type ExplorerBlock = 'noOutpost' | 'full' | 'nobody' | 'renown' | null

/** Why a villager cannot be trained into an explorer now, or null if one can */
export function explorerBlock(s: GameState): ExplorerBlock {
  if (s.postLevel <= 0) return 'noOutpost'
  if (s.explorers >= getExplorerCap(s.postLevel)) return 'full'
  if (s.villagers <= 0) return 'nobody'
  if (s.inspiration < explorerCost(s)) return 'renown'
  return null
}

/** Train a villager into an explorer. Unchanged if blocked. */
export function trainExplorer(s: GameState): GameState {
  if (explorerBlock(s) !== null) return s
  const cost = explorerCost(s)
  return {
    ...s,
    inspiration: roundInsp(s.inspiration - cost),
    totalInspirationSpent: roundInsp(s.totalInspirationSpent + cost),
    villagers: s.villagers - 1,
    explorers: s.explorers + 1,
    explorersTrained: s.explorersTrained + 1,
  }
}

// -- Expeditions --------------------------------------------------------------

/** Explorers at home, free to be sent */
export function explorersFree(s: Pick<GameState, 'explorers' | 'activeExpeditions'>): number {
  return Math.max(0, s.explorers - s.activeExpeditions.length)
}

/** How long an expedition takes now, in seconds (Cartography makes it shorter) */
export function expeditionSeconds(s: Pick<GameState, 'completedResearch'>): number {
  return Math.round(EXPEDITION_DURATION * (1 - getResearchBonuses(s.completedResearch).expeditionSpeedBonus))
}

export type ExpeditionBlock = 'noOutpost' | 'nobody' | 'food' | null

/** Why an expedition cannot be sent now, or null if one can */
export function expeditionBlock(s: GameState): ExpeditionBlock {
  if (s.postLevel <= 0) return 'noOutpost'
  if (explorersFree(s) <= 0) return 'nobody'
  if (s.food < EXPEDITION_FOOD_COST) return 'food'
  return null
}

/** Send a free explorer out, paid in food. `now` is the wall-clock time (trips run while away). */
export function sendExpedition(s: GameState, now: number): GameState {
  if (expeditionBlock(s) !== null) return s
  return {
    ...s,
    food: s.food - EXPEDITION_FOOD_COST,
    activeExpeditions: [...s.activeExpeditions, { id: s.nextExpeditionId, startedAt: now, duration: expeditionSeconds(s) }],
    nextExpeditionId: s.nextExpeditionId + 1,
  }
}

/** Whether this expedition has come home by `now` */
export function isExpeditionBack(e: { startedAt: number; duration: number }, now: number): boolean {
  return (now - e.startedAt) / 1000 >= e.duration
}

/**
 * Bring a returned expedition home: whoever it found joins the villagers, and the report waits in
 * the state for the player. After EXPEDITION_PITY_THRESHOLD empty trips one is sure to find
 * someone, and the first trip ever always does. `roll` is in [0, 1). Unchanged if not back yet.
 */
export function claimExpedition(s: GameState, id: number, now: number, roll: number): GameState {
  const e = s.activeExpeditions.find((x) => x.id === id)
  if (!e || !isExpeditionBack(e, now)) return s
  const pity = s.expeditionDryStreak >= EXPEDITION_PITY_THRESHOLD
  const rolled = rollExpeditionReward(pity, getResearchBonuses(s.completedResearch).expeditionFindBonus, roll)
  const { found, state } = firstExpeditionReward(s, rolled)
  return {
    ...state,
    activeExpeditions: s.activeExpeditions.filter((x) => x.id !== id),
    villagers: s.villagers + found,
    villagersRescued: s.villagersRescued + found,
    expeditionDryStreak: found === 0 ? s.expeditionDryStreak + 1 : 0,
    expeditionReport: { expeditionId: id, villagersFound: found },
  }
}

/** Whether anything at the Outpost can be done now (the badges) */
export function outpostHasAction(s: GameState, now: number): boolean {
  if (s.postLevel <= 0) return false
  return postBlock(s) === null || explorerBlock(s) === null || expeditionBlock(s) === null ||
    s.activeExpeditions.some((e) => isExpeditionBack(e, now))
}
