import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { PixelRatio, StyleSheet, View } from 'react-native'
import { spriteBox, stripMs } from '../art'
import type { SpriteId } from '../art'
import { PixelSprite } from './PixelSprite'

/** A strip held still (Reduce Motion) still shows this long */
const MIN_SHOW_MS = 150

export interface PixelBurstHandle {
  /** Play a strip once, centered on (x, y) in this layer's space */
  play: (id: SpriteId, x: number, y: number) => void
}

interface Slot {
  key: number
  id: SpriteId
  x: number
  y: number
}

interface PixelBurstProps {
  /** Points per art pixel */
  scale: number
  /** Strips alive at once; the oldest gives way */
  max?: number
}

/**
 * One-shot pixel effects (a slash, a spark, a crit) played where they land, from a small pool.
 * Each plays its strip once and is gone. Decorative and untouchable.
 */
export const PixelBurst = forwardRef<PixelBurstHandle, PixelBurstProps>(function PixelBurst({ scale, max = 3 }, ref) {
  const [slots, setSlots] = useState<(Slot | null)[]>(() => Array(max).fill(null))
  const next = useRef(0)
  const keySeq = useRef(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const play = useCallback((id: SpriteId, x: number, y: number) => {
    const i = next.current
    next.current = (i + 1) % max
    const key = ++keySeq.current
    setSlots((prev) => prev.map((s, j) => (j === i ? { key, id, x, y } : s)))
    clearTimeout(timers.current[i])
    timers.current[i] = setTimeout(() => {
      setSlots((prev) => prev.map((s, j) => (j === i && s?.key === key ? null : s)))
    }, Math.max(MIN_SHOW_MS, stripMs(id)))
  }, [max])

  useImperativeHandle(ref, () => ({ play }), [play])

  const ratio = PixelRatio.get()
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {slots.map((s) => {
        if (!s) return null
        const box = spriteBox(s.id, scale, ratio)
        return (
          <View key={s.key} style={{ position: 'absolute', left: s.x - box.width / 2, top: s.y - box.height / 2 }}>
            <PixelSprite id={s.id} scale={scale} loop={false} />
          </View>
        )
      })}
    </View>
  )
})
