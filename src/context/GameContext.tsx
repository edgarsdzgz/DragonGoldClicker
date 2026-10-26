import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { AppState } from 'react-native'
import { DEV_TOOLS_ENABLED } from '../config/devTools'
import type { GameState, SoldierTier, SoldierCounts, ForagerTier, ForagerCounts, RoleId, StarvationResult, WandererEncounter, ResearchPrereq, MilestoneDef } from '../types/game'
import {
  DEFAULT_GAME_STATE,
  ARMORY_COST,
  BARRACKS_LEVELS,
  SOLDIER_TIERS,
  AVATAR_WEAPONS,
  SWORD_COST,
  SHIELD_COST,
  OFFLINE_LEVELS,
  MAX_OFFLINE_LEVEL,
  getSoldierCost,
  getSoldierCount,
  getTotalSoldiers,
  getSoldierCap,
  getBarracksUpgradeCost,
  getEffectiveAutoRate,
  getPromotionCost,
  getTierIndex,
  getOfflineUpgradeCost,
  getFoodConsumption,
  getFoodEventsRemaining,
  getForageYield,
  FORAGER_TIERS,
  LODGE_LEVELS,
  MAX_LODGE_LEVEL,
  getTotalForagers,
  getForagerCap,
  getForagerCost,
  getForagerCount,
  getAutoFoodRate,
  POST_LEVELS,
  MAX_POST_LEVEL,
  EXPLORER_COST,
  EXPEDITION_INSPIRATION_COST,
  EXPEDITION_FOOD_COST,
  EXPEDITION_DURATION,
  EXPEDITION_PITY_THRESHOLD,
  getExplorerCap,
  rollExpeditionReward,
  DRACONIA_HALL_COST,
  getTrainingCost,
  getRecruitCost,
  REASSIGN_REFUND_RATE,
  DISMISS_REFUND_RATE,
  WANDERER_COOLDOWN,
  rollWandererCheck,
  rollWandererEncounter,
  getTrainedOverflowRefund,
  getTrainedBuildingName,
  getTrainedRoleName,
  LIBRARIUM_COST,
  RESEARCH_NODES,
  getResearchBonuses,
  getFighterCost,
  getRepairerCost,
  stepFighterVolley,
  FIGHTER_HIT_DAMAGE,
  FIGHTER_TICK_MS,
  SIEGE_TICK_INTERVAL,
  MAX_CITY_HP,
  getThreatLevel,
  getNextMilestone,
  getDefenseLevel,
  getSiegeDamage,
  getRepairRate,
  SWORD_BONUS,
  SHIELD_BONUS,
  roundInsp,
  isSystemOn,
  isBuildingRevealed,
} from '../types/game'
import { stepFood } from '../types/foodTick'
import { applyCityDamage } from '../types/cityHp'
import { strike, fighterStrike } from '../types/monsters'
import { completeQuests, hasQuestToComplete } from '../types/quests'
import { firstExpeditionReward } from '../types/scripted'
import { useStorage } from '../hooks/useStorage'
import type { OfflineEarnings } from '../hooks/useStorage'
import { useGameLoop } from '../hooks/useGameLoop'

