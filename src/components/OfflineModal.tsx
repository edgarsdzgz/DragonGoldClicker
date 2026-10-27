import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { GameIcon } from './GameIcon'
import { Text } from './Text'
import { InspirationIcon } from './InspirationIcon'
import { colors, spacing, radius, elevation, gold, dark } from '../theme'
import { formatNumber } from '../types/game'
import { useHaptics } from '../hooks'

interface OfflineModalProps {
  visible: boolean
  inspirationEarned: number
  secondsAway: number
  onCollect: () => void
  /** A character speaking over the report (the first time the Keep collects for you) */
  framing?: { speaker: string; text: string }
  /** What happened to the wall while away (chapter 5 phase C) */
  wallLine?: string
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

// Orbiting spark around the central icon
function Spark({ delay, size, orbitRadius }: { delay: number; size: number; orbitRadius: number }) {
  const rotation = useRef(new Animated.Value(0)).current
  const sparkOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(sparkOpacity, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start()

    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 4000 + delay * 2,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start()
  }, [rotation, sparkOpacity, delay])

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <Animated.View
      style={[
        styles.sparkOrbit,
        {
          width: orbitRadius * 2,
          height: orbitRadius * 2,
          opacity: sparkOpacity,
          transform: [{ rotate }],
        },
      ]}
    >
      <View
        style={[
          styles.spark,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: gold[300],
            shadowColor: gold[400],
          },
        ]}
      />
    </Animated.View>
  )
}

