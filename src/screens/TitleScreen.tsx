import React, { useEffect } from 'react'
import { AccessibilityInfo, PixelRatio, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SPLASH_TIMING } from '../art'
import { Button, LoadingBar, TapToStart, Text } from '../components'
import { PixelSheet } from '../components/PixelSheet'
import { splashScale } from '../components/SplashSequence'
import type { LoadProgress } from '../loading/steps'
import { spacing } from '../theme'

interface TitleScreenProps {
  progress: LoadProgress
  onStart: () => void
  onRetry: () => void
  /** Only offered when the save could not be read: a new game, the old save kept aside */
  onStartFresh: () => void
}

const LAST = SPLASH_TIMING.frames - 1
/** A failure's message and buttons need room: the gate shrinks to this share of the screen's height */
const FAILED_SHARE = 0.6

/** What the title says when a step fails, in plain words */
function failureText(stepId: string | null): string {
  return stepId === 'save' ? 'Your save could not be read.' : 'Something did not load.'
}

/**
 * The title: the gate under the ember moon holds where its splash ended, with the loading bar
 * below it. When everything is loaded, Tap to start, and the whole screen is the button. A failed
 * step says so and offers to try again; a broken save is never opened or overwritten.
 */
export function TitleScreen({ progress, onStart, onRetry, onStartFresh }: TitleScreenProps) {
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const ready = progress.status === 'ready'
  const failed = progress.status === 'failed'
  // Loading and ready hold the gate exactly where its splash ended; a failure moves it up for the message
  const scale = splashScale(width, failed ? height * FAILED_SHARE : height, SPLASH_TIMING, PixelRatio.get())

  // The prompt is decorative, so a screen reader hears that the game is ready
  useEffect(() => {
    if (ready) AccessibilityInfo.announceForAccessibility('Ready. Tap to start.')
  }, [ready])

  return (
    <View style={[styles.fill, { backgroundColor: SPLASH_TIMING.background }]}>
      <View style={failed ? styles.top : styles.center} accessible accessibilityRole="header" accessibilityLabel="Draconia Chronicles">
        <PixelSheet id="splash_frames_anim" timing={SPLASH_TIMING} frame={LAST} scale={scale} />
      </View>

      <View style={[failed ? styles.below : styles.footer, { paddingBottom: insets.bottom + spacing[8] }]}>
        {ready && <TapToStart />}
        {progress.status === 'loading' && (
          <LoadingBar progress={progress.fraction} label={progress.label} detail={progress.detail} />
        )}
        {failed && (
          <View style={styles.failed} accessibilityLiveRegion="polite">
            <Text variant="body" center>{failureText(progress.stepId)}</Text>
            {progress.stepId === 'save' && (
              <Text variant="caption" color="muted" center>
                A new game keeps the old save aside on this phone; it is not deleted.
              </Text>
            )}
            <View style={styles.buttons}>
              <Button size="md" onPress={onRetry}>Try again</Button>
              {progress.stepId === 'save' && (
                <Button size="md" variant="secondary" onPress={onStartFresh}>Start a new game</Button>
              )}
            </View>
          </View>
        )}
      </View>

      {ready && (
        <Pressable
          style={styles.fill}
          onPress={onStart}
          accessibilityRole="button"
          accessibilityLabel="Start game"
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  below: {
    paddingHorizontal: spacing[7],
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    left: spacing[7],
    right: spacing[7],
    bottom: 0,
    alignItems: 'center',
  },
  failed: {
    gap: spacing[3],
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[3],
  },
})
