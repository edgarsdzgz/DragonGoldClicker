/** Pages are lines. Skip is only for scenes with two or more pages. */
export function dialogPaging(lineCount: number, page: number) {
  const pageCount = Math.max(1, lineCount)
  return { pageCount, lastPage: page >= pageCount - 1, canSkip: pageCount >= 2 }
}
