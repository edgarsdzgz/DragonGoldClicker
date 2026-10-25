import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

/** Whether the player has Reduce Motion on; pulses and shakes should be skipped */
export function useReduceMotion(): boolean {
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
