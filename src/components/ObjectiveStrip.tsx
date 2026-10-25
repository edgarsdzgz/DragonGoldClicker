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
  /** Something to show at the right end of the line (e.g. a compact HP meter) */
  right?: React.ReactNode
}

/** One line: icon, label, and progress as `current/target`. Presentational and reusable. */
export function ObjectiveStrip({ label, current, target, right }: ObjectiveStripProps) {
  const shown = Math.min(Math.floor(current), target)
  return (
    <View style={styles.strip}>
      <View
        style={styles.objective}
        accessible
        accessibilityLabel={`Objective: ${label}, ${shown} of ${target}`}
      >
        <Ionicons name="flag" size={12} color={gold[400]} />
        <Text variant="caption" style={styles.label} numberOfLines={1}>{label}</Text>
      </View>
      <Text variant="caption" style={styles.count} importantForAccessibility="no" accessibilityElementsHidden>{`${shown}/${target}`}</Text>
      {right}
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
  objective: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  label: {
    flexShrink: 1,
    color: colors.text.secondary,
  },
  count: {
    color: gold[400],
    fontWeight: '600',
  },
})