interface GameContextType {
  state: GameState
  click: () => void
  forage: () => void
  buildOrUpgradeBarracks: () => boolean
  buildArmory: () => boolean
  trainSoldier: (tier: SoldierTier) => boolean
  promoteSoldier: (fromTier: SoldierTier, toTier: SoldierTier) => boolean
  buySword: () => boolean
  buyShield: () => boolean
  buyWeapon: (id: string) => boolean
  upgradeOffline: () => boolean
  buildOrUpgradeLodge: () => boolean
  trainForager: (tier: ForagerTier) => boolean
  buildOrUpgradePost: () => boolean
  trainExplorer: () => boolean
  sendExpedition: () => boolean
  claimExpedition: (id: number) => { villagersFound: number } | null
  buildDraconiaHall: () => boolean
  dismissSoldier: (tier: SoldierTier) => boolean
  dismissForager: (tier: ForagerTier) => boolean
  dismissExplorer: () => boolean
  reassignRole: (from: RoleId, to: RoleId) => boolean
  effectiveAutoRate: number
  autoFoodRate: number
  foodWarningLevel: 0 | 3 | 1
  resetGame: () => void
  pendingOfflineEarnings: OfflineEarnings | null
  dismissOfflineEarnings: () => void
  pendingStarvationReport: StarvationResult | null
  dismissStarvationReport: () => void
  pendingFoodWarning: 0 | 3 | 1
  dismissFoodWarning: () => void
  pendingWanderer: WandererEncounter | null
  acceptWanderer: () => { overflow: boolean; refundInspiration: number; roleName: string; buildingName: string } | null
  rejectWanderer: () => void
  rallyFighter: () => boolean
  directRepairer: () => boolean
  threatLevel: number
  defenseLevel: number
  isGameOver: boolean
  dismissGameOver: () => void
  pendingMilestone: MilestoneDef | null
  acceptMilestone: () => void
  rejectMilestone: () => void
  buildLibrarium: () => boolean
  completeResearch: (id: string) => boolean
  isResearchAvailable: (id: string) => boolean
  /** Story director: record a beat as seen and restart the dwell clock (at the game second it fired in) */
  markBeatSeen: (id: string, atPlaySec?: number) => void
  /** Story: apply a scripted state change (pure updater; scripted events and flags) */
  applyScripted: (updater: (s: GameState) => GameState) => void
  /** Guided tutorial: record a step as done */
  completeTutorialStep: (id: string) => void
  /** Dev tools only: apply an arbitrary state change (grants, checkpoints, forced timers) */
  devApply: (updater: (s: GameState) => GameState) => void
  /** Dev tools only: show a wanderer encounter now, skipping cooldown and chance */
  devForceWanderer: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_GAME_STATE)
  const [loaded, setLoaded] = useState(false)
  const [pendingOfflineEarnings, setPendingOfflineEarnings] = useState<OfflineEarnings | null>(null)
  const [gameOverDismissed, setGameOverDismissed] = useState(false)
  const [pendingMilestone, setPendingMilestone] = useState<MilestoneDef | null>(null)
  const wandererTimerRef = useRef(0)
  const { save, load, clear } = useStorage()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    load().then((result) => {
      setState(result.state)
      if (result.offlineEarnings) {
        setPendingOfflineEarnings(result.offlineEarnings)
      }
      setLoaded(true)
    })
  }, [load])

  // Latest state for the throttled and background saves below
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Throttled save: at most once per 2s. A debounce would never fire while
  // auto-income changes state every second, so progress would never persist.
  useEffect(() => {
    if (!loaded || saveTimerRef.current) return
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null
      save(stateRef.current)
    }, 2000)
  }, [state, loaded, save])

  // Save immediately when the app leaves the foreground, and clear any pending timer on unmount
  useEffect(() => {
    if (!loaded) return
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') save(stateRef.current)
    })
    return () => {
      sub.remove()
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
    }
  }, [loaded, save])

  const { pendingStarvationReport, pendingFoodWarning, pendingWanderer } = state
  // Derived, so it can never disagree with the HP that caused it
  const isGameOver = isSystemOn(state, 'siege') && state.cityHp <= 0 && !gameOverDismissed
  useEffect(() => {
    if (state.cityHp > 0) setGameOverDismissed(false)
  }, [state.cityHp])

  const researchBonuses = getResearchBonuses(state.completedResearch)

  const baseAutoRate = getEffectiveAutoRate(
    state.soldiers,
    state.armoryGear.swords,
    state.armoryGear.shields,
  )
  // Apply research: gear bonus multiplier boosts the gear portion, auto rate multiplier boosts all
  const gearRate = (state.armoryGear.swords * SWORD_BONUS + state.armoryGear.shields * SHIELD_BONUS) * researchBonuses.gearBonusMultiplier
  const soldierAutoRate = (baseAutoRate + gearRate) * (1 + researchBonuses.autoRateMultiplier)
  // Fighters earn nothing per second: they wear down the monster, and renown comes from its kill
  const potentialAutoRate = soldierAutoRate
  // Soldiers and fighters stop when starving
  const starving = isSystemOn(state, 'hunger') && state.food <= 0
  const soldiersStarving = starving && getTotalSoldiers(state.soldiers) > 0
  const effectiveAutoRate = soldiersStarving ? 0 : potentialAutoRate

  const autoFoodRate = getAutoFoodRate(state.foragers)

  const threatLevel = getThreatLevel(state.totalInspirationEarned)
  const defenseLevel = getDefenseLevel(state.clickPower, state.fighters)

  // Active play clock for the story director's dwell timer (game seconds, follows dev speed)
  useGameLoop(
    useCallback(() => {
      if (!loaded) return
      setState((prev) => ({ ...prev, playSeconds: prev.playSeconds + 1 }))
    }, [loaded])
  )

  // Fractional inspiration accumulator (soldiers stop fighting when starving)
  useGameLoop(
    useCallback(() => {
      if (!loaded || effectiveAutoRate <= 0) return
      setState((prev) => {
        // No auto inspiration when food system is active and food is depleted
        if (isSystemOn(prev, 'hunger') && prev.food <= 0) return prev

        const earned = effectiveAutoRate
        return {
          ...prev,
          inspiration: prev.inspiration + earned,
          totalInspirationEarned: prev.totalInspirationEarned + earned,
        }
      })
    }, [loaded, effectiveAutoRate])
  )

  // Fighters' volley at the monster: all of them strike together every FIGHTER_SWING_MS, as one
  // hit. The time to the next volley lives in a ref, so a tick in which nothing lands does not
  // re-render.
  const fighterSwing = useRef(0)
  const fighters = loaded && !starving ? state.fighters : 0
  useGameLoop(
    useCallback(() => {
      const { swings, progress } = stepFighterVolley(fighterSwing.current, fighters)
      fighterSwing.current = progress
      if (swings <= 0) return
      setState((prev) => (prev.fighters > 0 ? fighterStrike(prev, swings * FIGHTER_HIT_DAMAGE, swings).state : prev))
    }, [fighters]),
    FIGHTER_TICK_MS,
  )

  // Auto food accumulator (foragers gather food automatically)
  useGameLoop(
    useCallback(() => {
      if (!loaded || autoFoodRate <= 0) return
      setState((prev) => {
        const newProgress = prev.autoFoodProgress + autoFoodRate
        const gained = Math.floor(newProgress)
        if (gained <= 0) {
          return { ...prev, autoFoodProgress: newProgress }
        }
        return {
          ...prev,
          autoFoodProgress: newProgress - gained,
          food: prev.food + gained,
          totalFoodForaged: prev.totalFoodForaged + gained,
        }
      })
    }, [loaded, autoFoodRate])
  )

  // Food consumption tick (only once the Hunger system is on). Decision and pop-up payloads
  // are computed from `prev` inside one pure updater, so they always commit together.
  useGameLoop(
    useCallback(() => {
      if (!loaded) return
      setState((prev) => (isSystemOn(prev, 'hunger') ? stepFood(prev, isSystemOn(prev, 'starvation')) : prev))
    }, [loaded])
  )

  // Siege damage tick (every SIEGE_TICK_INTERVAL seconds, once the Siege system is on)
  useGameLoop(
    useCallback(() => {
      if (!loaded) return
      setState((prev) => {
        if (!isSystemOn(prev, 'siege') || prev.cityHp <= 0) return prev
        const timer = prev.siegeTimer + 1
        if (timer < SIEGE_TICK_INTERVAL) return { ...prev, siegeTimer: timer }
        // Siege tick fires
        const threat = getThreatLevel(prev.totalInspirationEarned)
        const defense = getDefenseLevel(prev.clickPower, prev.fighters)
        const damage = getSiegeDamage(threat, defense)
        if (damage <= 0) return { ...prev, siegeTimer: 0 }
        // HP floor: no damage path drops the city below HP_FLOOR until threatUnfloored
        return { ...applyCityDamage(prev, damage), siegeTimer: 0 }
      })
    }, [loaded])
  )

  // Repair loop (repairers heal city HP continuously, once the Repair system is on)
  useGameLoop(
    useCallback(() => {
      if (!loaded) return
      setState((prev) => {
        if (!isSystemOn(prev, 'repair') || prev.repairers <= 0 || prev.cityHp >= MAX_CITY_HP || prev.cityHp <= 0) return prev
        const rate = getRepairRate(prev.repairers)
        const newProgress = prev.repairProgress + rate
        const healed = Math.floor(newProgress)
        if (healed <= 0) {
          return { ...prev, repairProgress: newProgress }
        }
        const newHp = Math.min(MAX_CITY_HP, prev.cityHp + healed)
        return { ...prev, repairProgress: newProgress - healed, cityHp: newHp }
      })
    }, [loaded])
  )

  // Wanderer encounter check (time-based cooldown, active play only)
  useGameLoop(
    useCallback(() => {
      if (!loaded) return
      wandererTimerRef.current += 1
      if (wandererTimerRef.current < WANDERER_COOLDOWN) return

      const now = Date.now()
      setState((prev) => {
        // Don't roll if a wanderer is already pending, or the system is not on yet
        if (prev.pendingWanderer || !isSystemOn(prev, 'wanderers')) return prev
        const encounter = rollWandererCheck(
          getTotalSoldiers(prev.soldiers),
          getTotalForagers(prev.foragers),
          prev.villagers,
          prev.activeExpeditions.length > 0,
          prev.postLevel,
        )
        return { ...prev, lastWandererCheck: now, pendingWanderer: encounter }
      })
    }, [loaded])
  )

  // Milestone recruitment check -- fires when totalInspirationEarned crosses a threshold
  useEffect(() => {
    if (!loaded || pendingMilestone || !isSystemOn(state, 'milestones')) return
    const next = getNextMilestone(state.totalInspirationEarned, state.milestonesOffered)
    if (next) {
      setPendingMilestone(next)
    }
  }, [loaded, state.totalInspirationEarned, state.milestonesOffered, state.beatsSeen, pendingMilestone])

  // Quests: a goal that is met completes at once and pays its reward (the toast or the story
  // beat that follows is the UI's job)
  useEffect(() => {
    if (loaded && hasQuestToComplete(state)) setState((prev) => completeQuests(prev).state)
  }, [loaded, state])

  // One tap hits the monster; the bounty is paid and the kill counted on its death (types/monsters.ts)
  const click = useCallback(() => {
    setState((prev) => strike(prev).state)
  }, [])

  const forage = useCallback(() => {
    setState((prev) => {
      const yield_ = getForageYield(prev.foragePower, prev.forageBonus)
      return {
        ...prev,
        food: prev.food + yield_,
        totalFoodForaged: prev.totalFoodForaged + yield_,
        forageClicks: prev.forageClicks + 1,
        foodGatheredByHand: prev.foodGatheredByHand + yield_,
      }
    })
  }, [])

  const rallyFighter = useCallback((): boolean => {
    let rallied = false
    setState((prev) => {
      if (prev.villagers <= 0) return prev
      const cost = getFighterCost(prev.fightersRallied)
      if (prev.inspiration < cost) return prev
      rallied = true
      return {
        ...prev,
        inspiration: prev.inspiration - cost,
        totalInspirationSpent: prev.totalInspirationSpent + cost,
        villagers: prev.villagers - 1,
        fighters: prev.fighters + 1,
        fightersRallied: prev.fightersRallied + 1,
      }
    })
    return rallied
  }, [])

  const directRepairer = useCallback((): boolean => {
    let directed = false
    setState((prev) => {
      if (prev.villagers <= 0) return prev
      if (!isSystemOn(prev, 'repair')) return prev
      const cost = getRepairerCost(prev.repairersDirected)
      if (prev.inspiration < cost) return prev
      directed = true
      return {
        ...prev,
        inspiration: prev.inspiration - cost,
        totalInspirationSpent: prev.totalInspirationSpent + cost,
        villagers: prev.villagers - 1,
        repairers: prev.repairers + 1,
        repairersDirected: prev.repairersDirected + 1,
      }
    })
    return directed
  }, [])

  const buildOrUpgradeBarracks = useCallback((): boolean => {
    let success = false
    setState((prev) => {
      const nextLevel = prev.barracksLevel + 1
      const def = BARRACKS_LEVELS.find((l) => l.level === nextLevel)
      if (!def || prev.inspiration < def.cost) return prev
      success = true
      return {
        ...prev,
        inspiration: prev.inspiration - def.cost,
        totalInspirationSpent: prev.totalInspirationSpent + def.cost,
        barracksLevel: nextLevel,
      }
    })
    return success
  }, [])

  const buildArmory = useCallback((): boolean => {
    let success = false
    setState((prev) => {
      if (prev.armoryBuilt || prev.inspiration < ARMORY_COST) return prev
      success = true
      return { ...prev, inspiration: prev.inspiration - ARMORY_COST, totalInspirationSpent: prev.totalInspirationSpent + ARMORY_COST, armoryBuilt: true }
    })
    return success
  }, [])

  const trainSoldier = useCallback((tier: SoldierTier): boolean => {
    let trained = false
    setState((prev) => {
      if (prev.barracksLevel <= 0) return prev
      if (prev.villagers <= 0) return prev
      const tierDef = SOLDIER_TIERS.find((t) => t.id === tier)
      if (!tierDef || prev.barracksLevel < tierDef.unlocksAtBarracksLevel) return prev
      const total = getTotalSoldiers(prev.soldiers)
      const cap = getSoldierCap(prev.barracksLevel)
      if (total >= cap) return prev
      const lifetimeCount = getSoldierCount(prev.soldiersTrained, tier)
      const baseCost = getSoldierCost(tierDef, lifetimeCount)
      const rb = getResearchBonuses(prev.completedResearch)
      const cost = roundInsp(baseCost * (1 - rb.soldierCostDiscount))
      if (prev.inspiration < cost) return prev
      trained = true
      const key: keyof SoldierCounts =
        tier === 'conscript' ? 'conscripts' :
        tier === 'footman' ? 'footmen' : 'knights'
      return {
        ...prev,
        inspiration: prev.inspiration - cost,
        totalInspirationSpent: prev.totalInspirationSpent + cost,
        villagers: prev.villagers - 1,
        soldiers: { ...prev.soldiers, [key]: prev.soldiers[key] + 1 },
        soldiersTrained: { ...prev.soldiersTrained, [key]: prev.soldiersTrained[key] + 1 },
      }
    })
    return trained
  }, [])

  const promoteSoldier = useCallback((fromTier: SoldierTier, toTier: SoldierTier): boolean => {
    let promoted = false
    setState((prev) => {
      if (prev.barracksLevel <= 0) return prev
      const fromIdx = getTierIndex(fromTier)
      const toIdx = getTierIndex(toTier)
      if (toIdx <= fromIdx) return prev
      const toDef = SOLDIER_TIERS[toIdx]
      if (prev.barracksLevel < toDef.unlocksAtBarracksLevel) return prev
      const fromCount = getSoldierCount(prev.soldiers, fromTier)
      if (fromCount <= 0) return prev
      const cost = getPromotionCost(fromTier, toTier, prev.soldiersTrained)
      if (cost === null || prev.inspiration < cost) return prev
      promoted = true
      const fromKey: keyof SoldierCounts =
        fromTier === 'conscript' ? 'conscripts' :
        fromTier === 'footman' ? 'footmen' : 'knights'
      const toKey: keyof SoldierCounts =
        toTier === 'conscript' ? 'conscripts' :
        toTier === 'footman' ? 'footmen' : 'knights'
      return {
        ...prev,
        inspiration: prev.inspiration - cost,
        totalInspirationSpent: prev.totalInspirationSpent + cost,
        soldiersPromoted: prev.soldiersPromoted + 1,
        soldiers: {
          ...prev.soldiers,
          [fromKey]: prev.soldiers[fromKey] - 1,
          [toKey]: prev.soldiers[toKey] + 1,
        },
      }
    })
    return promoted
  }, [])

  const buySword = useCallback((): boolean => {
    let bought = false
    setState((prev) => {
      if (!prev.armoryBuilt) return prev
      const total = getTotalSoldiers(prev.soldiers)
      if (prev.armoryGear.swords >= total) return prev
      if (prev.inspiration < SWORD_COST) return prev
      bought = true
      return {
        ...prev,
        inspiration: prev.inspiration - SWORD_COST,
        totalInspirationSpent: prev.totalInspirationSpent + SWORD_COST,
        armoryGear: { ...prev.armoryGear, swords: prev.armoryGear.swords + 1 },
      }
    })
    return bought
  }, [])

  const buyShield = useCallback((): boolean => {
    let bought = false
    setState((prev) => {
      if (!prev.armoryBuilt) return prev
      const total = getTotalSoldiers(prev.soldiers)
      if (prev.armoryGear.shields >= total) return prev
      if (prev.inspiration < SHIELD_COST) return prev
      bought = true
      return {
        ...prev,
        inspiration: prev.inspiration - SHIELD_COST,
        totalInspirationSpent: prev.totalInspirationSpent + SHIELD_COST,
        armoryGear: { ...prev.armoryGear, shields: prev.armoryGear.shields + 1 },
      }
    })
    return bought
  }, [])

  const buyWeapon = useCallback((id: string): boolean => {
    let bought = false
    setState((prev) => {
      if (prev.ownedWeapons.includes(id)) return prev
      const def = AVATAR_WEAPONS.find((w) => w.id === id)
      if (!def || prev.inspiration < def.cost) return prev
      bought = true
      return {
        ...prev,
        inspiration: prev.inspiration - def.cost,
        totalInspirationSpent: prev.totalInspirationSpent + def.cost,
        ownedWeapons: [...prev.ownedWeapons, id],
        clickPower: prev.clickPower + def.clickPowerBonus,
      }
    })
    return bought
  }, [])

  const buildOrUpgradeLodge = useCallback((): boolean => {
    let success = false
    setState((prev) => {
      if (!isBuildingRevealed(prev, 'lodge')) return prev
      const nextLevel = prev.lodgeLevel + 1
      const def = LODGE_LEVELS.find((l) => l.level === nextLevel)
      if (!def || prev.inspiration < def.cost) return prev
      success = true
      return {
        ...prev,
        inspiration: prev.inspiration - def.cost,
        totalInspirationSpent: prev.totalInspirationSpent + def.cost,
        lodgeLevel: nextLevel,
      }
    })
    return success
  }, [])

  const trainForager = useCallback((tier: ForagerTier): boolean => {
    let trained = false
    setState((prev) => {
      if (prev.villagers <= 0) return prev
      const tierDef = FORAGER_TIERS.find((t) => t.id === tier)
      if (!tierDef || prev.lodgeLevel < tierDef.unlocksAtLodgeLevel) return prev
      const total = getTotalForagers(prev.foragers)
      const cap = getForagerCap(prev.lodgeLevel)
      if (total >= cap) return prev
      const lifetimeCount = getForagerCount(prev.foragersTrained, tier)
      const cost = getForagerCost(tierDef, lifetimeCount)
      if (prev.inspiration < cost) return prev
      trained = true
      const key: keyof ForagerCounts =
        tier === 'gatherer' ? 'gatherers' :
        tier === 'trapper' ? 'trappers' : 'rangers'
      return {
        ...prev,
        inspiration: prev.inspiration - cost,
        totalInspirationSpent: prev.totalInspirationSpent + cost,
        villagers: prev.villagers - 1,
        foragers: { ...prev.foragers, [key]: prev.foragers[key] + 1 },
        foragersTrained: { ...prev.foragersTrained, [key]: prev.foragersTrained[key] + 1 },
      }
    })
    return trained
  }, [])

  const buildOrUpgradePost = useCallback((): boolean => {
    let success = false
    setState((prev) => {
      const nextLevel = prev.postLevel + 1
      const def = POST_LEVELS.find((l) => l.level === nextLevel)
      if (!def || prev.inspiration < def.cost) return prev
      success = true
      return {
        ...prev,
        inspiration: prev.inspiration - def.cost,
        totalInspirationSpent: prev.totalInspirationSpent + def.cost,
        postLevel: nextLevel,
      }
    })
    return success
  }, [])

  const trainExplorer = useCallback((): boolean => {
    let trained = false
    setState((prev) => {
      if (prev.postLevel <= 0) return prev
      if (prev.villagers <= 0) return prev
      const cap = getExplorerCap(prev.postLevel)
      if (prev.explorers >= cap) return prev
      const cost = EXPLORER_COST
      if (prev.inspiration < cost) return prev
      trained = true
      return {
        ...prev,
        inspiration: prev.inspiration - cost,
        totalInspirationSpent: prev.totalInspirationSpent + cost,
        villagers: prev.villagers - 1,
        explorers: prev.explorers + 1,
        explorersTrained: prev.explorersTrained + 1,
      }
    })
    return trained
  }, [])

  const sendExpedition = useCallback((): boolean => {
    let sent = false
    setState((prev) => {
      if (prev.postLevel <= 0 || prev.explorers <= 0) return prev
      // An explorer can only go on one expedition at a time
      if (prev.activeExpeditions.length >= prev.explorers) return prev
      if (prev.inspiration < EXPEDITION_INSPIRATION_COST || prev.food < EXPEDITION_FOOD_COST) return prev
      sent = true
      return {
        ...prev,
        inspiration: prev.inspiration - EXPEDITION_INSPIRATION_COST,
        food: prev.food - EXPEDITION_FOOD_COST,
        totalInspirationSpent: prev.totalInspirationSpent + EXPEDITION_INSPIRATION_COST,
        activeExpeditions: [
          ...prev.activeExpeditions,
          {
            id: prev.nextExpeditionId,
            startedAt: Date.now(),
            duration: Math.floor(EXPEDITION_DURATION * (1 - getResearchBonuses(prev.completedResearch).expeditionSpeedBonus)),
          },
        ],
        nextExpeditionId: prev.nextExpeditionId + 1,
      }
    })
    return sent
  }, [])

  const claimExpedition = useCallback((id: number): { villagersFound: number } | null => {
    let result: { villagersFound: number } | null = null
    setState((prev) => {
      const expedition = prev.activeExpeditions.find((e) => e.id === id)
      if (!expedition) return prev
      const elapsed = (Date.now() - expedition.startedAt) / 1000
      if (elapsed < expedition.duration) return prev
      const pity = prev.expeditionDryStreak >= EXPEDITION_PITY_THRESHOLD
      const rb = getResearchBonuses(prev.completedResearch)
      // The first expedition ever claimed always rescues at least 1 villager
      const { found: villagersFound, state: base } = firstExpeditionReward(prev, rollExpeditionReward(pity, rb.expeditionFindBonus))
      result = { villagersFound }
      return {
        ...base,
        activeExpeditions: prev.activeExpeditions.filter((e) => e.id !== id),
        villagers: prev.villagers + villagersFound,
        villagersRescued: prev.villagersRescued + villagersFound,
        expeditionDryStreak: villagersFound === 0 ? prev.expeditionDryStreak + 1 : 0,
      }
    })
    return result
  }, [])

  const buildDraconiaHall = useCallback((): boolean => {
    let success = false
    setState((prev) => {
      if (prev.draconiaHallBuilt || prev.inspiration < DRACONIA_HALL_COST) return prev
      success = true
      return {
        ...prev,
        inspiration: prev.inspiration - DRACONIA_HALL_COST,
        totalInspirationSpent: prev.totalInspirationSpent + DRACONIA_HALL_COST,
        draconiaHallBuilt: true,
      }
    })
    return success
  }, [])

  const dismissSoldier = useCallback((tier: SoldierTier): boolean => {
    let dismissed = false
    setState((prev) => {
      if (!prev.draconiaHallBuilt) return prev
      const count = getSoldierCount(prev.soldiers, tier)
      if (count <= 0) return prev
      dismissed = true
      const key: keyof SoldierCounts =
        tier === 'conscript' ? 'conscripts' :
        tier === 'footman' ? 'footmen' : 'knights'
      return {
        ...prev,
        soldiers: { ...prev.soldiers, [key]: prev.soldiers[key] - 1 },
        villagers: prev.villagers + 1,
      }
    })
    return dismissed
  }, [])

  const dismissForager = useCallback((tier: ForagerTier): boolean => {
    let dismissed = false
    setState((prev) => {
      if (!prev.draconiaHallBuilt) return prev
      const count = getForagerCount(prev.foragers, tier)
      if (count <= 0) return prev
      dismissed = true
      const key: keyof ForagerCounts =
        tier === 'gatherer' ? 'gatherers' :
        tier === 'trapper' ? 'trappers' : 'rangers'
      return {
        ...prev,
        foragers: { ...prev.foragers, [key]: prev.foragers[key] - 1 },
        villagers: prev.villagers + 1,
      }
    })
    return dismissed
  }, [])

  const dismissExplorer = useCallback((): boolean => {
    let dismissed = false
    setState((prev) => {
      if (!prev.draconiaHallBuilt) return prev
      if (prev.explorers <= 0) return prev
      // Can't dismiss an explorer who is on an active expedition
      if (prev.activeExpeditions.length >= prev.explorers) return prev
      dismissed = true
      return {
        ...prev,
        explorers: prev.explorers - 1,
        villagers: prev.villagers + 1,
      }
    })
    return dismissed
  }, [])

  const reassignRole = useCallback((from: RoleId, to: RoleId): boolean => {
    let success = false
    setState((prev) => {
      if (!prev.draconiaHallBuilt) return prev

      // Validate source has units
      if (from.type === 'soldier') {
        if (getSoldierCount(prev.soldiers, from.tier) <= 0) return prev
      } else if (from.type === 'forager') {
        if (getForagerCount(prev.foragers, from.tier) <= 0) return prev
      } else if (from.type === 'explorer') {
        if (prev.explorers <= 0) return prev
        if (prev.activeExpeditions.length >= prev.explorers) return prev
      } else {
        return prev // can't reassign from idle
      }

      // Block promotions within same type -- must use building promote flow
      if (from.type === 'soldier' && to.type === 'soldier') {
        if (getTierIndex(to.tier) > getTierIndex(from.tier)) return prev
      }
      if (from.type === 'forager' && to.type === 'forager') {
        const fromIdx = FORAGER_TIERS.findIndex((t) => t.id === from.tier)
        const toIdx = FORAGER_TIERS.findIndex((t) => t.id === to.tier)
        if (toIdx > fromIdx) return prev
      }

      // Calculate costs
      const refundRate = to.type === 'idle' ? DISMISS_REFUND_RATE : REASSIGN_REFUND_RATE
      const refund = roundInsp(getTrainingCost(from, prev) * refundRate)
      const recruitCost = to.type === 'idle' ? 0 : getRecruitCost(to, prev)
      const netCost = recruitCost - refund // positive = player pays, negative = player gets inspiration

      // Check player can afford (if net cost is positive)
      if (netCost > 0 && prev.inspiration < netCost) return prev

      // Validate target capacity (not needed for idle)
      if (to.type === 'soldier') {
        const total = getTotalSoldiers(prev.soldiers)
        const effectiveTotal = from.type === 'soldier' ? total - 1 : total
        if (effectiveTotal >= getSoldierCap(prev.barracksLevel)) return prev
        const tierDef = SOLDIER_TIERS.find((t) => t.id === to.tier)
        if (!tierDef || prev.barracksLevel < tierDef.unlocksAtBarracksLevel) return prev
      } else if (to.type === 'forager') {
        const total = getTotalForagers(prev.foragers)
        const effectiveTotal = from.type === 'forager' ? total - 1 : total
        if (effectiveTotal >= getForagerCap(prev.lodgeLevel)) return prev
        const tierDef = FORAGER_TIERS.find((t) => t.id === to.tier)
        if (!tierDef || prev.lodgeLevel < tierDef.unlocksAtLodgeLevel) return prev
      } else if (to.type === 'explorer') {
        if (prev.postLevel <= 0) return prev
        const effectiveExplorers = from.type === 'explorer' ? prev.explorers - 1 : prev.explorers
        if (effectiveExplorers >= getExplorerCap(prev.postLevel)) return prev
      }

      success = true
      let next = { ...prev }

      // Inspiration transaction
      next.inspiration = prev.inspiration - netCost
      if (netCost > 0) {
        next.totalInspirationSpent = prev.totalInspirationSpent + netCost
      }

      // Remove from source role
      if (from.type === 'soldier') {
        const key: keyof SoldierCounts =
          from.tier === 'conscript' ? 'conscripts' :
          from.tier === 'footman' ? 'footmen' : 'knights'
        next.soldiers = { ...prev.soldiers, [key]: prev.soldiers[key] - 1 }
      } else if (from.type === 'forager') {
        const key: keyof ForagerCounts =
          from.tier === 'gatherer' ? 'gatherers' :
          from.tier === 'trapper' ? 'trappers' : 'rangers'
        next.foragers = { ...prev.foragers, [key]: prev.foragers[key] - 1 }
      } else if (from.type === 'explorer') {
        next.explorers = prev.explorers - 1
      }

      // Add to target role (or idle)
      if (to.type === 'soldier') {
        const key: keyof SoldierCounts =
          to.tier === 'conscript' ? 'conscripts' :
          to.tier === 'footman' ? 'footmen' : 'knights'
        next.soldiers = { ...(next.soldiers ?? prev.soldiers), [key]: (next.soldiers ?? prev.soldiers)[key] + 1 }
        next.soldiersTrained = {
          ...prev.soldiersTrained,
          [key]: prev.soldiersTrained[key] + 1,
        }
      } else if (to.type === 'forager') {
        const key: keyof ForagerCounts =
          to.tier === 'gatherer' ? 'gatherers' :
          to.tier === 'trapper' ? 'trappers' : 'rangers'
        next.foragers = { ...(next.foragers ?? prev.foragers), [key]: (next.foragers ?? prev.foragers)[key] + 1 }
        next.foragersTrained = {
          ...prev.foragersTrained,
          [key]: prev.foragersTrained[key] + 1,
        }
      } else if (to.type === 'explorer') {
        next.explorers = (next.explorers ?? prev.explorers) + 1
        next.explorersTrained = prev.explorersTrained + 1
      } else if (to.type === 'idle') {
        next.villagers = prev.villagers + 1
      }

      return next
    })
    return success
  }, [])

  const upgradeOffline = useCallback((): boolean => {
    let upgraded = false
    setState((prev) => {
      if (prev.offlineLevel >= MAX_OFFLINE_LEVEL) return prev
      const cost = getOfflineUpgradeCost(prev.offlineLevel)
      if (cost === null || prev.inspiration < cost) return prev
      upgraded = true
      return {
        ...prev,
        inspiration: prev.inspiration - cost,
        totalInspirationSpent: prev.totalInspirationSpent + cost,
        offlineLevel: prev.offlineLevel + 1,
      }
    })
    return upgraded
  }, [])

  const dismissOfflineEarnings = useCallback(() => {
    setPendingOfflineEarnings(null)
  }, [])

  const dismissStarvationReport = useCallback(() => {
    setState((prev) => ({ ...prev, pendingStarvationReport: null }))
  }, [])

  const dismissGameOver = useCallback(() => {
    setGameOverDismissed(true)
  }, [])

  const dismissFoodWarning = useCallback(() => {
    setState((prev) => ({ ...prev, pendingFoodWarning: 0 }))
  }, [])

  const acceptWanderer = useCallback((): { overflow: boolean; refundInspiration: number; roleName: string; buildingName: string } | null => {
    const encounter = state.pendingWanderer
    if (!encounter) return null
    let overflowResult: { overflow: boolean; refundInspiration: number; roleName: string; buildingName: string } | null = null

    setState((prev) => {
      let next = { ...prev, pendingWanderer: null }
      next.wanderersWelcomed = prev.wanderersWelcomed + encounter.villagerCount

      if (encounter.trained) {
        // Try to place trained unit in their building
        const trained = encounter.trained
        let hasRoom = false

        if (trained.type === 'soldier') {
          const total = getTotalSoldiers(prev.soldiers)
          const cap = getSoldierCap(prev.barracksLevel)
          hasRoom = prev.barracksLevel > 0 && total < cap
        } else {
          const total = getTotalForagers(prev.foragers)
          const cap = getForagerCap(prev.lodgeLevel)
          hasRoom = prev.lodgeLevel > 0 && total < cap
        }

        if (hasRoom) {
          // Place as trained unit
          if (trained.type === 'soldier') {
            const key: keyof SoldierCounts =
              trained.tier === 'conscript' ? 'conscripts' :
              trained.tier === 'footman' ? 'footmen' : 'knights'
            next.soldiers = { ...prev.soldiers, [key]: prev.soldiers[key] + 1 }
            next.soldiersTrained = { ...prev.soldiersTrained, [key]: prev.soldiersTrained[key] + 1 }
          } else {
            const key: keyof ForagerCounts =
              trained.tier === 'gatherer' ? 'gatherers' :
              trained.tier === 'trapper' ? 'trappers' : 'rangers'
            next.foragers = { ...prev.foragers, [key]: prev.foragers[key] + 1 }
            next.foragersTrained = { ...prev.foragersTrained, [key]: prev.foragersTrained[key] + 1 }
          }
          overflowResult = { overflow: false, refundInspiration: 0, roleName: getTrainedRoleName(trained), buildingName: getTrainedBuildingName(trained) }
        } else {
          // Overflow: place as idle + refund
          const refund = getTrainedOverflowRefund(trained)
          next.villagers = prev.villagers + 1
          next.inspiration = (next.inspiration ?? prev.inspiration) + refund
          overflowResult = { overflow: true, refundInspiration: refund, roleName: getTrainedRoleName(trained), buildingName: getTrainedBuildingName(trained) }
        }
      } else {
        // Regular villagers
        next.villagers = prev.villagers + encounter.villagerCount
        overflowResult = { overflow: false, refundInspiration: 0, roleName: '', buildingName: '' }
      }

      return next
    })

    wandererTimerRef.current = 0
    return overflowResult
  }, [state.pendingWanderer])

  const rejectWanderer = useCallback(() => {
    setState((prev) => ({ ...prev, pendingWanderer: null }))
    wandererTimerRef.current = 0
  }, [])

  const acceptMilestone = useCallback(() => {
    if (!pendingMilestone) return
    const milestone = pendingMilestone
    setState((prev) => ({
      ...prev,
      villagers: prev.villagers + milestone.villagers,
      milestonesOffered: [...prev.milestonesOffered, milestone.threshold],
    }))
    setPendingMilestone(null)
  }, [pendingMilestone])

  const rejectMilestone = useCallback(() => {
    if (!pendingMilestone) return
    // Mark as offered so it doesn't fire again, but don't add villagers
    setState((prev) => ({
      ...prev,
      milestonesOffered: [...prev.milestonesOffered, pendingMilestone.threshold],
    }))
    setPendingMilestone(null)
  }, [pendingMilestone])

  // Computed food warning level for badge display (always current, not just on events)
  const foodWarningLevel: 0 | 3 | 1 = (() => {
    if (!isSystemOn(state, 'hunger')) return 0
    const eventsLeft = getFoodEventsRemaining(state.food, state.villagers, state.soldiers, state.foragers, state.explorers)
    if (eventsLeft <= 1) return 1
    if (eventsLeft <= 3) return 3
    return 0
  })()

  // =========================================================================
  // LIBRARIUM & RESEARCH
  // =========================================================================

  const checkPrereqs = useCallback((prereqs: ResearchPrereq[], s: GameState): boolean => {
    for (const p of prereqs) {
      switch (p.type) {
        case 'research':
          if (!s.completedResearch.includes(p.id)) return false
          break
        case 'barracksLevel':
          if (s.barracksLevel < p.level) return false
          break
        case 'lodgeLevel':
          if (s.lodgeLevel < p.level) return false
          break
        case 'postLevel':
          if (s.postLevel < p.level) return false
          break
        case 'totalInspirationEarned':
          if (s.totalInspirationEarned < p.amount) return false
          break
        case 'monstersDefeated':
          if (s.monstersDefeated < p.amount) return false
          break
        case 'villagersRescued':
          if (s.villagersRescued < p.amount) return false
          break
      }
    }
    return true
  }, [])

  const isResearchAvailable = useCallback((id: string): boolean => {
    const node = RESEARCH_NODES.find((n) => n.id === id)
    if (!node) return false
    if (state.completedResearch.includes(id)) return false
    return checkPrereqs(node.prereqs, state)
  }, [state, checkPrereqs])

  const buildLibrarium = useCallback((): boolean => {
    let success = false
    setState((prev) => {
      if (prev.librariumBuilt) return prev
      if (prev.inspiration < LIBRARIUM_COST) return prev
      success = true
      return {
        ...prev,
        inspiration: prev.inspiration - LIBRARIUM_COST,
        totalInspirationSpent: prev.totalInspirationSpent + LIBRARIUM_COST,
        librariumBuilt: true,
      }
    })
    return success
  }, [])

  const completeResearch = useCallback((id: string): boolean => {
    let success = false
    setState((prev) => {
      if (!prev.librariumBuilt) return prev
      if (prev.completedResearch.includes(id)) return prev
      const node = RESEARCH_NODES.find((n) => n.id === id)
      if (!node || prev.inspiration < node.cost) return prev
      if (!checkPrereqs(node.prereqs, prev)) return prev
      success = true

      const next = {
        ...prev,
        inspiration: prev.inspiration - node.cost,
        totalInspirationSpent: prev.totalInspirationSpent + node.cost,
        completedResearch: [...prev.completedResearch, id],
      }

      // Apply immediate effects
      for (const effect of node.effects) {
        switch (effect.type) {
          case 'clickPowerBonus':
            next.clickPower = next.clickPower + effect.value
            break
          case 'foragePowerBonus':
            next.foragePower = next.foragePower + effect.value
            break
        }
      }

      return next
    })
    return success
  }, [checkPrereqs])

  const markBeatSeen = useCallback((id: string, atPlaySec?: number) => {
    setState((prev) => (prev.beatsSeen.includes(id)
      ? prev
      : { ...prev, beatsSeen: [...prev.beatsSeen, id], lastBeatAtPlaySec: atPlaySec ?? prev.playSeconds }))
  }, [])


  const applyScripted = useCallback((updater: (s: GameState) => GameState) => setState(updater), [])

  const completeTutorialStep = useCallback((id: string) => {
    setState((prev) => ((prev.tutorialStepsDone ?? []).includes(id)
      ? prev
      : { ...prev, tutorialStepsDone: [...(prev.tutorialStepsDone ?? []), id] }))
  }, [])

  const devApply = useCallback((updater: (s: GameState) => GameState) => {
    if (!DEV_TOOLS_ENABLED) return
    setState(updater)
  }, [])

  const devForceWanderer = useCallback(() => {
    if (!DEV_TOOLS_ENABLED) return
    wandererTimerRef.current = 0
    setState((prev) => ({ ...prev, pendingWanderer: rollWandererEncounter(getTotalSoldiers(prev.soldiers), getTotalForagers(prev.foragers)) }))
  }, [])

  const resetGame = useCallback(() => {
    const fresh = { ...DEFAULT_GAME_STATE, startedAt: Date.now(), lastSavedAt: Date.now() }
    setState(fresh)
    clear()
  }, [clear])

  if (!loaded) return null

  return (
    <GameContext.Provider
      value={{
        state,
        click,
        forage,
        buildOrUpgradeBarracks,
        buildArmory,
        trainSoldier,
        promoteSoldier,
        buySword,
        buyShield,
        buyWeapon,
        upgradeOffline,
        buildOrUpgradeLodge,
        trainForager,
        buildOrUpgradePost,
        trainExplorer,
        sendExpedition,
        claimExpedition,
        buildDraconiaHall,
        dismissSoldier,
        dismissForager,
        dismissExplorer,
        reassignRole,
        effectiveAutoRate,
        autoFoodRate,
        resetGame,
        pendingOfflineEarnings,
        dismissOfflineEarnings,
        foodWarningLevel,
        pendingStarvationReport,
        dismissStarvationReport,
        pendingFoodWarning,
        dismissFoodWarning,
        pendingWanderer,
        acceptWanderer,
        rejectWanderer,
        rallyFighter,
        directRepairer,
        threatLevel,
        defenseLevel,
        isGameOver,
        dismissGameOver,
        pendingMilestone,
        acceptMilestone,
        rejectMilestone,
        buildLibrarium,
        completeResearch,
        isResearchAvailable,
        markBeatSeen,
        completeTutorialStep,
        applyScripted,
        devApply,
        devForceWanderer,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextType {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
