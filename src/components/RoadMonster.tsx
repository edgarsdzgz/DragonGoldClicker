import React from 'react'
import { View, StyleSheet, Animated, PixelRatio } from 'react-native'
import type { RefObject } from 'react'
import { PixelMonster } from './PixelMonster'
import { PixelSprite } from './PixelSprite'
import type { PixelMonsterHandle } from './PixelMonster'
import { SHADOW_OPACITY, spriteBox } from '../art'
import type { MobSprites } from '../art'
import type { RoadWalker } from '../hooks/useMonsterRoad'
import type { StrikeFeel } from '../hooks/useStrikeFeel'

/** Knockback travel, as a share of the sprite size (away from the gate) */
const KNOCKBACK = 0.06

interface RoadMonsterProps {
  /** The sprite box in dp */
  size: number
  sprites: MobSprites
  /** Where it is on the road, its size and walk frame (hooks/useMonsterRoad) */
  walker: RoadWalker
  feel: StrikeFeel
  monsterRef: RefObject<PixelMonsterHandle | null>
  /** Walking (idle), or wounded at a third of its HP or less */
  resting: 'idle' | 'hurt'
  /** Kills so far: a new one resets the pose */
  spawnKey: number
  paused: boolean
}

/**
 * The monster the player strikes, at its place on the road, with the strike's knockback and shake
 * (hooks/useStrikeFeel). A flier hangs above its shadow, which stays on the road through the
 * knockback. Decorative: the battlefield labels the monster.
 */
export function RoadMonster({ size, sprites, walker, feel, monsterRef, resting, spawnKey, paused }: RoadMonsterProps) {
  const { shake, knock, tilt, squash } = feel
  const shadow = sprites.shadow ? spriteBox(sprites.shadow, walker.scale, PixelRatio.get()) : null
  return (
    // Its place on the road is its own layer: the strike's native-driven knockback below would keep
    // the old place until it finished
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ translateY: walker.offsetY }] }]}>
      {sprites.shadow && shadow && (
        <View style={[styles.shadow, { left: PixelRatio.roundToNearestPixel((size - shadow.width) / 2), opacity: SHADOW_OPACITY }]}>
          <PixelSprite id={sprites.shadow} scale={walker.scale} />
        </View>
      )}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.monster,
          {
            width: size,
            height: size,
            paddingBottom: walker.lift,
            // No breathing and no fractional scale but the press squash: its pixels stay sharp
            transform: [
              { translateX: shake },
              { translateY: knock.interpolate({ inputRange: [0, 1], outputRange: [0, -size * KNOCKBACK] }) },
              { rotate: Animated.multiply(knock, tilt).interpolate({ inputRange: [-5, 5], outputRange: ['-5deg', '5deg'] }) },
              { scale: squash },
            ],
          },
        ]}
      >
        <PixelMonster ref={monsterRef} sprites={sprites} scale={walker.scale} resting={resting} spawnKey={spawnKey}
          paused={paused} frame={walker.frame} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  monster: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  shadow: {
    position: 'absolute',
    bottom: 0,
  },
})
