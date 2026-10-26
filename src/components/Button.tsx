import React, { useRef, useState, useCallback } from 'react'
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  PressableStateCallbackType,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, touchTarget, typography, gold, dark } from '../theme'
import { useHaptics, useHoldPress } from '../hooks'
import { HOLD_REPEAT_MS } from '../hooks/useActionPress'
import { useSfx } from '../hooks/useSfx'
import { SFX } from '../data/sfx'

// =============================================================================
// REJECT PHRASE SETS -- context-aware, exported for ConfirmModal + call sites
// =============================================================================

export const REJECT_GOLD = [
  'Not enough gold...',
  'My hoard needs to grow first',
  'The coffers are empty',
  'Gold runs thin',
  'We need more coin',
  'The treasury demands patience',
  'Our vaults echo with emptiness',
  'The dragon hoards what little remains',
  'Riches beyond our reach... for now',
]

export const REJECT_MAXED = [
  'Already at full strength',
  'Nothing more to be done here',
  'Peak capacity reached',
  'Fully maxed out',
]

export const REJECT_NO_POP = [
  'No idle villagers remain',
  'The village needs more people',
  'All villagers are spoken for',
  'Send expeditions to find survivors',
]

/** @deprecated Use REJECT_GOLD instead -- kept for ConfirmModal compat */
export const REJECT_PHRASES = REJECT_GOLD

