import { SPRITES } from './manifest'
import type { SpriteId } from './manifest'
import type { CastId, Mood } from '../types/cast'

/** The speaker's portrait: the bust in this mood if they have one, else the neutral bust; the Gate's emblem */
export function portraitSprite(who: CastId, mood?: Mood): SpriteId {
  if (who === 'gate') return 'cast_emblem-gate'
  const faced = `bust_${who}_${mood}`
  if (mood && faced in SPRITES) return faced as SpriteId
  return `bust_${who}` as SpriteId
}

/** The speaker's sigil, worn beside their name; the Gate has none */
export function sigilSprite(who: CastId): SpriteId | null {
  if (who === 'gate') return null
  return `cast_sigil-${who}` as SpriteId
}
