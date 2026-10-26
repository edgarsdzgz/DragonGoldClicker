import React from 'react'
import { View, StyleSheet } from 'react-native'
import { MonsterIcon } from '../../components/MonsterIcon'
import type { MonsterDef } from '../../types/monsters'
import { QUEUE_H } from '../../types/warfrontLayout'
import { colors, spacing } from '../../theme'

/** Icon box for a queued monster (glyph-only monsters draw at about 18dp inside it) */
const QUEUE_ICON = 25

/** The next monsters as dim silhouettes (the caller passes at most four). Decorative only. */
export function MonsterQueue({ monsters }: { monsters: MonsterDef[] }) {
  return (
    <View
      style={styles.row}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {monsters.map((m, i) => (
        <MonsterIcon key={i} monster={m} size={QUEUE_ICON} color={colors.text.muted} style={{ opacity: 0.35 - i * 0.05 }} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    height: QUEUE_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
})
