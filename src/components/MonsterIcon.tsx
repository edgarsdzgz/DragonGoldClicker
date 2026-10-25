import React from 'react'
import { Image } from 'react-native'
import type { StyleProp, ImageStyle, TextStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { MonsterDef } from '../types/monsters'
import { MONSTER_ART } from '../data/monsterArt'

/** Ionicons glyphs carry their own padding, so they draw smaller than the box to match art */
const GLYPH_SCALE = 0.72

interface MonsterIconProps {
  monster: MonsterDef
  /** Square box the art fills */
  size: number
  color: string
  style?: StyleProp<ImageStyle & TextStyle>
}

/**
 * A monster's silhouette, tinted to `color`. Uses its artwork when it has some
 * (src/data/monsterArt.ts) and its Ionicons glyph otherwise. Decorative: callers
 * describe the monster in their own accessibility label.
 */
export function MonsterIcon({ monster, size, color, style }: MonsterIconProps) {
  const art = MONSTER_ART[monster.id]
  if (art) {
    return (
      <Image
        source={art}
        resizeMode="contain"
        style={[{ width: size, height: size, tintColor: color }, style]}
        accessibilityIgnoresInvertColors
      />
    )
  }
  return <Ionicons name={monster.glyph} size={Math.round(size * GLYPH_SCALE)} color={color} style={style} />
}
