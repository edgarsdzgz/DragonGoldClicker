import { useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { GameState } from '../types/game'
import {
  DEFAULT_GAME_STATE,
  STARTING_FOOD,
  STARTING_VILLAGERS,
  getOfflineMaxSeconds,
  FOOD_CHECK_INTERVAL,
  getResearchBonuses,
  roundInsp,
  isSystemOn,
} from '../types/game'
import { migrateSave } from '../types/saveMigrations'
import { armyRenownPerSec } from '../types/army'
import { mealCost } from '../types/foodTick'
import { wallWhileAway } from '../types/timeAway'
import type { WallAway } from '../types/timeAway'

const STORAGE_KEY = '@dragongold/gamestate'

/** Fields the story code reads must exist before any migration step looks at them */
function normalizeStory(s: GameState): GameState {
  return {
    ...s,
    beatsSeen: Array.isArray(s.beatsSeen) ? s.beatsSeen : [],
    playSeconds: typeof s.playSeconds === 'number' ? s.playSeconds : 0,
    lastBeatAtPlaySec: typeof s.lastBeatAtPlaySec === 'number' ? s.lastBeatAtPlaySec : 0,
    tutorialStepsDone: Array.isArray(s.tutorialStepsDone) ? s.tutorialStepsDone : [],
    scriptedDone: Array.isArray(s.scriptedDone) ? s.scriptedDone : [],
  }
}

export interface OfflineEarnings {
  inspiration: number
  seconds: number
  /** What happened to the wall while away (absent before the siege) */
  wall?: WallAway
}

export function useStorage() {
  const save = useCallback(async (state: GameState) => {
    try {
      // Transient pop-up state is not worth restoring after a restart
      const { pendingStarvationReport, pendingFoodWarning, lastFoodWarning, ...persisted } = state
      const toSave = { ...persisted, lastSavedAt: Date.now() }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch {
      // Storage write failed silently
    }
  }, [])

  const load = useCallback(async (): Promise<{ state: GameState; offlineEarnings: OfflineEarnings | null }> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>
        const merged = { ...DEFAULT_GAME_STATE, ...parsed }
        // Migrate nested objects from old save formats
        if (typeof merged.soldiers !== 'object' || merged.soldiers === null) {
          merged.soldiers = { ...DEFAULT_GAME_STATE.soldiers }
        }
        if (typeof merged.armoryGear !== 'object' || merged.armoryGear === null) {
          merged.armoryGear = { ...DEFAULT_GAME_STATE.armoryGear }
        }
        if (!Array.isArray(merged.ownedWeapons)) {
          merged.ownedWeapons = []
        }
        // Migrate removed weapons: clear old weapon IDs
        const REMOVED_WEAPONS = ['iron_sword', 'steel_blade', 'dragon_fang']
        const hadOldWeapons = (merged.ownedWeapons as string[]).some((id: string) => REMOVED_WEAPONS.includes(id))
        if (hadOldWeapons) {
          merged.ownedWeapons = (merged.ownedWeapons as string[]).filter((id: string) => !REMOVED_WEAPONS.includes(id))
        }
        if (typeof merged.soldiersTrained !== 'object' || merged.soldiersTrained === null) {
          merged.soldiersTrained = typeof merged.soldiers === 'object' && merged.soldiers !== null
            ? { ...merged.soldiers }
            : { ...DEFAULT_GAME_STATE.soldiersTrained }
        }
        // Migrate old gold -> inspiration field names
        const legacy = merged as Record<string, unknown>
        if ('gold' in legacy && !('inspiration' in parsed)) {
          merged.inspiration = legacy.gold as number
          delete legacy.gold
        }
        if ('totalGoldEarned' in legacy && !('totalInspirationEarned' in parsed)) {
          merged.totalInspirationEarned = legacy.totalGoldEarned as number
          delete legacy.totalGoldEarned
        }
        if ('totalGoldSpent' in legacy && !('totalInspirationSpent' in parsed)) {
          merged.totalInspirationSpent = legacy.totalGoldSpent as number
          delete legacy.totalGoldSpent
        }
        if (typeof merged.totalInspirationSpent !== 'number') merged.totalInspirationSpent = 0
        if (typeof merged.totalClicks !== 'number') merged.totalClicks = 0
        if (typeof merged.soldiersPromoted !== 'number') merged.soldiersPromoted = 0
        if (typeof merged.lastSavedAt !== 'number') merged.lastSavedAt = Date.now()
        if (typeof merged.offlineLevel !== 'number') merged.offlineLevel = 0
        if (typeof merged.food !== 'number') merged.food = STARTING_FOOD
        if (typeof merged.villagers !== 'number') merged.villagers = STARTING_VILLAGERS
        if (typeof merged.villagersLost !== 'number') merged.villagersLost = 0
        if (typeof merged.foodTimer !== 'number') merged.foodTimer = 0
        if (typeof merged.foodSystemActive !== 'boolean') merged.foodSystemActive = false
        if (typeof merged.librariumBuilt !== 'boolean') merged.librariumBuilt = false
        if (!Array.isArray(merged.completedResearch)) merged.completedResearch = []
        if (!Array.isArray(merged.milestonesOffered)) merged.milestonesOffered = []

        // Number shrink migration: divide inspiration-economy values by 20
        if (!parsed.saveMigrationVersion || (parsed.saveMigrationVersion as number) < 1) {
          // A pre-shrink save is told apart by its old click power (the field is gone since the Librarium)
          if (typeof legacy.clickPower === 'number' && legacy.clickPower >= 1) {
            merged.inspiration = roundInsp((merged.inspiration as number) / 20)
            merged.totalInspirationEarned = roundInsp((merged.totalInspirationEarned as number) / 20)
            merged.totalInspirationSpent = roundInsp((merged.totalInspirationSpent as number) / 20)
          }
          const MILESTONE_REMAP: Record<number, number> = { 500: 25, 1000: 50, 2500: 125, 3500: 175 }
          if (Array.isArray(merged.milestonesOffered)) {
            merged.milestonesOffered = (merged.milestonesOffered as number[]).map(
              (t: number) => MILESTONE_REMAP[t] ?? roundInsp(t / 20)
            )
          }
          merged.saveMigrationVersion = 1
        }

        // Every step after v1 lives in types/saveMigrations.ts, gated on the version the save came from
        const gameState = migrateSave(normalizeStory(merged as GameState), (parsed.saveMigrationVersion as number) || 0)

        // Calculate offline earnings (the Keep turns this on)
        let offlineEarnings: OfflineEarnings | null = null
        const now = Date.now()
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
    } catch {
      // Storage read failed, return defaults
    }
    return {
      state: { ...DEFAULT_GAME_STATE, startedAt: Date.now(), lastSavedAt: Date.now() },
      offlineEarnings: null,
    }
  }, [])

  const clear = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage clear failed silently
    }
  }, [])

  return { save, load, clear }
}
