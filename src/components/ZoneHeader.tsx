import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from './Text'
import { colors, spacing, gold } from '../theme'

interface ZoneHeaderProps {
  label: string
}

export function ZoneHeader({ label }: ZoneHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.diamond} />
      <Text variant="caption" color="muted" style={styles.label}>
        {label}
      </Text>
      <View style={styles.rule} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  diamond: {
    width: 6,
    height: 6,
    transform: [{ rotate: '45deg' }],
    backgroundColor: gold[500],
  },
  label: {
    letterSpacing: 2,
    fontSize: 11,
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.subtle,
  },
})
