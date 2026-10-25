import { useEffect, useRef } from 'react'
import { useDevSettings } from '../context/DevSettingsContext'

/** Fastest real interval; higher speeds run several game seconds per tick instead */
const MIN_TICK_MS = 50

/**
 * Runs a callback once per game second (default 1 real second).
 * The dev speed setting scales game time: at 20x the callback runs 20 times
 * per real second, so every timer keeps the same ratio to every other.
 * Cleans up on unmount.
 */
export function useGameLoop(callback: () => void, intervalMs: number = 1000) {
  const callbackRef = useRef(callback)
  const { speed } = useDevSettings()

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const tickMs = Math.max(MIN_TICK_MS, intervalMs / speed)
    const runsPerTick = Math.max(1, Math.round((speed * tickMs) / intervalMs))
    const id = setInterval(() => {
      for (let i = 0; i < runsPerTick; i++) callbackRef.current()
    }, tickMs)
    return () => clearInterval(id)
  }, [intervalMs, speed])
}
