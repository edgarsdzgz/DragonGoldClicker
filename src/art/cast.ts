import { SPRITES } from './manifest'
import type { SpriteId } from './manifest'
import type { CastId, Mood } from '../types/cast'

/** Faces locked before the standard set, under their own names, in the set's slots */
const FACE_FILE: Partial<Record<CastId, Partial<Record<Mood, string>>>> = {
  varn: { determined: 'fierce' },
  sera: { determined: 'roaring' },
  thornwick: { alarmed: 'startled' },
}

/** The speaker's portrait: their bust in this mood (neutral when none is asked for); the Gate's emblem */
export function portraitSprite(who: CastId, mood?: Mood): SpriteId {
  if (who === 'gate') return 'cast_emblem-gate'
  if (mood) {
    const faced = `bust_${who}_${FACE_FILE[who]?.[mood] ?? mood}`
    if (faced in SPRITES) return faced as SpriteId
  }
  return `bust_${who}` as SpriteId
}

/** The speaker's portrait with the mouth moving, shown in turn with the face while a line types; the
 *  face itself where there is no talking frame (the Gate's emblem) */
export function talkSprite(who: CastId, mood?: Mood): SpriteId {
  const face = portraitSprite(who, mood)
  const talking = `${face}_talk`
  return talking in SPRITES ? (talking as SpriteId) : face
}

/** The speaker's sigil, worn beside their name; the Gate has none */
export function sigilSprite(who: CastId): SpriteId | null {
  if (who === 'gate') return null
  return `cast_sigil-${who}` as SpriteId
}
