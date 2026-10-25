/**
 * Haptic Feedback Hook
 *
 * Provides a consistent API for haptic feedback across the app.
 * Respects the in-game Vibration setting and handles platform availability.
 *
 * Usage:
 * - Light: Tab switches, gold clicks
 * - Medium: Upgrade purchases
 * - Heavy: ONLY after confirmed destructive action completes
 */

import { useCallback } from 'react'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'
import { useAudioSettings } from '../context/AudioSettingsContext'

const isHapticsAvailable = Platform.OS === 'ios' || Platform.OS === 'android'

export function useHaptics() {
  const { hapticsEnabled } = useAudioSettings()

  const fire = useCallback(async (effect: () => Promise<void>) => {
    if (!isHapticsAvailable || !hapticsEnabled) return
    try {
      await effect()
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [hapticsEnabled])

  const light = useCallback(
    () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
    [fire],
  )
  const medium = useCallback(
    () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
    [fire],
  )
  const heavy = useCallback(
    () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
    [fire],
  )
  const selection = useCallback(() => fire(() => Haptics.selectionAsync()), [fire])
  const success = useCallback(
    () => fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
    [fire],
  )
  const warning = useCallback(
    () => fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
    [fire],
  )
  const error = useCallback(
    () => fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
    [fire],
  )

  return {
    light,
    medium,
    heavy,
    selection,
    success,
    warning,
    error,
    isAvailable: isHapticsAvailable && hapticsEnabled,
  }
}

export default useHaptics
