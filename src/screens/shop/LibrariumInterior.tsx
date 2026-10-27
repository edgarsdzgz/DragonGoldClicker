import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text, Badge } from '../../components'
import { useGame } from '../../context/GameContext'
import { spacing, radius } from '../../theme'
import { RESEARCH_CATEGORIES, RESEARCH_NODES } from '../../types/game'
import type { ResearchCategory } from '../../types/game'
import { styles as interiorStyles } from './interiorStyles'
import { LIB } from './researchPalette'
import { ResearchTabs } from './ResearchTabs'
import type { BranchCounts } from './ResearchTabs'
import { ResearchBranch } from './ResearchBranch'
import { studiesDone } from '../../types/library'

// =============================================================================
// THE LIBRARIUM (approved 2026-10-26): Lirae's studies, one tab per branch
// =============================================================================

export function LibrariumInterior() {
  const { state } = useGame()
  const [active, setActive] = React.useState<ResearchCategory>(RESEARCH_CATEGORIES[0].id)

  const counts = React.useMemo(() => {
    const c = Object.fromEntries(RESEARCH_CATEGORIES.map((cat) => [cat.id, { done: 0, total: 0 }])) as BranchCounts
    for (const node of RESEARCH_NODES) {
      c[node.category].total++
      if (state.completedResearch.includes(node.id)) c[node.category].done++
    }
    return c
  }, [state.completedResearch])

  const done = studiesDone(state)

  return (
    <View style={interiorStyles.interiorContainer}>
      <View style={styles.banner}>
        <LinearGradient
          colors={[`${LIB.accent}12`, `${LIB.accent}04`] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerLeft}>
            <Ionicons name="book" size={14} color={LIB.accent} style={styles.bannerIcon} />
            <Text variant="bodySmall" color="secondary">
              Lirae's studies take effect at once.
            </Text>
          </View>
          <Badge color={LIB.accent} variant="subtle" size="sm">
            <Text variant="caption" style={{ ...styles.badgeText, color: LIB.accent }}>
              {done}/{RESEARCH_NODES.length}
            </Text>
          </Badge>
        </LinearGradient>
      </View>

      <ResearchTabs active={active} onChange={setActive} counts={counts} />
      <ResearchBranch category={active} />
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[3],
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  bannerIcon: { opacity: 0.7 },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
})
