import React, { useCallback, useEffect, useRef } from 'react'
import { Animated, Easing, Pressable, StyleSheet } from 'react-native'
import { GameIcon } from './GameIcon'
import type { GameIconName } from '../art'
import { FIND_DRIFT, FIND_SIZE, findDef, findLabel } from '../types/valleyFinds'
import type { FindKind } from '../types/valleyFinds'

/** The picture for each kind. Stand-in icons until the Valley Finds art batch is approved: swap them here */
export const FIND_ICONS: Record<FindKind, GameIconName> = {
  rabbit: 'icon_food',
  berries: 'icon_wheat',
  fish: 'icon_sparkles',
  honey: 'icon_star',
}

const ICON_SIZE = 32
/** The fish leaps this high before it drops back */
const LEAP_DP = 28
const PRESSED_SCALE = 0.9

interface ValleyFindProps {
  kind: FindKind
  /** Top-left corner inside the parent, in dp */
  x: number
  y: number
  /** Food one tap pays (already scaled by the forage yield) */
  pay: number
  /** How long it shows, in ms (already lengthened for Reduce Motion or a screen reader) */
  showMs: number
  /** Stands still (Reduce Motion) */
  still?: boolean
  /** Which way a drifting find moves: -1 left, 1 right (types/valleyFinds driftDirection) */
  drift?: -1 | 1
  /** Called on every tap, with the taps left after it */
  onCatch: (tapsLeft: number) => void
  /** The find is over: the last tap, or its time ran out */
  onGone: () => void
}

/**
 * Something in the valley to tap for bonus food. Goes at its last tap, or when its `showMs` runs
 * out (a multi-tap find must be taken in that time). Needs only taps, no hold or drag, and is a
 * 56 dp touch target.
 */
export function ValleyFind({ kind, x, y, pay, showMs, still = false, drift = 1, onCatch, onGone }: ValleyFindProps) {
  const def = findDef(kind)
  const tapsLeft = useRef(def.taps)
  const [left, setLeft] = React.useState(def.taps)
  const move = useRef(new Animated.Value(0)).current

  // Gone when its time is up
  const goneRef = useRef(onGone)
  goneRef.current = onGone
  useEffect(() => {
    const timer = setTimeout(() => goneRef.current(), showMs)
    return () => clearTimeout(timer)
  }, [showMs])

  // The rabbit drifts sideways; the fish leaps up and drops back
  useEffect(() => {
    if (still) return
    const run = kind === 'fish'
      ? Animated.sequence([
          Animated.timing(move, { toValue: -LEAP_DP, duration: showMs / 2, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(move, { toValue: 0, duration: showMs / 2, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ])
      : kind === 'rabbit'
        ? Animated.timing(move, { toValue: FIND_DRIFT * drift, duration: showMs, easing: Easing.linear, useNativeDriver: true })
        : null
    run?.start()
    return () => run?.stop()
  }, [kind, showMs, still, drift, move])

  const handlePress = useCallback(() => {
    if (tapsLeft.current <= 0) return
    tapsLeft.current -= 1
    setLeft(tapsLeft.current)
    onCatch(tapsLeft.current)
    if (tapsLeft.current === 0) onGone()
  }, [onCatch, onGone])

  const horizontal = kind === 'rabbit'
  return (
    <Animated.View
      style={[styles.spot, { left: x, top: y, transform: [horizontal ? { translateX: move } : { translateY: move }] }]}
    >
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={findLabel(def, left, pay)}
        style={({ pressed }) => [styles.touch, pressed && { transform: [{ scale: PRESSED_SCALE }] }]}
      >
        <GameIcon name={FIND_ICONS[kind]} size={ICON_SIZE} />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  spot: {
    position: 'absolute',
    width: FIND_SIZE,
    height: FIND_SIZE,
  },
  touch: {
    width: FIND_SIZE,
    height: FIND_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
