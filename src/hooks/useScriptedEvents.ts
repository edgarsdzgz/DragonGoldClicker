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
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Beats whose scene was closed this session and whose event had to wait (see retry below)
  const waiting = useRef<Set<BeatId>>(new Set())

  useEffect(() => () => {
    if (shakeTimer.current) clearTimeout(shakeTimer.current)
  }, [])

  // First meal: watch for the food timer wrapping to 0 and say what was eaten
  useEffect(() => {
    const prev = stateRef.current
    stateRef.current = state
    if (mealArmed.current && prev.foodTimer > 0 && state.foodTimer === 0) {
      mealArmed.current = false
      toastRef.current?.show(`The city ate ${foodPerCheck(prev)} food`, 'nutrition')
    }
  }, [state, toastRef])

  // A lone wanderer could not arrive while another was pending: retry once that one is gone
  useEffect(() => {
    if (state.pendingWanderer || !waiting.current.has('strangers_at_gate')) return
    waiting.current.delete('strangers_at_gate')
    applyScripted((s) => runScripted(s, 'loneWanderer'))
  }, [state.pendingWanderer, applyScripted])

  return useCallback((beatId: BeatId) => {
    const scripted = getBeat(beatId)?.scripted
    if (!scripted || hasRun(stateRef.current, scripted)) return

    applyScripted((s) => runScripted(s, scripted))
    if (scripted === 'loneWanderer' && stateRef.current.pendingWanderer) waiting.current.add(beatId)

    if (scripted === 'breachHit') {
      onNavigate('GameTab')
      if (shakeTimer.current) clearTimeout(shakeTimer.current)
      shakeTimer.current = setTimeout(() => {
        haptics.heavy()
        requestShake()
      }, 350)
    } else if (scripted === 'firstMeal') {
      mealArmed.current = true
    }
  }, [applyScripted, onNavigate, requestShake, haptics])
}
