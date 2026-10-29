import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { AccessibilityInfo } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { useGame } from '../context/GameContext'
import { useSfx } from './useSfx'
import { useHaptics } from './useHaptics'
import { useReduceMotion } from './useReduceMotion'
import { useScreenReader } from './useScreenReader'
import { SOUND } from '../data/sounds'
import { getForageYield } from '../types/foragers'
import { granaryRoom } from '../types/food'
import { FLAVOR_H } from '../types/warfrontLayout'
import {
  FIRST_FIND_HINT, advanceGap, driftDirection, findDef, findGap, findPay, findShowMs, findSpots,
  isFirstFind, pickFind, pickSpot,
} from '../types/valleyFinds'
import type { FindKind } from '../types/valleyFinds'
import type { FloatingNumbersHandle } from '../components/FloatingNumbers'
import { colors } from '../theme'

export interface ActiveFind {
  /** A new one for each find, so a component never carries over */
  id: number
  kind: FindKind
  x: number
  y: number
  /** Its size in dp, from its depth in the valley */
  size: number
  pay: number
  showMs: number
  drift: -1 | 1
}

interface ValleyFindsOptions {
  /** The Forage battle area, and the FORAGE orb in it */
  width: number
  height: number
  orbDiameter: number
  /** No find comes while the granary is full */
  granaryFull: boolean
  /** Shows a specific line in the flavor slot */
  showHint: (line: string) => void
  /** The layer the "+N" floats from */
  numbers: RefObject<FloatingNumbersHandle | null>
}

/**
 * Owns the Valley Finds countdown and the find on screen. The countdown is session state (a ref);
 * the lifetime tap count in the save decides the first find. One find at a time, and it goes when
 * the tab loses focus.
 */
export function useValleyFinds({ width, height, orbDiameter, granaryFull, showHint, numbers }: ValleyFindsOptions) {
  const { state, catchFind } = useGame()
  const focused = useIsFocused()
  const reduceMotion = useReduceMotion()
  const screenReader = useScreenReader()
  const playFind = useSfx(SOUND.find)
  const haptics = useHaptics()
  const [find, setFind] = useState<ActiveFind | null>(null)

  const forageYield = getForageYield(state.foragePower, state.forageBonus)
  const lastClicks = useRef(state.forageClicks)
  const countdown = useRef(findGap(Math.random()))
  const nextId = useRef(0)
  // Read inside the tap effect, which should run only when the count changes
  const latest = useRef({ width, height, orbDiameter, granaryFull, focused, find, forageYield, reduceMotion, screenReader, showHint, food: state.food })
  latest.current = { width, height, orbDiameter, granaryFull, focused, find, forageYield, reduceMotion, screenReader, showHint, food: state.food }

  useEffect(() => {
    const before = lastClicks.current
    const now = state.forageClicks
    lastClicks.current = now
    if (now <= before) return
    countdown.current = advanceGap(countdown.current, now - before)
    const first = isFirstFind(before, now)
    if (!first && countdown.current > 0) return
    const l = latest.current
    if (l.find || l.granaryFull || !l.focused) return
    const spot = pickSpot(findSpots(l.width, l.height, l.orbDiameter, FLAVOR_H), Math.random())
    if (!spot) return
    const def = first ? findDef('rabbit') : pickFind(Math.random())
    countdown.current = findGap(Math.random())
    setFind({
      id: nextId.current++,
      kind: def.kind,
      x: spot.x,
      y: spot.y,
      size: spot.size,
      pay: findPay(def, l.forageYield),
      showMs: findShowMs(def, l.reduceMotion, l.screenReader),
      drift: driftDirection(spot, l.width),
    })
    if (first) l.showHint(FIRST_FIND_HINT)
    // A screen reader hears it arrive, rather than having to find it by swiping
    if (l.screenReader) AccessibilityInfo.announceForAccessibility(def.label)
  }, [state.forageClicks])

  // A find does not wait for the player to come back
  useEffect(() => {
    if (!focused) setFind(null)
  }, [focused])

  const onCatch = useCallback(() => {
    if (!find) return
    // A granary that filled while the find showed takes less, or nothing: say only what went in
    const added = granaryRoom(latest.current.food, find.pay)
    if (added <= 0) return
    catchFind(find.pay)
    playFind()
    haptics.light()
    numbers.current?.spawn({ x: find.x + find.size / 2, y: find.y, text: `+${added}`, color: colors.forage.accent })
  }, [find, catchFind, playFind, haptics, numbers])

  const onGone = useCallback(() => setFind(null), [])

  return { find, reduceMotion, onCatch, onGone }
}
