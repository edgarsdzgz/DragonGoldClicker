import { useGame } from '../context/GameContext'
import { useStory } from '../context/StoryContext'
import { getScene } from '../data/story/lines'

export type ActiveEvent =
  | 'gameOver' | 'offline' | 'scene' | 'starvation' | 'foodWarning' | 'refugees' | 'milestone' | 'wanderer'
  | null

/**
 * Which pop-up is on screen, highest priority first:
 * game over > offline > story scene > starvation > food warning > refugees > milestone > wanderer.
 * Shared by EventHost (to show it) and the coach overlay (to stay out of its way).
 */
export function useActiveEvent(): ActiveEvent {
  const {
    state, isGameOver, pendingOfflineEarnings, pendingStarvationReport,
    pendingFoodWarning, pendingMilestone, pendingWanderer,
  } = useGame()
  const { scenes } = useStory()
  const hasScene = scenes[0] !== undefined && getScene(scenes[0].id) !== undefined

  return isGameOver ? 'gameOver' :
    pendingOfflineEarnings !== null ? 'offline' :
    hasScene ? 'scene' :
    pendingStarvationReport !== null ? 'starvation' :
    pendingFoodWarning > 0 ? 'foodWarning' :
    state.foodEvent?.phase === 'choice' ? 'refugees' :
    pendingMilestone !== null ? 'milestone' :
    pendingWanderer !== null ? 'wanderer' :
    null
}
