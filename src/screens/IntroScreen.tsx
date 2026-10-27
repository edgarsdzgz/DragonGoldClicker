import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AccessibilityInfo, Animated, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { INTRO, INTRO_FADE_MS, INTRO_SEEN_KEY, SHORT_LAST_HOLD_MS, STILL_HOLD_MS, SEAL_BUILD_TIMING } from '../art'
import { beatFrameSounds } from '../data/sounds'
import { SplashSequence } from '../components'

/** The studio splash's beats, each on its frame (the game's splash has no sound of its own) */
const SEAL_SOUNDS = beatFrameSounds(SEAL_BUILD_TIMING.beats)

interface IntroScreenProps {
  /** The title screen, shown when the splashes end (or one is tapped through) */
  title: React.ReactNode
  /** The title is showing */
  onTitle: () => void
  /** The player started: the game is mounted under the cover, which now fades */
  started: boolean
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
 * The launch intro: RAXDEG STUDIOS, a fade through the dark, Draconia Chronicles, then the title.
 * Tapping through a splash goes straight to the title. The game mounts only once the player
 * starts from the title, so its own modals (time away, story) never open on top of the intro.
 */
export function IntroScreen({ title, onTitle, started, onFinished }: IntroScreenProps) {
  const [setup, setSetup] = useState<Setup | null>(null)
  const [index, setIndex] = useState(0)
  const content = useRef(new Animated.Value(0)).current
  const cover = useRef(new Animated.Value(1)).current
  const callbacks = useRef({ onTitle, onFinished })
  callbacks.current = { onTitle, onFinished }

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

  // Each splash, and then the title, fades in from the dark
  useEffect(() => {
    if (!setup) return
    content.setValue(0)
    Animated.timing(content, { toValue: 1, duration: INTRO_FADE_MS, useNativeDriver: true }).start()
  }, [setup, index, content])

  const atTitle = index >= INTRO.length
  useEffect(() => {
    if (atTitle) callbacks.current.onTitle()
  }, [atTitle])

  // Started: the game is under the cover, and the cover fades away
  useEffect(() => {
    if (!started) return
    Animated.timing(cover, { toValue: 0, duration: INTRO_FADE_MS, useNativeDriver: true }).start(() =>
      callbacks.current.onFinished(),
    )
  }, [started, cover])

  const next = useCallback((skipped: boolean) => {
    Animated.timing(content, { toValue: 0, duration: INTRO_FADE_MS, useNativeDriver: true }).start(() =>
      setIndex((i) => (skipped ? INTRO.length : i + 1)),
    )
  }, [content])

  const splash = setup && !atTitle ? INTRO[index] : null
  const short = setup !== null && !setup.full && !setup.still

  return (
    <Animated.View
      style={[styles.fill, { backgroundColor: INTRO[0].timing.background, opacity: cover }]}
      pointerEvents={started ? 'none' : 'auto'}
    >
      {setup && (
        <Animated.View style={[styles.fill, { opacity: content }]}>
          {splash ? (
            <SplashSequence
              key={index}
              id={splash.id}
              timing={splash.timing}
              from={short ? splash.shortFrom : 0}
              lastHoldMs={setup.still ? STILL_HOLD_MS : short ? SHORT_LAST_HOLD_MS : undefined}
              still={setup.still}
              label={splash.label}
              sounds={splash.timing === SEAL_BUILD_TIMING ? SEAL_SOUNDS : undefined}
              onDone={next}
            />
          ) : (
            title
          )}
        </Animated.View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
})
