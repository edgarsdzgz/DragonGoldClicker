import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import { View, StyleSheet, Pressable, Animated, GestureResponderEvent, LayoutChangeEvent, PixelRatio } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { useAppActive } from '../hooks/useAppActive'
import { Text } from './Text'
import { EnemyHp } from './EnemyHp'
import { clawLook } from '../types/claws'
import { RoadMonster } from './RoadMonster'
import type { PixelMonsterHandle } from './PixelMonster'
import { PixelBurst } from './PixelBurst'
import type { PixelBurstHandle } from './PixelBurst'
import { FallenBody } from './FallenBody'
import { mobFitPx, mobScale, mobSprites, mobTier, slashSprite } from '../art'
import { FloatingNumbers } from './FloatingNumbers'
import type { FloatingNumbersHandle } from './FloatingNumbers'
import { useActionPress } from '../hooks/useActionPress'
import { useCoinFlight } from '../context/CoinFlightContext'
import { useCoachTarget } from '../hooks/useCoachTarget'
import { useReduceMotion } from '../hooks/useReduceMotion'
import { useMonsterRoad } from '../hooks/useMonsterRoad'
import { useStrikeFeel, useHoldPulse } from '../hooks/useStrikeFeel'
import { monsterLabel, currentMonster, restingPose } from '../types/monsters'
import { colors, spacing, gold } from '../theme'

interface BattlefieldProps {
  /** Monster sprite diameter in dp */
  monster: number
  monsterIndex: number
  monsterHp: number
  /** The horde's advance: the monster's full HP grows with it (0 shows the roster as written) */
  hordeKills?: number
  /** Kills so far: when it changes the next monster eases in */
  kills: number
  /** Damage per hit, shown as a floating number */
  damage: number
  /** The dragon's claws (layer 3): the slash turns gold, then ember, with them */
  clawLevel?: number
  /** Points per Warfront map pixel; monsters and strikes are drawn at MOB_SCALE times it (art/warfront.ts) */
  unit?: number
  /** Where the road leaves the camps, in this field's own space: the next monster walks down from there */
  roadTop?: number
  /**
   * Called for every hit: the first press, then once per HOLD_REPEAT_MS while held. May return
   * what the hit dealt (a double strike shows larger, in gold); otherwise `damage` is shown.
   */
  onStrike: () => StrikeShown | void
  /** Flavor line row, above the stack */
  header?: React.ReactNode
  /** Show the monster's name under it (hidden until the first kill) */
  showName?: boolean
  /** Opt into the guided tutorial under this target id */
  coachId?: string
}

/** What one hit dealt, for its floating number */
export interface StrikeShown {
  damage: number
  /** A double strike (Weak Points) */
  double?: boolean
}

export interface BattlefieldHandle {
  /** Float a gold bounty up from the monster */
  showBounty: (amount: string) => void
  /** The kill's punch: the field nudges and a coin flies to the renown figure (the body is the road's) */
  showKill: () => void
  /** A fighter's swing landed: a small number in the ally color and its small hit, no slash */
  showAllyHit: (amount: string) => void
}

/**
 * The tap target: the whole battlefield. Every press strikes the monster; holding repeats
 * (one strike every HOLD_REPEAT_MS, shared by every main button) with a steady pulse. Damage numbers rise from the monster.
 */
