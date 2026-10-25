import { useCallback, useEffect, useRef } from 'react'
import type { View } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { useCoach } from '../context/CoachContext'
import type { Rect } from '../context/coachRegistry'

/**
 * Opt a control into the guided tutorial. Attach `ref` and `onLayout` to the control's
 * wrapper View. The target is registered only while its screen is focused, so a
 * screen kept alive in another tab never shows a stale cutout.
 */
export function useCoachTarget(id: string | undefined, scrollIntoView?: (rect: Rect) => void) {
  const { registry } = useCoach()
  const ref = useRef<View>(null)
  const focused = useIsFocused()
  const scrollRef = useRef(scrollIntoView)
  scrollRef.current = scrollIntoView

  useEffect(() => {
    if (!id || !focused) return
    return registry.register(id, {
      measure: (cb) => {
        const node = ref.current
        if (!node) return cb(null)
        node.measureInWindow((x, y, w, h) => cb({ x, y, w, h }))
      },
      scrollIntoView: (rect) => scrollRef.current?.(rect),
    })
  }, [id, focused, registry])

  const onLayout = useCallback(() => registry.notify(), [registry])
  return { ref, onLayout }
}
