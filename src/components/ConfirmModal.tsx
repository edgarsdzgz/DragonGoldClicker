import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { REJECT_PHRASES } from './Button'
import { colors, spacing, radius, elevation, gold, dark } from '../theme'
import { useHaptics } from '../hooks'
import { useSfx } from '../hooks/useSfx'
import { useCoachTarget } from '../hooks/useCoachTarget'
import { CoachMark } from './CoachMark'
import { SFX } from '../data/sfx'

interface ConfirmModalProps {
  visible: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  /** Visually dims the confirm button and blocks confirmation */
  confirmDisabled?: boolean
  /** Override the default gold accent with a building/context color */
  accentColor?: string
  icon?: keyof typeof Ionicons.glyphMap
  /** Opt the confirm button into the guided tutorial under this target id */
  confirmCoachId?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  confirmDisabled = false,
  accentColor: accentColorProp,
  icon = 'warning',
  confirmCoachId,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const haptics = useHaptics()
  const confirmCoach = useCoachTarget(confirmCoachId)
  const backdropOpacity = useRef(new Animated.Value(0)).current
  const cardScale = useRef(new Animated.Value(0.85)).current
  const cardOpacity = useRef(new Animated.Value(0)).current
  const iconPulse = useRef(new Animated.Value(0.6)).current

  // Floating rejection text animation
  const rejectOpacity = useRef(new Animated.Value(0)).current
  const rejectTranslateY = useRef(new Animated.Value(0)).current
  const [rejectText, setRejectText] = useState('')
  const phraseIndex = useRef(0)

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()

      Animated.loop(
        Animated.sequence([
          Animated.timing(iconPulse, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(iconPulse, {
            toValue: 0.6,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start()
    } else {
      backdropOpacity.setValue(0)
      cardScale.setValue(0.85)
      cardOpacity.setValue(0)
      iconPulse.setValue(0.6)
      rejectOpacity.setValue(0)
      rejectTranslateY.setValue(0)
    }
  }, [visible, backdropOpacity, cardScale, cardOpacity, iconPulse, rejectOpacity, rejectTranslateY])

  const showRejectFloat = useCallback(() => {
    playNoGold()
    setRejectText(REJECT_PHRASES[phraseIndex.current % REJECT_PHRASES.length])
    phraseIndex.current += 1

    rejectOpacity.setValue(1)
    rejectTranslateY.setValue(0)
    Animated.parallel([
      Animated.timing(rejectTranslateY, {
        toValue: -28,
        duration: 1400,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(rejectOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start()
  }, [rejectOpacity, rejectTranslateY])

  const handleConfirm = () => {
    if (confirmDisabled) {
      haptics.heavy()
      showRejectFloat()
      return
    }
    if (destructive) haptics.heavy()
    else haptics.light()
    onConfirm()
  }

  const playCancel = useSfx(SFX.CANCEL)
  const playNoGold = useSfx(SFX.NO_GOLD)

  const handleCancel = () => {
    haptics.light()
    playCancel()
    onCancel()
  }

  const accentColor = destructive ? colors.status.error : (accentColorProp ?? gold[400])

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />
      </Animated.View>

      {/* Centered card */}
      <View style={styles.centerer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          {/* Top accent bar */}
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

          {/* Icon emblem */}
          <View style={styles.iconContainer}>
            <Animated.View
              style={[
                styles.iconGlowOuter,
                {
                  opacity: iconPulse,
                  backgroundColor: accentColor + '14',
                },
              ]}
            />
            <Animated.View
              style={[
                styles.iconGlowInner,
                {
                  opacity: iconPulse,
                  backgroundColor: accentColor + '2E',
                },
              ]}
            />
            <View
              style={[
                styles.iconCircle,
                {
                  borderColor: accentColor + '80',
                  shadowColor: accentColor,
                },
              ]}
            >
              <Ionicons name={icon} size={26} color={accentColor} />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text variant="h3" center>
              {title}
            </Text>
            <Text variant="bodySmall" color="secondary" center>
              {message}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              onPress={handleCancel}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.cancelPressed,
              ]}
            >
              <Text variant="label" color="secondary">
                {cancelLabel}
              </Text>
            </Pressable>

            <Pressable
              ref={confirmCoach.ref}
              onLayout={confirmCoach.onLayout}
              onPress={handleConfirm}
              style={({ pressed }) => [
                styles.button,
                confirmDisabled
                  ? styles.disabledButton
                  : destructive
                    ? styles.destructiveButton
                    : { backgroundColor: accentColor },
                !confirmDisabled && pressed && (destructive
                  ? styles.destructivePressed
                  : { opacity: 0.85 }),
              ]}
            >
              <Text
                variant="label"
                bold
                style={{
                  color: confirmDisabled
                    ? colors.text.muted
                    : destructive ? '#fff' : dark[900],
                }}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>

          {/*
            Reject float -- rendered as LAST child of the card so it paints
            on top of everything (Android ignores zIndex across siblings,
            but always paints later children over earlier ones).
            Positioned absolutely, anchored just above the actions row.
          */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.rejectFloat,
              {
                opacity: rejectOpacity,
                transform: [{ translateY: rejectTranslateY }],
              },
            ]}
          >
            <Text variant="caption" style={styles.rejectText}>
              {rejectText}
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
      {/* Guided-tutorial overlay for targets inside this modal */}
      <CoachMark inModal />
    </Modal>
  )
}

const ACTIONS_HEIGHT = 44 + spacing[4] * 2 // minHeight + padding top/bottom

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
    maxWidth: 340,
    backgroundColor: colors.bg.surface1,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: dark[700],
    ...elevation[4],
  },
  accentBar: {
    height: 3,
    width: '100%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[6],
    height: 100,
  },
  iconGlowOuter: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  iconGlowInner: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.bg.surface1,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[5],
    gap: spacing[2],
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
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: colors.bg.surface2,
    borderWidth: 1,
    borderColor: dark[600],
  },
  cancelPressed: {
    backgroundColor: colors.bg.surface3,
  },
  destructiveButton: {
    backgroundColor: colors.status.error,
  },
  destructivePressed: {
    backgroundColor: '#e05555',
  },
  primaryButton: {
    backgroundColor: gold[500],
  },
  primaryPressed: {
    backgroundColor: gold[600],
  },
  disabledButton: {
    backgroundColor: dark[600],
    borderWidth: 1,
    borderColor: dark[500],
  },
  // Absolutely positioned within the card, last child = always on top.
  // Anchored from the bottom so it hovers above the confirm button area.
  rejectFloat: {
    position: 'absolute',
    bottom: ACTIONS_HEIGHT,
    right: spacing[4],
    left: '50%',
  },
  rejectText: {
    color: gold[300],
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
})
