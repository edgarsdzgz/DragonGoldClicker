import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { View, StyleSheet, Pressable, Animated, AppState, GestureResponderEvent, LayoutChangeEvent } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { PosedMonster } from './PosedMonster'
import type { PosedMonsterHandle } from './PosedMonster'
import { MonsterIcon } from './MonsterIcon'
import { useAppActive } from '../hooks/useAppActive'
import type { MonsterDef } from '../types/monsters'
import { Text } from './Text'
import { EnemyHp } from './EnemyHp'
import { ClawSlash, SparkBurst, EmberDissolve } from './StrikeEffects'
import type { ClawSlashHandle, SparkBurstHandle, EmberDissolveHandle } from './StrikeEffects'
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
  /** Between waves: shown in place of the monster, and taps on the field do nothing */
  camp?: React.ReactNode
  /** Show the monster's name under it (hidden until the first kill) */
  showName?: boolean
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
  /** A fighter's swing landed: a small number in the ally colour and a faint flash, no slash */
  showAllyHit: (amount: string) => void
}

/** The monster's art box as a share of the sprite circle (fits inside the circle) */
const ART_SCALE = 0.68

/**
 * Time between strikes while holding, and before the first held strike. Owner ruling
 * (2026-10-25): 3x slower than the default 250ms hold repeat, so holding stays deliberate.
 */
const HOLD_STRIKE_MS = 750

/** Press squash: the monster shrinks about 5% */
const SQUASH = 0.95

/** The monster holds still this long at impact before the knockback */
const HIT_STOP_MS = 50
/** A kill holds still a little longer before the nudge */
const KILL_STOP_MS = 80
/** Knockback travel, as a share of the sprite size (away from the gate) */
const KNOCKBACK = 0.06

/**
 * The tap target: the whole battlefield. Every press strikes the monster; holding repeats
 * (one strike every HOLD_STRIKE_MS) with a steady pulse. Damage numbers rise from the monster.
 */
