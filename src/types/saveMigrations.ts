import type { GameState } from './state'
import { catchUpBeats } from './storyCatchUp'
import { catchUpScripted } from './scripted'

/**
 * The newest save format. The game started over at 1 on 2026-10-27, when every older save was
 * wiped; a later change to the save's shape adds a numbered step to migrateSave and raises this.
 */
export const LATEST_SAVE_VERSION = 1

/**
 * Bring a loaded save up to the latest version. A numbered step runs only for saves older than it,
 * so a current save is never re-migrated. The catch-ups after them are not versions: they run on
 * every load.
 */
export function migrateSave(input: GameState): GameState {
  let s = input

  // Beats added before ones this save has already seen must not play their scene for it
  s = catchUpBeats(s)
  // A scene killed mid-read still gets its scripted event (state change only)
  s = catchUpScripted(s)

  return { ...s, saveMigrationVersion: LATEST_SAVE_VERSION }
}
