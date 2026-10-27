import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import type { GameIconName } from '../art'
import { GameIcon } from './GameIcon'
import { Text } from './Text'
import { colors, spacing, radius, gold, dark } from '../theme'

interface ModalButtonProps {
  label: string
  onPress: () => void
  /** primary: filled with the accent; secondary: the plain surface button */
  variant?: 'primary' | 'secondary'
  accent?: string
  icon?: GameIconName
  iconElement?: React.ReactNode
  disabled?: boolean
  accessibilityLabel?: string
}

/** A modal card's action button, as ConfirmModal draws its own: flat fills, no gradients or shimmer. */
export function ModalButton({
  label,
  onPress,
  variant = 'primary',
  accent = gold[400],
  icon,
  iconElement,
  disabled = false,
  accessibilityLabel,
}: ModalButtonProps) {
  const primary = variant === 'primary'
  const textColor = disabled ? colors.text.muted : primary ? dark[900] : colors.text.secondary
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.button,
        disabled ? styles.disabled : primary ? { backgroundColor: accent } : styles.secondary,
        !disabled && pressed && (primary ? styles.primaryPressed : styles.secondaryPressed),
      ]}
    >
      <View style={styles.inner}>
        {iconElement ?? (icon && <GameIcon name={icon} size={14} color={textColor} />)}
        <Text variant="label" bold={primary} style={{ color: textColor }}>{label}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    minHeight: 48,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  secondary: {
    backgroundColor: colors.bg.surface2,
    borderWidth: 1,
    borderColor: dark[600],
  },
  secondaryPressed: {
    backgroundColor: colors.bg.surface3,
  },
  primaryPressed: {
    opacity: 0.85,
  },
  disabled: {
    backgroundColor: dark[600],
    borderWidth: 1,
    borderColor: dark[500],
  },
})
