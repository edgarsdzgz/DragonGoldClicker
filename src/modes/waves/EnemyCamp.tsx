import React from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { Text } from '../../components/Text'
import { MonsterIcon } from '../../components/MonsterIcon'
import { useCoachTarget } from '../../hooks/useCoachTarget'
import type { CampView } from './waveStrike'
import type { CampLayout } from '../../types/warfrontLayout'
import { BEGIN_BUTTON_H } from '../../types/warfrontLayout'
import { colors, spacing, radius, gold, dark } from '../../theme'

interface EnemyCampProps {
  view: CampView
  layout: CampLayout
  onBegin: () => void
  /** The opening: only the button, nothing else */
  minimal?: boolean
  /** Opt the Begin wave button into the guided tutorial under this target id */
  coachId?: string
}

/**
 * The battlefield between waves: the next wave waiting as dim silhouettes, a preview, and a
 * large Begin wave button. The button is the only tappable thing here.
 */
export function EnemyCamp({ view, layout, onBegin, minimal = false, coachId }: EnemyCampProps) {
  const coach = useCoachTarget(coachId)
  return (
    <View style={styles.root}>
      {!minimal && layout.showSilhouettes && (
        <View
          style={styles.row}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          {Array.from({ length: view.count }, (_, i) => (
            <MonsterIcon key={i} monster={view.monster} size={layout.silhouette} color={colors.text.muted} style={{ opacity: 0.35 }} />
          ))}
        </View>
      )}
      {!minimal && (
        <>
          <Text variant="caption" center style={styles.horde}>The horde waits beyond the walls.</Text>
          <Text variant="label" center style={styles.preview}>{view.previewText}</Text>
          <Text variant="caption" center style={styles.bonus}>{view.bonusText}</Text>
        </>
      )}
      <View ref={coach.ref} onLayout={coach.onLayout} collapsable={false}>
        <Pressable
          onPress={onBegin}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={view.buttonLabel}
        >
          <Text variant="button" style={styles.buttonText}>{`Begin Wave ${view.waveNumber}`}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },
  horde: {
    color: colors.text.muted,
  },
  preview: {
    color: gold[300],
  },
  bonus: {
    color: colors.text.secondary,
  },
  button: {
    minHeight: BEGIN_BUTTON_H,
    minWidth: 200,
    paddingHorizontal: spacing[6],
    borderRadius: radius.lg,
    backgroundColor: gold[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: gold[600],
  },
  buttonText: {
    color: dark[900],
    fontWeight: '700',
  },
})
