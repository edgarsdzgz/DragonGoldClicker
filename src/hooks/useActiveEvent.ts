import { useGame } from '../context/GameContext'
import { useStory } from '../context/StoryContext'
import { getScene } from '../data/story/lines'

export type ActiveEvent =
  | 'breach' | 'offline' | 'scene' | 'foodWarning' | 'refugees' | 'wanderer'
  | null

/**
 * Which pop-up is on screen, highest priority first:
 * the Breach > offline > story scene > food warning > refugees > wanderer.
 * Shared by EventHost (to show it) and the coach overlay (to stay out of its way).
 */
export function useActiveEvent(): ActiveEvent {
  const {
    state, pendingOfflineEarnings, pendingFoodWarning, pendingWanderer,
  } = useGame()
  const { scenes } = useStory()
  const hasScene = scenes[0] !== undefined && getScene(scenes[0].id) !== undefined

  return state.pendingBreach !== null ? 'breach' :
    pendingOfflineEarnings !== null ? 'offline' :
    hasScene ? 'scene' :
    pendingFoodWarning > 0 ? 'foodWarning' :
    state.foodEvent?.phase === 'choice' ? 'refugees' :
    pendingWanderer !== null ? 'wanderer' :
    null
}
