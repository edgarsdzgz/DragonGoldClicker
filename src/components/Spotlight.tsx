import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, ViewStyle } from 'react-native'
import { useGame } from '../context/GameContext'
import { useReduceMotion } from '../hooks/useReduceMotion'
import { isSpotlightActive, spotlightKey } from '../types/objectives'
import type { SpotlightTarget } from '../types/story'
import { gold, radius } from '../theme'

interface SpotlightProps {
  /** Show the pulsing ring */
  active: boolean
  /** Called on the wrapped control's first press (the press still reaches the control) */
  onFirstPress?: () => void
  children: React.ReactNode
  style?: ViewStyle
}

/** Wraps any control in a pulsing ring while `active`. Lighter than a coach mark: nothing is dimmed or blocked. */
export function Spotlight({ active, onFirstPress, children, style }: SpotlightProps) {
  const reduceMotion = useReduceMotion()
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!active || reduceMotion) {
      pulse.setValue(0)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [active, reduceMotion, pulse])

  return (
    <View style={style} onTouchStart={active ? onFirstPress : undefined}>
      {children}
      {active && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            { opacity: reduceMotion ? 1 : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
          ]}
        />
      )}
    </View>
  )
}

/** A Spotlight driven by the story: shows for beats that point at this control, clears on first press. */
export function StorySpotlight({ target, children, style }: { target: SpotlightTarget; children: React.ReactNode; style?: ViewStyle }) {
  const { state, completeTutorialStep } = useGame()
  return (
    <Spotlight
      active={isSpotlightActive(state, target)}
      onFirstPress={() => completeTutorialStep(spotlightKey(target))}
      style={style}
    >
      {children}
    </Spotlight>
  )
}

const styles = StyleSheet.create({
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2.5,
    borderColor: gold[400],
    borderRadius: radius.full,
  },
})
