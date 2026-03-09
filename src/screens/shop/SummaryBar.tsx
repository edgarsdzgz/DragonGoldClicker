import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors, spacing, radius } from '../../theme'

interface SummaryBarProps {
  /** StatBox children -- dividers are auto-inserted between them */
  children: React.ReactNode
}

export function SummaryBar({ children }: SummaryBarProps) {
  const items = React.Children.toArray(children)

  return (
    <View style={styles.container}>
      {items.map((child, i) => (
        <React.Fragment key={i}>
          {child}
          {i < items.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface2,
    borderRadius: radius.md,
    padding: spacing[3],
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border.subtle,
  },
})
