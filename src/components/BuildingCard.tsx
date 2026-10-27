import React, { useState, useRef, useCallback } from 'react'
import { View, StyleSheet, Pressable, Animated, LayoutAnimation, Platform, UIManager } from 'react-native'
import type { GameIconName } from '../art'
import { GameIcon } from './GameIcon'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from './Text'
import { useHaptics } from '../hooks'
import { colors, spacing, radius, gold, elevation } from '../theme'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface BuildingCardProps {
  name: string
  icon: GameIconName
  description: string
  isBuilt: boolean
  cost?: number
  canAffordCost?: boolean
  onBuild?: () => void
  statusLabel?: string
  children?: React.ReactNode
}

export function BuildingCard({
  name,
  icon,
  description,
  isBuilt,
  cost,
  canAffordCost = false,
  onBuild,
  statusLabel,
  children,
}: BuildingCardProps) {
  const [expanded, setExpanded] = useState(false)
  const haptics = useHaptics()
  const scaleAnim = useRef(new Animated.Value(1)).current

  const toggleExpand = useCallback(() => {
    if (!isBuilt) return
    haptics.selection()
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded((prev) => !prev)
  }, [isBuilt, haptics])

  const handleBuild = useCallback(() => {
    if (!onBuild || !canAffordCost) return
    haptics.medium()
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start()
    onBuild()
  }, [onBuild, canAffordCost, haptics, scaleAnim])

  if (!isBuilt) {
    return (
      <Animated.View style={[styles.card, styles.unbuildCard, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <GameIcon name={icon} size={24} color={colors.text.muted} dim />
          </View>
          <View style={styles.headerText}>
            <Text variant="h3" color="muted">{name}</Text>
            <Text variant="caption" color="muted">{description}</Text>
          </View>
        </View>
        <Pressable
          onPress={handleBuild}
          disabled={!canAffordCost}
          style={({ pressed }) => [
            styles.buildButton,
            !canAffordCost && styles.buildButtonDisabled,
            pressed && canAffordCost && styles.buildButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Build ${name} for ${cost} gold`}
        >
          <LinearGradient
            colors={canAffordCost
              ? [gold[500], gold[700]]
              : [colors.bg.surface3, colors.bg.surface2]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buildButtonGradient}
          >
            <GameIcon
              name="hammer"
              size={16}
              color={canAffordCost ? '#ffffff' : colors.text.muted}
              dim={!canAffordCost}
            />
            <Text
              variant="button"
              style={{ color: canAffordCost ? '#ffffff' : colors.text.muted }}
            >
              Build - {cost} gold
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    )
  }

  return (
    <View style={[styles.card, styles.builtCard]}>
      <Pressable onPress={toggleExpand} style={styles.builtHeader}>
        <View style={styles.builtIconContainer}>
          <GameIcon name={icon} size={22} color={gold[400]} />
        </View>
        <View style={styles.headerText}>
          <Text variant="h3">{name}</Text>
          {statusLabel && (
            <Text variant="caption" color="secondary">{statusLabel}</Text>
          )}
        </View>
        <GameIcon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.text.muted}
        />
      </Pressable>
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          {children}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...elevation[2],
  },
  unbuildCard: {
    backgroundColor: colors.bg.surface1,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderStyle: 'dashed',
    padding: spacing[4],
    gap: spacing[3],
  },
  builtCard: {
    backgroundColor: colors.bg.surface1,
    borderWidth: 1,
    borderColor: 'rgba(212, 146, 44, 0.15)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.bg.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  builtIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(212, 146, 44, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  builtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
  },
  expandedContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginBottom: spacing[3],
  },
  buildButton: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  buildButtonDisabled: {
    opacity: 0.5,
  },
  buildButtonPressed: {
    opacity: 0.85,
  },
  buildButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
})
