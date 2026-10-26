import React from 'react'
import { View } from 'react-native'
import { Badge } from './Badge'
import { Text } from './Text'
import { useGame } from '../context/GameContext'
import { fighterStatus } from '../types/fedState'
import { colors } from '../theme'
import type { ViewStyle } from 'react-native'

const TONE = {
  good: { color: colors.status.success, icon: 'restaurant' },
  warn: { color: colors.status.warning, icon: 'remove-circle' },
  bad: { color: colors.status.error, icon: 'warning' },
} as const

/** How the fighters are doing on their rations and the stores (layer 3); nothing when all is normal */
export function FighterStatusBadge({ style }: { style?: ViewStyle }) {
  const { state } = useGame()
  const status = fighterStatus(state)
  if (!status) return null
  const tone = TONE[status.tone]
  return (
    <View accessible accessibilityLabel={status.text} style={style}>
      <Badge icon={tone.icon} color={tone.color}>
        <Text variant="caption" style={{ color: tone.color }}>{status.text}</Text>
      </Badge>
    </View>
  )
}
