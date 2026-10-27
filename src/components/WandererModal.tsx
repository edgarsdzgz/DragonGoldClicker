import React, { useEffect, useRef } from 'react'
import {
  View,
  Modal,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native'
import type { GameIconName } from '../art'
import { GameIcon } from './GameIcon'
import { ModalStage } from './ModalStage'
import { Text } from './Text'
import { Badge } from './Badge'
import { ModalEmblem } from './ModalEmblem'
import { ModalButton } from './ModalButton'
import { colors, spacing, radius, elevation, gold, dark } from '../theme'
import { useHaptics, useSfx } from '../hooks'
import { SOUND } from '../data/sounds'
import type { WandererEncounter } from '../types/game'
import {
  getEncounterName,
  formatCount,
  canWelcome,
} from '../types/game'
import { useGame } from '../context/GameContext'
import { mealCost } from '../types/foodTick'

// The house gold: a knock at the gate is good news
const ACCENT = gold[400]

const ENCOUNTER_ICON: Record<WandererEncounter['encounterType'], GameIconName> = {
  lone_wanderer: 'person',
  traveling_couple: 'people',
  small_family: 'people',
  veteran: 'shield-half',
}

interface WandererModalProps {
  visible: boolean
  encounter: WandererEncounter
  onAccept: () => void
  onReject: () => void
}

export function WandererModal({
  visible,
  encounter,
  onAccept,
  onReject,
}: WandererModalProps) {
  const haptics = useHaptics()
  // A knock at the gate
  const playKnock = useSfx(SOUND.gateKnock)
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
      playKnock()
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
    visible, playKnock,
    backdropOpacity, cardTranslateY, cardOpacity,
    iconScale, iconOpacity, glowPulse,
    contentOpacity, contentTranslateY, actionsOpacity,
  ])

  // Newcomers are fed from the stores on arrival; a veteran also eats like any fighter after
  const affordable = canWelcome(state)
  const storesAfter = state.food - encounter.foodOnArrival
  const mealNow = mealCost(state)
  const mealWithVeteran = encounter.veteran ? mealCost({ ...state, fighters: state.fighters + encounter.people }) : mealNow

  const handleAccept = () => {
    if (!affordable) return
    haptics.light()
    onAccept()
  }

  const handleReject = () => {
    haptics.light()
    onReject()
  }

  const encounterName = getEncounterName(encounter.encounterType)
  const joins = encounter.veteran
    ? `+${encounter.people} fighter`
    : `+${encounter.people} ${encounter.people === 1 ? 'villager' : 'villagers'}`

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />

      <ModalStage>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }],
            },
          ]}
        >
          <ModalEmblem
            accent={ACCENT}
            icon={ENCOUNTER_ICON[encounter.encounterType] ?? 'person'}
            pulse={glowPulse}
            iconStyle={{ opacity: iconOpacity, transform: [{ scale: iconScale }] }}
          />

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
            <Text variant="h3" center accessibilityRole="header">
              {encounterName}
            </Text>

            {/* Flavor text */}
            <Text variant="bodySmall" color="secondary" center style={styles.flavorText}>
              {encounter.flavorText}
            </Text>

            {/* Villager count badge */}
            <View style={styles.badgeRow}>
              <Badge
                icon={encounter.veteran ? 'shield-half' : 'person-add'}
                color={ACCENT}
              >
                <Text variant="caption" style={{ color: ACCENT }}>
                  {joins}
                </Text>
              </Badge>
            </View>

            {/* Food: what the stores pay when they arrive (and, for a veteran, each meal after) */}
            <View style={styles.foodImpact}>
              <View style={styles.foodHeader}>
                <GameIcon name="restaurant" size={13} color={colors.status.warning} />
                <Text variant="caption" bold style={{ color: colors.status.warning }}>
                  Fed on arrival
                </Text>
              </View>
              {encounter.foodOnArrival > 0 ? (
                <View style={styles.foodRow}>
                  <Text variant="caption" color="secondary">Stores:</Text>
                  <View style={styles.foodDelta}>
                    <Text variant="caption" color="secondary">{formatCount(state.food)}</Text>
                    <GameIcon name="arrow-forward" size={10} color={dark[400]} />
                    <Text variant="caption" bold style={{ color: affordable ? colors.status.warning : colors.status.error }}>
                      {affordable ? formatCount(storesAfter) : `needs ${formatCount(encounter.foodOnArrival)}`}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text variant="caption" color="secondary">Mirael shares her own rations: the stores pay nothing.</Text>
              )}
              {encounter.veteran && (
                <View style={styles.foodRow}>
                  <Text variant="caption" color="muted">Each meal after:</Text>
                  <Text variant="caption" style={{ color: ACCENT }}>
                    {`${formatCount(mealNow)} to ${formatCount(mealWithVeteran)} eaten`}
                  </Text>
                </View>
              )}
            </View>

            {!affordable && (
              <View style={styles.overflowNotice}>
                <GameIcon name="information-circle" size={14} color={colors.status.info} />
                <Text variant="caption" style={{ color: colors.status.info, flex: 1 }}>
                  The stores cannot feed them. Gather food, or they move on.
                </Text>
              </View>
            )}
          </Animated.View>

          <View style={styles.divider} />

          <Animated.View style={[styles.actions, { opacity: actionsOpacity }]}>
            <ModalButton
              label="Turn Away"
              variant="secondary"
              onPress={handleReject}
              accessibilityLabel="Turn away wanderer"
            />
            <ModalButton
              label="Welcome"
              icon="hand-left"
              accent={ACCENT}
              disabled={!affordable}
              onPress={handleAccept}
              accessibilityLabel={`Welcome them: ${joins}, ${encounter.foodOnArrival} food from the stores`}
            />
          </Animated.View>
        </Animated.View>
      </ModalStage>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 2, 6, 0.85)',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.bg.surface1,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: dark[700],
    ...elevation[4],
  },
  content: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[3],
    paddingBottom: spacing[5],
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

  divider: {
    height: 1,
    backgroundColor: dark[700],
    marginHorizontal: spacing[4],
  },
  actions: {
    flexDirection: 'row',
    padding: spacing[4],
    gap: spacing[3],
  },
})
