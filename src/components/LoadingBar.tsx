import React from 'react'
import { View, StyleSheet } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { ProgressBar } from './ProgressBar'
import { Text } from './Text'
import { spacing } from '../theme'

interface LoadingBarProps {
  /** 0 to 1 */
  progress: number
  /** What is loading now ("Readying the art") */
  label: string
  /** A count or note beside it ("42 of 175") */
  detail?: string
  /** Override the bar's gradient */
  gradientColors?: [string, string]
  style?: StyleProp<ViewStyle>
}

/** A progress bar with the step it is on, read out to screen readers as a progress bar */
export function LoadingBar({ progress, label, detail, gradientColors, style }: LoadingBarProps) {
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100)
  return (
    <View
      style={[styles.root, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      accessibilityValue={{ min: 0, max: 100, now: pct }}
    >
      <ProgressBar progress={progress} height={8} gradientColors={gradientColors} />
      <Text variant="caption" color="muted" center>
        {detail ? `${label} (${detail})` : label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    gap: spacing[2],
  },
})
