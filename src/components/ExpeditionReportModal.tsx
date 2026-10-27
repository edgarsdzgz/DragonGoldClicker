import React, { useEffect, useRef, useMemo } from 'react'
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
import { GameIcon } from './GameIcon'
import { Text } from './Text'
import type { ExpeditionReport } from '../types/outpost'
import { Badge } from './Badge'
import { colors, spacing, radius, elevation, dark } from '../theme'
import { useHaptics } from '../hooks'

// Cool blue palette for the explorer theme
const explorer = {
  glow: '#60a5fa',
  accent: '#3b82f6',
  deep: '#1e3a5f',
  text: '#bfdbfe',
  miss: '#94a3b8',
}

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

function FloatingMote({ delay, size }: { delay: number; size: number }) {
  const drift = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 0.5,
      duration: 800,
      delay,
      useNativeDriver: true,
    }).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 3500 + delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 3500 + delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [drift, opacity, delay])

  const translateY = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 6],
  })

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: explorer.glow,
        opacity,
        transform: [{ translateY }],
        shadowColor: explorer.glow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 2,
      }}
    />
  )
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

  const accentColor = found ? explorer.accent : explorer.miss
  const glowColor = found ? explorer.glow : explorer.miss
  const iconName: keyof typeof Ionicons.glyphMap = found ? 'people' : 'cloudy-night'

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
              borderColor: glowColor + '20',
              shadowColor: accentColor,
            },
          ]}
        >
          {/* Top accent bar */}
          <LinearGradient
            colors={[explorer.deep, accentColor, glowColor, accentColor, explorer.deep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentBar}
          />

          {/* Icon area */}
          <View style={styles.iconContainer}>
            <Animated.View
              style={[
                styles.glowOuter,
                { opacity: glowPulse, backgroundColor: glowColor + '0A' },
              ]}
            />
            <Animated.View
              style={[
                styles.glowInner,
                { opacity: glowPulse, backgroundColor: glowColor + '18' },
              ]}
            />

            <FloatingMote delay={0} size={3} />
            <FloatingMote delay={400} size={2} />
            <FloatingMote delay={800} size={3} />

            <Animated.View
              style={[
                styles.iconCircle,
                {
                  opacity: iconOpacity,
                  transform: [{ scale: iconScale }],
                  borderColor: glowColor + '60',
                  shadowColor: accentColor,
                },
              ]}
            >
              <LinearGradient
                colors={[dark[700], dark[800]]}
                style={styles.iconGradient}
              >
                <GameIcon name={iconName} size={28} color={accentColor} />
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
            {/* Section label */}
            <Text variant="caption" center style={{ color: dark[400], letterSpacing: 2 }}>
              EXPEDITION #{report.expeditionId}
            </Text>

            {/* Title */}
            <Text variant="h3" center style={{ color: found ? explorer.text : dark[200] }}>
              {title}
            </Text>

            {/* Narrative */}
            <Text variant="bodySmall" color="secondary" center style={styles.narrative}>
              {narrative}
            </Text>

            {/* Result badge */}
            {found ? (
              <View style={styles.badgeRow}>
                <Badge icon="person-add" color={explorer.glow}>
                  <Text variant="caption" style={{ color: explorer.glow }}>
                    +{report.villagersFound} villager{report.villagersFound !== 1 ? 's' : ''} rescued
                  </Text>
                </Badge>
              </View>
            ) : (
              <View style={styles.badgeRow}>
                <Badge icon="close-circle" color={explorer.miss} variant="ghost">
                  <Text variant="caption" style={{ color: explorer.miss }}>
                    No survivors found
                  </Text>
                </Badge>
              </View>
            )}
          </Animated.View>

          {/* Divider */}
          <LinearGradient
            colors={['transparent', glowColor + '30', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.divider}
          />

          {/* Dismiss */}
          <Animated.View style={[styles.actions, { opacity: actionsOpacity }]}>
            <Pressable
              onPress={onDismiss}
              style={({ pressed }) => [
                styles.button,
                found ? styles.dismissButtonFound : styles.dismissButtonMiss,
                pressed && styles.dismissPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Dismiss expedition report"
            >
              {found ? (
                <LinearGradient
                  colors={[explorer.accent, explorer.glow]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.dismissGradient}
                >
                  <Text variant="label" bold style={{ color: dark[900] }}>
                    Continue
                  </Text>
                </LinearGradient>
              ) : (
                <Text variant="label" color="secondary">Continue</Text>
              )}
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
    backgroundColor: 'rgba(2, 5, 15, 0.88)',
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
    ...elevation[4],
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
  narrative: {
    lineHeight: 20,
    fontStyle: 'italic',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[1],
  },

  // Divider
  divider: {
    height: 1,
    marginHorizontal: spacing[4],
  },

  // Actions
  actions: {
    padding: spacing[4],
  },
  button: {
    borderRadius: radius.md,
    minHeight: 44,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonFound: {
    shadowColor: explorer.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dismissButtonMiss: {
    backgroundColor: colors.bg.surface2,
    borderWidth: 1,
    borderColor: dark[600],
  },
  dismissPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  dismissGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
  },
})
