import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { PixelRatio, StyleSheet, View } from 'react-native'
import type { LayoutChangeEvent } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { Canvas, FilterMode, Image, MipmapMode, Rect } from '@shopify/react-native-skia'
import { BREACH_CENTER, MAP_GATE, MAP_W, REPAIR_SPOTS, SPRITES, fighterSprite, gateSprite, impactPoint, stripMs, useSpriteImage, wallFighters } from '../../art'
import type { GateState } from '../../art'
import { useAppActive } from '../../hooks/useAppActive'
import { useReduceMotion } from '../../hooks/useReduceMotion'
import { PixelSprite } from '../../components/PixelSprite'
import { PixelBurst } from '../../components/PixelBurst'
import type { PixelBurstHandle } from '../../components/PixelBurst'

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None }
/** The map's top row (the night sky), filling any room above it */
const SKY = '#030207'
/** The wall's bottom row, filling any room below the map */
const WALL_FOOT = '#1d1414'
const MAP_H = SPRITES.map_warfront_base.h
/** The fallen wall stays on screen this long after its strip ends, before the patched gate shows */
const BREACH_HOLD_MS = 1200
const JAB_MS = stripMs('ppl_fighter_attack_anim')

export interface WarfrontSceneHandle {
  /** The army's volley landed: the fighters on the wall jab */
  volley: () => void
  /** A monster struck the wall */
  struck: () => void
  /** The wall fell */
  breach: () => void
}

interface WarfrontSceneProps {
  /** Points per map pixel */
  unit: number
  /** Where the wall's top edge should sit, in this scene's space (raised if the wall would not fit below it) */
  wallTop: number
  gate: GateState
  /** The army's size: up to four of them stand on the wall */
  army: number
  /** Repairers are at work on the wall */
  repairing: boolean
  /** Told where the map's top edge is drawn, in this scene's space, whenever it moves */
  onMapTop?: (top: number) => void
}

/**
 * The Warfront behind everything: the night map, the gate in the wall's state and its flickering
 * torches, drawn in one canvas with nearest-neighbor sampling. The wall lines up with `wallTop`, or
 * sits on the bottom edge when it would not fit; sky fills above the map and the wall's foot below
 * it. On the wall: the army's fighters (jabbing with each volley), repair sparkles, the dust of a
 * monster's blow and the wall falling at a breach. Torches and sparkles hold still with Reduce
 * Motion, off screen and in the background. Decorative: the gate's state is read out by the Gate.
 */
export const WarfrontScene = forwardRef<WarfrontSceneHandle, WarfrontSceneProps>(function WarfrontScene(
  { unit, wallTop, gate, army, repairing, onMapTop },
  ref,
) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  const base = useSpriteImage('map_warfront_base')
  const gateImg = useSpriteImage(gateSprite(gate))
  // The torches are their own small sprites, so their flicker never redraws the map
  const focused = useIsFocused()
  const appActive = useAppActive()
  const reduceMotion = useReduceMotion()
  const flicker = focused && appActive

  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })

  // Snapped to whole screen pixels, so the canvas and the sprites on it line up exactly
  const ratio = PixelRatio.get()
  const snap = (v: number) => Math.round(v * ratio) / ratio
  const left = snap((size.w - MAP_W * unit) / 2)
  const g = MAP_GATE.gate
  const wall = size.h > 0 ? Math.min(wallTop, size.h - g.height * unit) : wallTop
  const top = snap(wall - g.y * unit)
  useEffect(() => {
    if (size.w > 0) onMapTop?.(top)
  }, [top, size.w, onMapTop])
  const at = (p: { x: number; y: number }) => ({ position: 'absolute' as const, left: left + p.x * unit, top: top + p.y * unit })

  // A volley: every fighter on the wall jabs once (a new key restarts the strip)
  const [jab, setJab] = useState(0)
  const [jabbing, setJabbing] = useState(false)
  const jabTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(jabTimer.current), [])

  const fx = useRef<PixelBurstHandle>(null)
  // The latest placement, for the handle's calls between renders
  const place = useRef({ left, top, unit })
  place.current = { left, top, unit }
  const playAt = (id: 'fx_wall-impact_anim' | 'fx_breach_anim', p: { x: number; y: number }, holdMs = 0) => {
    const { left: l, top: t, unit: u } = place.current
    fx.current?.play(id, l + p.x * u, t + p.y * u, holdMs)
  }

  useImperativeHandle(ref, () => ({
    volley: () => {
      setJab((j) => j + 1)
      setJabbing(true)
      clearTimeout(jabTimer.current)
      jabTimer.current = setTimeout(() => setJabbing(false), JAB_MS)
    },
    struck: () => playAt('fx_wall-impact_anim', impactPoint(Math.random())),
    // Held still, the strip would show the wall whole: with Reduce Motion the gate simply changes
    breach: () => { if (!reduceMotion) playAt('fx_breach_anim', BREACH_CENTER, BREACH_HOLD_MS) },
  }), [reduceMotion])

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
        <PixelSprite key={`${t.x}-${t.y}`} id="map_torch_anim" scale={unit} frame={flicker ? undefined : 0} style={at(t)} />
      ))}
      {size.w > 0 && repairing && REPAIR_SPOTS.map((s) => (
        <PixelSprite key={`${s.x}-${s.y}`} id="fx_repair_anim" scale={unit} frame={flicker ? undefined : 0} style={at(s)} />
      ))}
      {size.w > 0 && gate !== 'breached' && wallFighters(army).map((f) => (
        <PixelSprite key={`${f.x}-${jabbing ? jab : 'idle'}`} id={fighterSprite(jabbing)} scale={unit} loop={false} style={at(f)} />
      ))}
      <PixelBurst ref={fx} scale={unit} max={3} />
    </View>
  )
})
