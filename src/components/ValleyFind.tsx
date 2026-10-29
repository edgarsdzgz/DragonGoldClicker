import React, { useCallback, useEffect, useRef } from 'react'
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native'
import { PixelSprite } from './PixelSprite'
import type { SpriteId } from '../art'
import { FIND_ART_PX, FIND_DRIFT, findDef, findLabel } from '../types/valleyFinds'
import type { FindKind } from '../types/valleyFinds'

/** The official art for each kind (90-valley-finds, locked 2026-10-29); the berry bush empties tap by tap */
export const FIND_SPRITES: Record<FindKind, SpriteId> = {
  rabbit: 'find_rabbit_run_anim',
  berries: 'find_berries_0',
  fish: 'find_fish_leap_anim',
  honey: 'find_honey_anim',
}
/** The bush's state after each tap taken: full, two-thirds, one-third, bare */
const BERRY_STATES: readonly SpriteId[] = ['find_berries_0', 'find_berries_1', 'find_berries_2', 'find_berries_3']
/** A picked bush stays bare this long before it goes */
const BARE_MS = 400

/** The fish leaps this high before it drops back */
const LEAP_DP = 28
const PRESSED_SCALE = 0.9

interface ValleyFindProps {
  kind: FindKind
  /** Top-left corner inside the parent, in dp */
  x: number
  y: number
  /** Width and height in dp: smaller far up the valley, larger close by (types/valleyFinds findSize) */
  size: number
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
 * out (a multi-tap find must be taken in that time). Needs only taps, no hold or drag, and is at
 * least a 48 dp touch target.
 */
export function ValleyFind({ kind, x, y, size, pay, showMs, still = false, drift = 1, onCatch, onGone }: ValleyFindProps) {
  const def = findDef(kind)
  const tapsLeft = useRef(def.taps)
  const [left, setLeft] = React.useState(def.taps)
  const move = useRef(new Animated.Value(0)).current

  // Gone when its time is up
  const goneRef = useRef(onGone)
  goneRef.current = onGone
  const showTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    showTimer.current = setTimeout(() => goneRef.current(), showMs)
    return () => clearTimeout(showTimer.current)
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

  const bareTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(bareTimer.current), [])

  const handlePress = useCallback(() => {
    if (tapsLeft.current <= 0) return
    tapsLeft.current -= 1
    setLeft(tapsLeft.current)
    onCatch(tapsLeft.current)
    if (tapsLeft.current > 0) return
    // The bush shows itself picked bare a moment; everything else goes at once
    if (kind === 'berries') {
      clearTimeout(showTimer.current)
      bareTimer.current = setTimeout(() => goneRef.current(), BARE_MS)
    }
    else onGone()
  }, [kind, onCatch, onGone])

  // A still rabbit sits; a moving one runs. The hare is drawn facing right, so a left drift flips it
  const sprite = kind === 'berries'
    ? BERRY_STATES[Math.min(BERRY_STATES.length - 1, def.taps - left)]
    : kind === 'rabbit' && still ? 'find_rabbit_idle' : FIND_SPRITES[kind]
  const flip = kind === 'rabbit' && drift < 0
  const horizontal = kind === 'rabbit'
  return (
    <Animated.View
      style={[styles.spot, { left: x, top: y, width: size, height: size, transform: [horizontal ? { translateX: move } : { translateY: move }] }]}
    >
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={findLabel(def, left, pay)}
        style={({ pressed }) => [styles.touch, pressed && { transform: [{ scale: PRESSED_SCALE }] }]}
      >
        <View style={flip ? styles.flipped : undefined}>
          <PixelSprite id={sprite} scale={size / FIND_ART_PX} />
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  spot: {
    position: 'absolute',
  },
  touch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipped: {
    transform: [{ scaleX: -1 }],
  },
})
