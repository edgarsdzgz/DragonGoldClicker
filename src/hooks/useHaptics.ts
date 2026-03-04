/**
 * Haptic Feedback Hook
 *
 * Provides a consistent API for haptic feedback across the app.
 * Respects system settings and handles platform availability.
 *
 * Usage:
 * - Light: Tab switches, gold clicks
 * - Medium: Upgrade purchases
 * - Heavy: ONLY after confirmed destructive action completes
 */

import { useCallback } from 'react'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

const isHapticsAvailable = Platform.OS === 'ios' || Platform.OS === 'android'

export function useHaptics() {
  const light = useCallback(async () => {
    if (!isHapticsAvailable) return
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [])

  const medium = useCallback(async () => {
    if (!isHapticsAvailable) return
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [])

  const heavy = useCallback(async () => {
    if (!isHapticsAvailable) return
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [])

  const selection = useCallback(async () => {
    if (!isHapticsAvailable) return
    try {
      await Haptics.selectionAsync()
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [])

  const success = useCallback(async () => {
    if (!isHapticsAvailable) return
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [])

  const warning = useCallback(async () => {
    if (!isHapticsAvailable) return
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [])

  const error = useCallback(async () => {
    if (!isHapticsAvailable) return
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [])

  return {
    light,
    medium,
    heavy,
    selection,
    success,
    warning,
    error,
    isAvailable: isHapticsAvailable,
  }
}

export default useHaptics
