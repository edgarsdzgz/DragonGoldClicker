import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../components'
import { spacing, radius, dark } from '../../theme'
import { RESEARCH_CATEGORIES } from '../../types/game'
import type { ResearchCategory } from '../../types/game'
import { BRANCH_COLORS } from './researchPalette'

export type BranchCounts = Record<ResearchCategory, { done: number; total: number }>

/** One tab per branch of studies, with how many of it are done */
export function ResearchTabs({
  active,
  onChange,
  counts,
}: {
  active: ResearchCategory
  onChange: (cat: ResearchCategory) => void
  counts: BranchCounts
}) {
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {RESEARCH_CATEGORIES.map((cat) => {
        const isActive = active === cat.id
        const color = BRANCH_COLORS[cat.id]
        const { done, total } = counts[cat.id]
        const allDone = done === total && total > 0

        return (
          <Pressable
            key={cat.id}
            onPress={() => onChange(cat.id)}
            style={[styles.tab, isActive && { backgroundColor: `${color}18`, borderColor: `${color}40` }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${cat.name}: ${done} of ${total} studied`}
          >
            <Ionicons name={cat.icon} size={16} color={isActive ? color : dark[400]} />
            <Text
              variant="caption"
              style={{ ...styles.name, color: isActive ? color : dark[400], fontWeight: isActive ? 'bold' : 'normal' }}
            >
              {cat.name.toUpperCase()}
            </Text>
            {allDone ? (
              <View style={[styles.completeDot, { backgroundColor: color }]} />
            ) : (
              <Text variant="caption" style={styles.count}>
                {done}/{total}
              </Text>
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: spacing[1],
    marginBottom: spacing[3],
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: spacing[2],
    paddingHorizontal: 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  name: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  count: {
    color: dark[500],
    fontSize: 9,
  },
  completeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
})
