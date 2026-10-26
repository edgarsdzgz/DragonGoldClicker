import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { AppState } from 'react-native'
import { DEV_TOOLS_ENABLED } from '../config/devTools'
import type { GameState, SoldierTier, SoldierCounts, ForagerTier, ForagerCounts, RoleId, StarvationResult, WandererEncounter, ResearchPrereq, MilestoneDef } from '../types/game'
import {
  DEFAULT_GAME_STATE,
  ARMORY_COST,
  BARRACKS_LEVELS,
  SOLDIER_TIERS,
  SWORD_COST,
  SHIELD_COST,
  OFFLINE_LEVELS,
  MAX_OFFLINE_LEVEL,
  getSoldierCount,
  getTotalSoldiers,
  getSoldierCap,
  getBarracksUpgradeCost,
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
  rollWandererEncounter,
  stepWanderers,
  welcomeWanderer,
  turnAwayWanderer,
  LIBRARIUM_COST,
  RESEARCH_NODES,
  getResearchBonuses,
  getFighterCost,
  getRepairerCost,
  stepFighterVolley,
  FIGHTER_TICK_MS,
  MAX_CITY_HP,
  getNextMilestone,
  getRepairRate,
  roundInsp,
  granaryRoom,
  isSystemOn,
  isBuildingRevealed,
} from '../types/game'
import { stepFood } from '../types/foodTick'
import { stepWall } from '../types/wall'
import { strike, fighterStrike } from '../types/monsters'
import { completeQuests, hasQuestToComplete } from '../types/quests'
import { fighterDamageMultiplier } from '../types/fedState'
import { stepFoodEvents, gatherMultiplier, answerRefugees as answerRefugeesState } from '../types/foodEvents'
import { isRationAvailable } from '../types/rations'
import type { RationId } from '../types/rations'
import { firstExpeditionReward } from '../types/scripted'
import { sharpenClaws as sharpenClawsState } from '../types/claws'
import { armySize, armyVolleyNow, makeRank as makeRankState } from '../types/army'
import { useStorage } from '../hooks/useStorage'
import type { OfflineEarnings } from '../hooks/useStorage'
import { useGameLoop } from '../hooks/useGameLoop'

interface GameContextType {
  state: GameState
  click: () => void
  forage: () => void
  buildOrUpgradeBarracks: () => boolean
  buildArmory: () => boolean
  /** Train a fighter into a conscript, or promote a soldier one rank up (types/army.ts) */
  makeRank: (tier: SoldierTier) => boolean
  buySword: () => boolean
  buyShield: () => boolean
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
  acceptWanderer: () => void
  rejectWanderer: () => void
  rallyFighter: () => boolean
  directRepairer: () => boolean
  /** Buy the next level of the dragon's claws (layer 3) */
  sharpenClaws: () => boolean
  /** Clears the last Breach's report once the player has read it (layer 6) */
  dismissBreach: () => void
  pendingMilestone: MilestoneDef | null
  acceptMilestone: () => void
  rejectMilestone: () => void
  buildLibrarium: () => boolean
  completeResearch: (id: string) => boolean
  isResearchAvailable: (id: string) => boolean
  /** Set the fighters' rations (only an available one) */
  setRation: (id: RationId) => void
  /** Refugees at the gate: take them in, or turn them away */
  answerRefugees: (takeIn: boolean) => void
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
  const [pendingMilestone, setPendingMilestone] = useState<MilestoneDef | null>(null)
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

  // Nothing earns renown per second (chapter 5): the army wears down the monster, and renown
  // comes from its kill

  // A lean season or a bountiful harvest scales what the gatherers bring in (layer 3, phase C)
  const autoFoodRate = getAutoFoodRate(state.foragers) * gatherMultiplier(state)

