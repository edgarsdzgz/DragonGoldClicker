import React from 'react'
import { View, StyleSheet } from 'react-native'
import { GameIcon } from '../../components/GameIcon'
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
        <View style={[styles.bannerTint, { backgroundColor: `${LIB.accent}0B` }]}>
          <View style={styles.bannerLeft}>
            <GameIcon name="book" size={14} color={LIB.accent} style={styles.bannerIcon} />
            <Text variant="bodySmall" color="secondary">
              Lirae's studies take effect at once.
            </Text>
          </View>
          <Badge color={LIB.accent} variant="subtle" size="sm">
            <Text variant="caption" style={{ ...styles.badgeText, color: LIB.accent }}>
              {done}/{RESEARCH_NODES.length}
            </Text>
          </Badge>
        </View>
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
  bannerTint: {
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
