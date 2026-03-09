import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from './Text'

export interface StatBoxProps {
  value?: string | number
  label: string
  /** Direct color for the value text */
  valueColor?: string
  /** Custom content below value (e.g., gear icon rows) */
  children?: React.ReactNode
}

export function StatBox({ value, label, valueColor, children }: StatBoxProps) {
  return (
    <View style={styles.container}>
      {children ?? (
        <Text variant="h3" style={valueColor ? { color: valueColor } : undefined}>
          {String(value ?? '')}
        </Text>
      )}
      <Text variant="caption" color="muted">{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
})
