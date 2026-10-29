import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { AppState } from 'react-native'
import { DEV_TOOLS_ENABLED } from '../config/devTools'
import type { GameState, SoldierTier, ForagerTier, RoleId, WandererEncounter } from '../types/game'
import {
  DEFAULT_GAME_STATE,
  ARMORY_COST,
  BARRACKS_LEVELS,
  MAX_OFFLINE_LEVEL,
  getOfflineUpgradeCost,
  getFoodEventsRemaining,
  getForageYield,
  LODGE_LEVELS,
  getAutoFoodRate,
  DRACONIA_HALL_COST,
  rollWandererEncounter,
  stepWanderers,
  welcomeWanderer,
  turnAwayWanderer,
  getFighterCost,
  getRepairerCost,
  stepFighterVolley,
  FIGHTER_TICK_MS,
  MAX_CITY_HP,
  granaryRoom,
  isSystemOn,
  isBuildingRevealed,
} from '../types/game'
import { stepFood } from '../types/foodTick'
import { stepWall } from '../types/wall'
import { applyFind } from '../types/valleyFinds'
import { strike, fighterStrike, varnBreath } from '../types/monsters'
import { VARN_BREATH_SEC, buildWizardTower as buildWizardTowerState, varnOnWall } from '../types/allies'
import { completeQuests, hasQuestToComplete } from '../types/quests'
import { fighterDamageMultiplier } from '../types/fedState'
import { stepFoodEvents, gatherMultiplier, answerRefugees as answerRefugeesState } from '../types/foodEvents'
import { isRationAvailable } from '../types/rations'
import type { RationId } from '../types/rations'
import { upgradePost, trainExplorer as trainExplorerState, sendExpedition as sendExpeditionState, claimExpedition as claimExpeditionState } from '../types/outpost'
import { sharpenClaws as sharpenClawsState, tapHit } from '../types/claws'
import { repairRateNow } from '../types/siege'
import { buildLibrarium as buildLibrariumState, study } from '../types/library'
import { armySize, armyVolleyNow, makeRank as makeRankState } from '../types/army'
import { forgeGear } from '../types/forge'
import { makeForager as makeForagerState } from '../types/lodge'
import { moveMany } from '../types/reassignment'
import type { Gear } from '../types/forge'
import { useStorage } from '../hooks/useStorage'
import type { OfflineEarnings, LoadedGame } from '../hooks/useStorage'
import { useGameLoop } from '../hooks/useGameLoop'

