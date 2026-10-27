import React, { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, useWindowDimensions, PixelRatio } from 'react-native'
import { fitWhole, tapSplash, SKIP_HOLD_MS } from '../art'
import type { SheetTiming, SplashPhase, SpriteId } from '../art'
import { PixelSheet } from './PixelSheet'

interface SplashSequenceProps {
  id: SpriteId
  timing: SheetTiming
  /** First frame to play (a short version starts partway in) */
  from?: number
  /** Hold the last frame this long instead of its own hold */
  lastHoldMs?: number
  /** Show only the finished frame (Reduce Motion) */
  still?: boolean
  /** Read by screen readers */
  label: string
  /** Called once, when the splash ends or is skipped */
  onDone: () => void
}

/** Share of the screen the art may fill */
const FILL_W = 0.9
const FILL_H = 0.8

/**
 * One full-screen splash animation, played frame by frame at its own timing. The first tap jumps
 * to the last frame and moves on after half a second; a second tap leaves at once.
 */
export function SplashSequence({ id, timing, from = 0, lastHoldMs, still = false, label, onDone }: SplashSequenceProps) {
  const last = timing.frames - 1
  const [frame, setFrame] = useState(still ? last : from)
  const [phase, setPhase] = useState<SplashPhase>('playing')
  const { width, height } = useWindowDimensions()
  const ratio = PixelRatio.get()
  const scale = Math.min(fitWhole(width * FILL_W, timing.frame_width, ratio), fitWhole(height * FILL_H, timing.frame_height, ratio))

  // Kept in a ref so a parent re-render never restarts the timers
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  const finished = useRef(false)
  const finish = () => {
    if (finished.current) return
    finished.current = true
    doneRef.current()
  }

  useEffect(() => {
    if (phase === 'done') {
      finish()
      return
    }
    const hold =
      phase === 'skipped' ? SKIP_HOLD_MS : frame < last ? timing.ms[frame] : lastHoldMs ?? timing.ms[last]
    const timer = setTimeout(() => {
      if (phase === 'playing' && frame < last) setFrame(frame + 1)
      else setPhase('done')
    }, hold)
    return () => clearTimeout(timer)
  }, [frame, phase, last, lastHoldMs, timing])

  const onTap = () => {
    setFrame(last)
    setPhase(tapSplash)
  }

  return (
    <Pressable
      style={[styles.fill, { backgroundColor: timing.background }]}
      onPress={onTap}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Tap to skip"
    >
      <PixelSheet id={id} timing={timing} frame={frame} scale={scale} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
})
