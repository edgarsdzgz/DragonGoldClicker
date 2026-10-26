import { useEffect, useRef } from 'react'
import { AccessibilityInfo } from 'react-native'
import { monsterAt } from '../types/monsters'
import type { MonsterDef } from '../types/monsters'

export interface KillAnnouncement {
  text?: string
  /** Say it even if something was announced in the last 2s */
  force?: boolean
  /** Say nothing (the kill happened away from the Warfront) */
  silent?: boolean
}

/** Screen-reader announcements for kills are rate-limited to one per this many ms */
export const ANNOUNCE_EVERY_MS = 2000

/**
 * Calls `onKill` once for each kill (not on first render), with the monster that died, at the
 * horde's strength when it died.
 * Also announces the kill to screen readers, politely: at most one announcement every 2s.
 */
export function useKillEvents(
  kills: number,
  monsterIndex: number,
  hordeKills: number,
  /** May return the words to announce instead of "<name> slain" (e.g. when the kill also cleared a wave) */
  onKill: (monster: MonsterDef) => KillAnnouncement | void,
) {
  const prev = useRef({ kills, monsterIndex, hordeKills })
  const lastAnnounce = useRef(0)
  const onKillRef = useRef(onKill)
  onKillRef.current = onKill

  useEffect(() => {
    const before = prev.current
    prev.current = { kills, monsterIndex, hordeKills }
    if (kills <= before.kills) return

    const monster = monsterAt(before.monsterIndex, before.hordeKills)
    const custom = onKillRef.current(monster)
    if (custom?.silent) return

    // One announcement per kill; a wave clear is worth saying even inside the 2s window
    const now = Date.now()
    if (custom?.force || now - lastAnnounce.current >= ANNOUNCE_EVERY_MS) {
      lastAnnounce.current = now
      AccessibilityInfo.announceForAccessibility(custom?.text ?? `${monster.name} slain`)
    }
  }, [kills, monsterIndex, hordeKills])
}
