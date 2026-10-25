import React, { useRef, useCallback } from 'react'
import { View, StyleSheet, Pressable, Animated, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { useHaptics, useHoldPress } from '../hooks'
import { useCoachTarget } from '../hooks/useCoachTarget'
import { colors, spacing } from '../theme'

/** The preset for a size; a diameter rescales the large preset proportionally */
function sizeFor(size: 'lg' | 'md', diameter?: number) {
  const base = SIZES[size]
  if (size !== 'lg' || !diameter) return base
  const k = diameter / base.orb
  return {
    ...base,
    orb: diameter,
    glow: Math.round(diameter * (base.glow / base.orb)),
    icon: Math.round(base.icon * k),
    fontSize: Math.round(base.fontSize * k),
    letterSpacing: base.letterSpacing * k,
    padding: spacing[2],
    shadowRadius: Math.round(base.shadowRadius * k),
  }
}

interface HarvestOrbColors {
  /** Accent for icon, label text, border, glow ring, and shadow */
  accent: string
  /** Glow ring background (often the 500 shade) */
  glow: string
}

/** Size presets: lg = primary CTA (200px), md = secondary action (100px) */
const SIZES = {
  lg: { orb: 200, glow: 260, icon: 32, fontSize: 22, letterSpacing: 4, border: 2, shadowRadius: 24, padding: spacing[4], gap: spacing[1] },
  md: { orb: 100, glow: 130, icon: 20, fontSize: 14, letterSpacing: 2, border: 1.5, shadowRadius: 12, padding: spacing[2], gap: 2 },
} as const

interface HarvestOrbProps {
  /** Action fired on each tap / hold tick */
  onAction: () => void
  /** Ionicons icon name */
  icon: keyof typeof Ionicons.glyphMap
  /** Button label (e.g. "SLAY", "FORAGE") */
  label: string
  /** Color palette */
  palette: HarvestOrbColors
  /** lg = primary CTA, md = secondary action */
  size?: 'lg' | 'md'
  /** Disabled state -- dims visuals and blocks action */
  disabled?: boolean
  style?: ViewStyle
  /** lg only: draw the circle at this diameter (dp) instead of 200 */
  diameter?: number
  /** Opt into the guided tutorial under this target id */
  coachId?: string
}

export function HarvestOrb({ onAction, icon, label, palette, size = 'lg', disabled, style, coachId, diameter }: HarvestOrbProps) {
  const coach = useCoachTarget(coachId)
  const haptics = useHaptics()
  const scaleAnim = useRef(new Animated.Value(1)).current
  const glowAnim = useRef(new Animated.Value(0.3)).current
  const dim = sizeFor(size, diameter)

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
    if (disabled) return
    onAction()
    haptics.light()
    animateTap()
  }, [onAction, haptics, animateTap, disabled])

  const handleHoldTick = useCallback(() => {
    if (disabled) return
    onAction()
    haptics.light()
    animateHoldTick()
  }, [onAction, haptics, animateHoldTick, disabled])

  const { onPressIn, onPressOut } = useHoldPress(handleTap, handleHoldTick)

  const accentColor = disabled ? colors.disabled.textSubtle : palette.accent
  const glowColor = disabled ? colors.disabled.border : palette.glow

  return (
    <View ref={coach.ref} onLayout={coach.onLayout} style={[styles.buttonArea, style]}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.touchArea, { padding: dim.padding }]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
      >
        <Animated.View
          style={[
            styles.glowRing,
            {
              width: dim.glow,
              height: dim.glow,
              borderRadius: dim.glow / 2,
              opacity: disabled ? 0.1 : glowAnim,
              backgroundColor: glowColor,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orbButton,
            {
              width: dim.orb,
              height: dim.orb,
              borderRadius: dim.orb / 2,
              borderWidth: dim.border,
              borderColor: glowColor,
              shadowColor: glowColor,
              shadowRadius: dim.shadowRadius,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[colors.bg.surface2, colors.bg.surface1]}
            style={[styles.gradient, { gap: dim.gap }]}
          >
            <Ionicons name={icon} size={dim.icon} color={accentColor} />
            <Text
              variant="h2"
              center
              style={{
                color: accentColor,
                fontSize: dim.fontSize,
                fontWeight: 'bold',
                letterSpacing: dim.letterSpacing,
              }}
            >
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchArea: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
  },
  orbButton: {
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    elevation: 10,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
