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
