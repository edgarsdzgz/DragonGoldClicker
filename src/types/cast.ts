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
 * A face other than the neutral one: the standard set every bust has (art batch 50-expressions-set,
 * 2026-10-27). The Hollow Knight has no face: its faces are a light inside its visor slit.
 */
export type Mood = 'happy' | 'grieving' | 'angry' | 'alarmed' | 'worried' | 'determined'

export const MOODS: readonly Mood[] = ['happy', 'grieving', 'angry', 'alarmed', 'worried', 'determined']

/** The face for one line of a scene: the line's own mood, else the scene's, else neutral */
export function lineMood(page: number, mood?: Mood, lineMoods?: Partial<Record<number, Mood>>): Mood | undefined {
  return lineMoods?.[page] ?? mood
}
