import { useEffect, useRef, useState } from 'react'

/**
 * The next monster's walk down the road after a kill: the step it is on, from 0 at the camps to
 * `steps - 1` at its place. Each step lasts `stepMs` (a frame of its bob); it first waits `delayMs`
 * at the camps. Only a rise in `kills` starts a walk (a reset or a loaded save does not). When
 * `enabled` is off (Reduce Motion, off screen, in the background) it is simply at its place.
 */
export function useWalkUp(kills: number, steps: number, stepMs: number, delayMs: number, enabled: boolean): number {
  const last = Math.max(0, steps - 1)
  // Infinity: arrived, whatever its number of sizes
  const [step, setStep] = useState(Infinity)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // The kill's own render already has the next monster at the camps: started in an effect, it would
  // stand at the old place until the next render (a quarter second on the A16, with a kill's other work)
  const [seenKills, setSeenKills] = useState(kills)
  if (kills !== seenKills) {
    setSeenKills(kills)
    setStep(kills > seenKills && enabled && last > 0 ? 0 : Infinity)
  }

  useEffect(() => {
    clearTimeout(timer.current)
    // This kill started no walk
    if (step !== 0) return
    let n = 0
    const next = () => {
      n += 1
      setStep(n)
      if (n < last) timer.current = setTimeout(next, stepMs)
    }
    timer.current = setTimeout(next, delayMs + stepMs)
    // Only a kill starts a walk; the rest is read as it stands then
  }, [kills])

  // Leaving the screen or the app, or turning Reduce Motion on, finishes the walk at once
  useEffect(() => {
    if (enabled) return
    clearTimeout(timer.current)
    setStep(Infinity)
  }, [enabled])

  useEffect(() => () => clearTimeout(timer.current), [])

  return Math.min(step, last)
}
