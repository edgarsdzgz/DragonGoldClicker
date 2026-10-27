import type { GameState } from './game'
import {
  DEFAULT_GAME_STATE,
  getOfflineMaxSeconds,
  FOOD_CHECK_INTERVAL,
  getResearchBonuses,
  roundInsp,
  isSystemOn,
} from './game'
import { migrateSave, LATEST_SAVE_VERSION } from './saveMigrations'
import { armyRenownPerSec } from './army'
import { mealCost } from './foodTick'
import { wallWhileAway } from './timeAway'
import type { WallAway } from './timeAway'

// =============================================================================
// LOADING A SAVE: parse and upgrade what is stored, then count the time away. Pure, so the title
// screen can read the save early and count the time away only when the player taps Start.
// =============================================================================

export interface OfflineEarnings {
  inspiration: number
  seconds: number
  /** What happened to the wall while away (absent before the siege) */
  wall?: WallAway
}

/** A save ready to play, with what happened while the player was away */
export interface LoadedGame {
  state: GameState
  offlineEarnings: OfflineEarnings | null
}

/** A new game, started now */
export function freshGame(now: number): GameState {
  return { ...DEFAULT_GAME_STATE, startedAt: now, lastSavedAt: now }
}

/**
 * The stored save, parsed and upgraded to today's format. Fields it lacks (added since it was
 * written) take their defaults. Throws, so the title screen keeps it aside, if it is not a JSON
 * object or comes from a newer format than this build knows (or from before the 2026-10-27 restart).
 */
export function parseSave(raw: string): GameState {
  const parsed: unknown = JSON.parse(raw)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('The save is not an object')
  const save = parsed as Partial<GameState>
  if (typeof save.saveMigrationVersion === 'number' && save.saveMigrationVersion > LATEST_SAVE_VERSION) {
    throw new Error(`Save format ${save.saveMigrationVersion} is newer than this build's ${LATEST_SAVE_VERSION}`)
  }
  return migrateSave({ ...DEFAULT_GAME_STATE, ...save })
}

/** Count the time away from the save's last write to `now`: the army's renown, its meals, the wall */
export function applyTimeAway(saved: GameState, now: number): LoadedGame {
  const gameState: GameState = { ...saved }
  // Calculate offline earnings (the Keep turns this on)
  let offlineEarnings: OfflineEarnings | null = null
  const elapsedMs = now - gameState.lastSavedAt
  const elapsedSec = elapsedMs / 1000

  if (elapsedSec >= 60 && isSystemOn(gameState, 'offline')) {
    const rb = getResearchBonuses(gameState.completedResearch)
    // The army earns only through kills: its damage over the time away, paid at the bounty
    // per HP of the monster it faces (no kills are counted offline; chapter 5)
    const autoRate = armyRenownPerSec(gameState)
    const maxSec = getOfflineMaxSeconds(gameState.offlineLevel)
    const cappedSec = Math.min(elapsedSec, maxSec)
    // Time away follows the army readout (chapter 5 phase C): strikes it lets through wear the wall
    const wall = wallWhileAway(gameState, cappedSec) ?? undefined
    if (wall) gameState.cityHp = wall.hpAfter
    let earned = 0

    if (autoRate > 0) {
      // Time away is fair (core-tap layer 3): the army eats its meals, but the stores never drop
      // below one meal's worth while the player is gone, so the army is still fed on return
      const inspSeconds = cappedSec
      if (isSystemOn(gameState, 'hunger')) {
        const perCheck = mealCost(gameState)
        const foodChecks = Math.floor(cappedSec / FOOD_CHECK_INTERVAL)
        if (perCheck > 0 && foodChecks > 0) {
          const reserve = Math.min(gameState.food, perCheck)
          gameState.food = Math.max(reserve, gameState.food - perCheck * foodChecks)
        }
      }

      earned = roundInsp(autoRate * inspSeconds * (1 + rb.offlineMultiplier))
      if (earned > 0) {
        gameState.inspiration += earned
        gameState.totalInspirationEarned += earned
      }
    }
    if (earned > 0 || wall) offlineEarnings = { inspiration: earned, seconds: Math.floor(cappedSec), wall }
  }

  gameState.lastSavedAt = now
  return { state: gameState, offlineEarnings }
}
