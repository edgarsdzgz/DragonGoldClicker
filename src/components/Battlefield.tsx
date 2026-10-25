import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { View, StyleSheet, Pressable, Animated, GestureResponderEvent, LayoutChangeEvent } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { EnemyHp } from './EnemyHp'
import { FloatingNumbers } from './FloatingNumbers'
import type { FloatingNumbersHandle } from './FloatingNumbers'
import { useHoldPress } from '../hooks'
import { useCoachTarget } from '../hooks/useCoachTarget'
import { useReduceMotion } from '../hooks/useReduceMotion'
import { MONSTERS, SPAWN_DELAY_MS, monsterLabel } from '../types/monsters'
import { colors, spacing, gold } from '../theme'

interface BattlefieldProps {
  /** Monster sprite diameter in dp */
  monster: number
  monsterIndex: number
  monsterHp: number
  /** Kills so far: when it changes the next monster eases in */
  kills: number
  /** Damage per hit, shown as a floating number */
  damage: number
  /** Called for every hit: the first press, then four times a second while held */
  onStrike: () => void
  /** Flavour line row, above the stack */
  header?: React.ReactNode
  /** Dim queue of the next monsters, above the sprite */
  queue?: React.ReactNode
  /** Opt into the guided tutorial under this target id */
  coachId?: string
}

export interface BattlefieldHandle {
  /** Float a gold bounty up from the monster */
  showBounty: (amount: string) => void
}

/** Press squash: the monster shrinks about 5% */
const SQUASH = 0.95

/**
 * The tap target: the whole battlefield. Every press strikes the monster; holding repeats
 * (four hits a second) with a steady pulse. Damage numbers rise from the monster.
 */
export const Battlefield = forwardRef<BattlefieldHandle, BattlefieldProps>(function Battlefield(
  { monster: size, monsterIndex, monsterHp, kills, damage, onStrike, header, queue, coachId },
  ref,
) {
  const coach = useCoachTarget(coachId)
  const def = MONSTERS[Math.max(0, Math.min(MONSTERS.length - 1, monsterIndex))]
  const reduceMotion = useReduceMotion()
  const numbers = useRef<FloatingNumbersHandle>(null)
  const widthRef = useRef(300)
  const [fieldW, setFieldW] = React.useState(300)

  const spawn = useRef(new Animated.Value(1)).current
  const squash = useRef(new Animated.Value(1)).current
  const shake = useRef(new Animated.Value(0)).current
  const flash = useRef(new Animated.Value(0)).current

  useImperativeHandle(ref, () => ({
    showBounty: (amount) =>
      numbers.current?.spawn({ x: size / 2, y: size * 0.25, text: amount, color: gold[300], large: true }),
  }), [size])

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

  // Every hit: flash and shake the monster, float the damage up from it
  const strike = useCallback(() => {
    onStrike()
    const jitter = (Math.random() - 0.5) * size * 0.5
    numbers.current?.spawn({ x: size / 2 + jitter, y: size * 0.3, text: `-${damage}`, color: colors.text.primary })
    flash.setValue(0.35)
    Animated.timing(flash, { toValue: 0, duration: 140, useNativeDriver: true }).start()
    if (!reduceMotion) {
      const hop = (to: number) => Animated.timing(shake, { toValue: to, duration: 28, useNativeDriver: true })
      Animated.sequence([hop(4), hop(-4), hop(2), hop(0)]).start()
    }
  }, [onStrike, damage, size, flash, shake, reduceMotion])
  const { onPressIn, onPressOut } = useHoldPress(strike, strike)

  // Screen readers activate with a tap-less click (onPress). A touch also ends in onPress, which
  // the press-in already struck for, so remember the touch just long enough to skip that one.
  const touching = useRef(false)
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (touchTimer.current) clearTimeout(touchTimer.current)
  }, [])

  const handlePressIn = (_e: GestureResponderEvent) => {
    touching.current = true
    if (!reduceMotion) Animated.timing(squash, { toValue: SQUASH, duration: 70, useNativeDriver: true }).start()
    onPressIn()
  }
  const handlePressOut = () => {
    if (touchTimer.current) clearTimeout(touchTimer.current)
    touchTimer.current = setTimeout(() => { touching.current = false }, 400)
    if (!reduceMotion) Animated.spring(squash, { toValue: 1, tension: 220, friction: 7, useNativeDriver: true }).start()
    onPressOut()
  }
  const handlePress = () => {
    if (!touching.current) strike()
  }

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width
    setFieldW(e.nativeEvent.layout.width)
    coach.onLayout()
  }

  return (
    <View ref={coach.ref} onLayout={onLayout} collapsable={false} style={styles.field}>
      <Pressable
        onPressIn={handlePressIn}
        onPress={handlePress}
        onPressOut={handlePressOut}
        style={styles.press}
        accessibilityRole="button"
        accessibilityLabel={monsterLabel({ monsterIndex, monsterHp })}
        accessibilityHint="Double tap to strike the monster"
      >
        {header}
        {queue}
        <View style={{ width: size, height: size }}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.sprite,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                opacity: spawn.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
                transform: [
                  { translateX: shake },
                  { scale: Animated.multiply(squash, spawn.interpolate({ inputRange: [0, 1], outputRange: [reduceMotion ? 1 : 0.8, 1] })) },
                ],
              },
            ]}
          >
            <LinearGradient colors={[colors.bg.surface2, colors.bg.surface1]} style={styles.inner}>
              <Ionicons name={def.glyph} size={Math.round(size * 0.5)} color={gold[400]} />
            </LinearGradient>
            <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash }]} />
          </Animated.View>
          <FloatingNumbers ref={numbers} />
        </View>
        <Text variant="label" center style={styles.name}>{def.name}</Text>
        <EnemyHp hp={monsterHp} max={def.hp} width={Math.min(fieldW - spacing[6] * 2, 260)} />
      </Pressable>
    </View>
  )
})

const styles = StyleSheet.create({
  field: {
    flex: 1,
    alignSelf: 'stretch',
  },
  press: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sprite: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: gold[500],
    shadowColor: gold[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  name: {
    color: gold[300],
    height: 20,
    marginTop: 2,
  },
})
