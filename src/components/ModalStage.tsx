import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { spacing } from '../theme'

/** Points between a card's bottom edge and the bottom of the screen (above the system bar) */
export const MODAL_BOTTOM_GAP = spacing[8]

/**
 * Where every pop-up card sits: on one baseline near the bottom of the screen, not centered. A card
 * grows upward with its text, so its buttons land in the same place on every card and every page
 * (owner, 2026-10-27: a Continue button that moves is bad UX). Also in easy reach of a thumb.
 */
export function ModalStage({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets()
  return (
    <View
      style={[styles.stage, { paddingTop: insets.top + spacing[6], paddingBottom: insets.bottom + MODAL_BOTTOM_GAP }]}
      pointerEvents="box-none"
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
})
