import React from 'react'
import type { ViewStyle } from 'react-native'
import { ToneBadge } from './ToneBadge'
import { useGame } from '../context/GameContext'
import { fighterStatus } from '../types/fedState'
import { foodEventStatus } from '../types/foodEvents'
import { foodEventBadge } from '../art'

const FIGHTER_ICON = { good: 'restaurant', warn: 'remove-circle', bad: 'warning' } as const

/** How the fighters are doing on their rations and the stores (layer 3); nothing when all is normal */
export function FighterStatusBadge({ style }: { style?: ViewStyle }) {
  const { state } = useGame()
  const status = fighterStatus(state)
  if (!status) return null
  return <ToneBadge text={status.text} tone={status.tone} icon={FIGHTER_ICON[status.tone]} style={style} />
}

/** The food event under way, with its clock (layer 3, phase C); nothing between events */
export function FoodEventBadge({ style }: { style?: ViewStyle }) {
  const { state } = useGame()
  const status = foodEventStatus(state)
  if (!status || !state.foodEvent) return null
  return <ToneBadge text={status.text} tone={status.tone} icon={foodEventBadge(state.foodEvent.id)} style={style} />
}
