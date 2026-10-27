import React, { useEffect, useRef, useState } from 'react'
import { PixelRatio, StyleSheet, View, useWindowDimensions } from 'react-native'
import { Text, Surface, SectionLabel, PillTabs, Button, PixelSprite } from '../../components'
import type { PillTab } from '../../components'
import { MAP_GATE, MAP_W, MOB_SCALE, SPRITES, mapUnit, spriteBox, stripMs } from '../../art'
import type { SpriteId } from '../../art'
import { GROW_WALK_MS, bodyState, growScales, growStep, tierSprite } from '../../art/walkUp'
import type { MobTier } from '../../art/walkUp'
import { useReduceMotion } from '../../hooks/useReduceMotion'
import { WarfrontScene } from '../warfront/WarfrontScene'
import { spacing } from '../../theme'

const MOB_TABS: PillTab[] = ['kobold', 'goblin', 'crawler', 'orc', 'raider'].map((k) => ({ key: k, label: k }))
const TIER_TABS: PillTab[] = ['weak', 'strong', 'stronger'].map((k) => ({ key: k, label: k }))
const SPEED_TABS: PillTab[] = [{ key: '1', label: 'Normal' }, { key: '3', label: 'Slow (x3)' }]

/** Map rows above this are sky and hills, left out so the road fits the panel */
const CROP_TOP = 100
const MAP_H = SPRITES.map_warfront_base.h
/** The road's middle, and its feet rows: where it leaves the camps, and the monster's place */
const ROAD_X = 66
const ROAD_TOP_Y = 124
const PLACE_Y = 180
/** Bodies on the road at once; a fourth drops the oldest */
const MAX_BODIES = 3

interface Body {
  key: number
  id: SpriteId
  scale: number
  feet: number
  at: number
}

/**
 * Dev panel section: the growing walk-up, for the owner to judge on the phone. A kill plays the
 * death where the monster stands and the next one walks down the road from the camps, growing a
 * screen pixel per art pixel at each step. Kill again mid-walk to drop it on the road.
 */
export function DevWalkUpPreview() {
  const width = useWindowDimensions().width - spacing[4] * 4
  const ratio = PixelRatio.get()
  const unit = mapUnit(width, ratio)
  const height = (MAP_H - CROP_TOP) * unit
  const reduceMotion = useReduceMotion()
  const [mob, setMob] = useState('kobold')
  const [tier, setTier] = useState<MobTier>('weak')
  const [speed, setSpeed] = useState('1')

  const walk = tierSprite(mob, tier, 'walk_anim') ?? 'mob_kobold_walk_anim'
  const death = tierSprite(mob, tier, 'death_anim') ?? 'mob_kobold_death_anim'
  const scales = growScales(unit, unit * MOB_SCALE, ratio)
  const walkMs = GROW_WALK_MS * Number(speed)

  const [walkFrom, setWalkFrom] = useState(-Infinity)
  const [bodies, setBodies] = useState<Body[]>([])
  const [now, setNow] = useState(Date.now())
  const keyRef = useRef(0)

  // Ticks every frame while something moves, and stops when all is still
  const walking = now - walkFrom < walkMs
  const active = walking || bodies.length > 0
  useEffect(() => {
    if (!active) return
    let frame = requestAnimationFrame(function tick() {
      const t = Date.now()
      setNow(t)
      setBodies((bs) => {
        const left = bs.filter((b) => bodyState((t - b.at) / Number(speed), stripMs(b.id), !reduceMotion) !== 'gone')
        return left.length === bs.length ? bs : left
      })
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [active, speed, reduceMotion])

  const snap = (v: number) => Math.round(v * ratio) / ratio
  const left = snap((width - MAP_W * unit) / 2)
  const x = left + ROAD_X * unit
  const t = reduceMotion ? 1 : Math.min(1, (now - walkFrom) / walkMs)
  const scale = scales[growStep(t, scales.length)]
  const feet = snap(((ROAD_TOP_Y + (PLACE_Y - ROAD_TOP_Y) * t) - CROP_TOP) * unit)

  const kill = () => {
    const at = Date.now()
    setBodies((bs) => [...bs, { key: ++keyRef.current, id: death, scale, feet, at }].slice(-MAX_BODIES))
    setWalkFrom(at)
    setNow(at)
  }

  const place = (id: SpriteId, s: number, f: number) => {
    const box = spriteBox(id, s, ratio)
    return { position: 'absolute' as const, left: snap(x - box.width / 2), top: snap(f - box.height) }
  }

  return (
    <Surface style={styles.section}>
      <SectionLabel spacing={2}>WALK-UP PREVIEW</SectionLabel>
      <PillTabs tabs={MOB_TABS} activeKey={mob} onSelect={setMob} />
      <PillTabs tabs={TIER_TABS} activeKey={tier} onSelect={(k) => setTier(k as MobTier)} />
      <PillTabs tabs={SPEED_TABS} activeKey={speed} onSelect={setSpeed} />
      <View style={[styles.stage, { width, height }]}>
        <WarfrontScene unit={unit} wallTop={(MAP_GATE.gate.y - CROP_TOP) * unit} gate="sound" army={0} repairing={false} />
        {bodies.map((b) => {
          const state = bodyState((now - b.at) / Number(speed), stripMs(b.id), !reduceMotion)
          return (
            <View key={b.key} style={[place(b.id, b.scale, b.feet), { opacity: state === 'shown' ? 1 : 0 }]}>
              <PixelSprite id={b.id} scale={b.scale} loop={false} frame={reduceMotion ? SPRITES[b.id].frames - 1 : undefined} />
            </View>
          )
        })}
        <View style={place(walk, scale, feet)}>
          <PixelSprite id={walk} scale={scale} />
        </View>
      </View>
      <View style={styles.buttons}>
        <Button size="sm" onPress={kill}>Kill</Button>
      </View>
      <Text variant="caption" color="muted">
        Kill again while it walks to drop it on the road. Slow shows each size step.
      </Text>
    </Surface>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[2],
    alignItems: 'center',
  },
  stage: {
    overflow: 'hidden',
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[2],
  },
})
