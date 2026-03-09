import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, radius, gold } from '../theme'

interface ProgressBarProps {
  progress: number
  height?: number
  /** Override gradient colors (defaults to gold) */
  gradientColors?: [string, string]
}

export function ProgressBar({ progress, height = 6, gradientColors }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const barColors = gradientColors ?? [gold[600], gold[400]]

  return (
    <View style={[styles.track, { height }]}>
      <LinearGradient
        colors={barColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${clampedProgress * 100}%` as any }]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.bg.surface3,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
})
