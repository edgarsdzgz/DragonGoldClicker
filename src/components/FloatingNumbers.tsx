import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import { StyleSheet, Animated, View } from 'react-native'
import { Text } from './Text'
import { useReduceMotion } from '../hooks/useReduceMotion'

/** At most this many numbers are alive at once; the oldest is recycled */
export const MAX_FLOATING_NUMBERS = 8

const LIFETIME_MS = 750
const RISE_DP = 46

export interface FloatingNumberOptions {
  /** Where it starts, in dp from the layer's top-left corner */
  x: number
  y: number
  text: string
  color: string
  /** Bigger and bolder (e.g. a bounty) */
  large?: boolean
}

export interface FloatingNumbersHandle {
  spawn: (opts: FloatingNumberOptions) => void
}

interface SlotHandle {
  show: (opts: FloatingNumberOptions) => void
}

/**
 * A layer of numbers that rise and fade from a point. Put it over any view and call
 * `spawn`. Pooled (8 slots, native-driver animation only), so rapid spawning stays cheap.
 * With Reduce Motion on, numbers fade in place without rising.
 */
export const FloatingNumbers = forwardRef<FloatingNumbersHandle>(function FloatingNumbers(_props, ref) {
  const slots = useRef<Array<SlotHandle | null>>([])
  const next = useRef(0)
  const reduceMotion = useReduceMotion()

  const spawn = useCallback((opts: FloatingNumberOptions) => {
    const index = next.current
    next.current = (index + 1) % MAX_FLOATING_NUMBERS
    slots.current[index]?.show(opts)
  }, [])

  useImperativeHandle(ref, () => ({ spawn }), [spawn])

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: MAX_FLOATING_NUMBERS }, (_, i) => (
        <Slot key={i} reduceMotion={reduceMotion} handleRef={(h) => { slots.current[i] = h }} />
      ))}
    </View>
  )
})

function Slot({ handleRef, reduceMotion }: { handleRef: (h: SlotHandle | null) => void; reduceMotion: boolean }) {
  const [item, setItem] = useState<FloatingNumberOptions | null>(null)
  const progress = useRef(new Animated.Value(1)).current
  const show = useCallback((opts: FloatingNumberOptions) => {
    progress.stopAnimation()
    progress.setValue(0)
    setItem(opts)
    Animated.timing(progress, { toValue: 1, duration: LIFETIME_MS, useNativeDriver: true }).start()
  }, [progress])

  React.useEffect(() => {
    handleRef({ show })
    return () => handleRef(null)
  }, [handleRef, show])

  if (!item) return null
  return (
    <Animated.View
      style={[
        styles.slot,
        {
          left: item.x,
          top: item.y,
          opacity: progress.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
          transform: [
            { translateY: reduceMotion ? 0 : progress.interpolate({ inputRange: [0, 1], outputRange: [0, -RISE_DP] }) },
          ],
        },
      ]}
    >
      <Text
        variant={item.large ? 'h3' : 'label'}
        style={StyleSheet.flatten([styles.text, { color: item.color }, item.large ? styles.large : undefined])}
      >
        {item.text}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  slot: {
    position: 'absolute',
    // Centre the text on the spawn point
    marginLeft: -20,
    minWidth: 40,
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  large: {
    fontSize: 22,
  },
})
