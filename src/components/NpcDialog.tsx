import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Animated,
  AccessibilityInfo,
  Platform,
  PixelRatio,
  useWindowDimensions,
} from 'react-native'
import type { AudioSource } from 'expo-audio'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SPRITES, fitWhole } from '../art'
import type { GameIconName, SpriteId } from '../art'
import { GameIcon } from './GameIcon'
import { PixelSprite } from './PixelSprite'
import { ModalStage } from './ModalStage'
import { Text } from './Text'
import { HighlightBackdrop } from './HighlightBackdrop'
import { DialogueCast } from './DialogueCast'
import { SpeakerTag } from './SpeakerTag'
import { colors, spacing, radius, gold } from '../theme'
import { useHaptics, useSfx } from '../hooks'
import { useReduceMotion } from '../hooks/useReduceMotion'
import { useScreenReader } from '../hooks/useScreenReader'
import { SOUND } from '../data/sounds'
import { dialogPaging } from '../types/dialogPaging'
import { lineMood } from '../types/cast'
import type { CastId, Mood } from '../types/cast'

/** Ignore a second tap this soon after the first */
const PRESS_GUARD_MS = 250

/** One letter appears this often while a line types itself out */
const TYPE_MS = 28

/** Light enough that the world shows behind the people talking */
const BACKDROP_DIM = 'rgba(2, 2, 6, 0.6)'

/** The scene's picture takes at most this share of the screen's height */
const PICTURE_MAX_H = 0.42

/** The picture starts below the scene's title, which sits at the top */
const PICTURE_TOP = 28

/** One line of dialogue text, in points */
const LINE_H = 22

/** The box holds five lines of text without growing, so the people standing on it do not bob */
const BOX_MIN_H = LINE_H * 5 + spacing[5] + spacing[7]

interface NpcDialogProps {
  visible: boolean
  npcName: string
  icon: GameIconName
  /** Who speaks: they stand on the box (in the line's mood), their sigil on the name plate */
  who?: CastId
  /** The speaker's face for the scene */
  mood?: Mood
  /** A face for one line, by its index */
  lineMoods?: Partial<Record<number, Mood>>
  /** Two on stage (left, right) for a conversation: the speaker lit, the other in shadow */
  stage?: [CastId, CastId]
  title: string
  /** The scene's picture (130x96), across the top of the screen behind the dialogue */
  picture?: SpriteId
  /** A character's sting, played as the scene opens instead of its usual sound (their first scene) */
  sting?: AudioSource
  /** Keep the same array for the same scene (a new array starts the scene over from its first line) */
  lines: string[]
  dismissLabel?: string
  onDismiss: () => void
  /** Closes the scene from any line without the dismiss follow-up (e.g. navigation) */
  onSkip?: () => void
  /** Only cutscenes offer Skip (and only with 2+ pages) */
  cutscene?: boolean
  /** Coach target the scene is about: it shows through the dim, boxed (e.g. 'renown') */
  highlight?: string
}

/**
 * A scene as dialogue (owner, 2026-10-27): the speaker stands on a box at the bottom of the screen
 * and their words type themselves out. A tap anywhere finishes the line, the next tap moves on. The
 * arrow in the box's corner never moves; on the last line it carries the scene's own word. Skip
 * stays at the top. Reduce Motion and screen readers get each line whole.
 */
