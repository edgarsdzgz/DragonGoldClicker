import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { View, StyleSheet, Pressable, Animated, GestureResponderEvent, LayoutChangeEvent } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MonsterIcon } from './MonsterIcon'
import type { MonsterDef } from '../types/monsters'
import { Text } from './Text'
import { EnemyHp } from './EnemyHp'
import { ClawSlash, SparkBurst } from './StrikeEffects'
import type { ClawSlashHandle, SparkBurstHandle } from './StrikeEffects'
import { FloatingNumbers } from './FloatingNumbers'
import type { FloatingNumbersHandle } from './FloatingNumbers'
import { useHoldPress } from '../hooks'
import { useCoinFlight } from '../context/CoinFlightContext'
import { useCoachTarget } from '../hooks/useCoachTarget'
import { useReduceMotion } from '../hooks/useReduceMotion'
import { MONSTERS, SPAWN_DELAY_MS, monsterLabel } from '../types/monsters'
import { restingPose } from '../data/monsterArt'
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
  /** Taps are ignored while true (the wave-cleared banner); a held press carries on afterwards */
  locked?: boolean
  /** Opt into the guided tutorial under this target id */
  coachId?: string
}

export interface BattlefieldHandle {
  /** Float a gold bounty up from the monster */
  showBounty: (amount: string) => void
  /** The monster that was just killed falls away and a coin flies to the inspiration figure */
  showKill: (monster: MonsterDef) => void
}

/** The monster's art box as a share of the sprite circle (fits inside the circle) */
const ART_SCALE = 0.68

/** Press squash: the monster shrinks about 5% */
const SQUASH = 0.95

/** The monster holds still this long at impact before the knockback */
const HIT_STOP_MS = 50
/** Knockback travel, as a share of the sprite size (away from the gate) */
const KNOCKBACK = 0.06

/**
 * The tap target: the whole battlefield. Every press strikes the monster; holding repeats
 * (four hits a second) with a steady pulse. Damage numbers rise from the monster.
 */
