import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useGame } from './GameContext'
import { CoachRegistry } from './coachRegistry'
import { getActiveStep, isStepComplete, EMPTY_TUTORIAL_UI } from '../types/tutorial'
import type { TutorialStep, TutorialUi, TutorialSheet } from '../types/tutorial'

/**
 * Drives the guided tutorial. Knows which step is active, completes it when its
 * done-condition holds, and holds the registry of on-screen targets. The overlay
 * itself is components/CoachMark.tsx.
 */

interface CoachContextType {
  registry: CoachRegistry
  activeStep: TutorialStep | null
  setFocusedTab: (tab: string) => void
  /** Tell the tutorial a sheet opened or closed (closing another sheet leaves this one be) */
  setSheetOpen: (sheet: TutorialSheet, open: boolean) => void
}

const CoachContext = createContext<CoachContextType | null>(null)

export function CoachProvider({ children }: { children: React.ReactNode }) {
  const { state, completeTutorialStep } = useGame()
  const registry = useRef(new CoachRegistry()).current
  const [ui, setUi] = useState<TutorialUi>(EMPTY_TUTORIAL_UI)

  const activeStep = getActiveStep(state)

  // Complete the active step once the save or the UI shows it is done. The effect
  // re-runs after each completion, so several satisfied steps clear in a row.
  useEffect(() => {
    if (activeStep && isStepComplete(activeStep, state, ui)) completeTutorialStep(activeStep.id)
  }, [activeStep, state, ui, completeTutorialStep])

  const setFocusedTab = useCallback((tab: string) => {
    setUi((prev) => (prev.focusedTab === tab ? prev : { ...prev, focusedTab: tab }))
  }, [])
  const setSheetOpen = useCallback((sheet: TutorialSheet, open: boolean) => {
    setUi((prev) => {
      const next = open ? sheet : prev.openSheet === sheet ? null : prev.openSheet
      return prev.openSheet === next ? prev : { ...prev, openSheet: next }
    })
  }, [])

  const value = useMemo(
    () => ({ registry, activeStep, setFocusedTab, setSheetOpen }),
    [registry, activeStep, setFocusedTab, setSheetOpen],
  )
  return <CoachContext.Provider value={value}>{children}</CoachContext.Provider>
}

export function useCoach(): CoachContextType {
  const ctx = useContext(CoachContext)
  if (!ctx) throw new Error('useCoach must be used within CoachProvider')
  return ctx
}
