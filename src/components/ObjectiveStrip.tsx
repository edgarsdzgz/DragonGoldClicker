import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { useGame } from '../context/GameContext'
import { getCurrentObjective } from '../types/objectives'
import { colors, spacing, gold } from '../theme'

interface ObjectiveStripProps {
  label: string
  current: number
  target: number
}

/** One line: icon, label, and progress as `current/target`. Presentational and reusable. */
export function ObjectiveStrip({ label, current, target }: ObjectiveStripProps) {
  const shown = Math.min(Math.floor(current), target)
  return (
    <View
      style={styles.strip}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Objective: ${label}, ${shown} of ${target}`}
    >
      <Ionicons name="flag" size={12} color={gold[400]} />
      <Text variant="caption" style={styles.label}>{label}</Text>
      <Text variant="caption" style={styles.count}>{`${shown}/${target}`}</Text>
    </View>
  )
}

/** The strip for the player's current objective; renders nothing when there is none. */
export function StoryObjective() {
  const { state } = useGame()
  const objective = getCurrentObjective(state)
  if (!objective) return null
  return <ObjectiveStrip {...objective} />
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
    backgroundColor: colors.bg.surface1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  label: {
    flex: 1,
    color: colors.text.secondary,
  },
  count: {
    color: gold[400],
    fontWeight: '600',
  },
})
