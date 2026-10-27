import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import type { GameIconName } from '../art'
import { GameIcon } from './GameIcon'
import { Text } from './Text'
import { colors, spacing, radius } from '../theme'

interface ActionRowProps {
  icon?: GameIconName
  iconColor?: string
  title: string
  subtitle?: string
  /** Slot for action element (Button, Badge, etc.) on the right side */
  right?: React.ReactNode
  /** Slot for content below the main row (promote buttons, progress bar, etc.) */
  children?: React.ReactNode
  locked?: boolean
  lockLabel?: string
  style?: ViewStyle
}

export function ActionRow({
  icon,
  iconColor,
  title,
  subtitle,
  right,
  children,
  locked = false,
  lockLabel,
  style,
}: ActionRowProps) {
  if (locked) {
    return (
      <View style={[styles.container, styles.locked, style]}>
        <View style={styles.mainRow}>
          <View style={styles.infoRow}>
            <GameIcon name="lock-closed" size={14} color={colors.text.muted} />
            <Text variant="label" color="muted">{title}</Text>
          </View>
          {lockLabel && (
            <Text variant="caption" color="muted">{lockLabel}</Text>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.mainRow}>
        <View style={styles.left}>
          <View style={styles.header}>
            {icon && (
              <GameIcon
                name={icon}
                size={14}
                color={iconColor ?? colors.text.secondary}
              />
            )}
            <Text variant="label">{title}</Text>
          </View>
          {subtitle && (
            <Text variant="caption" color="muted">{subtitle}</Text>
          )}
        </View>
        {right}
      </View>
      {children && (
        <View style={styles.childrenSlot}>
          {children}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.surface2,
    borderRadius: radius.md,
    padding: spacing[3],
    gap: spacing[2],
  },
  locked: {
    opacity: 0.5,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
    gap: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  childrenSlot: {
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing[2],
  },
})
