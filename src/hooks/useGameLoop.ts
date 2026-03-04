import { useEffect, useRef } from 'react'

/**
 * Runs a callback at a fixed interval (default 1 second).
 * Cleans up on unmount.
 */
export function useGameLoop(callback: () => void, intervalMs: number = 1000) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const id = setInterval(() => {
      callbackRef.current()
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
}
