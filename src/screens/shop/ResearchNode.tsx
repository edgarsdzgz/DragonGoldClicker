import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text, Button, InspirationIcon } from '../../components'
import { REJECT_GOLD } from '../../components/Button'
import { useGame } from '../../context/GameContext'
import { useReduceMotion } from '../../hooks/useReduceMotion'
import { colors, spacing, radius, dark } from '../../theme'
import { formatNumber, getResearchNode } from '../../types/game'
import type { GameState, ResearchNodeDef, ResearchPrereq } from '../../types/game'
import { researchBlock, prereqMet } from '../../types/library'
import type { ResearchBuilding } from '../../types/research'
import { LIB } from './researchPalette'

const BUILDING_NAMES: Record<ResearchBuilding, string> = {
  garrison: 'The Garrison',
  forge: 'The Forge',
  lodge: "The Ranger's Lodge",
  keep: 'The Keep',
}

/** A slow pulse on a study that can be bought; still with Reduce Motion */
function useBreathing(active: boolean) {
  const anim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (!active) {
      anim.setValue(0)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [active, anim])
  return anim
}

/** One study: its icon, name and effect, and its price, COMPLETE, or what it still needs */
export function ResearchNode({ node, color, onStudy }: { node: ResearchNodeDef; color: string; onStudy: (id: string) => void }) {
  const { state } = useGame()
  const reduceMotion = useReduceMotion()
  const block = researchBlock(state, node.id)
  const completed = block === 'done'
  const open = block === null || block === 'renown'
  const breathe = useBreathing(block === null && !reduceMotion)

  const bg = completed ? LIB.completedBg : open ? LIB.nodeBg : LIB.lockedBg
  const border = completed ? `${color}40` : open ? `${color}60` : dark[700]

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bg, borderColor: border },
        block === null && { opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: completed ? `${color}20` : open ? `${color}10` : `${dark[700]}80`,
              borderColor: completed ? `${color}50` : open ? `${color}30` : dark[600],
            },
          ]}
        >
          <Ionicons name={node.icon} size={18} color={completed ? color : open ? `${color}cc` : dark[500]} />
        </View>
        <View style={styles.spacer} />
        {completed ? (
          <View style={[styles.pill, { backgroundColor: `${color}18`, borderColor: `${color}30` }]}>
            <Ionicons name="checkmark" size={10} color={color} />
            <Text variant="caption" style={{ ...styles.pillText, color, fontWeight: 'bold' }}>COMPLETE</Text>
          </View>
        ) : open ? (
          <Button
            size="xs"
            iconElement={<InspirationIcon size={7} />}
            onPress={() => onStudy(node.id)}
            disabled={block !== null}
            accentColor={color}
            rejectPhrases={REJECT_GOLD}
            accessibilityLabel={`Study ${node.name} for ${formatNumber(node.cost)} renown`}
          >
            {formatNumber(node.cost)}
          </Button>
        ) : (
          <View style={[styles.pill, styles.lockedPill]}>
            <Ionicons name="lock-closed" size={9} color={dark[500]} />
            <Text variant="caption" style={{ ...styles.pillText, color: dark[500] }}>LOCKED</Text>
          </View>
        )}
      </View>

      <View style={styles.textBlock}>
        <Text variant="label" style={{ color: completed ? color : open ? colors.text.primary : dark[300], fontWeight: 'bold' }}>
          {node.name}
        </Text>
        <Text variant="caption" style={{ color: open || completed ? colors.text.secondary : dark[500], lineHeight: 15 }}>
          {node.description}
        </Text>
      </View>

      {block === 'locked' && (
        <View style={styles.prereqRow}>
          {node.prereqs.map((p, i) => (
            <PrereqChip key={i} prereq={p} state={state} />
          ))}
        </View>
      )}
    </Animated.View>
  )
}

/** One thing a study needs, and whether it is there: a check, or an empty ring */
function PrereqChip({ prereq, state }: { prereq: ResearchPrereq; state: GameState }) {
  const met = prereqMet(state, prereq)
  const label = prereq.type === 'research' ? getResearchNode(prereq.id)?.name ?? prereq.id : BUILDING_NAMES[prereq.building]
  return (
    <View style={[styles.prereqChip, met && styles.prereqChipMet]} accessibilityLabel={`Needs ${label}${met ? ', done' : ''}`}>
      <Ionicons name={met ? 'checkmark-circle' : 'ellipse-outline'} size={9} color={met ? colors.status.success : dark[500]} />
      <Text variant="caption" style={{ fontSize: 9, color: met ? colors.text.secondary : dark[500] }}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing[3],
    gap: spacing[2],
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  spacer: { flex: 1 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: { gap: 2 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  lockedPill: {
    borderColor: 'transparent',
    backgroundColor: `${dark[700]}80`,
  },
  pillText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  prereqRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
    marginTop: spacing[1],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: dark[700],
  },
  prereqChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${dark[700]}60`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  prereqChipMet: {
    backgroundColor: 'rgba(74, 222, 128, 0.06)',
  },
})
