// =============================================================================
// THE HORDE'S ADVANCE (core-tap layer 6): every kill moves it on, a Breach pushes it back
// =============================================================================

/** Kills per horde level */
export const HORDE_LEVEL_KILLS = 25

/**
 * How much stronger the horde's strikes get per level above 1. Off (0) until the balance pass,
 * which may turn it on (0.05 was proposed).
 */
export const HORDE_STRENGTH_PER_LEVEL = 0

/** The horde's level: 1, then one more for every HORDE_LEVEL_KILLS of its advance */
export function hordeLevel(hordeKills: number): number {
  return 1 + Math.floor(Math.max(0, hordeKills) / HORDE_LEVEL_KILLS)
}

/** The multiplier on the horde's strikes at its current level (1 while the hook is off) */
export function hordeStrength(hordeKills: number): number {
  return 1 + HORDE_STRENGTH_PER_LEVEL * (hordeLevel(hordeKills) - 1)
}

/** A Breach pushes the horde back by at least this many levels */
export const BREACH_MIN_PUSHBACK_LEVELS = 2

/**
 * The horde's advance after the ancient magic of a Breach: half of it, or at least
 * BREACH_MIN_PUSHBACK_LEVELS levels back, whichever is further. Never below 0.
 */
export function pushedBackHorde(hordeKills: number): number {
  const kills = Math.max(0, Math.floor(hordeKills))
  return Math.max(0, Math.min(Math.floor(kills / 2), kills - BREACH_MIN_PUSHBACK_LEVELS * HORDE_LEVEL_KILLS))
}
