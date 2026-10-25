import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react'
import { useIsFocused } from '@react-navigation/native'
import { View, Animated, StyleSheet, Easing } from 'react-native'
import { InspirationIcon } from '../components/InspirationIcon'
import { useReduceMotion } from '../hooks/useReduceMotion'

/**
 * Kill coins: a coin leaves the monster and flies to the top bar's inspiration figure, which
 * pulses when it arrives. The figure registers itself with `useCoinTarget`; the battlefield
 * calls `fly`. With Reduce Motion nothing moves: the coin and the pulse just fade.
 */

const FLIGHT_MS = 480
const MAX_COINS = 4
const COIN = 20

interface Point {
  x: number
  y: number
}

interface CoinFlightContextType {
  /** Fly a coin from a point in window coordinates to the registered target */
  fly: (from: Point) => void
  targetRef: React.RefObject<View | null>
  /** 0 -> 1 -> 0 each time a coin lands; the target maps it to its pulse */
  pulse: Animated.Value
}

const CoinFlightContext = createContext<CoinFlightContextType | null>(null)

export function CoinFlightProvider({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReduceMotion()
  const targetRef = useRef<View>(null)
  const layerRef = useRef<View>(null)
  const origin = useRef<Point>({ x: 0, y: 0 })
  const pulse = useRef(new Animated.Value(0)).current

  // A small pool of coins; the oldest is reused
  const coins = useRef(Array.from({ length: MAX_COINS }, () => ({
    progress: new Animated.Value(0),
    fromX: new Animated.Value(0),
    fromY: new Animated.Value(0),
    dx: new Animated.Value(0),
    dy: new Animated.Value(0),
  }))).current
  const next = useRef(0)

  const land = useCallback(() => {
    pulse.setValue(0)
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 110, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start()
  }, [pulse])

  const fly = useCallback((from: Point) => {
    const target = targetRef.current
    if (!target) return
    layerRef.current?.measureInWindow((ox, oy) => {
      origin.current = { x: ox, y: oy }
      target.measureInWindow((tx, ty, tw, th) => {
        if (tw <= 0 || th <= 0) return
        const slot = coins[next.current]
        next.current = (next.current + 1) % MAX_COINS
        const to = { x: tx + tw / 2, y: ty + th / 2 }
        // The coin starts at the monster, or (Reduce Motion) already at the figure
        const start = reduceMotion ? to : from
        slot.fromX.setValue(start.x - ox - COIN / 2)
        slot.fromY.setValue(start.y - oy - COIN / 2)
        slot.dx.setValue(to.x - start.x)
        slot.dy.setValue(to.y - start.y)
        slot.progress.stopAnimation()
        slot.progress.setValue(0)
        Animated.timing(slot.progress, {
          toValue: 1,
          duration: reduceMotion ? 300 : FLIGHT_MS,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) land()
        })
      })
    })
  }, [coins, land, reduceMotion])

  const value = useMemo(() => ({ fly, targetRef, pulse }), [fly, pulse])

  return (
    <CoinFlightContext.Provider value={value}>
      {children}
      <View ref={layerRef} collapsable={false} style={StyleSheet.absoluteFill} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {coins.map((c, i) => (
          <Animated.View
            key={i}
            style={[
              styles.coin,
              {
                opacity: reduceMotion
                  ? c.progress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] })
                  : c.progress.interpolate({ inputRange: [0, 0.05, 0.9, 1], outputRange: [0, 1, 1, 0] }),
                transform: [
                  { translateX: Animated.add(c.fromX, reduceMotion ? 0 : Animated.multiply(c.progress, c.dx)) },
                  { translateY: Animated.add(c.fromY, reduceMotion ? 0 : Animated.multiply(c.progress, c.dy)) },
                  { scale: c.progress.interpolate({ inputRange: [0, 1], outputRange: [1.1, 0.7] }) },
                ],
              },
            ]}
          >
            <InspirationIcon size={COIN} />
          </Animated.View>
        ))}
      </View>
    </CoinFlightContext.Provider>
  )
}

export function useCoinFlight() {
  const ctx = useContext(CoinFlightContext)
  if (!ctx) throw new Error('useCoinFlight must be used within CoinFlightProvider')
  return ctx
}

/** For the figure coins fly to: attach `ref` to it and apply `style` for the landing pulse. */
export function useCoinTarget() {
  const { targetRef, pulse } = useCoinFlight()
  const reduceMotion = useReduceMotion()
  // Every tab has its own top bar; only the one on screen becomes the target
  const focused = useIsFocused()
  const ref = useCallback((node: View | null) => {
    if (node && focused) targetRef.current = node
  }, [focused, targetRef])
  const style = {
    opacity: reduceMotion ? pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }) : 1,
    transform: reduceMotion ? [] : [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }],
  }
  return { ref, style }
}

const styles = StyleSheet.create({
  coin: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: COIN,
    height: COIN,
  },
})
