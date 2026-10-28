import { useEffect, useRef } from 'react'
import { AccessibilityInfo } from 'react-native'
import { useGame } from '../context/GameContext'
import type { UnlockToastHandle } from '../components/UnlockToast'
// The rule itself, not the art barrel (it loads the renderer)
import { foodEventBadge } from '../art/events'

/** Toasts (and announces) each new food-event message once: warnings, starts, endings, outcomes */
export function useFoodEventToasts(toastRef: React.MutableRefObject<UnlockToastHandle | null>) {
  const { state } = useGame()
  const note = state.foodEventNote
  const seen = useRef(note?.seq ?? 0)

  useEffect(() => {
    if (!note || note.seq <= seen.current) return
    seen.current = note.seq
    // The event's own badge; an ending (the event already gone) keeps the leaf
    toastRef.current?.show(note.text, state.foodEvent ? foodEventBadge(state.foodEvent.id) : 'leaf')
    AccessibilityInfo.announceForAccessibility(note.text)
  }, [note, toastRef, state.foodEvent?.id])
}
