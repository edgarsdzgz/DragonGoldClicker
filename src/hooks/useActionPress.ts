import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { useHoldPress } from './useHoldPress'

/**
 * Owner rulings (2026-10-26): every main button presses the same way, and holding repeats once
 * every 750ms everywhere (first set for the strike: holding stays deliberate).
 */
export const HOLD_REPEAT_MS = 750
/** A press held this long shows the hold pulse (before the first repeat lands) */
export const HOLD_PULSE_MS = 300

export type PressKind = 'tap' | 'hold'

interface ActionPressOptions {
  /** Holding repeats the action. Off for buttons that spend (one tap, one purchase). */
  repeatOnHold?: boolean
}

/**
 * The shared press behavior of every main button (the battlefield, FORAGE, RALLY, REPAIR, TRAIN):
 * - A touch fires the action at once (on press-in, so rapid taps are never lost).
 * - Holding (when `repeatOnHold`) repeats it every HOLD_REPEAT_MS, and `holding` turns on for
 *   the hold pulse.
 * - A screen reader's activation (a press with no touch) fires it once.
 * - Leaving the screen, the app going to the background or `cancel()` stops a hold.
 * Spread `handlers` onto a Pressable.
 */
export function useActionPress(action: (kind: PressKind) => void, { repeatOnHold = false }: ActionPressOptions = {}) {
  const [holding, setHolding] = useState(false)
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // A touch also ends in onPress, which the press-in already fired for: remember the touch just
  // long enough to skip that one
  const touching = useRef(false)
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tap = useCallback(() => action('tap'), [action])
  const tick = useCallback(() => action('hold'), [action])
  const hold = useHoldPress(tap, tick, { delayMs: HOLD_REPEAT_MS, intervalMs: HOLD_REPEAT_MS })
  const stopRepeat = hold.onPressOut

  const clearTimers = useCallback(() => {
    if (pulseTimer.current) clearTimeout(pulseTimer.current)
    if (touchTimer.current) clearTimeout(touchTimer.current)
    pulseTimer.current = null
    touchTimer.current = null
  }, [])

  const cancel = useCallback(() => {
    stopRepeat()
    clearTimers()
    touching.current = false
    setHolding(false)
  }, [stopRepeat, clearTimers])

  const onPressIn = useCallback(() => {
    touching.current = true
    if (!repeatOnHold) {
      tap()
      return
    }
    if (pulseTimer.current) clearTimeout(pulseTimer.current)
    pulseTimer.current = setTimeout(() => setHolding(true), HOLD_PULSE_MS)
    hold.onPressIn()
  }, [repeatOnHold, tap, hold])

  const onPressOut = useCallback(() => {
    stopRepeat()
    if (pulseTimer.current) clearTimeout(pulseTimer.current)
    pulseTimer.current = null
    setHolding(false)
    if (touchTimer.current) clearTimeout(touchTimer.current)
    touchTimer.current = setTimeout(() => { touching.current = false }, 400)
  }, [stopRepeat])

  const onPress = useCallback(() => {
    if (!touching.current) tap()
  }, [tap])

  const focused = useIsFocused()
  useEffect(() => {
    if (!focused) cancel()
  }, [focused, cancel])

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') cancel()
    })
    return () => sub.remove()
  }, [cancel])

  useEffect(() => () => clearTimers(), [clearTimers])

  return { handlers: { onPressIn, onPressOut, onPress }, holding, cancel }
}
