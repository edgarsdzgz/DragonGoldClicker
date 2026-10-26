import type { GameState } from './state'
import { MONSTERS } from './monsters'
import { migrateToV4, migrateToV5, migrateToV7, migrateToV8 } from './waveMigration'
import { waveActiveOnLoad } from '../modes/waves/waves'
import { backfillStory, backfillScripted, catchUpBeats } from './storyMigration'
import { backfillTutorial } from './tutorial'
import { catchUpScripted } from './scripted'

/** The newest save format. Every load ends here, whichever version it started from. */
export const LATEST_SAVE_VERSION = 8

/**
 * Bring a loaded save up to the latest version. Each step runs only for saves older than it, so a
 * current save is never re-migrated (and never has its version moved backwards). The steps after
 * the numbered ones are not versions: they fix the save up on every load.
 */
export function migrateSave(input: GameState, from: number): GameState {
  let s = input

  if (from < 2) s = backfillStory(s)
  if (from < 3) s = { ...s, tutorialStepsDone: backfillTutorial(s), scriptedDone: backfillScripted(s) }
  if (from < 4) s = migrateToV4(s)
  if (from < 5) s = migrateToV5(s)

  // v6 (the player starts each wave) is also a load-time rule: a save closed during the
  // wave-cleared banner waits in camp, while a wave that has begun keeps its damaged monster
  const monster = MONSTERS[Math.max(0, Math.min(MONSTERS.length - 1, s.monsterIndex))]
  s = { ...s, waveActive: waveActiveOnLoad({ ...s, monsterMaxHp: monster.hp }, from) }

  if (from < 7) s = migrateToV7(s)
  if (from < 8) s = migrateToV8(s)

  // Beats added before ones this save has already seen must not play their scene for it
  s = catchUpBeats(s)
  // A scene killed mid-read still gets its scripted event (state change only)
  s = catchUpScripted(s)

  return { ...s, saveMigrationVersion: LATEST_SAVE_VERSION }
}
