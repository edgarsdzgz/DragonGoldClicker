import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { Text } from './Text'
import { useReduceMotion } from '../hooks/useReduceMotion'
import { gold } from '../theme'

interface TapToStartProps {
  /** The prompt; defaults to "Tap to start" */
  label?: string
  color?: string
  style?: StyleProp<ViewStyle>
}

const PULSE_MS = 900
const DIM = 0.35

/** A title screen's prompt, pulsing gently (still with Reduce Motion). Decorative: the screen is the button. */
export function TapToStart({ label = 'Tap to start', color = gold[300], style }: TapToStartProps) {
  const reduceMotion = useReduceMotion()
  const opacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: DIM, duration: PULSE_MS, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: PULSE_MS, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [reduceMotion, opacity])

  return (
    <Animated.View style={[styles.root, { opacity }, style]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Text variant="h3" center style={{ color, letterSpacing: 2 }}>
        {label.toUpperCase()}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
})