export function NpcDialog({
  visible,
  npcName,
  icon,
  who,
  mood,
  lineMoods,
  stage,
  title,
  picture,
  sting,
  lines,
  dismissLabel = 'Continue',
  onDismiss,
  onSkip,
  cutscene = false,
  highlight,
}: NpcDialogProps) {
  const haptics = useHaptics()
  const playOpen = useSfx(sting ?? SOUND.sceneOpen)
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const reduceMotion = useReduceMotion()
  const screenReader = useScreenReader()
  const backdropOpacity = useRef(new Animated.Value(0)).current
  const riseY = useRef(new Animated.Value(24)).current
  const castOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      playOpen()
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(castOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(riseY, { toValue: 0, tension: 65, friction: 9, useNativeDriver: true }),
      ]).start()
    } else {
      backdropOpacity.setValue(0)
      castOpacity.setValue(0)
      riseY.setValue(24)
    }
  }, [visible, playOpen, backdropOpacity, castOpacity, riseY])

  // One line per page. A tap steps through the pages; the last page's tap is the scene's own
  // dismiss (with its label and any navigation). Skip is only for cutscenes of 2+ pages.
  // The page belongs to its lines: when the next scene of a conversation takes over (the Breach,
  // Rodain then Pyreth), it starts on its first line from the first frame
  const [at, setAt] = useState({ lines, page: 0 })
  const page = at.lines === lines ? at.page : 0
  const lastPress = useRef({ at: 0, page: -1 })
  useEffect(() => {
    if (visible) {
      setAt({ lines, page: 0 })
      lastPress.current = { at: 0, page: -1 }
    }
  }, [visible, lines])
  const { pageCount, lastPage, canSkip: skippable } = dialogPaging(lines.length, page, cutscene)
  const canSkip = skippable && !!onSkip
  const shownPage = Math.min(page, pageCount - 1)
  const line = lines[shownPage] ?? ''

  // The line types itself out, a letter at a time; whole at once for Reduce Motion and screen readers
  const instant = reduceMotion || screenReader
  // The count belongs to its line, so a new line never flashes whole for a frame before it types
  const [progress, setProgress] = useState({ line: '', n: 0 })
  const typed = instant ? line.length : progress.line === line ? progress.n : 0
  const typing = typed < line.length
  useEffect(() => {
    // Closed: forget the line, so a scene that comes back (a second Breach) types it out again
    if (!visible) {
      setProgress({ line: '', n: 0 })
      return
    }
    if (instant) return
    setProgress({ line, n: 0 })
    const timer = setInterval(() => {
      setProgress((p) => (p.line === line && p.n < line.length ? { line, n: p.n + 1 } : p))
    }, TYPE_MS)
    return () => clearInterval(timer)
  }, [line, instant, visible])

  // A double tap must not skip a line (or the whole scene): taps are ignored for a short moment
  // after each one. While a line is still typing, a tap finishes it instead of moving on.
  const handleTap = () => {
    const now = Date.now()
    if (now - lastPress.current.at < PRESS_GUARD_MS) return
    lastPress.current = { at: now, page }
    if (typing) {
      setProgress({ line, n: line.length })
      return
    }
    haptics.light()
    if (!lastPage) {
      setAt({ lines, page: page + 1 })
      return
    }
    onDismiss()
  }

  // Screen readers hear each new page: a polite live region on Android, an announcement on iOS
  useEffect(() => {
    if (visible && page > 0 && Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(lines[page] ?? '')
  }, [visible, page, lines])

  const handleSkip = () => {
    haptics.light()
    onSkip?.()
  }

  const buttonLabel = lastPage ? dismissLabel : 'Continue'
  // Across the top at whole screen pixels, under the title, as wide as fits
  const art = picture ? SPRITES[picture] : null
  const ratio = PixelRatio.get()
  const pictureScale = art
    ? Math.min(fitWhole(width - spacing[4] * 2, art.w, ratio), fitWhole(height * PICTURE_MAX_H, art.h, ratio))
    : 0
  const speakerOnRight = !!(who && stage && stage[1] === who)

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <HighlightBackdrop targetId={highlight} dim={BACKDROP_DIM} />
      </Animated.View>

      {picture && (
        <Animated.View
          pointerEvents="none"
          style={[styles.picture, { top: insets.top + spacing[2] + PICTURE_TOP, opacity: castOpacity }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <PixelSprite id={picture} scale={pictureScale} />
        </Animated.View>
      )}

      {/* The whole screen is the advance button: tap anywhere */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleTap}
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
        accessibilityHint={lastPage ? undefined : 'Shows the next line'}
      />

      <ModalStage>
        <Animated.View
          pointerEvents="none"
          style={[styles.scene, { opacity: castOpacity, transform: [{ translateY: riseY }] }]}
        >
          {who && <DialogueCast who={who} mood={lineMood(shownPage, mood, lineMoods)} stage={stage} />}

          <View style={styles.box}>
            {/* The name plate rides the box's top edge, on the speaker's side */}
            <View style={[styles.plate, speakerOnRight ? styles.plateRight : styles.plateLeft]}>
              {who ? (
                <SpeakerTag who={who} name={npcName.toUpperCase()} textStyle={styles.plateText} />
              ) : (
                <View style={styles.plateRow}>
                  <GameIcon name={icon} size={14} color={gold[400]} />
                  <Text variant="caption" style={styles.plateText}>{npcName.toUpperCase()}</Text>
                </View>
              )}
            </View>

            <Text
              variant="body"
              style={styles.line}
              accessibilityLiveRegion="polite"
              accessibilityLabel={line}
            >
              {line.slice(0, typed)}
            </Text>

            {/* The cue: same corner on every line; the scene's own word on the last */}
            <View style={[styles.cue, typing && styles.hidden]}>
              {lastPage && <Text variant="label" bold style={styles.cueText}>{dismissLabel}</Text>}
              <GameIcon name="arrow-forward" size={12} color={gold[400]} />
            </View>
          </View>
        </Animated.View>
      </ModalStage>

      {/* The scene's name, and Skip, at the top of the screen */}
      <View style={[styles.top, { top: insets.top + spacing[2] }]} pointerEvents="box-none">
        <Text variant="caption" style={styles.title} accessibilityRole="header">{title.toUpperCase()}</Text>
        {canSkip && (
          <Pressable
            onPress={handleSkip}
            style={styles.skip}
            accessibilityRole="button"
            accessibilityLabel="Skip scene"
          >
            <Text variant="label" color="secondary">Skip</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  picture: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scene: {
    width: '100%',
    maxWidth: 420,
  },
  box: {
    minHeight: BOX_MIN_H,
    backgroundColor: colors.bg.surface1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: gold[400] + '73',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[5],
    paddingBottom: spacing[7],
  },
  plate: {
    position: 'absolute',
    top: -15,
    backgroundColor: colors.bg.surface2,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: gold[400] + '73',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  plateLeft: {
    left: spacing[3],
  },
  plateRight: {
    right: spacing[3],
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  plateText: {
    color: gold[400],
    letterSpacing: 1,
    fontSize: 11,
    fontWeight: 'bold',
  },
  line: {
    color: colors.text.primary,
    lineHeight: LINE_H,
  },
  cue: {
    position: 'absolute',
    right: spacing[3],
    bottom: spacing[2],
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  cueText: {
    color: gold[400],
  },
  hidden: {
    opacity: 0,
  },
  top: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text.secondary,
    letterSpacing: 2,
  },
  skip: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.bg.surface1,
  },
})
