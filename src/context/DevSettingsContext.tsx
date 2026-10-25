import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Development-only test controls (speed and story pacing).
 *
 * In release builds (__DEV__ false) the provider ignores storage and always
 * reports speed 1 and live pacing, so none of this can reach players.
 */

const STORAGE_KEY = '@dragongold/dev_settings'

export const GAME_SPEEDS = [1, 5, 20, 100] as const
export type GameSpeed = typeof GAME_SPEEDS[number]

/** 'test' shortens story dwell times; 'live' uses the real hours-long pacing */
export type Pacing = 'test' | 'live'

interface DevSettings {
  speed: GameSpeed
  pacing: Pacing
}

const DEV_DEFAULTS: DevSettings = { speed: 1, pacing: 'test' }
const RELEASE_SETTINGS: DevSettings = { speed: 1, pacing: 'live' }

interface DevSettingsContextType extends DevSettings {
  isDev: boolean
  setSpeed: (speed: GameSpeed) => void
  setPacing: (pacing: Pacing) => void
}

const DevSettingsContext = createContext<DevSettingsContextType | null>(null)

export function DevSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<DevSettings>(__DEV__ ? DEV_DEFAULTS : RELEASE_SETTINGS)
  const [loaded, setLoaded] = useState(!__DEV__)

  useEffect(() => {
    if (!__DEV__) return
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return
        const parsed = JSON.parse(raw) as Partial<DevSettings>
        const speed = GAME_SPEEDS.includes(parsed.speed as GameSpeed) ? (parsed.speed as GameSpeed) : 1
        const pacing: Pacing = parsed.pacing === 'live' ? 'live' : 'test'
        setSettings({ speed, pacing })
      })
      .catch(() => { /* use defaults */ })
      .finally(() => setLoaded(true))
  }, [])

  const update = useCallback((partial: Partial<DevSettings>) => {
    if (!__DEV__) return
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {})
      return next
    })
  }, [])

  const setSpeed = useCallback((speed: GameSpeed) => update({ speed }), [update])
  const setPacing = useCallback((pacing: Pacing) => update({ pacing }), [update])

  if (!loaded) return null

  return (
    <DevSettingsContext.Provider value={{ ...settings, isDev: __DEV__, setSpeed, setPacing }}>
      {children}
    </DevSettingsContext.Provider>
  )
}

export function useDevSettings() {
  const ctx = useContext(DevSettingsContext)
  if (!ctx) throw new Error('useDevSettings must be used within DevSettingsProvider')
  return ctx
}
