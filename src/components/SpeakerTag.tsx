import React from 'react'
import { View, StyleSheet, PixelRatio } from 'react-native'
import type { TextStyle } from 'react-native'
import { PixelSprite } from './PixelSprite'
import { Text } from './Text'
import { SPRITES, fitScale } from '../art'
import { sigilSprite } from '../art/cast'
import type { CastId } from '../types/cast'
import { spacing } from '../theme'

/** The sigil's height, in points: about the height of the caption it sits beside */
const SIGIL_PTS = 14

interface SpeakerTagProps {
  who: CastId
  name: string
  /** The name's style (color, letter-spacing, case) */
  textStyle?: TextStyle
}

/** A speaker's name with their sigil before it; the Gate, which has no sigil, shows the name alone */
export function SpeakerTag({ who, name, textStyle }: SpeakerTagProps) {
  const sigil = sigilSprite(who)
  return (
    <View style={styles.row}>
      {sigil && <PixelSprite id={sigil} scale={fitScale(SIGIL_PTS, SPRITES[sigil].h, PixelRatio.get())} />}
      <Text variant="caption" style={textStyle}>{name}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
})
