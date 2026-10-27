import React, { useState } from 'react'
import { PixelRatio, StyleSheet, View } from 'react-native'
import type { LayoutChangeEvent } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { Canvas, FilterMode, Image, MipmapMode, Rect } from '@shopify/react-native-skia'
import { MAP_GATE, MAP_W, SPRITES, gateSprite, useSpriteImage } from '../../art'
import type { GateState } from '../../art'
import { useAppActive } from '../../hooks/useAppActive'
import { PixelSprite } from '../../components/PixelSprite'

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None }
/** The map's top row (the night sky), filling any room above it */
const SKY = '#030207'
/** The wall's bottom row, filling any room below the map */
const WALL_FOOT = '#1d1414'
const MAP_H = SPRITES.map_warfront_base.h

interface WarfrontSceneProps {
  /** Points per map pixel */
  unit: number
  /** Where the wall's top edge should sit, in this scene's space (raised if the wall would not fit below it) */
  wallTop: number
  gate: GateState
}

/**
 * The Warfront behind everything: the night map, the gate in the wall's state and its flickering
 * torches, drawn in one canvas with nearest-neighbor sampling. The wall lines up with `wallTop`, or
 * sits on the bottom edge when it would not fit; sky fills above the map and the wall's foot below
 * it. Torches hold still with Reduce Motion, off screen and in the background. Decorative: the
 * gate's state is read out by the Gate.
 */
export function WarfrontScene({ unit, wallTop, gate }: WarfrontSceneProps) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  const base = useSpriteImage('map_warfront_base')
  const gateImg = useSpriteImage(gateSprite(gate))
  // The torches are their own small sprites, so their flicker never redraws the map
  const focused = useIsFocused()
  const appActive = useAppActive()
  const flicker = focused && appActive

  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })

  // Snapped to whole screen pixels, so the canvas and the torch sprites line up exactly
  const ratio = PixelRatio.get()
  const snap = (v: number) => Math.round(v * ratio) / ratio
  const left = snap((size.w - MAP_W * unit) / 2)
  const g = MAP_GATE.gate
  const wall = size.h > 0 ? Math.min(wallTop, size.h - g.height * unit) : wallTop
  const top = snap(wall - g.y * unit)

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {size.w > 0 && (
        <Canvas style={{ width: size.w, height: size.h }} opaque>
          <Rect x={0} y={0} width={size.w} height={size.h} color={SKY} />
          <Rect x={0} y={top + MAP_H * unit} width={size.w} height={Math.max(0, size.h - top - MAP_H * unit)} color={WALL_FOOT} />
          {base && <Image image={base} x={left} y={top} width={MAP_W * unit} height={MAP_H * unit} fit="fill" sampling={NEAREST} />}
          {gateImg && (
            <Image image={gateImg} x={left + g.x * unit} y={top + g.y * unit} width={g.width * unit} height={g.height * unit} fit="fill" sampling={NEAREST} />
          )}
        </Canvas>
      )}
      {size.w > 0 && MAP_GATE.torches.map((t) => (
        <PixelSprite
          key={`${t.x}-${t.y}`}
          id="map_torch_anim"
          scale={unit}
          frame={flicker ? undefined : 0}
          style={{ position: 'absolute', left: left + t.x * unit, top: top + t.y * unit }}
        />
      ))}
    </View>
  )
}
