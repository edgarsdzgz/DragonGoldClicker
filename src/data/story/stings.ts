import type { AudioSource } from 'expo-audio'
import { STORY_BEATS } from '../../types/story'
import type { BeatId } from '../../types/story'
import type { CastId } from '../../types/cast'
import { SCENES } from './lines'
import type { SceneDef } from './lines'
import { CAST_STINGS } from '../sounds'

const onStage = (scene: SceneDef): CastId[] => [scene.who, ...(scene.stage ?? [])]

/**
 * Who first appears in this beat's scene: anyone on stage who is in no earlier beat's scene, in
 * the story's order. Scenes and order can be given (the tests do); the game's are the default.
 */
export function firstAppearances(
  id: BeatId,
  order: readonly BeatId[] = STORY_BEATS.map((b) => b.id),
  scenes: Partial<Record<BeatId, SceneDef>> = SCENES,
): CastId[] {
  const scene = scenes[id]
  if (!scene) return []
  const at = order.indexOf(id)
  const before = new Set(order.slice(0, Math.max(0, at)).flatMap((b) => (scenes[b] ? onStage(scenes[b]!) : [])))
  return [...new Set(onStage(scene))].filter((c) => !before.has(c))
}

/** The sting a scene opens with: the first newcomer's who has one (Sera, Thornwick, the Hollow Knight) */
export function sceneSting(
  id: BeatId,
  order?: readonly BeatId[],
  scenes?: Partial<Record<BeatId, SceneDef>>,
): AudioSource | undefined {
  const who = firstAppearances(id, order, scenes).find((c) => CAST_STINGS[c])
  return who ? CAST_STINGS[who] : undefined
}
