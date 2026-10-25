import React from 'react'
import { View, StyleSheet, Switch, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { colors, spacing, gold, dark } from '../theme'

interface ToggleRowProps {
  label: string
  value: boolean
  onValueChange: (next: boolean) => void
  /** Optional second line under the label */
  description?: string
  icon?: keyof typeof Ionicons.glyphMap
  /** Track color when on (default: gold[500]) */
  accentColor?: string
  disabled?: boolean
}

/**
 * Label + switch row. The whole row is the touch target, and the state is
 * shown by both the switch position and the On/Off text (not color alone).
 */
export function ToggleRow({
  label,
  value,
  onValueChange,
  description,
  icon,
  accentColor = gold[500],
  disabled = false,
}: ToggleRowProps) {
  return (
    <Pressable
      style={styles.row}
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value, disabled }}
    >
      <View style={styles.labelSide}>
        {icon && (
          <Ionicons name={icon} size={18} color={value ? accentColor : colors.text.muted} />
        )}
        <View style={styles.labelText}>
          <Text variant="label" color={disabled ? 'muted' : 'primary'}>{label}</Text>
          {description && <Text variant="caption" color="muted">{description}</Text>}
        </View>
      </View>
      <View style={styles.valueSide}>
        <Text variant="caption" color="muted">{value ? 'On' : 'Off'}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ false: dark[700], true: accentColor }}
          thumbColor={colors.text.primary}
          // The row carries the accessibility role; hide the inner switch from screen readers
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingVertical: spacing[2],
    gap: spacing[3],
  },
  labelSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  labelText: {
    flex: 1,
  },
  valueSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
})
