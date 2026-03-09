import React, { useRef, useCallback } from 'react'
import { View, StyleSheet, Pressable, Animated, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { useHaptics, useHoldPress } from '../hooks'
import { colors, spacing } from '../theme'

interface HarvestOrbColors {
  /** Accent for icon, label text, border, glow ring, and shadow */
  accent: string
  /** Glow ring background (often the 500 shade) */
  glow: string
}

interface HarvestOrbProps {
  /** Action fired on each tap / hold tick */
  onAction: () => void
  /** Ionicons icon name */
  icon: keyof typeof Ionicons.glyphMap
  /** Button label (e.g. "SLAY", "FORAGE") */
  label: string
  /** Color palette */
  palette: HarvestOrbColors
  style?: ViewStyle
}

export function HarvestOrb({ onAction, icon, label, palette, style }: HarvestOrbProps) {
  const haptics = useHaptics()
  const scaleAnim = useRef(new Animated.Value(1)).current
  const glowAnim = useRef(new Animated.Value(0.3)).current

  const animateTap = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 50, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.02, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
    ]).start()
    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 0.6, duration: 60, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.3, duration: 200, useNativeDriver: true }),
    ]).start()
  }, [scaleAnim, glowAnim])

  const animateHoldTick = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 40, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
    ]).start()
    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 0.45, duration: 40, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.3, duration: 120, useNativeDriver: true }),
    ]).start()
  }, [scaleAnim, glowAnim])

  const handleTap = useCallback(() => {
    onAction()
    haptics.light()
    animateTap()
  }, [onAction, haptics, animateTap])

  const handleHoldTick = useCallback(() => {
    onAction()
    haptics.light()
    animateHoldTick()
  }, [onAction, haptics, animateHoldTick])

  const { onPressIn, onPressOut } = useHoldPress(handleTap, handleHoldTick)

  return (
    <View style={[styles.buttonArea, style]}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.touchArea}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Animated.View style={[styles.glowRing, { opacity: glowAnim, backgroundColor: palette.glow }]} />
        <Animated.View
          style={[
            styles.orbButton,
            { borderColor: palette.glow, shadowColor: palette.glow, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={[colors.bg.surface2, colors.bg.surface1]}
            style={styles.gradient}
          >
            <Ionicons name={icon} size={32} color={palette.accent} />
            <Text variant="h2" center style={[styles.label, { color: palette.accent }]}>
              {label}
            </Text>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchArea: {
    padding: spacing[4],
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  orbButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[1],
  },
  label: {
    letterSpacing: 4,
  },
})
