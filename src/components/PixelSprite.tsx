import React, { useEffect, useState } from 'react'
import { PixelRatio, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { Canvas, Group, Image, FilterMode, MipmapMode, rect } from '@shopify/react-native-skia'
import { SPRITES, spriteBox, snapScale, stripFrame, useSpriteImage } from '../art'
import type { SpriteId } from '../art'
import { useReduceMotion } from '../hooks/useReduceMotion'

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None }

interface PixelSpriteProps {
  id: SpriteId
  /** Display points per art pixel, snapped to whole screen pixels (icons x4, scenes x3) */
  scale?: number
  /** Show this frame of a strip and hold it; omit to play the strip */
  frame?: number
  /** A playing strip loops (default) or stops on its last frame */
  loop?: boolean
  /** Read by screen readers; omit for decorative art the caller already describes */
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
}

/**
 * One piece of the official pixel art, drawn sharp: whole screen pixels per art pixel and
 * nearest-neighbor sampling. A strip plays at its own speed, and holds its first frame when
 * Reduce Motion is on. Reserves its full size while the image loads, so nothing shifts.
 */
export function PixelSprite({ id, scale = 3, frame, loop = true, accessibilityLabel, style }: PixelSpriteProps) {
  const def = SPRITES[id]
  const img = useSpriteImage(id)
  const reduceMotion = useReduceMotion()
  const ratio = PixelRatio.get()
  const s = snapScale(scale, ratio)
  const box = spriteBox(id, scale, ratio)
  const playing = def.frames > 1 && frame === undefined && !reduceMotion
  const [ticks, setTicks] = useState(0)
  // A strip that does not loop stops its timer on the last frame
  const finished = !loop && ticks >= def.frames - 1

  useEffect(() => {
    setTicks(0)
  }, [id, loop])

  useEffect(() => {
    if (!playing || finished) return
    const timer = setInterval(() => setTicks((t) => t + 1), 1000 / def.fps)
    return () => clearInterval(timer)
  }, [playing, finished, def.fps, id])

  const held = frame === undefined ? 0 : Math.min(Math.max(0, Math.floor(frame)), def.frames - 1)
  const shown = playing ? stripFrame(ticks, def.frames, loop) : held

  return (
    <View
      style={[box, style]}
      accessible={accessibilityLabel !== undefined}
      accessibilityRole={accessibilityLabel !== undefined ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={accessibilityLabel !== undefined ? 'yes' : 'no-hide-descendants'}
    >
      <Canvas style={box}>
        {img && (
          <Group clip={rect(0, 0, box.width, box.height)}>
            <Image
              image={img}
              x={-shown * def.w * s}
              y={0}
              width={def.w * def.frames * s}
              height={def.h * s}
              fit="fill"
              sampling={NEAREST}
            />
          </Group>
        )}
      </Canvas>
    </View>
  )
}
