import React from 'react'
import { View } from 'react-native'
import type { ViewStyle } from 'react-native'
import { Badge } from './Badge'
import { Text } from './Text'
import { colors } from '../theme'

export type BadgeTone = 'good' | 'warn' | 'bad'

const TONE_COLOR: Record<BadgeTone, string> = {
  good: colors.status.success,
  warn: colors.status.warning,
  bad: colors.status.error,
}

interface ToneBadgeProps {
  text: string
  tone: BadgeTone
  icon: React.ComponentProps<typeof Badge>['icon']
  style?: ViewStyle
}

/** A one-line status pill coloured by how good or bad the news is; read out as its text */
export function ToneBadge({ text, tone, icon, style }: ToneBadgeProps) {
  const color = TONE_COLOR[tone]
  return (
    <View accessible accessibilityLabel={text} style={style}>
      <Badge icon={icon} color={color}>
        <Text variant="caption" style={{ color }}>{text}</Text>
      </Badge>
    </View>
  )
}
