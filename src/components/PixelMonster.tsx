import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import { Animated, PixelRatio, StyleSheet, View } from 'react-native'
import { spriteBox } from '../art'
import type { MobSprites } from '../art'
import { PixelSprite } from './PixelSprite'
import { HIT_POSE_MS } from './PosedMonster'
import type { PosedMonsterHandle } from './PosedMonster'

type Pose = keyof MobSprites
const POSES: Pose[] = ['idle', 'hit', 'hurt']

interface PixelMonsterProps {
  sprites: MobSprites
  /** Points per art pixel */
  scale: number
  /** The resting pose: walking (idle), or wounded at 1/3 HP or less */
  resting: 'idle' | 'hurt'
  /** Changes when a new monster arrives; a hit frame left from the killing blow is dropped */
  spawnKey: number
  /** Hold the walk still (the screen is hidden or the app is in the background) */
  paused?: boolean
  /** Show this frame of the walk instead of playing it (walking up the road, its steps are its bob) */
  frame?: number
}

/**
 * A monster in pixel art: its walk (the idle bob), its red-flash hit and its wounded pose,
 * stacked and switched by opacity, so a strike never re-renders anything. Same handle as
 * PosedMonster. Decorative: the battlefield labels the monster.
 */
export const PixelMonster = forwardRef<PosedMonsterHandle, PixelMonsterProps>(function PixelMonster(
  { sprites, scale, resting, spawnKey, paused = false, frame },
  ref,
) {
  const opacity = useRef<Record<Pose, Animated.Value>>({
    idle: new Animated.Value(1),
    hit: new Animated.Value(0),
    hurt: new Animated.Value(0),
  }).current
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restingRef = useRef(resting)

  const show = useCallback((pose: Pose) => {
    POSES.forEach((p) => opacity[p].setValue(p === pose ? 1 : 0))
  }, [opacity])

  // A new monster never inherits the hit frame (only spawnKey runs this; the next effect follows `resting`)
  useLayoutEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    restingRef.current = resting
    show(resting)
  }, [spawnKey, show])

  // The resting pose follows HP; a hit frame in progress finishes first
  useLayoutEffect(() => {
    restingRef.current = resting
    if (timer.current === null) show(resting)
  }, [resting, show])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  useImperativeHandle(ref, () => ({
    hit: () => {
      show('hit')
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        timer.current = null
        show(restingRef.current)
      }, HIT_POSE_MS)
    },
  }), [show])

  const box = spriteBox(sprites.idle, scale, PixelRatio.get())
  return (
    <View style={box}>
      {POSES.map((pose) => (
        <Animated.View key={pose} style={[StyleSheet.absoluteFill, { opacity: opacity[pose] }]}>
          <PixelSprite id={sprites[pose]} scale={scale} frame={paused ? 0 : frame} />
        </Animated.View>
      ))}
    </View>
  )
})
