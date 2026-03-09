import React from 'react'
import { View, StyleSheet } from 'react-native'
import { gold } from '../theme'

interface InspirationIconProps {
  size?: number
  color?: string
}

export function InspirationIcon({ size = 14, color = gold[400] }: InspirationIconProps) {
  return (
    <View
      style={[
        styles.icon,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  icon: {
    // base styles only -- dimensions set inline
  },
})
