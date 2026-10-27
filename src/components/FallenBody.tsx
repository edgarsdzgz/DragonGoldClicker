import React, { useEffect, useRef } from 'react'
import { Animated, PixelRatio } from 'react-native'
import { BLINK_STEPS, BLINK_STEP_MS, DEATH_HOLD_MS, SPRITES, spriteBox, stripMs } from '../art'
import type { SpriteId } from '../art'
import { PixelSprite } from './PixelSprite'

/** With Reduce Motion the body does not blink: its last frame fades over this long */
const FADE_MS = 300

interface FallenBodyProps {
  /** The monster's death strip */
  death: SpriteId
  /** Points per art pixel: the size it was when it fell */
  scale: number
  /** The middle of the ground it stood on, and where its feet were, in the parent's space */
  x: number
  feet: number
  /** Plays its death, holds the last frame, then blinks out. Off (Reduce Motion): the last frame fades. */
  blink: boolean
  /** It is gone: its parent drops it */
  onGone: () => void
}

/**
 * A monster's body where it fell: its death plays once, its last frame holds a moment, then it
 * blinks out. The death strip is wider than the walk by the same margin each side, so it lies
 * centered where it stood. Its parent draws bodies and the walker in order of their feet. Decorative.
 */
export function FallenBody({ death, scale, x, feet, blink, onGone }: FallenBodyProps) {
  const opacity = useRef(new Animated.Value(1)).current
  const gone = useRef(onGone)
  gone.current = onGone

  useEffect(() => {
    let anim: Animated.CompositeAnimation
    if (blink) {
      // Off, on, off... ending on off
      const steps: Animated.CompositeAnimation[] = [Animated.delay(stripMs(death) + DEATH_HOLD_MS)]
      for (let i = 0; i < BLINK_STEPS; i++) {
        steps.push(Animated.timing(opacity, { toValue: i % 2, duration: 0, useNativeDriver: true }), Animated.delay(BLINK_STEP_MS))
      }
      anim = Animated.sequence(steps)
    } else {
      opacity.setValue(0.9)
      anim = Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true })
    }
    anim.start(({ finished }) => {
      if (finished) gone.current()
    })
    return () => anim.stop()
  }, [death, blink, opacity])

  const box = spriteBox(death, scale, PixelRatio.get())
  const snap = PixelRatio.roundToNearestPixel
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: snap(x - box.width / 2), top: snap(feet - box.height), opacity }}
    >
      <PixelSprite id={death} scale={scale} loop={false} frame={blink ? undefined : SPRITES[death].frames - 1} />
    </Animated.View>
  )
}
