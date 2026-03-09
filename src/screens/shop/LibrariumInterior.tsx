import React, { useEffect, useRef } from 'react'
import { View, Pressable, StyleSheet, Animated, Easing } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text, Button, Badge, InspirationIcon } from '../../components'
import { REJECT_GOLD } from '../../components/Button'
import { useGame } from '../../context/GameContext'
import { useHaptics } from '../../hooks'
import { colors, spacing, radius, dark } from '../../theme'
import {
  formatNumber,
  RESEARCH_CATEGORIES,
  RESEARCH_NODES,
} from '../../types/game'
import type { ResearchNodeDef, ResearchCategory } from '../../types/game'
import { styles as interiorStyles } from './interiorStyles'

// =============================================================================
// ACCENT PALETTE -- derived from librarium sky-blue
// =============================================================================

const LIB = {
  accent: colors.building.librarium,   // #38bdf8
  completedBg: '#0d2235',
  nodeBg: '#0c1a28',
  lockedBg: dark[800],
  mysteryBg: '#0a0a14',
  mysteryBorder: '#1a1a30',
  lineDim: '#1a2a3a',
} as const

// Per-category accent color so each discipline feels unique
const CAT_COLORS: Record<ResearchCategory, string> = {
  economy: '#e0a840',
  military: colors.building.garrison,
  survival: colors.building.lodge,
  exploration: colors.building.explorer,
  mystery: '#c084fc',
}

// =============================================================================
// CATEGORY TAB BAR
// =============================================================================

function TabBar({
  active,
  onChange,
  completedCounts,
}: {
  active: ResearchCategory
  onChange: (cat: ResearchCategory) => void
  completedCounts: Record<ResearchCategory, { done: number; total: number }>
}) {
  return (
    <View style={tabStyles.bar}>
      {RESEARCH_CATEGORIES.map((cat) => {
        const isActive = active === cat.id
        const catColor = CAT_COLORS[cat.id]
        const { done, total } = completedCounts[cat.id]
        const allDone = done === total && total > 0

        return (
          <Pressable
            key={cat.id}
            onPress={() => onChange(cat.id)}
            style={[
              tabStyles.tab,
              isActive && { backgroundColor: `${catColor}18`, borderColor: `${catColor}40` },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Ionicons
              name={cat.icon}
              size={16}
              color={isActive ? catColor : dark[400]}
            />
            <Text
              variant="caption"
              style={{
                color: isActive ? catColor : dark[400],
                fontWeight: isActive ? 'bold' : 'normal',
                fontSize: 10,
                letterSpacing: 0.5,
              }}
            >
              {cat.name.toUpperCase()}
            </Text>
            {allDone ? (
              <View style={[tabStyles.completeDot, { backgroundColor: catColor }]} />
            ) : total > 0 ? (
              <Text variant="caption" style={{ color: dark[500], fontSize: 9 }}>
                {done}/{total}
              </Text>
            ) : null}
          </Pressable>
        )
      })}
    </View>
  )
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: spacing[1],
    marginBottom: spacing[3],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: spacing[2],
    paddingHorizontal: 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  completeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
})

// =============================================================================
// CONNECTOR LINE between tree nodes
// =============================================================================

function TreeConnector({
  parentCompleted,
  catColor,
}: {
  parentCompleted: boolean
  catColor: string
}) {
  return (
    <View style={connStyles.wrapper}>
      <View
        style={[
          connStyles.line,
          { backgroundColor: parentCompleted ? `${catColor}50` : LIB.lineDim },
        ]}
      />
      <View
        style={[
          connStyles.dot,
          parentCompleted
            ? { backgroundColor: catColor }
            : { backgroundColor: dark[700] },
        ]}
      />
      <View
        style={[
          connStyles.line,
          { backgroundColor: parentCompleted ? `${catColor}50` : LIB.lineDim },
        ]}
      />
    </View>
  )
}

const connStyles = StyleSheet.create({
  wrapper: {
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

// =============================================================================
// BREATHING PULSE for available nodes
// =============================================================================

function useBreathingAnim(active: boolean) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (active) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      )
      loop.start()
      return () => loop.stop()
    } else {
      anim.setValue(0)
    }
  }, [active, anim])

  return anim
}

// =============================================================================
// TREE NODE
// =============================================================================

