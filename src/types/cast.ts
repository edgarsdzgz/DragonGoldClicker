// =============================================================================
// THE CAST (who speaks, and how they look saying it)
// =============================================================================

/** Everyone with a bust (and the Gate, the narrator, with its emblem in a bust's place) */
export type CastId =
  | 'pyreth'
  | 'rodain'
  | 'mirael'
  | 'kael'
  | 'lirae'
  | 'varn'
  | 'ashara'
  | 'thornwick'
  | 'sera'
  | 'hollow-knight'
  | 'gate'

/**
 * A face other than the neutral one. Each character has the one their story needs (art batch
 * 42-expressions); asking for a face they do not have shows the neutral bust.
 */
export type Mood = 'grieving' | 'alarmed' | 'angry' | 'fierce' | 'startled' | 'roaring'

/** The face for one line of a scene: the line's own mood, else the scene's, else neutral */
export function lineMood(page: number, mood?: Mood, lineMoods?: Partial<Record<number, Mood>>): Mood | undefined {
  return lineMoods?.[page] ?? mood
}
