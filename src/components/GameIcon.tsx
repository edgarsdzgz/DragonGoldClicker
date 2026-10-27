import React from 'react'
import { PixelRatio, View } from 'react-native'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SPRITES, fitScale, iconArt } from '../art'
import type { GameIconName } from '../art'
import { PixelSprite } from './PixelSprite'

interface GameIconProps {
  /** An Ionicons name (drawn as its pixel icon when there is one) or a sprite id */
  name: GameIconName
  /** Box size in points, as for Ionicons */
  size: number
  /** Tint for an icon that still draws as a glyph; pixel icons keep their own colors */
  color?: string
  /** Faded, for a disabled control or an unfocused tab */
  dim?: boolean
  style?: StyleProp<ViewStyle>
}

const DIM_OPACITY = 0.45

/**
 * An interface icon. Draws the official pixel icon when the name has one (src/art/icons.ts) and
 * the old Ionicons glyph otherwise, so screens move to pixel art as icons are drawn. Decorative:
 * callers label the control it sits in.
 */
export function GameIcon({ name, size, color, dim = false, style }: GameIconProps) {
  const art = iconArt(name)
  if (art) {
    const def = SPRITES[art]
    return (
      <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, dim && { opacity: DIM_OPACITY }, style]}>
        <PixelSprite id={art} scale={fitScale(size, Math.max(def.w, def.h), PixelRatio.get())} />
      </View>
    )
  }
  return (
    <Ionicons
      name={name as React.ComponentProps<typeof Ionicons>['name']}
      size={size}
      color={color}
      style={[dim && { opacity: DIM_OPACITY }, style as StyleProp<TextStyle>]}
    />
  )
}
