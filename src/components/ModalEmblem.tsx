import React from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import type { GameIconName, SpriteId } from '../art'
import { GameIcon } from './GameIcon'
import { ArtBanner } from './ArtBanner'
import { colors, spacing, radius } from '../theme'

interface ModalEmblemProps {
  /** The bar, the rings and the icon take this color */
  accent: string
  icon?: GameIconName
  /** Drawn in place of icon (the inspiration coin, for one) */
  iconElement?: React.ReactNode
  /** The rings' opacity: a looping Animated.Value makes them breathe, a number holds them still */
  pulse?: Animated.Value | number
  /** Entrance animation for the icon circle (opacity, scale) */
  iconStyle?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>
  /** The event's picture, drawn in the icon's place (no larger than the emblem's own space) */
  picture?: SpriteId
}

/** The emblem's height: a picture is never taller, so a card's size barely changes with one */
export const EMBLEM_H = 100

/**
 * The top of a modal card: a flat accent bar, then the icon in a ringed circle, or the event's
 * picture. The same emblem ConfirmModal and ReportModal draw, shared so every card announces itself
 * the same way: flat colors, no gradients.
 */
export function ModalEmblem({ accent, icon, iconElement, pulse = 1, iconStyle, picture }: ModalEmblemProps) {
  if (picture) {
    return (
      <>
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
        <Animated.View style={[styles.pictureContainer, iconStyle]}>
          <ArtBanner id={picture} maxHeight={EMBLEM_H} />
        </Animated.View>
      </>
    )
  }
  return (
    <>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.iconContainer}>
        <Animated.View style={[styles.ringOuter, { opacity: pulse, backgroundColor: accent + '14' }]} />
        <Animated.View style={[styles.ringInner, { opacity: pulse, backgroundColor: accent + '2E' }]} />
        <Animated.View style={[styles.iconCircle, { borderColor: accent + '80', shadowColor: accent }, iconStyle]}>
          {iconElement ?? (icon && <GameIcon name={icon} size={26} color={accent} />)}
        </Animated.View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  accentBar: {
    height: 3,
    width: '100%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[6],
    height: EMBLEM_H,
  },
  pictureContainer: {
    marginTop: spacing[5],
    paddingHorizontal: spacing[4],
  },
  ringOuter: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  ringInner: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.bg.surface1,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
})
