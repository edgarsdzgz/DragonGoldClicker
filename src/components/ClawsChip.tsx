import React from 'react'
import { Pressable, View, StyleSheet } from 'react-native'
import { GameIcon } from './GameIcon'
import { clawIcon } from '../art'
import { Text } from './Text'
import { colors, spacing, radius, gold } from '../theme'

interface ClawsChipProps {
  /** Claw level: picks the tier icon */
  level: number
  name: string
  damage: number
  /** The next level can be bought now: a dot says so */
  canSharpen: boolean
  onPress: () => void
}

/**
 * The dragon's claws on the Warfront footer (layer 3): the name only (the damage is in Stats and the
 * Claws sheet; a screen reader still hears it); opens the Claws sheet.
 */
export function ClawsChip({ level, name, damage, canSharpen, onPress }: ClawsChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${damage} damage per tap${canSharpen ? '. Can be sharpened' : ''}`}
      accessibilityHint="Opens your claws"
      hitSlop={8}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    >
      <GameIcon name={clawIcon(level)} size={16} color={gold[400]} />
      <Text variant="caption" color="link">{name}</Text>
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
