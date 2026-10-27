import { useCallback, useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { SPAWN_DELAY_MS } from '../types/monsters'
import { HOLD_REPEAT_MS } from './useActionPress'

// =============================================================================
// HOW A STRIKE FEELS on the battlefield: the monster's flash, knockback and shake, the field's kill
// nudge, the press squash, the hold pulse, idle breathing and the next monster's fade-in
// =============================================================================

/** Press squash: the monster shrinks about 5% */
const SQUASH = 0.95
/** The monster holds still this long at impact before the knockback */
const HIT_STOP_MS = 50
/** A kill holds still a little longer before the nudge */
const KILL_STOP_MS = 80

interface StrikeFeelOptions {
  reduceMotion: boolean
  /** Idle breathing runs (the screen and app are showing, and the monster is not pixel art: those bob in their walk) */
  breathe: boolean
  /** At a third of its HP or less: it breathes faster and uneven */
  hurt: boolean
  /** Kills so far: each new one fades the next monster in */
  kills: number
  /** The next monster fades in (the old circle); a pixel monster walks down the road instead */
  fadeIn: boolean
}

export interface StrikeFeel {
  spawn: Animated.Value
  squash: Animated.Value
  shake: Animated.Value
  flash: Animated.Value
  /** The whole battlefield's small nudge on a kill */
  nudge: Animated.Value
  /** Knockback: 0 -> 1 pushes the monster up and tilts it (by `tilt`, in degrees), then springs back */
  knock: Animated.Value
  tilt: Animated.Value
  breath: Animated.Value
  /** A hit: a flash, then after the hit-stop the knockback and a small sideways jitter */
  hit: () => void
  /** A fighter's swing: a faint flash only */
  allyFlash: () => void
  /** A kill: a longer hit-stop, then a 2-3px nudge of the field */
  killNudge: () => void
  pressIn: () => void
  pressOut: () => void
}

export function useStrikeFeel({ reduceMotion, breathe, hurt, kills, fadeIn }: StrikeFeelOptions): StrikeFeel {
  const spawn = useRef(new Animated.Value(1)).current
  const squash = useRef(new Animated.Value(1)).current
  const shake = useRef(new Animated.Value(0)).current
  const flash = useRef(new Animated.Value(0)).current
  const nudge = useRef(new Animated.Value(0)).current
  const knock = useRef(new Animated.Value(0)).current
  const tilt = useRef(new Animated.Value(0)).current
  const breath = useRef(new Animated.Value(0)).current
  const tiltSide = useRef(1)

  // Idle breathing: ~2% over ~1.5s; hurt breathes faster and uneven. Off with Reduce Motion.
  useEffect(() => {
    if (reduceMotion || !breathe) {
      breath.setValue(0)
      return
    }
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
  }, [reduceMotion, breathe, hurt, breath])

  // After a kill the next monster eases in (taps meanwhile already hit it). Reduce Motion: it is
  // simply there, with no opacity ramp
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (reduceMotion || !fadeIn) {
      spawn.setValue(1)
      return
    }
    spawn.setValue(0)
    Animated.timing(spawn, { toValue: 1, duration: SPAWN_DELAY_MS, useNativeDriver: true }).start()
  }, [kills, spawn, reduceMotion, fadeIn])

  const hit = useCallback(() => {
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
  }, [reduceMotion, flash, shake, knock, tilt])

  const allyFlash = useCallback(() => {
    flash.setValue(0.12)
    Animated.timing(flash, { toValue: 0, duration: 120, useNativeDriver: true }).start()
  }, [flash])

  const killNudge = useCallback(() => {
    if (reduceMotion) return
    nudge.stopAnimation()
    nudge.setValue(0)
    Animated.sequence([
      Animated.delay(KILL_STOP_MS),
      Animated.timing(nudge, { toValue: 1, duration: 40, useNativeDriver: true }),
      Animated.timing(nudge, { toValue: 0, duration: 110, useNativeDriver: true }),
    ]).start()
  }, [reduceMotion, nudge])

  const pressIn = useCallback(() => {
    if (!reduceMotion) Animated.timing(squash, { toValue: SQUASH, duration: 70, useNativeDriver: true }).start()
  }, [reduceMotion, squash])
  const pressOut = useCallback(() => {
    if (!reduceMotion) Animated.spring(squash, { toValue: 1, tension: 220, friction: 7, useNativeDriver: true }).start()
  }, [reduceMotion, squash])

  return { spawn, squash, shake, flash, nudge, knock, tilt, breath, hit, allyFlash, killNudge, pressIn, pressOut }
}

/** A steady pulse on the battlefield while a press is held (0 -> 1 -> 0 per hold repeat); still with Reduce Motion */
export function useHoldPulse(holding: boolean, reduceMotion: boolean): Animated.Value {
  const holdPulse = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (!holding || reduceMotion) {
      holdPulse.setValue(0)
      return
    }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(holdPulse, { toValue: 1, duration: HOLD_REPEAT_MS / 2, useNativeDriver: true }),
      Animated.timing(holdPulse, { toValue: 0, duration: HOLD_REPEAT_MS / 2, useNativeDriver: true }),
    ]))
    loop.start()
    return () => loop.stop()
  }, [holding, reduceMotion, holdPulse])
  return holdPulse
}
