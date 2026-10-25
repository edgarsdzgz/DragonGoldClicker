import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import { Animated, Image, StyleSheet, View } from 'react-native'
import { MonsterIcon } from './MonsterIcon'
import type { MonsterDef } from '../types/monsters'
import { MONSTER_ART, artForPose } from '../data/monsterArt'
import type { MonsterPose } from '../data/monsterArt'

export const HIT_POSE_MS = 120

export interface PosedMonsterHandle {
  /** Show the hit frame for about 120ms, then return to the resting pose */
  hit: () => void
}

interface PosedMonsterProps {
  monster: MonsterDef
  size: number
  color: string
  /** The resting pose (idle, or hurt at 1/3 HP or less) */
  resting: 'idle' | 'hurt'
  /** Changes when a new monster arrives; any hit frame left over from the killing blow is dropped */
  spawnKey: number
}

const POSES: MonsterPose[] = ['idle', 'hit', 'hurt']

/**
 * A monster drawn as its poses stacked on top of each other; the pose changes by switching
 * opacities, so a strike never swaps an Image source or re-renders anything. Monsters without
 * art fall back to their glyph.
 */
export const PosedMonster = forwardRef<PosedMonsterHandle, PosedMonsterProps>(function PosedMonster(
  { monster, size, color, resting, spawnKey },
  ref,
) {
  const art = MONSTER_ART[monster.id]
  const opacity = useRef<Record<MonsterPose, Animated.Value>>({
    idle: new Animated.Value(1),
    hit: new Animated.Value(0),
    hurt: new Animated.Value(0),
  }).current
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restingRef = useRef(resting)

  const show = useCallback((pose: MonsterPose) => {
    POSES.forEach((p) => opacity[p].setValue(p === pose ? 1 : 0))
  }, [opacity])

  // A new monster (the killing blow moved on) never inherits the hit frame
  useLayoutEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    restingRef.current = resting
    show(resting)
  }, [spawnKey, show])

  // The resting pose follows HP. A strike that crosses into hurt still shows its hit frame for
  // the full 120ms, then settles to the new pose (the timer reads restingRef when it fires).
  useLayoutEffect(() => {
    restingRef.current = resting
    if (timer.current === null) show(resting)
  }, [resting, show])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  useImperativeHandle(ref, () => ({
    hit: () => {
      if (!art?.hit) return
      show('hit')
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        timer.current = null
        show(restingRef.current)
      }, HIT_POSE_MS)
    },
  }), [art, show])

  if (!art) return <MonsterIcon monster={monster} size={size} color={color} />

  return (
    <View style={{ width: size, height: size }}>
      {POSES.map((pose) => (
        <Animated.View key={pose} style={[StyleSheet.absoluteFill, { opacity: opacity[pose] }]}>
          <Image
            source={artForPose(art, pose)}
            resizeMode="contain"
            style={{ width: size, height: size, tintColor: color }}
            accessibilityIgnoresInvertColors
          />
        </Animated.View>
      ))}
    </View>
  )
})