export function OfflineModal({
  visible,
  inspirationEarned,
  secondsAway,
  onCollect,
  framing,
  wallLine,
}: OfflineModalProps) {
  const haptics = useHaptics()

  // Staggered entrance animations
  const backdropOpacity = useRef(new Animated.Value(0)).current
  const cardTranslateY = useRef(new Animated.Value(60)).current
  const cardOpacity = useRef(new Animated.Value(0)).current

  // Icon animations
  const iconScale = useRef(new Animated.Value(0.3)).current
  const iconOpacity = useRef(new Animated.Value(0)).current
  const glowPulse = useRef(new Animated.Value(0.4)).current
  const glowScale = useRef(new Animated.Value(0.8)).current

  // Content stagger
  const titleOpacity = useRef(new Animated.Value(0)).current
  const titleTranslateY = useRef(new Animated.Value(12)).current
  const amountOpacity = useRef(new Animated.Value(0)).current
  const amountScale = useRef(new Animated.Value(0.8)).current
  const footerOpacity = useRef(new Animated.Value(0)).current
  const btnOpacity = useRef(new Animated.Value(0)).current
  const btnTranslateY = useRef(new Animated.Value(10)).current

  // Button shimmer
  const shimmerPosition = useRef(new Animated.Value(-1)).current

  // Counting animation
  const [displayInsp, setDisplayInsp] = useState(0)
  const countingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (visible) {
      setDisplayInsp(0)

      // Phase 1: Backdrop
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()

      // Phase 2: Card rises in (delay 150ms)
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 250,
          delay: 150,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 9,
          delay: 150,
          useNativeDriver: true,
        }),
      ]).start()

      // Phase 3: Icon blooms in (delay 350ms)
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 80,
          friction: 6,
          delay: 350,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 200,
          delay: 350,
          useNativeDriver: true,
        }),
      ]).start()

      // Phase 4: Title fades in (delay 500ms)
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 250,
          delay: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 250,
          delay: 500,
          useNativeDriver: true,
        }),
      ]).start()

      // Phase 5: Inspiration amount pops in (delay 650ms) + start counting
      Animated.parallel([
        Animated.timing(amountOpacity, {
          toValue: 1,
          duration: 200,
          delay: 650,
          useNativeDriver: true,
        }),
        Animated.spring(amountScale, {
          toValue: 1,
          tension: 100,
          friction: 7,
          delay: 650,
          useNativeDriver: true,
        }),
      ]).start()

      // Start counting up inspiration after the amount appears
      const countDelay = setTimeout(() => {
        const steps = Math.min(inspirationEarned, 30)
        const stepValue = inspirationEarned / steps
        let current = 0
        let step = 0
        countingRef.current = setInterval(() => {
          step++
          current = Math.min(Math.floor(stepValue * step), inspirationEarned)
          setDisplayInsp(current)
          if (step >= steps) {
            if (countingRef.current) clearInterval(countingRef.current)
            setDisplayInsp(inspirationEarned)
          }
        }, 25)
      }, 750)

      // Phase 6: Footer + button (delay 900ms)
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 200,
        delay: 900,
        useNativeDriver: true,
      }).start()

      Animated.parallel([
        Animated.timing(btnOpacity, {
          toValue: 1,
          duration: 200,
          delay: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(btnTranslateY, {
          toValue: 0,
          duration: 200,
          delay: 1000,
          useNativeDriver: true,
        }),
      ]).start()

      // Continuous glow pulse
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(glowPulse, {
              toValue: 0.8,
              duration: 1800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(glowPulse, {
              toValue: 0.4,
              duration: 1800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(glowScale, {
              toValue: 1.1,
              duration: 1800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(glowScale, {
              toValue: 0.8,
              duration: 1800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start()

      // Button shimmer sweep
      Animated.loop(
        Animated.sequence([
          Animated.delay(1200),
          Animated.timing(shimmerPosition, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(shimmerPosition, {
            toValue: -1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
        ])
      ).start()

      return () => {
        clearTimeout(countDelay)
        if (countingRef.current) clearInterval(countingRef.current)
      }
    } else {
      // Reset all values
      backdropOpacity.setValue(0)
      cardTranslateY.setValue(60)
      cardOpacity.setValue(0)
      iconScale.setValue(0.3)
      iconOpacity.setValue(0)
      glowPulse.setValue(0.4)
      glowScale.setValue(0.8)
      titleOpacity.setValue(0)
      titleTranslateY.setValue(12)
      amountOpacity.setValue(0)
      amountScale.setValue(0.8)
      footerOpacity.setValue(0)
      btnOpacity.setValue(0)
      btnTranslateY.setValue(10)
      shimmerPosition.setValue(-1)
      setDisplayInsp(0)
      if (countingRef.current) clearInterval(countingRef.current)
    }
  }, [
    visible, inspirationEarned,
    backdropOpacity, cardTranslateY, cardOpacity,
    iconScale, iconOpacity, glowPulse, glowScale,
    titleOpacity, titleTranslateY,
    amountOpacity, amountScale,
    footerOpacity, btnOpacity, btnTranslateY,
    shimmerPosition,
  ])

  const handleCollect = () => {
    haptics.heavy()
    onCollect()
  }

  const shimmerTranslateX = shimmerPosition.interpolate({
    inputRange: [-1, 1],
    outputRange: [-120, 320],
  })

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      {/* Deep backdrop with warm tint */}
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
          {/* Gradient top edge */}
          <LinearGradient
            colors={[gold[600], gold[400], gold[300], gold[400], gold[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentBar}
          />

          {/* Icon area with layered glows + orbiting sparks */}
          <View style={styles.iconContainer}>
            {/* Outermost diffuse glow */}
            <Animated.View
              style={[
                styles.glowRing,
                {
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: 'rgba(224, 168, 64, 0.04)',
                  opacity: glowPulse,
                  transform: [{ scale: glowScale }],
                },
              ]}
            />
            {/* Mid glow */}
            <Animated.View
              style={[
                styles.glowRing,
                {
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: 'rgba(224, 168, 64, 0.08)',
                  opacity: glowPulse,
                  transform: [{ scale: glowScale }],
                },
              ]}
            />
            {/* Inner concentrated glow */}
            <Animated.View
              style={[
                styles.glowRing,
                {
                  width: 68,
                  height: 68,
                  borderRadius: 34,
                  backgroundColor: 'rgba(224, 168, 64, 0.15)',
                  opacity: glowPulse,
                },
              ]}
            />

            {/* Orbiting sparks */}
            <Spark delay={0} size={4} orbitRadius={52} />
            <Spark delay={300} size={3} orbitRadius={44} />
            <Spark delay={600} size={3} orbitRadius={60} />

            {/* Central icon */}
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
                <GameIcon name="moon" size={28} color={gold[300]} />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Title */}
            <Animated.View
              style={{
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              }}
            >
              <Text variant="h3" center style={styles.titleText}>
                Welcome Back
              </Text>
            </Animated.View>

            {/* Duration pill */}
            <Animated.View
              style={[
                styles.durationPill,
                { opacity: titleOpacity },
              ]}
            >
              <GameIcon name="time-outline" size={11} color={dark[300]} />
              <Text variant="caption" style={{ color: dark[300] }}>
                {formatDuration(secondsAway)} away
              </Text>
            </Animated.View>

            {/* Inspiration amount -- the hero moment */}
            <Animated.View
              style={[
                styles.amountContainer,
                {
                  opacity: amountOpacity,
                  transform: [{ scale: amountScale }],
                },
              ]}
            >
              <View style={styles.amountInner}>
                <InspirationIcon size={20} color={gold[300]} />
                <Text style={styles.amountText}>
                  +{formatNumber(displayInsp)}
                </Text>
              </View>
              <Animated.View style={[styles.amountGlow, { opacity: glowPulse }]} />
            </Animated.View>

            {/* Subtitle */}
            <Animated.View style={{ opacity: footerOpacity }}>
              {framing ? (
                <>
                  <Text variant="caption" style={{ color: gold[400], letterSpacing: 1 }} center>
                    {framing.speaker.toUpperCase()}
                  </Text>
                  <Text variant="bodySmall" color="secondary" center>
                    {framing.text}
                  </Text>
                  {wallLine && (
                    <Text variant="caption" color="muted" center>
                      {wallLine}
                    </Text>
                  )}
                </>
              ) : (
                <Text variant="caption" color="muted" center>
                  {wallLine ?? 'Your fighters held the line'}
                </Text>
              )}
            </Animated.View>
          </View>

          {/* Divider with gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(224, 168, 64, 0.2)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.divider}
          />

          {/* Collect button */}
          <Animated.View
            style={[
              styles.actions,
              {
                opacity: btnOpacity,
                transform: [{ translateY: btnTranslateY }],
              },
            ]}
          >
            <Pressable
              onPress={handleCollect}
              style={({ pressed }) => [
                styles.collectBtn,
                pressed && styles.collectBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Collect ${inspirationEarned} offline renown`}
            >
              <LinearGradient
                colors={[gold[400], gold[500], gold[600]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.collectGradient}
              >
                {/* Shimmer sweep */}
                <Animated.View
                  style={[
                    styles.shimmer,
                    { transform: [{ translateX: shimmerTranslateX }] },
                  ]}
                />
                <InspirationIcon size={14} color={dark[900]} />
                <Text variant="label" bold style={{ color: dark[900], letterSpacing: 1 }}>
                  COLLECT
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
    backgroundColor: 'rgba(2, 2, 6, 0.92)',
  },
  centerer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: dark[800],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(224, 168, 64, 0.15)',
    ...elevation[4],
    shadowColor: gold[700],
    shadowOpacity: 0.3,
    shadowRadius: 30,
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
    marginTop: spacing[7],
    height: 120,
  },
  glowRing: {
    position: 'absolute',
  },
  sparkOrbit: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  spark: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(224, 168, 64, 0.4)',
    shadowColor: gold[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  content: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[5],
    alignItems: 'center',
    gap: spacing[2],
  },
  titleText: {
    color: dark[100],
    letterSpacing: 0.5,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },

  // Inspiration amount
  amountContainer: {
    marginTop: spacing[2],
    marginBottom: spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  amountText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: gold[300],
    letterSpacing: 1,
  },
  amountGlow: {
    position: 'absolute',
    width: 200,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(224, 168, 64, 0.06)',
  },

  // Divider
  divider: {
    height: 1,
    marginHorizontal: spacing[5],
  },

  // Actions
  actions: {
    padding: spacing[4],
    paddingTop: spacing[4],
  },
  collectBtn: {
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  collectBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  collectGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    minHeight: 48,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    width: 60,
    height: '200%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    transform: [{ rotate: '15deg' }],
  },
})
