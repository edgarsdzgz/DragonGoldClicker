import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { useGame } from './GameContext'

/** Whether the Journal sheet is open, and whether there is anything to open yet. */
interface JournalContextType {
  isOpen: boolean
  /** False until the story has started, so a fresh game shows no book */
  available: boolean
  open: () => void
  close: () => void
}

const JournalContext = createContext<JournalContextType>({
  isOpen: false,
  available: false,
  open: () => {},
  close: () => {},
})

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const { state } = useGame()
  const [isOpen, setOpen] = useState(false)
  const open = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])
  const available = state.beatsSeen.length > 0
  const value = useMemo(() => ({ isOpen, available, open, close }), [isOpen, available, open, close])
  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>
}

export function useJournal(): JournalContextType {
  return useContext(JournalContext)
}
