import React from 'react'
import { View, StyleSheet } from 'react-native'
import type { GameIconName } from '../art'
import { GameIcon } from './GameIcon'
import { Text } from './Text'
import { colors, spacing, gold } from '../theme'

interface StatRowProps {
  icon: GameIconName
  /** Custom icon element -- takes precedence over icon string */
  iconElement?: React.ReactNode
  label: string
  value: string
  accent?: boolean
}

export function StatRow({ icon, iconElement, label, value, accent = false }: StatRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.labelSide}>
        {iconElement ?? (
          <GameIcon
            name={icon}
            size={16}
            color={accent ? gold[400] : colors.text.muted}
          />
        )}
        <Text variant="body" color="secondary">{label}</Text>
      </View>
      <Text variant="h3" color={accent ? 'link' : 'primary'}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  labelSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
})
