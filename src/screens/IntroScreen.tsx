import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AccessibilityInfo, Animated, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { INTRO, INTRO_FADE_MS, INTRO_SEEN_KEY, SHORT_LAST_HOLD_MS, STILL_HOLD_MS } from '../art'
import { SplashSequence } from '../components'

interface IntroScreenProps {
  /** Mount the game now: it sits under the cover while the cover fades */
  onReveal: () => void
  /** The cover is gone; unmount the intro */
  onFinished: () => void
}

interface Setup {
  /** The first launch plays everything; later launches play the short versions */
  full: boolean
  /** Reduce Motion: each splash shows only its finished frame */
  still: boolean
}

/**
 * The launch intro: RAXDEG STUDIOS, a fade through the dark, Draconia Chronicles, then the game.
 * The game mounts only once the splashes are over, so its own modals (time away, story) never
 * open on top of them.
 */
export function IntroScreen({ onReveal, onFinished }: IntroScreenProps) {
  const [setup, setSetup] = useState<Setup | null>(null)
  const [index, setIndex] = useState(0)
  const content = useRef(new Animated.Value(0)).current
  const cover = useRef(new Animated.Value(1)).current
  const callbacks = useRef({ onReveal, onFinished })
  callbacks.current = { onReveal, onFinished }

  useEffect(() => {
    let live = true
    Promise.all([
      AsyncStorage.getItem(INTRO_SEEN_KEY).catch(() => null),
      AccessibilityInfo.isReduceMotionEnabled().catch(() => false),
    ]).then(([seen, still]) => {
      if (!live) return
      const full = seen !== '1'
      setSetup({ full, still })
      if (full) AsyncStorage.setItem(INTRO_SEEN_KEY, '1').catch(() => {})
    })
    return () => {
      live = false
    }
  }, [])

  // Each splash fades in from the dark
  useEffect(() => {
    if (!setup || index >= INTRO.length) return
    content.setValue(0)
    Animated.timing(content, { toValue: 1, duration: INTRO_FADE_MS, useNativeDriver: true }).start()
  }, [setup, index, content])

  // After the last splash, the game mounts under the cover and the cover fades away
  useEffect(() => {
    if (index < INTRO.length) return
    callbacks.current.onReveal()
    Animated.timing(cover, { toValue: 0, duration: INTRO_FADE_MS, useNativeDriver: true }).start(() =>
      callbacks.current.onFinished(),
    )
  }, [index, cover])

  const next = useCallback(() => {
    Animated.timing(content, { toValue: 0, duration: INTRO_FADE_MS, useNativeDriver: true }).start(() =>
      setIndex((i) => i + 1),
    )
  }, [content])

  const splash = setup && index < INTRO.length ? INTRO[index] : null
  const short = setup !== null && !setup.full && !setup.still

  return (
    <Animated.View
      style={[styles.fill, { backgroundColor: INTRO[0].timing.background, opacity: cover }]}
      pointerEvents={splash ? 'auto' : 'none'}
    >
      {splash && setup && (
        <Animated.View style={[styles.fill, { opacity: content }]}>
          <SplashSequence
            key={index}
            id={splash.id}
            timing={splash.timing}
            from={short ? splash.shortFrom : 0}
            lastHoldMs={setup.still ? STILL_HOLD_MS : short ? SHORT_LAST_HOLD_MS : undefined}
            still={setup.still}
            label={splash.label}
            onDone={next}
          />
        </Animated.View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
})
