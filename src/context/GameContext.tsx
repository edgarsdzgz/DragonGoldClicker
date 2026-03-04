import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { GameState, UpgradeId } from '../types/game'
import {
  DEFAULT_GAME_STATE,
  UPGRADES,
  getUpgradeCost,
  getIdleIncome,
} from '../types/game'
import { useStorage } from '../hooks/useStorage'
import { useGameLoop } from '../hooks/useGameLoop'

interface GameContextType {
  state: GameState
  click: () => void
  buyUpgrade: (id: UpgradeId) => boolean
  idleIncome: number
  getUpgradePrice: (id: UpgradeId) => number
  canAfford: (id: UpgradeId) => boolean
  resetGame: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_GAME_STATE)
  const [loaded, setLoaded] = useState(false)
  const { save, load, clear } = useStorage()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load saved state on mount
  useEffect(() => {
    load().then((savedState) => {
      setState(savedState)
      setLoaded(true)
    })
  }, [load])

  // Debounced auto-save when state changes
  useEffect(() => {
    if (!loaded) return
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(() => {
      save(state)
    }, 2000)
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [state, loaded, save])

  const idleIncome = getIdleIncome(state.upgrades)

  // Idle income tick
  useGameLoop(
    useCallback(() => {
      if (!loaded || idleIncome <= 0) return
      setState((prev) => ({
        ...prev,
        gold: prev.gold + idleIncome,
        totalGoldEarned: prev.totalGoldEarned + idleIncome,
      }))
    }, [loaded, idleIncome])
  )

  const click = useCallback(() => {
    setState((prev) => ({
      ...prev,
      gold: prev.gold + prev.clickPower,
      totalGoldEarned: prev.totalGoldEarned + prev.clickPower,
      totalClicks: prev.totalClicks + 1,
    }))
  }, [])

  const getUpgradePrice = useCallback(
    (id: UpgradeId): number => {
      const def = UPGRADES.find((u) => u.id === id)
      if (!def) return Infinity
      return getUpgradeCost(def, state.upgrades[id])
    },
    [state.upgrades]
  )

  const canAfford = useCallback(
    (id: UpgradeId): boolean => {
      return state.gold >= getUpgradePrice(id)
    },
    [state.gold, getUpgradePrice]
  )

  const buyUpgrade = useCallback(
    (id: UpgradeId): boolean => {
      const def = UPGRADES.find((u) => u.id === id)
      if (!def) return false

      const cost = getUpgradeCost(def, state.upgrades[id])
      if (state.gold < cost) return false

      setState((prev) => {
        const newUpgrades = { ...prev.upgrades, [id]: prev.upgrades[id] + 1 }
        const clickBonus = def.clickPower ?? 0
        return {
          ...prev,
          gold: prev.gold - cost,
          upgrades: newUpgrades,
          clickPower: prev.clickPower + clickBonus,
        }
      })
      return true
    },
    [state.gold, state.upgrades]
  )

  const resetGame = useCallback(() => {
    const fresh = { ...DEFAULT_GAME_STATE, startedAt: Date.now() }
    setState(fresh)
    clear()
  }, [clear])

  if (!loaded) return null

  return (
    <GameContext.Provider
      value={{
        state,
        click,
        buyUpgrade,
        idleIncome,
        getUpgradePrice,
        canAfford,
        resetGame,
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
