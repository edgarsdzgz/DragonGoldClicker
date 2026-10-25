import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { ProgressBar } from './ProgressBar'
import { colors, spacing } from '../theme'

interface CityHpMeterProps {
  hp: number
  max: number
  threat: number
  defense: number
  /** One tight block (HP + thin bar) for sharing a row with the objective */
  compact?: boolean
}

/** The city's health: label, threat state and a bar. */
export function CityHpMeter({ hp, max, threat, defense, compact = false }: CityHpMeterProps) {
  const ok = hp > 30
  const tint = ok ? colors.status.success : colors.status.error
  const barColors: [string, string] = ok ? ['#4ade80', '#22c55e'] : ['#ff6b6b', '#ef4444']

  if (compact) {
    return (
      <View
        style={styles.compact}
        accessible
        accessibilityLabel={`Draconia ${hp.toFixed(0)} of ${max} health`}
      >
        <View style={styles.label}>
          <Ionicons name="shield-checkmark" size={12} color={tint} />
          <Text variant="caption" style={{ color: tint }}>{`${hp.toFixed(0)}/${max}`}</Text>
        </View>
        <ProgressBar progress={hp / max} height={4} gradientColors={barColors} />
      </View>
    )
  }

  return (
    <View style={styles.full}>
      <View style={styles.header}>
        <View style={styles.label}>
          <Ionicons name="shield-checkmark" size={14} color={tint} />
          <Text variant="caption" style={{ color: tint }}>{`Draconia ${hp.toFixed(2)}/${max} HP`}</Text>
        </View>
        {threat > defense && (
          <Text variant="caption" style={{ color: colors.status.error }}>{`Threat ${threat} / Def ${defense}`}</Text>
        )}
        {threat <= defense && threat > 0 && (
          <Text variant="caption" style={{ color: colors.status.success }}>Defended</Text>
        )}
      </View>
      <ProgressBar progress={hp / max} height={6} gradientColors={barColors} />
    </View>
  )
}

const styles = StyleSheet.create({
  full: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    gap: spacing[1],
  },
  compact: {
    width: 96,
    gap: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
})
