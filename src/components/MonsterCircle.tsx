import React, { useCallback, useEffect, useRef } from 'react'
import { View, StyleSheet, Pressable, Animated, GestureResponderEvent } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { ProgressBar } from './ProgressBar'
import { useHoldPress } from '../hooks'
import { useCoachTarget } from '../hooks/useCoachTarget'
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
  /** Opt into the guided tutorial under this target id */
  coachId?: string
}

/**
 * The SLAY circle: the current monster (glyph, name, HP number and bar). Each press
 * strikes it; holding repeats. A new monster eases in over SPAWN_DELAY_MS.
 */
export function MonsterCircle({ diameter, monsterIndex, monsterHp, kills, onStrike, coachId }: MonsterCircleProps) {
  const coach = useCoachTarget(coachId)
  const monster = MONSTERS[Math.max(0, Math.min(MONSTERS.length - 1, monsterIndex))]
  const spawn = useRef(new Animated.Value(1)).current
  const lastPoint = useRef<TapPoint>({ x: diameter / 2, y: diameter / 2 })

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

  const strike = useCallback(() => onStrike(lastPoint.current), [onStrike])
  const { onPressIn, onPressOut } = useHoldPress(strike, strike)

  const handlePressIn = (e: GestureResponderEvent) => {
    lastPoint.current = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY }
    onPressIn()
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
        onPressOut={onPressOut}
        style={{ padding: pad, alignItems: 'center', justifyContent: 'center' }}
        accessibilityRole="button"
        accessibilityLabel={monsterLabel({ monsterIndex, monsterHp })}
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
              transform: [{ scale: spawn.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
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
        </Animated.View>
      </Pressable>
    </View>
  )
}

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
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
})
