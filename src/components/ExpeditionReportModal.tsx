import React, { useEffect, useRef, useMemo } from 'react'
import {
  View,
  Modal,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native'
import { Text } from './Text'
import { ModalStage } from './ModalStage'
import type { ExpeditionReport } from '../types/outpost'
import { Badge } from './Badge'
import { ModalEmblem } from './ModalEmblem'
import { ModalButton } from './ModalButton'
import { colors, spacing, radius, elevation, dark } from '../theme'
import { useHaptics } from '../hooks'

// The Explorer's Outpost color; a fruitless trip is plain gray
const FOUND = colors.building.explorer
const MISS = dark[300]

// ---------------------------------------------------------------------------
// FLAVOR TEXT POOLS
// ---------------------------------------------------------------------------

const MISS_NARRATIVES = [
  'The explorers pressed through ashen dunes and hollow ruins. Nothing stirred. The wasteland kept its silence.',
  'Miles of cracked earth and collapsed shelters -- not a soul in sight. The wind was their only companion.',
  'They followed old footprints to a collapsed cellar. Empty. Whoever was here left long ago.',
  'Fog rolled in thick across the deadlands. The party turned back before nightfall, empty-handed.',
  'A promising trail led to an abandoned camp. The fires were cold. Weeks cold.',
  'The scouts circled a ruined village twice. Only crows remained.',
  'Dust storms forced the explorers into shelter for hours. By the time they emerged, the trail had vanished.',
  'They found wagon tracks leading east, but the path ended at a collapsed bridge. No way to follow.',
]

const FIND_1_NARRATIVES = [
  'A lone figure emerged from behind a fallen watchtower, waving a torn cloth. Alive -- barely.',
  'Huddled in a root cellar beneath a burned farmstead, one survivor waited. They had been counting the days.',
  'The scouts heard tapping from inside an overturned wagon. Someone had sealed themselves in with the last of their rations.',
  'At the edge of a dried riverbed, a campfire still smoldered. Its keeper was asleep, exhausted but breathing.',
  'A faint whistle carried across the dunes. One of the explorers recognized the old village signal. Someone was calling for help.',
  'They almost missed the figure in the shadows of a collapsed archway. Quiet, watchful, but relieved to see friendly faces.',
]

const FIND_2_NARRATIVES = [
  'Two survivors had barricaded themselves in a stone granary. They had water, but food ran out days ago.',
  'The explorers spotted smoke rising from a ravine. Two villagers had built a makeshift shelter and were rationing dried berries.',
  'A pair of travelers flagged down the scouts from a hilltop. They had been walking for days, following the stars toward Draconia.',
  'In the ruins of an old mill, two survivors had fashioned tools from scrap. Resourceful -- they will fit in well.',
  'The party found a mother and child sheltering beneath an ancient aqueduct. Both were weary but unharmed.',
]

const FIND_3_NARRATIVES = [
  'A small group had fortified a cave entrance with rubble. Three survivors, organized and ready to move. They had been waiting for exactly this.',
  'Three villagers had formed a tiny caravan, traveling by night to avoid the heat. The explorers intercepted them just in time.',
  'The scouts discovered a hidden camp in a wooded hollow. Three souls -- they had kept each other alive with songs and stubbornness.',
  'At an old crossroads marker, three survivors had gathered, each from different directions. All with the same hope: Draconia.',
]

function pickRandom(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)]
}

function getNarrative(villagersFound: number): string {
  if (villagersFound <= 0) return pickRandom(MISS_NARRATIVES)
  if (villagersFound === 1) return pickRandom(FIND_1_NARRATIVES)
  if (villagersFound === 2) return pickRandom(FIND_2_NARRATIVES)
  return pickRandom(FIND_3_NARRATIVES)
}

function getTitle(villagersFound: number): string {
  if (villagersFound <= 0) return 'The Wasteland Was Silent'
  if (villagersFound === 1) return 'A Light in the Dark'
  if (villagersFound === 2) return 'Survivors Spotted'
  return 'A Lucky Find'
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

export type { ExpeditionReport } from '../types/outpost'

interface ExpeditionReportModalProps {
  visible: boolean
  report: ExpeditionReport | null
  onDismiss: () => void
}

export function ExpeditionReportModal({
  visible,
  report,
  onDismiss,
}: ExpeditionReportModalProps) {
  const haptics = useHaptics()
  const found = report ? report.villagersFound > 0 : false

  // Memoize narrative so it doesn't re-roll on re-renders
  const narrative = useMemo(
    () => (report ? getNarrative(report.villagersFound) : ''),
    [report],
  )
  const title = useMemo(
    () => (report ? getTitle(report.villagersFound) : ''),
    [report],
  )

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
      if (found) haptics.success()
      else haptics.light()

      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start()

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

      Animated.timing(actionsOpacity, {
        toValue: 1,
        duration: 200,
        delay: 600,
        useNativeDriver: true,
      }).start()

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
    visible, found,
    backdropOpacity, cardTranslateY, cardOpacity,
    iconScale, iconOpacity, glowPulse,
    contentOpacity, contentTranslateY, actionsOpacity,
    haptics,
  ])

  if (!report) return null

  const accent = found ? FOUND : MISS

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
            accent={accent}
            icon={found ? 'people' : 'compass'}
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
            <Text variant="caption" center style={{ color: dark[400], letterSpacing: 2 }}>
              EXPEDITION #{report.expeditionId}
            </Text>

            <Text variant="h3" center accessibilityRole="header">
              {title}
            </Text>

            <Text variant="bodySmall" color="secondary" center style={styles.narrative}>
              {narrative}
            </Text>

            <View style={styles.badgeRow}>
              {found ? (
                <Badge icon="person-add" color={accent}>
                  <Text variant="caption" style={{ color: accent }}>
                    +{report.villagersFound} villager{report.villagersFound !== 1 ? 's' : ''} rescued
                  </Text>
                </Badge>
              ) : (
                <Badge icon="close-circle" color={accent} variant="ghost">
                  <Text variant="caption" style={{ color: accent }}>
                    No survivors found
                  </Text>
                </Badge>
              )}
            </View>
          </Animated.View>

          <View style={styles.divider} />

          <Animated.View style={[styles.actions, { opacity: actionsOpacity }]}>
            <ModalButton
              label="Continue"
              variant={found ? 'primary' : 'secondary'}
              accent={accent}
              onPress={onDismiss}
              accessibilityLabel="Dismiss expedition report"
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
  narrative: {
    lineHeight: 20,
    fontStyle: 'italic',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  },
})
