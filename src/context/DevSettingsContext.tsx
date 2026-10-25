import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DEV_TOOLS_ENABLED } from '../config/devTools'

/**
 * Development-only test controls (speed and story pacing).
 *
 * In player builds (DEV_TOOLS_ENABLED false) the provider ignores storage and always
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
  const [settings, setSettings] = useState<DevSettings>(DEV_TOOLS_ENABLED ? DEV_DEFAULTS : RELEASE_SETTINGS)
  const [loaded, setLoaded] = useState(!DEV_TOOLS_ENABLED)

  useEffect(() => {
    if (!DEV_TOOLS_ENABLED) return
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
    if (!DEV_TOOLS_ENABLED) return
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
    <DevSettingsContext.Provider value={{ ...settings, isDev: DEV_TOOLS_ENABLED, setSpeed, setPacing }}>
      {children}
    </DevSettingsContext.Provider>
  )
}

export function useDevSettings() {
  const ctx = useContext(DevSettingsContext)
  if (!ctx) throw new Error('useDevSettings must be used within DevSettingsProvider')
  return ctx
}