// =============================================================================
// TYPES
// =============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  /** Custom icon element -- takes precedence over icon string */
  iconElement?: React.ReactNode
  iconSize?: number
  /** Overrides the primary variant's background color */
  accentColor?: string
  /**
   * Enable hold-to-repeat at the shared hold speed (HOLD_REPEAT_MS). Not for buttons that spend:
   * owner ruling (2026-10-26), one tap is one purchase.
   */
  holdToRepeat?: boolean
  /** Phrases to cycle through when tapped while disabled.
   *  Pass an array to enable the reject float. Omit to disable. */
  rejectPhrases?: string[]
  accessibilityLabel?: string
  accessibilityHint?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconElement,
  iconSize,
  accentColor,
  holdToRepeat = false,
  rejectPhrases,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const haptics = useHaptics()
  const playNoGold = useSfx(SFX.NO_GOLD)
  const hasReject = rejectPhrases != null && rejectPhrases.length > 0

  // ---------------------------------------------------------------------------
  // Reject float animation state
  // ---------------------------------------------------------------------------
  const rejectOpacity = useRef(new Animated.Value(0)).current
  const rejectTranslateY = useRef(new Animated.Value(0)).current
  const [rejectText, setRejectText] = useState('')
  const phraseIndex = useRef(0)

  const showRejectFloat = useCallback(() => {
    if (!rejectPhrases || rejectPhrases.length === 0) return
    playNoGold()
    setRejectText(rejectPhrases[phraseIndex.current % rejectPhrases.length])
    phraseIndex.current += 1

    rejectOpacity.setValue(1)
    rejectTranslateY.setValue(0)
    Animated.parallel([
      Animated.timing(rejectTranslateY, {
        toValue: -18,
        duration: 1400,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(rejectOpacity, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ]).start()
  }, [rejectPhrases, rejectOpacity, rejectTranslateY])

  // ---------------------------------------------------------------------------
  // Press handler
  // ---------------------------------------------------------------------------
  const handlePress = () => {
    if (disabled || loading) {
      if (hasReject && disabled) {
        haptics.heavy()
        showRejectFloat()
      }
      return
    }
    haptics.light()
    onPress()
  }

  // ---------------------------------------------------------------------------
  // Hold-to-repeat (when enabled and not disabled)
  // ---------------------------------------------------------------------------
  const holdHandleTap = useCallback(() => {
    if (disabled || loading) {
      if (hasReject && disabled) {
        haptics.heavy()
        showRejectFloat()
      }
      return
    }
    haptics.light()
    onPress()
  }, [disabled, loading, hasReject, haptics, showRejectFloat, onPress])

  const holdHandleTick = useCallback(() => {
    if (disabled || loading) return
    haptics.light()
    onPress()
  }, [disabled, loading, haptics, onPress])

  const { onPressIn, onPressOut } = useHoldPress(holdHandleTap, holdHandleTick, { delayMs: HOLD_REPEAT_MS, intervalMs: HOLD_REPEAT_MS })

  // ---------------------------------------------------------------------------
  // Sizing
  // ---------------------------------------------------------------------------
  const isXs = size === 'xs'
  const defaultIconSize = isXs ? 10 : size === 'sm' ? 14 : 16
  const resolvedIconSize = iconSize ?? defaultIconSize

  // ---------------------------------------------------------------------------
  // Container style
  // ---------------------------------------------------------------------------
  const getContainerStyle = ({
    pressed,
  }: PressableStateCallbackType): ViewStyle[] => {
    const base: ViewStyle[] = [styles.base, styles[`size_${size}`]]

    if (fullWidth) {
      base.push(styles.fullWidth)
    }

    const isDisabled = disabled || loading

    switch (variant) {
      case 'primary':
        if (isDisabled) {
          const accent = accentColor || gold[500]
          base.push({ backgroundColor: `${accent}30` })
        } else if (accentColor) {
          base.push({ backgroundColor: accentColor })
          if (pressed) base.push({ backgroundColor: accentColor, opacity: 0.85 })
        } else {
          base.push(styles.primaryContainer)
          if (pressed) base.push(styles.primaryPressed)
        }
        break
      case 'secondary':
        base.push(styles.secondaryContainer)
        if (isDisabled) {
          base.push({ borderColor: colors.disabled.border })
        } else {
          if (accentColor) base.push({ borderColor: accentColor })
          if (pressed) base.push(styles.secondaryPressed)
        }
        break
      case 'ghost':
        base.push(styles.ghostContainer)
        if (!isDisabled && pressed) base.push(styles.ghostPressed)
        break
    }

    if (hasReject) {
      base.push({ overflow: 'visible' as const })
    }

    return base
  }

  // ---------------------------------------------------------------------------
  // Text color -- WCAG AA compliant for disabled states
  // ---------------------------------------------------------------------------
  const getTextColor = (): string => {
    if (disabled) {
      return variant === 'primary'
        ? colors.disabled.text
        : colors.disabled.textSubtle
    }
    switch (variant) {
      case 'primary':
        return '#ffffff'
      case 'secondary':
        return accentColor ?? gold[400]
      case 'ghost':
        return accentColor ?? gold[400]
    }
  }

  const getTextStyle = (): TextStyle[] => {
    const base: TextStyle[] = [styles.text, styles[`text_${size}`]]
    base.push({ color: getTextColor() })
    return base
  }

  const textColor = getTextColor()

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Pressable
      {...(holdToRepeat
        ? { onPressIn, onPressOut }
        : { onPress: handlePress, disabled: hasReject ? false : (disabled || loading) }
      )}
      style={getContainerStyle}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || children}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {hasReject && rejectText !== '' && (
        <Animated.View
          pointerEvents="none"
          style={[
            fullWidth ? styles.rejectFloatCenter : styles.rejectFloatRight,
            {
              opacity: rejectOpacity,
              transform: [{ translateY: rejectTranslateY }],
            },
          ]}
        >
          <Text
            style={[styles.rejectText, !fullWidth && styles.rejectTextRight]}
            numberOfLines={1}
          >
            {rejectText}
          </Text>
        </Animated.View>
      )}

      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#ffffff' : gold[500]}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {iconElement ?? (icon && (
            <Ionicons name={icon} size={resolvedIconSize} color={textColor} />
          ))}
          <Text style={getTextStyle()}>{children}</Text>
        </View>
      )}
    </Pressable>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    minHeight: touchTarget.comfortable,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  size_xs: {
    minHeight: 0,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.sm,
    minWidth: 56,
  },
  size_sm: {
    minHeight: touchTarget.minimum,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  size_md: {
    minHeight: touchTarget.comfortable,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  size_lg: {
    minHeight: touchTarget.large,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
  },
  fullWidth: {
    width: '100%',
  },
  primaryContainer: {
    backgroundColor: gold[500],
  },
  primaryPressed: {
    backgroundColor: gold[600],
  },
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: gold[500],
  },
  secondaryPressed: {
    backgroundColor: '#d4922c1a',
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostPressed: {
    backgroundColor: '#ffffff0d',
  },
  text: {
    fontWeight: 'bold',
  },
  text_xs: {
    fontSize: 12,
    lineHeight: 16,
  },
  text_sm: {
    fontSize: 14,
    lineHeight: 20,
  },
  text_md: {
    fontSize: typography.button.fontSize,
    lineHeight: typography.button.lineHeight,
  },
  text_lg: {
    fontSize: 18,
    lineHeight: 24,
  },
  // Centered float for fullWidth buttons (upgrade buttons at bottom of interiors).
  // Extends equally both sides; text centered.
  rejectFloatCenter: {
    position: 'absolute',
    top: -34,
    left: -40,
    right: -40,
    alignItems: 'center',
    zIndex: 10,
  },
  // Right-anchored float for inline buttons (ActionRow right slot).
  // Pinned to button's right edge, extends leftward only -- never clips the
  // right screen edge since the button has at least 28px of parent padding.
  rejectFloatRight: {
    position: 'absolute',
    top: -34,
    right: 0,
    left: -200,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  rejectText: {
    color: gold[300],
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  rejectTextRight: {
    textAlign: 'right',
  },
})

export default Button
