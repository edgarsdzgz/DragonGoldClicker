import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { View, StyleSheet, Pressable, Animated, GestureResponderEvent } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { ProgressBar } from './ProgressBar'
import { useHoldPress } from '../hooks'
import { useCoachTarget } from '../hooks/useCoachTarget'
import { useReduceMotion } from '../hooks/useReduceMotion'
import { FloatingNumbers } from './FloatingNumbers'
import type { FloatingNumbersHandle } from './FloatingNumbers'
import { MONSTERS, SPAWN_DELAY_MS, monsterLabel } from '../types/monsters'
import { colors, spacing, gold } from '../theme'

export interface TapPoint {
  /** Position of the tap inside the circle, in dp from its top-left corner */
  x: number
  y: number
}

interface MonsterCircleProps {
  /** Circle diameter in dp */
  diameter: number
  monsterIndex: number
  monsterHp: number
  /** Kills so far: when it changes the next monster eases in */
  kills: number
  /** Called for every hit: the first press, then four times a second while held */
  onStrike: (point: TapPoint) => void
  /** Damage per hit, shown as a floating number */
  damage: number
  /** Opt into the guided tutorial under this target id */
  coachId?: string
}

export interface MonsterCircleHandle {
  /** Float a gold bounty up from the monster */
  showBounty: (amount: string) => void
}

/** Press squash: the circle shrinks about 5% */
const SQUASH = 0.95

/**
 * The SLAY circle: the current monster (glyph, name, HP number and bar). Each press
 * strikes it; holding repeats. A new monster eases in over SPAWN_DELAY_MS.
 */
export const MonsterCircle = forwardRef<MonsterCircleHandle, MonsterCircleProps>(function MonsterCircle(
  { diameter, monsterIndex, monsterHp, kills, onStrike, damage, coachId },
  ref,
) {
  const coach = useCoachTarget(coachId)
  const monster = MONSTERS[Math.max(0, Math.min(MONSTERS.length - 1, monsterIndex))]
  const spawn = useRef(new Animated.Value(1)).current
  const lastPoint = useRef<TapPoint>({ x: diameter / 2, y: diameter / 2 })
  const reduceMotion = useReduceMotion()
  const numbers = useRef<FloatingNumbersHandle>(null)
  const squash = useRef(new Animated.Value(1)).current
  const shake = useRef(new Animated.Value(0)).current
  const flash = useRef(new Animated.Value(0)).current
  const half = diameter / 2 + spacing[2]

  useImperativeHandle(ref, () => ({
    showBounty: (amount) => numbers.current?.spawn({ x: half, y: half * 0.55, text: amount, color: gold[300], large: true }),
  }), [half])

  // After a kill the next monster eases in (taps meanwhile already hit it)
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    spawn.setValue(0)
    Animated.timing(spawn, { toValue: 1, duration: SPAWN_DELAY_MS, useNativeDriver: true }).start()
  }, [kills, spawn])

  // Every hit: the monster flashes and shakes, and the damage floats up from the tap point
  const strike = useCallback(() => {
    const point = lastPoint.current
    onStrike(point)
    numbers.current?.spawn({ x: point.x, y: point.y - 12, text: `-${damage}`, color: colors.text.primary })
    flash.setValue(0.35)
    Animated.timing(flash, { toValue: 0, duration: 140, useNativeDriver: true }).start()
    if (!reduceMotion) {
      const hop = (to: number) => Animated.timing(shake, { toValue: to, duration: 28, useNativeDriver: true })
      Animated.sequence([hop(4), hop(-4), hop(2), hop(0)]).start()
    }
  }, [onStrike, damage, flash, shake, reduceMotion])
  const { onPressIn, onPressOut } = useHoldPress(strike, strike)

  const handlePressIn = (e: GestureResponderEvent) => {
    touching.current = true
    lastPoint.current = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY }
    if (!reduceMotion) Animated.timing(squash, { toValue: SQUASH, duration: 70, useNativeDriver: true }).start()
    onPressIn()
  }

  // Screen readers activate with a tap-less click (onPress). A touch also ends in onPress, which the
  // press-in already struck for, so remember the touch just long enough to skip that one.
  const touching = useRef(false)
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (touchTimer.current) clearTimeout(touchTimer.current)
  }, [])

  const handlePress = () => {
    if (touching.current) return
    lastPoint.current = { x: half, y: half }
    strike()
  }

  const handlePressOut = () => {
    if (touchTimer.current) clearTimeout(touchTimer.current)
    touchTimer.current = setTimeout(() => { touching.current = false }, 400)
    if (!reduceMotion) Animated.spring(squash, { toValue: 1, tension: 220, friction: 7, useNativeDriver: true }).start()
    onPressOut()
  }

  const k = diameter / 200
  const pad = spacing[2]
  const glow = diameter * 1.3

  return (
    <View
      ref={coach.ref}
      onLayout={coach.onLayout}
      collapsable={false}
      style={{ alignItems: 'center', justifyContent: 'center' }}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPress={handlePress}
        onPressOut={handlePressOut}
        style={{ padding: pad, alignItems: 'center', justifyContent: 'center' }}
        accessibilityRole="button"
        accessibilityLabel={monsterLabel({ monsterIndex, monsterHp })}
        accessibilityHint="Double tap to strike the monster"
      >
        <View pointerEvents="none" style={[styles.glow, { width: glow, height: glow, borderRadius: glow / 2 }]} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.circle,
            {
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              opacity: spawn.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              transform: [
                { translateX: shake },
                { scale: Animated.multiply(squash, spawn.interpolate({ inputRange: [0, 1], outputRange: [reduceMotion ? 1 : 0.8, 1] })) },
              ],
            },
          ]}
        >
          <LinearGradient colors={[colors.bg.surface2, colors.bg.surface1]} style={styles.inner}>
            <Ionicons name={monster.glyph} size={Math.round(54 * k)} color={gold[400]} />
            <Text variant="label" center style={{ color: gold[300], fontSize: Math.max(11, Math.round(15 * k)) }}>
              {monster.name}
            </Text>
            <View style={{ width: diameter * 0.55 }}>
              <ProgressBar progress={monsterHp / monster.hp} height={Math.max(5, Math.round(8 * k))} gradientColors={['#ff6b6b', '#ef4444']} />
            </View>
            <Text variant="caption" center style={{ color: colors.text.secondary }}>
              {`${monsterHp} / ${monster.hp} HP`}
            </Text>
          </LinearGradient>
          <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash }]} />
        </Animated.View>
      </Pressable>
      <FloatingNumbers ref={numbers} />
    </View>
  )
})

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    backgroundColor: gold[500],
    opacity: 0.3,
  },
  circle: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: gold[500],
    shadowColor: gold[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
})
