/**
 * Pages are lines. Skip exists only for scenes marked as cutscenes (owner ruling 2026-10-25:
 * ordinary scenes never show Skip), and only when there is more than one page to skip.
 */
export function dialogPaging(lineCount: number, page: number, cutscene = false) {
  const pageCount = Math.max(1, lineCount)
  return { pageCount, lastPage: page >= pageCount - 1, canSkip: cutscene && pageCount >= 2 }
}

/** While a line types, the speaker's mouth opens and shuts every this many letters */
export const LETTERS_PER_MOUTH = 4

/**
 * Whether the speaker shows their talking frame: shut for the first few letters, then open and shut in turn,
 * and always shut once the line is whole (so the face rests on its own, and never moves when a line appears
 * whole at once for Reduce Motion or a screen reader).
 */
export function mouthOpen(typed: number, lineLength: number) {
  return typed < lineLength && Math.floor(typed / LETTERS_PER_MOUTH) % 2 === 1
}

/** Taps closer together than this count once (a double tap never skips a line) */
export const PRESS_GUARD_MS = 250
/** A scene ignores taps this long after it opens, so taps meant for the monster never land on it */
export const OPEN_GUARD_MS = 700
/** A whole line stays up at least this long before a tap moves on */
export const READ_GUARD_MS = 500

export interface DialogTapTimes {
  /** When the scene (or the next speaker's part) opened */
  openedAt: number
  /** The last tap that did something; 0 for none */
  lastPressAt: number
  /** When the line on screen became whole; null while it types */
  wholeAt: number | null
}

/**
 * What a tap on a scene does: nothing (too soon), finish the line that is typing, or move on.
 * In the playtest of 2026-10-29, taps on the first kobold went straight through two scenes unread.
 */
export function dialogTap(now: number, t: DialogTapTimes): 'ignore' | 'finish' | 'next' {
  if (tooSoon(now, t.openedAt, OPEN_GUARD_MS)) return 'ignore'
  if (tooSoon(now, t.lastPressAt, PRESS_GUARD_MS)) return 'ignore'
  if (t.wholeAt === null) return 'finish'
  return tooSoon(now, t.wholeAt, READ_GUARD_MS) ? 'ignore' : 'next'
}

/** Within `gap` after `at`; a clock that stepped backward never counts as too soon */
function tooSoon(now: number, at: number, gap: number): boolean {
  return now >= at && now - at < gap
}
