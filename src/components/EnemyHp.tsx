import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Animated, LayoutChangeEvent } from 'react-native'
import { Text } from './Text'
import { useReduceMotion } from '../hooks/useReduceMotion'
import { shownHp } from '../types/monsters'
import { colors, gold } from '../theme'

/** How long the lost chunk stays white before it drains */
const TRAIL_HOLD_MS = 400
const TRAIL_DRAIN_MS = 250

interface EnemyHpProps {
  hp: number
  max: number
  /** Total width available, in dp */
  width: number
}

/**
 * The enemy's HP: one long bar that drains in proportion to the damage taken, so a tap takes a
 * big bite and a fighter's swing a sliver. The HP just lost shows white for a moment, then
 * drains. "cur / max" sits above it (rounded up). Screen readers get the HP from the
 * battlefield's label, so this stays hidden from them.
 */
export function EnemyHp({ hp, max, width }: EnemyHpProps) {
  const reduceMotion = useReduceMotion()
  const [trackW, setTrackW] = useState(width)
  const fraction = Math.max(0, Math.min(1, hp / max))
  // The white chunk starts at the old fraction and drains to the new one
  const trail = useRef(new Animated.Value(fraction)).current
  const last = useRef(fraction)

  useEffect(() => {
    if (fraction < last.current) {
      trail.setValue(last.current)
      Animated.timing(trail, {
        toValue: fraction,
        duration: reduceMotion ? 0 : TRAIL_DRAIN_MS,
        delay: reduceMotion ? 0 : TRAIL_HOLD_MS,
        useNativeDriver: true,
      }).start()
    } else {
      trail.setValue(fraction)
    }
    last.current = fraction
  }, [fraction, trail, reduceMotion])

  // Anchor a scaled bar to its left edge (scaleX pivots on the center)
  const anchored = (value: Animated.Value | Animated.AnimatedInterpolation<number>) => ({
    transform: [
      { translateX: Animated.multiply(Animated.subtract(1, value), -trackW / 2) },
      { scaleX: value },
    ],
  })

  return (
    <View
      style={[styles.root, { width }]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <Text variant="caption" center style={styles.hpText}>{`${shownHp(hp)} / ${max}`}</Text>
      <View style={styles.track} onLayout={(e: LayoutChangeEvent) => setTrackW(e.nativeEvent.layout.width)}>
        <Animated.View style={[styles.fill, styles.trail, anchored(trail)]} />
        <View style={[styles.fill, styles.hpFill, { width: `${fraction * 100}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    justifyContent: 'center',
    minHeight: 30,
  },
  hpText: {
    color: gold[300],
    marginBottom: 2,
  },
  track: {
    height: 10,
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: colors.bg.surface3,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 5,
  },
  trail: {
    backgroundColor: '#ffffff',
  },
  hpFill: {
    backgroundColor: '#ef4444',
    right: undefined,
  },
})
