import React from 'react'
import { Pressable, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { colors, spacing, radius, gold } from '../theme'

interface ClawsChipProps {
  name: string
  damage: number
  /** The next level can be bought now: a dot says so */
  canSharpen: boolean
  onPress: () => void
}

/** The dragon's claws on the Warfront footer (layer 3): name and damage; opens the Claws sheet. */
export function ClawsChip({ name, damage, canSharpen, onPress }: ClawsChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${damage} damage per tap${canSharpen ? '. Can be sharpened' : ''}`}
      accessibilityHint="Opens your claws"
      hitSlop={8}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    >
      <Ionicons name="flash" size={12} color={gold[400]} />
      <Text variant="caption" color="link">{`${name}, ${damage} per tap`}</Text>
      {canSharpen && <View style={styles.dot} />}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    minHeight: 32,
    paddingHorizontal: spacing[3],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: gold[700],
    backgroundColor: colors.bg.surface1,
  },
  pressed: {
    backgroundColor: colors.bg.surface2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: gold[400],
  },
})
