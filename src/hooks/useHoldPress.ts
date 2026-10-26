import { useRef, useCallback, useEffect } from 'react'
import { AppState } from 'react-native'
import { useIsFocused } from '@react-navigation/native'

const HOLD_DELAY_MS = 300
const REPEAT_INTERVAL_MS = 250

interface HoldPressOptions {
  /** Wait before repeating starts (default 300ms) */
  delayMs?: number
  /** Time between repeats (default 250ms) */
  intervalMs?: number
}

/**
 * Hook for hold-to-repeat press behavior.
 * Fires `onTap` immediately on press. After a short delay, begins repeating
 * `onHoldTick` at a fixed interval until released.
 *
 * Returns pressIn/pressOut handlers for use with Pressable. The repeat also stops when the
 * component unmounts, its screen loses focus, or the app leaves the foreground, so a
 * canceled press can never keep striking.
 */
export function useHoldPress(
  onTap: () => void,
  onHoldTick: () => void,
  { delayMs = HOLD_DELAY_MS, intervalMs = REPEAT_INTERVAL_MS }: HoldPressOptions = {},
) {
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const holdingRef = useRef(false)

  const clear = useCallback(() => {
    if (delayRef.current) {
      clearTimeout(delayRef.current)
      delayRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    holdingRef.current = false
  }, [])

  const onPressIn = useCallback(() => {
    clear()
    onTap()
    delayRef.current = setTimeout(() => {
      holdingRef.current = true
      onHoldTick()
      intervalRef.current = setInterval(onHoldTick, intervalMs)
    }, delayMs)
  }, [onTap, onHoldTick, clear, delayMs, intervalMs])

  const onPressOut = useCallback(() => {
    clear()
  }, [clear])

  const focused = useIsFocused()
  useEffect(() => {
    if (!focused) clear()
  }, [focused, clear])

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') clear()
    })
    return () => sub.remove()
  }, [clear])

  // Unmount
  useEffect(() => clear, [clear])

  const isHolding = useCallback(() => holdingRef.current, [])

  return { onPressIn, onPressOut, isHolding }
}
