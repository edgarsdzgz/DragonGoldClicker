import React, { useRef, useCallback } from 'react'
import { View, StyleSheet, Pressable, Animated, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import type { GameIconName } from '../art'
import { GameIcon } from './GameIcon'
import { Text } from './Text'
import { useHaptics } from '../hooks'
import { colors, spacing } from '../theme'

interface ActionOrbColors {
  accent: string
  glow: string
}

interface ActionOrbProps {
  onAction: () => void
  icon: GameIconName
  label: string
  palette: ActionOrbColors
  disabled?: boolean
  style?: ViewStyle
}

/**
 * Compact action orb -- 25% the size of HarvestOrb.
 * Used for Rally and Repair buttons on the Warfront tab.
 */
export function ActionOrb({ onAction, icon, label, palette, disabled, style }: ActionOrbProps) {
  const haptics = useHaptics()
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePress = useCallback(() => {
    if (disabled) return
    onAction()
    haptics.light()
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 50, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
    ]).start()
  }, [onAction, haptics, scaleAnim, disabled])

  const accentColor = disabled ? colors.disabled.textSubtle : palette.accent
  const glowColor = disabled ? colors.disabled.border : palette.glow

  return (
    <View style={[styles.container, style]}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={styles.touchArea}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
      >
        <Animated.View
          style={[
            styles.orb,
            { borderColor: glowColor, shadowColor: glowColor, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={[colors.bg.surface2, colors.bg.surface1]}
            style={styles.gradient}
          >
            <GameIcon name={icon} size={16} color={accentColor} />
            <Text variant="caption" center style={{ ...styles.label, color: accentColor }}>
              {label}
            </Text>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  touchArea: {
    padding: spacing[1],
    justifyContent: 'center',
    alignItems: 'center',
  },
  orb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 1,
  },
  label: {
    letterSpacing: 1,
    fontSize: 9,
    fontWeight: 'bold',
  },
})
