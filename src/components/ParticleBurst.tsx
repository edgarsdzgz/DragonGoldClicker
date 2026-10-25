import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import { Animated, Easing, Image, StyleSheet, View } from 'react-native'
import type { ImageSourcePropType } from 'react-native'
import { useReduceMotion } from '../hooks/useReduceMotion'

export interface BurstOptions {
  /** Origin, in dp from the layer's top-left corner */
  x: number
  y: number
  count: number
  /** Radial reach (spark) or horizontal drift (ember), in dp */
  distance: number
  /** Extra upward travel in dp (embers rise) */
  rise?: number
  /** Scatter the origin over this radius, so a burst covers an area (embers) */
  area?: number
  durationMs: number
  size: number
}

export interface ParticleBurstHandle {
  burst: (opts: BurstOptions) => void
}

interface Particle {
  progress: Animated.Value
  x: Animated.Value
  y: Animated.Value
  dx: Animated.Value
  dy: Animated.Value
  size: number
}

interface ParticleBurstProps {
  source: ImageSourcePropType
  /** Particles alive at once; a burst recycles the oldest */
  max: number
  tint: string
  /** Slot size to start with, so the first burst is already drawn at its real size */
  initialSize?: number
}

/**
 * A pooled layer of small sprites that fly outward and fade. Driven through the `burst`
 * handle, so a strike never re-renders its parent. Native-driver only, hidden from
 * screen readers. With Reduce Motion nothing travels: one soft fade at the origin.
 */
export const ParticleBurst = forwardRef<ParticleBurstHandle, ParticleBurstProps>(function ParticleBurst(
  { source, max, tint, initialSize = 12 },
  ref,
) {
  const reduceMotion = useReduceMotion()
  const motionRef = useRef(reduceMotion)
  motionRef.current = reduceMotion
  const pool = useRef<Particle[]>(
    Array.from({ length: max }, () => ({
      progress: new Animated.Value(0),
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      dx: new Animated.Value(0),
      dy: new Animated.Value(0),
      size: 0,
    })),
  ).current
  const sizes = useRef<number[]>(pool.map(() => initialSize)).current
  const [, force] = React.useReducer((n: number) => n + 1, 0)
  const next = useRef(0)

  const burst = useCallback((o: BurstOptions) => {
    const still = motionRef.current
    // Reduce Motion: a single particle that fades in place
    const count = still ? 1 : Math.min(o.count, max)
    let resized = false
    for (let i = 0; i < count; i++) {
      const slot = next.current
      next.current = (slot + 1) % max
      const p = pool[slot]
      const angle = Math.random() * Math.PI * 2
      const scatter = still ? 0 : Math.random() * (o.area ?? 0)
      p.x.setValue(o.x + Math.cos(angle) * scatter - o.size / 2)
      p.y.setValue(o.y + Math.sin(angle) * scatter - o.size / 2)
      const reach = o.distance * (0.5 + Math.random() * 0.5)
      p.dx.setValue(still ? 0 : o.rise !== undefined ? (Math.random() - 0.5) * 2 * o.distance : Math.cos(angle) * reach)
      p.dy.setValue(still ? 0 : o.rise !== undefined ? -(o.rise * (0.6 + Math.random() * 0.4)) : Math.sin(angle) * reach)
      if (sizes[slot] !== o.size) {
        sizes[slot] = o.size
        resized = true
      }
      p.progress.stopAnimation()
      p.progress.setValue(0)
      Animated.timing(p.progress, {
        toValue: 1,
        duration: still ? 300 : o.durationMs * (0.8 + Math.random() * 0.4),
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start()
    }
    if (resized) force()
  }, [max, pool, sizes])

  useImperativeHandle(ref, () => ({ burst }), [burst])

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {pool.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              width: sizes[i],
              height: sizes[i],
              opacity: p.progress.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 1, 0] }),
              transform: [
                { translateX: Animated.add(p.x, Animated.multiply(p.progress, p.dx)) },
                { translateY: Animated.add(p.y, Animated.multiply(p.progress, p.dy)) },
                { scale: p.progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }) },
              ],
            },
          ]}
        >
          <Image source={source} style={{ width: sizes[i], height: sizes[i], tintColor: tint }} accessibilityIgnoresInvertColors />
        </Animated.View>
      ))}
    </View>
  )
})

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
})