interface GameContextType {
  state: GameState
  /** One tap at the Gate; `double` when it rolled a double strike (Weak Points) */
  click: (double?: boolean) => void
  forage: () => void
  /** Tap on a Valley Find: its food goes to the stores, but it is not a forage trip */
  catchFind: (food: number) => void
  buildOrUpgradeBarracks: () => void
  buildArmory: () => void
  /** Train a fighter into a conscript, or promote a soldier one rank up (types/army.ts) */
  makeRank: (tier: SoldierTier) => void
  buySword: () => void
  buyShield: () => void
  upgradeOffline: () => void
  buildOrUpgradeLodge: () => void
  trainForager: (tier: ForagerTier) => void
  buildOrUpgradePost: () => void
  trainExplorer: () => void
  sendExpedition: () => void
  /** Bring a returned expedition home; its report waits in `state.expeditionReport` */
  claimExpedition: (id: number) => void
  dismissExpeditionReport: () => void
  buildDraconiaHall: () => void
  /** Move `count` people (default 1) between jobs at the Keep */
  reassignRole: (from: RoleId, to: RoleId, count?: number) => void
  autoFoodRate: number
  foodWarningLevel: 0 | 3 | 1
  resetGame: () => void
  pendingOfflineEarnings: OfflineEarnings | null
  dismissOfflineEarnings: () => void
  pendingFoodWarning: 0 | 3 | 1
  dismissFoodWarning: () => void
  pendingWanderer: WandererEncounter | null
  acceptWanderer: () => void
  rejectWanderer: () => void
  rallyFighter: () => void
  directRepairer: () => void
  /** Buy the next level of the dragon's claws (layer 3) */
  sharpenClaws: () => void
  /** Clears the last Breach's report once the player has read it (layer 6) */
  dismissBreach: () => void
  /** Hold the monster's blows on the wall (while a story scene is open), or let them land again */
  holdWall: (held: boolean) => void
  buildLibrarium: () => void
  completeResearch: (id: string) => void
  /** Raise Thornwick's tower (chapter 11) */
  buildWizardTower: () => void
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

export function GameProvider({ children, initial }: {
  children: React.ReactNode
  /** The game the title screen loaded; without it the provider reads the save itself */
  initial?: LoadedGame
}) {
  const [state, setState] = useState<GameState>(initial?.state ?? DEFAULT_GAME_STATE)
  const [loaded, setLoaded] = useState(initial !== undefined)
  const [pendingOfflineEarnings, setPendingOfflineEarnings] = useState<OfflineEarnings | null>(initial?.offlineEarnings ?? null)
  const { save, load, clear } = useStorage()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const preloaded = useRef(initial !== undefined)
  useEffect(() => {
    if (preloaded.current) return
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

  const { pendingFoodWarning, pendingWanderer } = state

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

  // Varn on the gatehouse tower (chapter 9): every VARN_BREATH_SEC he breathes fire at the monster.
  // His clock lives in a ref, so the seconds between breaths do not re-render.
  const varnHere = loaded && varnOnWall(state)
  const varnClock = useRef(0)
  useGameLoop(
    useCallback(() => {
      if (!varnHere) return
      varnClock.current += 1
      if (varnClock.current < VARN_BREATH_SEC) return
      varnClock.current = 0
      // Not while the wall lies breached (he is not on it then)
      setState((prev) => (prev.cityHp > 0 ? varnBreath(prev).state : prev))
    }, [varnHere])
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
      setState((prev) => (isSystemOn(prev, 'hunger') ? stepFood(prev) : prev))
    }, [loaded])
  )

  // The monster at the gate strikes the wall (layer 6; once the Siege system is on). Owner ruling
  // (2026-10-29): it waits while a story scene is open, so reading never costs the wall.
  const wallHeld = useRef(false)
  const holdWall = useCallback((held: boolean) => { wallHeld.current = held }, [])
  useGameLoop(
    useCallback(() => {
      if (!loaded || wallHeld.current) return
      setState(stepWall)
    }, [loaded])
  )

  // Repair loop (repairers heal city HP continuously, once the Repair system is on)
  useGameLoop(
    useCallback(() => {
      if (!loaded) return
      setState((prev) => {
        if (!isSystemOn(prev, 'repair') || prev.repairers <= 0 || prev.cityHp >= MAX_CITY_HP || prev.cityHp <= 0) return prev
        const rate = repairRateNow(prev)
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


  // Quests: a goal that is met completes at once and pays its reward (the toast or the story
  // beat that follows is the UI's job)
  useEffect(() => {
    if (loaded && hasQuestToComplete(state)) setState((prev) => completeQuests(prev).state)
  }, [loaded, state])

  // One tap hits the monster; the bounty is paid and the kill counted on its death (types/monsters.ts)
  const click = useCallback((double = false) => {
    setState((prev) => strike(prev, tapHit(prev, double)).state)
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

  const catchFind = useCallback((food: number) => {
    setState((prev) => applyFind(prev, food))
  }, [])

  const rallyFighter = useCallback(() => {
    setState((prev) => {
      if (prev.villagers <= 0) return prev
      const cost = getFighterCost(prev.fightersRallied)
      if (prev.inspiration < cost) return prev
      return {
        ...prev,
        inspiration: prev.inspiration - cost,
        totalInspirationSpent: prev.totalInspirationSpent + cost,
        villagers: prev.villagers - 1,
        fighters: prev.fighters + 1,
        fightersRallied: prev.fightersRallied + 1,
      }
    })
  }, [])

  const directRepairer = useCallback(() => {
    setState((prev) => {
      if (prev.villagers <= 0) return prev
      if (!isSystemOn(prev, 'repair')) return prev
      const cost = getRepairerCost(prev.repairersDirected)
      if (prev.inspiration < cost) return prev
      return {
        ...prev,
        inspiration: prev.inspiration - cost,
        totalInspirationSpent: prev.totalInspirationSpent + cost,
        villagers: prev.villagers - 1,
        repairers: prev.repairers + 1,
        repairersDirected: prev.repairersDirected + 1,
      }
    })
  }, [])

  const sharpenClaws = useCallback(() => {
    setState((prev) => sharpenClawsState(prev))
  }, [])

  const buildOrUpgradeBarracks = useCallback(() => {
    setState((prev) => {
      const nextLevel = prev.barracksLevel + 1
      const def = BARRACKS_LEVELS.find((l) => l.level === nextLevel)
      if (!def || prev.inspiration < def.cost) return prev
      return {
        ...prev,
        inspiration: prev.inspiration - def.cost,
        totalInspirationSpent: prev.totalInspirationSpent + def.cost,
        barracksLevel: nextLevel,
      }
    })
  }, [])

  const buildArmory = useCallback(() => {
    setState((prev) => {
      if (prev.armoryBuilt || prev.inspiration < ARMORY_COST) return prev
      return { ...prev, inspiration: prev.inspiration - ARMORY_COST, totalInspirationSpent: prev.totalInspirationSpent + ARMORY_COST, armoryBuilt: true }
    })
  }, [])

  // The Garrison (chapter 5): train a fighter into a conscript, or promote one rank up
  const makeRank = useCallback((tier: SoldierTier) => {
    setState((prev) => makeRankState(prev, tier))
  }, [])

  // Kael's Forge (chapter 5 phase B): gear for the next soldier in line, best ranks first
  const forge = useCallback((gear: Gear) => {
    setState((prev) => forgeGear(prev, gear))
  }, [])

  const buySword = useCallback(() => forge('sword'), [forge])
  const buyShield = useCallback(() => forge('shield'), [forge])

  const buildOrUpgradeLodge = useCallback(() => {
    setState((prev) => {
      if (!isBuildingRevealed(prev, 'lodge')) return prev
      const nextLevel = prev.lodgeLevel + 1
      const def = LODGE_LEVELS.find((l) => l.level === nextLevel)
      if (!def || prev.inspiration < def.cost) return prev
      return {
        ...prev,
        inspiration: prev.inspiration - def.cost,
        totalInspirationSpent: prev.totalInspirationSpent + def.cost,
        lodgeLevel: nextLevel,
      }
    })
  }, [])

  // Train a villager into a gatherer, or promote at the Lodge (chapter 5 phase C)
  const trainForager = useCallback((tier: ForagerTier) => {
    setState((prev) => makeForagerState(prev, tier))
  }, [])

  // The Outpost (chapter 7): rules in types/outpost.ts; the dice and the clock are rolled here
  const buildOrUpgradePost = useCallback(() => {
    setState(upgradePost)
  }, [])

  const trainExplorer = useCallback(() => {
    setState(trainExplorerState)
  }, [])

  const sendExpedition = useCallback(() => {
    const now = Date.now()
    setState((prev) => sendExpeditionState(prev, now))
  }, [])

  const claimExpedition = useCallback((id: number) => {
    const now = Date.now()
    const roll = Math.random()
    setState((prev) => claimExpeditionState(prev, id, now, roll))
  }, [])

  const dismissExpeditionReport = useCallback(() => {
    setState((prev) => ({ ...prev, expeditionReport: null }))
  }, [])

  const buildDraconiaHall = useCallback(() => {
    setState((prev) => {
      if (prev.draconiaHallBuilt || prev.inspiration < DRACONIA_HALL_COST) return prev
      return {
        ...prev,
        inspiration: prev.inspiration - DRACONIA_HALL_COST,
        totalInspirationSpent: prev.totalInspirationSpent + DRACONIA_HALL_COST,
        draconiaHallBuilt: true,
      }
    })
  }, [])

  // The Keep (chapter 5 phase C): move people to another job, free and with no refund; "all"
  // moves them in one update (moveMany), so every move lands
  const reassignRole = useCallback((from: RoleId, to: RoleId, count = 1) => {
    setState((prev) => (prev.draconiaHallBuilt ? moveMany(prev, from, to, count) : prev))
  }, [])

  const upgradeOffline = useCallback(() => {
    setState((prev) => {
      if (prev.offlineLevel >= MAX_OFFLINE_LEVEL) return prev
      const cost = getOfflineUpgradeCost(prev.offlineLevel)
      if (cost === null || prev.inspiration < cost) return prev
      return {
        ...prev,
        inspiration: prev.inspiration - cost,
        totalInspirationSpent: prev.totalInspirationSpent + cost,
        offlineLevel: prev.offlineLevel + 1,
      }
    })
  }, [])

  const dismissOfflineEarnings = useCallback(() => {
    setPendingOfflineEarnings(null)
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

  const buildLibrarium = useCallback(() => {
    setState((prev) => buildLibrariumState(prev))
  }, [])

  const completeResearch = useCallback((id: string) => {
    setState((prev) => study(prev, id))
  }, [])

  const buildWizardTower = useCallback(() => {
    setState((prev) => buildWizardTowerState(prev))
  }, [])

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
        catchFind,
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
        dismissExpeditionReport,
        buildDraconiaHall,
        reassignRole,
        autoFoodRate,
        resetGame,
        pendingOfflineEarnings,
        dismissOfflineEarnings,
        foodWarningLevel,
        pendingFoodWarning,
        dismissFoodWarning,
        pendingWanderer,
        acceptWanderer,
        rejectWanderer,
        rallyFighter,
        directRepairer,
        sharpenClaws,
        dismissBreach,
        holdWall,
        buildLibrarium,
        completeResearch,
        buildWizardTower,
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
