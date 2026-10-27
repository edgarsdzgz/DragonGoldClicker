import { useCallback, useEffect, useRef, useState } from 'react'
import { PixelRatio } from 'react-native'
import { SPRITES, bodyMs, growScales, mobDeathSprite, spriteBox, stripMs, walkDelayMs, walkStepMs, walkUpAt, walkUpMs } from '../art'
import type { MobSprites, MobTier, SpriteId } from '../art'
import type { MonsterDef } from '../types/monsters'
import { useWalkUp } from './useWalkUp'

/** Bodies on the road at once; another drops the oldest */
export const MAX_BODIES = 3

/** The monster coming down the road, in its box's space: its size, its feet, and its bob */
export interface RoadWalker {
  scale: number
  /** How far above its place it is (0 or less) */
  offsetY: number
  /** Where its feet are: the box's bottom plus offsetY */
  feet: number
  width: number
  height: number
  /** The bob frame, pinned to its steps while it walks; undefined once it stands */
  frame: number | undefined
  walking: boolean
}

/** A body on the road, where its monster fell and at the size it was */
export interface RoadBody {
  key: number
  death: SpriteId
  scale: number
  feet: number
  blink: boolean
}

interface MonsterRoadArgs {
  kills: number
  /** The monster at the gate, its Unmaking tier and its sprites (null: no pixel art, no road) */
  def: MonsterDef
  tier: MobTier
  mob: MobSprites | null
  /** Points per art pixel at its place, and per map pixel (where it starts, at the camps) */
  fullScale: number
  unit: number
  /** The monster's box, and how far up the road the camps are from its bottom */
  size: number
  distance: number
  /** On screen and in the foreground */
  live: boolean
  reduceMotion: boolean
}

/**
 * The road between the camps and the gate. After a kill the body lies where its monster fell (its
 * death, a hold, the blink) and the next one walks down from the camps: a step and one size larger
 * with each frame of its bob, sharp at every size. Off screen, in the background or with Reduce
 * Motion the next one is simply at its place, and leaving clears the bodies.
 */
export function useMonsterRoad(a: MonsterRoadArgs) {
  const { kills, def, tier, mob, fullScale, unit, size, distance, live, reduceMotion } = a
  const ratio = PixelRatio.get()
  const scales = mob ? growScales(unit, fullScale, ratio) : [fullScale]
  const stepMs = mob ? walkStepMs(mob.idle) : 250
  const death = mobDeathSprite(def.id, tier)
  const delay = walkDelayMs(walkUpMs(scales, stepMs), death ? bodyMs(stripMs(death)) : 0)
  const step = useWalkUp(kills, scales.length, stepMs, delay, mob !== null && distance > 0 && live && !reduceMotion)

  const pose = walkUpAt(step * stepMs, scales, stepMs)
  const scale = scales[pose.step]
  const box = mob ? spriteBox(mob.idle, scale, ratio) : { width: size, height: size }
  const offsetY = pose.done ? 0 : PixelRatio.roundToNearestPixel(-(1 - pose.along) * distance)
  const frames = mob ? SPRITES[mob.idle].frames : 1
  const walker: RoadWalker = {
    scale,
    offsetY,
    feet: size + offsetY,
    width: box.width,
    height: box.height,
    frame: pose.done ? undefined : pose.step % frames,
    walking: !pose.done,
  }

  const [bodies, setBodies] = useState<RoadBody[]>([])
  // Where the last one fell (its top), for the bounty to rise from; null when it left no body
  const fellTop = useRef<number | null>(null)

  // The monster as last drawn, for a kill to lay its body where it stood, at the size it was
  const shown = useRef({ def, tier, walker })
  useEffect(() => {
    shown.current = { def, tier, walker }
  })

  // In the kill's own render, like the walk: the body is there the moment the next one sets out.
  // A reset or a loaded save (fewer kills) clears the road.
  const [seenKills, setSeenKills] = useState(kills)
  if (kills !== seenKills) {
    setSeenKills(kills)
    const was = shown.current
    const dead = kills > seenKills && live ? mobDeathSprite(was.def.id, was.tier) : null
    fellTop.current = dead ? was.walker.feet - was.walker.height : null
    if (kills < seenKills) setBodies([])
    else if (dead) {
      const body = { key: kills, death: dead, scale: was.walker.scale, feet: was.walker.feet, blink: !reduceMotion }
      setBodies((bs) => [...bs, body].slice(-MAX_BODIES))
    }
  }

  useEffect(() => {
    if (!live) setBodies([])
  }, [live])

  const dropBody = useCallback((key: number) => setBodies((bs) => bs.filter((b) => b.key !== key)), [])

  return { walker, bodies, dropBody, fellTop }
}
