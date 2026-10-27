import React from 'react'
import { PixelRatio, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { Canvas, Group, Image, FilterMode, MipmapMode, rect } from '@shopify/react-native-skia'
import { frameCell, snapScale, useSpriteImage } from '../art'
import type { SheetTiming, SpriteId } from '../art'

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None }

interface PixelSheetProps {
  /** The sheet (or strip) holding the frames */
  id: SpriteId
  /** Frame size and layout, from the sheet's timing file */
  timing: SheetTiming
  frame: number
  /** Display points per art pixel, snapped to whole screen pixels */
  scale: number
  style?: StyleProp<ViewStyle>
}

/**
 * One frame of a timed sheet, drawn sharp (whole screen pixels per art pixel, nearest-neighbor).
 * The caller picks the frame; SplashSequence plays one. Decorative: the caller describes it.
 */
export function PixelSheet({ id, timing, frame, scale, style }: PixelSheetProps) {
  const img = useSpriteImage(id)
  const s = snapScale(scale, PixelRatio.get())
  const box = { width: timing.frame_width * s, height: timing.frame_height * s }
  const cell = frameCell(timing, frame)

  return (
    <View style={[box, style]} importantForAccessibility="no-hide-descendants">
      <Canvas style={box}>
        {img && (
          <Group clip={rect(0, 0, box.width, box.height)}>
            <Image
              image={img}
              x={-cell.x * s}
              y={-cell.y * s}
              width={img.width() * s}
              height={img.height() * s}
              fit="fill"
              sampling={NEAREST}
            />
          </Group>
        )}
      </Canvas>
    </View>
  )
}
