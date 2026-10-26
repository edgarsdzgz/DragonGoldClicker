import { useEffect, useRef } from 'react'
import { AccessibilityInfo } from 'react-native'
import { useGame } from '../context/GameContext'
import type { UnlockToastHandle } from '../components/UnlockToast'

/** Toasts (and announces) each new food-event message once: warnings, starts, endings, outcomes */
export function useFoodEventToasts(toastRef: React.MutableRefObject<UnlockToastHandle | null>) {
  const { state } = useGame()
  const note = state.foodEventNote
  const seen = useRef(note?.seq ?? 0)

  useEffect(() => {
    if (!note || note.seq <= seen.current) return
    seen.current = note.seq
    toastRef.current?.show(note.text, state.foodEvent?.id === 'raid' ? 'flash' : 'leaf')
    AccessibilityInfo.announceForAccessibility(note.text)
  }, [note, toastRef, state.foodEvent?.id])
}
