import React, { useState } from 'react'
import { View, PixelRatio, StyleSheet } from 'react-native'
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native'
import { SPRITES, fitWhole } from '../art'
import type { SpriteId } from '../art'
import { PixelSprite } from './PixelSprite'
import { radius } from '../theme'

interface ArtBannerProps {
  /** The picture: a building's interior header, an event's banner, a wanderer group */
  id: SpriteId
  /** Never taller than this, in points (a card's emblem space); as wide as the row allows otherwise */
  maxHeight?: number
  style?: StyleProp<ViewStyle>
}

/**
 * A picture across a sheet or a card: as large as the row's width (and maxHeight) allow at a whole
 * art scale, centered. It is decoration; the title beside it says what it shows.
 */
export function ArtBanner({ id, maxHeight, style }: ArtBannerProps) {
  const [width, setWidth] = useState(0)
  const art = SPRITES[id]
  const ratio = PixelRatio.get()
  const scale = width > 0 ? Math.min(fitWhole(width, art.w, ratio), maxHeight ? fitWhole(maxHeight, art.h, ratio) : Infinity) : 0
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)

  return (
    <View
      style={[styles.row, style]}
      onLayout={onLayout}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {scale > 0 && (
        <View style={styles.frame}>
          <PixelSprite id={id} scale={scale} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  frame: {
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
})
