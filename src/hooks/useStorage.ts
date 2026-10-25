import { useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { GameState } from '../types/game'
import {
  DEFAULT_GAME_STATE,
  STARTING_FOOD,
  STARTING_VILLAGERS,
  getEffectiveAutoRate,
  getOfflineMaxSeconds,
  getFoodConsumption,
  FOOD_CHECK_INTERVAL,
  getResearchBonuses,
  getFighterAutoRate,
  SWORD_BONUS,
  SHIELD_BONUS,
  roundInsp,
  isSystemOn,
} from '../types/game'
import { backfillStory } from '../types/storyMigration'

const STORAGE_KEY = '@dragongold/gamestate'

export interface OfflineEarnings {
  inspiration: number
  seconds: number
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
        // Migrate removed weapons: clear old weapon IDs and recalculate clickPower
        const REMOVED_WEAPONS = ['iron_sword', 'steel_blade', 'dragon_fang']
        const hadOldWeapons = (merged.ownedWeapons as string[]).some((id: string) => REMOVED_WEAPONS.includes(id))
        if (hadOldWeapons) {
          merged.ownedWeapons = (merged.ownedWeapons as string[]).filter((id: string) => !REMOVED_WEAPONS.includes(id))
          // Reset clickPower to base (no valid old weapons carry over)
          merged.clickPower = 0.05
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
          if (typeof merged.clickPower === 'number' && merged.clickPower >= 1) {
            merged.inspiration = roundInsp((merged.inspiration as number) / 20)
            merged.totalInspirationEarned = roundInsp((merged.totalInspirationEarned as number) / 20)
            merged.totalInspirationSpent = roundInsp((merged.totalInspirationSpent as number) / 20)
            merged.clickPower = roundInsp((merged.clickPower as number) / 20)
          }
          const MILESTONE_REMAP: Record<number, number> = { 500: 25, 1000: 50, 2500: 125, 3500: 175 }
          if (Array.isArray(merged.milestonesOffered)) {
            merged.milestonesOffered = (merged.milestonesOffered as number[]).map(
              (t: number) => MILESTONE_REMAP[t] ?? roundInsp(t / 20)
            )
          }
          merged.saveMigrationVersion = 1
        }

        // Story migration: v1 saves get their beats backfilled from what they already did
        let gameState = merged as GameState
        if (!Array.isArray(gameState.beatsSeen)) gameState.beatsSeen = []
        if (typeof gameState.playSeconds !== 'number') gameState.playSeconds = 0
        if (typeof gameState.lastBeatAtPlaySec !== 'number') gameState.lastBeatAtPlaySec = 0
        if (!parsed.saveMigrationVersion || (parsed.saveMigrationVersion as number) < 2) {
          gameState = { ...backfillStory(gameState), saveMigrationVersion: 2 }
        }

        // Calculate offline earnings (the Keep turns this on)
        let offlineEarnings: OfflineEarnings | null = null
        const now = Date.now()
        const elapsedMs = now - gameState.lastSavedAt
        const elapsedSec = elapsedMs / 1000

        if (elapsedSec >= 60 && isSystemOn(gameState, 'offline')) {
          const rb = getResearchBonuses(gameState.completedResearch)
          const baseAutoRate = getEffectiveAutoRate(
            gameState.soldiers,
            gameState.armoryGear.swords,
            gameState.armoryGear.shields,
          )
          const gearBoost = (gameState.armoryGear.swords * SWORD_BONUS + gameState.armoryGear.shields * SHIELD_BONUS) * rb.gearBonusMultiplier
          const soldierRate = (baseAutoRate + gearBoost) * (1 + rb.autoRateMultiplier)
          const autoRate = soldierRate + getFighterAutoRate(gameState.fighters)
          const maxSec = getOfflineMaxSeconds(gameState.offlineLevel)
          const cappedSec = Math.min(elapsedSec, maxSec)

          if (autoRate > 0) {
            // If food system is active, soldiers only earn while food lasts
            let inspSeconds = cappedSec
            if (isSystemOn(gameState, 'hunger')) {
              const baseConsumption = getFoodConsumption(gameState.villagers, gameState.soldiers, gameState.foragers, gameState.explorers, gameState.fighters, gameState.repairers)
              const perCheck = Math.max(0, Math.ceil(baseConsumption * (1 - rb.foodConsumptionReduction)))
              const foodChecks = Math.floor(cappedSec / FOOD_CHECK_INTERVAL)

              if (perCheck > 0 && foodChecks > 0) {
                const checksUntilEmpty = Math.ceil(gameState.food / perCheck)
                const actualChecks = Math.min(foodChecks, checksUntilEmpty)
                const totalConsumed = perCheck * actualChecks
                gameState.food = Math.max(0, gameState.food - totalConsumed)

                if (gameState.food === 0 && checksUntilEmpty < foodChecks) {
                  inspSeconds = checksUntilEmpty * FOOD_CHECK_INTERVAL
                }
              }
            }

            const earned = roundInsp(autoRate * inspSeconds * (1 + rb.offlineMultiplier))
            if (earned > 0) {
              gameState.inspiration += earned
              gameState.totalInspirationEarned += earned
              gameState.monstersDefeated += Math.floor(inspSeconds)
              offlineEarnings = { inspiration: earned, seconds: Math.floor(cappedSec) }
            }
          }
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