export const Battlefield = forwardRef<BattlefieldHandle, BattlefieldProps>(function Battlefield(
  { monster: size, monsterIndex, monsterHp, kills, damage, onStrike, header, queue, camp, showName = true, locked = false, coachId },
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
  // The fallen monster: its silhouette fades out in place while embers rise from it
  const fall = useRef(new Animated.Value(1)).current
  const [fallen, setFallen] = React.useState<MonsterDef | null>(null)
  // A steady pulse on the battlefield while the press is held
  const holdPulse = useRef(new Animated.Value(0)).current
  const [holding, setHolding] = React.useState(false)
  const killToken = useRef(0)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const squash = useRef(new Animated.Value(1)).current
  const shake = useRef(new Animated.Value(0)).current
  const flash = useRef(new Animated.Value(0)).current
  const slashes = useRef<ClawSlashHandle>(null)
  const embers = useRef<EmberDissolveHandle>(null)
  // The whole battlefield gives a small nudge on a kill
  const nudge = useRef(new Animated.Value(0)).current
  const sparks = useRef<SparkBurstHandle>(null)
  // Knockback: 0 -> 1 pushes the monster up and tilts it, then springs back
  const knock = useRef(new Animated.Value(0)).current
  const tilt = useRef(new Animated.Value(0)).current
  const tiltSide = useRef(1)
  // Where the last press landed, in dp from the sprite's top-left (hold repeats reuse it)
  const tapPoint = useRef({ x: size / 2, y: size / 2 })
  // The sprite's offset inside the press area; both are measured in the press area's own space
  const spriteOffset = useRef({ x: 0, y: 0 })
  const focused = useIsFocused()
  const appActive = useAppActive()

  // Pose: the hit frame for ~120ms on each strike, else idle (or hurt at 1/3 HP or less)
  const posed = useRef<PosedMonsterHandle>(null)
  const resting = restingPose(monsterHp, def.hp)

  // Idle breathing: ~2% over ~1.5s; hurt breathes faster and uneven. Off with Reduce Motion.
  const breath = useRef(new Animated.Value(0)).current
  useEffect(() => {
    // Only breathe while this screen is showing and the app is in the foreground
    if (reduceMotion || !focused || !appActive) {
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
  }, [reduceMotion, resting, breath, focused, appActive])

  useImperativeHandle(ref, () => ({
    showBounty: (amount) =>
      numbers.current?.spawn({ x: size / 2, y: size * 0.25, text: amount, color: gold[300], large: true }),
    showKill: (monster) => {
      // Each kill gets a token, so an older fade finishing can never remove a newer ghost
      const token = ++killToken.current
      setFallen(monster)
      fall.stopAnimation()
      fall.setValue(0)
      Animated.timing(fall, { toValue: 1, duration: reduceMotion ? 300 : 700, useNativeDriver: true }).start(({ finished }) => {
        if (finished && killToken.current === token) setFallen(null)
      })
      embers.current?.dissolve(size / 2, size / 2, size)
      // Kill punch: ~80ms hit-stop, then a 2-3px nudge of the battlefield
      if (!reduceMotion) {
        nudge.stopAnimation()
        nudge.setValue(0)
        Animated.sequence([
          Animated.delay(KILL_STOP_MS),
          Animated.timing(nudge, { toValue: 1, duration: 40, useNativeDriver: true }),
          Animated.timing(nudge, { toValue: 0, duration: 110, useNativeDriver: true }),
        ]).start()
      }
      spriteRef.current?.measureInWindow((x, y, w, h) => coinFlight.fly({ x: x + w / 2, y: y + h / 2 }))
    },
    showAllyHit: (amount) => {
      // Spread across the monster so several fighters read as several small hits
      const x = size * (0.25 + Math.random() * 0.5)
      numbers.current?.spawn({ x, y: size * 0.45, text: amount, color: colors.warfront.ally })
      flash.setValue(0.12)
      Animated.timing(flash, { toValue: 0, duration: 120, useNativeDriver: true }).start()
    },
  }), [size, fall, nudge, flash, coinFlight, reduceMotion])

  useEffect(() => {
    if (!holding || reduceMotion) {
      holdPulse.setValue(0)
      return
    }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(holdPulse, { toValue: 1, duration: HOLD_STRIKE_MS / 2, useNativeDriver: true }),
      Animated.timing(holdPulse, { toValue: 0, duration: HOLD_STRIKE_MS / 2, useNativeDriver: true }),
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
    // Reduce Motion: the next monster is simply there, with no opacity ramp
    if (reduceMotion) {
      spawn.setValue(1)
      return
    }
    spawn.setValue(0)
    Animated.timing(spawn, { toValue: 1, duration: SPAWN_DELAY_MS, useNativeDriver: true }).start()
  }, [kills, spawn, reduceMotion])

  // Every hit: flash and shake the monster, float the damage up from it
  const lockedRef = useRef(locked)
  lockedRef.current = locked
  const inCamp = camp !== undefined
  const campRef = useRef(inCamp)
  campRef.current = inCamp

  const strike = useCallback(() => {
    if (lockedRef.current || campRef.current) return
    onStrike()
    posed.current?.hit()
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
  const { onPressIn, onPressOut } = useHoldPress(strike, strike, { delayMs: HOLD_STRIKE_MS, intervalMs: HOLD_STRIKE_MS })

  // Screen readers activate with a tap-less click (onPress). A touch also ends in onPress, which
  // the press-in already struck for, so remember the touch just long enough to skip that one.
  const touching = useRef(false)
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Stop the hold pulse (and forget the touch) for any reason the press can end without onPressOut
  const cancelHold = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    if (touchTimer.current) clearTimeout(touchTimer.current)
    holdTimer.current = null
    touchTimer.current = null
    touching.current = false
    setHolding(false)
  }, [])

  useEffect(() => () => {
    if (touchTimer.current) clearTimeout(touchTimer.current)
    if (holdTimer.current) clearTimeout(holdTimer.current)
    touching.current = false
  }, [])

  // The wave ended: the field is replaced by the camp, so a held press must not carry on into it
  useEffect(() => {
    if (!inCamp) return
    onPressOut()
    cancelHold()
  }, [inCamp, onPressOut, cancelHold])

  useEffect(() => {
    if (!focused) cancelHold()
  }, [focused, cancelHold])

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') cancelHold()
    })
    return () => sub.remove()
  }, [cancelHold])

  const handlePressIn = (e: GestureResponderEvent) => {
    touching.current = true
    // locationX/Y are relative to the press area (its children ignore touches), as is the sprite offset
    const { locationX, locationY } = e.nativeEvent
    const clamp = (v: number) => Math.max(size * 0.1, Math.min(size * 0.9, v))
    tapPoint.current = {
      x: clamp(locationX - spriteOffset.current.x),
      y: clamp(locationY - spriteOffset.current.y),
    }
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
    <Animated.View
      ref={coach.ref}
      onLayout={onLayout}
      collapsable={false}
      style={[styles.field, { transform: [{ translateY: nudge.interpolate({ inputRange: [0, 1], outputRange: [0, 3] }) }] }]}
    >
      {camp ?? <Pressable
        onPressIn={handlePressIn}
        onPress={handlePress}
        onPressOut={handlePressOut}
        style={styles.pressArea}
        accessibilityRole="button"
        accessibilityLabel={monsterLabel({ monsterIndex, monsterHp })}
        accessibilityHint="Double tap to strike the monster"
      >
        <View pointerEvents="none" style={styles.press}>
        {header}
        {queue}
        <View
          ref={spriteRef}
          collapsable={false}
          onLayout={(e) => { spriteOffset.current = { x: e.nativeEvent.layout.x, y: e.nativeEvent.layout.y } }}
          style={{ width: size, height: size }}
        >
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
              <PosedMonster ref={posed} monster={def} size={Math.round(size * ART_SCALE)} color={gold[400]} resting={resting} spawnKey={kills} />
            </LinearGradient>
            <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash }]} />
          </Animated.View>
          <ClawSlash ref={slashes} size={Math.round(size * 0.9)} />
          <SparkBurst ref={sparks} unit={size} />
          <EmberDissolve ref={embers} unit={size} />
          <FloatingNumbers ref={numbers} />
        </View>
        {showName ? <Text variant="label" center style={styles.name}>{def.name}</Text> : <View style={styles.name} />}
        <EnemyHp hp={monsterHp} max={def.hp} width={Math.min(fieldW - spacing[6] * 2, 260)} />
        </View>
      </Pressable>}
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  field: {
    flex: 1,
    alignSelf: 'stretch',
  },
  pressArea: {
    flex: 1,
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