  // Active play clock for the story director's dwell timer (game seconds, follows dev speed)
  useGameLoop(
    useCallback(() => {
      if (!loaded) return
      // Food events run on play time, so they pause while the app is closed.
      // Wanderers too (chapter 4): nobody arrives while the app is closed
      setState((prev) => stepWanderers(stepFoodEvents({ ...prev, playSeconds: prev.playSeconds + 1 }, Math.random), Math.random))
    }, [loaded])
  )

  // The army's volley at the monster (fighters and soldiers, chapter 5): all of them strike
  // together every FIGHTER_SWING_MS, as one hit. The time to the next volley lives in a ref, so a
  // tick in which nothing lands does not re-render.
  // Their ration and how fed they are scale the hit (layer 3); at 0 they stand down
  const fighterPower = fighterDamageMultiplier(state)
  const fighterSwing = useRef(0)
  const army = loaded && fighterPower > 0 ? armySize(state) : 0
  useGameLoop(
    useCallback(() => {
      const { swings, progress } = stepFighterVolley(fighterSwing.current, army)
      fighterSwing.current = progress
      if (swings <= 0) return
      setState((prev) => (armySize(prev) > 0 ? fighterStrike(prev, armyVolleyNow(prev), swings).state : prev))
    }, [army]),
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
        // Whatever does not fit in the granary is lost
        const added = granaryRoom(prev.food, gained)
        return {
          ...prev,
          autoFoodProgress: newProgress - gained,
          food: prev.food + added,
          totalFoodForaged: prev.totalFoodForaged + added,
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

  // The monster at the gate strikes the wall (layer 6; once the Siege system is on)
  useGameLoop(
    useCallback(() => {
      if (!loaded) return
      setState(stepWall)
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
      // A full granary takes nothing more
      const added = granaryRoom(prev.food, getForageYield(prev.foragePower, prev.forageBonus))
      if (added <= 0) return prev
      return {
        ...prev,
        food: prev.food + added,
        totalFoodForaged: prev.totalFoodForaged + added,
        forageClicks: prev.forageClicks + 1,
        foodGatheredByHand: prev.foodGatheredByHand + added,
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

  const sharpenClaws = useCallback((): boolean => {
    let sharpened = false
    setState((prev) => {
      const next = sharpenClawsState(prev)
      sharpened = next !== prev
      return next
    })
    return sharpened
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

  // The Garrison (chapter 5): train a fighter into a conscript, or promote one rank up
  const makeRank = useCallback((tier: SoldierTier): boolean => {
    let made = false
    setState((prev) => {
      const next = makeRankState(prev, tier)
      made = next !== prev
      return next
    })
    return made
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

  const dismissBreach = useCallback(() => {
    setState((prev) => ({ ...prev, pendingBreach: null }))
  }, [])

  const dismissFoodWarning = useCallback(() => {
    setState((prev) => ({ ...prev, pendingFoodWarning: 0 }))
  }, [])

  // Take them in (fed from the stores on arrival) or turn them away; the next is scheduled after
  const acceptWanderer = useCallback(() => {
    setState(welcomeWanderer)
  }, [])

  const rejectWanderer = useCallback(() => {
    setState(turnAwayWanderer)
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

  const setRation = useCallback((id: RationId) => {
    setState((prev) => (isRationAvailable(prev, id) && prev.ration !== id ? { ...prev, ration: id } : prev))
  }, [])

  const answerRefugees = useCallback((takeIn: boolean) => {
    setState((prev) => answerRefugeesState(prev, takeIn, Math.random))
  }, [])

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
    setState((prev) => ({ ...prev, pendingWanderer: rollWandererEncounter(prev, Math.random), nextWandererAt: 0 }))
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
        makeRank,
        buySword,
        buyShield,
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
        sharpenClaws,
        dismissBreach,
        pendingMilestone,
        acceptMilestone,
        rejectMilestone,
        buildLibrarium,
        completeResearch,
        isResearchAvailable,
        markBeatSeen,
        setRation,
        answerRefugees,
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
