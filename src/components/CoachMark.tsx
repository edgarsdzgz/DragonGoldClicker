import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Animated, AccessibilityInfo, useWindowDimensions } from 'react-native'
import { Text } from './Text'
import { useCoach } from '../context/CoachContext'
import { useActiveEvent } from '../hooks/useActiveEvent'
import { isRectVisible, hintSide } from '../context/coachRegistry'
import type { Rect } from '../context/coachRegistry'
import { colors, spacing, radius, gold } from '../theme'

/** Padding around the target inside the cutout */
const CUT_PAD = 6
const DIM = 'rgba(2, 2, 6, 0.82)'
const MEASURE_MS = 300

interface CoachMarkProps {
  /** Render for steps whose target lives inside a Modal (mounted inside that modal) */
  inModal?: boolean
}

/**
 * Guided-tutorial overlay: dims everything except the active step's target, blocks taps
 * on the dim area, and shows a hint bubble. The cutout passes taps to the real control.
 * Hidden while any pop-up or scene is showing, and until the target is on screen.
 */
export function CoachMark({ inModal = false }: CoachMarkProps) {
  const { registry, activeStep } = useCoach()
  const popup = useActiveEvent()
  const win = useWindowDimensions()
  const [rect, setRect] = useState<Rect | null>(null)
  const [origin, setOrigin] = useState({ x: 0, y: 0 })
  const containerRef = useRef<View>(null)
  const reduceMotion = useReduceMotion()
  const pulse = useRef(new Animated.Value(0)).current

  const step = activeStep && !!activeStep.inModal === inModal ? activeStep : null
  const stepId = step?.id
  const target = step?.target

  // Keep the cutout on the target: measure on registry changes (layout, focus) and on a timer
  useEffect(() => {
    if (!stepId || !target) {
      setRect(null)
      return
    }
    const measure = () => {
      registry.measure(target, (r) => {
        if (r && !isRectVisible(r, win)) registry.get(target)?.scrollIntoView?.(r)
        const next = isRectVisible(r, win) ? r : null
        setRect((prev) => (sameRect(prev, next) ? prev : next))
      })
    }
    measure()
    const unsub = registry.subscribe(measure)
    const timer = setInterval(measure, MEASURE_MS)
    return () => {
      unsub()
      clearInterval(timer)
    }
  }, [stepId, target, registry, win])

  const visible = step !== null && rect !== null && popup === null

  // Announce the hint once when the step first shows
  useEffect(() => {
    if (visible && step) AccessibilityInfo.announceForAccessibility(step.hint)
  }, [visible, step?.id])

  useEffect(() => {
    if (!visible || reduceMotion) {
      pulse.setValue(0)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [visible, reduceMotion, pulse])

  // The overlay's own origin, so window coordinates map onto it exactly
  const onLayout = () => {
    containerRef.current?.measureInWindow((x, y) => setOrigin({ x, y }))
  }

  if (!visible || !step || !rect) return null

  const cut = {
    x: rect.x - origin.x - CUT_PAD,
    y: rect.y - origin.y - CUT_PAD,
    w: rect.w + CUT_PAD * 2,
    h: rect.h + CUT_PAD * 2,
  }
  const side = hintSide(rect, win.height)
  const bubbleWidth = Math.min(280, win.width - spacing[4] * 2)
  const left = Math.max(spacing[4], Math.min(cut.x + cut.w / 2 - bubbleWidth / 2, win.width - spacing[4] - bubbleWidth))
  const bubblePos = side === 'below'
    ? { top: cut.y + cut.h + spacing[3] }
    : { bottom: win.height - origin.y - cut.y + spacing[3] }
  const blockTouch = () => true

  return (
    <View
      ref={containerRef}
      onLayout={onLayout}
      style={StyleSheet.absoluteFill}
      pointerEvents="box-none"
      accessibilityViewIsModal
    >
      {/* Four dim rectangles around the cutout; they swallow taps */}
      <View style={[styles.dim, { top: 0, left: 0, right: 0, height: Math.max(0, cut.y) }]} onStartShouldSetResponder={blockTouch} />
      <View style={[styles.dim, { top: cut.y + cut.h, left: 0, right: 0, bottom: 0 }]} onStartShouldSetResponder={blockTouch} />
      <View style={[styles.dim, { top: cut.y, height: cut.h, left: 0, width: Math.max(0, cut.x) }]} onStartShouldSetResponder={blockTouch} />
      <View style={[styles.dim, { top: cut.y, height: cut.h, left: cut.x + cut.w, right: 0 }]} onStartShouldSetResponder={blockTouch} />

      {/* Highlight ring (does not take touches) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ring,
          {
            left: cut.x,
            top: cut.y,
            width: cut.w,
            height: cut.h,
            borderRadius: Math.abs(cut.w - cut.h) < 12 ? cut.h / 2 : radius.lg,
            opacity: reduceMotion ? 1 : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
            transform: reduceMotion ? [] : [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }],
          },
        ]}
      />

      {/* Hint bubble */}
      <View
        style={[styles.bubble, bubblePos, { left, width: bubbleWidth }]}
        accessible
        accessibilityLabel={step.hint}
        accessibilityRole="text"
        onStartShouldSetResponder={blockTouch}
      >
        <Text variant="body" center style={styles.hint}>{step.hint}</Text>
      </View>
    </View>
  )
}

function sameRect(a: Rect | null, b: Rect | null) {
  if (a === b) return true
  if (!a || !b) return false
  return Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1 && Math.abs(a.w - b.w) < 1 && Math.abs(a.h - b.h) < 1
}

function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    let live = true
    AccessibilityInfo.isReduceMotionEnabled().then((v) => live && setReduce(v))
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce)
    return () => {
      live = false
      sub.remove()
    }
  }, [])
  return reduce
}

const styles = StyleSheet.create({
  dim: {
    position: 'absolute',
    backgroundColor: DIM,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: gold[400],
  },
  bubble: {
    position: 'absolute',
    backgroundColor: colors.bg.surface2,
    borderWidth: 1,
    borderColor: gold[500],
    borderRadius: radius.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  hint: {
    color: colors.text.primary,
  },
})
