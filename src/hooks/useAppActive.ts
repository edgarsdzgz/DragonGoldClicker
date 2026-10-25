import { useEffect, useState } from 'react'
import { AppState } from 'react-native'

/** Whether the app is in the foreground (looping animations should pause when it is not) */
export function useAppActive(): boolean {
  const [active, setActive] = useState(AppState.currentState === 'active')
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => setActive(next === 'active'))
    return () => sub.remove()
  }, [])
  return active
}
