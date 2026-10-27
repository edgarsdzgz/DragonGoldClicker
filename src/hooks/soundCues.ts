import type { GameState } from '../types/state'
import type { SoundId } from '../data/sounds'
import { isSystemOn, MAX_CITY_HP } from '../types/game'
import { GRANARY_CAP } from '../types/food'
// The art modules themselves, not the barrel (it loads the renderer)
import { gateState, mobTier } from '../art/warfront'
import type { GateState, MobTier } from '../art/warfront'
import { cityLight, LIGHT_RANK } from '../art/city'

// =============================================================================
// THE SOUND A CHANGE IN THE GAME EARNS (pure, so it is tested; hooks/useGameSounds plays it)
// =============================================================================

const GATE_WORSE: Record<GateState, number> = { sound: 0, cracking: 1, failing: 2, breached: 3 }
const TIER_DEPTH: Record<MobTier, number> = { weak: 0, strong: 1, stronger: 2 }

/** Every building's level added up (the Keep's own upgrades are its time-away tiers) */
const BUILDINGS = (s: GameState) =>
  s.barracksLevel + s.lodgeLevel + s.postLevel + s.offlineLevel +
  Number(s.armoryBuilt) + Number(s.draconiaHallBuilt) + Number(s.librariumBuilt)

const gate = (s: GameState) => (isSystemOn(s, 'siege') ? gateState(s.cityHp, MAX_CITY_HP) : 'sound')

/**
 * Each test in order, most important first. Only the first that holds plays: a time-away catch-up
 * or one tick that does several things at once makes one sound, not a pile of them.
 */
const CUES: readonly [SoundId, (prev: GameState, next: GameState) => boolean][] = [
  ['breach', (p, n) => n.breaches > p.breaches],
  ['unmakingRise', (p, n) => TIER_DEPTH[mobTier(n.hordeKills)] > TIER_DEPTH[mobTier(p.hordeKills)]],
  // A wall that falls is a Breach, which comes first
  ['gateCrack', (p, n) => GATE_WORSE[gate(n)] > GATE_WORSE[gate(p)]],
  ['cityBrightens', (p, n) => LIGHT_RANK[cityLight(n)] > LIGHT_RANK[cityLight(p)]],
  ['fanfare', (p, n) => n.questsDone.length > p.questsDone.length],
  ['buildComplete', (p, n) => BUILDINGS(n) > BUILDINGS(p)],
  ['researchDone', (p, n) => n.completedResearch.length > p.completedResearch.length],
  ['find', (p, n) => !p.expeditionReport && (n.expeditionReport?.villagersFound ?? 0) > 0],
  ['expeditionBack', (p, n) => !p.expeditionReport && n.expeditionReport !== null],
  ['expeditionOut', (p, n) => n.activeExpeditions.length > p.activeExpeditions.length],
  ['foodRaid', (p, n) => n.foodEvent?.id === 'raid' && n.foodEvent.phase === 'active' && p.foodEvent?.phase !== 'active'],
  ['granaryFull', (p, n) => p.food < GRANARY_CAP && n.food >= GRANARY_CAP],
  ['rally', (p, n) => n.fightersRallied > p.fightersRallied],
  ['mend', (p, n) => n.repairersDirected > p.repairersDirected],
]

/**
 * The sound one change in the game state earns, or null. A new game or a loaded save (a new
 * `startedAt`) earns nothing.
 */
export function stateSoundCue(prev: GameState, next: GameState): SoundId | null {
  if (prev === next || prev.startedAt !== next.startedAt) return null
  for (const [id, test] of CUES) if (test(prev, next)) return id
  return null
}
