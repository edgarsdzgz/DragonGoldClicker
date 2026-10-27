import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

/** Whether a screen reader (TalkBack, VoiceOver) is on; text that types itself out should appear whole */
export function useScreenReader(): boolean {
  const [on, setOn] = useState(false)
  useEffect(() => {
    let live = true
    AccessibilityInfo.isScreenReaderEnabled().then((v) => live && setOn(v))
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setOn)
    return () => {
      live = false
      sub.remove()
    }
  }, [])
  return on
}
