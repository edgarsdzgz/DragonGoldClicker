import { useCallback, useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { useShakeRequest } from '../context/ShakeContext'
import { useHaptics } from './useHaptics'
import { getBeat } from '../types/story'
import { runScripted, hasRun } from '../types/scripted'
import { foodPerCheck } from '../types/foodTick'
import type { BeatId } from '../types/story'
import type { SceneTab } from '../data/story/lines'
import type { UnlockToastHandle } from '../components/UnlockToast'

interface Options {
  onNavigate: (tab: SceneTab) => void
  toastRef: React.MutableRefObject<UnlockToastHandle | null>
}

/**
 * Runs a beat's scripted first occurrence when its scene is closed (read or skipped).
 * Each event runs once: the state change is made by the pure `runScripted`, which also
 * records it in `scriptedDone`. The visible extras (shake, toast) are done here.
 */
export function useScriptedEvents({ onNavigate, toastRef }: Options) {
  const { state, applyScripted } = useGame()
  const { requestShake } = useShakeRequest()
  const haptics = useHaptics()

  const stateRef = useRef(state)
  const mealArmed = useRef(false)

  // First meal: watch for the food timer wrapping to 0 and say what was eaten
  useEffect(() => {
    const prev = stateRef.current
    stateRef.current = state
    if (mealArmed.current && prev.foodTimer > 0 && state.foodTimer === 0) {
      mealArmed.current = false
      toastRef.current?.show(`The city ate ${foodPerCheck(prev)} food`, 'nutrition')
    }
  }, [state, toastRef])

  return useCallback((beatId: BeatId) => {
    const scripted = getBeat(beatId)?.scripted
    if (!scripted || hasRun(stateRef.current, scripted)) return

    applyScripted((s) => runScripted(s, scripted))

    if (scripted === 'breachHit') {
      onNavigate('GameTab')
      setTimeout(() => {
        haptics.heavy()
        requestShake()
      }, 350)
    } else if (scripted === 'firstMeal') {
      mealArmed.current = true
    }
  }, [applyScripted, onNavigate, requestShake, haptics])
}
