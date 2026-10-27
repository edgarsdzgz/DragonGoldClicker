import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Modal,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native'
import { GameIcon } from './GameIcon'
import { ModalEmblem } from './ModalEmblem'
import { ModalButton } from './ModalButton'
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

  // Content stagger
  const titleOpacity = useRef(new Animated.Value(0)).current
  const titleTranslateY = useRef(new Animated.Value(12)).current
  const amountOpacity = useRef(new Animated.Value(0)).current
  const amountScale = useRef(new Animated.Value(0.8)).current
  const footerOpacity = useRef(new Animated.Value(0)).current
  const btnOpacity = useRef(new Animated.Value(0)).current
  const btnTranslateY = useRef(new Animated.Value(10)).current


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

      // The emblem's rings breathe
      Animated.loop(
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
      titleOpacity.setValue(0)
      titleTranslateY.setValue(12)
      amountOpacity.setValue(0)
      amountScale.setValue(0.8)
      footerOpacity.setValue(0)
      btnOpacity.setValue(0)
      btnTranslateY.setValue(10)
      setDisplayInsp(0)
      if (countingRef.current) clearInterval(countingRef.current)
    }
  }, [
    visible, inspirationEarned,
    backdropOpacity, cardTranslateY, cardOpacity,
    iconScale, iconOpacity, glowPulse,
    titleOpacity, titleTranslateY,
    amountOpacity, amountScale,
    footerOpacity, btnOpacity, btnTranslateY,
  ])

  const handleCollect = () => {
    haptics.heavy()
    onCollect()
  }

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
          <ModalEmblem
            accent={gold[400]}
            icon="moon"
            pulse={glowPulse}
            iconStyle={{ opacity: iconOpacity, transform: [{ scale: iconScale }] }}
          />

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

          <View style={styles.divider} />

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
            <ModalButton
              label="Collect"
              accent={gold[400]}
              iconElement={<InspirationIcon size={14} color={dark[900]} />}
              onPress={handleCollect}
              accessibilityLabel={`Collect ${inspirationEarned} offline renown`}
            />
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 2, 6, 0.85)',
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
    backgroundColor: colors.bg.surface1,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: dark[700],
    ...elevation[4],
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