export const Battlefield = forwardRef<BattlefieldHandle, BattlefieldProps>(function Battlefield(
  { monster: size, monsterIndex, monsterHp, hordeKills = 0, kills, damage, clawLevel = 0, unit = 3, roadTop, onStrike, header, showName = true, coachId },
  ref,
) {
  const coach = useCoachTarget(coachId)
  const def = currentMonster({ monsterIndex, hordeKills })
  // Pixel art for this monster, marked as deep as the horde's Unmaking (every roster monster has it: art tests)
  const tier = mobTier(hordeKills)
  const mob = mobSprites(def.id, tier)
  const pixelScale = mobScale(unit, size, mob ? mobFitPx(mob) : 1, PixelRatio.get())
  const reduceMotion = useReduceMotion()
  const numbers = useRef<FloatingNumbersHandle>(null)
  const widthRef = useRef(300)
  const [fieldW, setFieldW] = React.useState(300)

  const coinFlight = useCoinFlight()
  const spriteRef = useRef<View>(null)
  const fx = useRef<PixelBurstHandle>(null)
  // Where the last press landed, in dp from the sprite's top-left (hold repeats reuse it)
  const tapPoint = useRef({ x: size / 2, y: size / 2 })
  // The sprite's offset inside the press area; both are measured in the press area's own space
  const spriteOffset = useRef({ x: 0, y: 0 })
  const [spriteY, setSpriteY] = React.useState(0)
  const focused = useIsFocused()
  const appActive = useAppActive()

  // The road: bodies where monsters fell, and the next one walking down from the camps (hooks/useMonsterRoad)
  const road = useMonsterRoad({
    kills, def, tier, mob, fullScale: pixelScale, unit, size,
    distance: roadTop === undefined ? 0 : Math.max(0, spriteY + size - roadTop),
    live: focused && appActive, reduceMotion,
  })
  // Strikes land on the monster where it is on the road, at its size of the moment
  const walker = useRef(road.walker)
  walker.current = road.walker
  const fellTop = road.fellTop

  // Pose: the hit frame for ~120ms on each strike, else idle (or hurt at 1/3 HP or less)
  const posed = useRef<PixelMonsterHandle>(null)
  const resting = restingPose(monsterHp, def.hp)
  const feel = useStrikeFeel(reduceMotion)
  const { hit, killNudge, pressIn, pressOut } = feel

  useImperativeHandle(ref, () => ({
    // The bounty rises from where the monster fell
    showBounty: (amount) =>
      numbers.current?.spawn({ x: size / 2, y: fellTop.current ?? size * 0.25, text: amount, color: gold[300], large: true }),
    showKill: () => {
      // Kill punch: ~80ms hit-stop, then a 2-3px nudge of the battlefield
      killNudge()
      spriteRef.current?.measureInWindow((x, y, w, h) => coinFlight.fly({ x: x + w / 2, y: y + h / 2 }))
    },
    showAllyHit: (amount) => {
      // Spread across the monster so several fighters read as several small hits
      const w = walker.current
      const top = w.walking ? w.feet - w.lift - w.height : 0
      const tall = w.walking ? w.height : size
      const x = size / 2 + (Math.random() - 0.5) * (w.walking ? w.width : size) * 0.5
      numbers.current?.spawn({ x, y: top + tall * 0.45, text: amount, color: colors.warfront.ally })
      fx.current?.play('fx_ally-hit_anim', x, top + tall * 0.6, 0, w.walking ? w.scale : undefined)
    },
  }), [size, killNudge, coinFlight, fellTop])

  // Every hit: the hit frame, the knockback, and the damage floating up from the monster
  const strike = useCallback(() => {
    const shown = onStrike()
    posed.current?.hit()
    // At its place the strike lands where the finger did; on the road, on the monster at its size
    const w = walker.current
    const point = w.walking ? { x: size / 2, y: w.feet - w.lift - w.height / 2 } : tapPoint.current
    const numberY = w.walking ? w.feet - w.lift - w.height : size * 0.3
    const at = w.walking ? w.scale : undefined
    if (shown?.double) {
      numbers.current?.spawn({ x: point.x, y: numberY, text: `-${shown.damage}!`, color: gold[300], large: true })
    } else {
      numbers.current?.spawn({ x: point.x, y: numberY, text: `-${shown?.damage ?? damage}`, color: colors.text.primary })
    }
    fx.current?.play(slashSprite(clawLook(clawLevel).tier), point.x, point.y, 0, at)
    if (shown?.double) fx.current?.play('fx_crit_anim', point.x, point.y, 0, at)
    else if (!reduceMotion) fx.current?.play('fx_spark_anim', point.x, point.y, 0, at)
    hit()
  }, [onStrike, damage, size, clawLevel, hit, reduceMotion])
  // The same press as every main button: tap, hold (repeats at the shared speed), screen reader,
  // and a stop when the screen or the app is left (hooks/useActionPress)
  const press = useActionPress(strike, { repeatOnHold: true })
  const { holding } = press
  const holdPulse = useHoldPulse(holding, reduceMotion)

  const handlePressIn = (e: GestureResponderEvent) => {
    // locationX/Y are relative to the press area (its children ignore touches), as is the sprite offset
    const { locationX, locationY } = e.nativeEvent
    const clamp = (v: number) => Math.max(size * 0.1, Math.min(size * 0.9, v))
    tapPoint.current = {
      x: clamp(locationX - spriteOffset.current.x),
      y: clamp(locationY - spriteOffset.current.y),
    }
    pressIn()
    press.handlers.onPressIn()
  }
  const handlePressOut = () => {
    pressOut()
    press.handlers.onPressOut()
  }

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width
    setFieldW(e.nativeEvent.layout.width)
    coach.onLayout()
  }

  return (
    <Animated.View
      ref={coach.ref}
      onLayout={onLayout}
      collapsable={false}
      style={[styles.field, { transform: [{ translateY: feel.nudge.interpolate({ inputRange: [0, 1], outputRange: [0, 3] }) }] }]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPress={press.handlers.onPress}
        onPressOut={handlePressOut}
        style={styles.pressArea}
        accessibilityRole="button"
        accessibilityLabel={monsterLabel({ monsterIndex, monsterHp, hordeKills })}
        accessibilityHint="Double tap to strike the monster"
      >
        <View pointerEvents="none" style={styles.press}>
        {header}
        <View
          ref={spriteRef}
          collapsable={false}
          onLayout={(e) => {
            spriteOffset.current = { x: e.nativeEvent.layout.x, y: e.nativeEvent.layout.y }
            setSpriteY(e.nativeEvent.layout.y)
          }}
          style={{ width: size, height: size }}
        >
          {holding && !reduceMotion && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.holdRing,
                {
                  width: size + 24,
                  height: size + 24,
                  borderRadius: (size + 24) / 2,
                  opacity: holdPulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.6] }),
                  transform: [{ scale: holdPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
                },
              ]}
            />
          )}
          {/*
            Bodies and the walker are drawn by where their feet are, nearer the wall in front, by their order
            in one keyed list (a moved element keeps its state). The walker wins a tie.
          */}
          {[
            ...road.bodies.map((b) => ({ feet: b.feet, node: (
              <FallenBody key={b.key} death={b.death} scale={b.scale} x={size / 2} feet={b.feet} blink={b.blink}
                onGone={() => road.dropBody(b.key)} />
            ) })),
            ...(mob ? [{ feet: road.walker.feet + 0.5, node: (
              <RoadMonster key="walker" size={size} sprites={mob} walker={road.walker} feel={feel}
                monsterRef={posed} resting={resting} spawnKey={kills} paused={!focused || !appActive} />
            ) }] : []),
          ].sort((a, b) => a.feet - b.feet).map((d) => d.node)}
          <View pointerEvents="none" style={styles.effects}>
            <PixelBurst ref={fx} scale={pixelScale} max={4} />
            <FloatingNumbers ref={numbers} />
          </View>
        </View>
        {showName ? <Text variant="label" center style={styles.name}>{def.name}</Text> : <View style={styles.name} />}
        <EnemyHp hp={monsterHp} max={def.hp} width={Math.min(fieldW - spacing[6] * 2, 260)} />
        </View>
      </Pressable>
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  field: {
    flex: 1,
    alignSelf: 'stretch',
  },
  pressArea: {
    flex: 1,
  },
  press: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdRing: {
    position: 'absolute',
    left: -12,
    top: -12,
    borderWidth: 3,
    borderColor: gold[400],
  },
  // Strikes, embers and numbers, drawn last: over everything on the road
  effects: {
    ...StyleSheet.absoluteFillObject,
  },
  name: {
    color: gold[300],
    height: 20,
    marginTop: 2,
  },
})
