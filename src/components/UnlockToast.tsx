import React, { useEffect, useRef, useCallback, useState } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { colors, spacing, radius, elevation } from '../theme'

// =============================================================================
// TOAST CONTROLLER (imperative show via ref)
// =============================================================================

export interface UnlockToastHandle {
  show: (message: string) => void
}

interface Props {
  toastRef: React.MutableRefObject<UnlockToastHandle | null>
}

const TOAST_DURATION = 2200
const FADE_MS = 200

export function UnlockToast({ toastRef }: Props) {
  const opacity = useRef(new Animated.Value(0)).current
  const [message, setMessage] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((msg: string) => {
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current)

    setMessage(msg)
    opacity.setValue(0)

    Animated.timing(opacity, {
      toValue: 1,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start()

    timerRef.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start()
    }, TOAST_DURATION)
  }, [opacity])

  // Expose imperative handle
  useEffect(() => {
    toastRef.current = { show }
    return () => { toastRef.current = null }
  }, [toastRef, show])

  if (!message) return null

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <View style={styles.pill}>
        <Ionicons name="lock-closed" size={14} color={colors.text.secondary} />
        <Text variant="bodySmall" style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 72,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.bg.surface2,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...elevation[2],
  },
  text: {
    color: colors.text.secondary,
  },
})
