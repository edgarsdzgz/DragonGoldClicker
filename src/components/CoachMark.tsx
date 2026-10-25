import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Animated, AccessibilityInfo, useWindowDimensions } from 'react-native'
import { Text } from './Text'
import { useCoach } from '../context/CoachContext'
import { useGame } from '../context/GameContext'
import { useActiveEvent } from '../hooks/useActiveEvent'
import { useReduceMotion } from '../hooks/useReduceMotion'
import { isRectVisible, hintSide } from '../context/coachRegistry'
import type { Rect } from '../context/coachRegistry'
import { blockerCells, holeRadius, padRect, HOLE_PAD } from '../context/coachGeometry'
import { needsMoreInspiration, HINT_SLAY_TO_AFFORD, HINT_RETURN_TO_SLAY } from '../types/tutorial'
import { colors, spacing, radius, gold } from '../theme'

const DIM = 'rgba(2, 2, 6, 0.82)'
/** Border thickness used to paint the dim layer around a hole (larger than any screen) */
const DIM_BORDER = 3000
const MEASURE_MS = 300
const SLAY_TARGET = 'slay'

interface CoachMarkProps {
  /** Render for steps whose target lives inside a Modal (mounted inside that modal) */
  inModal?: boolean
}

/**
 * Guided-tutorial overlay: dims everything except the active step's target, blocks taps
 * on the dim area, and shows a hint bubble. Hidden while any pop-up or scene is showing,
 * and until the target is on screen.
 *
 * Spend steps the player cannot afford also open SLAY (so they can earn the inspiration);
 * if SLAY is not on screen the dim lifts entirely, so the player is never trapped.
 */
export function CoachMark({ inModal = false }: CoachMarkProps) {
  const { registry, activeStep } = useCoach()
  const { state } = useGame()
  const popup = useActiveEvent()
  const win = useWindowDimensions()
  const [rect, setRect] = useState<Rect | null>(null)
  const [slayRect, setSlayRect] = useState<Rect | null>(null)
  const [origin, setOrigin] = useState({ x: 0, y: 0 })
  const containerRef = useRef<View>(null)
  const reduceMotion = useReduceMotion()
  const pulse = useRef(new Animated.Value(0)).current

  const step = activeStep && !!activeStep.inModal === inModal ? activeStep : null
  const stepId = step?.id
  const target = step?.target
  const unaffordable = step !== null && needsMoreInspiration(step, state)

  // Keep the cutouts on their targets: measure on registry changes (layout, focus) and on a timer
  useEffect(() => {
    if (!stepId || !target) {
      setRect(null)
      setSlayRect(null)
      return
    }
    const measure = () => {
      registry.measure(target, (r) => {
        if (r && !isRectVisible(r, win)) registry.get(target)?.scrollIntoView?.(r)
        const next = isRectVisible(r, win) ? r : null
        setRect((prev) => (sameRect(prev, next) ? prev : next))
      })
      if (unaffordable) {
        registry.measure(SLAY_TARGET, (r) => {
          const next = isRectVisible(r, win) ? r : null
          setSlayRect((prev) => (sameRect(prev, next) ? prev : next))
        })
      } else {
        setSlayRect(null)
      }
    }
    measure()
    const unsub = registry.subscribe(measure)
    const timer = setInterval(measure, MEASURE_MS)
    return () => {
      unsub()
      clearInterval(timer)
    }
  }, [stepId, target, unaffordable, registry, win])

  const visible = step !== null && rect !== null && popup === null
  const lifted = unaffordable && slayRect === null
  const showSlayHole = unaffordable && slayRect !== null
  const hint = !step ? '' : showSlayHole ? HINT_SLAY_TO_AFFORD : lifted ? HINT_RETURN_TO_SLAY : step.hint

  // Announce the hint whenever the one on screen changes
  useEffect(() => {
    if (visible && hint) AccessibilityInfo.announceForAccessibility(hint)
  }, [visible, hint])

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

  const local = (r: Rect): Rect => ({ x: r.x - origin.x, y: r.y - origin.y, w: r.w, h: r.h })
  const targetRect = local(rect)
  const holes = showSlayHole && slayRect ? [targetRect, local(slayRect)] : [targetRect]
  const padded = holes.map((h) => padRect(h, HOLE_PAD))

  // The hint sits next to the target, or above SLAY while the player has to earn inspiration
  const anchor = showSlayHole && slayRect ? local(slayRect) : targetRect
  const side = showSlayHole ? 'above' : hintSide(rect, win.height)
  const bubbleWidth = Math.min(280, win.width - spacing[4] * 2)
  const left = Math.max(spacing[4], Math.min(anchor.x + anchor.w / 2 - bubbleWidth / 2, win.width - spacing[4] - bubbleWidth))
  const bubblePos = side === 'below'
    ? { top: anchor.y + anchor.h + HOLE_PAD + spacing[3] }
    : { bottom: win.height - anchor.y + HOLE_PAD + spacing[3] }
  const blockTouch = () => true

  return (
    <View
      ref={containerRef}
      onLayout={onLayout}
      style={styles.root}
      pointerEvents="box-none"
      accessibilityViewIsModal={!lifted}
    >
      {!lifted && (
        <>
          {/* Visual dim: one hole with a huge dim border, so a round target gets a round hole */}
          {padded.length === 1 ? (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: padded[0].x - DIM_BORDER,
                top: padded[0].y - DIM_BORDER,
                width: padded[0].w + DIM_BORDER * 2,
                height: padded[0].h + DIM_BORDER * 2,
                borderWidth: DIM_BORDER,
                borderColor: DIM,
                borderRadius: DIM_BORDER + holeRadius(padded[0], radius.lg),
              }}
            />
          ) : (
            // Two holes: the dim is drawn as rectangles around them (square corners)
            blockerCells(win.width, win.height, padded).map((c, i) => (
              <View key={`dim${i}`} pointerEvents="none" style={[styles.cell, { left: c.x, top: c.y, width: c.w, height: c.h, backgroundColor: DIM }]} />
            ))
          )}

          {/* Transparent touch blockers that match each target's exact rectangle */}
          {blockerCells(win.width, win.height, holes).map((c, i) => (
            <View
              key={`block${i}`}
              style={[styles.cell, { left: c.x, top: c.y, width: c.w, height: c.h }]}
              onStartShouldSetResponder={blockTouch}
            />
          ))}
        </>
      )}

      {/* Highlight rings (do not take touches) */}
      {padded.map((p, i) => (
        <Animated.View
          key={`ring${i}`}
          pointerEvents="none"
          style={[
            styles.ring,
            {
              left: p.x,
              top: p.y,
              width: p.w,
              height: p.h,
              borderRadius: holeRadius(p, radius.lg),
              opacity: reduceMotion ? 1 : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
              transform: reduceMotion ? [] : [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }],
            },
          ]}
        />
      ))}

      {/* Hint bubble */}
      <View
        style={[styles.bubble, bubblePos, { left, width: bubbleWidth }]}
        pointerEvents={lifted ? 'none' : 'auto'}
        accessible
        accessibilityLabel={hint}
        accessibilityRole="text"
        onStartShouldSetResponder={lifted ? undefined : blockTouch}
      >
        <Text variant="body" center style={styles.hint}>{hint}</Text>
      </View>
    </View>
  )
}

function sameRect(a: Rect | null, b: Rect | null) {
  if (a === b) return true
  if (!a || !b) return false
  return Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1 && Math.abs(a.w - b.w) < 1 && Math.abs(a.h - b.h) < 1
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  cell: {
    position: 'absolute',
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
