import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, Pressable, ScrollView, StyleSheet, Animated, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { formatNumber } from '../types/game'
import { useSfx } from '../hooks/useSfx'
import { SFX } from '../data/sfx'
import { colors, spacing, radius, dark, animation } from '../theme'

const SCREEN_HEIGHT = Dimensions.get('window').height

export interface ResourceItem {
  icon: keyof typeof Ionicons.glyphMap
  /** Custom icon element -- takes precedence over icon string */
  iconElement?: React.ReactNode
  value: number
  color: string
  label?: string
}

interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: keyof typeof Ionicons.glyphMap
  iconColor?: string
  /** Contextual resources relevant to this building */
  resources?: ResourceItem[]
  children: React.ReactNode
  /** Height as percentage of screen (default 85) */
  heightPercent?: number
}

export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  iconColor,
  resources,
  children,
  heightPercent = 85,
}: BottomSheetProps) {
  const playSlideUp = useSfx(SFX.SLIDE_UP)
  const playSlideDown = useSfx(SFX.SLIDE_DOWN)
  const slideAnim = useRef(new Animated.Value(0)).current
  const [mounted, setMounted] = useState(false)

  const handleClose = useCallback(() => {
    playSlideDown()
    onClose()
  }, [playSlideDown, onClose])
  const sheetHeight = (SCREEN_HEIGHT * heightPercent) / 100

  useEffect(() => {
    if (visible) {
      setMounted(true)
      playSlideUp()
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: animation.duration.modal,
        useNativeDriver: true,
      }).start()
    } else if (mounted) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: animation.duration.modal,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false)
      })
    }
  }, [visible])

  if (!mounted) return null

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetHeight, 0],
  })

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
        />
      </Animated.View>

      {/* Sheet */}
      <View style={styles.positioner} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.container,
            { height: sheetHeight, transform: [{ translateY }] },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleBar}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            {icon && (
              <View style={[styles.iconBox, iconColor ? { backgroundColor: `${iconColor}15` } : undefined]}>
                <Ionicons name={icon} size={22} color={iconColor ?? colors.text.secondary} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text variant="h3">{title}</Text>
              {subtitle && (
                <Text variant="caption" color="secondary">{subtitle}</Text>
              )}
            </View>
            <Pressable
              onPress={handleClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={20} color={colors.text.secondary} />
            </Pressable>
          </View>

          {/* Contextual resource strip */}
          {resources && resources.length > 0 && (
            <View style={styles.resourceStrip}>
              {resources.map((r, i) => (
                <View key={i} style={styles.resourceChip}>
                  {r.iconElement ?? <Ionicons name={r.icon} size={12} color={r.color} />}
                  <Text variant="caption" bold style={{ color: r.color }}>
                    {formatNumber(r.value)}
                  </Text>
                  {r.label && (
                    <Text variant="caption" color="muted" style={styles.resourceLabel}>
                      {r.label}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          {/* Body */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 5, 10, 0.7)',
  },
  positioner: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.bg.surface1,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderBottomWidth: 0,
    paddingBottom: spacing[4],
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: dark[500],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg.surface3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
  },
  resourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  resourceLabel: {
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginHorizontal: spacing[4],
  },
  body: {
    padding: spacing[4],
    paddingTop: spacing[3],
  },
})