import type { GameState } from './state'
import type { ResearchBuilding, ResearchPrereq } from './research'
import { LIBRARIUM_COST, RESEARCH_NODES, getResearchNode } from './research'
import { roundInsp } from './utils'

// =============================================================================
// THE LIBRARIUM: BUILDING IT AND STUDYING (approved 2026-10-26)
// =============================================================================

/** Whether a building a study needs is standing */
export function hasBuilding(s: GameState, b: ResearchBuilding): boolean {
  switch (b) {
    case 'garrison': return s.barracksLevel > 0
    case 'forge': return s.armoryBuilt
    case 'lodge': return s.lodgeLevel > 0
    case 'keep': return s.draconiaHallBuilt
  }
}

export function prereqMet(s: GameState, p: ResearchPrereq): boolean {
  return p.type === 'research' ? s.completedResearch.includes(p.id) : hasBuilding(s, p.building)
}

/** Raise the Librarium. Unchanged if it stands or renown is short. */
export function buildLibrarium(s: GameState): GameState {
  if (s.librariumBuilt || s.inspiration < LIBRARIUM_COST) return s
  return {
    ...s,
    inspiration: roundInsp(s.inspiration - LIBRARIUM_COST),
    totalInspirationSpent: roundInsp(s.totalInspirationSpent + LIBRARIUM_COST),
    librariumBuilt: true,
  }
}

export type ResearchBlock = 'noLibrary' | 'done' | 'locked' | 'renown' | null

/** Why this study cannot be bought now, or null if it can */
export function researchBlock(s: GameState, id: string): ResearchBlock {
  const node = getResearchNode(id)
  if (!s.librariumBuilt || !node) return 'noLibrary'
  if (s.completedResearch.includes(id)) return 'done'
  if (!node.prereqs.every((p) => prereqMet(s, p))) return 'locked'
  if (s.inspiration < node.cost) return 'renown'
  return null
}

/** Buy a study; it takes effect at once. Unchanged if blocked. */
export function study(s: GameState, id: string): GameState {
  if (researchBlock(s, id) !== null) return s
  const cost = getResearchNode(id)!.cost
  return {
    ...s,
    inspiration: roundInsp(s.inspiration - cost),
    totalInspirationSpent: roundInsp(s.totalInspirationSpent + cost),
    completedResearch: [...s.completedResearch, id],
  }
}

/** How many studies of the current tree are done (a save may hold ids of the old one) */
export function studiesDone(s: Pick<GameState, 'completedResearch'>): number {
  return RESEARCH_NODES.filter((n) => s.completedResearch.includes(n.id)).length
}

/** Whether any study can be bought now (the badges) */
export function canStudyAny(s: GameState): boolean {
  return RESEARCH_NODES.some((n) => researchBlock(s, n.id) === null)
}
