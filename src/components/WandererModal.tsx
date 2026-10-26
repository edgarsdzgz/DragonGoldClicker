import React, { useEffect, useRef } from 'react'
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { Badge } from './Badge'
import { colors, spacing, radius, elevation, gold, dark } from '../theme'
import { useHaptics, useSfx } from '../hooks'
import { SFX } from '../data/sfx'
import type { WandererEncounter } from '../types/game'
import {
  getEncounterName,
  getTrainedRoleName,
  getTrainedBuildingName,
  getTrainedOverflowRefund,
  getTotalSoldiers,
  getTotalForagers,
  getSoldierCap,
  getForagerCap,
  formatNumber,
  FOOD_CHECK_INTERVAL,
} from '../types/game'
import { useGame } from '../context/GameContext'
import { mealCost } from '../types/foodTick'

// Warm amber palette for the wanderer theme
const warm = {
  glow: '#d4956a',
  accent: '#e8a44a',
  deep: '#8a5a2a',
  text: '#f0c890',
}

interface WandererModalProps {
  visible: boolean
  encounter: WandererEncounter
  onAccept: () => void
  onReject: () => void
}

function WanderingDot({ delay, size }: { delay: number; size: number }) {
  const drift = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 0.6,
      duration: 800,
      delay,
      useNativeDriver: true,
    }).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 3000 + delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 3000 + delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [drift, opacity, delay])

  const translateX = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 8],
  })

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: warm.glow,
        opacity,
        transform: [{ translateX }],
        shadowColor: warm.glow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 2,
      }}
    />
  )
}

function EncounterIcon({ type }: { type: WandererEncounter['encounterType'] }) {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    lone_wanderer: 'person',
    traveling_couple: 'people',
    small_family: 'people',
    trained_refugee: 'shield-half',
  }
  return <Ionicons name={iconMap[type] ?? 'person'} size={28} color={warm.accent} />
}

