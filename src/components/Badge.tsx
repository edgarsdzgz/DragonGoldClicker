import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { spacing, radius } from '../theme'

type BadgeVariant = 'subtle' | 'filled' | 'ghost'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  children: React.ReactNode
  /** Base color -- background/border computed as rgba derivatives */
  color: string
  icon?: keyof typeof Ionicons.glyphMap
  /** Custom icon element -- takes precedence over icon string */
  iconElement?: React.ReactNode
  iconSize?: number
  variant?: BadgeVariant
  size?: BadgeSize
  style?: ViewStyle
}

/**
 * Converts a hex color to an rgba string at the given alpha.
 * Supports #RGB, #RRGGBB, and named CSS colors that happen to be hex.
 */
function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '')
  let r: number, g: number, b: number
  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16)
    g = parseInt(cleaned[1] + cleaned[1], 16)
    b = parseInt(cleaned[2] + cleaned[2], 16)
  } else {
    r = parseInt(cleaned.slice(0, 2), 16)
    g = parseInt(cleaned.slice(2, 4), 16)
    b = parseInt(cleaned.slice(4, 6), 16)
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function Badge({
  children,
  color,
  icon,
  iconElement,
  iconSize,
  variant = 'subtle',
  size = 'md',
  style,
}: BadgeProps) {
  const isSm = size === 'sm'
  const resolvedIconSize = iconSize ?? (isSm ? 8 : 12)

  const variantStyle: ViewStyle =
    variant === 'subtle'
      ? {
          backgroundColor: hexToRgba(color, 0.08),
          borderWidth: 1,
          borderColor: hexToRgba(color, 0.12),
        }
      : variant === 'filled'
        ? {
            backgroundColor: color,
          }
        : {
            // ghost: just tinted background, no border
            backgroundColor: hexToRgba(color, 0.06),
          }

  return (
    <View
      style={[
        styles.base,
        isSm ? styles.sizeSm : styles.sizeMd,
        variantStyle,
        style,
      ]}
    >
      {iconElement ?? (icon && <Ionicons name={icon} size={resolvedIconSize} color={color} />)}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
  },
  sizeSm: {
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sizeMd: {
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
})
