import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Animated, LayoutChangeEvent } from 'react-native'
import { Text } from './Text'
import { useReduceMotion } from '../hooks/useReduceMotion'
import { colors, gold } from '../theme'

/** One pip per HP up to this many; above it the HP is a bar with "cur/max" text */
export const PIP_MAX_HP = 12
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
 * The enemy's HP, readable at a glance: pips for small monsters, a bar with "cur/max" for big
 * ones. Screen readers get the HP from the battlefield's label, so this stays hidden from them.
 */
export function EnemyHp({ hp, max, width }: EnemyHpProps) {
  return (
    <View
      style={[styles.root, { width }]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {max <= PIP_MAX_HP ? <Pips hp={hp} max={max} width={width} /> : <HpBar hp={hp} max={max} width={width} />}
    </View>
  )
}

function Pips({ hp, max, width }: EnemyHpProps) {
  const gap = 4
  const pip = Math.max(8, Math.min(22, Math.floor((width - gap * (max - 1)) / max)))
  return (
    <View style={styles.pips}>
      {Array.from({ length: max }, (_, i) => (
        <View
          key={i}
          style={[styles.pip, { width: pip, marginRight: i < max - 1 ? gap : 0 }, i < hp ? styles.pipFull : styles.pipEmpty]}
        />
      ))}
    </View>
  )
}

function HpBar({ hp, max, width }: EnemyHpProps) {
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

  // Anchor a scaled bar to its left edge (scaleX pivots on the centre)
  const anchored = (value: Animated.Value | Animated.AnimatedInterpolation<number>) => ({
    transform: [
      { translateX: Animated.multiply(Animated.subtract(1, value), -trackW / 2) },
      { scaleX: value },
    ],
  })

  return (
    <View>
      <Text variant="caption" center style={styles.hpText}>{`${hp} / ${max}`}</Text>
      <View style={styles.track} onLayout={(e: LayoutChangeEvent) => setTrackW(e.nativeEvent.layout.width)}>
        <Animated.View style={[styles.fill, styles.trail, anchored(trail)]} />
        <View style={[styles.fill, styles.hpFill, { width: `${fraction * 100}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30,
  },
  pips: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pip: {
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
  },
  pipFull: {
    backgroundColor: '#ef4444',
    borderColor: '#fca5a5',
  },
  pipEmpty: {
    backgroundColor: colors.bg.surface3,
    borderColor: colors.border.subtle,
  },
  hpText: {
    color: gold[300],
    marginBottom: 2,
  },
  track: {
    height: 8,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.bg.surface3,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 4,
  },
  trail: {
    backgroundColor: '#ffffff',
  },
  hpFill: {
    backgroundColor: '#ef4444',
    right: undefined,
  },
})
