import React from 'react'
import { View, StyleSheet, PixelRatio } from 'react-native'
import { PixelSprite } from './PixelSprite'
import { SPRITES, fitScale } from '../art'
import { portraitSprite, talkSprite } from '../art/cast'
import type { CastId, Mood } from '../types/cast'

/** A lone speaker's height, in points; two on stage stand a little smaller to fit side by side */
const SOLO_PTS = 132
const PAIR_PTS = 112

interface DialogueCastProps {
  /** Who is speaking now */
  who: CastId
  mood?: Mood
  /** Two on stage (left, right): the speaker is lit, the other waits in shadow, facing them */
  stage?: [CastId, CastId]
  /** The speaker shows their talking frame (the mouth open), in turn with the face while a line types */
  mouthOpen?: boolean
}

/** One standing bust, sized to a height in points at a whole art scale; flipped to face left on the right */
function Figure({ id, pts, flip, quiet }: { id: ReturnType<typeof portraitSprite>; pts: number; flip?: boolean; quiet?: boolean }) {
  return (
    <View style={[flip && styles.flip, quiet && styles.quiet]}>
      <PixelSprite id={id} scale={fitScale(pts, SPRITES[id].h, PixelRatio.get())} />
    </View>
  )
}

/**
 * The people of a dialogue, standing on the box: the speaker alone at the left, or two facing each
 * other. Decorative: the speaker's name is written on the plate and their words in the box.
 */
export function DialogueCast({ who, mood, stage, mouthOpen }: DialogueCastProps) {
  const speaker = mouthOpen ? talkSprite(who, mood) : portraitSprite(who, mood)
  if (stage && stage.includes(who)) {
    const [left, right] = stage
    const face = (id: CastId) => (id === who ? speaker : portraitSprite(id))
    return (
      <View style={[styles.row, styles.pair]} pointerEvents="none">
        <Figure id={face(left)} pts={PAIR_PTS} quiet={left !== who} />
        <Figure id={face(right)} pts={PAIR_PTS} flip quiet={right !== who} />
      </View>
    )
  }
  return (
    <View style={styles.row} pointerEvents="none">
      <Figure id={speaker} pts={SOLO_PTS} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  pair: {
    justifyContent: 'space-between',
  },
  flip: {
    transform: [{ scaleX: -1 }],
  },
  // The one listening, in shadow (over the dimmed world, low opacity reads as dark)
  quiet: {
    opacity: 0.35,
  },
})
