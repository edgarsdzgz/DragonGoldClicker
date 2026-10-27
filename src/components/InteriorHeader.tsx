import React, { useState } from 'react'
import { View, PixelRatio, StyleSheet } from 'react-native'
import type { LayoutChangeEvent } from 'react-native'
import { SPRITES, fitWhole } from '../art'
import type { SpriteId } from '../art'
import { PixelSprite } from './PixelSprite'
import { radius, spacing } from '../theme'

interface InteriorHeaderProps {
  /** The building's header picture (art/city.ts interiorHeader) */
  id: SpriteId
}

/**
 * The picture across the top of a building's interior: as wide as the sheet allows at a whole art
 * scale, centered. It is decoration; the sheet's own title names the building.
 */
export function InteriorHeader({ id }: InteriorHeaderProps) {
  const [width, setWidth] = useState(0)
  const art = SPRITES[id]
  const scale = width > 0 ? fitWhole(width, art.w, PixelRatio.get()) : 0
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)

  return (
    <View
      style={styles.row}
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
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  frame: {
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
})
