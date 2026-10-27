import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useGame } from '../../context/GameContext'
import { useHaptics } from '../../hooks'
import { dark } from '../../theme'
import { getNodesByCategory } from '../../types/game'
import type { ResearchCategory } from '../../types/game'
import { BRANCH_COLORS, LIB } from './researchPalette'
import { ResearchNode } from './ResearchNode'

/** The line between two studies: lit once the one above is done */
function Connector({ lit, color }: { lit: boolean; color: string }) {
  const line = { backgroundColor: lit ? `${color}50` : LIB.lineDim }
  return (
    <View style={styles.connector}>
      <View style={[styles.line, line]} />
      <View style={[styles.dot, { backgroundColor: lit ? color : dark[700] }]} />
      <View style={[styles.line, line]} />
    </View>
  )
}

/** One branch of studies as a chain, top to bottom (the tree lists each branch in order) */
export function ResearchBranch({ category }: { category: ResearchCategory }) {
  const { state, completeResearch } = useGame()
  const haptics = useHaptics()
  const color = BRANCH_COLORS[category]
  const nodes = getNodesByCategory(category)

  const onStudy = (id: string) => {
    if (completeResearch(id)) haptics.medium()
  }

  return (
    <View>
      {nodes.map((node, i) => (
        <React.Fragment key={node.id}>
          {i > 0 && <Connector lit={state.completedResearch.includes(nodes[i - 1].id)} color={color} />}
          <ResearchNode node={node} color={color} onStudy={onStudy} />
        </React.Fragment>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  connector: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    borderRadius: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
})