export const Battlefield = forwardRef<BattlefieldHandle, BattlefieldProps>(function Battlefield(
  { monster: size, monsterIndex, monsterHp, kills, damage, onStrike, header, queue, locked = false, coachId },
  ref,
) {
  const coach = useCoachTarget(coachId)
  const def = MONSTERS[Math.max(0, Math.min(MONSTERS.length - 1, monsterIndex))]
  const reduceMotion = useReduceMotion()
  const numbers = useRef<FloatingNumbersHandle>(null)
  const widthRef = useRef(300)
  const [fieldW, setFieldW] = React.useState(300)

  const coinFlight = useCoinFlight()
  const spriteRef = useRef<View>(null)
  const spawn = useRef(new Animated.Value(1)).current
  // The fallen monster: a ghost that fades and drops (fade only with Reduce Motion)
  const fall = useRef(new Animated.Value(1)).current
  const [fallen, setFallen] = React.useState<MonsterDef | null>(null)
  // A steady pulse on the battlefield while the press is held
  const holdPulse = useRef(new Animated.Value(0)).current
  const [holding, setHolding] = React.useState(false)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const squash = useRef(new Animated.Value(1)).current
  const shake = useRef(new Animated.Value(0)).current
  const flash = useRef(new Animated.Value(0)).current
  const slashes = useRef<ClawSlashHandle>(null)
  const sparks = useRef<SparkBurstHandle>(null)
  // Knockback: 0 -> 1 pushes the monster up and tilts it, then springs back
  const knock = useRef(new Animated.Value(0)).current
  const tilt = useRef(new Animated.Value(0)).current
  const tiltSide = useRef(1)
  // Where the last press landed, in dp from the sprite's top-left (hold repeats reuse it)
  const tapPoint = useRef({ x: size / 2, y: size / 2 })
  const spriteWindow = useRef<{ x: number; y: number } | null>(null)

  // Pose: the hit frame for ~120ms on each strike, else idle (or hurt at 1/3 HP or less)
  const [hitPose, setHitPose] = React.useState(false)
  const hitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resting = restingPose(monsterHp, def.hp)
  const pose = hitPose ? 'hit' : resting

  // Idle breathing: ~2% over ~1.5s; hurt breathes faster and uneven. Off with Reduce Motion.
  const breath = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (reduceMotion) {
      breath.setValue(0)
      return
    }
    const hurt = resting === 'hurt'
    const loop = Animated.loop(Animated.sequence(hurt
      ? [
          Animated.timing(breath, { toValue: 1, duration: 380, useNativeDriver: true }),
          Animated.timing(breath, { toValue: 0.2, duration: 260, useNativeDriver: true }),
          Animated.timing(breath, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(breath, { toValue: 0, duration: 520, useNativeDriver: true }),
        ]
      : [
          Animated.timing(breath, { toValue: 1, duration: 750, useNativeDriver: true }),
          Animated.timing(breath, { toValue: 0, duration: 750, useNativeDriver: true }),
        ]))
    loop.start()
    return () => loop.stop()
  }, [reduceMotion, resting, breath])

  useImperativeHandle(ref, () => ({
    showBounty: (amount) =>
      numbers.current?.spawn({ x: size / 2, y: size * 0.25, text: amount, color: gold[300], large: true }),
    showKill: (monster) => {
      setFallen(monster)
      fall.setValue(0)
      Animated.timing(fall, { toValue: 1, duration: 420, useNativeDriver: true }).start(() => setFallen(null))
      spriteRef.current?.measureInWindow((x, y, w, h) => coinFlight.fly({ x: x + w / 2, y: y + h / 2 }))
    },
  }), [size, fall, coinFlight])

  useEffect(() => {
    if (!holding || reduceMotion) {
      holdPulse.setValue(0)
      return
    }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(holdPulse, { toValue: 1, duration: 125, useNativeDriver: true }),
      Animated.timing(holdPulse, { toValue: 0, duration: 125, useNativeDriver: true }),
    ]))
    loop.start()
    return () => loop.stop()
  }, [holding, reduceMotion, holdPulse])

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
  const lockedRef = useRef(locked)
  lockedRef.current = locked

  const strike = useCallback(() => {
    if (lockedRef.current) return
    onStrike()
    setHitPose(true)
    if (hitTimer.current) clearTimeout(hitTimer.current)
    hitTimer.current = setTimeout(() => setHitPose(false), 120)
    const point = tapPoint.current
    numbers.current?.spawn({ x: point.x, y: size * 0.3, text: `-${damage}`, color: colors.text.primary })
    slashes.current?.slash(point.x, point.y)
    if (!reduceMotion) sparks.current?.spark(point.x, point.y, size)
    // Hit-stop: the monster holds still ~50ms, then the knockback runs
    if (!reduceMotion) {
      tiltSide.current = -tiltSide.current
      tilt.setValue(tiltSide.current * (3 + Math.random() * 2))
      knock.stopAnimation()
      knock.setValue(0)
      Animated.sequence([
        Animated.delay(HIT_STOP_MS),
        Animated.timing(knock, { toValue: 1, duration: 40, useNativeDriver: true }),
        Animated.timing(knock, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start()
    }
    flash.setValue(0.35)
    Animated.timing(flash, { toValue: 0, duration: 140, useNativeDriver: true }).start()
    if (!reduceMotion) {
      // A small sideways jitter after the hit-stop; the knockback carries most of the motion
      const hop = (to: number) => Animated.timing(shake, { toValue: to, duration: 28, useNativeDriver: true })
      Animated.sequence([Animated.delay(HIT_STOP_MS), hop(2), hop(-2), hop(1), hop(0)]).start()
    }
  }, [onStrike, damage, size, flash, shake, knock, tilt, reduceMotion])
  const { onPressIn, onPressOut } = useHoldPress(strike, strike)

  // Screen readers activate with a tap-less click (onPress). A touch also ends in onPress, which
  // the press-in already struck for, so remember the touch just long enough to skip that one.
  const touching = useRef(false)
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (touchTimer.current) clearTimeout(touchTimer.current)
    if (holdTimer.current) clearTimeout(holdTimer.current)
    if (hitTimer.current) clearTimeout(hitTimer.current)
  }, [])

  const handlePressIn = (e: GestureResponderEvent) => {
    touching.current = true
    const { pageX, pageY } = e.nativeEvent
    const origin = spriteWindow.current
    if (origin) {
      const clamp = (v: number) => Math.max(size * 0.1, Math.min(size * 0.9, v))
      tapPoint.current = { x: clamp(pageX - origin.x), y: clamp(pageY - origin.y) }
    }
    spriteRef.current?.measureInWindow((x, y) => { spriteWindow.current = { x, y } })
    // Held for as long as the repeat starts: show the pulse
    holdTimer.current = setTimeout(() => setHolding(true), 300)
    if (!reduceMotion) Animated.timing(squash, { toValue: SQUASH, duration: 70, useNativeDriver: true }).start()
    onPressIn()
  }
  const handlePressOut = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    setHolding(false)
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
        <View ref={spriteRef} collapsable={false} style={{ width: size, height: size }}>
          {holding && !reduceMotion && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.holdRing,
                {
                  width: size + 24,
                  height: size + 24,
                  borderRadius: (size + 24) / 2,
                  opacity: holdPulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.6] }),
                  transform: [{ scale: holdPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
                },
              ]}
            />
          )}
          {fallen && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.ghost,
                {
                  opacity: fall.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
                  transform: [{ translateY: reduceMotion ? 0 : fall.interpolate({ inputRange: [0, 1], outputRange: [0, size * 0.35] }) }],
                },
              ]}
            >
              <MonsterIcon monster={fallen} size={Math.round(size * ART_SCALE)} color={gold[400]} />
            </Animated.View>
          )}
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
                  { translateY: knock.interpolate({ inputRange: [0, 1], outputRange: [0, -size * KNOCKBACK] }) },
                  { rotate: Animated.multiply(knock, tilt).interpolate({ inputRange: [-5, 5], outputRange: ['-5deg', '5deg'] }) },
                  { scale: reduceMotion ? 1 : breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) },
                  { translateY: reduceMotion ? 0 : breath.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.01] }) },
                  { scale: Animated.multiply(squash, spawn.interpolate({ inputRange: [0, 1], outputRange: [reduceMotion ? 1 : 0.8, 1] })) },
                ],
              },
            ]}
          >
            <LinearGradient colors={[colors.bg.surface2, colors.bg.surface1]} style={styles.inner}>
              <MonsterIcon monster={def} size={Math.round(size * ART_SCALE)} color={gold[400]} pose={pose} />
            </LinearGradient>
            <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash }]} />
          </Animated.View>
          <ClawSlash ref={slashes} size={Math.round(size * 0.9)} />
          <SparkBurst ref={sparks} />
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
  holdRing: {
    position: 'absolute',
    left: -12,
    top: -12,
    borderWidth: 3,
    borderColor: gold[400],
  },
  ghost: {
    ...StyleSheet.absoluteFillObject,
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