export function WandererModal({
  visible,
  encounter,
  onAccept,
  onReject,
}: WandererModalProps) {
  const haptics = useHaptics()
  const playNpc = useSfx(SFX.NPC)
  const { state } = useGame()

  // Animations
  const backdropOpacity = useRef(new Animated.Value(0)).current
  const cardTranslateY = useRef(new Animated.Value(50)).current
  const cardOpacity = useRef(new Animated.Value(0)).current
  const iconScale = useRef(new Animated.Value(0.4)).current
  const iconOpacity = useRef(new Animated.Value(0)).current
  const glowPulse = useRef(new Animated.Value(0.3)).current
  const contentOpacity = useRef(new Animated.Value(0)).current
  const contentTranslateY = useRef(new Animated.Value(10)).current
  const actionsOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      playNpc()
      // Phase 1: Backdrop
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start()

      // Phase 2: Card
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 200,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          tension: 55,
          friction: 9,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start()

      // Phase 3: Icon
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 70,
          friction: 7,
          delay: 280,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 200,
          delay: 280,
          useNativeDriver: true,
        }),
      ]).start()

      // Phase 4: Content
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 250,
          delay: 420,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 250,
          delay: 420,
          useNativeDriver: true,
        }),
      ]).start()

      // Phase 5: Actions
      Animated.timing(actionsOpacity, {
        toValue: 1,
        duration: 200,
        delay: 600,
        useNativeDriver: true,
      }).start()

      // Continuous glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, {
            toValue: 0.7,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowPulse, {
            toValue: 0.3,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start()
    } else {
      backdropOpacity.setValue(0)
      cardTranslateY.setValue(50)
      cardOpacity.setValue(0)
      iconScale.setValue(0.4)
      iconOpacity.setValue(0)
      glowPulse.setValue(0.3)
      contentOpacity.setValue(0)
      contentTranslateY.setValue(10)
      actionsOpacity.setValue(0)
    }
  }, [
    visible, playNpc,
    backdropOpacity, cardTranslateY, cardOpacity,
    iconScale, iconOpacity, glowPulse,
    contentOpacity, contentTranslateY, actionsOpacity,
  ])

  // Compute food impact
  // What a meal really costs now (every mouth, fighters too), as the meal tick charges it
  const currentConsumption = mealCost(state)
  const newConsumption = currentConsumption + encounter.foodCostPerCheck

  // Compute trained overflow
  let willOverflow = false
  let overflowRefund = 0
  if (encounter.trained) {
    const t = encounter.trained
    if (t.type === 'soldier') {
      const total = getTotalSoldiers(state.soldiers)
      const cap = getSoldierCap(state.barracksLevel)
      willOverflow = state.barracksLevel <= 0 || total >= cap
    } else {
      const total = getTotalForagers(state.foragers)
      const cap = getForagerCap(state.lodgeLevel)
      willOverflow = state.lodgeLevel <= 0 || total >= cap
    }
    if (willOverflow) {
      overflowRefund = getTrainedOverflowRefund(encounter.trained)
    }
  }

  const handleAccept = () => {
    haptics.light()
    onAccept()
  }

  const handleReject = () => {
    haptics.light()
    onReject()
  }

  const encounterName = getEncounterName(encounter.encounterType)
  const isTrainedType = encounter.trained !== null

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />

      <View style={styles.centerer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }],
            },
          ]}
        >
          {/* Top accent bar */}
          <LinearGradient
            colors={[warm.deep, warm.accent, warm.glow, warm.accent, warm.deep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentBar}
          />

          {/* Icon area with warm glow */}
          <View style={styles.iconContainer}>
            <Animated.View
              style={[
                styles.glowOuter,
                { opacity: glowPulse, backgroundColor: warm.glow + '0A' },
              ]}
            />
            <Animated.View
              style={[
                styles.glowInner,
                { opacity: glowPulse, backgroundColor: warm.glow + '18' },
              ]}
            />

            {/* Wandering dots -- firefly-like ambient particles */}
            <WanderingDot delay={0} size={3} />
            <WanderingDot delay={400} size={2} />
            <WanderingDot delay={800} size={3} />

            <Animated.View
              style={[
                styles.iconCircle,
                {
                  opacity: iconOpacity,
                  transform: [{ scale: iconScale }],
                },
              ]}
            >
              <LinearGradient
                colors={[dark[700], dark[800]]}
                style={styles.iconGradient}
              >
                <EncounterIcon type={encounter.encounterType} />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Content */}
          <Animated.View
            style={[
              styles.content,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
          >
            {/* Title */}
            <Text variant="h3" center style={{ color: warm.text }}>
              {encounterName}
            </Text>

            {/* Flavor text */}
            <Text variant="bodySmall" color="secondary" center style={styles.flavorText}>
              {encounter.flavorText}
            </Text>

            {/* Villager count badge */}
            <View style={styles.badgeRow}>
              <Badge
                icon={isTrainedType ? 'shield-half' : 'person-add'}
                color={warm.accent}
              >
                <Text variant="caption" style={{ color: warm.accent }}>
                  +{encounter.villagerCount} {isTrainedType
                    ? getTrainedRoleName(encounter.trained!)
                    : encounter.villagerCount === 1 ? 'villager' : 'villagers'}
                </Text>
              </Badge>
            </View>

            {/* Food impact */}
            <View style={styles.foodImpact}>
              <View style={styles.foodHeader}>
                <Ionicons name="restaurant" size={13} color={colors.status.warning} />
                <Text variant="caption" bold style={{ color: colors.status.warning }}>
                  Food Impact
                </Text>
              </View>
              <View style={styles.foodRow}>
                <Text variant="caption" color="secondary">
                  Per meal ({FOOD_CHECK_INTERVAL}s):
                </Text>
                <View style={styles.foodDelta}>
                  <Text variant="caption" color="secondary">
                    {formatNumber(currentConsumption)}
                  </Text>
                  <Ionicons name="arrow-forward" size={10} color={dark[400]} />
                  <Text variant="caption" bold style={{ color: colors.status.warning }}>
                    {formatNumber(newConsumption)}
                  </Text>
                </View>
              </View>
              <View style={styles.foodRow}>
                <Text variant="caption" color="muted">
                  Extra mouths:
                </Text>
                <Text variant="caption" style={{ color: warm.accent }}>
                  +{encounter.foodCostPerCheck} food/meal
                </Text>
              </View>
            </View>

            {/* Trained overflow warning */}
            {isTrainedType && willOverflow && (
              <View style={styles.overflowNotice}>
                <Ionicons name="information-circle" size={14} color={colors.status.info} />
                <Text variant="caption" style={{ color: colors.status.info, flex: 1 }}>
                  No room in the {getTrainedBuildingName(encounter.trained!)} -- they'll settle as an idle villager. +{overflowRefund} renown refund for equipment.
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Divider */}
          <LinearGradient
            colors={['transparent', warm.glow + '30', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.divider}
          />

          {/* Actions */}
          <Animated.View style={[styles.actions, { opacity: actionsOpacity }]}>
            <Pressable
              onPress={handleReject}
              style={({ pressed }) => [
                styles.button,
                styles.rejectButton,
                pressed && styles.rejectPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Turn away wanderer"
            >
              <Text variant="label" color="secondary">Turn Away</Text>
            </Pressable>

            <Pressable
              onPress={handleAccept}
              style={({ pressed }) => [
                styles.button,
                styles.acceptButton,
                pressed && styles.acceptPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Welcome ${encounter.villagerCount} wanderer`}
            >
              <LinearGradient
                colors={[warm.accent, warm.glow]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.acceptGradient}
              >
                <Ionicons name="hand-left" size={14} color={dark[900]} />
                <Text variant="label" bold style={{ color: dark[900] }}>
                  Welcome
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 3, 0, 0.88)',
  },
  centerer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: dark[800],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: warm.glow + '20',
    ...elevation[4],
    shadowColor: warm.deep,
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  accentBar: {
    height: 2,
    width: '100%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },

  // Icon area
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[6],
    height: 100,
  },
  glowOuter: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  glowInner: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: warm.glow + '60',
    shadowColor: warm.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    gap: spacing[2],
  },
  flavorText: {
    lineHeight: 20,
    fontStyle: 'italic',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[1],
  },

  // Food impact
  foodImpact: {
    backgroundColor: dark[700] + '80',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: dark[600],
    padding: spacing[3],
    gap: spacing[1],
    marginTop: spacing[1],
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginBottom: spacing[1],
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodDelta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },

  // Overflow
  overflowNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    backgroundColor: colors.status.info + '10',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.status.info + '30',
    padding: spacing[3],
    marginTop: spacing[1],
  },

  // Divider
  divider: {
    height: 1,
    marginHorizontal: spacing[4],
  },

  // Actions
  actions: {
    flexDirection: 'row',
    padding: spacing[4],
    gap: spacing[3],
  },
  button: {
    flex: 1,
    borderRadius: radius.md,
    minHeight: 44,
    overflow: 'hidden',
  },
  rejectButton: {
    backgroundColor: colors.bg.surface2,
    borderWidth: 1,
    borderColor: dark[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectPressed: {
    backgroundColor: colors.bg.surface3,
  },
  acceptButton: {
    shadowColor: warm.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  acceptGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
  },
})
