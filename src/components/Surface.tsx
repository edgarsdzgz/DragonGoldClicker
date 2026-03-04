import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { colors, spacing, radius, elevation } from '../theme'

interface SurfaceProps {
  children: ReactNode
  level?: 1 | 2 | 3
  style?: ViewStyle
}

export function Surface({ children, level = 1, style }: SurfaceProps) {
  return (
    <View style={[styles.base, styles[`level_${level}`], elevation[level], style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  level_1: {
    backgroundColor: colors.bg.surface1,
  },
  level_2: {
    backgroundColor: colors.bg.surface2,
  },
  level_3: {
    backgroundColor: colors.bg.surface3,
  },
})

export default Surface
