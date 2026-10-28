import React, { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, useWindowDimensions, PixelRatio } from 'react-native'
import type { AudioSource } from 'expo-audio'
import { usePlaySound } from '../hooks/useSfx'
import { fitWhole, tapSplash, useSpriteImage, SKIP_HOLD_MS, SHEET_WAIT_MS } from '../art'
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
  /** A sound to play as the splash reaches a frame (its beats); none after a tap skips */
  sounds?: Readonly<Record<number, AudioSource>>
  /** Called once, when the splash ends; `skipped` when the player tapped through it */
  onDone: (skipped: boolean) => void
}

/** Share of the screen the art may fill */
const FILL_W = 0.9
const FILL_H = 0.8

/** A splash's points per art pixel on this screen (the title screen holds the gate at the same size) */
export function splashScale(width: number, height: number, timing: SheetTiming, ratio: number): number {
  return Math.min(fitWhole(width * FILL_W, timing.frame_width, ratio), fitWhole(height * FILL_H, timing.frame_height, ratio))
}

/**
 * One full-screen splash animation, played frame by frame at its own timing. The first tap jumps
 * to the last frame and moves on after half a second; a second tap leaves at once.
 */
export function SplashSequence({ id, timing, from = 0, lastHoldMs, still = false, label, sounds, onDone }: SplashSequenceProps) {
  const last = timing.frames - 1
  const [frame, setFrame] = useState(still ? last : from)
  const [phase, setPhase] = useState<SplashPhase>('playing')
  const { width, height } = useWindowDimensions()
  const ratio = PixelRatio.get()
  const scale = splashScale(width, height, timing, ratio)

  // The clock starts once the sheet is decoded (the launch decodes every sprite at the same time),
  // so the opening frames are never spent on an empty screen; a sheet that never comes is not waited on
  const loaded = useSpriteImage(id) !== null
  const [gaveUp, setGaveUp] = useState(false)
  const ready = loaded || gaveUp
  useEffect(() => {
    if (loaded) return
    const timer = setTimeout(() => setGaveUp(true), SHEET_WAIT_MS)
    return () => clearTimeout(timer)
  }, [loaded])

  // Kept in a ref so a parent re-render never restarts the timers
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  const finished = useRef(false)
  const skipped = useRef(false)
  const finish = () => {
    if (finished.current) return
    finished.current = true
    doneRef.current(skipped.current)
  }

  useEffect(() => {
    if (phase === 'done') {
      finish()
      return
    }
    if (!ready && phase === 'playing') return
    const hold =
      phase === 'skipped' ? SKIP_HOLD_MS : frame < last ? timing.ms[frame] : lastHoldMs ?? timing.ms[last]
    const timer = setTimeout(() => {
      if (phase === 'playing' && frame < last) setFrame(frame + 1)
      else setPhase('done')
    }, hold)
    return () => clearTimeout(timer)
  }, [frame, phase, ready, last, lastHoldMs, timing])

  // Each beat's sound as its frame comes up, while it plays on its own
  const play = usePlaySound()
  useEffect(() => {
    const sound = sounds?.[frame]
    if (sound && ready && phase === 'playing' && !still) play(sound)
  }, [frame, phase, ready, still, sounds, play])

  const onTap = () => {
    skipped.current = true
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
