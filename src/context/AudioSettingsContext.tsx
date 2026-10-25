import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = '@dragongold/audio_settings'

interface AudioSettings {
  musicVolume: number
  sfxVolume: number
  musicMuted: boolean
  sfxMuted: boolean
  /** Vibration feedback on taps and events (stored here so all feedback settings persist together) */
  hapticsEnabled: boolean
}

const DEFAULT_SETTINGS: AudioSettings = {
  musicVolume: 0.4,
  sfxVolume: 0.7,
  musicMuted: false,
  sfxMuted: false,
  hapticsEnabled: true,
}

interface AudioSettingsContextType {
  musicVolume: number
  sfxVolume: number
  musicMuted: boolean
  sfxMuted: boolean
  hapticsEnabled: boolean
  /** Effective music volume (0 when muted) */
  effectiveMusicVolume: number
  /** Effective SFX volume (0 when muted) */
  effectiveSfxVolume: number
  setMusicVolume: (v: number) => void
  setSfxVolume: (v: number) => void
  toggleMusicMute: () => void
  toggleSfxMute: () => void
  toggleHaptics: () => void
  muteAll: () => void
  unmuteAll: () => void
}

const AudioSettingsContext = createContext<AudioSettingsContextType | null>(null)

export function AudioSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load persisted settings on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          setSettings({ ...DEFAULT_SETTINGS, ...parsed })
        } catch { /* use defaults */ }
      }
      setLoaded(true)
    })
  }, [])

  // Debounced save -- avoids thrashing AsyncStorage while dragging sliders
  const persist = useCallback((next: AudioSettings) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {})
    }, 300)
  }, [])

  const update = useCallback((partial: Partial<AudioSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      persist(next)
      return next
    })
  }, [persist])

  const setMusicVolume = useCallback((v: number) => update({ musicVolume: v }), [update])
  const setSfxVolume = useCallback((v: number) => update({ sfxVolume: v }), [update])
  const toggleMusicMute = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, musicMuted: !prev.musicMuted }
      persist(next)
      return next
    })
  }, [persist])
  const toggleSfxMute = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, sfxMuted: !prev.sfxMuted }
      persist(next)
      return next
    })
  }, [persist])
  const toggleHaptics = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, hapticsEnabled: !prev.hapticsEnabled }
      persist(next)
      return next
    })
  }, [persist])
  const muteAll = useCallback(() => update({ musicMuted: true, sfxMuted: true }), [update])
  const unmuteAll = useCallback(() => update({ musicMuted: false, sfxMuted: false }), [update])

  const value: AudioSettingsContextType = {
    ...settings,
    effectiveMusicVolume: settings.musicMuted ? 0 : settings.musicVolume,
    effectiveSfxVolume: settings.sfxMuted ? 0 : settings.sfxVolume,
    setMusicVolume,
    setSfxVolume,
    toggleMusicMute,
    toggleSfxMute,
    toggleHaptics,
    muteAll,
    unmuteAll,
  }

  if (!loaded) return null

  return (
    <AudioSettingsContext.Provider value={value}>
      {children}
    </AudioSettingsContext.Provider>
  )
}

export function useAudioSettings() {
  const ctx = useContext(AudioSettingsContext)
  if (!ctx) throw new Error('useAudioSettings must be used within AudioSettingsProvider')
  return ctx
}
