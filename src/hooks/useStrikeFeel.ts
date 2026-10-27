import { useCallback, useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { HOLD_REPEAT_MS } from './useActionPress'

// =============================================================================
// HOW A STRIKE FEELS on the battlefield: the monster's knockback and shake, the field's kill nudge,
// the press squash and the hold pulse. The monster's red flash is its own hit frame (PixelMonster).
// =============================================================================

/** Press squash: the monster shrinks about 5% */
const SQUASH = 0.95
/** The monster holds still this long at impact before the knockback */
const HIT_STOP_MS = 50
/** A kill holds still a little longer before the nudge */
const KILL_STOP_MS = 80

export interface StrikeFeel {
  squash: Animated.Value
  shake: Animated.Value
  /** The whole battlefield's small nudge on a kill */
  nudge: Animated.Value
  /** Knockback: 0 -> 1 pushes the monster up and tilts it (by `tilt`, in degrees), then springs back */
  knock: Animated.Value
  tilt: Animated.Value
  /** A hit: after the hit-stop, the knockback and a small sideways jitter */
  hit: () => void
  /** A kill: a longer hit-stop, then a 2-3px nudge of the field */
  killNudge: () => void
  pressIn: () => void
  pressOut: () => void
}

/** The strike's motion; all of it is off with Reduce Motion */
export function useStrikeFeel(reduceMotion: boolean): StrikeFeel {
  const squash = useRef(new Animated.Value(1)).current
  const shake = useRef(new Animated.Value(0)).current
  const nudge = useRef(new Animated.Value(0)).current
  const knock = useRef(new Animated.Value(0)).current
  const tilt = useRef(new Animated.Value(0)).current
  const tiltSide = useRef(1)

  const hit = useCallback(() => {
    if (reduceMotion) return
    // Hit-stop: the monster holds still ~50ms, then the knockback runs
    tiltSide.current = -tiltSide.current
    tilt.setValue(tiltSide.current * (3 + Math.random() * 2))
    knock.stopAnimation()
    knock.setValue(0)
    Animated.sequence([
      Animated.delay(HIT_STOP_MS),
      Animated.timing(knock, { toValue: 1, duration: 40, useNativeDriver: true }),
      Animated.timing(knock, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start()
    // A small sideways jitter after the hit-stop; the knockback carries most of the motion
    const hop = (to: number) => Animated.timing(shake, { toValue: to, duration: 28, useNativeDriver: true })
    Animated.sequence([Animated.delay(HIT_STOP_MS), hop(2), hop(-2), hop(1), hop(0)]).start()
  }, [reduceMotion, shake, knock, tilt])

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

  return { squash, shake, nudge, knock, tilt, hit, killNudge, pressIn, pressOut }
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
