import React from 'react'
import { View, StyleSheet, PixelRatio } from 'react-native'
import { PixelSprite } from './PixelSprite'
import { SPRITES, fitScale } from '../art'
import { portraitSprite } from '../art/cast'
import type { CastId, Mood } from '../types/cast'
import { colors, radius, gold } from '../theme'

/** The window's inner height, in points: a bust (22x23) at a whole scale fills it */
const SLOT_PTS = 64

interface SpeakerPortraitProps {
  who: CastId
  mood?: Mood
}

/**
 * The speaker's bust in a small framed window, in the face their line calls for; the Gate's emblem
 * for the narrator. Decorative: the speaker's name is always written beside it.
 */
export function SpeakerPortrait({ who, mood }: SpeakerPortraitProps) {
  const id = portraitSprite(who, mood)
  const scale = fitScale(SLOT_PTS, SPRITES[id].h, PixelRatio.get())
  return (
    <View style={styles.frame}>
      <PixelSprite id={id} scale={scale} />
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    width: SLOT_PTS + 12,
    height: SLOT_PTS + 12,
    borderRadius: radius.md,
    backgroundColor: colors.bg.surface2,
    borderWidth: 1.5,
    borderColor: gold[400] + '4D',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
})
