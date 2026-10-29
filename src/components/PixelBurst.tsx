import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { PixelRatio, StyleSheet, View } from 'react-native'
import { spriteBox, stripMs } from '../art'
import type { SpriteId } from '../art'
import { PixelSprite } from './PixelSprite'
import { placeBurst, clearBurst } from './burstSlots'
import type { BurstSlot } from './burstSlots'

/** A strip held still (Reduce Motion) still shows this long */
const MIN_SHOW_MS = 150

export interface PixelBurstHandle {
  /**
   * Play a strip once, centered on (x, y) in this layer's space, then hold its last frame `holdMs`.
   * `scale` draws this one at another size than the layer's (a strike on a monster still far up the road).
   */
  play: (id: SpriteId, x: number, y: number, holdMs?: number, scale?: number) => void
}

interface Burst {
  id: SpriteId
  x: number
  y: number
  scale?: number
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
  const [slots, setSlots] = useState<(BurstSlot<Burst> | null)[]>(() => Array(max).fill(null))
  const next = useRef(0)
  const keySeq = useRef(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const play = useCallback((id: SpriteId, x: number, y: number, holdMs = 0, scale?: number) => {
    const i = next.current
    next.current = (i + 1) % max
    const key = ++keySeq.current
    setSlots((prev) => placeBurst(prev, i, { key, value: { id, x, y, scale } }))
    clearTimeout(timers.current[i])
    timers.current[i] = setTimeout(() => {
      setSlots((prev) => clearBurst(prev, i, key))
    }, Math.max(MIN_SHOW_MS, stripMs(id) + holdMs))
  }, [max])

  useImperativeHandle(ref, () => ({ play }), [play])

  const ratio = PixelRatio.get()
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {slots.map((slot) => {
        if (!slot) return null
        const s = slot.value
        const size = s.scale ?? scale
        const box = spriteBox(s.id, size, ratio)
        return (
          <View key={slot.key} style={{ position: 'absolute', left: s.x - box.width / 2, top: s.y - box.height / 2 }}>
            <PixelSprite id={s.id} scale={size} loop={false} />
          </View>
        )
      })}
    </View>
  )
})
