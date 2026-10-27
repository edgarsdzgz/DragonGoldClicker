import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { ParticleBurst } from './ParticleBurst'
import type { ParticleBurstHandle } from './ParticleBurst'
import { gold } from '../theme'

const EMBER = require('../../assets/fx/fx_ember.png')

// -----------------------------------------------------------------------------
// EmberDissolve (12-16 embers); the slash, spark and crit are pixel strips (PixelBurst)
// -----------------------------------------------------------------------------

export const MAX_EMBERS = 16

export const emberSize = (unit: number) => Math.max(10, Math.round(unit * 0.1))

export interface EmberDissolveHandle {
  dissolve: (cx: number, cy: number, unit: number) => void
}

/** 12-16 embers that rise from the monster's area, drifting and fading over about 700ms */
export const EmberDissolve = forwardRef<EmberDissolveHandle, { unit: number }>(function EmberDissolve({ unit }, ref) {
  const layer = useRef<ParticleBurstHandle>(null)
  useImperativeHandle(ref, () => ({
    dissolve: (cx, cy, unit) =>
      layer.current?.burst({
        x: cx, y: cy, count: 12 + Math.floor(Math.random() * 5), distance: unit * 0.18, rise: unit * 0.5,
        area: unit * 0.3, durationMs: 700, size: emberSize(unit),
      }),
  }), [])
  return <ParticleBurst ref={layer} source={EMBER} max={MAX_EMBERS} tint={gold[400]} initialSize={emberSize(unit)} />
})
