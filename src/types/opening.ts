import type { GameState } from './state'

// =============================================================================
// THE OPENING: what the Warfront shows, revealed in order
// =============================================================================
// Everything here is derived from beats and kills, never from a stored flag, so a save that is
// already past the opening shows everything it has reached.

/** The flavour line and footer arrive after this many kills (where Wave 0 used to clear) */
export const OPENING_KILLS = 3

export interface WarfrontReveal {
  /** The top bar with the renown figure (arrives at the first kill) */
  topBar: boolean
  /** The monster's name under it */
  monsterName: boolean
  /** Flavour line and footer (after the opening kills) */
  details: boolean
  /** Objective line, chips and the tab bar (with call_to_arms) */
  chrome: boolean
  /** The Claws chip (layer 3): with Pyreth's sharpen_claws scene, or once the claws were sharpened */
  claws: boolean
}

/** A fresh install shows only the monster and the gate; the rest arrives as the player fights. */
export function warfrontReveal(s: Pick<GameState, 'monstersDefeated' | 'beatsSeen' | 'clawLevel'>): WarfrontReveal {
  const killed = s.monstersDefeated > 0 || s.beatsSeen.includes('first_renown')
  return {
    topBar: killed,
    monsterName: killed,
    details: s.monstersDefeated >= OPENING_KILLS,
    chrome: s.beatsSeen.includes('call_to_arms'),
    claws: s.beatsSeen.includes('sharpen_claws') || s.clawLevel > 0,
  }
}

// =============================================================================
// THE FORAGE TAB: only gathering at first
// =============================================================================
// Owner ruling (2026-10-26): while the player is learning to forage, the tab shows only that they
// can gather. Training gatherers appears once the stores have been filled by hand.

export interface ForageReveal {
  /** The TRAIN gatherer orb (after Fill the Stores, or once the save has trained one) */
  training: boolean
  /** The RECRUIT explorer orb (once the Explorer's Outpost is built) */
  explorers: boolean
}

export function forageReveal(s: Pick<GameState, 'questsDone' | 'foragersTrained' | 'postLevel'>): ForageReveal {
  return {
    training: s.questsDone.includes('fill_the_stores') || s.foragersTrained.gatherers > 0,
    explorers: s.postLevel > 0,
  }
}
