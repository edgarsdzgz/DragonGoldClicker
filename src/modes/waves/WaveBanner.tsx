import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet } from 'react-native'
import { Text } from '../../components/Text'
import { useReduceMotion } from '../../hooks/useReduceMotion'
import { colors, spacing, radius, gold } from '../../theme'

interface WaveBannerProps {
  /** E.g. "Wave cleared +0.50". Null hides the banner. */
  text: string | null
}

/** A banner across the battlefield. Slides in and fades; with Reduce Motion it only fades. */
export function WaveBanner({ text }: WaveBannerProps) {
  const reduceMotion = useReduceMotion()
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!text) {
      progress.setValue(0)
      return
    }
    // Not announced here: the kill's own announcement already says the wave was cleared
    Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(progress, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start()
  }, [text, progress])

  if (!text) return null
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.banner,
        {
          opacity: progress,
          transform: [{ translateY: reduceMotion ? 0 : progress.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
        },
      ]}
    >
      <Text variant="h3" center style={styles.text}>{text}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[5],
    borderRadius: radius.lg,
    backgroundColor: colors.bg.surface2,
    borderWidth: 1.5,
    borderColor: gold[400],
  },
  text: {
    color: gold[300],
  },
})
