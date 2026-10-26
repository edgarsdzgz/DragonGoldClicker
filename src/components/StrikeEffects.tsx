import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import { Animated, Image, StyleSheet, View } from 'react-native'
import { ParticleBurst } from './ParticleBurst'
import type { ParticleBurstHandle } from './ParticleBurst'
import { useReduceMotion } from '../hooks/useReduceMotion'
import { gold } from '../theme'

const SLASH = require('../../assets/fx/fx_slash.png')
const SPARK = require('../../assets/fx/fx_spark.png')
const EMBER = require('../../assets/fx/fx_ember.png')

// -----------------------------------------------------------------------------
// ClawSlash: at most 3 slashes alive, alternating left and right
// -----------------------------------------------------------------------------

export const MAX_SLASHES = 3
const SLASH_MS = 150
/** Angle band in degrees; the side alternates each strike */
const ANGLE_MIN = 20
const ANGLE_MAX = 40

export interface ClawSlashHandle {
  slash: (x: number, y: number) => void
}

interface SlashSlot {
  progress: Animated.Value
  x: Animated.Value
  y: Animated.Value
  angle: Animated.Value
}

/** Pooled claw rakes at the tap point, tinted by the claws' level. With Reduce Motion a slash shows and fades in place. */
export const ClawSlash = forwardRef<ClawSlashHandle, { size: number; tint?: string }>(function ClawSlash({ size, tint = '#ffffff' }, ref) {
  const reduceMotion = useReduceMotion()
  const slots = useRef<SlashSlot[]>(
    Array.from({ length: MAX_SLASHES }, () => ({
      progress: new Animated.Value(1),
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      angle: new Animated.Value(0),
    })),
  ).current
  const next = useRef(0)
  const side = useRef(1)
  const motionRef = useRef(reduceMotion)
  motionRef.current = reduceMotion

  const slash = useCallback((x: number, y: number) => {
    const slot = slots[next.current]
    next.current = (next.current + 1) % MAX_SLASHES
    side.current = -side.current
    slot.x.setValue(x - size / 2)
    slot.y.setValue(y - size / 2)
    slot.angle.setValue(motionRef.current ? 0 : side.current * (ANGLE_MIN + Math.random() * (ANGLE_MAX - ANGLE_MIN)))
    slot.progress.stopAnimation()
    slot.progress.setValue(0)
    Animated.timing(slot.progress, { toValue: 1, duration: SLASH_MS, useNativeDriver: true }).start()
  }, [slots, size])

  useImperativeHandle(ref, () => ({ slash }), [slash])

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {slots.map((s, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: size,
            height: size,
            // Full opacity at the start, gone by the end
            opacity: s.progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0.8, 0] }),
            transform: [
              { translateX: s.x },
              { translateY: s.y },
              { rotate: s.angle.interpolate({ inputRange: [-90, 90], outputRange: ['-90deg', '90deg'] }) },
              { scale: reduceMotion ? 1 : s.progress.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.05] }) },
            ],
          }}
        >
          <Image source={SLASH} style={{ width: size, height: size, tintColor: tint }} accessibilityIgnoresInvertColors />
        </Animated.View>
      ))}
    </View>
  )
})

// -----------------------------------------------------------------------------
// SparkBurst (at most 24) and EmberDissolve (12-16 embers)
// -----------------------------------------------------------------------------

export const MAX_SPARKS = 24
export const MAX_EMBERS = 16

export const sparkSize = (unit: number) => Math.max(10, Math.round(unit * 0.09))
export const emberSize = (unit: number) => Math.max(10, Math.round(unit * 0.1))

export interface SparkBurstHandle {
  spark: (x: number, y: number, unit: number) => void
}

/** 6-8 gold sparks radiating from the impact point over about 300ms */
export const SparkBurst = forwardRef<SparkBurstHandle, { unit: number }>(function SparkBurst({ unit }, ref) {
  const layer = useRef<ParticleBurstHandle>(null)
  useImperativeHandle(ref, () => ({
    spark: (x, y, unit) =>
      layer.current?.burst({
        x, y, count: 6 + Math.floor(Math.random() * 3), distance: unit * 0.35, durationMs: 300, size: sparkSize(unit),
      }),
  }), [])
  return <ParticleBurst ref={layer} source={SPARK} max={MAX_SPARKS} tint={gold[300]} initialSize={sparkSize(unit)} />
})

export interface EmberDissolveHandle {
  dissolve: (cx: number, cy: number, unit: number) => void
}

/** 12-16 embers that rise from the monster's area, drifting and fading over about 700ms */
export const EmberDissolve = forwardRef<EmberDissolveHandle, { unit: number }>(function EmberDissolve({ unit }, ref) {
  const layer = useRef<ParticleBurstHandle>(null)
  useImperativeHandle(ref, () => ({
    dissolve: (cx, cy, unit) =>
      layer.current?.burst({
        x: cx, y: cy, count: 12 + Math.floor(Math.random() * 5), distance: unit * 0.18, rise: unit * 0.5,
        area: unit * 0.3, durationMs: 700, size: emberSize(unit),
      }),
  }), [])
  return <ParticleBurst ref={layer} source={EMBER} max={MAX_EMBERS} tint={gold[400]} initialSize={emberSize(unit)} />
})
