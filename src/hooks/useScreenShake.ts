import { useEffect, useRef } from 'react'
import { Animated, AccessibilityInfo } from 'react-native'

interface ShakeOptions {
  /** Peak sideways travel in px */
  amplitude?: number
  /** Total length in ms */
  duration?: number
}

/**
 * Shakes whatever the returned style is applied to, each time `trigger` changes
 * (not on first render). Skipped when the player has Reduce Motion on.
 *
 *   const shakeStyle = useScreenShake(shakeNonce)
 *   <Animated.View style={[styles.container, shakeStyle]}>
 */
export function useScreenShake(trigger: number, { amplitude = 9, duration = 420 }: ShakeOptions = {}) {
  const x = useRef(new Animated.Value(0)).current
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    let canceled = false
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (canceled || reduce) return
      const step = duration / 6
      const hop = (to: number) => Animated.timing(x, { toValue: to, duration: step, useNativeDriver: true })
      Animated.sequence([
        hop(amplitude), hop(-amplitude), hop(amplitude * 0.7), hop(-amplitude * 0.5), hop(amplitude * 0.25), hop(0),
      ]).start()
    })
    return () => {
      canceled = true
    }
  }, [trigger, amplitude, duration, x])

  return { transform: [{ translateX: x }] }
}
