import React from 'react'
import { View, StyleSheet } from 'react-native'
import type { GameIconName } from '../../art'
import { GameIcon } from '../../components/GameIcon'
import { Text } from '../../components'
import { ProgressBar } from '../../components/ProgressBar'
import { spacing, radius } from '../../theme'

// =============================================================================
// DESCRIPTION BANNER (tinted banner used across multiple interiors)
// =============================================================================

export function DescriptionBanner({
  icon,
  color,
  children,
}: {
  icon: GameIconName
  color: string
  children: React.ReactNode
}) {
  return (
    <View style={bannerStyles.container}>
      <View style={[bannerStyles.tint, { backgroundColor: `${color}0A` }]}>
        <GameIcon name={icon} size={16} color={color} style={{ opacity: 0.7 }} />
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </View>
    </View>
  )
}

const bannerStyles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  tint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
  },
})

// =============================================================================
// CAPACITY SECTION (label + progress bar, used by multiple interiors)
// =============================================================================

export function CapacitySection({
  label,
  current,
  max,
  gradientColors,
}: {
  label: string
  current: number
  max: number
  gradientColors?: [string, string]
}) {
  return (
    <View style={capStyles.container}>
      <View style={capStyles.row}>
        <Text variant="caption" color="muted">{label}</Text>
        <Text variant="caption" color="secondary">{current} / {max}</Text>
      </View>
      <ProgressBar progress={max > 0 ? current / max : 0} gradientColors={gradientColors} />
    </View>
  )
}

const capStyles = StyleSheet.create({
  container: {
    gap: spacing[1],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