function TreeNode({
  node,
  catColor,
  onResearch,
}: {
  node: ResearchNodeDef
  catColor: string
  onResearch: (id: string) => void
}) {
  const { state, isResearchAvailable } = useGame()
  const completed = state.completedResearch.includes(node.id)
  const available = isResearchAvailable(node.id)
  const canAfford = state.inspiration >= node.cost
  const isMystery = node.mystery && !completed && !available

  const breathe = useBreathingAnim(available && !completed)

  const displayName = isMystery ? '???' : node.name
  const displayDesc = isMystery ? 'Requirements not yet met...' : node.description
  const displayIcon: keyof typeof Ionicons.glyphMap = isMystery ? 'help-circle' : node.icon

  const bgColor = completed ? LIB.completedBg : available ? LIB.nodeBg : isMystery ? LIB.mysteryBg : LIB.lockedBg
  const borderColor = completed ? `${catColor}40` : available ? `${catColor}60` : isMystery ? LIB.mysteryBorder : dark[700]

  return (
    <Animated.View
      style={[
        ndStyles.container,
        { backgroundColor: bgColor, borderColor },
        available && !completed && {
          opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }),
          transform: [{ scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.01] }) }],
        },
        isMystery && { opacity: 0.45 },
      ]}
    >
      {/* Completed tint overlay */}
      {completed && (
        <View style={[ndStyles.glowOverlay, { backgroundColor: `${catColor}08` }]} />
      )}

      {/* Icon circle + status */}
      <View style={ndStyles.topRow}>
        <View
          style={[
            ndStyles.iconCircle,
            {
              backgroundColor: completed ? `${catColor}20` : available ? `${catColor}10` : `${dark[700]}80`,
              borderColor: completed ? `${catColor}50` : available ? `${catColor}30` : dark[600],
            },
          ]}
        >
          <Ionicons
            name={displayIcon}
            size={18}
            color={completed ? catColor : available ? `${catColor}cc` : dark[500]}
          />
        </View>

        <View style={{ flex: 1 }} />

        {completed ? (
          <View style={[ndStyles.statusPill, { backgroundColor: `${catColor}18`, borderColor: `${catColor}30` }]}>
            <Ionicons name="checkmark" size={10} color={catColor} />
            <Text variant="caption" style={{ color: catColor, fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 }}>
              COMPLETE
            </Text>
          </View>
        ) : available ? (
          <Button
            size="xs"
            iconElement={<InspirationIcon size={7} />}
            onPress={() => onResearch(node.id)}
            disabled={!canAfford}
            accentColor={catColor}
            rejectPhrases={REJECT_GOLD}
          >
            {formatNumber(node.cost)}
          </Button>
        ) : !isMystery ? (
          <View style={ndStyles.lockedPill}>
            <Ionicons name="lock-closed" size={9} color={dark[500]} />
            <Text variant="caption" style={{ color: dark[500], fontSize: 9 }}>LOCKED</Text>
          </View>
        ) : (
          <View style={ndStyles.lockedPill}>
            <Text variant="caption" style={{ color: dark[500], fontSize: 9 }}>???</Text>
          </View>
        )}
      </View>

      {/* Name + description */}
      <View style={ndStyles.textBlock}>
        <Text
          variant="label"
          style={{
            color: completed ? catColor : available ? colors.text.primary : isMystery ? dark[500] : dark[300],
            fontWeight: 'bold',
          }}
        >
          {displayName}
        </Text>
        <Text
          variant="caption"
          style={{
            color: completed ? colors.text.secondary : available ? colors.text.secondary : dark[500],
            lineHeight: 15,
          }}
          numberOfLines={2}
        >
          {displayDesc}
        </Text>
      </View>

      {/* Prereq hints for locked (non-mystery) nodes */}
      {!completed && !available && !isMystery && node.prereqs.length > 0 && (
        <View style={ndStyles.prereqRow}>
          {node.prereqs.map((p, i) => (
            <PrereqChip key={i} prereq={p} />
          ))}
        </View>
      )}
    </Animated.View>
  )
}

// Small chip showing a single prerequisite and whether it's met
function PrereqChip({ prereq }: { prereq: ResearchNodeDef['prereqs'][number] }) {
  const { state } = useGame()
  let label = ''
  let met = false

  switch (prereq.type) {
    case 'research': {
      const dep = RESEARCH_NODES.find((n) => n.id === prereq.id)
      label = dep?.name ?? prereq.id
      met = state.completedResearch.includes(prereq.id)
      break
    }
    case 'barracksLevel':
      label = `Garrison Lv${prereq.level}`
      met = state.barracksLevel >= prereq.level
      break
    case 'lodgeLevel':
      label = `Lodge Lv${prereq.level}`
      met = state.lodgeLevel >= prereq.level
      break
    case 'postLevel':
      label = `Outpost Lv${prereq.level}`
      met = state.postLevel >= prereq.level
      break
    case 'totalInspirationEarned':
      label = `${formatNumber(prereq.amount)} inspiration earned`
      met = state.totalInspirationEarned >= prereq.amount
      break
    case 'monstersDefeated':
      label = `${formatNumber(prereq.amount)} defeated`
      met = state.monstersDefeated >= prereq.amount
      break
    case 'villagersRescued':
      label = `${prereq.amount} rescued`
      met = state.villagersRescued >= prereq.amount
      break
  }

  return (
    <View style={[ndStyles.prereqChip, met && ndStyles.prereqChipMet]}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={9}
        color={met ? colors.status.success : dark[500]}
      />
      <Text variant="caption" style={{ fontSize: 9, color: met ? colors.text.secondary : dark[500] }}>
        {label}
      </Text>
    </View>
  )
}

const ndStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing[3],
    gap: spacing[2],
    overflow: 'hidden',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    gap: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  lockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: `${dark[700]}80`,
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

// =============================================================================
// CATEGORY TREE VIEW -- vertical chain with connectors
// =============================================================================

function CategoryTree({ category }: { category: ResearchCategory }) {
  const { state, completeResearch } = useGame()
  const haptics = useHaptics()
  const nodes = RESEARCH_NODES.filter((n) => n.category === category)
  const catColor = CAT_COLORS[category]

  if (nodes.length === 0) return null

  const orderedNodes = buildTreeOrder(nodes)

  const handleResearch = (id: string) => {
    haptics.medium()
    completeResearch(id)
  }

  return (
    <View>
      {orderedNodes.map((node, i) => (
        <React.Fragment key={node.id}>
          {i > 0 && (
            <TreeConnector
              parentCompleted={state.completedResearch.includes(orderedNodes[i - 1].id)}
              catColor={catColor}
            />
          )}
          <TreeNode node={node} catColor={catColor} onResearch={handleResearch} />
        </React.Fragment>
      ))}
    </View>
  )
}

/** Topological sort: parents before children within same category. */
function buildTreeOrder(nodes: ResearchNodeDef[]): ResearchNodeDef[] {
  const nodeIds = new Set(nodes.map((n) => n.id))
  const roots: ResearchNodeDef[] = []
  const children: ResearchNodeDef[] = []

  for (const node of nodes) {
    const hasParentInCategory = node.prereqs.some(
      (p) => p.type === 'research' && nodeIds.has(p.id),
    )
    if (hasParentInCategory) {
      children.push(node)
    } else {
      roots.push(node)
    }
  }

  const ordered: ResearchNodeDef[] = [...roots]
  const remaining = [...children]
  const placed = new Set(roots.map((n) => n.id))

  let safety = 0
  while (remaining.length > 0 && safety < 20) {
    safety++
    for (let i = remaining.length - 1; i >= 0; i--) {
      const node = remaining[i]
      const parentsMet = node.prereqs
        .filter((p) => p.type === 'research' && nodeIds.has(p.id))
        .every((p) => p.type === 'research' && placed.has(p.id))
      if (parentsMet) {
        ordered.push(node)
        placed.add(node.id)
        remaining.splice(i, 1)
      }
    }
  }

  ordered.push(...remaining)
  return ordered
}

// =============================================================================
// LIBRARIUM INTERIOR (main export)
// =============================================================================

export function LibrariumInterior() {
  const { state } = useGame()
  const [activeTab, setActiveTab] = React.useState<ResearchCategory>('economy')
  const totalCompleted = state.completedResearch.length
  const totalNodes = RESEARCH_NODES.length

  const completedCounts = React.useMemo(() => {
    const counts: Record<ResearchCategory, { done: number; total: number }> = {
      economy: { done: 0, total: 0 },
      military: { done: 0, total: 0 },
      survival: { done: 0, total: 0 },
      exploration: { done: 0, total: 0 },
      mystery: { done: 0, total: 0 },
    }
    for (const node of RESEARCH_NODES) {
      counts[node.category].total++
      if (state.completedResearch.includes(node.id)) {
        counts[node.category].done++
      }
    }
    return counts
  }, [state.completedResearch])

  return (
    <View style={interiorStyles.interiorContainer}>
      {/* Header banner */}
      <View style={mainStyles.headerBanner}>
        <LinearGradient
          colors={[`${LIB.accent}12`, `${LIB.accent}04`] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={mainStyles.bannerGradient}
        >
          <View style={mainStyles.bannerLeft}>
            <Ionicons name="book" size={14} color={LIB.accent} style={{ opacity: 0.7 }} />
            <Text variant="bodySmall" color="secondary">
              Ancient knowledge awaits discovery.
            </Text>
          </View>
          <Badge color={LIB.accent} variant="subtle" size="sm">
            <Text variant="caption" style={{ color: LIB.accent, fontSize: 10, fontWeight: 'bold' }}>
              {totalCompleted}/{totalNodes}
            </Text>
          </Badge>
        </LinearGradient>
      </View>

      {/* Category tabs */}
      <TabBar
        active={activeTab}
        onChange={setActiveTab}
        completedCounts={completedCounts}
      />

      {/* Tech tree for active category */}
      <CategoryTree category={activeTab} />
    </View>
  )
}

const mainStyles = StyleSheet.create({
  headerBanner: {
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
})
