import React from 'react'
import { TextStyle } from 'react-native'
import { Text } from './Text'

interface SectionLabelProps {
  children: string
  /** Letter-spacing value (default 1) */
  spacing?: 1 | 2
  style?: TextStyle
}

export function SectionLabel({ children, spacing: letterSpacing = 1, style }: SectionLabelProps) {
  return (
    <Text
      variant="caption"
      color="muted"
      style={{ letterSpacing, ...style }}
    >
      {children}
    </Text>
  )
}
