import React from 'react'
import { Animated, StyleSheet, ViewStyle } from 'react-native'
import { Text } from './Text'
import { spacing } from '../theme'

interface FlavorTextProps {
  text: string
  opacity: Animated.Value
  color?: string
  style?: ViewStyle
  /** Always take this much height (one line, ellipsis), so the layout never shifts when a line appears */
  reserveHeight?: number
}

export function FlavorText({ text, opacity, color, style, reserveHeight }: FlavorTextProps) {
  if (!text && reserveHeight === undefined) return null

  return (
    <Animated.View style={[styles.container, reserveHeight !== undefined && { height: reserveHeight, paddingVertical: 0, justifyContent: 'center' }, { opacity }, style]}>
      <Text variant="bodySmall" color="muted" center numberOfLines={reserveHeight !== undefined ? 1 : undefined} style={color ? { color } : undefined}>
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