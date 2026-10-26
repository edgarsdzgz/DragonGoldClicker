import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native'
import { useCoach } from '../context/CoachContext'
import { useReduceMotion } from '../hooks/useReduceMotion'
import { isRectVisible } from '../context/coachRegistry'
import type { Rect } from '../context/coachRegistry'
import { holeRadius, padRect, HOLE_PAD } from '../context/coachGeometry'
import { gold, radius } from '../theme'

/** Re-measure this often while shown (the target may still be animating in) */
const MEASURE_MS = 500

interface HighlightBackdropProps {
  /** Coach target id to light up and box (e.g. 'renown'); none gives a plain dim */
  targetId?: string
  /** The dim colour */
  dim: string
}

/**
 * A full-screen dim with a lit hole and a pulsing gold box around one coach target, so a scene
 * can point at what it is talking about. Without a target, or while the target cannot be
 * measured, it is a plain dim. Decorative only: it takes no touches and is hidden from screen
 * readers (the scene's own text names the thing).
 */
export function HighlightBackdrop({ targetId, dim }: HighlightBackdropProps) {
  const { registry } = useCoach()
  const win = useWindowDimensions()
  const reduceMotion = useReduceMotion()
  const [rect, setRect] = useState<Rect | null>(null)
  const [origin, setOrigin] = useState({ x: 0, y: 0 })
  const rootRef = useRef<View>(null)
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!targetId) {
      setRect(null)
      return
    }
    const measure = () =>
      registry.measure(targetId, (r) => {
        const next = isRectVisible(r, win) ? r : null
        setRect((prev) => (prev && next && prev.x === next.x && prev.y === next.y && prev.w === next.w && prev.h === next.h ? prev : next))
      })
    measure()
    const unsub = registry.subscribe(measure)
    const timer = setInterval(measure, MEASURE_MS)
    return () => {
      unsub()
      clearInterval(timer)
    }
  }, [targetId, registry, win])

  const lit = rect !== null
  useEffect(() => {
    if (!lit || reduceMotion) {
      pulse.setValue(0)
      return
    }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]))
    loop.start()
    return () => loop.stop()
  }, [lit, reduceMotion, pulse])

  // The layer's own origin, so window coordinates map onto it exactly
  const onLayout = () => rootRef.current?.measureInWindow((x, y) => setOrigin({ x, y }))

  const hole = rect && padRect({ x: rect.x - origin.x, y: rect.y - origin.y, w: rect.w, h: rect.h }, HOLE_PAD)
  // One hole with a huge dim border, so the hole keeps rounded corners
  const border = Math.max(win.width, win.height) * 2

  return (
    <View
      ref={rootRef}
      onLayout={onLayout}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {hole ? (
        <>
          <View
            style={{
              position: 'absolute',
              left: hole.x - border,
              top: hole.y - border,
              width: hole.w + border * 2,
              height: hole.h + border * 2,
              borderWidth: border,
              borderColor: dim,
              borderRadius: border + holeRadius(hole, radius.md),
            }}
          />
          <Animated.View
            style={[
              styles.box,
              {
                left: hole.x,
                top: hole.y,
                width: hole.w,
                height: hole.h,
                borderRadius: holeRadius(hole, radius.md),
                opacity: reduceMotion ? 1 : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                transform: reduceMotion ? [] : [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
              },
            ]}
          />
        </>
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: dim }]} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: gold[400],
    backgroundColor: 'rgba(250, 204, 21, 0.10)',
  },
})
