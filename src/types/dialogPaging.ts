/**
 * Pages are lines. Skip exists only for scenes marked as cutscenes (owner ruling 2026-10-25:
 * ordinary scenes never show Skip), and only when there is more than one page to skip.
 */
export function dialogPaging(lineCount: number, page: number, cutscene = false) {
  const pageCount = Math.max(1, lineCount)
  return { pageCount, lastPage: page >= pageCount - 1, canSkip: cutscene && pageCount >= 2 }
}
