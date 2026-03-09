import React from 'react'
import { Animated, StyleSheet, ViewStyle } from 'react-native'
import { Text } from './Text'
import { spacing } from '../theme'

interface FlavorTextProps {
  text: string
  opacity: Animated.Value
  color?: string
  style?: ViewStyle
}

export function FlavorText({ text, opacity, color, style }: FlavorTextProps) {
  if (!text) return null

  return (
    <Animated.View style={[styles.container, { opacity }, style]}>
      <Text variant="bodySmall" color="muted" center style={color ? { color } : undefined}>
        {text}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[2],
    alignItems: 'center',
  },
})