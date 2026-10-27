import React from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import type { RefObject } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { PosedMonster } from './PosedMonster'
import type { PosedMonsterHandle } from './PosedMonster'
import { PixelMonster } from './PixelMonster'
import type { MobSprites } from '../art'
import type { MonsterDef } from '../types/monsters'
import type { RoadWalker } from '../hooks/useMonsterRoad'
import type { StrikeFeel } from '../hooks/useStrikeFeel'
import { colors, gold } from '../theme'

/** The monster's art box as a share of the sprite circle (fits inside the circle) */
const ART_SCALE = 0.68
/** Knockback travel, as a share of the sprite size (away from the gate) */
const KNOCKBACK = 0.06

interface RoadMonsterProps {
  /** The sprite box in dp */
  size: number
  monster: MonsterDef
  /** Its pixel sprites; null draws the old circle and silhouette */
  mob: MobSprites | null
  /** Where it is on the road, its size and walk frame (hooks/useMonsterRoad) */
  walker: RoadWalker
  feel: StrikeFeel
  posedRef: RefObject<PosedMonsterHandle | null>
  resting: 'idle' | 'hurt'
  /** Kills so far: a new one resets the pose */
  spawnKey: number
  paused: boolean
  reduceMotion: boolean
}

/**
 * The monster the player strikes, at its place on the road, with the strike's flash, knockback and
 * shake (hooks/useStrikeFeel). Decorative: the battlefield labels the monster.
 */
export function RoadMonster({ size, monster, mob, walker, feel, posedRef, resting, spawnKey, paused, reduceMotion }: RoadMonsterProps) {
  const { spawn, shake, knock, tilt, breath, squash, flash } = feel
  const still = reduceMotion || mob !== null
  return (
    // Its place on the road is its own layer: the strike's native-driven knockback below would keep
    // the old place until it finished
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ translateY: walker.offsetY }] }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          mob ? styles.spritePixel : styles.sprite,
          {
            width: size,
            height: size,
            borderRadius: mob ? 0 : size / 2,
            // The old circle fades in from 0.3; a pixel monster walks down the road instead
            opacity: mob ? 1 : spawn.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
            transform: [
              { translateX: shake },
              { translateY: knock.interpolate({ inputRange: [0, 1], outputRange: [0, -size * KNOCKBACK] }) },
              { rotate: Animated.multiply(knock, tilt).interpolate({ inputRange: [-5, 5], outputRange: ['-5deg', '5deg'] }) },
              // Pixel monsters bob in their own walk; a fractional scale would blur their pixels
              { scale: still ? 1 : breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) },
              { translateY: still ? 0 : breath.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.01] }) },
              { scale: Animated.multiply(squash, spawn.interpolate({ inputRange: [0, 1], outputRange: [still ? 1 : 0.8, 1] })) },
            ],
          },
        ]}
      >
        {mob ? (
          <PixelMonster ref={posedRef} sprites={mob} scale={walker.scale} resting={resting} spawnKey={spawnKey}
            paused={paused} frame={walker.frame} />
        ) : (
          <>
            <LinearGradient colors={[colors.bg.surface2, colors.bg.surface1]} style={styles.inner}>
              <PosedMonster ref={posedRef} monster={monster} size={Math.round(size * ART_SCALE)} color={gold[400]} resting={resting} spawnKey={spawnKey} />
            </LinearGradient>
            <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash }]} />
          </>
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  sprite: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: gold[500],
    shadowColor: gold[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  spritePixel: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
})
