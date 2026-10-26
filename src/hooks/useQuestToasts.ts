import { useEffect, useRef } from 'react'
import { AccessibilityInfo } from 'react-native'
import { useGame } from '../context/GameContext'
import { QUESTS, questCompleteText } from '../types/quests'
import type { UnlockToastHandle } from '../components/UnlockToast'

/**
 * Shows "Quest complete" (with any reward) for each newly completed quest, and announces it.
 * Quests that hand off to a story beat are skipped: their scene does the congratulating.
 */
export function useQuestToasts(toastRef: React.MutableRefObject<UnlockToastHandle | null>) {
  const { state } = useGame()
  const seen = useRef(state.questsDone.length)

  useEffect(() => {
    const fresh = state.questsDone.slice(seen.current)
    seen.current = state.questsDone.length
    for (const id of fresh) {
      const quest = QUESTS.find((q) => q.id === id)
      if (!quest || quest.completesInto) continue
      const text = questCompleteText(quest)
      toastRef.current?.show(text, 'trophy')
      AccessibilityInfo.announceForAccessibility(text)
    }
  }, [state.questsDone, toastRef])
}
