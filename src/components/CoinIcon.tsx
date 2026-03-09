import React from 'react'
import { View, StyleSheet } from 'react-native'
import { gold } from '../theme'

interface CoinIconProps {
  size?: number
  color?: string
}

export function CoinIcon({ size = 14, color = gold[400] }: CoinIconProps) {
  return (
    <View
      style={[
        styles.coin,
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
  coin: {
    // base styles only -- dimensions set inline
  },
})
