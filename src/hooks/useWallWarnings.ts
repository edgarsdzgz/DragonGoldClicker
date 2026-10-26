import { useEffect, useRef } from 'react'
import { AccessibilityInfo } from 'react-native'
import { useGame } from '../context/GameContext'
import { useHaptics } from './useHaptics'
import { wallWarningCrossed } from '../types/wall'
import type { UnlockToastHandle } from '../components/UnlockToast'

/**
 * Toasts (and announces) each warning as the wall falls across a line (layer 6), so it never falls
 * without warning. The worse two also buzz. Repairs that lift the wall back over a line re-arm it.
 */
export function useWallWarnings(toastRef: React.MutableRefObject<UnlockToastHandle | null>) {
  const { state } = useGame()
  const { warning } = useHaptics()
  const hp = state.cityHp
  const last = useRef(hp)
  // Loading a save or starting a new game moves the HP without a strike: no warning for that
  const game = useRef(state.startedAt)

  useEffect(() => {
    if (game.current !== state.startedAt) {
      game.current = state.startedAt
      last.current = hp
      return
    }
    const crossed = wallWarningCrossed(last.current, hp)
    last.current = hp
    if (!crossed) return
    toastRef.current?.show(crossed.text, 'shield-half')
    AccessibilityInfo.announceForAccessibility(crossed.text)
    if (crossed.id !== 'cracking') warning()
  }, [hp, state.startedAt, toastRef, warning])
}
